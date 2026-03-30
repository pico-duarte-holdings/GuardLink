/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, FileText, CheckCircle, Clock, Lock, AlertTriangle,
  MessageSquare, ChevronRight, ChevronLeft, LogOut, LogIn, Loader2,
  User, Phone, Mail, Calendar, ClipboardList, FolderOpen, BarChart3,
  Bell, X, Check, Send, ShieldCheck, Eye
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  onSnapshot, collection, query, where, orderBy, doc, setDoc, getDoc,
  updateDoc, addDoc, serverTimestamp, limit, getDocs
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { cn } from './lib/utils';
import { SharedNavbar } from './SharedNavbar';
import { SharedFooter } from './SharedFooter';
import GuardLinkIcon from './GuardLinkIcon';
import { sendTransactionalEmail, emailTemplates } from './lib/brevo';

// ==============================
// Types
// ==============================
interface IntakeData {
  // Step 1 — Personal Info
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  citizenship: string;
  uscisNumber: string;
  // Step 2 — Education & Physical
  education: string;
  currentGrade: string;
  semesterHours: string;
  highSchoolName: string;
  highSchoolAddress: string;
  highSchoolPhone: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  // Step 3 — Employment & Living
  employmentStatus: string;
  companyName: string;
  companyAddress: string;
  position: string;
  jobDescription: string;
  employmentStartDate: string;
  supervisorName: string;
  maritalStatus: string;
  dependents: string;
  housingStatus: string;
  // Step 4 — Health & Legal
  medicalIssues: boolean;
  medicalDetails: string;
  tattoos: boolean;
  tattooDetails: string;
  tattooLocations: string;
  legalIssues: boolean;
  legalDetails: string;
  priorMilitary: boolean;
  priorBranch: string;
  priorDates: string;
  // Step 5 — Military Interest
  interestedMOS1: string;
  interestedMOS2: string;
  interestedMOS3: string;
  asvabTaken: string;
  asvabType: string;
  asvabDate1: string;
  asvabDate2: string;
  asvabDate3: string;
  priorRecruiter: boolean;
  priorRecruiterDetails: string;
  howHeard: string;
  questionsForRecruiter: string;
}

interface DocumentMeta {
  type: string;
  label: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
}

interface ProgressStage {
  key: string;
  label: string;
  status: 'locked' | 'current' | 'complete';
}

interface RecruiterMessage {
  id: string;
  recruiterName: string;
  text: string;
  timestamp: any;
  fromPlayer?: boolean;
}

interface Reminder {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}

// ==============================
// Constants
// ==============================

const EMPTY_INTAKE: IntakeData = {
  firstName: '', middleName: '', lastName: '', suffix: '', dob: '',
  email: '', phone: '', address: '', address2: '', city: '', state: '', zip: '',
  birthCity: '', birthState: '', birthCountry: 'United States', citizenship: 'US Citizen', uscisNumber: '',
  education: '', currentGrade: '', semesterHours: '',
  highSchoolName: '', highSchoolAddress: '', highSchoolPhone: '',
  heightFeet: '', heightInches: '', weight: '',
  employmentStatus: '', companyName: '', companyAddress: '', position: '',
  jobDescription: '', employmentStartDate: '', supervisorName: '',
  maritalStatus: '', dependents: '', housingStatus: '',
  medicalIssues: false, medicalDetails: '', tattoos: false, tattooDetails: '', tattooLocations: '',
  legalIssues: false, legalDetails: '', priorMilitary: false, priorBranch: '', priorDates: '',
  interestedMOS1: '', interestedMOS2: '', interestedMOS3: '',
  asvabTaken: '', asvabType: '', asvabDate1: '', asvabDate2: '', asvabDate3: '',
  priorRecruiter: false, priorRecruiterDetails: '', howHeard: '', questionsForRecruiter: '',
};

const DOCUMENT_TYPES = [
  { type: 'birth_certificate', label: 'Birth Certificate', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Image or PDF', required: true },
  { type: 'social_security', label: 'Social Security Card', accept: '.pdf,.jpg,.jpeg,.png', hint: 'Image or PDF', required: true },
  { type: 'drivers_license', label: "Driver's License / State ID", accept: '.pdf,.jpg,.jpeg,.png', hint: 'Image or PDF', required: false },
  { type: 'diploma_transcripts', label: 'High School Diploma or Transcripts', accept: '.pdf', hint: 'PDF required', required: false },
  { type: 'medical_records', label: 'Medical Records (if applicable)', accept: '.pdf', hint: 'PDF', required: false },
];

const PROGRESS_STAGES = [
  'Portal Access Granted',
  'Intake Form Completed',
  'Documents Uploaded',
  'ASVAB Scheduled/Completed',
  'MEPS Scheduled/Completed',
  'Contract Signed',
  'Ship Date Set',
];

const EDUCATION_LEVELS = [
  'Currently in High School',
  'High School Diploma / GED',
  'Some College',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree or Higher",
];

const GRADE_LEVELS = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];

const SUFFIXES = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

const MOS_OPTIONS = [
  '09L - Interpreter/Translator',
  '11B - Infantryman',
  '11C - Indirect Fire Infantryman',
  '12B - Combat Engineer',
  '12C - Bridge Crewmember',
  '12D - Diver',
  '12K - Plumber',
  '12M - Firefighter',
  '12N - Horizontal Construction Engineer',
  '12P - Prime Power Production Specialist',
  '12R - Interior Electrician',
  '12T - Technical Engineer',
  '12W - Carpentry and Masonry Specialist',
  '12Y - Geospatial Engineer',
  '13B - Cannon Crewmember',
  '13F - Joint Fire Support Specialist',
  '13J - Fire Control Specialist',
  '13M - MLRS/HIMARS Crewmember',
  '13R - Field Artillery Firefinder Radar Operator',
  '14E - Patriot Fire Control Enhanced Operator/Maintainer',
  '14G - Air Defense Battle Management System Operator',
  '14S - Air and Missile Defense Crewmember',
  '14T - Patriot Launching Station Enhanced Operator/Maintainer',
  '15B - Aircraft Powerplant Repairer',
  '15D - Aircraft Powertrain Repairer',
  '15E - Unmanned Aircraft Systems Repairer',
  '15F - Aircraft Electrician',
  '15G - Aircraft Structural Repairer',
  '15H - Aircraft Pneudraulics Repairer',
  '15N - Avionic Mechanic',
  '15P - Aviation Operations Specialist',
  '15Q - Air Traffic Control Operator',
  '15R - AH-64 Attack Helicopter Repairer',
  '15T - UH-60 Helicopter Repairer',
  '15U - CH-47 Helicopter Repairer',
  '15W - Unmanned Aircraft Systems Operator',
  '15Y - AH-64D Armament/Electrical/Avionics Systems Repairer',
  '17C - Cyber Operations Specialist',
  '17E - Electronic Warfare Specialist',
  '19D - Cavalry Scout',
  '19K - M1 Armor Crewman',
  '25B - Information Technology Specialist',
  '25C - Radio Operator-Maintainer',
  '25D - Cyber Network Defender',
  '25L - Cable Systems Installer-Maintainer',
  '25M - Multimedia Illustrator',
  '25N - Nodal Network Systems Operator-Maintainer',
  '25P - Microwave Systems Operator-Maintainer',
  '25Q - Multichannel Transmission Systems Operator-Maintainer',
  '25S - Satellite Communication Systems Operator-Maintainer',
  '25U - Signal Support Systems Specialist',
  '27D - Paralegal Specialist',
  '31B - Military Police',
  '31D - Criminal Investigation Special Agent',
  '31E - Internment/Resettlement Specialist',
  '31K - Military Working Dog Handler',
  '35F - Intelligence Analyst',
  '35G - Geospatial Intelligence Imagery Analyst',
  '35L - Counterintelligence Agent',
  '35M - Human Intelligence Collector',
  '35N - Signals Intelligence Analyst',
  '35P - Cryptologic Linguist',
  '35S - Signals Collector/Analyst',
  '35T - Military Intelligence Systems Maintainer/Integrator',
  '36B - Financial Management Technician',
  '37F - Psychological Operations Specialist',
  '38B - Civil Affairs Specialist',
  '42A - Human Resources Specialist',
  '42R - Musician',
  '46S - Public Affairs Specialist',
  '56M - Religious Affairs Specialist',
  '68A - Biomedical Equipment Specialist',
  '68C - Practical Nursing Specialist',
  '68D - Operating Room Specialist',
  '68E - Dental Specialist',
  '68G - Patient Administration Specialist',
  '68J - Medical Logistics Specialist',
  '68K - Medical Laboratory Specialist',
  '68P - Radiology Specialist',
  '68Q - Pharmacy Specialist',
  '68R - Veterinary Food Inspection Specialist',
  '68S - Preventive Medicine Specialist',
  '68T - Animal Care Specialist',
  '68W - Combat Medic Specialist',
  '68X - Behavioral Health Specialist',
  '74D - CBRN Specialist',
  '88H - Cargo Specialist',
  '88K - Watercraft Operator',
  '88L - Watercraft Engineer',
  '88M - Motor Transport Operator',
  '88N - Transportation Management Coordinator',
  '89B - Ammunition Specialist',
  '89D - Explosive Ordnance Disposal Specialist',
  '91A - M1 Abrams Tank System Maintainer',
  '91B - Wheeled Vehicle Mechanic',
  '91C - Utilities Equipment Repairer',
  '91D - Power-Generation Equipment Repairer',
  '91F - Small Arms/Artillery Repairer',
  '91H - Track Vehicle Repairer',
  '91J - Quartermaster and Chemical Equipment Repairer',
  '91L - Construction Equipment Repairer',
  '91M - Bradley Fighting Vehicle System Maintainer',
  '91S - Stryker Systems Maintainer',
  '92A - Automated Logistical Specialist',
  '92F - Petroleum Supply Specialist',
  '92G - Culinary Specialist',
  '92L - Petroleum Laboratory Specialist',
  '92M - Mortuary Affairs Specialist',
  '92R - Parachute Rigger',
  '92W - Water Treatment Specialist',
  '92Y - Unit Supply Specialist',
  '94E - Radio and Communications Security Repairer',
  '94F - Computer/Detection Systems Repairer',
  '94H - Test, Measurement, and Diagnostic Equipment Maintenance Support Specialist',
  'Other / Undecided',
];

const STEP_COUNT = 6;
const STEP_LABELS = ['Personal Info', 'Education & Physical', 'Employment & Living', 'Health & Legal', 'Military Interest', 'Review & Submit'];

type MobileTab = 'intake' | 'documents' | 'progress' | 'messages';

// ==============================
// Helpers
// ==============================
const calcAge = (dob: string): string => {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? String(age) : '';
};

// ==============================
// Component
// ==============================
export const PlayerDashboard = ({
  onBack,
  slugParam,
}: {
  onBack: () => void;
  slugParam: string;
}) => {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  // The player's document key used in all subcollections (UID-based after first login)
  const [playerKey, setPlayerKey] = useState<string | null>(null);

  // Intake form
  const [intakeData, setIntakeData] = useState<IntakeData>(EMPTY_INTAKE);
  const [intakeStep, setIntakeStep] = useState(1);
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [intakeSaving, setIntakeSaving] = useState(false);

  // Documents
  const [documents, setDocuments] = useState<Record<string, DocumentMeta>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Progress
  const [progressStages, setProgressStages] = useState<ProgressStage[]>([]);

  // Messages
  const [messages, setMessages] = useState<RecruiterMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Mobile nav
  const [mobileTab, setMobileTab] = useState<MobileTab>('intake');

  // Recruiter info (populated after auth check for email triggers)
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');

  // Completion
  const [completionPct, setCompletionPct] = useState(0);
  const [overallStatus, setOverallStatus] = useState('ONBOARDING_ACTIVE');

  const slugQuery = slugParam ? `?r=${slugParam}` : '';

  // ---- Firebase Auth ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  const handleSignIn = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (err) { console.error('Sign-in error:', err); }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsAuthorized(false);
    setAccessDenied(false);
    setCheckingAuth(false);
    setPlayerKey(null);
  };

  // ---- Authorization check + UID sync ----
  useEffect(() => {
    if (!user) return;
    const checkAuth = async () => {
      setCheckingAuth(true);
      try {
        const hydrateRecruiter = async (recruiterId: string) => {
          try {
            const rDoc = await getDoc(doc(db, 'users', recruiterId));
            if (rDoc.exists()) {
              const rd = rDoc.data();
              const rn = `${rd.rank || ''} ${rd.lastName || ''}`.trim() || rd.displayName || 'Your Recruiter';
              setRecruiterName(rn);
              setRecruiterEmail(rd.publicEmail || rd.email || '');
            }
          } catch { /* non-fatal */ }
        };

        // 1. Check by UID doc (fastest path after first login)
        const uidDoc = await getDoc(doc(db, 'authorized_players', user.uid));
        if (uidDoc.exists()) {
          setIsAuthorized(true);
          setPlayerKey(user.uid);
          setAccessDenied(false);
          await hydrateRecruiter(uidDoc.data().recruiterId || '');
          return;
        }
        // 2. Check by email (first-time login — no UID stored yet)
        // Normalize to lowercase to match how PlayerAccessManager stores emails
        const normalizedEmail = (user.email || '').toLowerCase().trim();
        const emailQ = query(collection(db, 'authorized_players'), where('email', '==', normalizedEmail));
        const snap = await getDocs(emailQ);
        if (!snap.empty) {
          const authDoc = snap.docs[0];
          // Sync UID into the authorized_players doc so future logins use path 1
          if (!authDoc.data().uid) {
            try { await updateDoc(authDoc.ref, { uid: user.uid }); } catch (_) { /* non-fatal */ }
          }
          setIsAuthorized(true);
          setPlayerKey(user.uid);
          setAccessDenied(false);
          await hydrateRecruiter(authDoc.data().recruiterId || '');
          return;
        }
        // 3. Not found — no access
        setAccessDenied(true);
      } catch (err) {
        console.error('Auth check error:', err);
        setAccessDenied(true);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [user]);

  // ---- Load intake data ----
  useEffect(() => {
    if (!user || !playerKey || accessDenied) return;
    const unsub = onSnapshot(doc(db, 'player_intake', playerKey), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIntakeData((prev) => ({ ...prev, ...data }));
        if (data.submitted) setIntakeSubmitted(true);
        if (data.currentStep) setIntakeStep(data.currentStep);
      }
    });
    return unsub;
  }, [user, playerKey, accessDenied]);

  // ---- Load documents ----
  useEffect(() => {
    if (!user || !playerKey || accessDenied) return;
    const unsub = onSnapshot(collection(db, 'player_documents', playerKey, 'files'), (snap) => {
      const docs: Record<string, DocumentMeta> = {};
      snap.forEach((d) => { docs[d.id] = d.data() as DocumentMeta; });
      setDocuments(docs);
    });
    return unsub;
  }, [user, playerKey, accessDenied]);

  // ---- Load progress ----
  useEffect(() => {
    if (!user || !playerKey || accessDenied) return;
    const unsub = onSnapshot(doc(db, 'player_progress', playerKey), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const idx = data.currentStage ?? 0;
        setProgressStages(PROGRESS_STAGES.map((label, i) => ({
          key: `stage_${i}`, label,
          status: i < idx ? 'complete' : i === idx ? 'current' : 'locked',
        })));
        if (data.status) setOverallStatus(data.status);
      } else {
        setProgressStages(PROGRESS_STAGES.map((label, i) => ({
          key: `stage_${i}`, label, status: i === 0 ? 'current' : 'locked',
        })));
      }
    });
    return unsub;
  }, [user, playerKey, accessDenied]);

  // ---- Load messages ----
  useEffect(() => {
    if (!user || !playerKey || accessDenied) return;
    const unsub = onSnapshot(
      query(collection(db, 'player_messages', playerKey, 'messages'), orderBy('timestamp', 'desc'), limit(50)),
      (snap) => { setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as RecruiterMessage))); }
    );
    return unsub;
  }, [user, playerKey, accessDenied]);

  // ---- Load reminders ----
  useEffect(() => {
    if (!user || !playerKey || accessDenied) return;
    const unsub = onSnapshot(collection(db, 'player_reminders', playerKey, 'items'), (snap) => {
      setReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reminder)));
    });
    return unsub;
  }, [user, playerKey, accessDenied]);

  // ---- Completion calc ----
  useEffect(() => {
    let total = 1 + DOCUMENT_TYPES.length + PROGRESS_STAGES.length;
    let done = 0;
    if (intakeSubmitted) done += 1;
    DOCUMENT_TYPES.forEach((dt) => { if (documents[dt.type]) done += 1; });
    done += progressStages.filter((s) => s.status === 'complete').length;
    setCompletionPct(total > 0 ? Math.round((done / total) * 100) : 0);

    const reqDocsUploaded = DOCUMENT_TYPES.filter(d => d.required).every(d => documents[d.type]);
    if (intakeSubmitted && reqDocsUploaded) setOverallStatus('INTAKE_COMPLETE');
    else if (Object.keys(documents).length > 0 || intakeSubmitted) setOverallStatus('DOCUMENTS_PENDING');
    else setOverallStatus('ONBOARDING_ACTIVE');
  }, [intakeSubmitted, documents, progressStages]);

  // ---- Save intake step ----
  // ---- Save intake step ----
  const saveIntakeStep = useCallback(async (step: number, data: IntakeData, submitted = false) => {
    if (!user || !playerKey) return;
    setIntakeSaving(true);
    try {
      await setDoc(doc(db, 'player_intake', playerKey), {
        ...data,
        currentStep: step,
        submitted,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      if (submitted) {
        setIntakeSubmitted(true);
        window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'form-complete' } }));

        // ── Send confirmation email to player ──────────────────────────────
        const playerEmail = user.email || '';
        const playerFullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || user.displayName || 'Recruit';
        const rName = recruiterName || 'Your Recruiter';
        const rEmail = recruiterEmail || '';
        if (playerEmail) {
          try {
            await sendTransactionalEmail({
              to: [{ email: playerEmail, name: playerFullName }],
              subject: 'Your Intake Form Has Been Received — GuardLink',
              htmlContent: emailTemplates.intakeConfirmation(playerFullName, rName),
              senderName: rName,
              senderEmail: 'support@guardlink.site',
              replyTo: rEmail || undefined,
            });
          } catch (emailErr) {
            console.warn('Intake confirmation email failed:', emailErr);
          }
        }
      }
    } catch (err) { console.error('Save error:', err); }
    setIntakeSaving(false);
  }, [user, playerKey, recruiterName, recruiterEmail]);

  // ---- Upload document ----
  const handleDocUpload = async (docType: string, file: File) => {
    if (!user || !playerKey) return;
    setUploadingDoc(docType);
    try {
      const storageRef = ref(storage, `player-documents/${playerKey}/${docType}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'player_documents', playerKey, 'files', docType), {
        type: docType,
        label: DOCUMENT_TYPES.find((d) => d.type === docType)?.label || docType,
        fileName: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      });
    } catch (err) { console.error('Upload error:', err); }
    setUploadingDoc(null);
  };

  // ---- Send reply ----
  const handleSendReply = async () => {
    if (!user || !playerKey || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await addDoc(collection(db, 'player_messages', playerKey, 'messages'), {
        recruiterName: user.displayName || 'Player',
        text: replyText.trim(),
        timestamp: serverTimestamp(),
        fromPlayer: true,
      });
      setReplyText('');
    } catch (err) { console.error('Send error:', err); }
    setSendingReply(false);
  };

  // ---- Status badge ----
  const statusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': case 'INTAKE_COMPLETE': return 'text-army-gold border-army-gold/40 bg-army-gold/10';
      case 'REJECTED': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'PENDING_REVIEW': case 'DOCUMENTS_PENDING': return 'text-white border-zinc-500 bg-zinc-700';
      default: return 'text-zinc-400 border-zinc-600 bg-zinc-800';
    }
  };

  // Shared styles
  const inputCls = "w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:border-army-gold/50 focus:outline-none transition-colors";
  const labelCls = "block text-[10px] font-mono text-zinc-500 tracking-[0.2em] mb-1.5";
  const update = (field: keyof IntakeData, value: any) => setIntakeData((prev) => ({ ...prev, [field]: value }));

  const requiredDocsUploaded = DOCUMENT_TYPES.filter(d => d.required).every(d => documents[d.type]);

  // =============================================
  // RENDER: Loading
  // =============================================
  if (authLoading || (user && checkingAuth)) {
    return <div className="min-h-screen bg-[#030000] flex items-center justify-center"><Loader2 className="w-8 h-8 text-army-gold animate-spin" /></div>;
  }

  // =============================================
  // RENDER: Sign In
  // =============================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#030000] text-white">
        <SharedNavbar slugParam={slugParam} onBack={onBack} />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6"><GuardLinkIcon className="text-army-gold w-16 h-16" /></div>
            <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-2">// PLAYER_PORTAL //</p>
            <h1 className="text-2xl font-black text-white mb-2">PLAYER DASHBOARD</h1>
            <p className="text-zinc-400 text-sm mb-8">Sign in with your Google account to access your recruitment portal.</p>
            <button onClick={handleSignIn} className="w-full py-3 bg-army-gold text-black font-bold rounded-lg hover:bg-army-gold/90 transition-all flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" /> Sign In with Google
            </button>
          </motion.div>
        </div>
        <SharedFooter slugParam={slugParam} />
      </div>
    );
  }

  // =============================================
  // RENDER: Access Denied
  // =============================================
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#030000] text-white">
        <SharedNavbar slugParam={slugParam} onBack={onBack} />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6"><GuardLinkIcon className="text-army-gold w-16 h-16" /></div>
            <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-2">// ACCESS_STATUS //</p>
            <h1 className="text-2xl font-black text-white mb-2">ACCESS PENDING</h1>
            <p className="text-zinc-400 text-sm mb-6">Your recruiter hasn't activated your portal yet. Contact your recruiter for access.</p>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-zinc-500 font-mono mb-1">SIGNED_IN_AS</p>
              <p className="text-sm text-white">{user.displayName}</p>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
            <button onClick={handleSignOut} className="w-full py-3 bg-zinc-800 text-white font-bold rounded-lg hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 border border-zinc-600">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>
        </div>
        <SharedFooter slugParam={slugParam} />
      </div>
    );
  }

  // =============================================
  // Intake Steps
  // =============================================
  const renderIntakeStep = () => {
    if (intakeSubmitted) {
      return (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-army-gold mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Intake Form Submitted</h3>
          <p className="text-zinc-400 text-sm mb-6">Your recruiter will review your information.</p>
          <button
            onClick={() => { setIntakeSubmitted(false); setIntakeStep(1); }}
            className="px-6 py-2 border border-army-gold/40 text-army-gold text-xs font-black uppercase tracking-widest hover:bg-army-gold/10 transition-colors"
          >
            Edit &amp; Resubmit
          </button>
        </div>
      );
    }

    const age = calcAge(intakeData.dob);

    switch (intakeStep) {
      // ==================
      // STEP 1: Personal
      // ==================
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>FIRST_NAME *</label>
                <input className={inputCls} placeholder="First" value={intakeData.firstName} onChange={(e) => update('firstName', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>MIDDLE_NAME</label>
                <input className={inputCls} placeholder="Middle" value={intakeData.middleName} onChange={(e) => update('middleName', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>LAST_NAME *</label>
                <input className={inputCls} placeholder="Last" value={intakeData.lastName} onChange={(e) => update('lastName', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>SUFFIX</label>
                <select className={inputCls} value={intakeData.suffix} onChange={(e) => update('suffix', e.target.value)}>
                  {SUFFIXES.map(s => <option key={s} value={s}>{s || '—'}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>DATE_OF_BIRTH *</label>
                <input type="date" className={inputCls} value={intakeData.dob} onChange={(e) => update('dob', e.target.value)} />
              </div>
              {age && (
                <div>
                  <label className={labelCls}>AGE</label>
                  <div className="bg-zinc-900 border border-army-gold/30 rounded px-4 py-3 text-army-gold text-sm font-bold">{age} years old</div>
                </div>
              )}
              <div>
                <label className={labelCls}>PHONE *</label>
                <input type="tel" className={inputCls} placeholder="(555) 123-4567" value={intakeData.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelCls}>EMAIL *</label>
              <input type="email" className={inputCls} placeholder="email@example.com" value={intakeData.email} onChange={(e) => update('email', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>ADDRESS *</label>
                <input className={inputCls} placeholder="Street Address" value={intakeData.address} onChange={(e) => update('address', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>ADDRESS_2</label>
                <input className={inputCls} placeholder="Apt, Suite, Unit, etc." value={intakeData.address2} onChange={(e) => update('address2', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls}>CITY *</label>
                <input className={inputCls} placeholder="City" value={intakeData.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>STATE</label>
                <input className={inputCls} placeholder="FL" value={intakeData.state} onChange={(e) => update('state', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>ZIP</label>
                <input className={inputCls} placeholder="33401" value={intakeData.zip} onChange={(e) => update('zip', e.target.value)} />
              </div>
            </div>

            <p className="text-[10px] font-mono text-army-gold tracking-[0.3em] pt-2">// PLACE_OF_BIRTH //</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>BIRTH_CITY</label>
                <input className={inputCls} placeholder="City" value={intakeData.birthCity} onChange={(e) => update('birthCity', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>BIRTH_STATE</label>
                <input className={inputCls} placeholder="State" value={intakeData.birthState} onChange={(e) => update('birthState', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>BIRTH_COUNTRY</label>
                <input className={inputCls} placeholder="United States" value={intakeData.birthCountry} onChange={(e) => update('birthCountry', e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelCls}>CITIZENSHIP_STATUS *</label>
              <select className={inputCls} value={intakeData.citizenship} onChange={(e) => update('citizenship', e.target.value)}>
                <option value="US Citizen">US Citizen</option>
                <option value="Permanent Resident">Permanent Resident</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {intakeData.citizenship === 'Permanent Resident' && (
              <div className="pl-4 border-l-2 border-army-gold/30">
                <label className={labelCls}>USCIS_NUMBER (A#)</label>
                <input className={inputCls} placeholder="A12345678" value={intakeData.uscisNumber} onChange={(e) => update('uscisNumber', e.target.value)} />
              </div>
            )}
          </div>
        );

      // ==================
      // STEP 2: Education
      // ==================
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>EDUCATION_LEVEL *</label>
              <select className={inputCls} value={intakeData.education} onChange={(e) => update('education', e.target.value)}>
                <option value="">Select...</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {intakeData.education === 'Currently in High School' && (
              <div className="pl-4 border-l-2 border-army-gold/30">
                <label className={labelCls}>CURRENT_GRADE</label>
                <select className={inputCls} value={intakeData.currentGrade} onChange={(e) => update('currentGrade', e.target.value)}>
                  <option value="">Select grade...</option>
                  {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}

            {['Some College', 'Associate Degree', "Bachelor's Degree", "Master's Degree or Higher"].includes(intakeData.education) && (
              <div className="pl-4 border-l-2 border-army-gold/30">
                <label className={labelCls}>SEMESTER_HOURS_EARNED</label>
                <input type="number" className={inputCls} placeholder="e.g., 60" value={intakeData.semesterHours} onChange={(e) => update('semesterHours', e.target.value)} />
              </div>
            )}

            <p className="text-[10px] font-mono text-army-gold tracking-[0.3em] pt-2">// HIGH_SCHOOL_INFO //</p>
            <div>
              <label className={labelCls}>HIGH_SCHOOL_NAME</label>
              <input className={inputCls} placeholder="Name of high school" value={intakeData.highSchoolName} onChange={(e) => update('highSchoolName', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>HIGH_SCHOOL_ADDRESS</label>
                <input className={inputCls} placeholder="Full address" value={intakeData.highSchoolAddress} onChange={(e) => update('highSchoolAddress', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>HIGH_SCHOOL_PHONE</label>
                <input type="tel" className={inputCls} placeholder="(555) 123-4567" value={intakeData.highSchoolPhone} onChange={(e) => update('highSchoolPhone', e.target.value)} />
              </div>
            </div>

            <p className="text-[10px] font-mono text-army-gold tracking-[0.3em] pt-2">// PHYSICAL_INFO //</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>HEIGHT (FT)</label>
                <select className={inputCls} value={intakeData.heightFeet} onChange={(e) => update('heightFeet', e.target.value)}>
                  <option value="">Ft</option>
                  {['4', '5', '6', '7'].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>HEIGHT (IN)</label>
                <select className={inputCls} value={intakeData.heightInches} onChange={(e) => update('heightInches', e.target.value)}>
                  <option value="">In</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i)}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>WEIGHT (LBS)</label>
                <input type="number" className={inputCls} placeholder="lbs" value={intakeData.weight} onChange={(e) => update('weight', e.target.value)} />
              </div>
            </div>
          </div>
        );

      // ==================
      // STEP 3: Employment
      // ==================
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>CURRENT_EMPLOYMENT_STATUS *</label>
              <select className={inputCls} value={intakeData.employmentStatus} onChange={(e) => update('employmentStatus', e.target.value)}>
                <option value="">Select...</option>
                <option value="Student">Student</option>
                <option value="Employed">Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            {intakeData.employmentStatus === 'Employed' && (
              <div className="pl-4 border-l-2 border-army-gold/30 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>COMPANY_NAME</label>
                    <input className={inputCls} placeholder="Company name" value={intakeData.companyName} onChange={(e) => update('companyName', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>COMPANY_ADDRESS</label>
                    <input className={inputCls} placeholder="Company address" value={intakeData.companyAddress} onChange={(e) => update('companyAddress', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>POSITION</label>
                    <input className={inputCls} placeholder="Job title" value={intakeData.position} onChange={(e) => update('position', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>START_DATE</label>
                    <input type="date" className={inputCls} value={intakeData.employmentStartDate} onChange={(e) => update('employmentStartDate', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>JOB_DESCRIPTION</label>
                  <textarea className={cn(inputCls, "min-h-[80px] resize-y")} placeholder="Brief description of duties" value={intakeData.jobDescription} onChange={(e) => update('jobDescription', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>SUPERVISOR_NAME</label>
                  <input className={inputCls} placeholder="Supervisor's full name" value={intakeData.supervisorName} onChange={(e) => update('supervisorName', e.target.value)} />
                </div>
              </div>
            )}

            <p className="text-[10px] font-mono text-army-gold tracking-[0.3em] pt-2">// FAMILY_&_LIVING //</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>MARITAL_STATUS</label>
                <select className={inputCls} value={intakeData.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>DEPENDENTS</label>
                <select className={inputCls} value={intakeData.dependents} onChange={(e) => update('dependents', e.target.value)}>
                  <option value="">Select...</option>
                  {['0', '1', '2', '3', '4', '5+'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>HOUSING_STATUS</label>
                <select className={inputCls} value={intakeData.housingStatus} onChange={(e) => update('housingStatus', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Renting">Renting</option>
                  <option value="Owning">Owning</option>
                  <option value="Living with Parents">Living with Parents</option>
                </select>
              </div>
            </div>
          </div>
        );

      // ==================
      // STEP 4: Health & Legal
      // ==================
      case 4:
        return (
          <div className="space-y-4">
            {/* Medical */}
            <div>
              <label className={labelCls}>DO YOU HAVE ANY MEDICAL ISSUES, SURGERIES, OR ARE YOU CURRENTLY ON MEDICATION? *</label>
              <div className="flex gap-4 mt-1">
                <button onClick={() => update('medicalIssues', true)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", intakeData.medicalIssues ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>Yes</button>
                <button onClick={() => update('medicalIssues', false)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", !intakeData.medicalIssues ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>No</button>
              </div>
            </div>
            {intakeData.medicalIssues && (
              <div className="pl-4 border-l-2 border-army-gold/30">
                <label className={labelCls}>PLEASE_EXPLAIN</label>
                <textarea className={cn(inputCls, "min-h-[100px] resize-y")} placeholder="Describe any medical issues, prior surgeries, or current medications..." value={intakeData.medicalDetails} onChange={(e) => update('medicalDetails', e.target.value)} />
              </div>
            )}

            {/* Tattoos */}
            <div>
              <label className={labelCls}>DO YOU HAVE ANY TATTOOS? *</label>
              <div className="flex gap-4 mt-1">
                <button onClick={() => update('tattoos', true)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", intakeData.tattoos ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>Yes</button>
                <button onClick={() => update('tattoos', false)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", !intakeData.tattoos ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>No</button>
              </div>
            </div>
            {intakeData.tattoos && (
              <div className="pl-4 border-l-2 border-army-gold/30 space-y-3">
                <div>
                  <label className={labelCls}>WHAT_ARE_THEY</label>
                  <textarea className={cn(inputCls, "min-h-[80px] resize-y")} placeholder="Describe your tattoos..." value={intakeData.tattooDetails} onChange={(e) => update('tattooDetails', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>WHERE_ON_YOUR_BODY</label>
                  <textarea className={cn(inputCls, "min-h-[80px] resize-y")} placeholder="Location on body (e.g., left forearm, right shoulder)..." value={intakeData.tattooLocations} onChange={(e) => update('tattooLocations', e.target.value)} />
                </div>
              </div>
            )}

            {/* Legal */}
            <div>
              <label className={labelCls}>DO YOU HAVE ANY LEGAL ISSUES? *</label>
              <div className="flex gap-4 mt-1">
                <button onClick={() => update('legalIssues', true)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", intakeData.legalIssues ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>Yes</button>
                <button onClick={() => update('legalIssues', false)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", !intakeData.legalIssues ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>No</button>
              </div>
            </div>
            {intakeData.legalIssues && (
              <div className="pl-4 border-l-2 border-army-gold/30">
                <label className={labelCls}>PLEASE_EXPLAIN</label>
                <textarea className={cn(inputCls, "min-h-[100px] resize-y")} placeholder="Describe any legal issues (arrests, charges, convictions, pending cases, etc.)..." value={intakeData.legalDetails} onChange={(e) => update('legalDetails', e.target.value)} />
              </div>
            )}

            {/* Prior Military */}
            <div>
              <label className={labelCls}>PRIOR_MILITARY_SERVICE *</label>
              <div className="flex gap-4 mt-1">
                <button onClick={() => update('priorMilitary', true)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", intakeData.priorMilitary ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>Yes</button>
                <button onClick={() => update('priorMilitary', false)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", !intakeData.priorMilitary ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>No</button>
              </div>
            </div>
            {intakeData.priorMilitary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 border-l-2 border-army-gold/30">
                <div>
                  <label className={labelCls}>BRANCH</label>
                  <input className={inputCls} placeholder="Branch of Service" value={intakeData.priorBranch} onChange={(e) => update('priorBranch', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>SERVICE_DATES</label>
                  <input className={inputCls} placeholder="2018-2022" value={intakeData.priorDates} onChange={(e) => update('priorDates', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        );

      // ==================
      // STEP 5: Military Interest
      // ==================
      case 5:
        return (
          <div className="space-y-4">
            <p className="text-[10px] font-mono text-army-gold tracking-[0.3em]">// SELECT_3_MOS_CHOICES //</p>
            {[
              { label: 'MOS_CHOICE_#1 *', field: 'interestedMOS1' as keyof IntakeData },
              { label: 'MOS_CHOICE_#2', field: 'interestedMOS2' as keyof IntakeData },
              { label: 'MOS_CHOICE_#3', field: 'interestedMOS3' as keyof IntakeData },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className={labelCls}>{label}</label>
                <select className={inputCls} value={intakeData[field] as string} onChange={(e) => update(field, e.target.value)}>
                  <option value="">Select MOS...</option>
                  {MOS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            ))}

            <p className="text-[10px] font-mono text-army-gold tracking-[0.3em] pt-2">// ASVAB_HISTORY //</p>
            <div>
              <label className={labelCls}>HAVE YOU EVER TAKEN THE SASVAB (IN SCHOOL) OR THE ASVAB (WITH A RECRUITER)? *</label>
              <select className={inputCls} value={intakeData.asvabTaken} onChange={(e) => update('asvabTaken', e.target.value)}>
                <option value="">Select...</option>
                <option value="No">No, never taken</option>
                <option value="SASVAB">Yes — SASVAB in school</option>
                <option value="ASVAB">Yes — ASVAB with a recruiter</option>
                <option value="Both">Yes — Both</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>PROVIDE 3 AVAILABLE DATES TO TAKE THE ASVAB</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="date" className={inputCls} value={intakeData.asvabDate1} onChange={(e) => update('asvabDate1', e.target.value)} />
                <input type="date" className={inputCls} value={intakeData.asvabDate2} onChange={(e) => update('asvabDate2', e.target.value)} />
                <input type="date" className={inputCls} value={intakeData.asvabDate3} onChange={(e) => update('asvabDate3', e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelCls}>HAVE YOU EVER TALKED TO OR PROCESSED WITH ANOTHER RECRUITER (ANY BRANCH)? *</label>
              <div className="flex gap-4 mt-1">
                <button onClick={() => update('priorRecruiter', true)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", intakeData.priorRecruiter ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>Yes</button>
                <button onClick={() => update('priorRecruiter', false)} className={cn("px-4 py-2 rounded text-sm font-bold border transition-all", !intakeData.priorRecruiter ? "bg-army-gold text-black border-army-gold" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500")}>No</button>
              </div>
            </div>
            {intakeData.priorRecruiter && (
              <div className="pl-4 border-l-2 border-army-gold/30">
                <label className={labelCls}>WHEN_AND_WHAT_HAPPENED</label>
                <textarea className={cn(inputCls, "min-h-[100px] resize-y")} placeholder="Which branch, when, and what happened (e.g., started processing but didn't finish, got DQ'd, etc.)..." value={intakeData.priorRecruiterDetails} onChange={(e) => update('priorRecruiterDetails', e.target.value)} />
              </div>
            )}

            <div>
              <label className={labelCls}>HOW_DID_YOU_HEAR_ABOUT_US</label>
              <select className={inputCls} value={intakeData.howHeard} onChange={(e) => update('howHeard', e.target.value)}>
                <option value="">Select...</option>
                <option value="Social Media">Social Media</option>
                <option value="Recruiter Visit">Recruiter Visit</option>
                <option value="Friend/Family">Friend/Family</option>
                <option value="School Event">School Event</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>QUESTIONS_FOR_RECRUITER</label>
              <textarea className={cn(inputCls, "min-h-[120px] resize-y")} placeholder="Any questions or concerns for your recruiter..." value={intakeData.questionsForRecruiter} onChange={(e) => update('questionsForRecruiter', e.target.value)} />
            </div>
          </div>
        );

      // ==================
      // STEP 6: Review
      // ==================
      case 6:
        return (
          <div className="space-y-4">
            <p className="text-xs font-mono text-zinc-500 tracking-[0.2em] mb-4">// REVIEW_YOUR_INFO //</p>

            {/* Required docs check */}
            {!requiredDocsUploaded && (
              <div className="bg-zinc-900 border border-red-500/30 rounded p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-400">Required Documents Missing</p>
                  <p className="text-xs text-zinc-400 mt-1">You must upload your <strong>Birth Certificate</strong> and <strong>Social Security Card</strong> before submitting. Use the Document Vault section below to upload them.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                ['First Name', intakeData.firstName],
                ['Middle Name', intakeData.middleName],
                ['Last Name', intakeData.lastName],
                ['Suffix', intakeData.suffix],
                ['Date of Birth', intakeData.dob ? `${intakeData.dob} (Age: ${calcAge(intakeData.dob)})` : ''],
                ['Phone', intakeData.phone],
                ['Email', intakeData.email],
                ['Address', [intakeData.address, intakeData.address2].filter(Boolean).join(', ')],
                ['City/State/Zip', `${intakeData.city}, ${intakeData.state} ${intakeData.zip}`],
                ['Place of Birth', [intakeData.birthCity, intakeData.birthState, intakeData.birthCountry].filter(Boolean).join(', ')],
                ['Citizenship', intakeData.citizenship + (intakeData.uscisNumber ? ` (${intakeData.uscisNumber})` : '')],
                ['Education', intakeData.education + (intakeData.currentGrade ? ` — ${intakeData.currentGrade}` : '') + (intakeData.semesterHours ? ` — ${intakeData.semesterHours} hrs` : '')],
                ['High School', intakeData.highSchoolName],
                ['Height', intakeData.heightFeet ? `${intakeData.heightFeet}'${intakeData.heightInches || '0'}"` : ''],
                ['Weight', intakeData.weight ? `${intakeData.weight} lbs` : ''],
                ['Employment', intakeData.employmentStatus + (intakeData.companyName ? ` — ${intakeData.companyName}` : '')],
                ['Marital Status', intakeData.maritalStatus],
                ['Dependents', intakeData.dependents],
                ['Housing', intakeData.housingStatus],
                ['Medical Issues', intakeData.medicalIssues ? 'Yes' : 'No'],
                ['Tattoos', intakeData.tattoos ? 'Yes' : 'No'],
                ['Legal Issues', intakeData.legalIssues ? 'Yes' : 'No'],
                ['Prior Military', intakeData.priorMilitary ? `Yes — ${intakeData.priorBranch}` : 'No'],
                ['MOS #1', intakeData.interestedMOS1],
                ['MOS #2', intakeData.interestedMOS2],
                ['MOS #3', intakeData.interestedMOS3],
                ['ASVAB', intakeData.asvabTaken || 'Not answered'],
                ['Prior Recruiter', intakeData.priorRecruiter ? 'Yes' : 'No'],
                ['How Heard', intakeData.howHeard],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="bg-zinc-900 border border-zinc-700 rounded p-3">
                  <p className="text-[10px] font-mono text-zinc-500 tracking-[0.15em]">{label.toUpperCase().replace(/ /g, '_')}</p>
                  <p className="text-sm text-white mt-0.5">{value || '—'}</p>
                </div>
              ))}
            </div>
            {intakeData.questionsForRecruiter && (
              <div className="bg-zinc-900 border border-zinc-700 rounded p-3">
                <p className="text-[10px] font-mono text-zinc-500 tracking-[0.15em]">QUESTIONS_FOR_RECRUITER</p>
                <p className="text-sm text-white mt-0.5">{intakeData.questionsForRecruiter}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // =============================================
  // RENDER: Main Dashboard
  // =============================================
  return (
    <div className="min-h-screen bg-[#030000] text-white">
      <SharedNavbar slugParam={slugParam} onBack={onBack} />

      <div className="pt-24 pb-32 px-4 max-w-5xl mx-auto">
        {/* === Header === */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full border-2 border-army-gold/40 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-army-gold/10 border-2 border-army-gold/40 flex items-center justify-center shrink-0"><User className="w-7 h-7 text-army-gold" /></div>
                )}
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-black text-white truncate">{user.displayName || 'Player'}</h1>
                  <p className="text-xs text-zinc-400 font-mono truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={cn("text-[10px] font-mono font-bold tracking-[0.15em] px-3 py-1.5 rounded border", statusColor(overallStatus))}>{overallStatus}</span>
                <span className="text-[10px] font-mono text-zinc-500 tracking-[0.15em] px-3 py-1.5 rounded border border-zinc-700 bg-zinc-800 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-army-gold" /> ENCRYPTED</span>
                <button onClick={handleSignOut} className="text-[10px] font-mono text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> SIGN_OUT</button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-mono text-zinc-500 tracking-[0.15em]">OVERALL_COMPLETION</p>
                <p className="text-xs font-bold text-army-gold">{completionPct}%</p>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-army-gold rounded-full" initial={{ width: 0 }} animate={{ width: `${completionPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* === Mobile Tab Nav === */}
        <div className="sm:hidden flex bg-zinc-900 border border-zinc-700 rounded-lg mb-6 overflow-hidden">
          {([
            { key: 'intake', icon: ClipboardList, label: 'Intake' },
            { key: 'documents', icon: FolderOpen, label: 'Docs' },
            { key: 'progress', icon: BarChart3, label: 'Progress' },
            { key: 'messages', icon: MessageSquare, label: 'Msgs' },
          ] as { key: MobileTab; icon: any; label: string }[]).map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setMobileTab(key)} className={cn("flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-mono transition-all", mobileTab === key ? "text-army-gold bg-army-gold/10" : "text-zinc-500 hover:text-zinc-300")}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* === Section: Intake Form === */}
        <div className={cn("mb-8", mobileTab !== 'intake' && 'hidden sm:block')}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">[ 01_INTAKE ]</p>
                    <h2 className="text-lg font-bold text-white">Onboarding Intake Form</h2>
                  </div>
                  {intakeSaving && <Loader2 className="w-4 h-4 text-army-gold animate-spin" />}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* Step indicators */}
                {!intakeSubmitted && (
                  <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2">
                    {STEP_LABELS.map((label, i) => (
                      <div key={i} className="flex items-center gap-1.5 shrink-0">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                          intakeStep === i + 1 ? "bg-army-gold text-black border-army-gold" :
                          intakeStep > i + 1 ? "bg-army-gold/20 text-army-gold border-army-gold/50" :
                          "bg-zinc-800 text-zinc-500 border-zinc-700"
                        )}>
                          {intakeStep > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span className={cn("text-[9px] font-mono tracking-wide hidden lg:inline", intakeStep === i + 1 ? "text-army-gold" : "text-zinc-500")}>{label}</span>
                        {i < STEP_LABELS.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
                      </div>
                    ))}
                  </div>
                )}

                {renderIntakeStep()}

                {/* Nav buttons */}
                {!intakeSubmitted && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-700">
                    <button
                      onClick={() => { saveIntakeStep(intakeStep - 1, intakeData); setIntakeStep((s) => Math.max(1, s - 1)); }}
                      disabled={intakeStep === 1}
                      className={cn("flex items-center gap-1 px-4 py-2 rounded text-sm font-bold border transition-all",
                        intakeStep === 1 ? "opacity-30 cursor-not-allowed border-zinc-700 text-zinc-600" : "border-zinc-600 text-white hover:bg-zinc-800"
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    {intakeStep < STEP_COUNT ? (
                      <button onClick={() => { saveIntakeStep(intakeStep + 1, intakeData); setIntakeStep((s) => Math.min(STEP_COUNT, s + 1)); }}
                        className="flex items-center gap-1 px-5 py-2 rounded text-sm font-bold bg-army-gold text-black hover:bg-army-gold/90 transition-all">
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { if (!requiredDocsUploaded) { alert('Please upload your Birth Certificate and Social Security Card before submitting.'); return; } saveIntakeStep(STEP_COUNT, intakeData, true); }}
                        disabled={!requiredDocsUploaded}
                        className={cn("flex items-center gap-1 px-5 py-2 rounded text-sm font-bold transition-all",
                          requiredDocsUploaded ? "bg-army-gold text-black hover:bg-army-gold/90" : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                        )}
                      >
                        <CheckCircle className="w-4 h-4" /> Submit
                      </button>
                    )}
                  </div>
                )}

                {!intakeSubmitted && (
                  <div className="mt-4">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-army-gold rounded-full transition-all duration-300" style={{ width: `${(intakeStep / STEP_COUNT) * 100}%` }} />
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1.5 text-center">Step {intakeStep} of {STEP_COUNT}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* === Section: Document Vault === */}
        <div className={cn("mb-8", mobileTab !== 'documents' && 'hidden sm:block')}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-zinc-700">
                <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">[ 02_DOCUMENTS ]</p>
                <h2 className="text-lg font-bold text-white">Document Vault</h2>
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                {DOCUMENT_TYPES.map((dt) => {
                  const docMeta = documents[dt.type];
                  const isUploading = uploadingDoc === dt.type;
                  return (
                    <div key={dt.type} className="bg-zinc-800 border border-zinc-700 rounded p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn("w-10 h-10 rounded flex items-center justify-center shrink-0 border",
                          docMeta ?
                            (docMeta.status === 'VERIFIED' ? "bg-army-gold/10 border-army-gold/30" :
                             docMeta.status === 'REJECTED' ? "bg-red-500/10 border-red-500/30" :
                             "bg-zinc-700 border-zinc-600") :
                            "bg-zinc-800 border-zinc-600"
                        )}>
                          {docMeta ? (
                            docMeta.status === 'VERIFIED' ? <CheckCircle className="w-5 h-5 text-army-gold" /> :
                            docMeta.status === 'REJECTED' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                            <Clock className="w-5 h-5 text-zinc-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            {dt.label}
                            {dt.required && <span className="text-[9px] font-mono text-army-gold border border-army-gold/30 px-1.5 py-0.5 rounded">REQUIRED</span>}
                          </p>
                          {docMeta ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">{docMeta.fileName}</p>
                              <span className={cn("text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border", statusColor(docMeta.status))}>{docMeta.status}</span>
                            </div>
                          ) : (
                            <p className="text-[10px] text-zinc-500 font-mono">{dt.hint}</p>
                          )}
                        </div>
                      </div>
                      <div className="sm:ml-auto shrink-0">
                        <input ref={(el) => { fileInputRefs.current[dt.type] = el; }} type="file" accept={dt.accept} className="hidden"
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleDocUpload(dt.type, file); }} />
                        <button onClick={() => fileInputRefs.current[dt.type]?.click()} disabled={isUploading}
                          className={cn("flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold transition-all min-w-[100px] justify-center",
                            docMeta ? "bg-zinc-700 text-zinc-300 border border-zinc-600 hover:border-zinc-500" : "bg-army-gold text-black hover:bg-army-gold/90"
                          )}>
                          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {docMeta ? 'Replace' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* === Section: Progress Tracker === */}
        <div className={cn("mb-8", mobileTab !== 'progress' && 'hidden sm:block')}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-zinc-700">
                <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">[ 03_PROGRESS ]</p>
                <h2 className="text-lg font-bold text-white">Progress Tracker</h2>
              </div>
              <div className="p-5 sm:p-6">
                <div className="relative">
                  {progressStages.map((stage, i) => (
                    <div key={stage.key} className="flex items-start gap-4 mb-1 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
                          stage.status === 'complete' ? "bg-army-gold/20 border-army-gold text-army-gold" :
                          stage.status === 'current' ? "bg-army-gold/10 border-army-gold text-army-gold ring-2 ring-army-gold/30" :
                          "bg-zinc-800 border-zinc-600 text-zinc-600"
                        )}>
                          {stage.status === 'complete' ? <Check className="w-4 h-4" /> :
                           stage.status === 'current' ? <span className="w-2.5 h-2.5 rounded-full bg-army-gold animate-pulse" /> :
                           <Lock className="w-3.5 h-3.5" />}
                        </div>
                        {i < progressStages.length - 1 && (
                          <div className={cn("w-0.5 h-8 transition-all", stage.status === 'complete' ? "bg-army-gold/50" : "bg-zinc-700")} />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className={cn("text-sm font-bold transition-colors",
                          stage.status === 'complete' ? "text-army-gold" :
                          stage.status === 'current' ? "text-white" :
                          "text-zinc-500"
                        )}>{stage.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === Section: Messages === */}
        <div className={cn("mb-8", mobileTab !== 'messages' && 'hidden sm:block')}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-zinc-700">
                <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">[ 04_COMMS ]</p>
                <h2 className="text-lg font-bold text-white">Recruiter Messages</h2>
              </div>
              <div className="p-5 sm:p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No messages yet. Your recruiter will reach out here.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn("bg-zinc-800 border rounded p-4", msg.fromPlayer ? "border-army-gold/30 ml-6" : "border-zinc-700 mr-6")}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold text-white">{msg.fromPlayer ? 'You' : msg.recruiterName}</p>
                          <p className="text-[10px] font-mono text-zinc-500">{msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleString() : ''}</p>
                        </div>
                        <p className="text-sm text-zinc-300">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                    placeholder="Type a reply..." className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-army-gold/50 focus:outline-none" />
                  <button onClick={handleSendReply} disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2.5 bg-army-gold text-black rounded font-bold text-sm hover:bg-army-gold/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* === Section: Reminders === */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-zinc-700">
              <p className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] mb-1">[ 05_REMINDERS ]</p>
              <h2 className="text-lg font-bold text-white">Reminders & Next Steps</h2>
            </div>
            <div className="p-5 sm:p-6">
              {reminders.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No reminders yet. Your recruiter will set action items here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reminders.map((r) => (
                    <div key={r.id} className={cn("flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded p-3", r.completed && "opacity-50")}>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", r.completed ? "bg-army-gold/20 text-army-gold" : "bg-army-gold/10 text-army-gold")}>
                        {r.completed ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm text-white", r.completed && "line-through")}>{r.text}</p>
                        {r.dueDate && <p className="text-[10px] font-mono text-zinc-500">Due: {r.dueDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <SharedFooter slugParam={slugParam} />
    </div>
  );
};
