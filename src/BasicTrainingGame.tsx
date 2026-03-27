/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crosshair, Zap, Trophy, RotateCcw } from 'lucide-react';
import { cn } from './lib/utils';

// --- Audio (pooled to prevent WebMediaPlayer overflow) ---
const SOUNDS = {
  HIT: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  MISS: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  START: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  COMPLETE: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
};

const audioPool: Map<string, HTMLAudioElement> = new Map();
const playSound = (url: string, volume = 0.4) => {
  try {
    let audio = audioPool.get(url);
    if (!audio) {
      audio = new Audio(url);
      audioPool.set(url, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {}
};

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  spawnedAt: number;
  type: 'standard' | 'bonus' | 'decoy';
}

type GamePhase = 'idle' | 'countdown' | 'playing' | 'results';

interface GameStats {
  hits: number;
  misses: number;
  totalTargets: number;
  avgReaction: number;
  bestReaction: number;
  score: number;
}

const GAME_DURATION = 20; // seconds
const TARGET_LIFETIME = 1800; // ms before target disappears
const SPAWN_INTERVAL_BASE = 900; // ms between spawns (gets faster)
const TOTAL_ROUNDS = 15;

// Rank based on score
function getPerformanceRank(score: number): { rank: string; color: string } {
  if (score >= 2500) return { rank: 'ELITE OPERATOR', color: 'text-army-gold' };
  if (score >= 2000) return { rank: 'SHARPSHOOTER', color: 'text-army-gold' };
  if (score >= 1500) return { rank: 'MARKSMAN', color: 'text-neon-cyan' };
  if (score >= 1000) return { rank: 'QUALIFIED', color: 'text-neon-green' };
  if (score >= 500) return { rank: 'TRAINEE', color: 'text-zinc-400' };
  return { rank: 'RECRUIT', color: 'text-zinc-500' };
}

interface BasicTrainingGameProps {
  onClose: () => void;
  onGameComplete?: (score: number) => void;
}

export const BasicTrainingGame = ({ onClose, onGameComplete }: BasicTrainingGameProps) => {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [hitFlash, setHitFlash] = useState<{ x: number; y: number; points: number } | null>(null);
  const [targetsSpawned, setTargetsSpawned] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const gameTimerRef = useRef<ReturnType<typeof setInterval>>();
  const hasReportedResults = useRef(false);
  const onGameCompleteRef = useRef(onGameComplete);
  onGameCompleteRef.current = onGameComplete;

  // --- Start Game ---
  const startGame = useCallback(() => {
    setPhase('countdown');
    setCountdown(3);
    setTargets([]);
    setHits(0);
    setMisses(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setReactionTimes([]);
    setTargetsSpawned(0);
    targetIdRef.current = 0;
    hasReportedResults.current = false;
    playSound(SOUNDS.START);
  }, []);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown <= 0) {
      setPhase('playing');
      setTimeLeft(GAME_DURATION);
      return;
    }

    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // --- Spawn Targets ---
  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const padding = 50;
    const size = 40 + Math.random() * 20; // 40-60px

    // Random type: 70% standard, 15% bonus (gold), 15% decoy (red)
    const roll = Math.random();
    const type: Target['type'] = roll < 0.15 ? 'decoy' : roll < 0.30 ? 'bonus' : 'standard';

    const target: Target = {
      id: targetIdRef.current++,
      x: padding + Math.random() * (rect.width - padding * 2 - size),
      y: padding + Math.random() * (rect.height - padding * 2 - size),
      size,
      spawnedAt: Date.now(),
      type,
    };

    setTargets(prev => [...prev, target]);
    setTargetsSpawned(prev => prev + 1);
  }, []);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return;

    // Game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn loop
    const scheduleSpawn = () => {
      // Speed up spawns as time passes
      const elapsed = GAME_DURATION - timeLeft;
      const speedFactor = Math.max(0.5, 1 - elapsed * 0.02);
      const interval = SPAWN_INTERVAL_BASE * speedFactor;

      spawnTimerRef.current = setTimeout(() => {
        spawnTarget();
        scheduleSpawn();
      }, interval);
    };

    spawnTarget(); // First target immediately
    scheduleSpawn();

    return () => {
      clearInterval(gameTimerRef.current);
      clearTimeout(spawnTimerRef.current);
    };
  }, [phase]);

  // Remove expired targets (misses)
  useEffect(() => {
    if (phase !== 'playing') return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      setTargets(prev => {
        const expired = prev.filter(t => now - t.spawnedAt > TARGET_LIFETIME);
        if (expired.length > 0) {
          // Only count non-decoy expired as misses
          const realMisses = expired.filter(t => t.type !== 'decoy').length;
          if (realMisses > 0) {
            setMisses(m => m + realMisses);
            setCombo(0);
          }
        }
        return prev.filter(t => now - t.spawnedAt <= TARGET_LIFETIME);
      });
    }, 100);

    return () => clearInterval(cleanup);
  }, [phase]);

  // Game over — fire ONCE only (ref prevents re-render loop)
  useEffect(() => {
    if (phase !== 'results') return;
    if (hasReportedResults.current) return;
    hasReportedResults.current = true;

    clearInterval(gameTimerRef.current);
    clearTimeout(spawnTimerRef.current);
    setTargets([]);
    playSound(SOUNDS.COMPLETE, 0.6);

    // Dispatch XP events
    window.dispatchEvent(new CustomEvent('guardlink:game-complete', { detail: { score } }));

    if (onGameCompleteRef.current) {
      onGameCompleteRef.current(score);
    }
  }, [phase, score]);

  // --- Handle Target Click ---
  const handleTargetClick = (target: Target, e: React.MouseEvent) => {
    e.stopPropagation();

    if (target.type === 'decoy') {
      // Clicked a decoy — penalty!
      playSound(SOUNDS.MISS, 0.5);
      setScore(s => Math.max(0, s - 50));
      setCombo(0);
      setHitFlash({ x: target.x + target.size / 2, y: target.y + target.size / 2, points: -50 });
    } else {
      const reactionTime = Date.now() - target.spawnedAt;
      setReactionTimes(prev => [...prev, reactionTime]);

      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));

      // Score: faster reaction = more points, combo multiplier, bonus targets worth 2x
      const basePoints = Math.max(50, Math.round(200 - reactionTime / 10));
      const comboMultiplier = 1 + (newCombo - 1) * 0.15;
      const typeMultiplier = target.type === 'bonus' ? 2 : 1;
      const points = Math.round(basePoints * comboMultiplier * typeMultiplier);

      setScore(s => s + points);
      setHits(h => h + 1);
      playSound(SOUNDS.HIT, 0.3);

      setHitFlash({ x: target.x + target.size / 2, y: target.y + target.size / 2, points });
    }

    // Remove target
    setTargets(prev => prev.filter(t => t.id !== target.id));

    // Clear flash
    setTimeout(() => setHitFlash(null), 500);
  };

  // --- Handle Background Click (miss) ---
  const handleAreaClick = () => {
    if (phase !== 'playing') return;
    // Background click = miss
    setMisses(m => m + 1);
    setCombo(0);
    playSound(SOUNDS.MISS, 0.2);
  };

  const avgReaction = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;
  const bestReaction = reactionTimes.length > 0
    ? Math.round(Math.min(...reactionTimes))
    : 0;
  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  const perfRank = getPerformanceRank(score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-army-black/95 backdrop-blur-md flex flex-col"
    >
      {/* Top HUD */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-army-black">
        <div className="flex items-center gap-4">
          <div className="text-[9px] font-mono uppercase tracking-widest text-neon-cyan">
            // Basic_Training //
          </div>
          {phase === 'playing' && (
            <>
              <div className="text-xs font-black text-army-gold">
                SCORE: <span className="text-white">{score}</span>
              </div>
              {combo > 1 && (
                <motion.div
                  key={combo}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xs font-black text-neon-green"
                >
                  {combo}x COMBO
                </motion.div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {phase === 'playing' && (
            <div className={cn(
              "text-xl font-black font-mono tabular-nums",
              timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"
            )}>
              {timeLeft}s
            </div>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        onClick={handleAreaClick}
        className={cn(
          "flex-1 relative overflow-hidden select-none",
          phase === 'playing' ? "cursor-crosshair" : "cursor-default"
        )}
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      >
        {/* Grid overlay for tactical look */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,242,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* IDLE SCREEN */}
        {phase === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-20 h-20 mx-auto mb-6 rounded-lg border-2 border-army-gold/40 bg-army-gold/10 flex items-center justify-center">
                <Crosshair className="w-10 h-10 text-army-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">
                BASIC <span className="text-army-gold">TRAINING</span>
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">
                // Reaction_Time_Drill //
              </p>
              <div className="space-y-3 text-xs text-zinc-400 mb-8 text-left max-w-xs mx-auto">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-neon-green/20 border border-neon-green mt-0.5 flex-shrink-0" />
                  <span><strong className="text-white">Green targets</strong> — tap fast for points</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-army-gold/30 border border-army-gold mt-0.5 flex-shrink-0" />
                  <span><strong className="text-army-gold">Gold targets</strong> — bonus! Worth 2x points</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-red-400">Red targets</strong> — decoy! Don't click</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                  <span><strong className="text-neon-cyan">Combo streaks</strong> multiply your score</span>
                </div>
              </div>
              <button
                onClick={startGame}
                className="btn-gaming py-4 px-12 text-lg font-black uppercase italic"
              >
                START DRILL
              </button>
            </div>
          </div>
        )}

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {countdown > 0 ? (
                  <>
                    <div className="text-8xl md:text-9xl font-black text-army-gold">{countdown}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-2">
                      Get Ready
                    </div>
                  </>
                ) : (
                  <div className="text-6xl md:text-7xl font-black text-neon-green uppercase italic">GO!</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* TARGETS */}
        <AnimatePresence>
          {targets.map(target => {
            const progress = (Date.now() - target.spawnedAt) / TARGET_LIFETIME;
            return (
              <motion.button
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 - progress * 0.5 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                onClick={(e) => handleTargetClick(target, e)}
                className={cn(
                  "absolute rounded-full flex items-center justify-center transition-all",
                  "border-2 shadow-lg active:scale-90",
                  target.type === 'standard'
                    ? "bg-neon-green/20 border-neon-green shadow-neon-green/30 hover:bg-neon-green/30"
                    : target.type === 'bonus'
                      ? "bg-army-gold/20 border-army-gold shadow-army-gold/30 hover:bg-army-gold/30 animate-pulse"
                      : "bg-red-500/20 border-red-500 shadow-red-500/30 hover:bg-red-500/30"
                )}
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              >
                <Crosshair className={cn(
                  "w-1/2 h-1/2",
                  target.type === 'standard' ? "text-neon-green"
                    : target.type === 'bonus' ? "text-army-gold"
                      : "text-red-500"
                )} />
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Hit flash / points popup */}
        <AnimatePresence>
          {hitFlash && (
            <motion.div
              key={`flash-${hitFlash.x}-${hitFlash.y}`}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -40, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "absolute pointer-events-none font-black text-lg",
                hitFlash.points > 0 ? "text-neon-green" : "text-red-500"
              )}
              style={{ left: hitFlash.x - 20, top: hitFlash.y - 20 }}
            >
              {hitFlash.points > 0 ? `+${hitFlash.points}` : hitFlash.points}
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS SCREEN */}
        {phase === 'results' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-sm mx-4"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.5em] text-neon-cyan mb-2">
                // Mission_Complete //
              </div>
              <div className="text-5xl md:text-6xl font-black text-white mb-1">{score}</div>
              <div className={cn("text-xl font-black uppercase tracking-widest mb-6", perfRank.color)}>
                {perfRank.rank}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Accuracy</div>
                  <div className="text-2xl font-black text-white">{accuracy}%</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Avg Reaction</div>
                  <div className="text-2xl font-black text-neon-cyan">{avgReaction}ms</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Best Time</div>
                  <div className="text-2xl font-black text-neon-green">{bestReaction}ms</div>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] font-mono text-zinc-500 uppercase">Max Combo</div>
                  <div className="text-2xl font-black text-army-gold">{maxCombo}x</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="flex-1 btn-gaming py-3 text-sm flex items-center justify-center gap-2 font-black uppercase italic"
                >
                  <RotateCcw className="w-4 h-4" /> RETRY
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm border-2 border-zinc-700 text-zinc-300 hover:border-army-gold hover:text-army-gold transition-colors rounded font-black uppercase italic"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      {phase === 'playing' && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-army-black text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          <span>Hits: <span className="text-neon-green">{hits}</span></span>
          <span>Misses: <span className="text-red-400">{misses}</span></span>
          <span>Accuracy: <span className="text-white">{accuracy}%</span></span>
        </div>
      )}
    </motion.div>
  );
};
