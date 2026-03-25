/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  MessageSquare, 
  ChevronDown, 
  Menu, 
  X, 
  Phone,
  ChevronRight,
  ArrowRight,
  Award,
  HeartPulse,
  GraduationCap,
  Briefcase,
  DollarSign,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { cn } from './lib/utils';
import { MOS_DATA, RANKS, Interaction } from './types';

// --- Audio Management ---
const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  HOVER: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  AMBIENT: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
};

const playSound = (url: string, volume = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {}); // Ignore errors if user hasn't interacted yet
};

// --- AI Chat Component ---
const AIChat = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "SFC Lantigua here. Mission status: Active. How can I help you level up your career today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    playSound(SOUNDS.CLICK, 0.3);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: `You are SFC Angel Lantigua, a recruiter for the Florida Army National Guard. 
          You are professional, encouraging, and highly knowledgeable about Army Regulations (AR) and Accession Options Criteria (AOC).
          
          MISSION PARAMETERS:
          1. ELIGIBILITY: Always reference AR 601-210 first for base rules, then the FY26 AOC for Guard-specific criteria.
          2. FLORIDA AGE WAIVERS: We accept age waivers up to age 42 currently, provided the applicant meets all other requirements.
          3. ASVAB PROGRAMS: 
             - 09M Program (ASDP): Applicants can enlist with an ASVAB score of 21+.
             - CAT4 Program: Applicants can enlist with an ASVAB score of 16+.
          4. WEIGHT & BODY FAT: 
             - Reference AR 40-501 for standard height/weight tables.
             - If an applicant is over the allowed weight, reference the AOC for the ARMS (Assessment of Recruit Motivation and Strength) and ARMS 2.0 programs which provide exceptions for body fat.
             - Provide the official calculator link: https://www.armyresilience.army.mil/abcp/BodyFatCalculator.html
             - Offer to help them check if they qualify if they provide their height, weight, and age.
          5. MOS/JOBS: Reference DA PAM 611-21 for specific job specs. You can provide details on major duties, required ASVAB line scores (e.g., GT, ST, EL, MM, CO), and physical demands (Heavy/Black, Significant/Gray, Moderate/Gold). For example:
             - 11B (Infantryman): Heavy physical demand, requires CO score of 77+.
             - 12B (Combat Engineer): Heavy physical demand, requires CO score of 82+.
             - 31B (Military Police): Significant physical demand, requires ST score of 91+.
             - 68W (Combat Medic): Significant physical demand, requires ST score of 101+.
          6. UPDATES: Be aware that the AOC is updated every October. SMOMs (Strength Maintenance Operational Messages) and PPOMs (Personnel Policy Operational Memoranda) can change regulations mid-year (like the Nov 2025 JROTC/Advanced Rank memo).
          7. STYLE: Speak to Gen Z in a clear, direct way using gaming metaphors (e.g., 'leveling up', 'squad goals', 'unlocking MOS tiers'). Keep responses concise and mission-focused.
          8. LOCATIONS: If asked about locations, mention FAU Boca Raton or Miami/Orlando/Tampa areas.
          
          If an applicant seems ineligible based on standard rules, always mention that waivers and exceptions (like the 09M, age waivers, or ARMS programs) may be available and encourage them to fill out the registration form to 'start the simulation' with a recruiter.`,
        },
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Intel link lost. Try again, soldier." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Communication blackout. Check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="fixed bottom-20 right-4 md:bottom-28 md:right-8 w-[calc(100%-2rem)] md:w-[350px] h-[500px] hud-border z-50 flex flex-col overflow-hidden shadow-2xl"
        >
          <div className="p-4 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-army-gold">Comms_Link // SFC_Lantigua</span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "max-w-[85%] p-3 text-xs font-bold uppercase tracking-tight",
                msg.role === 'user' 
                  ? "ml-auto bg-army-gold text-army-black skew-x-[-10deg]" 
                  : "mr-auto bg-zinc-900 border border-zinc-800 text-white skew-x-[10deg]"
              )}>
                <div className={cn(msg.role === 'user' ? "skew-x-[10deg]" : "skew-x-[-10deg]")}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto bg-zinc-900 border border-zinc-800 p-3 skew-x-[10deg]">
                <Loader2 className="w-4 h-4 animate-spin text-army-gold skew-x-[-10deg]" />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-army-gold/20 bg-army-black">
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Type_Message..."
                className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-xs font-mono outline-none focus:border-army-gold text-army-gold"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="bg-army-gold text-army-black p-3 hover:scale-105 transition-transform"
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

// --- Components ---

const Navbar = ({ onDashboardClick }: { onDashboardClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Join', href: '#how-to-join' },
    { name: 'Perks', href: '#benefits' },
    { name: 'Earnings', href: '#pay' },
    { name: 'Roles', href: '#jobs' },
    { name: 'Verification', href: '#eligibility' },
    { name: 'Simulation', href: '#asvab' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-army-black/95 backdrop-blur-md border-b border-army-gold/20 py-3" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="text-army-gold w-8 h-8 glow-text" />
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black tracking-tighter text-white leading-none">GUARD<span className="text-army-gold">LINK</span></span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-army-gold transition-all font-mono relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-army-gold transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
          
          <div className="h-8 w-px bg-zinc-800/50" />

          <div className="flex items-center gap-3">
            <button onClick={onDashboardClick} className="text-[9px] text-zinc-600 hover:text-army-gold transition-colors uppercase font-black font-mono mr-2">Admin_Login</button>
            <a 
              href="#subscribe" 
              className="relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-army-gold hover:border-army-gold/50 text-center min-w-[140px]"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              Subscribe
            </a>
            <a 
              href="#register" 
              className="relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-army-gold text-army-black shadow-[0_0_15px_rgba(255,213,48,0.2)] text-center min-w-[140px]"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              Join Squad
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white p-2 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6 text-army-gold" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 bg-army-black/98 backdrop-blur-2xl z-50 flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <Shield className="text-army-gold w-8 h-8" />
                <span className="text-2xl font-black tracking-tighter text-white">GUARD<span className="text-army-gold">LINK</span></span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full"><X className="w-6 h-6 text-army-gold" /></button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="text-3xl font-black uppercase tracking-tighter hover:text-army-gold transition-colors flex items-center justify-between group"
                >
                  {link.name}
                  <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                </motion.a>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <a 
                href="#subscribe" 
                onClick={() => setIsOpen(false)} 
                className="block w-full py-5 text-center font-black uppercase tracking-widest border border-zinc-800 bg-zinc-950 text-zinc-400"
                style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
              >
                Subscribe
              </a>
              <a 
                href="#register" 
                onClick={() => setIsOpen(false)} 
                className="block w-full py-5 text-center font-black uppercase tracking-widest bg-army-gold text-army-black"
                style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
              >
                Join Squad
              </a>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onDashboardClick();
                }}
                className="w-full text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest pt-4"
              >
                // Admin_Access_Portal //
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onTrack, recruiterName }: { onTrack: (el: string) => void, recruiterName: string | null }) => (
  <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
    <div className="scanline" />
    
    <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 py-1 px-3 rounded border border-army-gold/30 text-army-gold text-[10px] font-black uppercase tracking-[0.3em] mb-8 bg-army-gold/5 font-mono">
          <span className="w-2 h-2 bg-army-gold rounded-full animate-pulse" />
          {recruiterName ? `Connected_With // ${recruiterName}` : 'System_Online // Mission_Ready'}
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-9xl font-black mb-8 leading-none tracking-tighter uppercase italic">
          LEVEL UP <br />
          <span className="text-army-gold glow-text">YOUR LIFE</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-bold uppercase tracking-tight font-mono">
          &gt; Live here. Serve here. <br />
          &gt; Unlock 100% Tuition Assistance. <br />
          &gt; Deploy for your community.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a 
            href="#register" 
            onClick={() => onTrack('Hero: Mission Start')}
            className="btn-gaming text-xl px-12"
          >
            Mission Start
          </a>
          <a 
            href="tel:1234567890" 
            onClick={() => onTrack('Hero: Call HQ')}
            className="hud-border py-4 px-10 text-xl font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-army-gold/10 transition-colors"
          >
            <Phone className="w-6 h-6 text-army-gold" /> Call HQ
          </a>
        </div>
      </motion.div>
    </div>

    {/* HUD Elements */}
    <div className="absolute top-1/4 left-10 hidden xl:block opacity-30 font-mono text-[10px] text-army-gold space-y-2">
      <p>LAT: 26.3683° N</p>
      <p>LONG: 80.1289° W</p>
      <p>ALT: 13FT</p>
    </div>
    <div className="absolute bottom-1/4 right-10 hidden xl:block opacity-30 font-mono text-[10px] text-army-gold text-right space-y-2">
      <p>STATUS: RECRUITING</p>
      <p>SQUAD: FL_ARNG</p>
      <p>XP_BOOST: ACTIVE</p>
    </div>

    <motion.div 
      animate={{ y: [0, 10, 0] }} 
      transition={{ repeat: Infinity, duration: 2 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-army-gold/50"
    >
      <ChevronDown className="w-8 h-8" />
    </motion.div>
  </section>
);

const Benefits = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const benefits = [
    { icon: GraduationCap, title: "Full Scholarship", desc: "100% Tuition Assistance. Zero student debt." },
    { icon: HeartPulse, title: "Health Pack", desc: "TRICARE coverage for you and your family." },
    { icon: Award, title: "Rank Up", desc: "Guaranteed promotions and leadership training." },
    { icon: Briefcase, title: "Pro Loadout", desc: "Get certified in cyber, medical, or engineering." },
    { icon: DollarSign, title: "Loot Drop", desc: "Up to $20,000 sign-on bonus for select roles." },
    { icon: Users, title: "Squad Goals", desc: "Build a network that lasts a lifetime." },
  ];

  return (
    <section id="benefits" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-7xl font-black mb-4 uppercase italic tracking-tighter">THE <span className="text-army-gold">PERKS</span></h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">// UNLOCK YOUR POTENTIAL //</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {benefits.map((b, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02, rotate: 1 }}
              onHoverStart={() => {
                playSound(SOUNDS.HOVER, 0.1);
                onTrack(`Benefit View: ${b.title}`);
              }}
              className="hud-border p-8 group flex flex-col items-center text-center h-full cursor-pointer"
            >
              <div className="w-14 h-14 bg-army-gold/10 rounded-lg flex items-center justify-center mb-8 group-hover:bg-army-gold transition-colors glow-border">
                <b.icon className="text-army-gold group-hover:text-army-black w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight glow-text">{b.title}</h3>
              <p className="text-zinc-400 font-bold leading-relaxed mb-8">{b.desc}</p>
              <div className="mt-auto h-1 w-full bg-zinc-800 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-army-gold" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PayCalculator = () => {
  const [qualifiers, setQualifiers] = useState({
    educationLevel: 'none',
    collegeCredits: 0,
    jrotcYears: 0,
    srotcYears: 0,
    serviceTime: 0
  });

  // 2026 Estimated Pay Table (Base Pay Monthly)
  const getBasePay = (rank: string, years: number) => {
    const table: Record<string, number[]> = {
      'E1': [2170, 2170, 2170, 2170], // <2, 2, 3, 4+
      'E2': [2430, 2430, 2430, 2430],
      'E3': [2550, 2710, 2880, 2880],
      'E4': [2830, 2970, 3130, 3280],
      'E5': [3080, 3290, 3450, 3620],
      'E6': [3360, 3700, 3860, 4030],
    };
    
    const rankData = table[rank] || table['E1'];
    if (years < 2) return rankData[0];
    if (years < 3) return rankData[1];
    if (years < 4) return rankData[2];
    return rankData[3];
  };

  // Rank Determination Logic based on AR 601-210 ETP (Nov 2025)
  const determineRank = () => {
    // E-4: Bachelor's, Master's, or Doctorate
    if (['bachelors', 'masters', 'doctorate'].includes(qualifiers.educationLevel)) return 'E4';
    
    // E-3: Associate Degree or 60+ Credits
    if (qualifiers.educationLevel === 'associate' || qualifiers.collegeCredits >= 60) return 'E3';
    
    // E-2: 30-59 Credits or JROTC/ROTC
    if (qualifiers.collegeCredits >= 30 || qualifiers.jrotcYears >= 2 || qualifiers.srotcYears >= 1) return 'E2';
    
    // E-1: HS Diploma, GED, 1-29 Credits, or None
    return 'E1';
  };

  const currentRank = determineRank();
  const monthlyBase = getBasePay(currentRank, qualifiers.serviceTime);
  const drillPay = Math.round((monthlyBase / 30) * 4); // 4 drill periods (1 weekend)

  return (
    <section id="pay" className="py-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="hud-border p-10 border-army-gold/40">
          <h2 className="text-4xl font-black mb-12 text-center uppercase italic tracking-tighter">EARNINGS <span className="text-army-gold">ESTIMATOR</span></h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 text-center">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-army-gold font-mono tracking-widest">Education_Level</label>
              <select 
                value={qualifiers.educationLevel} 
                onChange={(e) => setQualifiers({...qualifiers, educationLevel: e.target.value})}
                className="w-full bg-army-black border-2 border-zinc-800 rounded-none p-4 text-white focus:border-army-gold outline-none font-black uppercase italic text-sm text-center"
              >
                <option value="none">No Credits / HS Student</option>
                <option value="hs">HS Diploma / GED (E-1)</option>
                <option value="associate">Associate Degree (E-3)</option>
                <option value="bachelors">Bachelor's Degree (E-4)</option>
                <option value="masters">Master's Degree (E-4)</option>
                <option value="doctorate">Doctorate Degree (E-4)</option>
              </select>
              
              <div className="space-y-2 mt-4">
                <label className="block text-[10px] font-black uppercase text-army-gold font-mono tracking-widest">College_Credits</label>
                <select 
                  value={qualifiers.collegeCredits} 
                  onChange={(e) => setQualifiers({...qualifiers, collegeCredits: Number(e.target.value)})}
                  className="w-full bg-army-black border-2 border-zinc-800 rounded-none p-4 text-white focus:border-army-gold outline-none font-black uppercase italic text-sm text-center"
                >
                  <option value={0}>0 Credits</option>
                  <option value={1}>1-29 Credits (E-1)</option>
                  <option value={30}>30-59 Credits (E-2)</option>
                  <option value={60}>60+ Credits (E-3)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-army-gold font-mono tracking-widest">Military_Training (JROTC/ROTC)</label>
              <select 
                value={qualifiers.jrotcYears >= 2 ? 'jrotc' : qualifiers.srotcYears >= 1 ? 'srotc' : 'none'} 
                onChange={(e) => {
                  const val = e.target.value;
                  setQualifiers({
                    ...qualifiers,
                    jrotcYears: val === 'jrotc' ? 2 : 0,
                    srotcYears: val === 'srotc' ? 1 : 0
                  });
                }}
                className="w-full bg-army-black border-2 border-zinc-800 rounded-none p-4 text-white focus:border-army-gold outline-none font-black uppercase italic text-sm text-center"
              >
                <option value="none">None</option>
                <option value="jrotc">2+ Years JROTC (E-2)</option>
                <option value="srotc">1+ Year SROTC (E-2)</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase text-army-gold font-mono tracking-widest">Service_Time (Yrs)</label>
              <input 
                type="number" 
                min={0}
                max={40}
                value={qualifiers.serviceTime} 
                onChange={(e) => setQualifiers({...qualifiers, serviceTime: Number(e.target.value)})}
                className="w-full bg-army-black border-2 border-zinc-800 rounded-none p-4 text-white focus:border-army-gold outline-none font-black text-center"
              />
            </div>
          </div>

          <div className="bg-army-gold/5 border border-army-gold/20 p-6 mb-8 text-center">
            <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 font-mono tracking-widest">Projected_Entry_Rank</p>
            <p className="text-4xl font-black text-army-gold italic tracking-tighter">{currentRank}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            <div className="bg-zinc-900/50 p-8 border-t-4 border-army-gold flex flex-col items-center">
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 font-mono tracking-widest">Weekend_Drill_Pay (2 Days)</p>
              <p className="text-5xl font-black text-army-gold glow-text">${drillPay}</p>
              <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase italic">Part-Time Service (1 Weekend/Mo)</p>
            </div>
            <div className="bg-zinc-900/50 p-8 border-t-4 border-white flex flex-col items-center">
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 font-mono tracking-widest">Boot_Camp / AIT Monthly_Pay</p>
              <p className="text-5xl font-black text-white">${monthlyBase}</p>
              <p className="text-[9px] text-zinc-600 mt-2 font-mono uppercase italic">Full-Time Pay During Training</p>
            </div>
          </div>
          <p className="mt-8 text-center text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
            // DATA_SOURCE: 2026_ESTIMATED_PAY_CHART // AR_601-210_ETP_NOV_2025 //
          </p>
        </div>
      </div>
    </section>
  );
};

const EligibilityChecker = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const questions = [
    { id: 'age', text: 'AGE: 17 - 35?' },
    { id: 'citizen', text: 'STATUS: US CITIZEN / RESIDENT?' },
    { id: 'edu', text: 'INTEL: HS DIPLOMA / GED?' },
    { id: 'legal', text: 'RECORD: CLEAN HISTORY?' },
  ];

  const isEligible = Object.keys(answers).length === questions.length && Object.values(answers).every(v => v === true);
  const hasAnsweredAll = Object.keys(answers).length === questions.length;

  return (
    <section id="eligibility" className="py-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="hud-border p-6 sm:p-10 border-army-gold/40">
          <h2 className="text-3xl sm:text-4xl font-black mb-12 text-center uppercase italic tracking-tighter">PLAYER <span className="text-army-gold">VERIFICATION</span></h2>
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-zinc-900/50 border border-zinc-800 gap-4">
                <span className="font-black uppercase tracking-tight text-base sm:text-lg italic">{q.text}</span>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      setAnswers({...answers, [q.id]: true});
                      playSound(SOUNDS.CLICK, 0.2);
                      onTrack(`Eligibility: ${q.id} - YES`);
                    }}
                    className={cn(
                      "flex-1 sm:w-16 py-3 font-black transition-all skew-x-[-12deg]", 
                      answers[q.id] === true ? "bg-army-gold text-army-black glow-border" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    YES
                  </button>
                  <button 
                    onClick={() => {
                      setAnswers({...answers, [q.id]: false});
                      playSound(SOUNDS.CLICK, 0.2);
                      onTrack(`Eligibility: ${q.id} - NO`);
                    }}
                    className={cn(
                      "flex-1 sm:w-16 py-3 font-black transition-all skew-x-[-12deg]", 
                      answers[q.id] === false ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    NO
                  </button>
                </div>
              </div>
            ))}
          </div>
          <AnimatePresence>
            {hasAnsweredAll && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-10"
              >
                {isEligible ? (
                  <div className="p-8 text-center font-black uppercase tracking-[0.2em] text-xl italic bg-army-gold text-army-black glow-border">
                    {">>"} MISSION_READY: PROCEED TO ENLIST {"<<"}
                    <div className="mt-4">
                      <a href="#register" className="text-xs underline decoration-2 underline-offset-4 hover:text-white transition-colors">Go to Registration</a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-zinc-900 border-2 border-army-gold/50 text-center">
                    <p className="font-black uppercase tracking-[0.1em] text-lg italic text-army-gold mb-4">
                      {">>"} WAIVERS_MAY_BE_AVAILABLE {"<<"}
                    </p>
                    <p className="text-zinc-400 text-sm font-bold uppercase mb-6">
                      Don't count yourself out. Many "No" answers have exceptions or official waivers. 
                      Contact a recruiter to verify your specific situation.
                    </p>
                    <a 
                      href="#register" 
                      onClick={() => playSound(SOUNDS.CLICK)}
                      className="inline-block btn-gaming px-8 py-3 text-sm"
                    >
                      Contact Recruiter Now
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const ASVABTeaser = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [categoryScores, setCategoryScores] = useState({ AR: 0, MK: 0, WK: 0, PC: 0 });

  const questions = [
    // --- Arithmetic Reasoning (AR) ---
    {
      q: "A convoy travels at 60 mph for 2.5 hours. How far does it travel?",
      options: ['120 miles', '150 miles', '180 miles', '200 miles'],
      correct: '150 miles',
      module: 'Arithmetic_Reasoning',
      cat: 'AR'
    },
    {
      q: "If a tactical vest costs $200 after a 20% discount, what was the original price?",
      options: ['$220', '$240', '$250', '$280'],
      correct: '$250',
      module: 'Arithmetic_Reasoning',
      cat: 'AR'
    },
    {
      q: "A recipe for MREs calls for 2 cups of water for 4 servings. How many cups for 10 servings?",
      options: ['4 cups', '5 cups', '6 cups', '8 cups'],
      correct: '5 cups',
      module: 'Arithmetic_Reasoning',
      cat: 'AR'
    },
    {
      q: "A recruit runs 3 miles in 24 minutes. What is their average pace per mile?",
      options: ['7 minutes', '8 minutes', '9 minutes', '10 minutes'],
      correct: '8 minutes',
      module: 'Arithmetic_Reasoning',
      cat: 'AR'
    },
    {
      q: "If 4 engineers can build a bridge in 6 days, how many days would it take 3 engineers?",
      options: ['7 days', '8 days', '9 days', '10 days'],
      correct: '8 days',
      module: 'Arithmetic_Reasoning',
      cat: 'AR'
    },
    // --- Mathematics Knowledge (MK) ---
    {
      q: "Solve for x: 3x + 5 = 20",
      options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
      correct: 'x = 5',
      module: 'Mathematics_Knowledge',
      cat: 'MK'
    },
    {
      q: "What is the square root of 144?",
      options: ['10', '12', '14', '16'],
      correct: '12',
      module: 'Mathematics_Knowledge',
      cat: 'MK'
    },
    {
      q: "If x = 3 and y = 4, what is x² + y²?",
      options: ['14', '21', '25', '49'],
      correct: '25',
      module: 'Mathematics_Knowledge',
      cat: 'MK'
    },
    {
      q: "Simplify: 2(3x - 4) + 5",
      options: ['6x - 3', '6x + 1', '5x - 3', '6x - 8'],
      correct: '6x - 3',
      module: 'Mathematics_Knowledge',
      cat: 'MK'
    },
    {
      q: "What is the area of a circle with radius 5?",
      options: ['10π', '15π', '20π', '25π'],
      correct: '25π',
      module: 'Mathematics_Knowledge',
      cat: 'MK'
    },
    // --- Word Knowledge (WK) ---
    {
      q: "\"Abundant\" most nearly means:",
      options: ['Scarce', 'Plentiful', 'Heavy', 'Light'],
      correct: 'Plentiful',
      module: 'Word_Knowledge',
      cat: 'WK'
    },
    {
      q: "\"Conceal\" most nearly means:",
      options: ['Reveal', 'Hide', 'Search', 'Find'],
      correct: 'Hide',
      module: 'Word_Knowledge',
      cat: 'WK'
    },
    {
      q: "\"Diligent\" most nearly means:",
      options: ['Lazy', 'Hardworking', 'Careless', 'Quick'],
      correct: 'Hardworking',
      module: 'Word_Knowledge',
      cat: 'WK'
    },
    {
      q: "\"Obsolete\" most nearly means:",
      options: ['Modern', 'Outdated', 'Useful', 'Broken'],
      correct: 'Outdated',
      module: 'Word_Knowledge',
      cat: 'WK'
    },
    {
      q: "\"Peculiar\" most nearly means:",
      options: ['Normal', 'Unusual', 'Strong', 'Weak'],
      correct: 'Unusual',
      module: 'Word_Knowledge',
      cat: 'WK'
    },
    // --- Paragraph Comprehension (PC) ---
    {
      q: "Read: \"The primary objective of camouflage is to blend in with the environment, confusing the enemy's observation.\" What is the main goal of camouflage?",
      options: ['To look intimidating', 'To confuse enemy observation', 'To stay warm', 'To signal allies'],
      correct: 'To confuse enemy observation',
      module: 'Paragraph_Comprehension',
      cat: 'PC'
    },
    {
      q: "Read: \"Maintenance checks must be performed weekly. Fluid levels are checked daily before operation.\" When are fluid levels checked?",
      options: ['Weekly', 'Monthly', 'Daily', 'Annually'],
      correct: 'Daily',
      module: 'Paragraph_Comprehension',
      cat: 'PC'
    },
    {
      q: "Read: \"Effective leaders prioritize the well-being of their squad above their own comfort.\" What does an effective leader prioritize?",
      options: ['Their own comfort', 'Mission speed', 'Squad well-being', 'Equipment maintenance'],
      correct: 'Squad well-being',
      module: 'Paragraph_Comprehension',
      cat: 'PC'
    },
    {
      q: "Read: \"Physical training (PT) is mandatory every morning at 0600, except on Sundays.\" When is PT NOT required?",
      options: ['0600', 'Mondays', 'Saturdays', 'Sundays'],
      correct: 'Sundays',
      module: 'Paragraph_Comprehension',
      cat: 'PC'
    },
    {
      q: "Read: \"A compass and a topographical map are essential for manual land navigation.\" What is required for land navigation?",
      options: ['GPS', 'Radio', 'Compass and map', 'Flashlight'],
      correct: 'Compass and map',
      module: 'Paragraph_Comprehension',
      cat: 'PC'
    }
  ];

  const handleAnswer = (opt: string) => {
    const currentQ = questions[currentQuestion];
    onTrack(`ASVAB Quiz: Q${currentQuestion + 1} - ${opt}`);
    
    if (opt === currentQ.correct) {
      setCategoryScores(prev => ({
        ...prev,
        [currentQ.cat]: prev[currentQ.cat as keyof typeof prev] + 1
      }));
      playSound(SOUNDS.SUCCESS, 0.2);
    } else {
      playSound(SOUNDS.CLICK, 0.2);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
      onTrack(`ASVAB Quiz: Completed`);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setShowResult(false);
    setCategoryScores({ AR: 0, MK: 0, WK: 0, PC: 0 });
    onTrack('ASVAB Quiz: Reset');
  };

  // AFQT Calculation Formula: The AFQT score is computed from the Verbal Expression (VE), 
  // Arithmetic Reasoning (AR), and Mathematics Knowledge (MK) subtests. 
  // VE = Word Knowledge (WK) + Paragraph Comprehension (PC). 
  // Raw AFQT = 2VE + AR + MK.
  const VE = categoryScores.WK + categoryScores.PC;
  const rawAFQT = (2 * VE) + categoryScores.AR + categoryScores.MK;
  // Max rawAFQT = (2 * 10) + 5 + 5 = 30
  // Convert raw 0-30 to percentile 0-99
  const afqtScore = rawAFQT > 0 ? Math.max(1, Math.min(99, Math.round((rawAFQT / 30) * 99))) : 0;

  const getRank = (score: number) => {
    if (score >= 93) return { name: 'CATEGORY I', color: 'text-purple-500', sub: 'ELITE_TIER (93-99)', msg: 'Outstanding. You qualify for all MOS options, including elite Cyber and Special Operations.' };
    if (score >= 65) return { name: 'CATEGORY II', color: 'text-blue-500', sub: 'ADVANCED_TIER (65-92)', msg: 'Excellent score. You have strong potential for intelligence, medical, and technical roles.' };
    if (score >= 50) return { name: 'CATEGORY IIIA', color: 'text-green-500', sub: 'STRONG_TIER (50-64)', msg: 'Solid performance. You qualify for a wide variety of combat and support roles.' };
    if (score >= 31) return { name: 'CATEGORY IIIB', color: 'text-army-gold', sub: 'QUALIFIED (31-49)', msg: 'You passed. You meet the standard enlistment criteria for many critical Army roles.' };
    if (score >= 16) return { name: 'CATEGORY IV', color: 'text-orange-500', sub: 'ETP_REQUIRED (16-30)', msg: 'Waiver territory. You may qualify under an Exception to Policy (ETP). Contact a recruiter.' };
    return { name: 'CATEGORY V', color: 'text-red-500', sub: 'DISQUALIFIED (0-15)', msg: 'Currently disqualified. Study up on Arithmetic, Math, and Reading Comprehension and try again.' };
  };

  const rank = getRank(afqtScore);

  return (
    <section id="asvab" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-7xl font-black mb-8 uppercase italic tracking-tighter">TACTICAL <span className="text-army-gold">SIMULATION</span></h2>
            <p className="text-zinc-400 text-xl mb-10 leading-relaxed font-bold uppercase tracking-tight mx-auto lg:mx-0 max-w-2xl">
              The ASVAB is your skill-tree assessment. High scores unlock elite MOS roles in Cyber, Intel, and Special Ops.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-xl mx-auto lg:mx-0">
              {['Arithmetic Reasoning', 'Math Knowledge', 'Word Knowledge', 'Paragraph Comp'].map(item => (
                <div key={item} className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800">
                  <CheckCircle2 className="text-army-gold w-6 h-6" />
                  <span className="font-black uppercase tracking-tight italic">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center lg:justify-start">
              <button 
                onClick={() => {
                  onTrack('ASVAB: Start Simulation');
                  document.getElementById('asvab-quiz')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-gaming text-xl px-12"
              >
                Start Simulation
              </button>
            </div>
          </div>
          <div className="relative" id="asvab-quiz">
            <div className="hud-border p-6 sm:p-10 border-army-gold/50 relative z-10 bg-zinc-950/50 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex flex-col items-center mb-10 text-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-army-gold rounded-full flex items-center justify-center animate-pulse">
                          <BookOpen className="text-army-black w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Module_{currentQuestion + 1} // {questions[currentQuestion].module}</h3>
                      </div>
                      <span className="text-army-gold font-mono text-xs font-black">{currentQuestion + 1}/{questions.length}</span>
                    </div>
                    <p className="text-2xl font-black mb-10 italic leading-tight uppercase tracking-tighter text-center">"{questions[currentQuestion].q}"</p>
                    <div className="grid grid-cols-1 gap-4">
                      {questions[currentQuestion].options.map(opt => (
                        <button 
                          key={opt} 
                          onClick={() => handleAnswer(opt)}
                          className="p-5 bg-army-black border-2 border-zinc-800 text-center hover:border-army-gold hover:bg-army-gold/5 transition-all font-black italic text-lg group relative"
                        >
                          {opt}
                          <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-army-gold absolute right-5 top-1/2 -translate-y-1/2" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 bg-army-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                      <Award className="text-army-black w-10 h-10" />
                    </div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2">SIMULATION <span className="text-army-gold">COMPLETE</span></h3>
                    
                    <div className="mb-8">
                      <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-2">// EST_AFQT_SCORE //</p>
                      <div className={cn("text-8xl font-black italic tracking-tighter glow-text mb-1", rank.color)}>
                        {afqtScore}
                      </div>
                      <p className={cn("font-black text-xl uppercase tracking-widest mt-2", rank.color)}>{rank.name}</p>
                      <p className="text-white font-black text-xs uppercase tracking-widest opacity-50 mt-1">{rank.sub}</p>
                    </div>
                    
                    <div className="p-6 bg-army-gold/10 border border-army-gold/30 mb-10">
                      <p className="text-white font-bold uppercase tracking-tight text-sm">
                        {rank.msg}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={resetQuiz}
                        className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-army-gold transition-all font-black uppercase italic text-sm tracking-widest"
                      >
                        Restart Sim
                      </button>
                      <a 
                        href="#register" 
                        className="btn-gaming px-8 py-4 text-sm"
                      >
                        Join the Squad
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Decorative HUD lines */}
            <div className="absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-army-gold opacity-50" />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-4 border-r-4 border-army-gold opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

const RegistrationForm = ({ interactions, recruiterId }: { interactions: Interaction[], recruiterId: string | null }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', age: '', education: '', interest: '', message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    playSound(SOUNDS.CLICK);
    
    try {
      const leadData = {
        ...formData,
        timestamp: new Date().toISOString(),
        status: 'New',
        source: 'Website', // Default source for web submissions
        mos: 'TBD', // Default MOS
        interactions: interactions,
        recruiterId: recruiterId || 'unassigned'
      };

      await addDoc(collection(db, 'leads'), leadData);
      
      setStatus('success');
      playSound(SOUNDS.SUCCESS);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', age: '', education: '', interest: '', message: '' });
    } catch (err) {
      console.error('Submission error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'leads');
      setStatus('error');
    }
  };

  return (
    <section id="register" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="hud-border p-6 md:p-12 border-army-gold/40">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-7xl font-black mb-4 uppercase italic tracking-tighter">JOIN THE <span className="text-army-gold">SQUAD</span></h2>
            <p className="text-zinc-500 font-mono text-xs md:text-sm uppercase tracking-widest">// DEPLOYMENT_READY? //</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">First_Name</label>
                <input 
                  required
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Last_Name</label>
                <input 
                  required
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Comm_Channel (Email)</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Direct_Line (Phone)</label>
                <input 
                  required
                  type="tel"
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Level (Age)</label>
                <input 
                  required
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Intel_Level</label>
                <select 
                  required
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic"
                  value={formData.education}
                  onChange={e => setFormData({...formData, education: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="HS Student">HS Student</option>
                  <option value="HS Graduate">HS Graduate</option>
                  <option value="College Student">College Student</option>
                  <option value="College Graduate">College Graduate</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Class_Interest</label>
                <select 
                  required
                  className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic"
                  value={formData.interest}
                  onChange={e => setFormData({...formData, interest: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="Enlisted">Enlisted</option>
                  <option value="Officer">Officer</option>
                  <option value="Warrant Officer">Warrant Officer</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Additional_Intel</label>
              <textarea 
                rows={4}
                className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
              />
            </div>
            
            <button 
              disabled={status === 'loading'}
              className="w-full btn-gaming py-6 text-2xl flex items-center justify-center gap-4 disabled:opacity-50 italic"
            >
              {status === 'loading' ? 'TRANSMITTING...' : 'SEND INTEL'}
              <ArrowRight className="w-8 h-8" />
            </button>

            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-army-gold text-army-black text-center font-black uppercase italic tracking-widest glow-border"
              >
                {">>"} INTEL_RECEIVED: HQ WILL CONTACT YOU SHORTLY {"<<"}
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

const HowToJoin = () => {
  const steps = [
    { title: "Contact Recruiter", desc: "Start your simulation. Connect with SFC Lantigua to verify your eligibility and mission goals." },
    { title: "ASVAB Assessment", desc: "Take the skill-tree test. Your scores unlock specific MOS tiers and elite career paths." },
    { title: "Physical & Medical", desc: "Complete your hardware check at MEPS. We ensure you're mission-ready for the field." },
    { title: "Enlistment", desc: "Lock in your role, sign your contract, and take the oath. Welcome to the squad." },
    { title: "RSP Training", desc: "Level up at the Recruit Sustainment Program while you wait for your ship date." },
  ];

  return (
    <section id="how-to-join" className="py-24 bg-army-gold/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase italic tracking-tighter text-white">HOW TO <span className="text-army-gold">JOIN</span></h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">// MISSION_ONBOARDING_PROTOCOL //</p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 z-0" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:border-army-gold group-hover:bg-army-gold group-hover:text-army-black transition-all duration-300 font-black text-xl italic shadow-xl">
                  {i + 1}
                </div>
                <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{step.title}</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const MOSExplorer = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Combat', 'Cyber', 'Technology', 'Medical', 'Logistics', 'Law Enforcement'];
  
  const filteredMOS = filter === 'All' 
    ? MOS_DATA 
    : MOS_DATA.filter(m => m.category === filter);

  return (
    <section id="jobs" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-7xl font-black mb-4 uppercase italic tracking-tighter text-white">CHOOSE YOUR <span className="text-army-gold">CLASS</span></h2>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// LIVE_FEED: UPDATED_TODAY //</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  onTrack(`MOS Filter: ${cat}`);
                }}
                className={cn(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all skew-x-[-10deg]",
                  filter === cat ? "bg-army-gold text-army-black shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-zinc-900 text-zinc-500 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMOS.map((mos) => (
              <motion.div
                layout
                key={mos.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                onHoverStart={() => onTrack(`MOS View: ${mos.code} - ${mos.title}`)}
                className="hud-border p-6 bg-zinc-900/30 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl font-black text-army-gold italic tracking-tighter">{mos.code}</span>
                  <span className="text-[10px] font-black bg-zinc-800 px-2 py-1 text-zinc-400 uppercase tracking-widest">{mos.category}</span>
                </div>
                <h3 className="text-xl font-black mb-4 uppercase group-hover:text-army-gold transition-colors">{mos.title}</h3>
                <p className="text-zinc-500 text-xs font-bold mb-6 line-clamp-2 uppercase leading-relaxed">{mos.description}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800 mb-6">
                  <div>
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 font-mono">ASVAB_REQ</p>
                    <p className="text-[10px] font-black text-white font-mono">{mos.asvab}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 font-mono">PHYSICAL_DEMAND</p>
                    <p className="text-[10px] font-black text-white font-mono">{mos.physical}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50">
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 font-mono">FL_LOCATIONS</p>
                  <p className="text-[9px] font-black text-army-gold font-mono leading-tight uppercase">{mos.location}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const FloridaMission = ({ onTrack }: { onTrack: (el: string) => void }) => (
  <section className="py-24 relative overflow-hidden bg-army-black">
    <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
      <img 
        src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000" 
        alt="Florida Coast" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="hud-border p-6 sm:p-10 border-white/10 bg-white/5 backdrop-blur-sm flex flex-col items-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 uppercase italic tracking-tighter text-white">FLORIDA <span className="text-army-gold">MISSION</span></h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// STATUS: ACTIVE_RESPONSE_MODE //</p>
          </div>
          <div className="space-y-6 text-zinc-300 font-bold uppercase tracking-tight leading-relaxed text-sm">
            <p className="border-l-4 lg:border-l-0 lg:border-b-2 border-army-gold pl-6 lg:pl-0 lg:pb-4">
              When the state of Florida faces crisis—from hurricanes to civil unrest—the Florida Army National Guard is the first to respond.
            </p>
            <p className="border-l-4 lg:border-l-0 lg:border-b-2 border-white pl-6 lg:pl-0 lg:pb-4">
              We are neighbors helping neighbors. We live here, work here, and serve here.
            </p>
            <p className="border-l-4 lg:border-l-0 lg:border-b-2 border-army-gold pl-6 lg:pl-0 lg:pb-4">
              Joining the FLARNG means you're part of a legacy that protects the Sunshine State while building a future for yourself.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center w-full">
            <div>
              <p className="text-3xl font-black text-army-gold italic">10k+</p>
              <p className="text-[8px] font-black text-zinc-500 uppercase font-mono">Active_Soldiers</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white italic">50+</p>
              <p className="text-[8px] font-black text-zinc-500 uppercase font-mono">Armories</p>
            </div>
            <div>
              <p className="text-3xl font-black text-army-gold italic">100%</p>
              <p className="text-[8px] font-black text-zinc-500 uppercase font-mono">FL_Dedicated</p>
            </div>
          </div>
        </div>
        <div className="space-y-8 flex flex-col items-center text-center">
          <h3 className="text-3xl font-black uppercase italic tracking-tight text-white">Current Operations</h3>
          <div className="space-y-4 w-full max-w-md">
            {[
              { title: "Disaster Relief", desc: "Rapid deployment for hurricane recovery and emergency response." },
              { title: "Community Support", desc: "Assisting local authorities in maintaining safety and order." },
              { title: "Federal Missions", desc: "Supporting global security operations alongside the Regular Army." }
            ].map((op, i) => (
              <div 
                key={i} 
                onClick={() => onTrack(`Operation View: ${op.title}`)}
                className="p-6 bg-zinc-900 border border-zinc-800 hover:border-army-gold transition-colors cursor-pointer flex flex-col items-center"
              >
                <h4 className="text-army-gold font-black uppercase mb-2 italic">{op.title}</h4>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-tight">{op.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-20 border-t border-zinc-900 bg-army-black/50">
    <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-12 text-center">
      <div className="flex items-center gap-3">
        <Shield className="text-army-gold w-8 h-8 glow-text" />
        <span className="text-3xl font-black tracking-tighter uppercase italic">GUARD<span className="text-army-gold">LINK</span></span>
      </div>
      <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] leading-loose">
        <p>© 2026 Pico Duarte Holdings LLC. All rights reserved. Operated by GuardLink Technologies LLC.</p>
        <p>SFC ANGEL LANTIGUA // HQ: FAU BOCA RATON, FL</p>
        <p>LIVE HERE. SERVE HERE.</p>
      </div>
      <div className="flex gap-8 font-black uppercase italic text-xs tracking-widest">
        <a href="/privacy.html" className="text-zinc-500 hover:text-army-gold transition-colors">Privacy_Policy</a>
        <a href="/terms.html" className="text-zinc-500 hover:text-army-gold transition-colors">Terms_Of_Service</a>
      </div>
    </div>
  </footer>
);

// --- Main Page ---

const SubscriptionSection = ({ onTrack, recruiterId }: { onTrack: (el: string) => void, recruiterId: string | null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    optIn: true
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    onTrack('Subscription: Submit Attempt');

    try {
      await addDoc(collection(db, 'subscriptions'), {
        ...formData,
        timestamp: new Date().toISOString(),
        recruiterId: recruiterId || 'unassigned'
      });
      setStatus('success');
      onTrack('Subscription: Success');
      setFormData({ name: '', email: '', phone: '', optIn: true });
      playSound(SOUNDS.SUCCESS, 0.3);
    } catch (error) {
      console.error('Subscription Error:', error);
      setStatus('error');
      onTrack('Subscription: Error');
    }
  };

  return (
    <section id="subscribe" className="py-24 bg-zinc-950 border-y border-zinc-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-army-gold via-transparent to-transparent" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase italic tracking-tighter">STAY <span className="text-army-gold">CONNECTED</span></h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">// MISSION_UPDATES_CHANNEL //</p>
        </div>

        <div className="hud-border p-8 bg-army-black/50 backdrop-blur-md border-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Full_Name</label>
                <input 
                  required
                  type="text"
                  placeholder="SOLDIER NAME"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Email_Address</label>
                <input 
                  required
                  type="email"
                  placeholder="COMM_CHANNEL@EMAIL.COM"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic text-sm"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono ml-1">Phone_Number</label>
                <input 
                  required
                  type="tel"
                  placeholder="555-0199"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800">
              <input 
                type="checkbox"
                id="optIn"
                className="w-6 h-6 accent-army-gold cursor-pointer"
                checked={formData.optIn}
                onChange={e => setFormData({...formData, optIn: e.target.checked})}
              />
              <label htmlFor="optIn" className="text-xs font-black uppercase italic tracking-tight cursor-pointer select-none">
                I opt-in to receive mission updates and recruitment intel via email/SMS.
              </label>
            </div>

            <button 
              disabled={status === 'loading'}
              className="w-full btn-gaming py-4 text-xl flex items-center justify-center gap-4 disabled:opacity-50 italic"
            >
              {status === 'loading' ? 'ENCRYPTING...' : 'SUBSCRIBE TO INTEL'}
              <Bell className="w-6 h-6" />
            </button>

            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-army-gold text-army-black text-center font-black uppercase italic text-sm tracking-widest"
              >
                {">>"} SUBSCRIPTION_LOCKED: WELCOME TO THE NETWORK {"<<"}
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export const LandingPage = ({ onDashboardClick }: { onDashboardClick: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [recruiterName, setRecruiterName] = useState<string | null>(null);

  const trackInteraction = (element: string, type: 'click' | 'view' = 'click') => {
    const newInteraction: Interaction = {
      element,
      timestamp: new Date().toISOString(),
      type
    };
    setInteractions(prev => [...prev, newInteraction]);
  };

  useEffect(() => {
    const initApp = async () => {
      // Check for recruiter slug in URL
      const params = new URLSearchParams(window.location.search);
      const r = params.get('r');
      if (r) {
        try {
          const q = query(collection(db, 'users'), where('slug', '==', r));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setRecruiterId(userDoc.uid);
            setRecruiterName(userDoc.displayName);
          }
        } catch (error) {
          console.error("Error fetching recruiter:", error);
        }
      }
      setTimeout(() => setIsLoading(false), 2000);
    };
    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-army-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="scanline" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="w-24 h-24 border-4 border-army-gold/20 border-t-army-gold rounded-full animate-spin mb-8 mx-auto glow-border" />
          <h2 className="text-2xl font-black uppercase tracking-[0.5em] glow-text animate-pulse">Initializing_System</h2>
          <div className="mt-4 font-mono text-[10px] text-zinc-500 space-y-1">
            <p>{">"} Loading_Assets...</p>
            <p>{">"} Establishing_Secure_Link...</p>
            <p>{">"} Mission_Ready...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black relative">
      <div className="scanline" />
      <Navbar onDashboardClick={onDashboardClick} />
      <main>
        <Hero onTrack={trackInteraction} recruiterName={recruiterName} />
        <FloridaMission onTrack={trackInteraction} />
        <MOSExplorer onTrack={trackInteraction} />
        <Benefits onTrack={trackInteraction} />
        <PayCalculator />
        <HowToJoin />
        <EligibilityChecker onTrack={trackInteraction} />
        <ASVABTeaser onTrack={trackInteraction} />
        <RegistrationForm interactions={interactions} recruiterId={recruiterId} />
        <SubscriptionSection onTrack={trackInteraction} recruiterId={recruiterId} />
      </main>
      <Footer />
      
      {/* Floating Comms Trigger */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          playSound(SOUNDS.CLICK);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-army-gold rounded-full flex items-center justify-center shadow-2xl z-40 group glow-border"
      >
        <MessageSquare className="text-army-black w-8 h-8" />
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-army-black flex items-center justify-center text-[10px] font-black animate-bounce">1</span>
        <div className="absolute right-20 bg-army-black/90 backdrop-blur-md border border-army-gold/30 px-4 py-2 rounded-none opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-[10px] font-black uppercase tracking-widest text-army-gold">Incoming_Transmission</span>
        </div>
      </motion.button>

      {/* Audio Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 left-8 w-12 h-12 bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center z-40 hover:border-army-gold transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-zinc-500" /> : <Volume2 className="w-5 h-5 text-army-gold animate-pulse" />}
      </button>

      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
;
