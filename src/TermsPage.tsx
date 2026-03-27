/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { SharedNavbar } from './SharedNavbar';
import { SharedFooter } from './SharedFooter';
import { BasicTrainingGame } from './BasicTrainingGame';

export const TermsPage = ({ onBack, slugParam }: { onBack: () => void; slugParam: string }) => {
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="min-h-screen bg-army-black text-white">
      <SharedNavbar slugParam={slugParam} onBack={onBack} />
      <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-black uppercase tracking-tight text-army-gold mb-2">Terms of Service</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase mb-12">Last updated: March 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using GuardLink ("the Platform"), you agree to be bound by these Terms of Service. GuardLink is operated by Pico Duarte Holdings LLC and GuardLink Technologies LLC ("we," "us," or "our"). If you do not agree to these terms, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">2. Purpose</h2>
            <p>GuardLink is an informational and recruitment engagement platform designed to connect prospective service members with recruiters of the Guard. The Platform provides educational resources, interactive tools, and communication channels to facilitate the recruiting process.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">3. Not an Official Government Website</h2>
            <p>GuardLink is NOT an official website of the U.S. Government, the Department of Defense, or the National Guard Bureau. It is a privately operated recruitment support tool. Information provided on this Platform is for general informational purposes and does not constitute official government guidance. Always verify information through official government sources.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">4. User Information & Lead Capture</h2>
            <p>When you submit your contact information through the Platform, you consent to being contacted by a recruiter of the Guard regarding military service opportunities. Your information will be shared with the assigned recruiter and may be entered into official recruiting systems as required by regulation.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">5. Gamification & XP System</h2>
            <p>The Platform includes a gamification system that awards experience points (XP) for engaging with content. This system is for engagement purposes only and does not create any obligation, promise, or guarantee of enlistment, benefits, rank, or position in the Guard or any branch of the U.S. military.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">6. AI Chatbot Disclaimer</h2>
            <p>The Platform may include an AI-powered chatbot assistant. Information provided by the chatbot is for general informational purposes only and may not be fully accurate or up to date. It does not replace the advice, counsel, or guidance of an official recruiter. Do not rely on chatbot responses for making decisions about military service.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">7. Intellectual Property</h2>
            <p>All content, design, code, and branding on GuardLink are the property of Pico Duarte Holdings LLC and/or GuardLink Technologies LLC. You may not copy, reproduce, distribute, or create derivative works from any content on this Platform without prior written permission.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">8. No Guarantees</h2>
            <p>Nothing on this Platform guarantees eligibility, qualification, or acceptance into the Guard or any military program. All enlistment decisions are subject to applicable federal and state regulations, medical fitness requirements, and the discretion of military authorities.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Pico Duarte Holdings LLC and GuardLink Technologies LLC shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. Continued use of the Platform after changes constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@guardlink.site" className="text-army-gold hover:underline">support@guardlink.site</a>.</p>
          </section>
        </div>
      </div>
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
    </div>
  );
};
