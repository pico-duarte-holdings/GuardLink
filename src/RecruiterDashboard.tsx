/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Users, TrendingUp, Mail, Calendar, CheckCircle, Clock, Search, Filter,
  ArrowLeft, LogOut, ShieldAlert, Download, CheckSquare, Square, Trash2,
  LogIn, Loader2, History, Eye, X, UserPlus, Moon, Sun, Settings, Smartphone,
  MapPin, Instagram, Facebook, Link as LinkIcon, Linkedin, Youtube, MessageSquare,
  Phone, Edit, Plus, Upload, QrCode, Forward, AlertTriangle, LayoutGrid, List, Target,
  Inbox, PhoneCall, BookOpen, Activity, FileWarning, Star, ChevronDown
} from 'lucide-react';
import { MissionControl } from './MissionControl';
import { capitalizeFirst, toUpper } from './lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { onSnapshot, collection, query, orderBy, updateDoc, doc, setDoc, deleteDoc, addDoc, getDoc, where } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Lead, Subscription } from './types';
import QRCode from 'qrcode';
import { cn } from './lib/utils';
import { Bell } from 'lucide-react';
import { SharedChatbot } from './SharedChatbot';
import { LeadIntake } from './LeadIntake';

const LEAD_STATUSES = ['New', 'Contacted', 'Appointment', 'ASVAB', 'Physical', 'Waiver', 'Qualified', 'Enlisted'];
const CHART_COLORS = ['#FFD530', '#00f2ff', '#39ff14', '#a855f7', '#ff0055', '#ffffff'];
const PLATOONS = ['HQ', 'C1', 'C2', 'C3', 'C4'];

import { useNavigate } from 'react-router-dom';

export const RecruiterDashboard = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'recruiter' | 'pending' | null>(null);
  const [userPlatoons, setUserPlatoons] = useState<string[]>(['HQ']);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [isCommander, setIsCommander] = useState(false);
  const [error, setError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'funnel' | 'intake' | 'mission' | 'team'>('funnel');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateRecruiter, setShowCreateRecruiter] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [journeyLead, setJourneyLead] = useState<Lead | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvAssignee, setCsvAssignee] = useState('');
  const [newNote, setNewNote] = useState('');

  const [profileData, setProfileData] = useState({
    slug: '', rank: '', firstName: '', lastName: '', cellPhone: '', officePhone: '',
    officeExt: '', publicEmail: '', locationType: 'Armory', address1: '',
    address2: '', city: '', state: 'FL', zip: '', instagram: '', facebook: '',
    tiktok: '', linkedin: '', discord: '', youtube: '', linktree: '',
    platoons: ['HQ'],
    photoURL: '',
    whyJoined: '',
    civilianCareer: '',
    favoritePartOfServing: '',
    favoriteHobbies: '',
    favoriteTravelPlace: '',
    messageToProspects: '',
    smsTemplate: 'Hey {{name}}, this is {{recruiter}} with the Guard. Are you still interested in leveling up your career?',
    emailTemplate: 'Hello {{name}},\n\nThank you for your interest in the Guard. Let me know when you have time for a quick call to discuss your options.\n\nRespectfully,\n{{recruiter}}'
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [mosFilter, setMosFilter] = useState('All');
  const [recruiterFilter, setRecruiterFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [newLeadData, setNewLeadData] = useState({
    firstName: '', lastName: '', phone: '', email: '', age: '', education: 'HS Graduate', interest: 'Enlisted', mos: 'TBD', source: 'Manual Entry'
  });

  const [createRecruiterEmail, setCreateRecruiterEmail] = useState('');
  const [createRecruiterName, setCreateRecruiterName] = useState('');
  const [createRecruiterRole, setCreateRecruiterRole] = useState('recruiter');
  const [createRecruiterSlug, setCreateRecruiterSlug] = useState('');
  const [createRecruiterPlatoons, setCreateRecruiterPlatoons] = useState<string[]>(['HQ']);
  const [transferLeadsOnCreate, setTransferLeadsOnCreate] = useState(false);

  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const handleTileClick = useCallback((filter: string) => {
    setActiveTab('leads');
    setStatusFilter(filter);
    setViewMode('table');
    setCurrentPage(1);
    setSelectedEmails(new Set());
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.remove('light-theme');
    else document.documentElement.classList.add('light-theme');
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsFirebaseAuthenticated(!!user);
      if (user) {
        try {
          const isMaster = user.email?.toLowerCase() === 'angellantigua98@gmail.com';
          setIsCommander(isMaster);

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data.role || (isMaster ? 'admin' : 'recruiter'));
            setUserSlug(data.slug || null);
            const loadedPlatoons = data.platoons || (data.platoon ? [data.platoon] : ['HQ']);
            setUserPlatoons(loadedPlatoons);
            setProfileData({
              ...profileData, ...data, platoons: loadedPlatoons,
              publicEmail: data.publicEmail || user.email || '',
              smsTemplate: data.smsTemplate || profileData.smsTemplate,
              emailTemplate: data.emailTemplate || profileData.emailTemplate,
              whyJoined: data.whyJoined || '',
              civilianCareer: data.civilianCareer || '',
              favoritePartOfServing: data.favoritePartOfServing || '',
              favoriteHobbies: data.favoriteHobbies || '',
              favoriteTravelPlace: data.favoriteTravelPlace || '',
              messageToProspects: data.messageToProspects || '',
              photoURL: data.photoURL || data.profilePhoto || '',
            });
          } else {
            if (isMaster) {
              await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email, displayName: user.displayName || 'Tiguere', role: 'admin', platoons: ['HQ', 'C1', 'C2', 'C3', 'C4'], createdAt: new Date().toISOString() });
              setUserRole('admin'); setUserPlatoons(['HQ', 'C1', 'C2', 'C3', 'C4']);
            } else if (user.email) {
              const preApprovedDoc = await getDoc(doc(db, 'pre_approved_users', user.email.toLowerCase()));
              if (preApprovedDoc.exists()) {
                const pData = preApprovedDoc.data();
                const loadedPlatoons = pData.platoons || (pData.platoon ? [pData.platoon] : ['HQ']);
                await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email, displayName: pData.displayName || user.displayName || 'Recruiter', role: pData.role, slug: pData.slug, platoons: loadedPlatoons, createdAt: new Date().toISOString() });
                setUserRole(pData.role); setUserSlug(pData.slug); setUserPlatoons(loadedPlatoons);
              } else {
                await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email, displayName: user.displayName || 'Recruiter', role: 'pending', createdAt: new Date().toISOString() });
                setUserRole('pending'); setError('Account pending admin approval.');
              }
            }
          }
        } catch (err: any) {
          console.error('Auth/Firestore error:', err);
          setError(err?.code === 'permission-denied'
            ? 'Firestore permissions error — update your Firestore security rules to allow reads on the "users" collection.'
            : `Login error: ${err?.message || 'Unknown error'}`);
          setIsLoading(false);
        }
      } else {
        setUserRole(null); setUserSlug(null); setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseAuthenticated || !userRole) return;
    
    let leadsQuery = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
    if (!isCommander && userRole !== 'admin') {
      leadsQuery = query(collection(db, 'leads'), where('recruiterId', '==', auth.currentUser?.uid), orderBy('timestamp', 'desc'));
    }
    
    const unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
      let leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Lead & { id: string })[];
      if (!isCommander && userRole === 'admin') {
        leadsData = leadsData.filter(l => userPlatoons.includes(l.platoon || 'HQ'));
      }
      setLeads(leadsData); setIsLoading(false);
    }, (err) => { console.error('Leads snapshot error:', err); setIsLoading(false); setError('Could not load leads — check Firestore rules.'); });
    
    let unsubTeam = () => {};
    if (isCommander || userRole === 'admin') {
      unsubTeam = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snapshot) => {
        let teamData = snapshot.docs.map(doc => {
          const d = doc.data();
          return { id: doc.id, ...d, platoons: d.platoons || (d.platoon ? [d.platoon] : ['HQ']) };
        });
        if (!isCommander && userRole === 'admin') {
          teamData = teamData.filter(t => (t.platoons as string[]).some(p => userPlatoons.includes(p)));
        }
        setTeam(teamData);
      }, (err) => { console.error('Team snapshot error:', err); });
    }
    
    return () => { unsubLeads(); unsubTeam(); };
  }, [isFirebaseAuthenticated, userRole, userPlatoons, isCommander]);

  const isLeadStale = (lead: any) => {
    if (lead.status !== 'New' && lead.status !== 'Contacted') return false;
    let lastAction = new Date(lead.timestamp).getTime();
    if (lead.notes && Array.isArray(lead.notes) && lead.notes.length > 0) lastAction = Math.max(lastAction, new Date(lead.notes[lead.notes.length - 1].timestamp).getTime());
    return (Date.now() - lastAction) / (1000 * 60 * 60) > 72;
  };

  const isFollowUpDue = (lead: any) => {
    if (!lead.followUpDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(lead.followUpDate); due.setHours(0, 0, 0, 0);
    return due.getTime() <= today.getTime();
  };

  const getCommsLink = (type: 'sms' | 'email', lead: any) => {
    const rName = `${profileData.rank} ${profileData.lastName}`.trim() || 'your recruiter';
    if (type === 'sms') return `sms:${lead.phone}?body=${encodeURIComponent(profileData.smsTemplate.replace(/{{name}}/g, capitalizeFirst(lead.firstName)).replace(/{{recruiter}}/g, rName))}`;
    return `mailto:${lead.email}?subject=Army National Guard&body=${encodeURIComponent(profileData.emailTemplate.replace(/{{name}}/g, capitalizeFirst(lead.firstName)).replace(/{{recruiter}}/g, rName))}`;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
      setUserRole(null);
      setIsCommander(false);
      setUserSlug(null);
      setUserPlatoons(['HQ']);
      setLeads([]);
      setTeam([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleInlineStatusUpdate = async (id: string, newStatus: string) => {
    try { await updateDoc(doc(db, 'leads', id), { status: newStatus }); } catch (err) { console.error(err); }
  };

  const handleInlineRoleUpdate = async (id: string, newRole: string) => {
    try { await updateDoc(doc(db, 'users', id), { role: newRole }); } catch (err) { console.error(err); }
  };

  const handleManualAddLead = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newLeadData.firstName || !newLeadData.lastName || !newLeadData.email) return;
    try {
      const generatedName = `${profileData.rank} ${profileData.lastName}`.trim();
      const payload: any = {
        firstName: newLeadData.firstName, lastName: newLeadData.lastName, phone: newLeadData.phone, email: newLeadData.email,
        timestamp: new Date().toISOString(), status: 'New', recruiterId: auth.currentUser.uid, recruiterName: generatedName,
        platoon: profileData.platoons && profileData.platoons.length > 0 ? profileData.platoons[0] : 'HQ', optIn: true
      };
      if (activeTab === 'funnel') {
        payload.age = newLeadData.age || ''; payload.education = newLeadData.education || 'HS Graduate';
        payload.interest = newLeadData.interest || 'Enlisted'; payload.mos = newLeadData.mos || 'TBD'; payload.source = newLeadData.source || 'Manual Entry';
      }
      await addDoc(collection(db, 'leads'), payload);
      setShowAddLeadModal(false); setNewLeadData({ firstName: '', lastName: '', phone: '', email: '', age: '', education: 'HS Graduate', interest: 'Enlisted', mos: 'TBD', source: 'Manual Entry' });
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    let targetUid = auth.currentUser.uid;
    let targetName = `${profileData.rank} ${profileData.lastName}`.trim() || 'Recruiter';
    let targetPlatoon = profileData.platoons && profileData.platoons.length > 0 ? profileData.platoons[0] : 'HQ';

    if (userRole === 'admin' || isCommander) {
      if (!csvAssignee) { alert("Please select a recruiter to assign these leads to."); return; }
      const assignedRecruiter = team.find(t => t.uid === csvAssignee);
      if (assignedRecruiter) {
        targetUid = assignedRecruiter.uid; targetName = assignedRecruiter.displayName || 'Recruiter';
        targetPlatoon = assignedRecruiter.platoons && assignedRecruiter.platoons.length > 0 ? assignedRecruiter.platoons[0] : 'HQ';
      }
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const startIdx = rows[0].toLowerCase().includes('email') ? 1 : 0;
      const MAX_ROWS = 500;
      if (rows.length - startIdx > MAX_ROWS) { alert(`CSV too large. Max ${MAX_ROWS} rows.`); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let count = 0;
      let skipped = 0;
      for (let i = startIdx; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (cols.length >= 2) {
          const email = cols[2]?.replace(/["']/g, '').trim() || '';
          if (email && !emailRegex.test(email)) { skipped++; continue; }
          try {
            await addDoc(collection(db, 'leads'), {
              firstName: cols[0]?.replace(/["']/g, '').trim() || 'Unknown', lastName: cols[1]?.replace(/["']/g, '').trim() || '',
              email, phone: cols[3]?.replace(/["']/g, '').trim() || '',
              source: 'CSV Import', status: 'New', mos: 'TBD', timestamp: new Date().toISOString(),
              recruiterId: targetUid, recruiterName: targetName, platoon: targetPlatoon
            });
            count++;
          } catch (err) {}
        }
      }
      alert(`Imported ${count} records${skipped > 0 ? ` (${skipped} skipped — invalid email)` : ''}!`); setShowCSVModal(false); setCsvAssignee('');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead || !editingLead.id) return;
    try {
      let rName = editingLead.recruiterName;
      let rPlatoon = editingLead.platoon;
      // If a recruiter is selected, pull their name. Platoon only auto-updates if Commander didn't manually set one.
      if (editingLead.recruiterId) {
        const found = team.find(t => t.uid === editingLead.recruiterId);
        if (found) {
          rName = found.displayName;
          // Only auto-set platoon from recruiter if the user didn't explicitly pick a different platoon
          if (!(editingLead as any)._platoonManuallySet) {
            rPlatoon = found.platoons && found.platoons.length > 0 ? found.platoons[0] : 'HQ';
          }
        }
      }
      await updateDoc(doc(db, 'leads', editingLead.id), {
        firstName: editingLead.firstName, lastName: editingLead.lastName, phone: editingLead.phone, email: editingLead.email,
        mos: editingLead.mos, status: editingLead.status, recruiterId: editingLead.recruiterId || '', recruiterName: rName || '',
        platoon: rPlatoon, followUpDate: editingLead.followUpDate || ''
      });
      setEditingLead(null);
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead || !editingLead.id || !newNote.trim()) return;
    try {
      const noteObj = { text: newNote.trim(), timestamp: new Date().toISOString(), author: `${profileData.rank} ${profileData.lastName}`.trim() || 'Recruiter' };
      const currentNotes = Array.isArray(editingLead.notes) ? editingLead.notes : (editingLead.notes ? [{ text: editingLead.notes, timestamp: editingLead.timestamp, author: 'System' }] : []);
      const updatedNotes = [...currentNotes, noteObj];
      await updateDoc(doc(db, 'leads', editingLead.id), { notes: updatedNotes });
      setEditingLead({ ...editingLead, notes: updatedNotes }); setNewNote('');
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm(`Permanently delete this record?`)) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
      setEditingLead(null);
    } catch (err) { console.error(err); }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!auth.currentUser) return;
    if (!storage) {
      alert("Storage is not configured for this project.");
      return;
    }
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.size > MAX_SIZE) { alert('File too large. Max 5MB.'); return; }
    if (!ALLOWED_TYPES.includes(file.type)) { alert('Invalid file type. Use JPEG, PNG, WebP, or GIF.'); return; }
    setIsUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profile-photos/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProfileData({ ...profileData, photoURL: url });
      await setDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url }, { merge: true });
    } catch (err: any) { alert("Upload failed: " + err.message); }
    setIsUploadingPhoto(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      console.log('Saving profile data:', profileData);
      await setDoc(doc(db, 'users', auth.currentUser.uid), { ...profileData, displayName: `${profileData.rank} ${profileData.firstName} ${profileData.lastName}`.trim() }, { merge: true });
      setUserSlug(profileData.slug || null);
      setShowProfileModal(false);
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleCreateRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRecruiterEmail) return;
    try {
      const emailLower = createRecruiterEmail.toLowerCase();
      await setDoc(doc(db, 'pre_approved_users', emailLower), {
        email: emailLower, displayName: createRecruiterName, role: createRecruiterRole, slug: createRecruiterSlug, platoons: createRecruiterPlatoons, createdAt: new Date().toISOString()
      });

      // If transfer toggle is on, auto-reassign unassigned leads from selected platoons to this recruiter
      if (transferLeadsOnCreate && createRecruiterPlatoons.length > 0) {
        const unassignedLeads = leads.filter(l =>
          (!l.recruiterId || l.recruiterId === '') && createRecruiterPlatoons.includes(l.platoon || 'HQ')
        );
        if (unassignedLeads.length > 0) {
          await Promise.all(unassignedLeads.map(l =>
            updateDoc(doc(db, 'leads', l.id as string), { recruiterName: createRecruiterName, platoon: createRecruiterPlatoons[0] })
          ));
        }
      }

      setShowCreateRecruiter(false); setCreateRecruiterEmail(''); setCreateRecruiterName(''); setCreateRecruiterRole('recruiter'); setCreateRecruiterSlug(''); setCreateRecruiterPlatoons(['HQ']); setTransferLeadsOnCreate(false);
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      const assignedZipCodes = editingMember.assignedZipCodes || [];
      await updateDoc(doc(db, 'users', editingMember.uid), { role: editingMember.role, slug: editingMember.slug, platoons: editingMember.platoons, assignedZipCodes });

      // Auto-transfer unassigned leads whose zip matches the recruiter's assigned zips
      if (assignedZipCodes.length > 0) {
        const matchingLeads = leads.filter(l =>
          (!l.recruiterId || l.recruiterId === '' || l.recruiterId === 'generic') &&
          l.zip && assignedZipCodes.includes(l.zip)
        );
        if (matchingLeads.length > 0) {
          await Promise.all(matchingLeads.map(l =>
            updateDoc(doc(db, 'leads', l.id as string), {
              recruiterId: editingMember.uid,
              recruiterName: editingMember.displayName || ''
            })
          ));
        }
      }

      setEditingMember(null);
    } catch (err) { console.error(err); }
  };

  const handleDeleteMember = async (memberId: string, memberEmail: string) => {
    if (!window.confirm("Revoke access permanently?")) return;
    try {
      await deleteDoc(doc(db, 'users', memberId));
      await deleteDoc(doc(db, 'pre_approved_users', memberEmail.toLowerCase()));
      setEditingMember(null);
    } catch (err) { console.error(err); }
  };

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return leads.filter(lead => {
      const matchesSearch = !q || lead.firstName.toLowerCase().includes(q) || lead.lastName.toLowerCase().includes(q) || lead.email.toLowerCase().includes(q) || lead.phone.includes(searchQuery) || lead.mos.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
      const matchesMos = mosFilter === 'All' || lead.mos === mosFilter;
      const matchesRecruiter = recruiterFilter === 'All' || lead.recruiterId === recruiterFilter;
      if (!matchesSearch || !matchesStatus || !matchesSource || !matchesMos || !matchesRecruiter) return false;
      if (startDate || endDate) { const leadDate = new Date(lead.timestamp.split(' ')[0]); if (startDate && leadDate < new Date(startDate)) return false; if (endDate && leadDate > new Date(endDate)) return false; }
      return true;
    });
  }, [leads, searchQuery, statusFilter, sourceFilter, mosFilter, recruiterFilter, startDate, endDate]);

  const filteredTeam = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return team.filter(member => {
      const matchesSearch = !q || (member.displayName || '').toLowerCase().includes(q) || (member.email || '').toLowerCase().includes(q);
      const matchesPlatoon = isCommander && recruiterFilter !== 'All' ? (member.platoons || []).includes(recruiterFilter) : true;
      return matchesSearch && matchesPlatoon;
    });
  }, [team, searchQuery, recruiterFilter, isCommander]);

  // Pagination
  const totalPages = useMemo(() => {
    const count = activeTab === 'funnel' ? filteredLeads.length : filteredTeam.length;
    return Math.max(1, Math.ceil(count / ITEMS_PER_PAGE));
  }, [activeTab, filteredLeads.length, filteredTeam.length]);

  const paginatedLeads = useMemo(() => filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredLeads, currentPage]);
  const paginatedTeam = useMemo(() => filteredTeam.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredTeam, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, sourceFilter, mosFilter, recruiterFilter, activeTab]);

  const downloadQR = async () => {
    if (!userSlug) return;
    const url = `${window.location.origin}/meet?r=${userSlug}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 500, margin: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${userSlug}.png`;
    a.click();
  };

  const exportToCSV = (dataToExport: any[]) => {
    if(dataToExport.length === 0) return;
    const allKeys = Object.keys(dataToExport[0]).filter(k => k !== 'interactions' && k !== 'id' && k !== 'notes');
    const priorityKeys = ['firstName', 'lastName', 'phone', 'email'];
    const headers = [...priorityKeys, ...allKeys.filter(k => !priorityKeys.includes(k))];
    const csvContent = [headers.join(','), ...dataToExport.map(item => headers.map(h => `"${(item[h] || '').toString().toUpperCase()}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', `Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    const cl = activeTab === 'funnel' ? filteredLeads : filteredTeam;
    if (selectedEmails.size === cl.length && cl.length > 0) setSelectedEmails(new Set());
    else setSelectedEmails(new Set(cl.map(l => l.email)));
  };

  const toggleSelectEmail = (email: string) => {
    const ns = new Set(selectedEmails);
    if (ns.has(email)) ns.delete(email); else ns.add(email);
    setSelectedEmails(ns);
  };

  const handleBulkAction = async (action: 'status' | 'transfer' | 'role' | 'delete' | 'platoon', val?: string) => {
    try {
      const col = activeTab === 'funnel' ? leads : team;
      const dbCol = activeTab === 'funnel' ? 'leads' : 'users';
      const items = col.filter(item => selectedEmails.has(item.email));

      if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedEmails.size} records?`)) return;
        await Promise.all(items.map(item => deleteDoc(doc(db, dbCol, item.id as string))));
      } else if (action === 'status') {
        await Promise.all(items.map(item => updateDoc(doc(db, dbCol, item.id as string), { status: val })));
      } else if (action === 'role') {
        await Promise.all(items.map(item => updateDoc(doc(db, dbCol, item.id as string), { role: val })));
      } else if (action === 'transfer') {
        const tr = team.find(t => t.uid === val);
        if(!tr) return;
        await Promise.all(items.map(item => updateDoc(doc(db, dbCol, item.id as string), { recruiterId: tr.uid, recruiterName: tr.displayName || 'Recruiter', platoon: tr.platoons && tr.platoons.length > 0 ? tr.platoons[0] : 'HQ' })));
      } else if (action === 'platoon') {
        if (!val) return;
        await Promise.all(items.map(item => updateDoc(doc(db, dbCol, item.id as string), { platoon: val })));
      }
      setSelectedEmails(new Set());
    } catch (err) { console.error(err); }
  };

  const { chartData, statusCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return {
      statusCounts: counts,
      chartData: [
        { name: 'New', value: counts['New'] || 0, color: '#FFD530' },
        { name: 'Contacted', value: counts['Contacted'] || 0, color: '#3b82f6' },
        { name: 'Appt Set', value: counts['Appointment'] || 0, color: '#a855f7' },
        { name: 'Qualified', value: counts['Qualified'] || 0, color: '#10b981' },
        { name: 'Enlisted', value: counts['Enlisted'] || 0, color: '#ffffff' },
      ]
    };
  }, [leads]);

  const dynamicSourceData = useMemo(() => {
    const sourceCount = leads.reduce((acc: Record<string, number>, lead) => {
      const s = lead.source || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc;
    }, {});
    return Object.keys(sourceCount).map((key, index) => ({ name: key, count: sourceCount[key], color: CHART_COLORS[index % CHART_COLORS.length] }));
  }, [leads]);

  if (!isFirebaseAuthenticated || !userRole || userRole === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-army-black p-4 relative overflow-hidden">
        <div className="scanline" />
        <div className="w-full max-w-md hud-border p-6 md:p-8 border-army-gold/30 text-center">
          <ShieldAlert className="w-12 h-12 text-army-gold mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase tracking-tight glow-text">Secure Access</h2>
          <div className="mt-8 space-y-4">
            {userRole === 'pending' ? (
              <p className="text-army-gold text-xs font-mono uppercase bg-army-gold/10 p-4 border border-army-gold/30">Pending Admin Approval.</p>
            ) : !isFirebaseAuthenticated ? (
              <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="w-full bg-white text-black py-4 font-black uppercase text-xs">Sign In with Google</button>
            ) : error ? (
              <div className="space-y-4">
                <p className="text-red-400 text-xs font-mono bg-red-500/10 p-4 border border-red-500/30">{error}</p>
                <button onClick={() => { setError(''); signOut(auth); }} className="w-full bg-army-gold text-army-black py-3 font-black uppercase text-xs">Try Again</button>
              </div>
            ) : <Loader2 className="w-8 h-8 text-army-gold animate-spin mx-auto" />}
            <button onClick={onBack} className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mt-4">Abort Mission</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-army-black text-white font-sans flex relative overflow-hidden">
      <div className="scanline pointer-events-none" />
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" />

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 w-full z-50 bg-zinc-950 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between px-2 md:px-6 pt-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center md:items-start gap-0.5 mb-2 md:mb-0 md:mr-8">
          <h1 className="font-sans font-black text-army-gold text-lg md:text-xl tracking-tighter leading-none">GUARD<span className="text-white">LINK</span></h1>
          <span className="opacity-40 text-[8px] font-mono uppercase">V0.42_STABLE</span>
        </div>

        <div className="w-full flex-1 flex justify-around md:justify-start items-center gap-1 md:gap-4">
          {/* Tabs */}
          <button onClick={() => setActiveTab('funnel')} className={cn("flex flex-col items-center gap-1 p-2 md:px-4 md:py-2 md:flex-row rounded transition-all", activeTab === 'funnel' ? "text-army-gold bg-army-gold/10" : "text-zinc-400 hover:text-army-gold hover:bg-zinc-900")}>
            <Filter className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Funnel</span>
          </button>
          <button onClick={() => setActiveTab('mission')} className={cn("flex flex-col items-center gap-1 p-2 md:px-4 md:py-2 md:flex-row rounded transition-all", activeTab === 'mission' ? "text-army-gold bg-army-gold/10" : "text-zinc-400 hover:text-army-gold hover:bg-zinc-900")}>
            <Target className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Mission</span>
          </button>
          <button onClick={() => setActiveTab('intake')} className={cn("flex flex-col items-center gap-1 p-2 md:px-4 md:py-2 md:flex-row rounded transition-all", activeTab === 'intake' ? "text-army-gold bg-army-gold/10" : "text-zinc-400 hover:text-army-gold hover:bg-zinc-900")}>
            <Upload className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Intake</span>
          </button>
          {(userRole === 'admin' || isCommander) && (
            <button onClick={() => setActiveTab('team')} className={cn("flex flex-col items-center gap-1 p-2 md:px-4 md:py-2 md:flex-row rounded transition-all", activeTab === 'team' ? "text-army-gold bg-army-gold/10" : "text-zinc-400 hover:text-army-gold hover:bg-zinc-900")}>
              <Users className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Team</span>
            </button>
          )}

          {/* New Lead Button */}
          <div className="md:ml-auto">
            <button onClick={() => setShowAddLeadModal(true)} className="bg-army-gold text-army-black font-black p-3 md:px-4 md:py-2 rounded-full md:rounded flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,213,48,0.3)]">
              <Plus className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-[10px] uppercase">New Lead</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pb-32 md:pb-20 w-full">
        <header className="bg-army-black/80 backdrop-blur-md border-b border-zinc-900 py-3 md:py-4 px-4 md:px-6 flex justify-between items-center sticky top-0 z-[40]">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-zinc-900 text-zinc-400 hover:text-army-gold transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                className="bg-zinc-950 border border-zinc-800 text-xs font-mono uppercase py-2 pl-10 pr-4 w-64 focus:border-army-gold transition-all outline-none text-white" 
                placeholder="QUERY_DATABASE..." 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-army-gold/5 border border-army-gold/20">
              <div className="w-8 h-8 bg-army-gold flex items-center justify-center text-army-black font-black text-xs">{profileData.lastName?.substring(0,2).toUpperCase() || 'RC'}</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-tighter">{`${profileData.lastName}${profileData.firstName ? ', ' + profileData.firstName : ''}`.trim() || 'Recruiter'}</span>
                <span className="text-[8px] font-mono text-army-gold uppercase">{isCommander ? 'Tiguere' : userRole === 'admin' ? 'Section Chief' : 'Field Agent'}</span>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)} className="text-zinc-500 hover:text-army-gold"><Settings className="w-5 h-5" /></button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-zinc-500 hover:text-army-gold">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={() => setShowLogoutConfirm(true)} className="text-zinc-500 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats — clickable tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={() => handleTileClick('All')} className={cn("hud-border p-4 md:p-6 flex items-center justify-between text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95", statusFilter === 'All' && "ring-2 ring-neon-cyan/50")}><div className="text-neon-cyan"><p className="text-[10px] uppercase font-black">Total Pipeline</p><p className="text-3xl font-black">{leads.length}</p></div><Users className="w-6 h-6 text-neon-cyan/50" /></button>
                <button onClick={() => handleTileClick('New')} className={cn("hud-border p-4 md:p-6 flex items-center justify-between text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95", statusFilter === 'New' && "ring-2 ring-neon-green/50")}><div className="text-neon-green"><p className="text-[10px] uppercase font-black">New Intel</p><p className="text-3xl font-black">{statusCounts['New'] || 0}</p></div><TrendingUp className="w-6 h-6 text-neon-green/50" /></button>
                <button onClick={() => handleTileClick('Appointment')} className={cn("hud-border p-4 md:p-6 flex items-center justify-between text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95", statusFilter === 'Appointment' && "ring-2 ring-purple-500/50")}><div className="text-purple-500"><p className="text-[10px] uppercase font-black">Appointments</p><p className="text-3xl font-black">{statusCounts['Appointment'] || 0}</p></div><Clock className="w-6 h-6 text-purple-500/50" /></button>
                <button onClick={() => handleTileClick('Enlisted')} className={cn("hud-border p-4 md:p-6 flex items-center justify-between text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-95", statusFilter === 'Enlisted' && "ring-2 ring-white/30")}><div className="text-white"><p className="text-[10px] uppercase font-black">Enlistments</p><p className="text-3xl font-black">{statusCounts['Enlisted'] || 0}</p></div><CheckCircle className="w-6 h-6 text-white/50" /></button>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 hud-border p-6 h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} /><XAxis dataKey="name" stroke="#52525b" fontSize={10} /><YAxis stroke="#52525b" fontSize={10} /><Tooltip contentStyle={{backgroundColor: '#030000', border: '1px solid rgba(255,213,48,0.3)'}} /><Bar dataKey="value" fill="#FFD530">{chartData.map((e,i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer></div>
                <div className="hud-border p-6 h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dynamicSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="count">{dynamicSourceData.map((e,i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{backgroundColor: '#030000', border: '1px solid rgba(255,213,48,0.3)'}} /></PieChart></ResponsiveContainer></div>
              </div>
            </>
          )}

        {/* Intake Tab */}
        {(activeTab as string) === 'intake' && (
          <div className="hud-border bg-army-black/50 p-4 md:p-6">
            <LeadIntake onImportComplete={() => setActiveTab('candidates')} userPlatoons={userPlatoons} />
          </div>
        )}

        {/* Mission Control Tab */}
        {(activeTab as string) === 'mission' && (
          <div className="hud-border bg-army-black/50 p-4 md:p-6">
            <MissionControl leads={leads} recruiterUid={auth.currentUser?.uid} userRole={userRole} />
          </div>
        )}

        {/* Main Data Area */}
        {((activeTab as string) === 'funnel' || (activeTab as string) === 'team') && (
          <div className="hud-border bg-army-black/50">
          <div className="p-4 border-b border-army-gold/10 flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black uppercase glow-text tracking-widest">{activeTab} ({activeTab === 'funnel' ? filteredLeads.length : filteredTeam.length})</h3>
              {statusFilter !== 'All' && <button onClick={() => { setStatusFilter('All'); setCurrentPage(1); }} className="flex items-center gap-1 px-2 py-1 bg-army-gold/10 border border-army-gold/30 text-army-gold text-[9px] font-black uppercase hover:bg-army-gold/20"><span>Filtered: {statusFilter}</span><X className="w-3 h-3" /></button>}
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {activeTab !== 'team' && <button onClick={() => setShowAddLeadModal(true)} className="px-4 py-2 bg-army-gold/10 text-army-gold text-[10px] font-black uppercase"><Plus className="w-4 h-4 inline mr-2"/>Add</button>}
              {activeTab === 'funnel' && <button onClick={() => { if(userRole==='admin'||isCommander) setShowCSVModal(true); else fileInputRef.current?.click(); }} className="px-4 py-2 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase hover:text-army-gold"><Upload className="w-4 h-4 inline mr-2"/>CSV</button>}
              {activeTab !== 'team' && <button onClick={() => exportToCSV(activeTab === 'funnel' ? filteredLeads : [])} className="px-4 py-2 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase hover:text-army-gold"><Download className="w-4 h-4 inline mr-2"/>Export</button>}
              {activeTab === 'team' && <button onClick={() => setShowCreateRecruiter(true)} className="px-4 py-2 bg-army-gold/10 text-army-gold text-[10px] font-black uppercase"><UserPlus className="w-4 h-4 inline mr-2"/>Create</button>}
              <div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><input placeholder="Search..." className="bg-zinc-950 border border-zinc-800 py-1 pl-8 pr-2 text-xs w-48 focus:border-army-gold outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
              <button onClick={() => setShowFilters(!showFilters)} className={cn("p-2 border", showFilters ? "bg-army-gold/10 border-army-gold text-army-gold" : "bg-zinc-900 border-zinc-800 text-zinc-500")}><Filter className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Filters Expanded */}
          {showFilters && (
            <div className="p-4 border-b border-army-gold/10 bg-army-gold/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black uppercase">
              {activeTab !== 'team' && <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-army-black border p-2"><option value="All">All Statuses</option>{LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>}
              {(userRole === 'admin' || isCommander) && <select value={recruiterFilter} onChange={e => setRecruiterFilter(e.target.value)} className="bg-army-black border p-2"><option value="All">All Team / Platoons</option>{activeTab==='team'&&isCommander ? PLATOONS.map(p => <option key={p} value={p}>{p}</option>) : team.map(m => <option key={m.uid} value={m.uid}>{m.displayName} ({(m.platoons||[]).join()})</option>)}</select>}
            </div>
          )}

          {/* Bulk Action Bar */}
          {selectedEmails.size > 0 && activeTab === 'funnel' && (
            <div className="bg-army-gold p-3 flex justify-between items-center text-black text-[10px] font-black uppercase">
              <div className="flex gap-4 items-center">
                <span>{selectedEmails.size} Selected</span>
                {activeTab !== 'team' && <select onChange={e => handleBulkAction('status', e.target.value)} className="bg-black text-army-gold p-1"><option value="">Change Status</option>{LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>}
                {activeTab !== 'team' && isCommander && <select onChange={e => handleBulkAction('platoon', e.target.value)} className="bg-black text-neon-green p-1"><option value="">Move to Team</option>{PLATOONS.map(p => <option key={p} value={p}>{p}</option>)}</select>}
                {activeTab !== 'team' && <select onChange={e => handleBulkAction('transfer', e.target.value)} className="bg-black text-neon-cyan p-1"><option value="">Transfer to Recruiter</option>{(isCommander ? team : team.filter(m => (m.platoons || []).some((p: string) => userPlatoons.includes(p)))).map(m => <option key={m.uid} value={m.uid}>{m.displayName} ({(m.platoons||[]).join(', ')})</option>)}</select>}
                {activeTab === 'team' && <select onChange={e => handleBulkAction('role', e.target.value)} className="bg-black text-army-gold p-1"><option value="">Change Role</option><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select>}
                <button onClick={() => handleBulkAction('delete')} className="bg-red-600 text-white px-2 py-1"><Trash2 className="w-3 h-3 inline mr-1"/>Delete</button>
              </div>
              <button onClick={() => setSelectedEmails(new Set())}>Cancel</button>
            </div>
          )}

          {/* RENDERING: FUNNEL vs TEAM */}
          {isLoading ? <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-army-gold mx-auto" /></div> :
          activeTab === 'funnel' ? (
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {LEAD_STATUSES.map((status, index) => {
                  const cols = filteredLeads.filter(l => l.status === status);
                  const isExpanded = expandedStage === status;
                  
                  // Map statuses to icons
                  const getStatusIcon = (s: string) => {
                    switch(s) {
                      case 'New': return <Inbox className="w-5 h-5" />;
                      case 'Contacted': return <PhoneCall className="w-5 h-5" />;
                      case 'Appointment': return <Calendar className="w-5 h-5" />;
                      case 'ASVAB': return <BookOpen className="w-5 h-5" />;
                      case 'Physical': return <Activity className="w-5 h-5" />;
                      case 'Waiver': return <FileWarning className="w-5 h-5" />;
                      case 'Qualified': return <Star className="w-5 h-5" />;
                      case 'Enlisted': return <CheckCircle className="w-5 h-5" />;
                      default: return <Target className="w-5 h-5" />;
                    }
                  };

                  return (
                    <div key={status} className="flex flex-col">
                      <button 
                        onClick={() => setExpandedStage(isExpanded ? null : status)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200",
                          isExpanded ? "bg-army-gold text-army-black border-army-gold" : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-army-gold"
                        )}
                      >
                        <div className="mb-2">{getStatusIcon(status)}</div>
                        <span className="text-[10px] font-black uppercase text-center mb-1">{status}</span>
                        <span className="text-xl font-black">{cols.length}</span>
                        <ChevronDown className={cn("w-4 h-4 mt-2 transition-transform", isExpanded ? "rotate-180" : "")} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Expanded Stage View */}
              <AnimatePresence>
                {expandedStage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                        <h4 className="font-black uppercase text-army-gold">{expandedStage} Candidates</h4>
                        <button onClick={() => setExpandedStage(null)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px] uppercase">
                          <thead className="text-zinc-500 font-black border-b border-zinc-800">
                            <tr>
                              <th className="p-2 w-10"><button onClick={toggleSelectAll}><Square className="w-4 h-4"/></button></th>
                              <th className="p-2">Name / Contact</th>
                              <th className="p-2">Interest</th>
                              <th className="p-2">MOS</th>
                              <th className="p-2">Date</th>
                              <th className="p-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/50">
                            {filteredLeads.filter(l => l.status === expandedStage).map(lead => {
                              const stale = isLeadStale(lead); const due = isFollowUpDue(lead);
                              return (
                                <tr key={lead.id} className={cn("hover:bg-white/5", stale && "bg-red-950/20")}>
                                  <td className="p-2"><button onClick={() => toggleSelectEmail(lead.email)} className={selectedEmails.has(lead.email)?"text-army-gold":"text-zinc-500"}>{selectedEmails.has(lead.email) ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}</button></td>
                                  <td className="p-2 font-black">
                                    <div className={stale ? "text-red-400" : "text-white"}>
                                      {stale && <AlertTriangle className="w-3 h-3 inline mr-1 text-red-500" />}
                                      {toUpper(lead.lastName)}, {toUpper(lead.firstName)}
                                      {due && <span className="bg-army-gold text-black px-1 ml-2 text-[8px] font-black animate-pulse">DUE</span>}
                                    </div>
                                    <div className="text-zinc-500">{lead.email} • {lead.phone}</div>
                                  </td>
                                  <td className="p-2 text-zinc-400">{lead.interest}</td>
                                  <td className="p-2 text-army-gold">{lead.mos}</td>
                                  <td className="p-2 text-zinc-500 font-mono">{lead.timestamp.split('T')[0]}</td>
                                  <td className="p-2 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1">
                                      <a href={`tel:${lead.phone}`} className="p-1 text-zinc-500 hover:text-neon-green"><Phone className="w-4 h-4"/></a>
                                      <a href={getCommsLink('sms', lead)} className="p-1 text-zinc-500 hover:text-neon-cyan"><MessageSquare className="w-4 h-4"/></a>
                                      <a href={getCommsLink('email', lead)} className="p-1 text-zinc-500 hover:text-army-gold"><Mail className="w-4 h-4"/></a>
                                      <button onClick={()=>setEditingLead(lead)} className="p-1 text-zinc-500 hover:text-army-gold"><Edit className="w-4 h-4"/></button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] uppercase">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black border-b border-zinc-800">
                  <tr>
                    <th className="p-4 w-10"><button onClick={toggleSelectAll}><Square className="w-4 h-4"/></button></th>
                    <th className="p-4">Name / Contact</th>
                    {activeTab !== 'team' ? <th className="p-4">Status</th> : <th className="p-4">Role</th>}
                    {activeTab === 'funnel' && <><th className="p-4">Interest</th><th className="p-4">MOS</th></>}
                    {activeTab === 'team' && <th className="p-4">Platoons</th>}
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {activeTab === 'funnel' ? paginatedLeads.map(lead => {
                    const stale = isLeadStale(lead); const due = isFollowUpDue(lead);
                    return (
                      <tr key={lead.id} className={cn("hover:bg-white/5", stale && "bg-red-950/20")}>
                        <td className="p-4"><button onClick={() => toggleSelectEmail(lead.email)} className={selectedEmails.has(lead.email)?"text-army-gold":"text-zinc-500"}>{selectedEmails.has(lead.email) ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}</button></td>
                        <td className="p-4 font-black">
                          <div className={stale ? "text-red-400" : "text-white"}>
                            {stale && <AlertTriangle className="w-3 h-3 inline mr-1 text-red-500" />}
                            {toUpper(lead.lastName)}, {toUpper(lead.firstName)}
                            {due && <span className="bg-army-gold text-black px-1 ml-2 text-[8px] font-black animate-pulse">DUE</span>}
                          </div>
                          <div className="text-zinc-500">{lead.email} • {lead.phone}</div>
                          <div className="text-[8px] text-army-gold mt-1">Assigned: {lead.recruiterName} ({lead.platoon})</div>
                        </td>
                        <td className="p-4"><select value={lead.status} onChange={e=>handleInlineStatusUpdate(lead.id as string, e.target.value)} className="bg-zinc-900 border border-zinc-800 p-1 text-[9px] uppercase font-black">{LEAD_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                        <td className="p-4 text-zinc-400">{lead.interest}</td>
                        <td className="p-4 text-army-gold">{lead.mos}</td>
                        <td className="p-4 text-zinc-500 font-mono">{lead.timestamp.split('T')[0]}</td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <a href={`tel:${lead.phone}`} className="p-2 text-zinc-500 hover:text-neon-green inline-flex items-center justify-center"><Phone className="w-4 h-4"/></a>
                            <a href={getCommsLink('sms', lead)} className="p-2 text-zinc-500 hover:text-neon-cyan inline-flex items-center justify-center"><MessageSquare className="w-4 h-4"/></a>
                            <a href={getCommsLink('email', lead)} className="p-2 text-zinc-500 hover:text-army-gold inline-flex items-center justify-center"><Mail className="w-4 h-4"/></a>
                            <button onClick={()=>setJourneyLead(lead)} className="p-2 text-zinc-500 hover:text-army-gold inline-flex items-center justify-center"><History className="w-4 h-4"/></button>
                            <button onClick={()=>setEditingLead(lead)} className="p-2 text-zinc-500 hover:text-army-gold inline-flex items-center justify-center"><Edit className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : paginatedTeam.map(m => (
                    <tr key={m.id} className="hover:bg-white/5">
                      <td className="p-4"><button onClick={() => toggleSelectEmail(m.email)} className={selectedEmails.has(m.email)?"text-army-gold":"text-zinc-500"}>{selectedEmails.has(m.email) ? <CheckSquare className="w-4 h-4"/> : <Square className="w-4 h-4"/>}</button></td>
                      <td className="p-4 font-black"><div className="text-white">{m.displayName}</div><div className="text-zinc-500">{m.email}</div></td>
                      <td className="p-4"><select value={m.role} onChange={e=>handleInlineRoleUpdate(m.id, e.target.value)} className="bg-zinc-900 border border-zinc-800 p-1 text-[9px] uppercase font-black"><option value="recruiter">RECRUITER</option><option value="admin">ADMIN</option></select></td>
                      <td className="p-4 text-neon-cyan">{(m.platoons||[]).join(', ')}</td><td className="p-4 text-zinc-500 font-mono">{m.createdAt?.split('T')[0]}</td>
                      <td className="p-4 text-right"><button onClick={()=>setEditingMember(m)} className="p-2 text-zinc-500 hover:text-army-gold"><Edit className="w-4 h-4 inline"/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && activeTab === 'funnel' && (
            <div className="p-4 border-t border-army-gold/10 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-zinc-500">
                Page {currentPage} of {totalPages} — Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, activeTab === 'funnel' ? filteredLeads.length : filteredTeam.length)} of {activeTab === 'funnel' ? filteredLeads.length : filteredTeam.length}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={cn("px-3 py-1 text-[10px] font-black uppercase border", currentPage === 1 ? "border-zinc-800 text-zinc-600 cursor-not-allowed" : "border-army-gold/30 text-army-gold hover:bg-army-gold/10")}>First</button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={cn("px-3 py-1 text-[10px] font-black uppercase border", currentPage === 1 ? "border-zinc-800 text-zinc-600 cursor-not-allowed" : "border-army-gold/30 text-army-gold hover:bg-army-gold/10")}>Prev</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={cn("px-3 py-1 text-[10px] font-black uppercase border", currentPage === totalPages ? "border-zinc-800 text-zinc-600 cursor-not-allowed" : "border-army-gold/30 text-army-gold hover:bg-army-gold/10")}>Next</button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={cn("px-3 py-1 text-[10px] font-black uppercase border", currentPage === totalPages ? "border-zinc-800 text-zinc-600 cursor-not-allowed" : "border-army-gold/30 text-army-gold hover:bg-army-gold/10")}>Last</button>
              </div>
            </div>
          )}
          </div>
        )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Create Recruiter Modal */}
      {showCreateRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-md p-6">
            <div className="flex justify-between mb-6"><h3 className="text-xl font-black text-army-gold uppercase">Create Recruiter</h3><button onClick={()=>setShowCreateRecruiter(false)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <form onSubmit={handleCreateRecruiter} className="space-y-4">
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Email</label><input type="email" required value={createRecruiterEmail} onChange={e=>setCreateRecruiterEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-army-gold"/></div>
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Name</label><input type="text" required value={createRecruiterName} onChange={e=>setCreateRecruiterName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-army-gold"/></div>
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Role</label><select value={createRecruiterRole} onChange={e=>setCreateRecruiterRole(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none"><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select></div>
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Platoon Access (Keycards)</label><div className="flex gap-2 flex-wrap">{PLATOONS.map(p=><label key={p} className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-[10px] font-black text-white flex items-center gap-2"><input type="checkbox" checked={createRecruiterPlatoons.includes(p)} onChange={e=>{const updated = e.target.checked ? [...createRecruiterPlatoons, p] : createRecruiterPlatoons.filter(x=>x!==p); setCreateRecruiterPlatoons(updated);}} className="accent-army-gold"/>{p}</label>)}</div></div>
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Slug Link</label><input type="text" required value={createRecruiterSlug} onChange={e=>setCreateRecruiterSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="e.g. john-doe" className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-army-gold"/><p className="text-[9px] text-zinc-600 mt-1">Lowercase letters, numbers, and dashes only</p></div>
              <div className="bg-neon-cyan/5 border border-neon-cyan/20 p-3 mt-2"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={transferLeadsOnCreate} onChange={e => setTransferLeadsOnCreate(e.target.checked)} className="accent-neon-cyan w-4 h-4" /><div><span className="text-[10px] font-black uppercase text-neon-cyan">Transfer Unassigned Leads</span><p className="text-[9px] text-zinc-500 mt-0.5">Auto-assign unassigned leads from selected platoon(s) to this recruiter</p></div></label></div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-800"><button type="button" onClick={()=>setShowCreateRecruiter(false)} className="px-4 py-2 font-black uppercase text-[10px] text-zinc-500">Cancel</button><button type="submit" className="px-4 py-2 font-black uppercase text-[10px] bg-army-gold text-black">Pre-Approve</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-md p-6">
            <div className="flex justify-between mb-6"><h3 className="text-xl font-black text-army-gold uppercase">Manage Recruiter</h3><button onClick={()=>setEditingMember(null)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Role</label><select value={editingMember.role||'recruiter'} onChange={e=>setEditingMember({...editingMember, role: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none"><option value="recruiter">Recruiter</option><option value="admin">Admin</option></select></div>
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Platoon Access (Keycards)</label><div className="flex gap-2 flex-wrap">{PLATOONS.map(p=><label key={p} className="bg-zinc-900 border border-zinc-800 px-3 py-2 text-[10px] font-black text-white flex items-center gap-2"><input type="checkbox" checked={(editingMember.platoons||[]).includes(p)} onChange={e=>{const curr = editingMember.platoons||[]; const updated = e.target.checked ? [...curr, p] : curr.filter((x:string)=>x!==p); setEditingMember({...editingMember, platoons: updated});}} className="accent-army-gold"/>{p}</label>)}</div></div>
              <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Slug Link</label><input type="text" value={editingMember.slug||''} onChange={e=>setEditingMember({...editingMember, slug: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white outline-none focus:border-army-gold"/></div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block flex items-center gap-2"><MapPin className="w-3 h-3 text-army-gold"/>Assigned Zip Codes</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" inputMode="numeric" maxLength={5} placeholder="ZIP CODE" value={editingMember._newZip||''} onChange={e=>setEditingMember({...editingMember, _newZip: e.target.value.replace(/\D/g,'')})} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();const z=(editingMember._newZip||'').trim();if(z.length===5){const cur=editingMember.assignedZipCodes||[];if(!cur.includes(z)){setEditingMember({...editingMember,assignedZipCodes:[...cur,z].sort(),_newZip:''});}else{setEditingMember({...editingMember,_newZip:''});}}}}} className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs font-black uppercase outline-none focus:border-army-gold"/>
                  <button type="button" onClick={()=>{const z=(editingMember._newZip||'').trim();if(z.length===5){const cur=editingMember.assignedZipCodes||[];if(!cur.includes(z)){setEditingMember({...editingMember,assignedZipCodes:[...cur,z].sort(),_newZip:''});}else{setEditingMember({...editingMember,_newZip:''});}}}} disabled={!editingMember._newZip||editingMember._newZip.length!==5} className="px-3 py-2 bg-army-gold text-army-black text-xs font-black uppercase disabled:opacity-40">+ Add</button>
                </div>
                {(editingMember.assignedZipCodes||[]).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(editingMember.assignedZipCodes||[]).map((zip: string)=>(
                      <span key={zip} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 rounded">{zip}<button type="button" onClick={()=>setEditingMember({...editingMember,assignedZipCodes:(editingMember.assignedZipCodes||[]).filter((z:string)=>z!==zip)})} className="text-zinc-500 hover:text-red-400 transition-colors font-black text-[10px]">✕</button></span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-600 italic">No zip codes assigned.</p>
                )}
                <p className="text-[9px] text-zinc-600 mt-1.5">Leads matching these zips will auto-transfer to this recruiter on save.</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800"><button type="button" onClick={()=>handleDeleteMember(editingMember.uid, editingMember.email)} className="text-red-500 font-black text-[10px] uppercase"><Trash2 className="w-3 h-3 inline mr-1"/>Revoke Access</button><div className="flex gap-2"><button type="button" onClick={()=>setEditingMember(null)} className="px-4 py-2 font-black uppercase text-[10px] text-zinc-500">Cancel</button><button type="submit" className="px-4 py-2 font-black uppercase text-[10px] bg-army-gold text-black">Update</button></div></div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-sm p-6">
            <div className="flex justify-between mb-6"><h3 className="text-xl font-black text-army-gold uppercase">Import CSV</h3><button onClick={()=>setShowCSVModal(false)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Assign Leads To:</label>
            <select value={csvAssignee} onChange={e=>setCsvAssignee(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white mb-4"><option value="">-- Select --</option>{team.map(t=><option key={t.uid} value={t.uid}>{t.displayName}</option>)}</select>
            <button onClick={()=>{if(!csvAssignee){alert("Select recruiter");return;} fileInputRef.current?.click();}} className="w-full bg-army-gold text-black py-3 font-black uppercase text-[10px]"><Upload className="w-3 h-3 inline mr-2"/>Select File</button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-sm p-8 text-center border-red-500/30">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Confirm_Logout</h3>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 border border-zinc-800 text-zinc-400 font-black uppercase text-xs hover:bg-zinc-900">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-xs hover:bg-red-700">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-army-gold">Profile_Settings</h3>
              <div className="flex items-center gap-4">
                {userSlug && <button onClick={downloadQR} className="flex items-center gap-2 px-3 py-1 bg-army-gold/10 text-army-gold text-[10px] font-black uppercase"><QrCode className="w-4 h-4" /> Download_QR</button>}
                <button onClick={() => setShowProfileModal(false)}><X className="text-zinc-500 hover:text-white" /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-6 flex-1 scrollbar-hide">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Profile Photo</h4>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-army-gold/40 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                      {profileData.photoURL ? <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="w-8 h-8 text-zinc-600" />}
                    </div>
                    <div>
                      <label className="px-4 py-2 bg-army-gold/10 border border-army-gold/30 text-army-gold text-[10px] font-black uppercase cursor-pointer hover:bg-army-gold/20 transition-colors inline-flex items-center gap-2">
                        {isUploadingPhoto ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</> : <><Upload className="w-3 h-3" /> Upload Photo</>}
                        <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} disabled={isUploadingPhoto} />
                      </label>
                      <p className="text-[9px] text-zinc-600 mt-2">Shows on your landing page and Meet Your Recruiter page</p>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Personal Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Rank</label><input type="text" value={profileData.rank} onChange={e=>setProfileData({...profileData, rank: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">First Name</label><input type="text" value={profileData.firstName} onChange={e=>setProfileData({...profileData, firstName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Last Name</label><input type="text" value={profileData.lastName} onChange={e=>setProfileData({...profileData, lastName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  </div>
                  <div className="mt-4">
                    <label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Your Slug (URL Link)</label>
                    <input type="text" value={profileData.slug} onChange={e=>setProfileData({...profileData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" placeholder="e.g. lantigua"/>
                    <p className="text-[9px] text-zinc-500 mt-1">Your public link: <span className="text-army-gold">guardlink.site/?r={profileData.slug || '...'}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Contact Methods</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Cell</label><input type="text" value={profileData.cellPhone} onChange={e=>setProfileData({...profileData, cellPhone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Office</label><input type="text" value={profileData.officePhone} onChange={e=>setProfileData({...profileData, officePhone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Ext</label><input type="text" value={profileData.officeExt} onChange={e=>setProfileData({...profileData, officeExt: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Email</label><input type="text" value={profileData.publicEmail} onChange={e=>setProfileData({...profileData, publicEmail: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Address</label><input type="text" value={profileData.address1} onChange={e=>setProfileData({...profileData, address1: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">City</label><input type="text" value={profileData.city} onChange={e=>setProfileData({...profileData, city: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Zip</label><input type="text" value={profileData.zip} onChange={e=>setProfileData({...profileData, zip: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><Instagram className="w-3 h-3"/>Instagram</label><input type="text" value={profileData.instagram} onChange={e=>setProfileData({...profileData, instagram: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><Facebook className="w-3 h-3"/>Facebook</label><input type="text" value={profileData.facebook} onChange={e=>setProfileData({...profileData, facebook: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><Linkedin className="w-3 h-3"/>LinkedIn</label><input type="text" value={profileData.linkedin} onChange={e=>setProfileData({...profileData, linkedin: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><Youtube className="w-3 h-3"/>YouTube</label><input type="text" value={profileData.youtube} onChange={e=>setProfileData({...profileData, youtube: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><LinkIcon className="w-3 h-3"/>Linktree</label><input type="text" value={profileData.linktree} onChange={e=>setProfileData({...profileData, linktree: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">TikTok</label><input type="text" value={profileData.tiktok} onChange={e=>setProfileData({...profileData, tiktok: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Meet Your Recruiter — Questionnaire</h4>
                  <p className="text-[9px] text-zinc-500 mb-3">These answers show on your public "Meet Your Recruiter" page. Share your link: <span className="text-army-gold">{userSlug ? `guardlink.site/meet?r=${userSlug}` : 'Set your slug first'}</span></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Why did you join the Guard?</label><textarea value={profileData.whyJoined} onChange={e=>setProfileData({...profileData, whyJoined: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-20 text-xs" placeholder="I joined because..."/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">What's your civilian career?</label><textarea value={profileData.civilianCareer} onChange={e=>setProfileData({...profileData, civilianCareer: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-20 text-xs" placeholder="Outside the Guard, I work as..."/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">What do you like most about serving?</label><textarea value={profileData.favoritePartOfServing} onChange={e=>setProfileData({...profileData, favoritePartOfServing: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-20 text-xs" placeholder="My favorite part is..."/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Favorite hobbies?</label><textarea value={profileData.favoriteHobbies} onChange={e=>setProfileData({...profileData, favoriteHobbies: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-20 text-xs" placeholder="When I'm off duty, I enjoy..."/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Favorite place you've traveled?</label><textarea value={profileData.favoriteTravelPlace} onChange={e=>setProfileData({...profileData, favoriteTravelPlace: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-20 text-xs" placeholder="The best place I've been is..."/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block">Message to future soldiers</label><textarea value={profileData.messageToProspects} onChange={e=>setProfileData({...profileData, messageToProspects: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-20 text-xs" placeholder="If you're thinking about joining..."/></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-4 border-b border-zinc-800 pb-2">Quick-Comms Templates</h4>
                  <p className="text-[9px] text-zinc-500 mb-3">Use <span className="text-army-gold">{'{{name}}'}</span> for lead name and <span className="text-army-gold">{'{{recruiter}}'}</span> for your name.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><MessageSquare className="w-3 h-3"/>SMS Template</label><textarea value={profileData.smsTemplate} onChange={e=>setProfileData({...profileData, smsTemplate: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-24 text-xs" placeholder="Hey {{name}}, this is {{recruiter}}..."/></div>
                    <div><label className="text-[10px] text-army-gold font-black uppercase mb-1 block flex items-center gap-1"><Mail className="w-3 h-3"/>Email Template</label><textarea value={profileData.emailTemplate} onChange={e=>setProfileData({...profileData, emailTemplate: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none h-24 text-xs" placeholder="Hello {{name}},\n\nThank you for..."/></div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-800"><button type="button" onClick={()=>setShowProfileModal(false)} className="px-4 py-2 font-black uppercase text-[10px] text-zinc-500">Cancel</button><button type="submit" className="px-4 py-2 font-black uppercase text-[10px] bg-army-gold text-black">Save</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-md p-6">
            <div className="flex justify-between mb-6"><h3 className="text-xl font-black text-army-gold uppercase">Add Record</h3><button onClick={()=>setShowAddLeadModal(false)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <form onSubmit={handleManualAddLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">First Name</label><input type="text" required value={newLeadData.firstName} onChange={e=>setNewLeadData({...newLeadData, firstName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Last Name</label><input type="text" required value={newLeadData.lastName} onChange={e=>setNewLeadData({...newLeadData, lastName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Phone</label><input type="tel" required value={newLeadData.phone} onChange={e=>setNewLeadData({...newLeadData, phone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Email</label><input type="email" required value={newLeadData.email} onChange={e=>setNewLeadData({...newLeadData, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
              </div>
              {activeTab === 'leads' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Age</label><input type="text" value={newLeadData.age} onChange={e=>setNewLeadData({...newLeadData, age: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Source</label><input type="text" value={newLeadData.source} onChange={e=>setNewLeadData({...newLeadData, source: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">MOS</label><input type="text" value={newLeadData.mos} onChange={e=>setNewLeadData({...newLeadData, mos: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"/></div>
                  <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Interest</label><select value={newLeadData.interest} onChange={e=>setNewLeadData({...newLeadData, interest: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"><option value="Enlisted">Enlisted</option><option value="Officer">Officer</option><option value="Warrant">Warrant</option></select></div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-zinc-800"><button type="button" onClick={()=>setShowAddLeadModal(false)} className="px-4 py-2 font-black uppercase text-[10px] text-zinc-500">Cancel</button><button type="submit" className="px-4 py-2 font-black uppercase text-[10px] bg-army-gold text-black">Add</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center"><h3 className="text-xl font-black uppercase italic text-army-gold">Edit_Intel_Record</h3><button onClick={() => setEditingLead(null)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <div className="overflow-y-auto scrollbar-hide flex-1">
              <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">First Name</label><input type="text" value={editingLead.firstName} onChange={e => setEditingLead({...editingLead, firstName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" required /></div>
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">Last Name</label><input type="text" value={editingLead.lastName} onChange={e => setEditingLead({...editingLead, lastName: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" required /></div>
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">Phone</label><input type="tel" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" required /></div>
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">Email</label><input type="email" value={editingLead.email} onChange={e => setEditingLead({...editingLead, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" required /></div>
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">Status</label><select value={editingLead.status} onChange={e => setEditingLead({...editingLead, status: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none">{LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">Target MOS</label><input type="text" value={editingLead.mos} onChange={e => setEditingLead({...editingLead, mos: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" /></div>
                  {/* Commander & Admin: Assign to Platoon */}
                  {(isCommander || userRole === 'admin') && (
                    <div><label className="block text-[10px] font-black uppercase text-neon-green mb-1">Assign to Team</label><select value={editingLead.platoon || 'HQ'} onChange={e => setEditingLead({...editingLead, platoon: e.target.value, _platoonManuallySet: true} as any)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none">
                      {(isCommander ? PLATOONS : userPlatoons).map(p => <option key={p} value={p}>{p}</option>)}
                    </select></div>
                  )}
                  {/* Reassign to Recruiter — Commander sees all, Admin sees own platoon, Recruiter sees nothing */}
                  {(isCommander || userRole === 'admin') && (
                    <div><label className="block text-[10px] font-black uppercase text-neon-cyan mb-1">Reassign to Recruiter</label><select value={editingLead.recruiterId || ''} onChange={e => { const r = team.find(t => t.uid === e.target.value); setEditingLead({...editingLead, recruiterId: e.target.value, recruiterName: r?.displayName || ''} as any); }} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none"><option value="">-- Unassigned --</option>
                      {(isCommander ? team : team.filter(m => (m.platoons || []).some((p: string) => userPlatoons.includes(p)))).map(m => <option key={m.uid} value={m.uid}>{m.displayName} ({(m.platoons||[]).join(', ')})</option>)}
                    </select></div>
                  )}
                  <div><label className="block text-[10px] font-black uppercase text-army-gold mb-1">Follow-Up Date</label><input type="date" value={(editingLead as any).followUpDate || ''} onChange={e => setEditingLead({...editingLead, followUpDate: e.target.value} as any)} className="w-full bg-zinc-900 border border-zinc-800 p-2 text-white outline-none" /></div>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-[10px] font-black uppercase text-zinc-500 mb-2">// Recruiter_Notes</h4>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                    {Array.isArray((editingLead as any).notes) 
                      ? ((editingLead as any).notes).map((n: any, i: number) => (<div key={i} className="bg-zinc-900 p-2 border-l-2 border-army-gold"><p className="text-xs text-white">{n.text}</p><div className="flex justify-between mt-1"><span className="text-[8px] text-zinc-500">{n.author}</span><span className="text-[8px] text-zinc-500">{new Date(n.timestamp).toLocaleDateString()}</span></div></div>))
                      : ((editingLead as any).notes ? <div className="bg-zinc-900 p-2 border-l-2 border-army-gold"><p className="text-xs text-white">{(editingLead as any).notes}</p></div> : null)
                    }
                  </div>
                  <div className="flex gap-2"><input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add note..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 text-white outline-none text-xs" /><button type="button" onClick={handleAddNote} className="px-4 bg-army-gold/10 text-army-gold text-[10px] font-black uppercase">Add</button></div>
                </div>
                <div className="pt-4 flex justify-between items-center border-t border-zinc-800"><button type="button" onClick={() => handleDeleteLead((editingLead as any).id)} className="text-red-500 text-[10px] font-black uppercase"><Trash2 className="w-4 h-4 inline mr-1"/> Delete</button><div className="flex gap-2"><button type="button" onClick={() => setEditingLead(null)} className="px-4 py-2 text-zinc-400 text-[10px] font-black uppercase">Cancel</button><button type="submit" className="px-4 py-2 bg-army-gold text-black text-[10px] font-black uppercase">Save</button></div></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {/* User Journey Modal */}
      {journeyLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-army-black/90 backdrop-blur-sm">
          <div className="hud-border bg-zinc-950 w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center"><h3 className="text-xl font-black text-army-gold uppercase">Intel_Log</h3><button onClick={() => setJourneyLead(null)}><X className="text-zinc-500 hover:text-white"/></button></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {journeyLead.interactions && journeyLead.interactions.length > 0 ? journeyLead.interactions.map((int, i) => (
                <div key={i} className="flex gap-4 items-start"><div className="w-2 h-2 rounded-full bg-army-gold mt-1" /><div className="flex-1"><div className="flex justify-between"><p className="text-[10px] font-black text-white">{int.element}</p><p className="text-[8px] text-zinc-500">{new Date(int.timestamp).toLocaleTimeString()}</p></div><p className="text-[9px] text-zinc-500 uppercase">{int.type}</p></div></div>
              )) : <div className="text-center text-zinc-500 py-8 font-black uppercase text-[10px]">No Interaction Data</div>}
            </div>
          </div>
        </div>
      )}

      {/* Shared AI Chatbot */}
      <SharedChatbot slugParam="" />

    </div>
  );
};
