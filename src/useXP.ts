/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import { useState, useEffect, useCallback } from 'react';

// --- 100-Level Recruit Readiness Level (RRL) System ---
// 10 Tiers × 10 Levels each = 100 Total Levels
// Exponential XP curve: browsing/games cap around Tier 3-4, pipeline dominates progression

export interface Tier {
  tier: number;
  name: string;
  color: string;        // Tailwind text color class
  bgColor: string;      // Tailwind bg color class
  borderColor: string;  // Tailwind border color class
  glowColor: string;    // CSS glow color
}

export const TIERS: Tier[] = [
  { tier: 1,  name: 'RECRUIT',    color: 'text-zinc-400',   bgColor: 'bg-zinc-700',      borderColor: 'border-zinc-500',   glowColor: 'rgba(161,161,170,0.4)' },
  { tier: 2,  name: 'TRAINEE',    color: 'text-amber-600',  bgColor: 'bg-amber-900',     borderColor: 'border-amber-700',  glowColor: 'rgba(180,83,9,0.4)' },
  { tier: 3,  name: 'TROOPER',    color: 'text-gray-300',   bgColor: 'bg-gray-600',      borderColor: 'border-gray-400',   glowColor: 'rgba(209,213,219,0.4)' },
  { tier: 4,  name: 'OPERATOR',   color: 'text-army-gold',  bgColor: 'bg-army-gold/20',  borderColor: 'border-army-gold',  glowColor: 'rgba(212,175,55,0.5)' },
  { tier: 5,  name: 'SPECIALIST', color: 'text-neon-cyan',  bgColor: 'bg-neon-cyan/10',  borderColor: 'border-neon-cyan',  glowColor: 'rgba(0,242,255,0.5)' },
  { tier: 6,  name: 'SENTINEL',   color: 'text-neon-green', bgColor: 'bg-neon-green/10', borderColor: 'border-neon-green', glowColor: 'rgba(57,255,20,0.5)' },
  { tier: 7,  name: 'VANGUARD',   color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-500', glowColor: 'rgba(168,85,247,0.5)' },
  { tier: 8,  name: 'WARLORD',    color: 'text-red-400',    bgColor: 'bg-red-900/20',    borderColor: 'border-red-500',    glowColor: 'rgba(248,113,113,0.5)' },
  { tier: 9,  name: 'TIGUERE',    color: 'text-army-gold',  bgColor: 'bg-army-gold/20',  borderColor: 'border-army-gold',  glowColor: 'rgba(255,215,0,0.7)' },
  { tier: 10, name: 'LEGEND',     color: 'text-white',      bgColor: 'bg-gradient-to-r from-army-gold/20 to-neon-cyan/20', borderColor: 'border-army-gold', glowColor: 'rgba(255,215,0,0.9)' },
];

// XP required to reach each level (1-100)
// Formula: exponential curve — easy early, brutal late
// Tier 1 (levels 1-10):  ~50-100 XP/level  → total ~750
// Tier 2 (levels 11-20): ~150-250 XP/level  → total ~2,750
// Tier 3 (levels 21-30): ~300-500 XP/level  → total ~6,750
// Tier 4 (levels 31-40): ~600-900 XP/level  → total ~14,250
// Tier 5+ requires pipeline progression
function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Base: 40, growth rate: ~8% per level with tier jumps
  const tier = Math.ceil(level / 10);
  const tierMultiplier = Math.pow(1.8, tier - 1); // each tier ~1.8x harder
  const withinTier = ((level - 1) % 10) + 1;
  const base = 40 + withinTier * 10;
  return Math.round(base * tierMultiplier);
}

// Build cumulative XP table
const XP_TABLE: number[] = [];
let cumulativeXP = 0;
for (let i = 1; i <= 101; i++) {
  XP_TABLE[i] = cumulativeXP;
  cumulativeXP += xpForLevel(i);
}

export function getTierForLevel(level: number): Tier {
  const tierIndex = Math.min(Math.ceil(level / 10) - 1, TIERS.length - 1);
  return TIERS[Math.max(0, tierIndex)];
}

export function getLevelDisplay(level: number): string {
  const tier = getTierForLevel(level);
  const withinTier = ((level - 1) % 10) + 1;
  return `${tier.name} ${toRoman(withinTier)}`;
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, 'X'], [9, 'IX'], [8, 'VIII'], [7, 'VII'],
    [6, 'VI'], [5, 'V'], [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I'],
  ];
  let result = '';
  for (const [val, sym] of map) {
    while (num >= val) { result += sym; num -= val; }
  }
  return result;
}

export interface XPState {
  level: number;
  xp: number;          // XP within current level
  maxXP: number;       // XP needed to reach next level
  totalXP: number;
  rankTitle: string;    // e.g. "OPERATOR IV"
  tierName: string;     // e.g. "OPERATOR"
  tier: Tier;
  actions: string[];
}

// --- XP Actions ---
// Browsing/games: small XP (caps around Tier 3-4 naturally)
// Pipeline stages: massive XP (dominates progression)
const XP_ACTIONS: Record<string, { xp: number; once: boolean }> = {
  // === BROWSING (max ~500-700 XP total if they hit everything) ===
  'site-visit':          { xp: 30,  once: true },
  'page-benefits':       { xp: 25,  once: true },
  'page-asvab':          { xp: 25,  once: true },
  'page-officers':       { xp: 20,  once: true },
  'page-faq':            { xp: 20,  once: true },
  'page-how-to-join':    { xp: 20,  once: true },
  'page-meet':           { xp: 20,  once: true },
  'page-rank-up':        { xp: 20,  once: true },

  // === ENGAGEMENT (max ~400-500 XP) ===
  'asvab-quiz-start':    { xp: 40,  once: true },
  'asvab-quiz-complete': { xp: 80,  once: true },
  'mos-explore':         { xp: 30,  once: true },
  'chatbot-convo':       { xp: 25,  once: true },   // legacy: first convo bonus
  'chatbot-message':     { xp: 10,  once: false },  // per real message sent

  // === GAMES (repeatable for play, once for high score) ===
  'mini-game-play':      { xp: 30,  once: false },
  'mini-game-highscore': { xp: 75,  once: true },

  // === CONVERSION (big XP) ===
  'lead-submitted':      { xp: 150, once: true },
  'contact-recruiter':   { xp: 100, once: true },
  'share-link':          { xp: 50,  once: false },

  // === PIPELINE STAGES (massive XP — recruiter grants these) ===
  'pipeline-contact':         { xp: 500,   once: true },   // Stage 1
  'pipeline-appointment':     { xp: 750,   once: true },   // Stage 2
  'pipeline-appt-conducted':  { xp: 1000,  once: true },   // Stage 3
  'pipeline-asvab-passed':    { xp: 1500,  once: true },   // Stage 4
  'pipeline-medical-passed':  { xp: 1500,  once: true },   // Stage 5
  'pipeline-waiver-approved': { xp: 1000,  once: true },   // Stage 6
  'pipeline-enlisted':        { xp: 3000,  once: true },   // Stage 7
  'pipeline-shipped':         { xp: 2000,  once: true },   // Stage 8
  'pipeline-bct-complete':    { xp: 2500,  once: true },   // Stage 9
  'pipeline-ait-complete':    { xp: 2500,  once: true },   // Stage 10
  'pipeline-referral-1':      { xp: 3000,  once: true },   // Stage 11: Stripes for Buddies L1
  'pipeline-referral-2':      { xp: 4000,  once: true },   // Stage 12: Stripes for Buddies L2
  'pipeline-referral-3':      { xp: 5000,  once: true },   // Stage 13: Stripes for Buddies L3
};

export const PIPELINE_STAGES = [
  { stage: 1,  key: 'pipeline-contact',         label: 'Contact Recruiter',           xp: 500 },
  { stage: 2,  key: 'pipeline-appointment',      label: 'Schedule Appointment',        xp: 750 },
  { stage: 3,  key: 'pipeline-appt-conducted',   label: 'Appointment Conducted',       xp: 1000 },
  { stage: 4,  key: 'pipeline-asvab-passed',     label: 'Passed Entrance Exam',        xp: 1500 },
  { stage: 5,  key: 'pipeline-medical-passed',   label: 'Passed Medical',              xp: 1500 },
  { stage: 6,  key: 'pipeline-waiver-approved',  label: 'Waiver/Exception Approved',   xp: 1000 },
  { stage: 7,  key: 'pipeline-enlisted',         label: 'Contracted / Enlisted',       xp: 3000 },
  { stage: 8,  key: 'pipeline-shipped',          label: 'Shipped to Training',         xp: 2000 },
  { stage: 9,  key: 'pipeline-bct-complete',     label: 'Basic Training Complete',     xp: 2500 },
  { stage: 10, key: 'pipeline-ait-complete',      label: 'Job Training Complete',       xp: 2500 },
  { stage: 11, key: 'pipeline-referral-1',        label: 'Stripes for Buddies — Lvl 1', xp: 3000 },
  { stage: 12, key: 'pipeline-referral-2',        label: 'Stripes for Buddies — Lvl 2', xp: 4000 },
  { stage: 13, key: 'pipeline-referral-3',        label: 'Stripes for Buddies — Lvl 3', xp: 5000 },
];

const STORAGE_KEY = 'guardlink_xp';

function getLevelInfo(totalXP: number) {
  let level = 1;
  for (let i = 100; i >= 1; i--) {
    if (totalXP >= XP_TABLE[i]) {
      level = i;
      break;
    }
  }

  const currentLevelXP = XP_TABLE[level] || 0;
  const nextLevelXP = XP_TABLE[level + 1] || XP_TABLE[level] + 1;
  const tier = getTierForLevel(level);

  return {
    level,
    rankTitle: getLevelDisplay(level),
    tierName: tier.name,
    tier,
    xp: totalXP - currentLevelXP,
    maxXP: nextLevelXP - currentLevelXP || 1,
    totalXP,
  };
}

function loadState(): { totalXP: number; actions: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { totalXP: parsed.totalXP || 0, actions: parsed.actions || [] };
    }
  } catch {}
  return { totalXP: 0, actions: [] };
}

function saveState(totalXP: number, actions: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ totalXP, actions }));
  } catch {}
}

export function useXP() {
  const [state, setState] = useState(() => {
    const { totalXP, actions } = loadState();
    const info = getLevelInfo(totalXP);
    return { ...info, actions };
  });
  const [levelUpEvent, setLevelUpEvent] = useState<{ from: number; to: number; title: string } | null>(null);
  const [xpPopup, setXpPopup] = useState<{ amount: number; action: string } | null>(null);

  const grantXP = useCallback((action: string) => {
    const config = XP_ACTIONS[action];
    if (!config) return;

    setState(prev => {
      if (config.once && prev.actions.includes(action)) return prev;

      const newActions = config.once ? [...prev.actions, action] : prev.actions;
      const newTotalXP = prev.totalXP + config.xp;
      const newInfo = getLevelInfo(newTotalXP);

      saveState(newTotalXP, newActions);

      // Detect level-up (could jump multiple levels with pipeline XP)
      if (newInfo.level > prev.level) {
        setLevelUpEvent({ from: prev.level, to: newInfo.level, title: newInfo.rankTitle });
        window.dispatchEvent(new CustomEvent('guardlink:level-up', {
          detail: { from: prev.level, to: newInfo.level, title: newInfo.rankTitle, tierName: newInfo.tierName }
        }));
      }

      setXpPopup({ amount: config.xp, action });

      return { ...newInfo, actions: newActions };
    });
  }, []);

  const clearLevelUp = useCallback(() => setLevelUpEvent(null), []);
  const clearXpPopup = useCallback(() => setXpPopup(null), []);

  // Auto-grant site-visit XP on first load
  useEffect(() => {
    grantXP('site-visit');
  }, [grantXP]);

  // Listen for custom events from other components
  useEffect(() => {
    const handleLeadSubmitted = () => grantXP('lead-submitted');
    const handleContact = () => grantXP('contact-recruiter');
    const handleXpGrant = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action) grantXP(detail.action);
    };

    window.addEventListener('guardlink:lead-submitted', handleLeadSubmitted);
    window.addEventListener('guardlink:contact-recruiter', handleContact);
    window.addEventListener('guardlink:xp-grant', handleXpGrant);

    return () => {
      window.removeEventListener('guardlink:lead-submitted', handleLeadSubmitted);
      window.removeEventListener('guardlink:contact-recruiter', handleContact);
      window.removeEventListener('guardlink:xp-grant', handleXpGrant);
    };
  }, [grantXP]);

  return {
    level: state.level,
    xp: state.xp,
    maxXP: state.maxXP,
    totalXP: state.totalXP,
    rankTitle: state.rankTitle,
    tierName: state.tierName,
    tier: state.tier,
    actions: state.actions,
    grantXP,
    levelUpEvent,
    clearLevelUp,
    xpPopup,
    clearXpPopup,
  };
}

// Utility: get XP table for display on Rank Up page
export function getXPTable() {
  return Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const tier = getTierForLevel(level);
    return {
      level,
      display: getLevelDisplay(level),
      tierName: tier.name,
      tier,
      xpToReach: XP_TABLE[level],
      xpForThisLevel: xpForLevel(level),
    };
  });
}
