/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Share2, Crosshair, Users, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { SharedNavbar } from './SharedNavbar';
import { SharedFooter } from './SharedFooter';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { TIERS, PIPELINE_STAGES, getXPTable, getTierForLevel, getLevelDisplay, type Tier } from './useXP';
import { cn } from './lib/utils';

// --- Tier Card ---
const TierCard: React.FC<{
  tier: Tier;
  levels: ReturnType<typeof getXPTable>;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ tier, levels, isExpanded, onToggle }) => (
  <div className={cn("border rounded-lg overflow-hidden transition-all", tier.borderColor, "border-opacity-40")}>
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between p-4 text-left transition-all",
        tier.bgColor, "bg-opacity-20 hover:bg-opacity-30"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-lg border-2 flex items-center justify-center font-black text-lg",
          tier.borderColor, tier.color
        )} style={{ boxShadow: `0 0 12px ${tier.glowColor}` }}>
          {tier.tier}
        </div>
        <div>
          <div className={cn("text-xl font-black uppercase tracking-wider", tier.color)}>{tier.name}</div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase">
            Levels {(tier.tier - 1) * 10 + 1} — {tier.tier * 10}
          </div>
        </div>
      </div>
      {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-1 border-t border-zinc-800/50">
            {levels.map(l => (
              <div key={l.level} className="flex items-center justify-between py-1.5 px-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className={cn("font-black w-8 text-right", tier.color)}>{l.level}</span>
                  <span className="text-zinc-300 font-bold">{l.display}</span>
                </div>
                <span className="text-zinc-500 font-mono">{l.xpForThisLevel.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// --- XP Earning Guide ---
const XPActions = () => {
  const browsingActions = [
    { label: 'Visit the site', xp: 30 },
    { label: 'Visit any info page', xp: '20-25' },
    { label: 'Start practice quiz', xp: 40 },
    { label: 'Complete practice quiz', xp: 80 },
    { label: 'Explore career fields', xp: 30 },
    { label: 'Send a message to the bot', xp: '10 (per message)' },
  ];

  const gameActions = [
    { label: 'Play Basic Training drill', xp: '30 (repeatable)' },
    { label: 'Hit high score (1500+)', xp: 75 },
  ];

  const conversionActions = [
    { label: 'Submit your info', xp: 150 },
    { label: 'Text a recruiter', xp: 100 },
    { label: 'Share your link', xp: '50 (repeatable)' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase italic tracking-tight">HOW TO EARN <span className="text-neon-green">XP</span></h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hud-border p-5 border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-neon-cyan" />
            <h4 className="text-sm font-black uppercase tracking-wider text-neon-cyan">Browsing</h4>
          </div>
          <div className="space-y-2">
            {browsingActions.map((a, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-zinc-400">{a.label}</span>
                <span className="font-black text-neon-cyan">+{a.xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hud-border p-5 border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-army-gold">Games</h4>
          </div>
          <div className="space-y-2">
            {gameActions.map((a, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-zinc-400">{a.label}</span>
                <span className="font-black text-army-gold">+{a.xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hud-border p-5 border-zinc-700">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-neon-green" />
            <h4 className="text-sm font-black uppercase tracking-wider text-neon-green">Big Moves</h4>
          </div>
          <div className="space-y-2">
            {conversionActions.map((a, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-zinc-400">{a.label}</span>
                <span className="font-black text-neon-green">+{a.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline stages — the real XP */}
      <div className="hud-border p-6 border-army-gold/40">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-army-gold" />
          <h4 className="text-sm font-black uppercase tracking-wider text-army-gold">Enlistment Pipeline — Where the Real XP Lives</h4>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Once you start the process with a recruiter, every milestone earns you massive XP. This is how you break into the top tiers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PIPELINE_STAGES.map(s => (
            <div key={s.stage} className="flex justify-between items-center py-2 px-3 bg-zinc-900/50 border border-zinc-800 rounded text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-army-gold/20 border border-army-gold/40 flex items-center justify-center text-army-gold font-black text-[10px]">
                  {s.stage}
                </span>
                <span className="text-zinc-300">{s.label}</span>
              </div>
              <span className="font-black text-army-gold">+{s.xp.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Stripes for Buddies Section ---
const StripesForBuddies = () => (
  <div className="hud-border p-6 md:p-8 border-neon-green/30">
    <div className="flex items-center gap-3 mb-6">
      <Users className="w-6 h-6 text-neon-green" />
      <h3 className="text-2xl font-black uppercase italic tracking-tight">STRIPES FOR <span className="text-neon-green">BUDDIES</span></h3>
    </div>
    <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
      <p>
        Here's the deal: if you refer a friend who actually enlists, <strong className="text-white">you get promoted</strong>. Not on a website — in real life. One referral = one rank up. You can earn up to three promotions this way, maxing out at Specialist (E-4).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-zinc-900/60 border border-neon-green/20 p-4 rounded text-center">
          <div className="text-3xl font-black text-neon-green mb-1">1</div>
          <div className="text-xs font-black uppercase text-zinc-400">Referral</div>
          <div className="text-sm font-black text-white mt-1">+1 Rank</div>
          <div className="text-[10px] text-zinc-500 mt-1">+3,000 XP</div>
        </div>
        <div className="bg-zinc-900/60 border border-neon-green/20 p-4 rounded text-center">
          <div className="text-3xl font-black text-neon-green mb-1">2</div>
          <div className="text-xs font-black uppercase text-zinc-400">Referrals</div>
          <div className="text-sm font-black text-white mt-1">+2 Ranks</div>
          <div className="text-[10px] text-zinc-500 mt-1">+4,000 XP</div>
        </div>
        <div className="bg-zinc-900/60 border border-neon-green/20 p-4 rounded text-center">
          <div className="text-3xl font-black text-neon-green mb-1">3</div>
          <div className="text-xs font-black uppercase text-zinc-400">Referrals</div>
          <div className="text-sm font-black text-white mt-1">+3 Ranks</div>
          <div className="text-[10px] text-zinc-500 mt-1">+5,000 XP</div>
        </div>
      </div>
      <p className="text-zinc-400 text-xs">
        That means if you enlist as an E-1 (Private) and bring three friends who also enlist, you automatically get promoted to E-4 (Specialist) — that's more money, more respect, and a head start on your career. Bring your squad.
      </p>
    </div>
  </div>
);

// --- Main Page ---
export const RankUpPage = ({
  onBack,
  slugParam,
}: {
  onBack: () => void;
  slugParam: string;
}) => {
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'ranks' | 'xp' | 'buddies'>('ranks');
  const xpTable = getXPTable();

  const sectionTabs = [
    { key: 'ranks' as const, label: 'Ranks & Tiers', icon: Trophy },
    { key: 'xp' as const, label: 'Earn XP', icon: Zap },
    { key: 'buddies' as const, label: 'Stripes for Buddies', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black relative">
      <div className="scanline" />
      <SharedNavbar slugParam={slugParam} onBack={onBack} title="Rank Up" />

      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
              RANK <span className="text-army-gold">UP</span>
            </h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
              // 100 Levels • 10 Tiers • Unlimited Bragging Rights //
            </p>
          </div>

          {/* Section Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {sectionTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all",
                  activeSection === tab.key
                    ? "bg-army-gold text-army-black shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeSection === 'ranks' && (
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tight mb-6">ALL <span className="text-army-gold">TIERS</span></h3>
              {TIERS.map(tier => (
                <TierCard
                  key={tier.tier}
                  tier={tier}
                  levels={xpTable.filter(l => Math.ceil(l.level / 10) === tier.tier)}
                  isExpanded={expandedTier === tier.tier}
                  onToggle={() => setExpandedTier(expandedTier === tier.tier ? null : tier.tier)}
                />
              ))}
            </div>
          )}

          {activeSection === 'xp' && <XPActions />}

          {activeSection === 'buddies' && <StripesForBuddies />}
        </div>
      </main>

      <SharedFooter slugParam={slugParam} />
    </div>
  );
};
