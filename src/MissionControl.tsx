/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ChevronRight, User, Trophy, Award, Share2, Search, Phone, Mail, MessageSquare, MapPin, Calendar, GraduationCap, Briefcase } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PIPELINE_STAGES, getTierForLevel, getLevelDisplay } from './useXP';
import { cn } from './lib/utils';

interface Lead {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  pipelineStage?: number;
  totalXP?: number;
  slug?: string;
  referredBy?: string;
  referralCount?: number;
  [key: string]: any;
}

// --- Calculate level from totalXP (mirror of useXP logic) ---
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const tier = Math.ceil(level / 10);
  const tierMultiplier = Math.pow(1.8, tier - 1);
  const withinTier = ((level - 1) % 10) + 1;
  const base = 40 + withinTier * 10;
  return Math.round(base * tierMultiplier);
}

const XP_TABLE: number[] = [];
let cumXP = 0;
for (let i = 1; i <= 101; i++) {
  XP_TABLE[i] = cumXP;
  cumXP += xpForLevel(i);
}

function getLevelFromXP(totalXP: number): number {
  for (let i = 100; i >= 1; i--) {
    if (totalXP >= XP_TABLE[i]) return i;
  }
  return 1;
}

function getLevelProgress(totalXP: number) {
  const level = getLevelFromXP(totalXP);
  const currentLevelXP = XP_TABLE[level] || 0;
  const nextLevelXP = XP_TABLE[level + 1] || XP_TABLE[level] + 1;
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP || 1;
  const percent = Math.min((xpInLevel / xpNeeded) * 100, 100);
  return { level, xpInLevel, xpNeeded, percent };
}

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-');
}

interface MissionControlProps {
  leads: Lead[];
  recruiterUid?: string;
  userRole?: 'admin' | 'recruiter' | 'pending' | null;
}

export const MissionControl = ({ leads, recruiterUid, userRole }: MissionControlProps) => {
  const [search, setSearch] = useState('');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [bonusXPAmount, setBonusXPAmount] = useState<Record<string, number>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  // --- Zip Code Management ---
  const [assignedZips, setAssignedZips] = useState<string[]>([]);
  const [newZip, setNewZip] = useState('');
  const [showZipManager, setShowZipManager] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  // Load assigned zip codes on mount
  React.useEffect(() => {
    if (!recruiterUid) return;
    const loadZips = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', recruiterUid));
        if (userDoc.exists()) {
          setAssignedZips(userDoc.data().assignedZipCodes || []);
        }
      } catch (err) {
        console.error('Error loading zip codes:', err);
      }
    };
    loadZips();
  }, [recruiterUid]);

  const addZipCode = async () => {
    const zip = newZip.trim();
    if (!zip || zip.length !== 5 || !recruiterUid) return;
    if (assignedZips.includes(zip)) { setNewZip(''); return; }

    setZipLoading(true);
    const updated = [...assignedZips, zip].sort();
    try {
      await updateDoc(doc(db, 'users', recruiterUid), { assignedZipCodes: updated });
      setAssignedZips(updated);
      setNewZip('');
    } catch (err) {
      console.error('Error adding zip code:', err);
    }
    setZipLoading(false);
  };

  const removeZipCode = async (zip: string) => {
    if (!recruiterUid) return;
    setZipLoading(true);
    const updated = assignedZips.filter(z => z !== zip);
    try {
      await updateDoc(doc(db, 'users', recruiterUid), { assignedZipCodes: updated });
      setAssignedZips(updated);
    } catch (err) {
      console.error('Error removing zip code:', err);
    }
    setZipLoading(false);
  };

  // Filter leads that have a pipeline stage or any progression
  const filteredLeads = leads.filter(l => {
    const matchesSearch = !search ||
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // Sort by pipeline stage (highest first), then by XP
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const stageA = a.pipelineStage || 0;
    const stageB = b.pipelineStage || 0;
    if (stageB !== stageA) return stageB - stageA;
    return (b.totalXP || 0) - (a.totalXP || 0);
  });

  // Advance lead to next pipeline stage
  const advanceStage = async (lead: Lead) => {
    if (!lead.id) return;
    setUpdating(lead.id);

    const currentStage = lead.pipelineStage || 0;
    const nextStage = currentStage + 1;

    if (nextStage > PIPELINE_STAGES.length) {
      setUpdating(null);
      return;
    }

    const stageInfo = PIPELINE_STAGES[nextStage - 1];
    const currentXP = lead.totalXP || 0;
    const newXP = currentXP + stageInfo.xp;

    const update: any = {
      pipelineStage: nextStage,
      totalXP: newXP,
    };

    // Auto-generate slug at stage 2+ if not already set
    if (nextStage >= 2 && !lead.slug) {
      const slug = generateSlug(lead.firstName, lead.lastName);
      // TODO: Check for slug uniqueness in production
      update.slug = slug;
    }

    // At stage 7 (enlisted), upgrade role
    if (nextStage === 7) {
      update.role = 'enlistee';
    }

    try {
      await updateDoc(doc(db, 'leads', lead.id), update);
    } catch (err) {
      console.error('Error advancing stage:', err);
    }

    setUpdating(null);
  };

  // Grant bonus XP
  const grantBonusXP = async (lead: Lead) => {
    if (!lead.id) return;
    const bonus = bonusXPAmount[lead.id] || 0;
    if (bonus <= 0) return;

    setUpdating(lead.id);
    const newXP = (lead.totalXP || 0) + bonus;

    try {
      await updateDoc(doc(db, 'leads', lead.id), { totalXP: newXP });
      setBonusXPAmount(prev => ({ ...prev, [lead.id as string]: 0 }));
    } catch (err) {
      console.error('Error granting XP:', err);
    }
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider text-army-gold">Mission Control</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Pipeline Progression & XP Management</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-white outline-none focus:border-army-gold w-64"
          />
        </div>
      </div>

      {/* Zip Code Manager */}
      {recruiterUid && (
        <div className="border border-zinc-800 rounded overflow-hidden">
          <button
            onClick={() => setShowZipManager(!showZipManager)}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-army-gold" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Assigned Zip Codes</span>
              <span className="text-[9px] px-2 py-0.5 bg-army-gold/10 text-army-gold border border-army-gold/20 rounded font-black">
                {assignedZips.length}
              </span>
            </div>
            <ChevronRight className={cn("w-4 h-4 text-zinc-600 transition-transform", showZipManager && "rotate-90")} />
          </button>
          <AnimatePresence>
            {showZipManager && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-zinc-800/50 space-y-3">
                  {userRole === 'admin' ? (
                    <>
                      <p className="text-[9px] text-zinc-500 font-mono uppercase">
                        Add the zip codes assigned to this recruiting area. Leads searching by zip will be matched accordingly.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          placeholder="ZIP CODE"
                          value={newZip}
                          onChange={e => setNewZip(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={e => e.key === 'Enter' && addZipCode()}
                          className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs font-black uppercase outline-none focus:border-army-gold"
                        />
                        <button
                          onClick={addZipCode}
                          disabled={zipLoading || newZip.length !== 5}
                          className="px-4 py-2 bg-army-gold text-army-black text-xs font-black uppercase disabled:opacity-40"
                        >
                          + Add
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[9px] text-zinc-500 font-mono uppercase">
                      Your assigned zip codes are listed below. Contact your chain of command if you need changes to your assigned area.
                    </p>
                  )}
                  {assignedZips.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedZips.map(zip => (
                        <span key={zip} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 rounded">
                          {zip}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => removeZipCode(zip)}
                              className="text-zinc-500 hover:text-red-400 transition-colors font-black text-[10px]"
                              title="Remove zip"
                            >
                              ✕
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-600 italic">No zip codes assigned yet.{userRole === 'admin' ? ' Add recruiting area zip codes above.' : ' Contact your chain of command to get zip codes assigned.'}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: 'Total', count: leads.length, color: 'text-zinc-400' },
          { label: 'Contact', count: leads.filter(l => (l.pipelineStage || 0) >= 1).length, color: 'text-neon-cyan' },
          { label: 'Appt', count: leads.filter(l => (l.pipelineStage || 0) >= 3).length, color: 'text-purple-400' },
          { label: 'ASVAB', count: leads.filter(l => (l.pipelineStage || 0) >= 4).length, color: 'text-neon-green' },
          { label: 'Medical', count: leads.filter(l => (l.pipelineStage || 0) >= 5).length, color: 'text-blue-400' },
          { label: 'Enlisted', count: leads.filter(l => (l.pipelineStage || 0) >= 7).length, color: 'text-army-gold' },
          { label: 'Complete', count: leads.filter(l => (l.pipelineStage || 0) >= 10).length, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/50 border border-zinc-800/50 p-3 text-center">
            <div className={cn("text-xl font-black", s.color)}>{s.count}</div>
            <div className="text-[8px] font-mono uppercase text-zinc-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lead Cards */}
      <div className="space-y-2">
        {sortedLeads.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No leads found. Leads from the pipeline will appear here.
          </div>
        )}

        {sortedLeads.map(lead => {
          const totalXP = lead.totalXP || 0;
          const level = getLevelFromXP(totalXP);
          const tier = getTierForLevel(level);
          const rankDisplay = getLevelDisplay(level);
          const currentStage = lead.pipelineStage || 0;
          const nextStage = currentStage < PIPELINE_STAGES.length ? PIPELINE_STAGES[currentStage] : null;
          const isExpanded = expandedLead === lead.id;
          const isUpdating = updating === lead.id;

          return (
            <div key={lead.id} className={cn(
              "border rounded transition-all",
              currentStage >= 7 ? "border-army-gold/30 bg-army-gold/5" :
                currentStage >= 1 ? "border-zinc-700 bg-zinc-900/30" :
                  "border-zinc-800 bg-zinc-900/20"
            )}>
              {/* Lead Row */}
              <button
                onClick={() => setExpandedLead(isExpanded ? null : lead.id || null)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-all"
              >
                {/* Level Badge */}
                <div
                  className={cn("w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-black flex-shrink-0", tier.borderColor, tier.color)}
                  style={{ boxShadow: `0 0 8px ${tier.glowColor}` }}
                >
                  {level}
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm truncate">{lead.firstName} {lead.lastName}</span>
                    {lead.slug && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 rounded font-mono">
                        /{lead.slug}
                      </span>
                    )}
                    {(lead.referralCount || 0) > 0 && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded font-black">
                        {lead.referralCount} REF
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{lead.email}</div>
                </div>

                {/* Rank Display + XP Progress */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <div className={cn("text-[10px] font-black uppercase", tier.color)}>{rankDisplay}</div>
                    <div className="text-[9px] font-mono text-zinc-600">{totalXP.toLocaleString()} XP</div>
                  </div>
                  {(() => {
                    const prog = getLevelProgress(totalXP);
                    return (
                      <div className="w-20">
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${prog.percent}%`,
                              background: `linear-gradient(90deg, ${tier.glowColor}, ${tier.glowColor.replace('0.', '0.8')})`,
                            }}
                          />
                        </div>
                        <div className="text-[8px] font-mono text-zinc-600 text-center mt-0.5">
                          {prog.xpInLevel}/{prog.xpNeeded}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Pipeline Stage */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-black text-army-gold">
                    Stage {currentStage}/{PIPELINE_STAGES.length}
                  </div>
                  <div className="text-[9px] text-zinc-500">
                    {currentStage > 0 ? PIPELINE_STAGES[currentStage - 1].label : 'Not Started'}
                  </div>
                </div>

                <ChevronRight className={cn("w-4 h-4 text-zinc-600 transition-transform flex-shrink-0", isExpanded && "rotate-90")} />
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-zinc-800/50 pt-4">
                      {/* Pipeline Progress */}
                      <div>
                        <div className="text-[10px] font-black uppercase text-zinc-500 mb-3">Pipeline Progress</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                          {PIPELINE_STAGES.map(stage => {
                            const isComplete = currentStage >= stage.stage;
                            const isCurrent = currentStage === stage.stage - 1;
                            return (
                              <div
                                key={stage.stage}
                                className={cn(
                                  "p-2 rounded border text-[10px]",
                                  isComplete
                                    ? "border-neon-green/30 bg-neon-green/5 text-neon-green"
                                    : isCurrent
                                      ? "border-army-gold/30 bg-army-gold/5 text-army-gold"
                                      : "border-zinc-800 text-zinc-600"
                                )}
                              >
                                <div className="font-black">
                                  {isComplete ? '✓' : stage.stage}. {stage.label}
                                </div>
                                <div className="text-[8px] mt-0.5 opacity-60">+{stage.xp.toLocaleString()} XP</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Rank & XP Profile */}
                      <div>
                        <div className="text-[10px] font-black uppercase text-zinc-500 mb-3">Rank & XP Profile</div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4">
                          <div className="flex items-center gap-4 mb-3">
                            <div
                              className={cn("w-14 h-14 rounded-lg border-2 flex items-center justify-center text-lg font-black", tier.borderColor, tier.color)}
                              style={{ boxShadow: `0 0 12px ${tier.glowColor}` }}
                            >
                              {level}
                            </div>
                            <div className="flex-1">
                              <div className={cn("text-sm font-black uppercase", tier.color)}>{rankDisplay}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">
                                Tier {Math.ceil(level / 10)}: {tier.name} • {totalXP.toLocaleString()} Total XP
                              </div>
                            </div>
                          </div>
                          {/* XP to next level bar */}
                          {(() => {
                            const prog = getLevelProgress(totalXP);
                            return (
                              <div>
                                <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                                  <span>Level {prog.level} → {prog.level + 1}</span>
                                  <span>{prog.xpInLevel.toLocaleString()} / {prog.xpNeeded.toLocaleString()} XP ({Math.round(prog.percent)}%)</span>
                                </div>
                                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${prog.percent}%`,
                                      background: `linear-gradient(90deg, ${tier.glowColor}, ${tier.glowColor.replace('0.', '0.8')})`,
                                    }}
                                  />
                                </div>
                                <div className="text-[9px] text-zinc-600 mt-1">
                                  {(prog.xpNeeded - prog.xpInLevel).toLocaleString()} XP until next level
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Recruit Contact Info */}
                      <div>
                        <div className="text-[10px] font-black uppercase text-zinc-500 mb-3">Recruit Profile</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-xs">
                            <Phone className="w-3.5 h-3.5 text-army-gold flex-shrink-0" />
                            <span className="text-zinc-400">Phone:</span>
                            <a href={`tel:${lead.phone}`} className="text-neon-cyan font-bold hover:underline">{lead.phone || 'N/A'}</a>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="w-3.5 h-3.5 text-army-gold flex-shrink-0" />
                            <span className="text-zinc-400">Email:</span>
                            <a href={`mailto:${lead.email}`} className="text-neon-cyan font-bold hover:underline truncate">{lead.email || 'N/A'}</a>
                          </div>
                          {lead.age && (
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-army-gold flex-shrink-0" />
                              <span className="text-zinc-400">Age:</span>
                              <span className="text-zinc-300 font-bold">{lead.age}</span>
                            </div>
                          )}
                          {lead.education && (
                            <div className="flex items-center gap-2 text-xs">
                              <GraduationCap className="w-3.5 h-3.5 text-army-gold flex-shrink-0" />
                              <span className="text-zinc-400">Education:</span>
                              <span className="text-zinc-300 font-bold">{lead.education}</span>
                            </div>
                          )}
                          {lead.interest && (
                            <div className="flex items-center gap-2 text-xs">
                              <Briefcase className="w-3.5 h-3.5 text-army-gold flex-shrink-0" />
                              <span className="text-zinc-400">Interest:</span>
                              <span className="text-zinc-300 font-bold">{lead.interest}</span>
                            </div>
                          )}
                          {lead.source && (
                            <div className="flex items-center gap-2 text-xs">
                              <Search className="w-3.5 h-3.5 text-army-gold flex-shrink-0" />
                              <span className="text-zinc-400">Source:</span>
                              <span className="text-zinc-300 font-bold">{lead.source}</span>
                            </div>
                          )}
                        </div>
                        {lead.notes && (
                          <div className="mt-3 p-3 bg-zinc-800/50 border border-zinc-700/30 rounded text-xs text-zinc-400">
                            <span className="text-zinc-500 font-black uppercase text-[9px]">Notes: </span>{lead.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 items-end">
                        {/* Advance Stage Button */}
                        {nextStage && (
                          <button
                            onClick={() => advanceStage(lead)}
                            disabled={isUpdating}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 font-black uppercase text-xs tracking-wider transition-all",
                              "bg-army-gold text-army-black hover:scale-105 active:scale-95 disabled:opacity-50"
                            )}
                          >
                            {isUpdating ? 'Updating...' : (
                              <>
                                <Award className="w-4 h-4" />
                                Advance to Stage {currentStage + 1}: {nextStage.label}
                                <span className="text-[9px] ml-1">(+{nextStage.xp.toLocaleString()} XP)</span>
                              </>
                            )}
                          </button>
                        )}

                        {currentStage >= PIPELINE_STAGES.length && (
                          <div className="px-4 py-2 bg-neon-green/10 border border-neon-green/30 text-neon-green font-black uppercase text-xs">
                            Pipeline Complete
                          </div>
                        )}

                        {/* Bonus XP */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            placeholder="Bonus XP"
                            value={bonusXPAmount[lead.id || ''] || ''}
                            onChange={e => setBonusXPAmount(prev => ({ ...prev, [lead.id as string]: parseInt(e.target.value) || 0 }))}
                            className="w-24 bg-zinc-900 border border-zinc-700 px-2 py-2 text-xs text-white outline-none focus:border-neon-cyan"
                          />
                          <button
                            onClick={() => grantBonusXP(lead)}
                            disabled={isUpdating || !(bonusXPAmount[lead.id || ''] > 0)}
                            className="flex items-center gap-1 px-3 py-2 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-black uppercase disabled:opacity-30 hover:bg-neon-cyan/20 transition-all"
                          >
                            <Zap className="w-3 h-3" /> Grant XP
                          </button>
                        </div>
                      </div>

                      {/* Slug & Referral Info */}
                      {lead.slug && (
                        <div className="flex items-center gap-4 text-[10px]">
                          <div className="flex items-center gap-1 text-zinc-400">
                            <Share2 className="w-3 h-3" />
                            Referral Link: <span className="text-neon-cyan font-mono">guardlink.site/?r={lead.slug}</span>
                          </div>
                          {lead.referredBy && (
                            <div className="text-zinc-500">
                              Referred by: <span className="text-army-gold">{lead.referredBy}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
