/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SharedFooter } from './SharedFooter';
import { SharedNavbar } from './SharedNavbar';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { BasicTrainingGame } from './BasicTrainingGame';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'GETTING STARTED',
    items: [
      {
        question: 'What is the Army National Guard?',
        answer: 'The Army National Guard is a state military force that operates under both state and federal authority. Members serve their communities during emergencies and natural disasters while maintaining combat readiness. As a dual-status force, you\'ll support your state when needed and the nation when called upon by the President. It\'s a powerful way to serve with flexibility that fits your civilian life.'
      },
      {
        question: 'What\'s the difference between the National Guard, Army Reserve, and Active Duty?',
        answer: 'The Guard serves primarily at the state level and can be activated by the Governor for state emergencies, or by the President for federal deployment. The Army Reserve is a federal force primarily deployed for national defense and overseas operations. Active Duty soldiers are full-time military personnel with permanent stations. The Guard offers the best of both worlds—serve your state and nation with part-time commitment that allows you to maintain your civilian career.'
      },
      {
        question: 'Can I join if I\'m already in college?',
        answer: 'Absolutely! Many of our soldiers are college students. The Guard offers 100% Tuition Assistance to help pay for college courses, and our drill schedule (typically one weekend per month) is designed to work around academic calendars. You can balance both education and military service, making it easier to graduate debt-free while developing leadership skills.'
      },
      {
        question: 'What\'s the time commitment?',
        answer: 'As a part-time soldier, you\'ll commit to one weekend per month (typically Friday evening through Sunday) for drill and training, plus two weeks per year for Annual Training. That\'s roughly 38 days per year. Beyond that, you\'re free to pursue your civilian career, education, or personal goals. This part-time structure makes it possible to maintain your job or college enrollment while serving.'
      }
    ]
  },
  {
    title: 'ELIGIBILITY',
    items: [
      {
        question: 'What are the age requirements?',
        answer: 'You must be between 17 and 42 years old to enlist (parental consent required if under 18). The guidelines were recently updated to raise the maximum age to 42 for all components. The best time to join is now — younger soldiers have more time to develop careers and advance through ranks.'
      },
      {
        question: 'Do I need a high school diploma?',
        answer: 'A high school diploma or GED is required to enlist in the Guard. If you don\'t have either, you may still be eligible if you pass specific tests, but a diploma or GED significantly improves your prospects and opens more job opportunities within the military.'
      },
      {
        question: 'What if I have a criminal record?',
        answer: 'Any criminal history is reviewed on a case-by-case basis. Felonies typically disqualify you, but misdemeanors may not. Traffic violations and minor offenses usually don\'t prevent enlistment. If you have concerns about your background, speak with a recruiter who can explain how the waiver process works and whether you\'re eligible to serve.'
      },
      {
        question: 'What if I\'m not a US citizen?',
        answer: 'You must be a U.S. citizen or permanent resident (green card holder) to enlist in the Guard. If you\'re in the process of becoming a citizen, talk to a recruiter about your timeline. Military service can actually accelerate your path to citizenship.'
      },
      {
        question: 'What are the physical/weight requirements?',
        answer: 'You must pass a physical fitness test and meet height-to-weight standards based on military guidelines. This ensures you\'re healthy enough for the demands of training and service. The standards are clear and achievable. If you\'re concerned about meeting them, start training now—recruiters can provide fitness guidance to prepare you.'
      },
      {
        question: 'Can I join if I\'m on medication?',
        answer: 'Most medications don\'t disqualify you, but a Military Entrance Processing Station (MEPS) doctor will review your medical history. Some medications (especially for mental health conditions) may require a waiver. Be honest during the medical review—hidden medical conditions discovered later can result in discharge. Your recruiter can explain what to expect.'
      }
    ]
  },
  {
    title: 'FOR PARENTS',
    items: [
      {
        question: 'Is my child going to be deployed overseas?',
        answer: 'As a Guard member, your child serves primarily at the state level. Overseas deployments happen, but they\'re not the default. State activations (for hurricanes, floods, emergency response) are more common. If a federal deployment does occur, it\'s typically announced with time for preparation. Discuss these possibilities with your recruit so everyone understands the commitment.'
      },
      {
        question: 'Can they still go to college full-time?',
        answer: 'Yes! In fact, the Guard supports full-time college enrollment. With 100% Tuition Assistance covering federal tuition and fees, your child can attend college while serving. The monthly drill schedule is designed to fit around academic calendars, and many universities offer priority scheduling for military students.'
      },
      {
        question: 'What happens if there\'s a natural disaster?',
        answer: 'If a hurricane, flood, or other disaster strikes your state, the Governor may activate the Guard for emergency response. Your child could be called to duty to help evacuate residents, distribute aid, restore power, and provide security. This is exactly the kind of meaningful service the Guard provides—protecting neighbors and community.'
      },
      {
        question: 'How will this affect their civilian career?',
        answer: 'The Uniformed Services Employment and Reemployment Rights Act (USERRA) protects military service members\' civilian jobs. Employers must allow you to return to your position after duty. Many employers actually value military service—it demonstrates discipline, leadership, and commitment. The skills and experience gained often enhance career prospects significantly.'
      },
      {
        question: 'What benefits does my family get?',
        answer: 'Your child\'s family can access TRICARE health insurance at very low rates, providing comprehensive medical, dental, and vision coverage. Families also benefit from financial stability through military pay, and access to military discounts. In the event of deployment, military family support programs provide counseling and financial assistance.'
      }
    ]
  },
  {
    title: 'PAY & BENEFITS',
    items: [
      {
        question: 'How much does a drill weekend pay?',
        answer: 'Pay depends on rank and years of service. An E1 (recruit) makes approximately $250–$300 for a weekend drill (typically 2–3 days). As you advance, pay increases. E5s earn roughly $600–$700 per weekend. A typical drill weekend includes meals, lodging, and all training—the military covers your costs while you earn. After 20 years of service, you become eligible for retirement pay.'
      },
      {
        question: 'What is 100% Tuition Assistance?',
        answer: 'The Army provides 100% Federal Tuition Assistance (FTA) that covers tuition and fees at accredited colleges and universities (up to the DoD cap, currently $250 per semester hour). This means if you enroll in college, the military pays your tuition—no debt required. FTA can also be combined with the Education Dollars for Duty (EDD) program, which helps offset remaining costs not covered by FTA. When stacked with the GI Bill, this creates a powerful path to a degree without student loans.'
      },
      {
        question: 'What is TRICARE?',
        answer: 'TRICARE is the military health insurance program. Active Guard/Reserve and their families receive comprehensive medical, dental, and vision coverage at very low cost—often free or at minimal copays. TRICARE covers preventive care, emergency services, specialist visits, and prescription medications. It\'s one of the best health benefits available.'
      },
      {
        question: 'What bonuses are available?',
        answer: 'The Army offers enlistment bonuses for high-demand Military Occupational Specialties (jobs). These can range from $1,000 to $20,000+ depending on the specialty, education level, and current Army needs. Combat Support, Engineering, Logistics, and Medical MOS fields frequently offer substantial bonuses. Ask your recruiter about current bonus offers.'
      },
      {
        question: 'Do I get retirement benefits?',
        answer: 'Yes. Under the Blended Retirement System (BRS), after 20 years of service you\'re eligible for a retirement pension calculated at 40% of your base pay at retirement (2% per year of service), plus cost-of-living adjustments. On top of that, the military matches your Thrift Savings Plan (TSP) contributions—automatically contributing 1% of your base pay, then matching dollar-for-dollar on the first 3% you contribute and 50 cents per dollar on the next 2%, for a total government contribution of up to 5%. This combination of pension plus TSP matching provides strong retirement security. Many soldiers retire from the Guard while still young enough to pursue a second career.'
      },
      {
        question: 'What is the GI Bill and how does it work for Guard members?',
        answer: 'As a Guard member, you qualify for the Montgomery GI Bill — Selected Reserve (Chapter 1606). This benefit provides a monthly education stipend to help pay for college tuition, books, and supplies while you serve in the Selected Reserve. You become eligible after completing your Initial Active Duty for Training (IADT) and maintaining good standing in your unit. Chapter 1606 can be stacked with Federal Tuition Assistance and state education benefits, giving you a powerful combination to earn your degree with little to no student debt.'
      }
    ]
  },
  {
    title: 'ASVAB & TRAINING',
    items: [
      {
        question: 'What is the ASVAB?',
        answer: 'The ASVAB (Armed Services Vocational Aptitude Battery) is a standardized test that measures your knowledge in math, reading, science, and mechanical reasoning. Your score determines which Military Occupational Specialties (jobs) you qualify for. It\'s a fair, objective way to match your strengths to roles where you\'ll excel. Study materials are available online, and your recruiter can help you prepare.'
      },
      {
        question: 'What score do I need?',
        answer: 'You need a minimum AFQT (Armed Forces Qualification Test) score of 31 to enlist. However, most competitive jobs require scores of 50+. The higher your score, the more career options open up. If you don\'t hit your target score the first time, you can retake the test. Many soldiers study for a few weeks and improve significantly.'
      },
      {
        question: 'How long is Basic Training?',
        answer: 'Basic Combat Training (BCT) is typically 10 weeks at Fort Jackson (South Carolina), Fort Leonard Wood (Missouri), or Fort Sill (Oklahoma). During BCT, you\'ll develop foundational military skills—discipline, physical fitness, weapons handling, and team cohesion. It\'s challenging but achievable for anyone in decent health. Most soldiers say BCT was transformative.'
      },
      {
        question: 'What is AIT?',
        answer: 'Advanced Individual Training (AIT) follows Basic Training and teaches job-specific skills for your Military Occupational Specialty (MOS). Length varies by job—from 4 weeks for some roles to 6+ months for complex specialties like Intelligence or Engineering. AIT is at various locations nationwide. You\'ll live in military barracks and train with soldiers who\'ll become your unit.'
      },
      {
        question: 'What is RSP?',
        answer: 'The Recruit Sustainment Program (RSP) is a pre-Basic Training program designed to help recruits prepare physically and mentally. You\'ll attend RSP drills one weekend per month (Saturday and Sunday) during the 6–12 months before Basic Training starts. RSP includes fitness training, study sessions for the ASVAB, and early military education. Participation dramatically increases your success rate in Basic Training.'
      }
    ]
  },
  {
    title: 'CAREER & MOS',
    items: [
      {
        question: 'What jobs are available?',
        answer: 'The Guard offers 150+ Military Occupational Specialties spanning combat support, logistics, engineering, medical, communications, intelligence, administration, and more. Whether you want hands-on roles or technical positions, there\'s a career path. Availability varies based on unit needs and your ASVAB score. Your recruiter can show you current openings in your area.'
      },
      {
        question: 'Can I choose my MOS?',
        answer: 'There\'s no guarantee you\'ll get your first choice, but you can list preferences based on your ASVAB score and current Army needs. High scorers have more options. Combat support and technical MOS fields often need people badly and may offer bonuses to fill slots. If you\'re flexible and score well, you\'ll have meaningful choices.'
      },
      {
        question: 'What about Officer and Warrant Officer paths?',
        answer: 'Officers lead platoons and manage operations, requiring a bachelor\'s degree and completion of Officer Candidate School (OCS). Warrant Officers are technical experts (pilots, mechanics, communications specialists) who warrant their expertise. Both paths offer higher pay and greater responsibility. If you have a degree or are pursuing one, officer programs could be a strong fit.'
      },
      {
        question: 'Can I switch my MOS if I\'m prior service?',
        answer: 'Yes. If you\'re joining the Guard from another branch or reclassifying within the Guard, you can switch to a new MOS based on unit vacancies and your qualifications. Reclassification often comes with bonuses for high-demand specialties. You may need to attend a new AIT for the MOS, but your prior service time and rank carry over. Talk to your recruiter about what\'s available and what incentives apply.'
      },
      {
        question: 'Can I transfer my skills to a civilian career?',
        answer: 'Absolutely. Many military jobs translate directly to civilian roles—mechanics become technicians, medics become paramedics or nurses, IT specialists excel in tech careers, and leadership experience is valued everywhere. The Army also offers professional certifications (CDL, EMT, IT certs) that employers recognize. Your military service strengthens your resume significantly.'
      }
    ]
  }
];

const FAQAccordion: React.FC<{
  category: FAQCategory;
  expandedIndex: number | null;
  setExpandedIndex: (index: number | null) => void;
}> = ({ category, expandedIndex, setExpandedIndex }) => {
  return (
    <div className="mb-8">
      <h3 className="font-black uppercase tracking-tight text-2xl mb-4 text-army-gold glow-text">
        {category.title}
      </h3>
      <div className="space-y-3">
        {category.items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="hud-border bg-army-black/50 backdrop-blur-sm overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-army-black/80 transition-colors group"
            >
              <span className="font-bold uppercase tracking-tight text-left text-army-gold group-hover:glow-text transition-all">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 ml-4"
              >
                <ChevronDown className="w-5 h-5 text-neon-cyan" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-neon-cyan/30"
                >
                  <div className="px-6 py-4 bg-army-black/30 text-gray-300 text-sm leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const FAQPage = ({ onBack, slugParam }: { onBack: () => void; slugParam: string }) => {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: number | null }>({});
  const [showGame, setShowGame] = useState(false);
  const slugQuery = slugParam ? '?r=' + slugParam : '';

  const handleExpandCategory = (categoryIndex: number, itemIndex: number | null) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryIndex]: itemIndex
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-army-black text-army-gold"
    >
      {/* Shared Navbar */}
      <SharedNavbar slugParam={slugParam} onBack={onBack} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h2 className="font-black uppercase tracking-tight text-3xl sm:text-4xl mb-4 glow-text">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Got questions about joining the Guard? We've compiled answers to the most common questions about eligibility, benefits, training, and service. Can't find what you're looking for? Contact a recruiter.
          </p>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {FAQ_DATA.map((category, categoryIndex) => (
            <FAQAccordion
              key={categoryIndex}
              category={category}
              expandedIndex={expandedCategories[categoryIndex] ?? null}
              setExpandedIndex={(itemIndex) =>
                handleExpandCategory(categoryIndex, itemIndex)
              }
            />
          ))}
        </div>

      </div>

      <SharedLeadCapture slugParam={slugParam} source="faq" title="STILL HAVE QUESTIONS?" subtitle="// CONTACT_OUR_TEAM //" />

      {/* Fixed Call/Text/Email */}
      <FloatingCTA slugParam={slugParam} />

      {/* Shared AI Chatbot */}
      <SharedChatbot slugParam={slugParam} />

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

      {/* Game Overlay */}
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
    </motion.div>
  );
};
