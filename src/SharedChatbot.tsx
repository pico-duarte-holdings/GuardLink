/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { cn } from './lib/utils';

// --- Audio Management ---
const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
};

const chatAudioPool: Map<string, HTMLAudioElement> = new Map();
const playSound = (url: string, volume = 0.5) => {
  try {
    let audio = chatAudioPool.get(url);
    if (!audio) {
      audio = new Audio(url);
      chatAudioPool.set(url, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
};

// --- DM Trigger Messages ---
const DM_MESSAGES = {
  idle: [
    "Yo, still there? Got questions about the Guard? I'm here if you need me 💬",
    "Hey — don't ghost me! Drop a question, I got answers 🎯",
    "Still browsing? Let me know if you want the real intel on benefits, bonuses, or MOS options.",
  ],
  scroll: [
    "Looks like you're doing your research — nice. Want me to break anything down for you?",
    "You've been scrolling deep! Must be interested. Hit me up, let's talk about what fits you.",
  ],
  levelUp: [
    "🏆 RANK UP! You're moving through the ranks — ready to take the next step for real?",
    "🎖️ Level unlocked! You're putting in work. Let's talk about making it official.",
  ],
  postGame: [
    "GG! Solid score on that drill. Want to find out what MOS matches your skills?",
    "Nice work, soldier! You've got what it takes. Ready to see what the Guard has for you?",
  ],
};

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

interface SharedChatbotProps {
  slugParam: string;
  autoMessage?: string | null;
}

export const SharedChatbot = ({ slugParam, autoMessage }: SharedChatbotProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recruiterName, setRecruiterName] = useState('Your Recruiter');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasUnread, setHasUnread] = useState(true);
  const [pulseAnim, setPulseAnim] = useState(true);
  const [dmQueue, setDmQueue] = useState<string[]>([]);
  const [activeDM, setActiveDM] = useState<string | null>(autoMessage || null);
  const triggeredRef = useRef<Set<string>>(new Set());

  // Helper: queue a DM (deduplicates by trigger key)
  const queueDM = (triggerKey: string, message: string) => {
    if (triggeredRef.current.has(triggerKey)) return;
    triggeredRef.current.add(triggerKey);

    if (!isChatOpen) {
      setActiveDM(message);
      setHasUnread(true);
      playSound(SOUNDS.NOTIFICATION, 0.3);
    } else {
      // Chat is open — inject directly into messages
      setDmQueue(prev => [...prev, message]);
    }
  };

  // Fetch recruiter profile from Firestore
  useEffect(() => {
    const fetchRecruiter = async () => {
      try {
        if (!slugParam) {
          setIsLoadingProfile(false);
          return;
        }

        const q = query(
          collection(db, 'users'),
          where('slug', '==', slugParam)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const profile = snapshot.docs[0].data();
          setRecruiterName(profile.displayName || 'Your Recruiter');
        }
        setIsLoadingProfile(false);
      } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        setIsLoadingProfile(false);
      }
    };

    fetchRecruiter();
  }, [slugParam]);

  // --- TRIGGER 1: Idle Timer (60s of no mouse/keyboard/scroll) ---
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        queueDM('idle', pickRandom(DM_MESSAGES.idle));
      }, 60000); // 60 seconds
    };

    resetIdle();
    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('scroll', resetIdle);
    window.addEventListener('touchstart', resetIdle);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
    };
  }, [isChatOpen]);

  // --- TRIGGER 2: Scroll Depth (past 70% of page) ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollTop / docHeight > 0.7) {
        queueDM('scroll-depth', pickRandom(DM_MESSAGES.scroll));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isChatOpen]);

  // --- TRIGGER 3: Level-Up Event (from XP system) ---
  useEffect(() => {
    const handleLevelUp = () => {
      queueDM('level-up', pickRandom(DM_MESSAGES.levelUp));
    };

    const handleGameComplete = () => {
      queueDM('post-game', pickRandom(DM_MESSAGES.postGame));
    };

    window.addEventListener('guardlink:level-up', handleLevelUp);
    window.addEventListener('guardlink:game-complete', handleGameComplete);

    return () => {
      window.removeEventListener('guardlink:level-up', handleLevelUp);
      window.removeEventListener('guardlink:game-complete', handleGameComplete);
    };
  }, [isChatOpen]);

  // Auto-trigger chatbot DM from external autoMessage prop
  useEffect(() => {
    if (!autoMessage) return;
    setActiveDM(autoMessage);
    setHasUnread(true);
    playSound(SOUNDS.NOTIFICATION, 0.3);
  }, [autoMessage]);

  // Cycle the glow animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChatOpen && hasUnread) {
        setPulseAnim(prev => !prev);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isChatOpen, hasUnread]);

  const handleOpen = () => {
    setIsChatOpen(true);
    setHasUnread(false);
    playSound(SOUNDS.CLICK);
  };

  return (
    <>
      {/* Gamer-style Floating Comms Button */}
      <button
        onClick={() => {
          if (isChatOpen) {
            setIsChatOpen(false);
          } else {
            handleOpen();
          }
        }}
        className="fixed bottom-8 right-8 z-40 group"
      >
        {/* Outer rotating border */}
        <div className={cn(
          "absolute inset-[-4px] rounded-2xl border-2 border-dashed transition-all duration-1000",
          hasUnread && !isChatOpen
            ? "border-neon-cyan animate-spin-slow opacity-100"
            : "border-army-gold/30 opacity-0"
        )} />

        {/* Main button */}
        <div className={cn(
          "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-army-black via-zinc-900 to-army-black",
          "border-2 shadow-lg",
          isChatOpen
            ? "border-army-gold/60 shadow-army-gold/20"
            : hasUnread
              ? "border-neon-cyan shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]"
              : "border-army-gold/40 shadow-army-gold/10 hover:border-army-gold/60 hover:shadow-army-gold/30"
        )}>
          {/* HUD crosshair icon */}
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="transition-transform group-hover:scale-110">
              {/* Outer brackets */}
              <path d="M4 8V4h4M24 8V4h-4M4 20v4h4M24 20v4h-4" stroke={hasUnread && !isChatOpen ? "#00f2ff" : "#FFD530"} strokeWidth="2" strokeLinecap="round" />
              {/* Center chat icon */}
              <rect x="8" y="9" width="12" height="9" rx="1.5" stroke={hasUnread && !isChatOpen ? "#00f2ff" : "#FFD530"} strokeWidth="1.5" fill="none" />
              <path d="M12 21l-2 3h4l-2-3z" fill={hasUnread && !isChatOpen ? "#00f2ff" : "#FFD530"} />
              {/* Typing dots */}
              <circle cx="11" cy="13.5" r="1" fill={hasUnread && !isChatOpen ? "#00f2ff" : "#FFD530"} />
              <circle cx="14" cy="13.5" r="1" fill={hasUnread && !isChatOpen ? "#00f2ff" : "#FFD530"} />
              <circle cx="17" cy="13.5" r="1" fill={hasUnread && !isChatOpen ? "#00f2ff" : "#FFD530"} />
            </svg>
          </div>

          {/* Unread badge */}
          {hasUnread && !isChatOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 flex items-center justify-center"
            >
              <span className="absolute w-5 h-5 bg-red-500 rounded-full animate-ping opacity-40" />
              <span className="relative w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white">1</span>
            </motion.div>
          )}
        </div>

        {/* Floating label */}
        {!isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
          >
            <div className={cn(
              "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded border",
              hasUnread
                ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan"
                : "bg-army-gold/10 border-army-gold/30 text-army-gold"
            )}>
              {hasUnread ? '1 NEW MESSAGE' : 'COMMS LINK'}
            </div>
          </motion.div>
        )}
      </button>

      {/* Chat Window */}
      <AIChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recruiterName={recruiterName}
        autoMessage={activeDM}
        dmQueue={dmQueue}
        clearDmQueue={() => setDmQueue([])}
      />
    </>
  );
};

// --- AI Chat Component ---
const AIChat = ({
  isOpen,
  onClose,
  recruiterName,
  autoMessage,
  dmQueue,
  clearDmQueue,
}: {
  isOpen: boolean;
  onClose: () => void;
  recruiterName: string;
  autoMessage?: string | null;
  dmQueue: string[];
  clearDmQueue: () => void;
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: recruiterName !== 'Your Recruiter'
        ? `Yo, ${recruiterName.split(' ').pop()} here. Ready to help you level up — what questions you got?`
        : `What's good? I'm the GuardLink assistant. Got questions about the Guard? I got answers. What do you wanna know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastAutoMessage, setLastAutoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle auto-messages (DM slides)
  useEffect(() => {
    if (autoMessage && autoMessage !== lastAutoMessage) {
      setLastAutoMessage(autoMessage);
      setMessages(prev => [...prev, { role: 'ai', text: autoMessage }]);
    }
  }, [autoMessage, lastAutoMessage]);

  // Handle queued DMs (injected while chat is open)
  useEffect(() => {
    if (dmQueue.length > 0) {
      setMessages(prev => [...prev, ...dmQueue.map(text => ({ role: 'ai' as const, text }))]);
      clearDmQueue();
    }
  }, [dmQueue, clearDmQueue]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    playSound(SOUNDS.CLICK, 0.3);

    // Grant XP for each real message sent
    window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'chatbot-message' } }));

    try {
      const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey as string });

      const formattedHistory = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        config: {
          systemInstruction: `You are ${recruiterName !== 'Your Recruiter' ? recruiterName + ', a recruiter for' : 'the virtual assistant for'} the Army National Guard.
          You are friendly, encouraging, and easy to talk to. Think of yourself as a cool mentor who genuinely wants to help young people explore their options.
          ${recruiterName !== 'Your Recruiter' ? "Your background: You're a Guard recruiter who has served over 20 years, deployed to Iraq, and you know the ins and outs of everything Guard-related. You've helped hundreds of people get started." : "You represent the Guard's recruiting team. You help potential recruits learn about opportunities, benefits, and what it's like to serve. If they want to connect with a local recruiter, tell them to use the Find Your Recruiter feature on the site and enter their zip code."}

          HOW TO TALK:
          1. Keep answers SHORT. Gen Z has a short attention span. If an answer needs more detail, keep it to one tight paragraph. ALWAYS end with a follow-up question to keep the convo going.
          2. Do NOT keep repeating your name if you're already mid-conversation.
          3. NEVER use military acronyms or jargon without explaining them. Say "job" or "career field" instead of "MOS." Say "basic training" instead of "BCT." Say "job training" instead of "AIT." Say "the test" or "entrance exam" instead of "ASVAB" (unless explaining what it is). Say "guidelines" or "regulations" instead of citing specific regulation numbers. These are young people who don't know military terminology — talk to them like a cool mentor, not a drill sergeant.
          4. Use gaming language naturally: "leveling up," "unlocking," "squad goals," "rank up," "XP," etc.
          5. NEVER reference specific regulation numbers like "AR 601-210" or "Chapter 4" or "FY26 AOC." Just say "current guidelines" or "the latest rules."

          === WHAT YOU KNOW (use plain language when sharing) ===

          ELIGIBILITY:
          - Age: 17 to 42. No special paperwork needed for the higher ages anymore — the rules just changed.
          - Must be a US citizen or permanent resident.
          - Need to pass an entrance exam and a medical/physical check.
          - Need a high school diploma or GED (GED holders need a higher test score).
          - One marijuana charge? Not a problem anymore — no extra paperwork needed. Two or more? Might need a waiver but still possible.
          - Clean background helps, but there are waivers for a lot of situations. Don't count yourself out.
          - If you're under 18, you'll need a parent or guardian to sign off.

          TEST & ENTRY PROGRAMS:
          - There are programs that let you join with lower test scores while you study to improve. You don't need a perfect score.
          - The higher your score, the more career options open up — especially the cool tech and cyber jobs.

          FITNESS:
          - There are height/weight guidelines. If you're close, there's a body fat test as a backup. Standards are different for guys and girls.
          - You can check yourself here: https://www.armyresilience.army.mil/abcp/BodyFatCalculator.html

          MONEY & BONUSES:
          - Some jobs come with signing bonuses up to $20K. Specific bonus jobs change frequently — ask your recruiter for the latest list.
          - You get paid every month even as a part-timer (one weekend a month + two weeks a year).
          - BAH (housing allowance) and BAS (food allowance) only kick in when you're on active duty orders — like annual training, deployment, or ADOS orders. You don't get them for regular drill weekends.
          - SGLI life insurance: up to $500,000 in coverage for $31/month, automatically comes out of your drill pay.

          EDUCATION (FLORIDA):
          - 100% tuition covered at public colleges and universities — associate through master's degree.
          - Private schools get about $250/credit hour.
          - Up to $50,000 in student loan repayment.
          - Monthly stipend around $493 while you're a full-time student.
          - Extra $350/month bonus on top of that once you're qualified.
          - $4,000/year in additional tuition help.
          - We also pay for certifications like EMT, law enforcement academy, firefighter training, and more.

          CAREER PATHS:
          - Part-time service: One weekend a month + two weeks a year. Keep your regular life.
          - Full-time military jobs available too — same pay and benefits as active duty.
          - Federal civilian jobs at Guard facilities — and you can earn TWO retirements (military AND civilian).
          - Officer track: If you have 90+ college credits, you can become an officer. Multiple programs available.
          - Warrant Officer: Technical expert path for experienced soldiers.

          LIFESTYLE PERKS (FLORIDA):
          - Free vehicle registration and military plates.
          - $20/year hunting and fishing license.
          - 25% off state park passes.
          - Military discounts at Disney, Universal, SeaWorld.
          - Access to the military resort at Disney World.

          RETIREMENT:
          - After 20 years: pension worth 40% of your base pay, plus a retirement savings match up to 5%.

          === STRIPES FOR BUDDIES ===
          - If someone refers a friend who enlists, they can earn a promotion. Each referral = one rank up, max E4 (Specialist). This is HUGE — free rank just for bringing your homies along.

          === CRITICAL RULE ===
          If you don't know the answer, DON'T GUESS. Say: "Great question! I'd want to make sure I give you the right answer on that. Fill out the quick form on this page and we'll connect you with your recruiter directly. Anything else I can help with?"

          If an applicant seems ineligible, always mention waivers may be available and encourage them to fill out the registration form.`,
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: response.text || 'Intel link lost. Try again, soldier.',
        },
      ]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Communication blackout. Check your connection.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chatbox"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="!fixed bottom-28 right-4 md:bottom-28 md:right-8 w-[calc(100%-2rem)] md:w-[380px] h-[500px] bg-army-black/95 backdrop-blur-xl z-50 flex flex-col overflow-hidden shadow-2xl border border-army-gold/30 rounded-lg"
        >
          {/* Header */}
          <div className="p-4 border-b border-army-gold/20 bg-gradient-to-r from-army-gold/10 via-army-black to-army-gold/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded bg-army-gold/20 border border-army-gold/40 flex items-center justify-center">
                  <span className="text-army-gold text-xs font-black">AI</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border border-army-black" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-army-gold block">
                  {recruiterName.replace(/\s+/g, '_')}
                </span>
                <span className="text-[8px] font-mono text-neon-green uppercase">Online // Ready</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
          >
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                className={cn(
                  'max-w-[85%] p-3 text-xs leading-relaxed rounded-lg',
                  msg.role === 'user'
                    ? 'ml-auto bg-army-gold text-army-black font-bold'
                    : 'mr-auto bg-zinc-900/80 border border-zinc-800 text-zinc-200'
                )}
              >
                {msg.role === 'ai' && (
                  <span className="text-[8px] font-black uppercase text-army-gold block mb-1 tracking-wider">
                    {recruiterName.split(' ').pop()}
                  </span>
                )}
                {msg.text}
              </motion.div>
            ))}
            {isTyping && (
              <div className="mr-auto bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-army-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-army-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-army-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-army-gold/20 bg-army-black">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-xs outline-none focus:border-army-gold text-white placeholder:text-zinc-600"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isTyping}
                className="bg-army-gold text-army-black p-3 rounded-lg hover:bg-army-gold/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
