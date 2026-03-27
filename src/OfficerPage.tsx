/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState } from 'react';
import { ChevronLeft, BookOpen, User, Zap, TrendingUp, Clock, DollarSign, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// react-router-dom not needed after CTA removal
import { SharedFooter } from './SharedFooter';
import { SharedNavbar } from './SharedNavbar';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { BasicTrainingGame } from './BasicTrainingGame';

export const OfficerPage = ({ onBack, slugParam }: { onBack: () => void, slugParam: string }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-army-black text-army-gold">
      {/* Shared Navbar */}
      <SharedNavbar slugParam={slugParam} onBack={onBack} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="hud-border bg-army-black border-2 p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <GuardLinkIcon size={128} className="text-neon-cyan" />
            </div>
            <h2 className="text-4xl font-bold glow-text mb-4">OFFICER PROGRAMS</h2>
            <p className="text-xl text-army-gold mb-4 max-w-3xl">
              Lead the Guard. Multiple pathways exist to earn your officer commission—whether you're in college, recently graduated, or an experienced enlisted soldier.
            </p>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-neon-green" />
                <span>FEDERALLY RECOGNIZED COMMISSION</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-neon-green" />
                <span>COMPETITIVE PAY & BENEFITS</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* OCS Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <button
            onClick={() => toggleSection('ocs')}
            className="w-full text-left"
          >
            <div className="hud-border border-2 bg-army-black p-6 hover:bg-opacity-80 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GuardLinkIcon size={28} className="text-neon-cyan group-hover:glow-text" />
                  <div>
                    <h3 className="text-2xl font-bold glow-text">OFFICER CANDIDATE SCHOOL (OCS)</h3>
                    <p className="text-sm text-army-gold mt-1">Transform from civilian/enlisted to commissioned officer</p>
                  </div>
                </div>
                <ChevronLeft size={24} className={`text-neon-cyan transform transition-transform ${expandedSection === 'ocs' ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: expandedSection === 'ocs' ? 'auto' : 0, opacity: expandedSection === 'ocs' ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="hud-border border-2 border-t-0 bg-army-black bg-opacity-50 p-6 space-y-6">
              {/* What is OCS */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Zap size={18} />
                  WHAT IS OCS?
                </h4>
                <p className="text-army-gold mb-4">
                  Officer Candidate School (OCS) is a phased, 18-month training program conducted by the Guard. You'll attend intensive training weekends, annual trainings, and academic instruction, culminating in your commissioning as a second lieutenant (O-1).
                </p>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded mb-4">
                  <p className="text-sm">
                    <strong>Federal Alternative:</strong> Fort Moore, GA offers a compressed 12-week federal OCS program—faster but requires full-time commitment.
                  </p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Target size={18} />
                  REQUIREMENTS
                </h4>

                {/* Traditional OCS Requirements */}
                <div className="mb-6 p-4 bg-army-black border border-neon-green border-opacity-30 rounded">
                  <p className="text-sm font-bold text-neon-green mb-3">TRADITIONAL OCS (State / 18-Month Phased Route)</p>
                  <ul className="space-y-2 text-army-gold">
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Education:</strong> 90+ college credits (bachelor's degree NOT required)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Age:</strong> Must commission by age 42 (no waivers available)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>ASVAB/GT:</strong> GT score of 110 or higher</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Physical:</strong> Pass Army Fitness Test (AFT); valid driver's license</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Security Clearance:</strong> Secret level clearance (Top Secret for certain MOS)</span>
                    </li>
                  </ul>
                </div>

                {/* Federal OCS Requirements */}
                <div className="p-4 bg-army-black border border-neon-cyan border-opacity-30 rounded">
                  <p className="text-sm font-bold text-neon-cyan mb-3">FEDERAL OCS (12-Week Compressed Program)</p>
                  <ul className="space-y-2 text-army-gold">
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Education:</strong> Bachelor's degree (or within 2 semesters of completion)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Age:</strong> Must commission by age 34 (waivers available up to age 39)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>ASVAB/GT:</strong> GT score of 110 or higher</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Physical:</strong> Pass Army Fitness Test (AFT); valid driver's license</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-neon-green">✓</span>
                      <span><strong>Security Clearance:</strong> Secret level clearance (Top Secret for certain MOS)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Timeline & Phases */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  18-MONTH TIMELINE
                </h4>
                <div className="space-y-3">
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">PHASE 0 — Recruitment & Selection (0–3 months)</p>
                    <p className="text-sm text-army-gold mt-1">PHA, physicals, security paperwork, GT scoring, background investigation</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">PHASE 1 — Resident Candidate (3–12 months)</p>
                    <p className="text-sm text-army-gold mt-1">Drill weekends at Camp Blanding (monthly), distance learning, PT standards, military science curriculum</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">PHASE 2 — Advanced Training (12–16 months)</p>
                    <p className="text-sm text-army-gold mt-1">2-week Annual Training (AT) at Camp Blanding, leadership labs, land navigation, tactical instruction</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">PHASE 3 — Commissioning (16–18 months)</p>
                    <p className="text-sm text-army-gold mt-1">Final assessments, commissioning ceremony, assignment to unit or branch school</p>
                  </div>
                </div>
              </div>

              {/* Pay & Benefits */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <DollarSign size={18} />
                  PAY DURING TRAINING
                </h4>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded mb-4">
                  <p className="text-2xl font-bold text-neon-green mb-1">~$570/drill weekend</p>
                  <p className="text-sm text-army-gold">E-6 rate with under 2 years of service (3-day drill = 6 UTAs)</p>
                  <p className="text-xs text-army-gold mt-2">Plus housing allowance (BAH) and meal allowance (BAS) during Annual Training periods</p>
                </div>
              </div>

              {/* Career Paths — Army Branches */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <TrendingUp size={18} />
                  ARMY BRANCHES (Career Paths After Commission)
                </h4>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded mb-4">
                  <p className="text-sm font-bold text-neon-green mb-1">BOLC (Basic Officer Leader Course)</p>
                  <p className="text-sm text-army-gold">After commissioning, all new officers attend BOLC—a branch-specific training course (typically 4–6 months) that teaches you the skills for your chosen career field. Tap any branch below to learn more.</p>
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'infantry', name: 'Infantry', desc: 'The backbone of the Army. Infantry officers lead soldiers in ground combat operations—patrolling, securing areas, and engaging the enemy. Think of it as leading the team on the front lines.' },
                    { id: 'armor', name: 'Armor', desc: 'Officers lead tank and armored vehicle crews in ground combat. You command heavy firepower on the battlefield—tanks, Bradley Fighting Vehicles, and Strykers.' },
                    { id: 'field-artillery', name: 'Field Artillery', desc: 'You direct cannons, rockets, and missile systems to support ground troops from a distance. Artillery officers plan fire missions and coordinate with other units to deliver precise firepower.' },
                    { id: 'air-defense', name: 'Air Defense Artillery', desc: 'Protect troops and critical assets from aerial threats like enemy aircraft, drones, and missiles. You operate advanced radar and missile defense systems.' },
                    { id: 'aviation', name: 'Aviation', desc: 'Lead helicopter and fixed-wing units. Aviation officers can be pilots or manage flight operations, maintenance, and air traffic. The Guard will pay for flight school if you go the pilot route.' },
                    { id: 'engineers', name: 'Corps of Engineers', desc: 'Build bridges, clear obstacles, construct fortifications, and handle demolitions. Engineer officers lead construction and combat engineering missions—both building things up and taking them down.' },
                    { id: 'signal', name: 'Signal Corps', desc: 'Keep the Army connected. Signal officers manage communication networks, radios, satellites, and IT systems. In today\'s military, every operation depends on secure, reliable communications.' },
                    { id: 'cyber', name: 'Cyber', desc: 'Defend military networks and conduct offensive cyber operations. One of the newest and fastest-growing branches—cyber officers protect the Army from hackers and digital threats.' },
                    { id: 'mi', name: 'Military Intelligence', desc: 'Gather, analyze, and distribute critical information about the enemy and battlefield. Intelligence officers help commanders make informed decisions by providing the bigger picture.' },
                    { id: 'mp', name: 'Military Police', desc: 'Enforce military law, provide security, and manage detainee operations. MP officers also handle criminal investigations and force protection—think of it as law enforcement for the military.' },
                    { id: 'chemical', name: 'Chemical, Biological, Radiological & Nuclear (CBRN)', desc: 'Protect troops from weapons of mass destruction. CBRN officers detect, identify, and decontaminate chemical, biological, radiological, and nuclear hazards.' },
                    { id: 'transportation', name: 'Transportation Corps', desc: 'Move troops, equipment, and supplies where they need to go. Transportation officers manage logistics convoys, shipping operations, and movement planning.' },
                    { id: 'quartermaster', name: 'Quartermaster Corps', desc: 'Supply the Army. Quartermaster officers manage food, water, fuel, clothing, and equipment distribution—making sure soldiers have what they need to fight and survive.' },
                    { id: 'ordnance', name: 'Ordnance Corps', desc: 'Maintain and manage weapons, ammunition, and explosives. Ordnance officers keep the Army\'s equipment combat-ready and handle explosive ordnance disposal (EOD).' },
                    { id: 'finance', name: 'Finance Corps', desc: 'Manage the Army\'s money. Finance officers handle military pay, budgets, accounting, and financial management—making sure soldiers get paid and units stay funded.' },
                    { id: 'ag', name: 'Adjutant General Corps', desc: 'Human resources for the Army. AG officers manage personnel records, promotions, awards, and administrative operations—keeping the people side of the Army running.' },
                    { id: 'medical', name: 'Army Medical Department (AMEDD)', desc: 'Provide healthcare to soldiers and their families. Medical officers include doctors, nurses, physician assistants, and medical administrators. Multiple specialties available.' },
                    { id: 'jag', name: 'Judge Advocate General (JAG) Corps', desc: 'The Army\'s lawyers. JAG officers handle military justice, legal assistance, and international law. Requires a law degree and bar admission.' },
                    { id: 'chaplain', name: 'Chaplain Corps', desc: 'Provide spiritual guidance, counseling, and religious services to soldiers of all faiths. Chaplains are officers who serve as moral and ethical advisors to commanders.' },
                  ].map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => setExpandedBranch(expandedBranch === branch.id ? null : branch.id)}
                      className="w-full text-left"
                    >
                      <div className={`border p-3 rounded transition-all ${expandedBranch === branch.id ? 'border-neon-cyan bg-army-black/80' : 'border-army-gold border-opacity-20 hover:border-army-gold/50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-army-gold">{branch.name}</span>
                          <ChevronLeft size={14} className={`text-neon-cyan transform transition-transform ${expandedBranch === branch.id ? 'rotate-90' : ''}`} />
                        </div>
                        {expandedBranch === branch.id && (
                          <p className="text-xs text-army-gold/80 mt-2 leading-relaxed">{branch.desc}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ROTC/SMP Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={() => toggleSection('rotc')}
            className="w-full text-left"
          >
            <div className="hud-border border-2 bg-army-black p-6 hover:bg-opacity-80 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BookOpen size={28} className="text-neon-cyan group-hover:glow-text" />
                  <div>
                    <h3 className="text-2xl font-bold glow-text">ROTC & SIMULTANEOUS MEMBERSHIP PROGRAM (SMP)</h3>
                    <p className="text-sm text-army-gold mt-1">College-to-commission pathway with Guard service</p>
                  </div>
                </div>
                <ChevronLeft size={24} className={`text-neon-cyan transform transition-transform ${expandedSection === 'rotc' ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: expandedSection === 'rotc' ? 'auto' : 0, opacity: expandedSection === 'rotc' ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="hud-border border-2 border-t-0 bg-army-black bg-opacity-50 p-6 space-y-6">
              {/* What is ROTC */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Zap size={18} />
                  WHAT IS ROTC?
                </h4>
                <p className="text-army-gold">
                  Reserve Officer Training Corps (ROTC) is a college-based officer commissioning program. You take military science courses, attend leadership labs, and graduate with an officer's commission. Many students pursue a 4-year scholarship covering tuition, books, and monthly stipend.
                </p>
              </div>

              {/* What is SMP */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <User size={18} />
                  WHAT IS SMP (SIMULTANEOUS MEMBERSHIP PROGRAM)?
                </h4>
                <p className="text-army-gold mb-3">
                  SMP allows you to serve in the Guard while enrolled in ROTC. As an SMP cadet, you drill with a Guard unit monthly and earn <strong>E-5 (Sergeant) pay</strong> during drill and AT—even while still a college student.
                </p>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded">
                  <p className="text-sm font-bold text-neon-green mb-2">SMP Advantages:</p>
                  <ul className="text-sm text-army-gold space-y-1">
                    <li>• Monthly E-5 pay (~$350–500/drill weekend)</li>
                    <li>• Real Guard unit experience before commission</li>
                    <li>• ROTC scholarship + Guard tuition assistance stacking</li>
                    <li>• Upon commissioning, compete for Active Duty (Regular Army), Reserves, or Guard—you're not locked into the Guard unless you have a specific scholarship obligation</li>
                    <li>• Build network with enlisted soldiers and NCOs</li>
                  </ul>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Target size={18} />
                  REQUIREMENTS
                </h4>
                <ul className="space-y-2 text-army-gold">
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Enrollment:</strong> Enrolled full-time at a 4-year university with an ROTC program</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Class Years:</strong> Freshman, sophomore, or junior at program start</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>ASVAB:</strong> Minimum score of 31+ on the ASVAB (Armed Services Vocational Aptitude Battery)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Physical:</strong> Pass a MEPS physical (Military Entrance Processing Station); meet height/weight standards</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>GPA:</strong> Maintain minimum 2.0 GPA (2.5+ for scholarships)</span>
                  </li>
                </ul>
              </div>

              {/* Schools with ROTC */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <BookOpen size={18} />
                  UNIVERSITIES WITH ROTC PROGRAMS
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-army-gold">
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">University of Florida (UF)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Florida State University (FSU)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">University of Central Florida (UCF)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Florida International University (FIU)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">University of South Florida (USF)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Florida Atlantic University (FAU)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">University of Miami (UM)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Nova Southeastern University (NSU)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Palm Beach State College (PBSC)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Palm Beach Atlantic University (PBA)</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Broward College</div>
                  <div className="border border-army-gold border-opacity-20 p-3 rounded">Miami Dade College (MDC)</div>
                </div>
              </div>

              {/* Commissioning */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  COMMISSIONING
                </h4>
                <p className="text-army-gold mb-3">
                  Upon graduation and successful completion of ROTC requirements, you'll be commissioned as a Second Lieutenant (O-1). You can commission into the Guard, the Army Reserves, or Active Duty Army (Regular Army). You're not locked into the Guard unless you have a specific scholarship obligation that requires it.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Warrant Officer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => toggleSection('warrant')}
            className="w-full text-left"
          >
            <div className="hud-border border-2 bg-army-black p-6 hover:bg-opacity-80 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Zap size={28} className="text-neon-cyan group-hover:glow-text" />
                  <div>
                    <h3 className="text-2xl font-bold glow-text">WARRANT OFFICER</h3>
                    <p className="text-sm text-army-gold mt-1">Technical expert and bridge between enlisted and commissioned ranks</p>
                  </div>
                </div>
                <ChevronLeft size={24} className={`text-neon-cyan transform transition-transform ${expandedSection === 'warrant' ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: expandedSection === 'warrant' ? 'auto' : 0, opacity: expandedSection === 'warrant' ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="hud-border border-2 border-t-0 bg-army-black bg-opacity-50 p-6 space-y-6">
              {/* What is a Warrant Officer */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <GuardLinkIcon size={18} />
                  WHAT IS A WARRANT OFFICER?
                </h4>
                <p className="text-army-gold mb-4">
                  Warrant Officers (W1–W5) are highly skilled technical experts who bridge the gap between enlisted personnel and commissioned officers. They command respect through specialized expertise in their field—whether aviation, cyber, maintenance, HR, or other critical MOS areas.
                </p>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded">
                  <p className="text-sm text-neon-green font-bold mb-1">Key Role:</p>
                  <p className="text-sm text-army-gold">Subject matter expert, technical leader, trainer, and advisor to commanders</p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Target size={18} />
                  REQUIREMENTS
                </h4>
                <ul className="space-y-2 text-army-gold">
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Service:</strong> Minimum 5+ years of service in the same or related MOS</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>ASVAB/GT:</strong> GT score of 110 or higher</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Performance:</strong> Excellent evaluation record; at least E-5 (Sergeant)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Recommendation:</strong> Endorsement from chain of command (Brigade S-1 or higher)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Age:</strong> Under 54 years old (few exceptions)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Physical:</strong> Pass Army Fitness Test (AFT); meet height/weight standards</span>
                  </li>
                </ul>
              </div>

              {/* WOCS Training */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Clock size={18} />
                  WARRANT OFFICER CANDIDATE SCHOOL (WOCS)
                </h4>
                <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded mb-4">
                  <p className="text-neon-green font-bold mb-2">Duration: 5 weeks intensive</p>
                  <p className="text-sm text-army-gold mb-2">
                    <strong>Location:</strong> Fort Rucker (now Fort Novosel), Alabama
                  </p>
                  <p className="text-sm text-army-gold">
                    Intensive leadership, military science, and technical certification training. Physical and mental challenges prepare you for warrant officer responsibilities.
                  </p>
                </div>
              </div>

              {/* Warrant MOS Options */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <Target size={18} />
                  FLORIDA GUARD WARRANT OFFICER MOS OPTIONS
                </h4>
                <div className="space-y-3">
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">153A — Helicopter Pilot</p>
                    <p className="text-sm text-army-gold mt-1">The marquee warrant role. The Guard will pay for your flight school (full-time investment, ~$1M value).</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">170A — Cyber Operations</p>
                    <p className="text-sm text-army-gold mt-1">Advanced cyber security and network defense roles.</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">420A — Human Resources</p>
                    <p className="text-sm text-army-gold mt-1">Personnel management, military law, and benefits administration.</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">915A — Maintenance Management</p>
                    <p className="text-sm text-army-gold mt-1">Equipment and vehicle systems expertise.</p>
                  </div>
                  <div className="bg-army-black border border-neon-green border-opacity-30 p-4 rounded">
                    <p className="font-bold text-neon-green">Other Specialties</p>
                    <p className="text-sm text-army-gold mt-1">Medical, supply, intelligence, and communications warrant roles also available.</p>
                  </div>
                </div>
              </div>

              {/* Pay */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <DollarSign size={18} />
                  WARRANT OFFICER DRILL PAY
                </h4>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded mb-4">
                  <p className="text-2xl font-bold text-neon-green mb-1">~$500–600/drill weekend</p>
                  <p className="text-sm text-army-gold">W-1 (Warrant Officer 1) starting drill pay (4 UTAs per weekend)</p>
                  <p className="text-xs text-army-gold mt-2">Increases with rank: W-1, W-2, W-3, W-4, W-5 (Chief Warrant Officer 5). Plus BAH and BAS during Annual Training and deployment.</p>
                </div>
              </div>

              {/* Flight Warrant */}
              <div>
                <h4 className="text-lg font-bold text-neon-cyan mb-3 flex items-center gap-2">
                  <TrendingUp size={18} />
                  FLIGHT WARRANT PROGRAM (HELICOPTER PILOT)
                </h4>
                <p className="text-army-gold mb-3">
                  The premier warrant officer track. Selected candidates attend full-time flight training—the Guard covers all costs (~$1 million invested in your training).
                </p>
                <div className="bg-army-black border border-neon-cyan border-opacity-30 p-4 rounded text-sm">
                  <p className="text-neon-green font-bold mb-2">Timeline:</p>
                  <ul className="text-army-gold space-y-1">
                    <li>• Primary flight training: ~18 months</li>
                    <li>• Instrument & advanced training: 6–9 months</li>
                    <li>• Unit assignment & operational training: Ongoing</li>
                    <li>• Total to fully qualified pilot: ~2–3 years</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold glow-text mb-6 flex items-center gap-2">
            <GuardLinkIcon size={24} />
            COMPARE YOUR OPTIONS
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* OCS Card */}
            <div className="hud-border border-2 bg-army-black p-6 flex flex-col">
              <div className="border-b border-neon-cyan/30 pb-4 mb-4">
                <h4 className="text-xl font-bold text-neon-cyan mb-1">OCS</h4>
                <p className="text-xs text-army-gold opacity-70">Officer Candidate School</p>
              </div>
              <div className="space-y-4 text-sm text-army-gold flex-1">
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Education</p>
                  <p>90+ college credits</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Prior Service</p>
                  <p>Not required (civilian OK)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Time to Commission</p>
                  <p>18 months (phased)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Drill Pay During Training</p>
                  <p className="text-neon-green font-bold">E-6 rate (~$570/weekend)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Commitment</p>
                  <p>Part-time (drill weekends)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Scholarship</p>
                  <p>Tuition assistance post-commission</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">GT Score</p>
                  <p>110+</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neon-cyan/20">
                <p className="text-xs text-neon-green font-bold">BEST FOR: College grads seeking fast commission</p>
              </div>
            </div>

            {/* ROTC / SMP Card */}
            <div className="hud-border border-2 bg-army-black p-6 flex flex-col">
              <div className="border-b border-neon-cyan/30 pb-4 mb-4">
                <h4 className="text-xl font-bold text-neon-cyan mb-1">ROTC / SMP</h4>
                <p className="text-xs text-army-gold opacity-70">Simultaneous Membership Program</p>
              </div>
              <div className="space-y-4 text-sm text-army-gold flex-1">
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Education</p>
                  <p>4-year enrollment required</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Prior Service</p>
                  <p>Not required (civilian OK)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Time to Commission</p>
                  <p>4 years (college)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Drill Pay During Training</p>
                  <p className="text-neon-green font-bold">E-5 rate (~$470/weekend)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Commitment</p>
                  <p>Part-time (ROTC + Guard drills)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Scholarship</p>
                  <p>ROTC scholarship stacks with Guard TA</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">GT Score</p>
                  <p>None</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neon-cyan/20">
                <p className="text-xs text-neon-green font-bold">BEST FOR: Current students; dual Guard/college path</p>
              </div>
            </div>

            {/* Warrant Officer Card */}
            <div className="hud-border border-2 bg-army-black p-6 flex flex-col">
              <div className="border-b border-neon-cyan/30 pb-4 mb-4">
                <h4 className="text-xl font-bold text-neon-cyan mb-1">WARRANT OFFICER</h4>
                <p className="text-xs text-army-gold opacity-70">Technical Expert Track</p>
              </div>
              <div className="space-y-4 text-sm text-army-gold flex-1">
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Degree</p>
                  <p>Not required</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Prior Service</p>
                  <p>5+ years enlisted required</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Time to Commission</p>
                  <p>5 weeks + current service</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Drill Pay</p>
                  <p className="text-neon-green font-bold">~$500–600/weekend (W-1)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Commitment</p>
                  <p>Part-time (except flight training)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">Scholarship</p>
                  <p>Flight school fully funded (153A)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider mb-1">GT Score</p>
                  <p>110+</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neon-cyan/20">
                <p className="text-xs text-neon-green font-bold">BEST FOR: Experienced enlisted seeking leadership</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WHO SHOULD CONSIDER Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold glow-text mb-6 flex items-center gap-2">
            <Target size={24} />
            WHO SHOULD CONSIDER OFFICER PROGRAMS?
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Current College Students */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hud-border border-2 bg-army-black p-6 group cursor-pointer hover:bg-opacity-80 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <BookOpen size={28} className="text-neon-cyan group-hover:glow-text" />
                <h4 className="text-lg font-bold text-neon-green">Current College Students</h4>
              </div>
              <p className="text-sm text-army-gold mb-4">
                Enroll in ROTC at your university. Better yet, join SMP and drill with a Guard unit monthly while earning E-5 pay and stacking scholarships.
              </p>
              <p className="text-xs text-neon-cyan font-bold">→ BEST PATH: ROTC + SMP</p>
            </motion.div>

            {/* Recent College Graduates */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hud-border border-2 bg-army-black p-6 group cursor-pointer hover:bg-opacity-80 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={28} className="text-neon-cyan group-hover:glow-text" />
                <h4 className="text-lg font-bold text-neon-green">Recent Graduates</h4>
              </div>
              <p className="text-sm text-army-gold mb-4">
                You have your degree; now lead. OCS is your pathway—18 months of phased training, then commission and assignment to a Guard unit.
              </p>
              <p className="text-xs text-neon-cyan font-bold">→ BEST PATH: OCS (State or Federal)</p>
            </motion.div>

            {/* Experienced Enlisted */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hud-border border-2 bg-army-black p-6 group cursor-pointer hover:bg-opacity-80 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <GuardLinkIcon size={28} className="text-neon-cyan group-hover:glow-text" />
                <h4 className="text-lg font-bold text-neon-green">Experienced Enlisted</h4>
              </div>
              <p className="text-sm text-army-gold mb-4">
                You've served 5+ years. Warrant Officer is your next step—leverage your technical expertise and lead at the highest enlisted/warrant level. Flight training available.
              </p>
              <p className="text-xs text-neon-cyan font-bold">→ BEST PATH: WARRANT OFFICER</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="mb-8 text-center text-xs text-army-gold opacity-50">
          <p>All pay figures are approximate and based on current military pay scales. Benefits and programs subject to change.</p>
        </div>
      </div>

      {/* Fixed Call/Text/Email */}
      <SharedLeadCapture slugParam={slugParam} source="officers" title="READY TO LEAD?" subtitle="// COMMISSION_YOUR_FUTURE //" />

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

      {/* Shared Footer */}
      <SharedFooter slugParam={slugParam} />
    </div>
  );
};
