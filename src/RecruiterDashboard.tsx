/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  Download,
  Activity,
  CheckSquare,
  Square,
  Trash2,
  ChevronDown,
  LogIn,
  Loader2,
  History,
  Eye,
  X,
  UserPlus,
  Moon,
  Sun
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { onSnapshot, collection, query, orderBy, updateDoc, doc, where, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Lead, Subscription } from './types';
import { cn } from './lib/utils';
import { Bell } from 'lucide-react';

// Mock Data
const MOCK_LEADS: Lead[] = [
  { timestamp: '2026-03-24 10:00', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '561-123-4567', age: '19', education: 'HS Graduate', interest: 'Enlisted', mos: '11B', source: 'Instagram', message: 'Interested in infantry.', status: 'New' },
  { timestamp: '2026-03-23 15:30', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '561-987-6543', age: '22', education: 'College Student', interest: 'Officer', mos: '68W', source: 'FAU Campus', message: 'Want to be a medic.', status: 'Contacted' },
  { timestamp: '2026-03-22 09:15', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', phone: '561-555-0199', age: '18', education: 'HS Student', interest: 'Enlisted', mos: '31B', source: 'Friend', message: 'Looking for MP info.', status: 'Qualified' },
];

const STATS_DATA = [
  { name: 'New', value: 12, color: '#FFD530' },
  { name: 'Contacted', value: 25, color: '#3b82f6' },
  { name: 'Qualified', value: 8, color: '#10b981' },
  { name: 'Scheduled', value: 5, color: '#f59e0b' },
];

const SOURCE_DATA = [
  { name: 'Instagram', count: 45 },
  { name: 'Campus', count: 32 },
  { name: 'Referral', count: 18 },
  { name: 'Search', count: 12 },
];

export const RecruiterDashboard = ({ onBack }: { onBack: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isFirebaseAuthenticated, setIsFirebaseAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'recruiter' | 'pending' | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'subscriptions' | 'team'>('leads');

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [mosFilter, setMosFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateRecruiter, setShowCreateRecruiter] = useState(false);
  const [createRecruiterEmail, setCreateRecruiterEmail] = useState('');
  const [createRecruiterName, setCreateRecruiterName] = useState('');
  const [createRecruiterRole, setCreateRecruiterRole] = useState('recruiter');
  const [createRecruiterSlug, setCreateRecruiterSlug] = useState('');
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // Selection State
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [journeyLead, setJourneyLead] = useState<Lead | null>(null);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsFirebaseAuthenticated(!!user);
      if (user) {
        try {
          // Check if admin by email first (fallback)
          const isAdminEmail = user.email?.toLowerCase() === 'angellantigua98@gmail.com';
          
          // Fetch user doc
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Fix corrupted admin role if they logged in before the case-sensitivity fix
            if (isAdminEmail && data.role !== 'admin') {
              await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
              setUserRole('admin');
            } else {
              setUserRole(data.role || (isAdminEmail ? 'admin' : 'recruiter'));
            }
            setUserSlug(data.slug || null);
          } else {
            // Auto-create admin if it's the default admin email
            if (isAdminEmail) {
              await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Admin',
                role: 'admin',
                createdAt: new Date().toISOString()
              });
              setUserRole('admin');
            } else if (user.email) {
              // Check if user is pre-approved
              const preApprovedDoc = await getDoc(doc(db, 'pre_approved_users', user.email.toLowerCase()));
              if (preApprovedDoc.exists()) {
                const preApprovedData = preApprovedDoc.data();
                await setDoc(doc(db, 'users', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || preApprovedData.displayName || 'Recruiter',
                  role: preApprovedData.role,
                  slug: preApprovedData.slug,
                  createdAt: new Date().toISOString()
                });
                setUserRole(preApprovedData.role);
                setUserSlug(preApprovedData.slug);
              } else {
                // Create pending account
                await setDoc(doc(db, 'users', user.uid), {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName || 'Recruiter',
                  role: 'pending',
                  createdAt: new Date().toISOString()
                });
                setUserRole('pending');
                setError('Account pending admin approval.');
              }
            } else {
              // Fallback if no email (shouldn't happen with Google Auth)
              setUserRole('pending');
              setError('Account pending admin approval.');
            }
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
        }
      } else {
        setUserRole(null);
        setUserSlug(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Real-time Listener
  useEffect(() => {
    if (!isAuthenticated || !isFirebaseAuthenticated || !userRole) return;

    const leadsRef = collection(db, 'leads');
    const subsRef = collection(db, 'subscriptions');
    
    const qLeads = userRole === 'admin' 
      ? query(leadsRef, orderBy('timestamp', 'desc'))
      : query(leadsRef, where('recruiterId', '==', auth.currentUser?.uid), orderBy('timestamp', 'desc'));
      
    const unsubscribeLeads = onSnapshot(qLeads, 
      (snapshot) => {
        const leadsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (Lead & { id: string })[];
        setLeads(leadsData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore error (leads):", err);
        handleFirestoreError(err, OperationType.LIST, 'leads');
      }
    );

    const qSubs = userRole === 'admin'
      ? query(subsRef, orderBy('timestamp', 'desc'))
      : query(subsRef, where('recruiterId', '==', auth.currentUser?.uid), orderBy('timestamp', 'desc'));
      
    const unsubscribeSubs = onSnapshot(qSubs, 
      (snapshot) => {
        const subsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as (Subscription & { id: string })[];
        setSubscriptions(subsData);
      },
      (err) => {
        console.error("Firestore error (subscriptions):", err);
        handleFirestoreError(err, OperationType.LIST, 'subscriptions');
      }
    );

    let unsubscribeTeam = () => {};
    if (userRole === 'admin') {
      const qTeam = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unsubscribeTeam = onSnapshot(qTeam, 
        (snapshot) => {
          const teamData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTeam(teamData);
        },
        (err) => {
          console.error("Firestore error (team):", err);
          handleFirestoreError(err, OperationType.LIST, 'users');
        }
      );
    }

    return () => {
      unsubscribeLeads();
      unsubscribeSubs();
      unsubscribeTeam();
    };
  }, [isAuthenticated, isFirebaseAuthenticated, userRole]);

  const handleCreateRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRecruiterEmail) return;

    try {
      const emailLower = createRecruiterEmail.toLowerCase();
      await setDoc(doc(db, 'pre_approved_users', emailLower), {
        email: emailLower,
        displayName: createRecruiterName,
        role: createRecruiterRole,
        slug: createRecruiterSlug,
        createdAt: new Date().toISOString()
      });
      setShowCreateRecruiter(false);
      setCreateRecruiterEmail('');
      setCreateRecruiterName('');
      setCreateRecruiterRole('recruiter');
      setCreateRecruiterSlug('');
      // Show success message or toast here if needed
    } catch (err) {
      console.error("Error creating pre-approved user:", err);
      handleFirestoreError(err, OperationType.CREATE, 'pre_approved_users');
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    try {
      await updateDoc(doc(db, 'users', editingMember.uid), {
        role: editingMember.role,
        slug: editingMember.slug
      });
      setEditingMember(null);
    } catch (err) {
      console.error("Error updating member:", err);
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'GUARD2026';
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Code');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Failed to authenticate with Google");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.mos.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
    const matchesMos = mosFilter === 'All' || lead.mos === mosFilter;
    
    const leadDate = new Date(lead.timestamp.split(' ')[0]);
    const matchesStartDate = !startDate || leadDate >= new Date(startDate);
    const matchesEndDate = !endDate || leadDate <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesSource && matchesMos && matchesStartDate && matchesEndDate;
  });

  const toggleSelectAll = () => {
    if (selectedEmails.size === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredLeads.map(l => l.email)));
    }
  };

  const toggleSelectLead = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const updatePromises = leads
        .filter(lead => selectedEmails.has(lead.email))
        .map(lead => {
          const leadDoc = doc(db, 'leads', (lead as any).id);
          return updateDoc(leadDoc, { status: newStatus });
        });
      
      await Promise.all(updatePromises);
      setSelectedEmails(new Set());
    } catch (err) {
      console.error("Bulk update error:", err);
      handleFirestoreError(err, OperationType.UPDATE, 'leads');
    }
  };

  const exportToCSV = (leadsToExport = filteredLeads) => {
    const headers = ['Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 'Age', 'Education', 'Interest', 'MOS', 'Source', 'Status'];
    const rows = leadsToExport.map(lead => [
      lead.timestamp,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone,
      lead.age,
      lead.education,
      lead.interest,
      lead.mos,
      lead.source,
      lead.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `FLARNG_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated || !isFirebaseAuthenticated || !userRole || userRole === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-army-black p-4 relative overflow-hidden">
        <div className="scanline" />
        <div className="w-full max-w-md hud-border p-6 md:p-8 border-army-gold/30">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-army-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-army-gold/40 glow-border">
              <ShieldAlert className="w-8 h-8 text-army-gold" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight glow-text">Secure <span className="text-army-gold">Access</span></h2>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-2">// Authorization_Required // Level_01_Clearance</p>
          </div>
          
          <div className="space-y-6">
            {userRole === 'pending' ? (
              <div className="space-y-4 text-center">
                <p className="text-army-gold text-xs font-mono uppercase tracking-widest border border-army-gold/30 bg-army-gold/10 p-4">
                  Account pending admin approval. Please contact your section chief.
                </p>
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-white py-4 font-black uppercase text-xs hover:bg-zinc-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {!isAuthenticated && (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                      <div className="absolute -top-2 left-3 bg-army-black px-2 text-[10px] font-black text-army-gold uppercase tracking-tighter z-10">Access_Code</div>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-none p-4 focus:border-army-gold outline-none font-mono text-army-gold placeholder:text-zinc-800"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                    <button className="w-full btn-gaming py-4 text-sm">Initialize_Dashboard</button>
                  </form>
                )}

                {isAuthenticated && !isFirebaseAuthenticated && (
                  <div className="space-y-4">
                    <p className="text-zinc-400 text-[10px] font-black uppercase text-center tracking-widest">Step 2: Firebase Authentication</p>
                    <button 
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 font-black uppercase text-xs hover:bg-zinc-200 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In with Google
                    </button>
                  </div>
                )}

                {isAuthenticated && isFirebaseAuthenticated && !userRole && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="w-8 h-8 text-army-gold animate-spin" />
                    <p className="text-army-gold text-[10px] font-mono uppercase tracking-widest animate-pulse">
                      Verifying_Clearance...
                    </p>
                  </div>
                )}
              </>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-2 border border-red-500/30"
              >
                [Error]: {error}
              </motion.p>
            )}
            
            <button type="button" onClick={onBack} className="w-full text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">Abort_Mission</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black relative">
      <div className="scanline" />
      
      {/* Header */}
      <header className="bg-army-black/80 backdrop-blur-md border-b border-army-gold/20 py-3 md:py-4 px-4 md:px-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="p-1 md:p-2 hover:bg-army-gold/10 rounded-none border border-transparent hover:border-army-gold/30 transition-all">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-army-gold" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter glow-text">Command <span className="text-army-gold">Center</span></h1>
            <span className="text-[7px] md:text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none mt-0.5">// System_Status: Online</span>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-army-gold/5 border border-army-gold/20">
            <div className="w-8 h-8 bg-army-gold rounded-none flex items-center justify-center text-army-black font-black text-xs">AL</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter leading-none">SFC Lantigua</span>
              <span className="text-[8px] font-mono text-army-gold uppercase">Admin_Level_01</span>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 text-zinc-500 hover:text-army-gold hover:bg-army-gold/10 border border-transparent hover:border-army-gold/30 transition-all"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all">
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Total_Squad', value: '128', icon: Users, color: 'text-neon-cyan' },
            { label: 'New_Intel', value: '14', icon: TrendingUp, color: 'text-neon-green' },
            { label: 'Pending_Comms', value: '8', icon: Clock, color: 'text-army-gold' },
            { label: 'Enlistments', value: '3', icon: CheckCircle, color: 'text-white' },
          ].map((stat, i) => (
            <div key={i} className="hud-border p-6 flex items-center justify-between group hover:border-army-gold/60 transition-all">
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
              </div>
              <div className={cn("p-3 bg-white/5 border border-white/10 group-hover:border-army-gold/30 transition-all", stat.color)}>
                <stat.icon className="w-6 h-6 opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 hud-border p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest glow-text">Intel_Pipeline <span className="text-army-gold">// Status</span></h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-neon-cyan animate-pulse" />
                <div className="w-2 h-2 bg-neon-green animate-pulse delay-75" />
                <div className="w-2 h-2 bg-army-gold animate-pulse delay-150" />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STATS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#030000', border: '1px solid rgba(255, 213, 48, 0.3)', borderRadius: '0px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#FFD530', fontSize: '10px', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(255, 213, 48, 0.05)' }}
                  />
                  <Bar dataKey="value" fill="#FFD530" radius={[0, 0, 0, 0]}>
                    {STATS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#FFD530', '#00f2ff', '#39ff14', '#ffffff'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="hud-border p-6">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 glow-text">Source_Intel <span className="text-army-gold">// Origin</span></h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SOURCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    stroke="none"
                  >
                    {SOURCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#FFD530', '#00f2ff', '#39ff14', '#ffffff'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#030000', border: '1px solid rgba(255, 213, 48, 0.3)', borderRadius: '0px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('leads')}
            className={cn(
              "px-8 py-3 font-black uppercase italic text-xs tracking-widest transition-all border-2",
              activeTab === 'leads' 
                ? "bg-army-gold text-army-black border-army-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
            )}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recruitment_Leads
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              "px-8 py-3 font-black uppercase italic text-xs tracking-widest transition-all border-2",
              activeTab === 'subscriptions' 
                ? "bg-army-gold text-army-black border-army-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
            )}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Intel_Subscribers
            </div>
          </button>
          {userRole === 'admin' && (
            <button 
              onClick={() => setActiveTab('team')}
              className={cn(
                "px-8 py-3 font-black uppercase italic text-xs tracking-widest transition-all border-2",
                activeTab === 'team' 
                  ? "bg-army-gold text-army-black border-army-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                  : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600"
              )}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Recruiter_Team
              </div>
            </button>
          )}
        </div>

        {/* Lead Table */}
        <div className="hud-border overflow-hidden">
          <div className="p-4 md:p-6 border-b border-army-gold/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest glow-text">
                {activeTab === 'leads' ? 'Recent_Leads' : activeTab === 'subscriptions' ? 'Recent_Subscribers' : 'Recruiter_Team'} 
                <span className="text-army-gold">// {activeTab === 'leads' ? 'Active_Intel' : activeTab === 'subscriptions' ? 'Network_Growth' : 'Personnel_Roster'}</span>
              </h3>
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                Total_Records: {activeTab === 'leads' ? filteredLeads.length : activeTab === 'subscriptions' ? subscriptions.length : team.length} 
                {activeTab === 'leads' && ` // Filter: ${statusFilter !== 'All' || sourceFilter !== 'All' || mosFilter !== 'All' || startDate || endDate || searchQuery ? 'Active' : 'None'}`}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {userRole === 'admin' && activeTab === 'team' && (
                <button 
                  onClick={() => setShowCreateRecruiter(true)}
                  className="px-4 py-2 bg-army-gold/10 border border-army-gold/50 text-army-gold text-xs font-black uppercase tracking-widest hover:bg-army-gold hover:text-army-black transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create_Recruiter
                </button>
              )}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  placeholder="Search_Database..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-none py-2 pl-10 pr-4 text-xs font-mono focus:border-army-gold outline-none text-army-gold"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "p-2 bg-zinc-900/50 border border-zinc-800 rounded-none hover:border-army-gold/50 transition-colors",
                  showFilters && "border-army-gold text-army-gold"
                )}
                title="Toggle Filters"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button 
                onClick={exportToCSV}
                className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-none hover:border-army-gold/50 transition-colors text-zinc-500 hover:text-army-gold"
                title="Export Filtered Leads to CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-6 border-b border-army-gold/10 bg-army-gold/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <div className="space-y-1">
                <label className="text-[8px] font-black text-zinc-500 uppercase font-mono">Status_Code</label>
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-army-black border border-zinc-800 p-2 text-[10px] font-black uppercase focus:border-army-gold outline-none"
                >
                  <option value="All">All_Status</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-zinc-500 uppercase font-mono">Origin_Source</label>
                <select 
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value)}
                  className="w-full bg-army-black border border-zinc-800 p-2 text-[10px] font-black uppercase focus:border-army-gold outline-none"
                >
                  <option value="All">All_Sources</option>
                  <option value="Instagram">Instagram</option>
                  <option value="FAU Campus">Campus</option>
                  <option value="Friend">Referral</option>
                  <option value="Search">Search</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-zinc-500 uppercase font-mono">MOS_ID</label>
                <select 
                  value={mosFilter}
                  onChange={e => setMosFilter(e.target.value)}
                  className="w-full bg-army-black border border-zinc-800 p-2 text-[10px] font-black uppercase focus:border-army-gold outline-none"
                >
                  <option value="All">All_MOS</option>
                  <option value="11B">11B</option>
                  <option value="68W">68W</option>
                  <option value="31B">31B</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-zinc-500 uppercase font-mono">Start_Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-army-black border border-zinc-800 p-2 text-[10px] font-black uppercase focus:border-army-gold outline-none text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-zinc-500 uppercase font-mono">End_Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-army-black border border-zinc-800 p-2 text-[10px] font-black uppercase focus:border-army-gold outline-none text-white"
                />
              </div>
            </motion.div>
          )}

          {selectedEmails.size > 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-army-gold p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky left-0 z-20"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <span className="text-army-black font-black uppercase text-[10px] tracking-widest">
                  {selectedEmails.size} Selected_Records
                </span>
                <div className="hidden sm:block h-4 w-px bg-army-black/20" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-army-black font-black uppercase text-[8px] tracking-tighter">Bulk_Status:</span>
                  {['New', 'Contacted', 'Qualified', 'Scheduled'].map(status => (
                    <button 
                      key={status}
                      onClick={() => handleBulkStatusUpdate(status)}
                      className="bg-army-black/10 hover:bg-army-black/20 px-2 py-1 text-[8px] font-black uppercase border border-army-black/20 text-army-black transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button 
                  onClick={() => exportToCSV(leads.filter(l => selectedEmails.has(l.email)))}
                  className="flex items-center gap-1 bg-army-black text-army-gold px-3 py-1 text-[8px] font-black uppercase hover:bg-zinc-900 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
                <button 
                  onClick={() => setSelectedEmails(new Set())}
                  className="text-army-black/60 hover:text-army-black font-black uppercase text-[8px] tracking-widest px-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-army-gold/5 text-zinc-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                  {activeTab === 'leads' ? (
                    <>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 w-10">
                        <button 
                          onClick={toggleSelectAll}
                          className="text-zinc-500 hover:text-army-gold transition-colors"
                        >
                          {selectedEmails.size === filteredLeads.length && filteredLeads.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-army-gold" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Operator_Name</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Status_Code</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Specialization</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">MOS_ID</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Timestamp</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 text-right whitespace-nowrap">Actions</th>
                    </>
                  ) : activeTab === 'subscriptions' ? (
                    <>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Subscriber_Name</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Email_Address</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Phone_Number</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Opt_In_Status</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Timestamp</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Recruiter_Name</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Email_Address</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Role</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Personal_Link</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 whitespace-nowrap">Joined_Date</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 border-b border-army-gold/10 text-right whitespace-nowrap">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-army-gold/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={activeTab === 'leads' ? 7 : 5} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-army-gold mx-auto mb-4" />
                      <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Synchronizing_Intel...</p>
                    </td>
                  </tr>
                ) : activeTab === 'leads' ? (
                  filteredLeads.length > 0 ? filteredLeads.map((lead, i) => (
                    <tr key={i} className={cn(
                      "group hover:bg-army-gold/5 transition-colors text-[10px] md:text-sm",
                      selectedEmails.has(lead.email) && "bg-army-gold/10"
                    )}>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <button 
                          onClick={() => toggleSelectLead(lead.email)}
                          className="text-zinc-500 hover:text-army-gold transition-colors"
                        >
                          {selectedEmails.has(lead.email) ? (
                            <CheckSquare className="w-4 h-4 text-army-gold" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <div className="font-black uppercase tracking-tighter group-hover:text-army-gold transition-colors">{lead.firstName} {lead.lastName}</div>
                        <div className="text-[8px] md:text-[10px] font-mono text-zinc-500">{lead.email}</div>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className={cn(
                          "text-[7px] md:text-[9px] font-black uppercase px-2 md:px-3 py-0.5 md:py-1 border",
                          lead.status === 'New' ? "bg-army-gold/10 border-army-gold/40 text-army-gold" :
                          lead.status === 'Contacted' ? "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan" :
                          "bg-neon-green/10 border-neon-green/40 text-neon-green"
                        )}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-[9px] md:text-[11px] font-black uppercase tracking-tighter">{lead.interest}</td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-[9px] md:text-[11px] font-mono text-army-gold">{lead.mos}</td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-[8px] md:text-[10px] font-mono text-zinc-500">{lead.timestamp.split(' ')[0]}</td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-right">
                        <div className="flex justify-end gap-1 md:gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setJourneyLead(lead)}
                            title="View User Journey"
                            className="p-1.5 md:p-2 hover:bg-army-gold/10 border border-transparent hover:border-army-gold/30 text-zinc-400 hover:text-army-gold transition-all"
                          >
                            <History className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          <button className="p-1.5 md:p-2 hover:bg-army-gold/10 border border-transparent hover:border-army-gold/30 text-zinc-400 hover:text-army-gold transition-all">
                            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          <button className="p-1.5 md:p-2 hover:bg-army-gold/10 border border-transparent hover:border-army-gold/30 text-zinc-400 hover:text-army-gold transition-all">
                            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          <button className="p-1.5 md:p-2 hover:bg-army-gold/10 border border-transparent hover:border-army-gold/30 text-zinc-400">
                            <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500 font-black uppercase italic tracking-widest text-xs">
                        No_Intel_Found_In_Database
                      </td>
                    </tr>
                  )
                ) : activeTab === 'subscriptions' ? (
                  subscriptions.length > 0 ? subscriptions.map((sub, i) => (
                    <tr key={i} className="group hover:bg-army-gold/5 transition-colors text-[10px] md:text-sm">
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="font-black uppercase tracking-tight text-white">{sub.name}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="text-army-gold font-mono text-[10px]">{sub.email}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="text-zinc-400 font-mono text-[10px]">{sub.phone}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className={cn(
                          "px-2 py-1 rounded-none text-[8px] font-black uppercase tracking-widest border",
                          sub.optIn ? "bg-neon-green/10 text-neon-green border-neon-green/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                        )}>
                          {sub.optIn ? 'OPTED_IN' : 'OPTED_OUT'}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="text-zinc-500 font-mono text-[10px]">{sub.timestamp.split(' ')[0]}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 font-black uppercase italic tracking-widest text-xs">
                        No_Subscribers_Found
                      </td>
                    </tr>
                  )
                ) : (
                  team.length > 0 ? team.map((member, i) => (
                    <tr key={i} className="group hover:bg-army-gold/5 transition-colors text-[10px] md:text-sm">
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="font-black uppercase tracking-tight text-white">{member.displayName}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="text-army-gold font-mono text-[10px]">{member.email}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className={cn(
                          "px-2 py-1 rounded-none text-[8px] font-black uppercase tracking-widest border",
                          member.role === 'admin' ? "bg-army-gold/10 text-army-gold border-army-gold/30" : 
                          member.role === 'pending' ? "bg-red-500/10 text-red-500 border-red-500/30" : 
                          "bg-zinc-800/50 text-zinc-300 border-zinc-700"
                        )}>
                          {member.role || 'recruiter'}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        {member.slug ? (
                          <a href={`/?r=${member.slug}`} target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline font-mono text-[10px]">
                            /?r={member.slug}
                          </a>
                        ) : (
                          <span className="text-zinc-500 font-mono text-[10px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6">
                        <span className="text-zinc-500 font-mono text-[10px]">{member.createdAt ? member.createdAt.split('T')[0] : 'Unknown'}</span>
                      </td>
                      <td className="py-3 md:py-4 px-4 md:px-6 text-right">
                        <button 
                          onClick={() => setEditingMember(member)}
                          className="px-3 py-1 bg-army-gold/10 border border-army-gold/30 text-army-gold text-[10px] font-black uppercase tracking-widest hover:bg-army-gold hover:text-army-black transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-500 font-black uppercase italic tracking-widest text-xs">
                        No_Team_Members_Found
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* User Journey Modal */}
      <AnimatePresence>
        {journeyLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJourneyLead(null)}
              className="absolute inset-0 bg-army-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl hud-border bg-zinc-950 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-army-gold">User_Journey // Intel_Log</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{journeyLead.firstName} {journeyLead.lastName} // {journeyLead.email}</p>
                </div>
                <button 
                  onClick={() => setJourneyLead(null)}
                  className="p-2 hover:bg-army-gold/10 text-zinc-500 hover:text-army-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {journeyLead.interactions && journeyLead.interactions.length > 0 ? (
                  <div className="space-y-4">
                    {journeyLead.interactions.map((interaction, idx) => (
                      <div key={idx} className="flex gap-4 items-start group">
                        <div className="mt-1 w-2 h-2 rounded-full bg-army-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-army-gold transition-colors">
                              {interaction.element}
                            </p>
                            <p className="text-[8px] font-mono text-zinc-600">
                              {new Date(interaction.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <p className="text-[9px] font-mono text-zinc-500 uppercase italic">
                            Action_Type: {interaction.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Eye className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No_Interaction_Data // Direct_Submission</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-army-gold/20 bg-army-gold/5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-900/50 border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 font-mono">Total_Interactions</p>
                    <p className="text-xl font-black text-army-gold italic">{journeyLead.interactions?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-1 font-mono">Lead_Source</p>
                    <p className="text-xl font-black text-white italic">{journeyLead.source}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Create Recruiter Modal */}
        {showCreateRecruiter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateRecruiter(false)}
              className="absolute inset-0 bg-army-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md hud-border bg-zinc-950 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-army-gold">Create_Recruiter</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Add_New_Team_Member</p>
                </div>
                <button 
                  onClick={() => setShowCreateRecruiter(false)}
                  className="p-2 hover:bg-army-gold/10 text-zinc-500 hover:text-army-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleCreateRecruiter} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email_Address</label>
                    <input 
                      type="email" 
                      required
                      value={createRecruiterEmail}
                      onChange={(e) => setCreateRecruiterEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-army-gold outline-none transition-colors"
                      placeholder="recruiter@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Display_Name</label>
                    <input 
                      type="text" 
                      required
                      value={createRecruiterName}
                      onChange={(e) => setCreateRecruiterName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-army-gold outline-none transition-colors"
                      placeholder="SGT Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Role</label>
                    <select 
                      value={createRecruiterRole}
                      onChange={(e) => setCreateRecruiterRole(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-army-gold outline-none transition-colors"
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Personal_Link_Slug</label>
                    <input 
                      type="text" 
                      required
                      value={createRecruiterSlug}
                      onChange={(e) => setCreateRecruiterSlug(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-army-gold outline-none transition-colors"
                      placeholder="sgt-smith"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">Link will be: ?r={createRecruiterSlug || 'slug'}</p>
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowCreateRecruiter(false)}
                      className="px-6 py-3 border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-army-gold/10 border border-army-gold/50 text-army-gold font-black uppercase tracking-widest hover:bg-army-gold hover:text-army-black transition-colors"
                    >
                      Pre-Approve
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
        {/* Edit Member Modal */}
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMember(null)}
              className="absolute inset-0 bg-army-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md hud-border bg-zinc-950 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-army-gold/20 bg-army-gold/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-army-gold">Edit_Recruiter</h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{editingMember.displayName}</p>
                </div>
                <button 
                  onClick={() => setEditingMember(null)}
                  className="p-2 hover:bg-army-gold/10 text-zinc-500 hover:text-army-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Role</label>
                  <select
                    value={editingMember.role || 'recruiter'}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-army-gold outline-none transition-colors"
                  >
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Personal Link Slug</label>
                  <input
                    type="text"
                    value={editingMember.slug || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, slug: e.target.value })}
                    placeholder="e.g. smith-j"
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white font-mono text-sm focus:border-army-gold outline-none transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono">This will be used for their personal link: /?r=slug</p>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button 
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-6 py-3 border border-zinc-800 text-zinc-400 font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-army-gold/10 border border-army-gold/50 text-army-gold font-black uppercase tracking-widest hover:bg-army-gold hover:text-army-black transition-colors"
                  >
                    Save_Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
