/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { CheckCircle2, BookOpen, Award, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SharedNavbar } from './SharedNavbar';
import { SharedFooter } from './SharedFooter';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { cn } from './lib/utils';

const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

const playSound = (url: string, volume = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
};

const ASVABQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [categoryScores, setCategoryScores] = useState({ AR: 0, MK: 0, WK: 0, PC: 0 });

  const questions = [
    { q: "A convoy travels at 60 mph for 2.5 hours. How far does it travel?", options: ['120 miles', '150 miles', '180 miles', '200 miles'], correct: '150 miles', module: 'Arithmetic_Reasoning', cat: 'AR' },
    { q: "If a tactical vest costs $200 after a 20% discount, what was the original price?", options: ['$220', '$240', '$250', '$280'], correct: '$250', module: 'Arithmetic_Reasoning', cat: 'AR' },
    { q: "A recipe for MREs calls for 2 cups of water for 4 servings. How many cups for 10 servings?", options: ['4 cups', '5 cups', '6 cups', '8 cups'], correct: '5 cups', module: 'Arithmetic_Reasoning', cat: 'AR' },
    { q: "A recruit runs 3 miles in 24 minutes. What is their average pace per mile?", options: ['7 minutes', '8 minutes', '9 minutes', '10 minutes'], correct: '8 minutes', module: 'Arithmetic_Reasoning', cat: 'AR' },
    { q: "If 4 engineers can build a bridge in 6 days, how many days would it take 3 engineers?", options: ['7 days', '8 days', '9 days', '10 days'], correct: '8 days', module: 'Arithmetic_Reasoning', cat: 'AR' },
    { q: "Solve for x: 3x + 5 = 20", options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'], correct: 'x = 5', module: 'Mathematics_Knowledge', cat: 'MK' },
    { q: "What is the square root of 144?", options: ['10', '12', '14', '16'], correct: '12', module: 'Mathematics_Knowledge', cat: 'MK' },
    { q: "If x = 3 and y = 4, what is x² + y²?", options: ['14', '21', '25', '49'], correct: '25', module: 'Mathematics_Knowledge', cat: 'MK' },
    { q: "Simplify: 2(3x - 4) + 5", options: ['6x - 3', '6x + 1', '5x - 3', '6x - 8'], correct: '6x - 3', module: 'Mathematics_Knowledge', cat: 'MK' },
    { q: "What is the area of a circle with radius 5?", options: ['10π', '15π', '20π', '25π'], correct: '25π', module: 'Mathematics_Knowledge', cat: 'MK' },
    { q: "\"Abundant\" most nearly means:", options: ['Scarce', 'Plentiful', 'Heavy', 'Light'], correct: 'Plentiful', module: 'Word_Knowledge', cat: 'WK' },
    { q: "\"Conceal\" most nearly means:", options: ['Reveal', 'Hide', 'Search', 'Find'], correct: 'Hide', module: 'Word_Knowledge', cat: 'WK' },
    { q: "\"Diligent\" most nearly means:", options: ['Lazy', 'Hardworking', 'Careless', 'Quick'], correct: 'Hardworking', module: 'Word_Knowledge', cat: 'WK' },
    { q: "\"Obsolete\" most nearly means:", options: ['Modern', 'Outdated', 'Useful', 'Broken'], correct: 'Outdated', module: 'Word_Knowledge', cat: 'WK' },
    { q: "\"Peculiar\" most nearly means:", options: ['Normal', 'Unusual', 'Strong', 'Weak'], correct: 'Unusual', module: 'Word_Knowledge', cat: 'WK' },
    { q: "Read: \"The primary objective of camouflage is to blend in with the environment, confusing the enemy's observation.\" What is the main goal of camouflage?", options: ['To look intimidating', 'To confuse enemy observation', 'To stay warm', 'To signal allies'], correct: 'To confuse enemy observation', module: 'Paragraph_Comprehension', cat: 'PC' },
    { q: "Read: \"Maintenance checks must be performed weekly. Fluid levels are checked daily before operation.\" When are fluid levels checked?", options: ['Weekly', 'Monthly', 'Daily', 'Annually'], correct: 'Daily', module: 'Paragraph_Comprehension', cat: 'PC' },
    { q: "Read: \"Effective leaders prioritize the well-being of their squad above their own comfort.\" What does an effective leader prioritize?", options: ['Their own comfort', 'Mission speed', 'Squad well-being', 'Equipment maintenance'], correct: 'Squad well-being', module: 'Paragraph_Comprehension', cat: 'PC' },
    { q: "Read: \"Physical training (PT) is mandatory every morning at 0600, except on Sundays.\" When is PT NOT required?", options: ['0600', 'Mondays', 'Saturdays', 'Sundays'], correct: 'Sundays', module: 'Paragraph_Comprehension', cat: 'PC' },
    { q: "Read: \"A compass and a topographical map are essential for manual land navigation.\" What is required for land navigation?", options: ['GPS', 'Radio', 'Compass and map', 'Flashlight'], correct: 'Compass and map', module: 'Paragraph_Comprehension', cat: 'PC' }
  ];

  const handleAnswer = (opt: string) => {
    const currentQ = questions[currentQuestion];

    if (opt === currentQ.correct) {
      setCategoryScores(prev => ({
        ...prev,
        [currentQ.cat]: prev[currentQ.cat as keyof typeof prev] + 1
      }));
      playSound(SOUNDS.SUCCESS, 0.2);
    } else {
      playSound(SOUNDS.CLICK, 0.2);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setShowResult(false);
    setCategoryScores({ AR: 0, MK: 0, WK: 0, PC: 0 });
  };

  const VE = categoryScores.WK + categoryScores.PC;
  const rawAFQT = (2 * VE) + categoryScores.AR + categoryScores.MK;
  const afqtScore = rawAFQT > 0 ? Math.max(1, Math.min(99, Math.round((rawAFQT / 30) * 99))) : 0;

  const getRank = (score: number) => {
    if (score >= 93) return { name: 'CATEGORY I', color: 'text-purple-500', sub: 'ELITE_TIER (93-99)', msg: 'Outstanding. You qualify for all MOS options, including elite Cyber and Special Operations.' };
    if (score >= 65) return { name: 'CATEGORY II', color: 'text-blue-500', sub: 'ADVANCED_TIER (65-92)', msg: 'Excellent score. You have strong potential for intelligence, medical, and technical roles.' };
    if (score >= 50) return { name: 'CATEGORY IIIA', color: 'text-green-500', sub: 'STRONG_TIER (50-64)', msg: 'Solid performance. You qualify for a wide variety of combat and support roles.' };
    if (score >= 31) return { name: 'CATEGORY IIIB', color: 'text-army-gold', sub: 'QUALIFIED (31-49)', msg: 'You passed. You meet the standard enlistment criteria for many critical Army roles.' };
    if (score >= 16) return { name: 'CATEGORY IV', color: 'text-orange-500', sub: 'ETP_REQUIRED (16-30)', msg: 'Waiver territory. You may qualify under an Exception to Policy (ETP). Contact a recruiter.' };
    return { name: 'CATEGORY V', color: 'text-red-500', sub: 'DISQUALIFIED (0-15)', msg: 'Currently disqualified. Study up on Arithmetic, Math, and Reading Comprehension and try again.' };
  };

  const rank = getRank(afqtScore);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-7xl font-black mb-8 uppercase italic tracking-tighter">TACTICAL <span className="text-army-gold">SIMULATION</span></h2>
            <p className="text-zinc-400 text-xl mb-10 leading-relaxed font-bold uppercase tracking-tight mx-auto lg:mx-0 max-w-2xl">
              The ASVAB is your skill-tree assessment. High scores unlock elite MOS roles in Cyber, Intel, and Special Ops.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-xl mx-auto lg:mx-0">
              {['Arithmetic Reasoning', 'Math Knowledge', 'Word Knowledge', 'Paragraph Comp'].map(item => (
                <div key={item} className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800">
                  <CheckCircle2 className="text-army-gold w-6 h-6" />
                  <span className="font-black uppercase tracking-tight italic">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={() => {
                  document.getElementById('asvab-quiz')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-gaming text-xl px-12"
              >
                Start Simulation
              </button>
            </div>
          </div>
          <div className="relative" id="asvab-quiz">
            <div className="hud-border p-6 sm:p-10 border-army-gold/50 relative z-10 bg-zinc-950/50 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex flex-col items-center mb-10 text-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-army-gold rounded-full flex items-center justify-center animate-pulse">
                          <BookOpen className="text-army-black w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Module_{currentQuestion + 1} // {questions[currentQuestion].module}</h3>
                      </div>
                      <span className="text-army-gold font-mono text-xs font-black">{currentQuestion + 1}/{questions.length}</span>
                    </div>
                    <p className="text-2xl font-black mb-10 italic leading-tight uppercase tracking-tighter text-center">"{questions[currentQuestion].q}"</p>
                    <div className="grid grid-cols-1 gap-4">
                      {questions[currentQuestion].options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className="p-5 bg-army-black border-2 border-zinc-800 text-center hover:border-army-gold hover:bg-army-gold/5 transition-all font-black italic text-lg group relative"
                        >
                          {opt}
                          <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-army-gold absolute right-5 top-1/2 -translate-y-1/2" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 bg-army-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                      <Award className="text-army-black w-10 h-10" />
                    </div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2">SIMULATION <span className="text-army-gold">COMPLETE</span></h3>

                    <div className="mb-8">
                      <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-2">// EST_AFQT_SCORE //</p>
                      <div className={cn("text-8xl font-black italic tracking-tighter glow-text mb-1", rank.color)}>
                        {afqtScore}
                      </div>
                      <p className={cn("font-black text-xl uppercase tracking-widest mt-2", rank.color)}>{rank.name}</p>
                      <p className="text-white font-black text-xs uppercase tracking-widest opacity-50 mt-1">{rank.sub}</p>
                    </div>

                    <div className="p-6 bg-army-gold/10 border border-army-gold/30 mb-10">
                      <p className="text-white font-bold uppercase tracking-tight text-sm">
                        {rank.msg}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={resetQuiz}
                        className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-army-gold transition-all font-black uppercase italic text-sm tracking-widest"
                      >
                        Restart Sim
                      </button>
                      <a
                        href="#register"
                        className="btn-gaming px-8 py-4 text-sm"
                      >
                        Join the Squad
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="absolute -top-4 -left-4 w-20 h-20 border-t-4 border-l-4 border-army-gold opacity-50" />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 border-b-4 border-r-4 border-army-gold opacity-50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export const ASVABPage = ({
  onBack,
  slugParam,
}: {
  onBack: () => void;
  slugParam: string;
}) => {
  const slugQuery = slugParam ? '?r=' + slugParam : '';

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black relative">
      <div className="scanline" />
      <SharedNavbar slugParam={slugParam} onBack={onBack} />
      <main className="pt-20">
        <ASVABQuiz />
        <SharedLeadCapture slugParam={slugParam} source="asvab" title="READY TO JOIN?" subtitle="// START_YOUR_MISSION //" />
      </main>

      <SharedFooter slugParam={slugParam} />
      <FloatingCTA slugParam={slugParam} />
      <SharedChatbot slugParam={slugParam} />
    </div>
  );
};
