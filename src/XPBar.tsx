/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { type Tier } from './useXP';

interface XPBarProps {
  level: number;
  xp: number;
  maxXP: number;
  totalXP: number;
  rankTitle: string;
  tierName: string;
  tier: Tier;
  levelUpEvent: { from: number; to: number; title: string } | null;
  clearLevelUp: () => void;
  xpPopup: { amount: number; action: string } | null;
  clearXpPopup: () => void;
}

export const XPBar = ({
  level,
  xp,
  maxXP,
  totalXP,
  rankTitle,
  tierName,
  tier,
  levelUpEvent,
  clearLevelUp,
  xpPopup,
  clearXpPopup,
}: XPBarProps) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXpGain, setShowXpGain] = useState(false);
  const progress = Math.min((xp / maxXP) * 100, 100);

  // Level-up animation
  useEffect(() => {
    if (levelUpEvent) {
      setShowLevelUp(true);
      const timer = setTimeout(() => {
        setShowLevelUp(false);
        clearLevelUp();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [levelUpEvent, clearLevelUp]);

  // XP gain popup
  useEffect(() => {
    if (xpPopup) {
      setShowXpGain(true);
      const timer = setTimeout(() => {
        setShowXpGain(false);
        clearXpPopup();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [xpPopup, clearXpPopup]);

  return (
    <>
      {/* Fixed XP Bar at top of screen, below navbar */}
      <div className="fixed top-[60px] left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4">
          <div className="pointer-events-auto flex items-center gap-3 bg-army-black/90 backdrop-blur-md border border-zinc-800/50 rounded-b-lg px-4 py-2 w-fit mx-auto">
            {/* Level badge with tier color */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded border flex items-center justify-center text-xs font-black",
                  tier.borderColor, tier.bgColor, tier.color
                )}
                style={{ boxShadow: `0 0 8px ${tier.glowColor}` }}
              >
                {level}
              </div>
              <div className="hidden sm:block">
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Rank</div>
                <div className={cn("text-[10px] font-black uppercase tracking-wider", tier.color)}>
                  {rankTitle}
                </div>
              </div>
            </div>

            {/* XP Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-40 h-2.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${tier.glowColor}, ${tier.glowColor.replace('0.', '0.8')})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[9px] font-mono text-zinc-500 w-16 text-right">
                {xp}/{maxXP}
              </span>
            </div>

            {/* +XP popup */}
            <AnimatePresence>
              {showXpGain && xpPopup && (
                <motion.span
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -8 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-neon-green text-xs font-black absolute -top-6 right-4"
                >
                  +{xpPopup.amount} XP
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Level-up overlay */}
      <AnimatePresence>
        {showLevelUp && levelUpEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-army-black/70 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative text-center"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.5em] text-neon-cyan mb-2">
                // Rank_Upgrade //
              </div>
              <div className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-2">
                LEVEL <span className="text-army-gold">{levelUpEvent.to}</span>
              </div>
              <div className={cn("text-2xl md:text-3xl font-black uppercase tracking-widest", tier.color)}>
                {levelUpEvent.title}
              </div>
              {/* Tier change callout */}
              {Math.ceil(levelUpEvent.from / 10) !== Math.ceil(levelUpEvent.to / 10) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-sm font-black uppercase tracking-widest text-neon-green"
                >
                  NEW TIER UNLOCKED
                </motion.div>
              )}
              <div className="mt-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Keep going // Next rank awaits
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
