export interface Tier {
  tier: number;
  name: string;
  color: string;
  borderColor: string;
  glowColor: string;
}

export const TIERS: Tier[] = [
  { tier: 1, name: 'Bronze', color: 'text-amber-600', borderColor: 'border-amber-600', glowColor: 'rgba(217, 119, 6, 0.5)' },
  { tier: 2, name: 'Silver', color: 'text-zinc-400', borderColor: 'border-zinc-400', glowColor: 'rgba(161, 161, 170, 0.5)' },
  { tier: 3, name: 'Gold', color: 'text-yellow-400', borderColor: 'border-yellow-400', glowColor: 'rgba(250, 204, 21, 0.5)' },
  { tier: 4, name: 'Platinum', color: 'text-cyan-300', borderColor: 'border-cyan-300', glowColor: 'rgba(103, 232, 249, 0.5)' },
  { tier: 5, name: 'Diamond', color: 'text-purple-400', borderColor: 'border-purple-400', glowColor: 'rgba(192, 132, 252, 0.5)' },
  { tier: 6, name: 'Master', color: 'text-rose-500', borderColor: 'border-rose-500', glowColor: 'rgba(244, 63, 94, 0.5)' },
  { tier: 7, name: 'Grandmaster', color: 'text-red-600', borderColor: 'border-red-600', glowColor: 'rgba(220, 38, 38, 0.5)' },
  { tier: 8, name: 'Challenger', color: 'text-indigo-500', borderColor: 'border-indigo-500', glowColor: 'rgba(99, 102, 241, 0.5)' },
  { tier: 9, name: 'Legend', color: 'text-emerald-400', borderColor: 'border-emerald-400', glowColor: 'rgba(52, 211, 153, 0.5)' },
  { tier: 10, name: 'Mythic', color: 'text-fuchsia-500', borderColor: 'border-fuchsia-500', glowColor: 'rgba(217, 70, 239, 0.5)' }
];

export const PIPELINE_STAGES = [
  { stage: 1, label: 'Contacted', xp: 100 },
  { stage: 2, label: 'Interviewed', xp: 250 },
  { stage: 3, label: 'Appointment Set', xp: 500 },
  { stage: 4, label: 'ASVAB Taken', xp: 1000 },
  { stage: 5, label: 'Medical Cleared', xp: 1500 },
  { stage: 6, label: 'Contract Signed', xp: 2500 },
  { stage: 7, label: 'Enlisted', xp: 5000 },
  { stage: 8, label: 'Basic Training', xp: 10000 },
  { stage: 9, label: 'AIT Completed', xp: 20000 },
  { stage: 10, label: 'First Duty Station', xp: 50000 }
];

export function getTierForLevel(level: number): Tier {
  const tierIndex = Math.min(Math.floor((level - 1) / 10), TIERS.length - 1);
  return TIERS[Math.max(0, tierIndex)];
}

export function getLevelDisplay(level: number): string {
  return `Level ${level}`;
}

export function getXPTable() {
  const table = [];
  let totalXP = 0;
  for (let i = 1; i <= 100; i++) {
    const xpNeeded = i * 1000;
    table.push({ level: i, xpNeeded, totalXP });
    totalXP += xpNeeded;
  }
  return table;
}

export function getLevelFromXP(totalXP: number) {
  let level = 1;
  let currentXP = totalXP;
  while (currentXP >= level * 1000) {
    currentXP -= level * 1000;
    level++;
  }
  return level;
}

export function getLevelProgress(totalXP: number) {
  const level = getLevelFromXP(totalXP);
  let xpInLevel = totalXP;
  for (let i = 1; i < level; i++) {
    xpInLevel -= i * 1000;
  }
  const xpNeeded = level * 1000;
  return {
    level,
    xpInLevel,
    xpNeeded,
    percent: (xpInLevel / xpNeeded) * 100
  };
}

import { useState, useCallback } from 'react';

export function useXP() {
  const [totalXP, setTotalXP] = useState(0);
  const [levelUpEvent, setLevelUpEvent] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const [xpPopup, setXpPopup] = useState<{ amount: number; reason: string } | null>(null);

  const grantXP = useCallback((action: string) => {
    // Mock implementation for now
    const amount = 100;
    setTotalXP(prev => {
      const newTotal = prev + amount;
      const oldLevel = getLevelFromXP(prev);
      const newLevel = getLevelFromXP(newTotal);
      if (newLevel > oldLevel) {
        setLevelUpEvent({ oldLevel, newLevel });
      }
      return newTotal;
    });
    setXpPopup({ amount, reason: action });
  }, []);

  const clearLevelUp = useCallback(() => setLevelUpEvent(null), []);
  const clearXpPopup = useCallback(() => setXpPopup(null), []);

  const prog = getLevelProgress(totalXP);
  const tier = getTierForLevel(prog.level);

  return {
    level: prog.level,
    xp: prog.xpInLevel,
    maxXP: prog.xpNeeded,
    totalXP,
    rankTitle: getLevelDisplay(prog.level),
    tierName: tier.name,
    tier,
    levelUpEvent,
    clearLevelUp,
    xpPopup,
    clearXpPopup,
    grantXP
  };
}
