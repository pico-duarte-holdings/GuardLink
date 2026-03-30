/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect } from 'react';
import {
  UserPlus, Shield, Loader2, CheckCircle, Clock, AlertTriangle,
  X, Send, Bell, Eye, Trash2, ChevronDown, ChevronUp, Lock,
  FileText, MessageSquare, Check, RefreshCw, Users, Download
} from 'lucide-react';
import {
  onSnapshot, collection, query, orderBy, doc, setDoc, deleteDoc,
  addDoc, getDoc, updateDoc, getDocs, serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { cn } from './lib/utils';
import { sendTransactionalEmail, emailTemplates } from './lib/brevo';
import { exportIntakePDF } from './lib/exportIntakePDF';

interface AuthorizedPlayer {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  recruiterId: string;
  status: string;
  grantedAt: string;
  completedSteps: string[];
  reminderSchedule: any;
}

interface PlayerIntake {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dob: string;
  email: string;
  phone: string;
  education: string;
  employmentStatus: string;
  interestedMOS1: string;
  interestedMOS2: string;
  interestedMOS3: string;
  submitted?: boolean;
  currentStep?: number;
  [key: string]: any;
}

interface PlayerDoc {
  type: string;
  label: string;
  fileName: string;
  status: string;
  uploadedAt: string;
}

interface PlayerProgress {
  currentStage: number;
  status: string;
}

interface PlayerMessage {
  id: string;
  recruiterName: string;
  text: string;
  timestamp: any;
  fromPlayer?: boolean;
}

interface PlayerAccessManagerProps {
  profileData: any;
}

const PROGRESS_STAGES = [
  'Portal Access Granted',
  'Intake Form Completed',
  'Documents Uploaded',
  'ASVAB Scheduled/Completed',
  'MEPS Scheduled/Completed',
  'Contract Signed',
  'Ship Date Set',
];

const DOC_TYPES = [
  'birth_certificate', 'social_security', 'drivers_license', 'diploma_transcripts', 'medical_records',
];

const DOC_LABELS: Record<string, string> = {
  birth_certificate: 'Birth Certificate',
  social_security: 'Social Security Card',
  drivers_license: "Driver's License / State ID",
  diploma_transcripts: 'Diploma / Transcripts',
  medical_records: 'Medical Records',
};

export const PlayerAccessManager: React.FC<PlayerAccessManagerProps> = ({ profileData }) => {
  const [players, setPlayers] = useState<AuthorizedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Grant access form
  const [grantEmail, setGrantEmail] = useState('');
  const [grantName, setGrantName] = useState('');
  const [isGranting, setIsGranting] = useState(false);

  // Expanded player detail
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [playerIntake, setPlayerIntake] = useState<Record<string, PlayerIntake>>({});
  const [playerDocs, setPlayerDocs] = useState<Record<string, PlayerDoc[]>>({});
  const [playerProgress, setPlayerProgress] = useState<Record<string, PlayerProgress>>({});
  const [playerMessages, setPlayerMessages] = useState<Record<string, PlayerMessage[]>>({});

  // Send message
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);

  // Create reminder
  const [reminderText, setReminderText] = useState('');
  const [reminderDueDate, setReminderDueDate] = useState('');
  const [creatingReminder, setCreatingReminder] = useState<string | null>(null);

  // Update doc status
  const [updatingDocStatus, setUpdatingDocStatus] = useState<string | null>(null);

  // Load authorized players
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'authorized_players'), orderBy('grantedAt', 'desc')),
      (snap) => {
        setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuthorizedPlayer)));
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return unsub;
  }, []);

  // Load player detail data when expanded
  useEffect(() => {
    if (!expandedPlayer) return;
    const pid = expandedPlayer;

    // Use player's Firebase UID for data paths (synced when player first logs in)
    const player = players.find(p => p.id === pid);
    const dataKey = player?.uid || pid;

    // Load intake
    const unsubIntake = onSnapshot(doc(db, 'player_intake', dataKey), (snap) => {
      if (snap.exists()) setPlayerIntake(prev => ({ ...prev, [pid]: snap.data() as PlayerIntake }));
    });

    // Load docs
    const unsubDocs = onSnapshot(collection(db, 'player_documents', dataKey, 'files'), (snap) => {
      setPlayerDocs(prev => ({ ...prev, [pid]: snap.docs.map(d => ({ ...d.data(), type: d.id } as PlayerDoc)) }));
    });

    // Load progress
    const unsubProgress = onSnapshot(doc(db, 'player_progress', dataKey), (snap) => {
      if (snap.exists()) setPlayerProgress(prev => ({ ...prev, [pid]: snap.data() as PlayerProgress }));
    });

    // Load messages
    const unsubMessages = onSnapshot(
      query(collection(db, 'player_messages', dataKey, 'messages'), orderBy('timestamp', 'desc')),
      (snap) => {
        setPlayerMessages(prev => ({ ...prev, [pid]: snap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerMessage)) }));
      }
    );

    return () => { unsubIntake(); unsubDocs(); unsubProgress(); unsubMessages(); };
  }, [expandedPlayer]);

  // Grant access
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim() || !auth.currentUser) return;
    setIsGranting(true);
    try {
      const docId = grantEmail.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
      await setDoc(doc(db, 'authorized_players', docId), {
        email: grantEmail.toLowerCase().trim(),
        displayName: grantName.trim() || grantEmail.split('@')[0],
        recruiterId: auth.currentUser.uid,
        status: 'active',
        grantedAt: new Date().toISOString(),
        completedSteps: [],
        reminderSchedule: null,
      });

      // Send welcome email via Brevo
      const playerName = grantName.trim() || grantEmail.split('@')[0];
      const rName = `${profileData.rank || ''} ${profileData.lastName || ''}${profileData.firstName ? ', ' + profileData.firstName : ''}`.trim() || 'Your Recruiter';
      const rEmail = profileData.publicEmail || '';
      try {
        await sendTransactionalEmail({
          to: [{ email: grantEmail.toLowerCase().trim(), name: playerName }],
          subject: 'Welcome to Your GuardLink Player Portal',
          htmlContent: emailTemplates.playerWelcome(playerName, rName),
          senderName: rName,
          senderEmail: 'support@guardlink.site',
          replyTo: rEmail || undefined,
        });
      } catch (emailErr) {
        // Don't fail the grant if email fails – log silently
        console.warn('Welcome email failed:', emailErr);
      }

      setGrantEmail('');
      setGrantName('');
    } catch (err: any) {
      alert('Error granting access: ' + err.message);
    }
    setIsGranting(false);
  };

  // Revoke access
  const handleRevokeAccess = async (playerId: string) => {
    if (!window.confirm('Revoke this player\'s portal access?')) return;
    try {
      await deleteDoc(doc(db, 'authorized_players', playerId));
    } catch (err) {
      console.error('Revoke error:', err);
    }
  };

  // Resolve the Firebase UID for a player (for data subcollection paths)
  const getPlayerDataKey = (playerId: string): string => {
    const p = players.find(pl => pl.id === playerId);
    return p?.uid || playerId;
  };

  // Send message to player
  const handleSendMessage = async (playerUid: string) => {
    if (!messageText.trim()) return;
    const dataKey = getPlayerDataKey(playerUid);
    setSendingMessage(playerUid);
    try {
      const rName = `${profileData.rank} ${profileData.lastName}`.trim() || 'Recruiter';
      await addDoc(collection(db, 'player_messages', dataKey, 'messages'), {
        recruiterName: rName,
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        fromPlayer: false,
      });
      setMessageText('');
    } catch (err) {
      console.error('Send error:', err);
    }
    setSendingMessage(null);
  };

  // Create reminder
  const handleCreateReminder = async (playerUid: string) => {
    if (!reminderText.trim()) return;
    const dataKey = getPlayerDataKey(playerUid);
    setCreatingReminder(playerUid);
    try {
      await addDoc(collection(db, 'player_reminders', dataKey, 'items'), {
        text: reminderText.trim(),
        dueDate: reminderDueDate || '',
        completed: false,
        createdAt: new Date().toISOString(),
      });
      setReminderText('');
      setReminderDueDate('');
    } catch (err) {
      console.error('Reminder error:', err);
    }
    setCreatingReminder(null);
  };

  // Update document status
  const handleUpdateDocStatus = async (playerUid: string, docType: string, newStatus: string) => {
    const dataKey = getPlayerDataKey(playerUid);
    setUpdatingDocStatus(docType);
    try {
      await updateDoc(doc(db, 'player_documents', dataKey, 'files', docType), { status: newStatus });
    } catch (err) {
      console.error('Doc status update error:', err);
    }
    setUpdatingDocStatus(null);
  };

  // Update player progress stage
  const handleUpdateStage = async (playerUid: string, newStage: number) => {
    const dataKey = getPlayerDataKey(playerUid);
    try {
      await setDoc(doc(db, 'player_progress', dataKey), {
        currentStage: newStage,
        status: newStage >= PROGRESS_STAGES.length - 1 ? 'COMPLETE' : 'ONBOARDING_ACTIVE',
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Progress update error:', err);
    }
  };

  const getIntakeProgress = (pid: string): number => {
    const intake = playerIntake[pid];
    if (!intake) return 0;
    if (intake.submitted) return 100;
    return Math.round(((intake.currentStep || 1) / 6) * 100);
  };

  const getDocsCount = (pid: string): number => {
    return playerDocs[pid]?.length || 0;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'text-army-gold border-army-gold/30 bg-army-gold/10';
      case 'REJECTED': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'PENDING_REVIEW': return 'text-white border-zinc-500/30 bg-zinc-800';
      default: return 'text-zinc-400 border-zinc-600 bg-zinc-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">// PLAYER_ACCESS //</p>
        <h2 className="text-xl font-black text-army-gold uppercase tracking-tight">Player Access Management</h2>
      </div>

      {/* Grant Access Form */}
      <div className="hud-border bg-army-black/50 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-army-gold" />
          <h3 className="text-sm font-black uppercase text-army-gold tracking-widest">Grant Player Access</h3>
        </div>
        <form onSubmit={handleGrantAccess} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Player Email</label>
            <input type="email" required value={grantEmail} onChange={e => setGrantEmail(e.target.value)}
              placeholder="player@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-army-gold text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Display Name (optional)</label>
            <input type="text" value={grantName} onChange={e => setGrantName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-army-gold text-sm" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isGranting}
              className="px-6 py-3 bg-army-gold text-black font-black uppercase text-[10px] hover:bg-army-gold/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
              {isGranting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
              Grant Access
            </button>
          </div>
        </form>
      </div>

      {/* Player Overview Table */}
      <div className="hud-border bg-army-black/50">
        <div className="p-4 border-b border-army-gold/10 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4 text-army-gold" />
            Authorized Players ({players.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-army-gold mx-auto" /></div>
        ) : players.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No players authorized yet. Use the form above to grant portal access.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {players.map(player => {
              const isExpanded = expandedPlayer === player.id;
              const intake = playerIntake[player.id];
              const docs = playerDocs[player.id] || [];
              const progress = playerProgress[player.id];
              const msgs = playerMessages[player.id] || [];
              const intakePct = getIntakeProgress(player.id);
              const docCount = getDocsCount(player.id);

              return (
                <div key={player.id}>
                  {/* Row */}
                  <div
                    onClick={() => setExpandedPlayer(isExpanded ? null : player.id)}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer flex-wrap"
                  >
                    <div className="w-8 h-8 bg-army-gold/10 border border-army-gold/30 rounded-full flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-army-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white uppercase truncate">{player.displayName}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{player.email}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[9px] text-zinc-500 font-black uppercase">Intake</p>
                        <p className="text-xs font-bold text-army-gold">{intakePct}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-zinc-500 font-black uppercase">Docs</p>
                        <p className="text-xs font-bold text-white">{docCount}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-zinc-500 font-black uppercase">Stage</p>
                        <p className="text-xs font-bold text-neon-cyan">{progress?.currentStage !== undefined ? PROGRESS_STAGES[progress.currentStage]?.split('/')[0] : 'N/A'}</p>
                      </div>
                    </div>
                    <span className={cn("text-[9px] font-mono font-black tracking-wider px-2 py-1 border shrink-0",
                      player.status === 'active' ? "text-army-gold border-army-gold/30 bg-army-gold/10" : "text-zinc-400 border-zinc-600 bg-zinc-800"
                    )}>{(player.status || 'ACTIVE').toUpperCase()}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-4 pb-6 bg-zinc-900/30 border-t border-zinc-800">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {/* Intake Summary */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
                          <h4 className="text-[10px] font-black uppercase text-army-gold mb-3 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Intake Form
                          </h4>
                          {intake ? (
                            <div className="space-y-2 text-[10px]">
                              {[
                                ['Name', [intake.lastName, intake.firstName, intake.middleName, intake.suffix].filter(Boolean).join(', ')],
                                ['DOB', intake.dob],
                                ['Email', intake.email],
                                ['Phone', intake.phone],
                                ['Education', intake.education],
                                ['Employment', intake.employmentStatus],
                                ['MOS #1', intake.interestedMOS1],
                                ['MOS #2', intake.interestedMOS2],
                                ['MOS #3', intake.interestedMOS3],
                              ].map(([k, v]) => v && (
                                <div key={k as string} className="flex justify-between">
                                  <span className="text-zinc-500 uppercase font-black">{k}</span>
                                  <span className="text-white text-right max-w-[60%] truncate">{v}</span>
                                </div>
                              ))}
                              <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                                <span className={cn("text-[9px] font-mono font-black px-2 py-0.5 border",
                                  intake.submitted ? "text-army-gold border-army-gold/30 bg-army-gold/10" : "text-white border-zinc-600 bg-zinc-800"
                                )}>{intake.submitted ? 'SUBMITTED' : `STEP ${intake.currentStep || 1}/6`}</span>
                                {intake.submitted && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); exportIntakePDF(intake, `${intake.lastName || ''}, ${intake.firstName || ''}`); }}
                                    className="flex items-center gap-1 px-2 py-1 bg-army-gold/10 border border-army-gold/30 text-army-gold text-[9px] font-black uppercase hover:bg-army-gold/20"
                                  >
                                    <Download className="w-3 h-3" /> EXPORT PDF
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-zinc-500 text-xs">No intake data yet.</p>
                          )}
                        </div>

                        {/* Documents */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
                          <h4 className="text-[10px] font-black uppercase text-army-gold mb-3 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Documents ({docCount}/5)
                          </h4>
                          <div className="space-y-2">
                            {DOC_TYPES.map(dt => {
                              const uploaded = docs.find(d => d.type === dt);
                              return (
                                <div key={dt} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {uploaded ? (
                                      uploaded.status === 'VERIFIED' ? <CheckCircle className="w-3.5 h-3.5 text-army-gold shrink-0" /> :
                                      uploaded.status === 'REJECTED' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" /> :
                                      <Clock className="w-3.5 h-3.5 text-army-gold shrink-0" />
                                    ) : (
                                      <Lock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                    )}
                                    <span className={cn("text-[10px] truncate", uploaded ? "text-white" : "text-zinc-500")}>{DOC_LABELS[dt]}</span>
                                  </div>
                                  {uploaded && (
                                    <select
                                      value={uploaded.status}
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => handleUpdateDocStatus(player.id, dt, e.target.value)}
                                      className="bg-zinc-800 border border-zinc-700 text-[9px] font-black uppercase p-1 outline-none text-white shrink-0"
                                    >
                                      <option value="PENDING_REVIEW">PENDING</option>
                                      <option value="VERIFIED">VERIFIED</option>
                                      <option value="REJECTED">REJECTED</option>
                                    </select>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Progress Pipeline */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
                          <h4 className="text-[10px] font-black uppercase text-army-gold mb-3 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Progress Pipeline
                          </h4>
                          <div className="space-y-1.5">
                            {PROGRESS_STAGES.map((stage, i) => {
                              const currentStage = progress?.currentStage ?? 0;
                              const isComplete = i < currentStage;
                              const isCurrent = i === currentStage;
                              return (
                                <button
                                  key={i}
                                  onClick={(e) => { e.stopPropagation(); handleUpdateStage(player.id, i + 1); }}
                                  className={cn("w-full flex items-center gap-2 p-1.5 rounded text-left transition-all hover:bg-white/5",
                                    isCurrent && "bg-army-gold/10"
                                  )}
                                >
                                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border shrink-0 text-[8px]",
                                    isComplete ? "bg-army-gold/20 border-army-gold text-army-gold" :
                                    isCurrent ? "bg-army-gold/20 border-army-gold text-army-gold" :
                                    "bg-zinc-800 border-zinc-600 text-zinc-600"
                                  )}>
                                    {isComplete ? <Check className="w-2.5 h-2.5" /> : i + 1}
                                  </div>
                                  <span className={cn("text-[10px] font-black uppercase",
                                    isComplete ? "text-army-gold" : isCurrent ? "text-white" : "text-zinc-500"
                                  )}>{stage}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
                          <h4 className="text-[10px] font-black uppercase text-army-gold mb-3 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Messages
                          </h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 mb-3 pr-1">
                            {msgs.length === 0 ? (
                              <p className="text-zinc-500 text-xs">No messages yet.</p>
                            ) : msgs.slice(0, 10).map(msg => (
                              <div key={msg.id} className={cn("text-[10px] p-2 rounded border",
                                msg.fromPlayer ? "border-neon-cyan/20 bg-neon-cyan/5" : "border-zinc-700 bg-zinc-800"
                              )}>
                                <div className="flex justify-between mb-0.5">
                                  <span className="font-black text-white">{msg.fromPlayer ? 'Player' : msg.recruiterName}</span>
                                  <span className="text-zinc-500 font-mono text-[8px]">
                                    {msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleString() : ''}
                                  </span>
                                </div>
                                <p className="text-zinc-300">{msg.text}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input value={messageText} onChange={e => setMessageText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(player.id); } }}
                              placeholder="Send message..."
                              className="flex-1 bg-zinc-800 border border-zinc-700 p-2 text-xs text-white outline-none focus:border-army-gold" />
                            <button onClick={() => handleSendMessage(player.id)}
                              disabled={sendingMessage === player.id || !messageText.trim()}
                              className="px-3 py-2 bg-army-gold text-black text-[10px] font-black uppercase disabled:opacity-40">
                              {sendingMessage === player.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Create Reminder + Actions row */}
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex gap-2">
                          <input value={reminderText} onChange={e => setReminderText(e.target.value)}
                            placeholder="Create reminder (e.g., Upload birth certificate)"
                            className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none focus:border-army-gold" />
                          <input type="date" value={reminderDueDate} onChange={e => setReminderDueDate(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 p-2 text-xs text-white outline-none w-36" />
                          <button onClick={() => handleCreateReminder(player.id)}
                            disabled={creatingReminder === player.id || !reminderText.trim()}
                            className="px-3 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-black uppercase disabled:opacity-40 flex items-center gap-1">
                            {creatingReminder === player.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                            Remind
                          </button>
                        </div>
                        <button onClick={() => handleRevokeAccess(player.id)}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase hover:bg-red-500/20 flex items-center gap-1 shrink-0">
                          <Trash2 className="w-3 h-3" /> Revoke Access
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
