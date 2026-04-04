/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MessageSquare, X, Send, Hash, ChevronDown, Users, Smile,
  Volume2, VolumeX, Circle, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  onSnapshot, collection, query, orderBy, addDoc, doc, deleteDoc,
  where, limit, serverTimestamp, Timestamp, updateDoc, getDoc, setDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { cn } from '../lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRank?: string;
  senderInitials: string;
  channel: string;
  timestamp: any;
  type?: 'message' | 'system';
}

interface TeamChatProps {
  userRole: 'admin' | 'recruiter' | 'pending' | null;
  isCommander: boolean;
  userPlatoons: string[];
  profileData: {
    rank: string;
    firstName: string;
    lastName: string;
    [key: string]: any;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ALL_CHANNELS = ['general', 'HQ', 'C1', 'C2', 'C3', 'C4'];
const CHANNEL_COLORS: Record<string, string> = {
  general: '#FFD530',
  HQ: '#00f2ff',
  C1: '#39ff14',
  C2: '#a855f7',
  C3: '#ff0055',
  C4: '#ff8c00',
};

const MESSAGE_COLORS = [
  '#00f2ff', '#39ff14', '#a855f7', '#ff0055', '#ff8c00',
  '#FFD530', '#ec4899', '#3b82f6', '#14b8a6', '#f97316',
];

function getAvatarColor(senderId: string): string {
  let hash = 0;
  for (let i = 0; i < senderId.length; i++) {
    hash = senderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return MESSAGE_COLORS[Math.abs(hash) % MESSAGE_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function formatTime(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function formatFullTime(timestamp: any): string {
  if (!timestamp) return '';
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function TeamChat({ userRole, isCommander, userPlatoons, profileData }: TeamChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, number>>({});
  const [showChannelList, setShowChannelList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // ── Channels visible to this user ──
  const visibleChannels = useMemo(() => {
    if (isCommander) return ALL_CHANNELS;
    if (userRole === 'admin') return ['general', ...userPlatoons];
    return ['general', ...userPlatoons.filter(p => ALL_CHANNELS.includes(p))];
  }, [isCommander, userRole, userPlatoons]);

  // ── Load last-read timestamps from localStorage ──
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const stored = localStorage.getItem(`gl_chat_read_${uid}`);
      if (stored) setLastReadTimestamps(JSON.parse(stored));
    } catch {}
  }, []);

  // ── Save last-read when switching channels or closing ──
  const markChannelRead = useCallback((channel: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const now = Date.now();
    setLastReadTimestamps(prev => {
      const updated = { ...prev, [channel]: now };
      try { localStorage.setItem(`gl_chat_read_${uid}`, JSON.stringify(updated)); } catch {}
      return updated;
    });
    setUnreadCounts(prev => ({ ...prev, [channel]: 0 }));
  }, []);

  // ── Listen for messages in current channel ──
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chat_messages'),
      where('channel', '==', activeChannel),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRank: data.senderRank || '',
          senderInitials: data.senderInitials || getInitials(data.senderName || '??'),
          channel: data.channel,
          timestamp: data.timestamp,
          type: data.type || 'message',
        };
      });
      setMessages(msgs);

      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    // Mark this channel as read when opening
    if (isOpen) markChannelRead(activeChannel);

    return () => unsub();
  }, [activeChannel, isOpen, markChannelRead]);

  // ── Listen for unread counts across all channels ──
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubs = visibleChannels.map(channel => {
      const q = query(
        collection(db, 'chat_messages'),
        where('channel', '==', channel),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const lastRead = lastReadTimestamps[channel] || 0;
        const uid = auth.currentUser?.uid;
        let unread = 0;

        snapshot.docs.forEach(d => {
          const data = d.data();
          if (data.senderId === uid) return;
          const msgTime = data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().getTime()
            : new Date(data.timestamp || 0).getTime();
          if (msgTime > lastRead) unread++;
        });

        // Don't count unreads for the currently open & visible channel
        if (isOpen && channel === activeChannel) unread = 0;

        setUnreadCounts(prev => ({ ...prev, [channel]: unread }));
      });
    });

    return () => unsubs.forEach(u => u());
  }, [visibleChannels, lastReadTimestamps, isOpen, activeChannel]);

  // ── Total unread badge ──
  const totalUnread = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);
  }, [unreadCounts]);

  // ── Send message ──
  const handleSend = async () => {
    if (!inputText.trim() || !auth.currentUser || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const senderName = `${profileData.rank} ${profileData.lastName}`.trim() || auth.currentUser.displayName || 'Recruiter';

      await addDoc(collection(db, 'chat_messages'), {
        text,
        senderId: auth.currentUser.uid,
        senderName,
        senderRank: profileData.rank || '',
        senderInitials: getInitials(senderName),
        channel: activeChannel,
        timestamp: serverTimestamp(),
        type: 'message',
      });

      markChannelRead(activeChannel);
    } catch (err) {
      console.error('Chat send error:', err);
      setInputText(text); // restore on failure
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // ── Delete message (commander/admin only) ──
  const handleDelete = async (msgId: string) => {
    if (!isCommander && userRole !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'chat_messages', msgId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // ── Key handler ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Group messages by sender (consecutive) ──
  const groupedMessages = useMemo(() => {
    const groups: { senderId: string; senderName: string; senderRank?: string; senderInitials: string; messages: ChatMessage[] }[] = [];

    messages.forEach((msg, i) => {
      const prev = messages[i - 1];
      const sameSender = prev && prev.senderId === msg.senderId;
      // Group if same sender and within 5 minutes
      const closeInTime = prev?.timestamp && msg.timestamp &&
        Math.abs(
          ((msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : new Date(msg.timestamp)).getTime()) -
          ((prev.timestamp instanceof Timestamp ? prev.timestamp.toDate() : new Date(prev.timestamp)).getTime())
        ) < 300000;

      if (sameSender && closeInTime) {
        groups[groups.length - 1].messages.push(msg);
      } else {
        groups.push({
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderRank: msg.senderRank,
          senderInitials: msg.senderInitials,
          messages: [msg],
        });
      }
    });

    return groups;
  }, [messages]);

  // ── Toggle open/close ──
  const toggleChat = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      markChannelRead(activeChannel);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const switchChannel = (channel: string) => {
    setActiveChannel(channel);
    setShowChannelList(false);
    markChannelRead(channel);
  };

  return (
    <>
      {/* ── Toggle Button ── */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed z-[60] p-3.5 rounded-full shadow-lg transition-all",
          isOpen
            ? "bottom-20 right-4 md:bottom-6 md:right-[360px] bg-zinc-800 text-zinc-400 hover:text-white"
            : "bottom-20 right-4 md:bottom-6 md:right-6 bg-neon-cyan text-army-black hover:shadow-[0_0_20px_rgba(0,242,255,0.4)]"
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        {/* Unread Badge */}
        {!isOpen && totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white"
          >
            {totalUnread > 9 ? '9+' : totalUnread}
          </motion.span>
        )}
      </motion.button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[350px] z-[55] flex flex-col bg-zinc-950 border-l border-zinc-800/80"
          >
            {/* ── Header ── */}
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  <h3 className="text-sm font-black tracking-widest">
                    <span className="text-neon-cyan">Team</span> Comms
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors sm:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Channel Tabs ── */}
              <div className="flex gap-1 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {visibleChannels.map(channel => {
                  const color = CHANNEL_COLORS[channel] || '#ffffff';
                  const unread = unreadCounts[channel] || 0;
                  const isActive = activeChannel === channel;

                  return (
                    <button
                      key={channel}
                      onClick={() => switchChannel(channel)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0",
                        isActive
                          ? "text-army-black"
                          : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                      )}
                      style={isActive ? { backgroundColor: color, color: '#0a0e13' } : undefined}
                    >
                      <Hash className="w-3 h-3" />
                      {channel}
                      {unread > 0 && !isActive && (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                          style={{ backgroundColor: CHANNEL_COLORS[channel] || '#ff0055' }}
                        >
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Messages Body ── */}
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scroll-smooth"
              style={{
                background: 'linear-gradient(180deg, rgba(10,14,19,0.95) 0%, rgba(3,0,0,0.98) 100%)',
              }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No messages yet</p>
                  <p className="text-[9px] text-zinc-600 mt-1 normal-case" style={{ textTransform: 'none' }}>
                    Be the first to post in #{activeChannel}
                  </p>
                </div>
              )}

              {groupedMessages.map((group, gi) => {
                const isMe = group.senderId === auth.currentUser?.uid;
                const avatarColor = getAvatarColor(group.senderId);

                return (
                  <div key={gi} className={cn("flex gap-2.5", isMe && "flex-row-reverse")}>
                    {/* Avatar */}
                    {!isMe && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5"
                        style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
                      >
                        {group.senderInitials}
                      </div>
                    )}

                    <div className={cn("flex flex-col max-w-[75%]", isMe && "items-end")}>
                      {/* Sender name + time */}
                      <div className={cn("flex items-center gap-2 mb-0.5", isMe && "flex-row-reverse")}>
                        <span
                          className="text-[9px] font-black tracking-wide"
                          style={{ color: isMe ? CHANNEL_COLORS[activeChannel] || COLORS_CYAN : avatarColor }}
                        >
                          {isMe ? 'You' : group.senderName}
                        </span>
                        <span className="text-[8px] text-zinc-600 font-mono">
                          {formatTime(group.messages[0].timestamp)}
                        </span>
                      </div>

                      {/* Message bubbles */}
                      {group.messages.map((msg, mi) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "group relative px-3 py-2 text-[11px] leading-relaxed mb-0.5",
                            isMe
                              ? "bg-neon-cyan/10 border border-neon-cyan/20 text-white rounded-l-lg rounded-br-lg"
                              : "bg-zinc-900/80 border border-zinc-800/50 text-zinc-200 rounded-r-lg rounded-bl-lg",
                            mi === 0 && isMe && "rounded-tr-lg",
                            mi === 0 && !isMe && "rounded-tl-lg"
                          )}
                          style={{ textTransform: 'none' }}
                          title={formatFullTime(msg.timestamp)}
                        >
                          {msg.text}

                          {/* Delete button for admin */}
                          {(isCommander || (userRole === 'admin') || isMe) && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/80 rounded-full items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Bar ── */}
            <div className="px-3 py-3 border-t border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${activeChannel}...`}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-sm px-3 py-2.5 text-xs text-white outline-none focus:border-neon-cyan/50 transition-colors placeholder:text-zinc-600"
                    style={{ textTransform: 'none' }}
                    maxLength={500}
                    disabled={isSending}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className={cn(
                    "p-2.5 rounded-sm transition-all",
                    inputText.trim()
                      ? "bg-neon-cyan text-army-black hover:shadow-[0_0_12px_rgba(0,242,255,0.3)] active:scale-95"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-zinc-700 mt-1.5 font-mono text-right">
                {inputText.length}/500 • #{activeChannel}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const COLORS_CYAN = '#00f2ff';
