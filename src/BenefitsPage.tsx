/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState } from 'react';
import {
  BookOpen,
  Heart,
  DollarSign,
  Briefcase,
  Home,
  Users,
  ChevronDown,
  ChevronUp,
  Zap,
  FileText,
  MapPin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SharedFooter } from './SharedFooter';
import { SharedNavbar } from './SharedNavbar';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { AnimatePresence } from 'motion/react';

interface BenefitSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  details: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
}

export const BenefitsPage = ({
  onBack,
  slugParam,
}: {
  onBack: () => void;
  slugParam: string;
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('education');
  const slugQuery = slugParam ? '?r=' + slugParam : '';

  const benefitSections: BenefitSection[] = [
    {
      id: 'education',
      title: 'EDUCATION BENEFITS',
      icon: <BookOpen className="w-6 h-6" />,
      details: [
        {
          label: '100% Tuition Assistance',
          value: 'Full Coverage',
          description:
            'Complete tuition coverage for state universities and colleges. Covers all undergraduate and graduate programs at eligible institutions.',
        },
        {
          label: 'Federal Tuition Assistance',
          value: '$250/credit hour',
          description:
            'Up to $4,500 per fiscal year. Available for active duty and reserve members pursuing degree programs.',
        },
        {
          label: 'GI Bill Reserve Select (Ch. 1606)',
          value: '$493/month',
          description:
            'Monthly educational allowance as a full-time student. Earned upon becoming duty qualified. Rates updated annually.',
        },
        {
          label: 'GI Bill Kicker',
          value: '+$350/month',
          description:
            'Additional monthly supplement to your Montgomery GI Bill for eligible service members with specialized skills.',
        },
        {
          label: 'Student Loan Repayment Program',
          value: 'Up to $50,000',
          description:
            'Direct repayment of existing student loans as an incentive for military service. Subject to MOS eligibility.',
        },
        {
          label: 'Credentialing Assistance Program (CAP)',
          value: 'Up to $2,000/year',
          description:
            'Fund professional certifications, licenses, and industry-recognized credentials that translate to civilian careers.',
        },
      ],
    },
    {
      id: 'healthcare',
      title: 'HEALTHCARE BENEFITS',
      icon: <Heart className="w-6 h-6" />,
      details: [
        {
          label: 'TRICARE Reserve Select',
          value: '$50/month - $250/month',
          description:
            'Individual coverage at $50/month, family coverage at approximately $250/month. Comprehensive health insurance for you and dependents.',
        },
        {
          label: 'Dental Coverage (TRICARE Dental)',
          value: 'Preventive & Major',
          description:
            'Covers routine cleanings, exams, fillings, extractions, and major procedures. Two annual exams and cleanings included.',
        },
        {
          label: 'Vision Coverage (TRICARE Vision)',
          value: 'Eye Exams & Glasses',
          description:
            'Annual eye exams and coverage for prescription glasses or contact lenses. Discounts on vision correction surgery.',
        },
        {
          label: 'Mental Health Services',
          value: 'Full Coverage',
          description:
            'Unlimited counseling sessions, therapy, and psychiatric services. Includes substance abuse treatment and crisis support.',
        },
        {
          label: 'Deployment Coverage',
          value: 'Full TRICARE',
          description:
            'During active duty deployments, all service members receive full TRICARE coverage at no cost.',
        },
        {
          label: 'Preventive Care',
          value: '$0 Copay',
          description:
            'Annual physical exams, vaccinations, and preventive screenings are covered with no out-of-pocket costs.',
        },
      ],
    },
    {
      id: 'financial',
      title: 'FINANCIAL BENEFITS',
      icon: <DollarSign className="w-6 h-6" />,
      details: [
        {
          label: 'Weekend Drill Pay (E1)',
          value: '$273/weekend',
          description:
            'Entry-level private. 2 days active duty, paid as full day. Paid monthly in arrears.',
        },
        {
          label: 'Weekend Drill Pay (E3)',
          value: '$335/weekend',
          description:
            'Lance Corporal/Specialist. Increased pay for higher rank and responsibilities.',
        },
        {
          label: 'Weekend Drill Pay (E5)',
          value: '$467/weekend',
          description:
            'Sergeant. Non-commissioned officer pay tier. Weekend drill pay only.',
        },
        {
          label: 'E5 AGR Full-Time Pay (4 Years Service)',
          value: '$3,538/month',
          description:
            'Active Guard Reserve (AGR) full-time position for an E-5 with 4 years of service. Same pay and benefits as Active Duty while serving in your state.',
        },
        {
          label: 'Sign-On Bonuses',
          value: 'Up to $20,000',
          description:
            'Available for select Military Occupational Specialties (MOS). Higher bonuses for critical skills and longer commitments.',
        },
        {
          label: 'Annual Training (AT) Pay',
          value: '2 weeks full pay',
          description:
            'Full base pay during 2-week annual training period. Additional allowances for housing and meals during AT.',
        },
        {
          label: 'Housing Allowance (BAH)',
          value: 'Up to $2,400/month',
          description:
            'Basic Allowance for Housing. Qualifies only when on active duty orders (Annual Training, deployment, ADOS, etc.). Varies by location and rank.',
        },
        {
          label: 'Food Allowance (BAS)',
          value: '$450/month',
          description:
            'Basic Allowance for Subsistence. Qualifies only when on active duty orders (Annual Training, deployment, ADOS, etc.).',
        },
        {
          label: 'PX/Commissary Access',
          value: '15-25% Savings',
          description:
            'Tax-free shopping at military exchanges and commissaries with significantly discounted prices on groceries and goods.',
        },
        {
          label: 'Military Banking Benefits',
          value: '$0 Fees',
          description:
            'USAA and military banks offer no-fee checking, low-interest loans, and favorable rates for service members.',
        },
      ],
    },
    {
      id: 'career',
      title: 'CAREER DEVELOPMENT',
      icon: <Briefcase className="w-6 h-6" />,
      details: [
        {
          label: 'Leadership Training',
          value: 'Military Schools',
          description:
            'Advanced training through Noncommissioned Officer (NCO) Academy, Officer Candidate School (OCS), and specialized leadership programs.',
        },
        {
          label: 'Security Clearance',
          value: '$50K+ Civilian Value',
          description:
            'TS/SCI clearance obtained at no cost to you. Extremely valuable in private sector contracting, cybersecurity, and federal employment.',
        },
        {
          label: 'Free CDL Training',
          value: 'Class A/B License',
          description:
            'Military covers Commercial Driver License training for motor transport and logistics MOS. Transferable to civilian trucking careers.',
        },
        {
          label: 'Professional Certifications',
          value: 'Industry-Recognized',
          description:
            'Certifications in IT (CompTIA, Cisco), cybersecurity, communications, and mechanics that boost civilian career prospects.',
        },
        {
          label: 'Federal Networking',
          value: 'Direct Connections',
          description:
            'Build relationships with federal and state employers, National Guard leadership, and government agency recruiters.',
        },
        {
          label: 'Veterans Preference',
          value: '+5-10 Points',
          description:
            'Significant hiring preference for federal government jobs. Includes disability-adjusted preference. Can be decisive in competitive hiring.',
        },
        {
          label: 'Transition Assistance Program',
          value: 'Free Resources',
          description:
            'Resume workshops, interview coaching, career counseling, and job placement services for career transitions.',
        },
        {
          label: 'AGR Program (Active Guard Reserve)',
          value: 'Full-Time Military',
          description:
            'Full-time military positions within the Guard. Same pay and benefits as Active Duty soldiers. Serve your state full-time while staying local.',
        },
        {
          label: 'Federal Technician Program',
          value: 'Full-Time Federal Civilian',
          description:
            'Full-time federal civilian positions at Guard facilities. Unique dual-status opportunity: work as a federal employee Monday-Friday, drill as a Guardsman on weekends. Includes federal employee benefits (FERS retirement, health insurance, TSP).',
        },
      ],
    },
    {
      id: 'retirement',
      title: 'RETIREMENT BENEFITS',
      icon: <Home className="w-6 h-6" />,
      details: [
        {
          label: 'Blended Retirement System (BRS)',
          value: '40% Base Pay + TSP Match',
          description:
            'Under BRS, you earn 2% of your base pay per year of service (40% at 20 years). Eligible at age 60 with 20 good years. The military also matches your TSP contributions—1% automatic plus up to 4% matching (5% total). This combination of pension plus TSP provides strong retirement security.',
        },
        {
          label: 'Early Retirement Option',
          value: 'After Deployments',
          description:
            'Reduced retirement requirements available for service members with extended active duty deployments.',
        },
        {
          label: 'Thrift Savings Plan (TSP)',
          value: 'Up to 5% Match',
          description:
            'Federal retirement savings plan with low fees. Under BRS, the military automatically contributes 1% of your base pay, then matches dollar-for-dollar on your first 3% and 50 cents per dollar on the next 2%—up to 5% total government contribution. Contribute at least 5% every month to maximize the match.',
        },
        {
          label: 'TRICARE for Life (Age 65+)',
          value: 'Lifetime Coverage',
          description:
            'Secondary insurance after Medicare eligibility. Continues healthcare coverage throughout retirement at reduced costs.',
        },
        {
          label: 'Survivor Benefits Plan',
          value: 'Family Protection',
          description:
            'Ensures dependents receive annuity payments if service member passes away. Optional coverage with affordable premiums.',
        },
        {
          label: 'Medicaid/Medicare Coordination',
          value: 'Full Integration',
          description:
            'Seamless transition to Medicare at 65 with TRICARE for Life as secondary. No coverage gaps.',
        },
        {
          label: 'Dual Retirement (Federal Technicians)',
          value: 'Military + FERS',
          description:
            'If a Guardsman is also a Federal Technician, you can earn TWO retirements: military retirement (after 20 qualifying years) AND federal civilian retirement (FERS). This unique dual-retirement opportunity maximizes long-term financial security.',
        },
      ],
    },
    {
      id: 'florida-benefits',
      title: 'STATE-SPECIFIC BENEFITS',
      icon: <MapPin className="w-6 h-6" />,
      details: [
        {
          label: 'Free Vehicle Registration',
          value: 'Full Coverage',
          description:
            'Free vehicle registration for Guard members (varies by state). Significantly reduces annual vehicle costs.',
        },
        {
          label: 'Military License Plate',
          value: 'Distinctive ID',
          description:
            'Official military license plate for your vehicle. Shows your service and eligible for special parking privileges.',
        },
        {
          label: 'Military Gold Sportsman\'s License',
          value: '$20/year',
          description:
            'Hunting and fishing licenses at reduced rates for Guard members.',
        },
        {
          label: 'State Parks Discount',
          value: '25% Off + Free Pass',
          description:
            '25% discount on annual passes for state parks. Combat veterans and disabled veterans get a free-for-life Military Entrance Pass.',
        },
        {
          label: 'Federal Recreation Areas',
          value: '2,000+ Free Sites',
          description:
            'Free access to 2,000+ federal recreation areas nationwide, including National Parks, wildlife refuges, and national forests. America\'s natural treasures at no cost.',
        },
      ],
    },
    {
      id: 'travel-benefits',
      title: 'THEME PARK & TRAVEL BENEFITS',
      icon: <Briefcase className="w-6 h-6" />,
      details: [
        {
          label: 'Walt Disney World Military Salute',
          value: 'From $409',
          description:
            '4-day Park Hopper tickets starting at $409. Up to 6 tickets per household. Available to active duty, reserve, and Guard members. Blackout dates apply.',
        },
        {
          label: 'Universal Orlando Military Freedom Pass',
          value: '2-Park: $220 | 3-Park: $255',
          description:
            'Exclusive military-discounted passes for Universal Orlando. Valid through December 2026. Includes all attractions and new releases.',
        },
        {
          label: 'SeaWorld/Busch Gardens Waves of Honor',
          value: '1 Free Visit/Year',
          description:
            'Active duty and up to 3 dependents get one free admission visit per year to SeaWorld and Busch Gardens. Perfect for family outings.',
        },
        {
          label: 'Shades of Green (WDW Resort)',
          value: 'Tier-Based Pricing',
          description:
            'Military-exclusive resort at Walt Disney World with special discounted rates. Highly recommended for family vacations with premium amenities.',
        },
        {
          label: 'MWR/ITT Discount Services',
          value: 'Tax-Free Rates',
          description:
            'Morale, Welfare, and Recreation (MWR) and ITT offices offer tax-free hotel rates, discount theme park tickets, and exclusive travel packages.',
        },
        {
          label: 'Kennedy Space Center Military Discount',
          value: '$67 Adult / $58 Child',
          description:
            'Discounted admission to Kennedy Space Center. Explore America\'s space legacy at military rates.',
        },
      ],
    },
    {
      id: 'family',
      title: 'FAMILY BENEFITS',
      icon: <Users className="w-6 h-6" />,
      details: [
        {
          label: 'TRICARE for Dependents',
          value: 'Full Family Coverage',
          description:
            'Spouse and children covered under your TRICARE plan. Includes dental, vision, and all medical services.',
        },
        {
          label: 'Military OneSource',
          value: '3 Free Sessions',
          description:
            'Complimentary counseling, legal consultation, and financial advice for you and family members. No limits on topics.',
        },
        {
          label: 'Servicemembers Group Life Insurance (SGLI)',
          value: '$500,000 Coverage',
          description:
            'Up to $500,000 in life insurance coverage at $31/month, automatically deducted from your drill pay. Automatic coverage with option to decline.',
        },
        {
          label: 'Family Emergency Assistance',
          value: 'Crisis Support',
          description:
            'Financial assistance for emergency medical, housing, or dependency situations affecting military families.',
        },
        {
          label: 'Survivor Benefits',
          value: 'Dependent Annuities',
          description:
            'Monthly payments to spouse and children if service member is killed in action or dies on active duty.',
        },
        {
          label: 'Military Child Education',
          value: 'Priority Enrollment',
          description:
            'Children get priority enrollment in schools. Access to special military liaison officers for education support.',
        },
        {
          label: 'Spousal Career Resources',
          value: 'Employment Support',
          description:
            'Programs to help military spouses find portable career paths and employment opportunities nationwide.',
        },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-army-black text-army-gold relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(255, 215, 0, 0.05) 25%, rgba(255, 215, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 215, 0, 0.05) 75%, rgba(255, 215, 0, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 215, 0, 0.05) 25%, rgba(255, 215, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 215, 0, 0.05) 75%, rgba(255, 215, 0, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Shared Navbar */}
      <SharedNavbar slugParam={slugParam} onBack={onBack} />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="border hud-border bg-army-black/50 backdrop-blur-sm p-8 rounded-lg">
            <h2 className="text-2xl font-mono font-bold mb-4 text-neon-cyan">
              YOUR TACTICAL ADVANTAGE
            </h2>
            <p className="text-army-gold/90 leading-relaxed mb-4">
              The Guard isn't just a job—it's a comprehensive benefits
              package designed to strengthen your future. From education assistance to lifetime
              healthcare, retirement security to career advancement, we invest in you and your
              family.
            </p>
            <div className="flex items-center gap-2 text-neon-green text-sm font-mono">
              <Zap className="w-4 h-4" />
              <span>All benefits available immediately upon enrollment</span>
            </div>
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <div className="space-y-6">
          {benefitSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full text-left border hud-border bg-army-black/50 hover:bg-army-black/70 backdrop-blur-sm p-6 rounded-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-neon-cyan group-hover:text-neon-green transition-colors">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-mono font-bold text-army-gold group-hover:text-neon-cyan transition-colors">
                      {section.title}
                    </h3>
                  </div>
                  <div className="text-neon-cyan">
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-6 h-6" />
                    ) : (
                      <ChevronDown className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              <motion.div
                initial={false}
                animate={{
                  height: expandedSection === section.id ? 'auto' : 0,
                  opacity: expandedSection === section.id ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-l border-r border-b hud-border bg-army-black/30 backdrop-blur-sm p-6 rounded-b-lg mt-0.5 space-y-4">
                  {section.details.map((detail, detailIndex) => (
                    <motion.div
                      key={detailIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: detailIndex * 0.05 }}
                      className="border-l-2 border-neon-green pl-4 py-2"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-mono font-bold text-neon-cyan text-sm">
                          {detail.label}
                        </h4>
                        <span className="text-neon-green font-mono text-sm font-bold">
                          {detail.value}
                        </span>
                      </div>
                      {detail.description && (
                        <p className="text-army-gold/80 text-sm leading-relaxed">
                          {detail.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t hud-border text-center text-army-gold/60 text-xs font-mono space-y-2">
          <p>Benefits current as of 2026. Amounts subject to change. Contact your recruiter for the latest benefit information.</p>
        </div>
      </div>

      {/* Lead Capture */}
      <SharedLeadCapture slugParam={slugParam} source="benefits" title="READY TO LOCK IN THESE BENEFITS?" subtitle="// CLAIM_YOUR_TACTICAL_ADVANTAGE //" />

      {/* Fixed Call/Text/Email */}
      <FloatingCTA slugParam={slugParam} />

      {/* Shared AI Chatbot */}
      <SharedChatbot slugParam={slugParam} />

      {/* Footer */}
      <SharedFooter slugParam={slugParam} />
    </div>
  );
};
