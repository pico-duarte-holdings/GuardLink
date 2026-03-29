import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star } from 'lucide-react';

interface XPBarProps {
  level: number;
  xp: number;
  maxXP: number;
  totalXP: number;
  rankTitle: string;
  tierName: string;
  tier: any;
  levelUpEvent: { oldLevel: number; newLevel: number } | null;
  clearLevelUp: () => void;
  xpPopup: { amount: number; reason: string } | null;
  clearXpPopup: () => void;
}

export const XPBar = ({ level, xp, maxXP, totalXP, rankTitle, tierName, tier, levelUpEvent, clearLevelUp, xpPopup, clearXpPopup }: XPBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 p-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black ${tier.borderColor} ${tier.color}`}>
          {level}
        </div>
        <div>
          <div className={`text-xs font-black uppercase ${tier.color}`}>{rankTitle} - {tierName}</div>
          <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-army-gold" style={{ width: `${(xp / maxXP) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="text-xs font-mono text-zinc-400">
        {totalXP} XP
      </div>
    </div>
  );
};
