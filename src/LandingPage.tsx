/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import React, { useState, useEffect } from 'react';
import {
  Users, MapPin, CheckCircle2, BookOpen, MessageSquare, ChevronDown,
  Menu, X, Phone, ChevronRight, ArrowRight, Award, HeartPulse, GraduationCap,
  Briefcase, DollarSign, Volume2, VolumeX, Send, Loader2, Bell, Lock, Mail,
  Instagram, Facebook, Linkedin, Youtube, Link as LinkIcon, Search
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { cn } from './lib/utils';
import { MOS_DATA, Interaction } from './types';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { SharedFooter } from './SharedFooter';
import GuardLinkIcon from './GuardLinkIcon';

// --- Audio Management ---
// GuardLink Diamond Badge Logo Component
const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  HOVER: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

const landingAudioPool: Map<string, HTMLAudioElement> = new Map();
const playSound = (url: string, volume = 0.5) => {
  try {
    let audio = landingAudioPool.get(url);
    if (!audio) {
      audio = new Audio(url);
      landingAudioPool.set(url, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
};

// --- Generic Profile (no recruiter attached) ---
const GENERIC_PROFILE = {
  uid: 'generic',
  displayName: 'GuardLink',
  cellPhone: '',
  publicEmail: '',
  locationType: '',
  address1: '',
  address2: '',
  city: '',
  state: 'FL',
  zip: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  linkedin: '',
  discord: '',
  youtube: '',
  linktree: '',
  photoURL: ''
};

// --- AI Chat Component (moved to SharedChatbot.tsx) ---

// --- Components ---

const Navbar = ({ onDashboardClick, onPlayerLogin, slugQuery }: { onDashboardClick: () => void; onPlayerLogin: () => void; slugQuery: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sectionLinks = [
    { name: 'Perks', href: '#benefits' },
    { name: 'Earnings', href: '#pay' },
    { name: 'Roles', href: '#jobs' },
  ];

  const pageLinks = [
    { name: 'How to Join', to: `/join${slugQuery}` },
    { name: 'ASVAB', to: `/asvab${slugQuery}` },
    { name: 'Benefits', to: `/benefits${slugQuery}` },
    { name: 'Officers', to: `/officers${slugQuery}` },
    { name: 'FAQ', to: `/faq${slugQuery}` },
    { name: 'Meet Your Recruiter', to: `/meet${slugQuery}` },
    { name: 'Rank Up', to: `/rank-up${slugQuery}` },
  ];

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-army-black/90 backdrop-blur-md border-b border-army-gold/20 py-3" : "bg-army-black py-6"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <GuardLinkIcon className="text-army-gold w-8 h-8 glow-text" />
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black tracking-tighter text-white leading-none">GUARD<span className="text-army-gold">LINK</span></span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {sectionLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-army-gold transition-all font-mono relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-army-gold transition-all group-hover:w-full" />
              </a>
            ))}
            <span className="h-4 w-px bg-zinc-800/50" />
            {pageLinks.map((link) => (
              <Link key={link.name} to={link.to} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-army-gold transition-all font-mono relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-army-gold transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
          
          <div className="h-8 w-px bg-zinc-800/50" />

          <div className="flex items-center gap-3">
            <button onClick={onPlayerLogin} className="text-[9px] text-zinc-400 hover:text-army-gold transition-colors uppercase font-black font-mono mr-2">Player_Login</button>
            <button onClick={onDashboardClick} className="text-[9px] text-zinc-600 hover:text-army-gold transition-colors uppercase font-black font-mono mr-2">Admin_Login</button>
            <a
              href="#register"
              className="relative px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 bg-army-gold text-army-black shadow-[0_0_15px_rgba(255,213,48,0.2)] text-center min-w-[140px]"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              Join Squad
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <button 
            onClick={onPlayerLogin} 
            className="text-[10px] text-zinc-400 hover:text-army-gold transition-colors uppercase font-black font-mono flex items-center gap-1.5"
            aria-label="Player Login"
          >
            <Lock className="w-3.5 h-3.5" />
            Player
          </button>
          <button 
            onClick={onDashboardClick} 
            className="text-[10px] text-zinc-400 hover:text-army-gold transition-colors uppercase font-black font-mono flex items-center gap-1.5"
            aria-label="Admin Login"
          >
            <Lock className="w-3.5 h-3.5" />
            Admin
          </button>
          <button className="text-white p-2 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6 text-army-gold" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 bg-army-black z-50 flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <GuardLinkIcon className="text-army-gold w-8 h-8" />
                <span className="text-2xl font-black tracking-tighter text-white">GUARD<span className="text-army-gold">LINK</span></span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full"><X className="w-6 h-6 text-army-gold" /></button>
            </div>

            {/* Section Links — On This Page */}
            <div className="mb-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 mb-6">On This Page</p>
              <div className="grid grid-cols-2 gap-3">
                {sectionLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setIsOpen(false)}
                    className="py-3 px-4 text-sm font-black uppercase tracking-tight text-zinc-300 hover:text-army-gold border border-zinc-800 hover:border-army-gold/40 bg-zinc-950/50 transition-all text-center"
                  >
                    {link.name}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Page Links — Explore */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 mb-6">Explore</p>
              <div className="space-y-3">
                {pageLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between py-3 px-4 text-lg font-black uppercase tracking-tight text-white hover:text-army-gold border border-zinc-800 hover:border-army-gold/40 bg-zinc-950/50 transition-all group"
                    >
                      {link.name}
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-army-gold transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom CTAs */}
            <div className="mt-auto space-y-3">
              <a
                href="#register"
                onClick={() => setIsOpen(false)}
                className="block w-full py-4 text-center font-black uppercase tracking-widest bg-army-gold text-army-black text-sm hover:scale-[1.02] transition-transform"
              >
                Start Your Application
              </a>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onDashboardClick();
                }}
                className="w-full text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest pt-2"
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

const Hero = ({ onTrack, profile, slugQuery, hasSlug }: { onTrack: (el: string) => void, profile: any, slugQuery: string, hasSlug: boolean }) => (
  <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
    <div className="scanline" />

    <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {hasSlug && profile.photoURL && (
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-army-gold/60 shadow-[0_0_30px_rgba(255,213,48,0.2)]">
              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        )}
        {hasSlug ? (
          <Link
            to={`/meet${slugQuery}`}
            onClick={() => onTrack('Hero: Meet Recruiter')}
            className="inline-flex flex-col items-center gap-1 py-2 px-4 rounded border border-army-gold/30 text-army-gold font-black uppercase bg-army-gold/5 font-mono hover:bg-army-gold/10 hover:border-army-gold/60 transition-all mb-8"
          >
            <span className="text-[10px] tracking-[0.3em] flex items-center gap-2">
              <span className="w-2 h-2 bg-army-gold rounded-full animate-pulse" />
              Meet Your Recruiter
            </span>
            <span className="text-sm tracking-tight text-white">{profile.displayName}</span>
          </Link>
        ) : (
          <Link
            to="/meet"
            onClick={() => onTrack('Hero: Find Recruiter')}
            className="inline-flex items-center gap-2 py-3 px-6 rounded border border-army-gold/30 text-army-gold font-black uppercase bg-army-gold/5 font-mono hover:bg-army-gold/10 hover:border-army-gold/60 transition-all mb-8 text-sm tracking-[0.2em]"
          >
            <MapPin className="w-4 h-4" />
            Find Your Hometown Recruiter
          </Link>
        )}
        <h1 className="text-4xl sm:text-6xl md:text-9xl font-black mb-8 leading-none tracking-tighter uppercase italic">
          LEVEL UP <br />
          <span className="text-army-gold glow-text">YOUR LIFE</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-bold uppercase tracking-tight font-mono">
          &gt; Unlock 100% Tuition Assistance. <br />
          &gt; Deploy for your community. <br />
          &gt; Level up your future.
        </p>
        {hasSlug ? (
          <div className="flex flex-row gap-4 justify-center">
            <a
              href={`tel:${profile.cellPhone}`}
              onClick={() => onTrack('Hero: Call HQ')}
              className="hud-border py-3 px-6 text-sm font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-army-gold/10 transition-colors"
            >
              <Phone className="w-4 h-4 text-army-gold" /> Call
            </a>
            <a
              href={`sms:${profile.cellPhone}`}
              onClick={() => onTrack('Hero: Text HQ')}
              className="hud-border py-3 px-6 text-sm font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-army-gold/10 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-army-gold" /> Text
            </a>
            <a
              href={`mailto:${profile.publicEmail}`}
              onClick={() => onTrack('Hero: Email HQ')}
              className="hud-border py-3 px-6 text-sm font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-army-gold/10 transition-colors"
            >
              <Mail className="w-4 h-4 text-army-gold" /> Email
            </a>
          </div>
        ) : (
          <div className="flex flex-row gap-4 justify-center">
            <Link
              to="/meet"
              onClick={() => onTrack('Hero: Find Recruiter')}
              className="btn-gaming py-4 px-10 text-sm font-black uppercase tracking-tighter inline-flex items-center gap-3"
            >
              <Search className="w-5 h-5" /> Find a Recruiter Near You
            </Link>
          </div>
        )}
      </motion.div>
    </div>

    <div className="absolute top-1/4 left-10 hidden xl:block opacity-30 font-mono text-[10px] text-army-gold space-y-2">
      <p>LAT: 26.3683° N</p>
      <p>LONG: 80.1289° W</p>
      <p>ALT: 13FT</p>
    </div>
    <div className="absolute bottom-1/4 right-10 hidden xl:block opacity-30 font-mono text-[10px] text-army-gold text-right space-y-2">
      <p>STATUS: RECRUITING</p>
      <p>SQUAD: GUARDLINK</p>
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

  const getBasePay = (rank: string, years: number) => {
    const table: Record<string, number[]> = {
      'E1': [2170, 2170, 2170, 2170],
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

  const determineRank = () => {
    if (['bachelors', 'masters', 'doctorate'].includes(qualifiers.educationLevel)) return 'E4';
    if (qualifiers.educationLevel === 'associate' || qualifiers.collegeCredits >= 60) return 'E3';
    if (qualifiers.collegeCredits >= 30 || qualifiers.jrotcYears >= 2 || qualifiers.srotcYears >= 1) return 'E2';
    return 'E1';
  };

  const currentRank = determineRank();
  const monthlyBase = getBasePay(currentRank, qualifiers.serviceTime);
  const drillPay = Math.round((monthlyBase / 30) * 4); 

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

export const EligibilityChecker = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const questions = [
    { id: 'age', text: 'AGE: 17 - 42?' },
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

const MOSExplorer = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const [filter, setFilter] = useState('Cyber');
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
                
                <div className="pt-6 border-t border-zinc-800">
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

const Testimonials = ({ onTrack }: { onTrack: (el: string) => void }) => {
  const testimonials = [
    {
      name: "SPC Rodriguez",
      role: "68W Combat Medic | UCF Student",
      quote: "The Guard paid for my entire nursing degree. I went from working two jobs to focusing on school full-time. Now I have zero student debt and real medical experience that civilian EMTs don't get.",
      highlight: "Zero Student Debt",
    },
    {
      name: "SGT Williams",
      role: "17C Cyber Ops | IT Professional",
      quote: "I got my CompTIA Security+ and a TS clearance through the Guard. My civilian salary jumped $30K within a year. The cyber training alone is worth more than most bootcamps charge.",
      highlight: "$30K Salary Increase",
    },
    {
      name: "2LT Perez",
      role: "OCS Graduate | High School Teacher",
      quote: "I was a teacher making ends meet. OCS gave me leadership skills that got me promoted to department head. The second retirement and TRICARE saved my family thousands every year.",
      highlight: "Second Retirement",
    },
    {
      name: "SPC Thompson",
      role: "12B Combat Engineer | Construction Mgr",
      quote: "I came in with no direction after high school. The Guard gave me heavy equipment certifications, a clearance, and a career in construction management. One weekend a month changed my whole trajectory.",
      highlight: "Career Launch",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-army-black">
      <div className="absolute inset-0 opacity-5 grayscale pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000"
          alt="Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 uppercase italic tracking-tighter text-white">REAL <span className="text-army-gold">SOLDIERS</span></h2>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">// AFTER_ACTION_REPORTS //</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onTrack(`Testimonial View: ${t.name}`)}
              className="hud-border p-8 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-default"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white">{t.name}</h4>
                  <p className="text-[10px] font-mono text-army-gold uppercase tracking-widest">{t.role}</p>
                </div>
                <span className="text-[9px] font-black uppercase bg-army-gold/10 text-army-gold px-3 py-1 border border-army-gold/30">{t.highlight}</span>
              </div>
              <p className="text-zinc-400 text-sm font-bold leading-relaxed italic">"{t.quote}"</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#register"
            onClick={() => onTrack('Testimonials: Start Application')}
            className="btn-gaming py-4 px-10 text-sm inline-flex items-center gap-3"
          >
            Write Your Own Story <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

const SubscriptionSection = ({ onTrack, recruiterId }: { onTrack: (el: string) => void, recruiterId: string }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', optIn: true });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    onTrack('Subscription: Submit Attempt');

    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill out all required fields.");
      setStatus('idle');
      return;
    }

    try {
      await addDoc(collection(db, 'leads'), { 
        firstName: formData.name.split(' ')[0] || '',
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.phone,
        optIn: formData.optIn,
        createdAt: new Date().toISOString(), 
        status: 'New', 
        recruiterId: recruiterId,
        source: 'Landing Page'
      });
      setStatus('success');
      onTrack('Subscription: Success');
      setFormData({ name: '', email: '', phone: '', optIn: true });
      playSound(SOUNDS.SUCCESS, 0.3);
    } catch (error: any) { 
      console.error('Subscription error:', error);
      alert("Error saving subscription: " + error.message);
      setStatus('error'); 
    }
  };

  return (
    <section id="subscribe" className="py-24 bg-zinc-950 border-y border-zinc-800 relative">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">STAY <span className="text-army-gold">CONNECTED</span></h2>
        </div>
        <div className="hud-border p-8 bg-army-black/50 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input required type="text" placeholder="NAME" className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="email" placeholder="EMAIL" className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required type="tel" placeholder="PHONE" className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <button disabled={status === 'loading'} className="w-full btn-gaming py-4 flex justify-center items-center gap-2">
              {status === 'loading' ? 'ENCRYPTING...' : 'SUBSCRIBE TO INTEL'} <Bell className="w-5 h-5"/>
            </button>
            {status === 'success' && <div className="p-4 bg-army-gold text-army-black text-center font-black uppercase tracking-widest">{">>"} SUBSCRIPTION_LOCKED {"<<"}</div>}
          </form>
        </div>
      </div>
    </section>
  );
};


export const LandingPage = ({ onDashboardClick, onPlayerLogin }: { onDashboardClick: () => void; onPlayerLogin: () => void }) => {
  const [searchParams] = useSearchParams();
  const slugParam = searchParams.get('r') || '';
  const slugQuery = slugParam ? `?r=${slugParam}` : '';
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [profile, setProfile] = useState(GENERIC_PROFILE);
  const hasSlug = !!slugParam;

  const trackInteraction = (element: string, type: 'click' | 'view' = 'click') => {
    setInteractions(prev => [...prev, { element, timestamp: new Date().toISOString(), type }]);
  };

  useEffect(() => {
    const initApp = async () => {
      const r = slugParam;
      
      if (r) {
        try {
          const q = query(collection(db, 'users'), where('slug', '==', r));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            setProfile({
              uid: userDoc.uid || 'unassigned',
              displayName: userDoc.displayName || GENERIC_PROFILE.displayName,
              cellPhone: userDoc.cellPhone || userDoc.phoneNumber || GENERIC_PROFILE.cellPhone,
              publicEmail: userDoc.publicEmail || userDoc.email || GENERIC_PROFILE.publicEmail,
              locationType: userDoc.locationType || 'Armory',
              address1: userDoc.address1 || '',
              address2: userDoc.address2 || '',
              city: userDoc.city || '',
              state: userDoc.state || 'FL',
              zip: userDoc.zip || '',
              instagram: userDoc.instagram || '',
              facebook: userDoc.facebook || '',
              tiktok: userDoc.tiktok || '',
              linkedin: userDoc.linkedin || '',
              discord: userDoc.discord || '',
              youtube: userDoc.youtube || '',
              linktree: userDoc.linktree || '',
              photoURL: userDoc.photoURL || userDoc.profilePhoto || ''
            });
          }
        } catch (error) {
          console.error("Error fetching custom recruiter profile:", error);
        }
      }
      setTimeout(() => setIsLoading(false), 1500);
    };
    initApp();
  }, []);

  // Scroll to hash section when arriving from another page (e.g. /faq?r=slug#register)
  useEffect(() => {
    if (!isLoading && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-army-black flex flex-col items-center justify-center relative">
        <div className="scanline" />
        <div className="w-24 h-24 border-4 border-army-gold/20 border-t-army-gold rounded-full animate-spin mb-8 z-10" />
        <h2 className="text-lg md:text-2xl font-black uppercase tracking-[0.5em] text-army-gold animate-pulse z-10">Initializing_Link</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black relative">
      <div className="scanline" />
      <Navbar onDashboardClick={onDashboardClick} onPlayerLogin={onPlayerLogin} slugQuery={slugQuery} />
      <main>
        <Hero onTrack={trackInteraction} profile={profile} slugQuery={slugQuery} hasSlug={hasSlug} />
        <Testimonials onTrack={trackInteraction} />
        <Benefits onTrack={trackInteraction} />
        <MOSExplorer onTrack={trackInteraction} />
        <PayCalculator />
        <SharedLeadCapture slugParam={slugParam} source="Website" recruiterId={profile.uid} onComplete={() => {}} />
      </main>
      <SharedFooter slugParam={slugParam} />

      {/* Floating Call/Text/Email Buttons — always visible (uses recruiter info when slug present, defaults otherwise) */}
      <div className="fixed bottom-8 left-8 z-40 flex gap-2">
        <a href={`tel:${profile.cellPhone || '561-459-7845'}`} className="w-12 h-12 bg-army-gold flex items-center justify-center hover:scale-110 transition-all shadow-2xl glow-border"><Phone className="w-5 h-5 text-army-black" /></a>
        <a href={`sms:${profile.cellPhone || '561-459-7845'}`} className="w-12 h-12 bg-army-gold flex items-center justify-center hover:scale-110 transition-all shadow-2xl glow-border"><MessageSquare className="w-5 h-5 text-army-black" /></a>
        <a href={`mailto:${profile.publicEmail || 'angel.m.lantigua.mil@army.mil'}`} className="w-12 h-12 bg-army-gold flex items-center justify-center hover:scale-110 transition-all shadow-2xl glow-border"><Mail className="w-5 h-5 text-army-black" /></a>
      </div>

      {/* Audio Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-22 left-8 w-10 h-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center z-40 hover:border-army-gold transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-zinc-500" /> : <Volume2 className="w-5 h-5 text-army-gold animate-pulse" />}
      </button>


      {/* Shared AI Chatbot */}
      <SharedChatbot slugParam={slugParam} />
    </div>
  );
};