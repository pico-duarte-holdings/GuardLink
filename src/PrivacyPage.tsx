/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { SharedNavbar } from './SharedNavbar';
import { SharedFooter } from './SharedFooter';
import { BasicTrainingGame } from './BasicTrainingGame';

export const PrivacyPage = ({ onBack, slugParam }: { onBack: () => void; slugParam: string }) => {
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="min-h-screen bg-army-black text-white">
      <SharedNavbar slugParam={slugParam} onBack={onBack} />
      <div className="max-w-3xl mx-auto px-4 pt-32 pb-20">
        <h1 className="text-3xl font-black uppercase tracking-tight text-army-gold mb-2">Privacy Policy</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase mb-12">Last updated: March 2026</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">1. Information We Collect</h2>
            <p>When you use GuardLink, we may collect the following information:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Name, email address, and phone number (when you submit a contact form)</li>
              <li>Zip code and general location information</li>
              <li>Age, education level, and areas of military interest (if voluntarily provided)</li>
              <li>Browsing behavior and interaction data within the Platform (page visits, XP earned, chatbot messages)</li>
              <li>Device and browser information for analytics purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Connect you with a Guard recruiter in your area</li>
              <li>Facilitate recruiting communications via phone, text, or email</li>
              <li>Personalize your experience on the Platform</li>
              <li>Improve the Platform's features and functionality</li>
              <li>Track recruiting engagement metrics for authorized personnel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">3. Data Sharing</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Guard recruiters assigned to your area</li>
              <li>Official military recruiting systems as required by regulation</li>
              <li>Firebase (Google Cloud) for data storage and hosting</li>
              <li>Google Gemini AI for chatbot functionality</li>
            </ul>
            <p className="mt-2">We do NOT sell your personal information to third-party advertisers or marketing companies.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored using Google Firebase infrastructure with industry-standard security measures. We implement authentication, role-based access controls, and encrypted connections (HTTPS) to protect your information. However, no system is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">5. Cookies & Local Storage</h2>
            <p>GuardLink uses browser local storage to track your XP progress and gamification state. This data is stored locally on your device and is not transmitted to our servers unless you submit a contact form. We may use standard analytics tools that utilize cookies for anonymous usage tracking.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-400">
              <li>Request access to the personal information we hold about you</li>
              <li>Request correction or deletion of your personal data</li>
              <li>Opt out of further recruiting communications at any time</li>
              <li>Clear your local XP/gamification data by clearing your browser storage</li>
            </ul>
            <p className="mt-2">To exercise these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">7. Children's Privacy</h2>
            <p>GuardLink is intended for individuals aged 16 and older who may be interested in future military service. We do not knowingly collect personal information from children under 16. If we learn that we have collected information from a child under 16, we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated effective date. Continued use of the Platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase text-army-gold mb-3">9. Contact</h2>
            <p>For questions or concerns about this Privacy Policy, contact us at <a href="mailto:support@guardlink.site" className="text-army-gold hover:underline">support@guardlink.site</a>.</p>
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
