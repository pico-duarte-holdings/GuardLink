/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { SharedNavbar } from './SharedNavbar';
import { SharedFooter } from './SharedFooter';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { EligibilityChecker } from './LandingPage';
import { BasicTrainingGame } from './BasicTrainingGame';

const HowToJoin = () => {
  const steps = [
    { title: "Contact Recruiter", desc: "Start your simulation. Connect with your recruiter to verify your eligibility and mission goals." },
    { title: "ASVAB Assessment", desc: "Take the skill-tree test. Your scores unlock specific MOS tiers and elite career paths." },
    { title: "Physical & Medical", desc: "Complete your hardware check at MEPS. We ensure you're mission-ready for the field." },
    { title: "Enlistment", desc: "Lock in your role, sign your contract, and take the oath. Welcome to the squad." },
    { title: "RSP Training", desc: "Level up at the Recruit Sustainment Program while you wait for your ship date." },
  ];

  return (
    <section className="py-24 bg-army-gold/5">
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

export const HowToJoinPage = ({
  onBack,
  slugParam,
}: {
  onBack: () => void;
  slugParam: string;
}) => {
  const slugQuery = slugParam ? '?r=' + slugParam : '';
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black relative">
      <div className="scanline" />
      <SharedNavbar slugParam={slugParam} onBack={onBack} />
      <main className="pt-20">
        <EligibilityChecker onTrack={() => {}} />
        <HowToJoin />
        <SharedLeadCapture slugParam={slugParam} source="how-to-join" title="READY TO JOIN?" subtitle="// START_YOUR_MISSION //" />
      </main>

      {/* Mini-Game Launcher Icon */}
      <button
        onClick={() => setShowGame(true)}
        className="fixed bottom-36 right-8 z-30 group"
        title="Play Basic Training"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-army-black border-2 border-neon-cyan/40 flex items-center justify-center hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:scale-110 transition-transform">
            <path d="M3 4h14l-2 12H5L3 4z" stroke="#00f2ff" strokeWidth="1.5" fill="none"/>
            <circle cx="7" cy="10" r="2" fill="#00f2ff" opacity="0.6"/>
            <circle cx="13" cy="10" r="2" fill="#00f2ff" opacity="0.6"/>
            <path d="M10 2v3" stroke="#00f2ff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-widest text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Play Drill
        </span>
      </button>
      <AnimatePresence>
        {showGame && (
          <BasicTrainingGame
            onClose={() => setShowGame(false)}
            onGameComplete={(score) => {
              window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'mini-game-play' } }));
              if (score >= 1500) {
                window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'mini-game-highscore' } }));
              }
            }}
          />
        )}
      </AnimatePresence>

      <SharedFooter slugParam={slugParam} />
      <FloatingCTA />
      <SharedChatbot slugParam={slugParam} />
    </div>
  );
};
