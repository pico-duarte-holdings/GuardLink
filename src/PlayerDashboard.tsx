import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogIn, Upload, CheckCircle, Clock, FileText, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { cn } from './lib/utils';
import { SharedChatbot } from './SharedChatbot';

export const PlayerDashboard = ({ onBack }: { onBack: () => void }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Fetch player data
        const playerRef = doc(db, 'players', user.uid);
        const unsubscribeDoc = onSnapshot(playerRef, (docSnap) => {
          if (docSnap.exists()) {
            setPlayerData(docSnap.data());
          } else {
            // Create default player profile
            setDoc(playerRef, {
              email: user.email,
              displayName: user.displayName,
              stage: 0,
              documents: [],
              createdAt: new Date().toISOString()
            });
          }
          setIsLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setIsAuthenticated(false);
        setPlayerData(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-army-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-army-gold animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-army-black text-white flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6">
          <button onClick={onBack} className="flex items-center gap-2 text-army-gold hover:underline font-black uppercase tracking-wider text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-xl max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-army-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-army-gold/30">
            <ShieldAlert className="w-8 h-8 text-army-gold" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Player Portal</h1>
          <p className="text-zinc-400 text-sm mb-8">Secure access for recruits to track progress and upload documents.</p>
          
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 px-4 rounded hover:bg-zinc-200 transition-colors"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const stages = [
    { id: 1, label: 'Contacted' },
    { id: 2, label: 'Interviewed' },
    { id: 3, label: 'Appointment Set' },
    { id: 4, label: 'ASVAB Taken' },
    { id: 5, label: 'Medical Cleared' },
    { id: 6, label: 'Contract Signed' },
    { id: 7, label: 'Enlisted' }
  ];

  const currentStage = playerData?.stage || 0;

  return (
    <div className="min-h-screen bg-army-black text-white font-sans selection:bg-army-gold selection:text-army-black">
      <nav className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-army-gold hover:text-yellow-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black uppercase tracking-widest text-white">Player Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:block">{auth.currentUser?.email}</span>
            <button onClick={handleLogout} className="text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-2xl font-black uppercase text-army-gold mb-2">Welcome, {playerData?.displayName || 'Recruit'}</h2>
          <p className="text-zinc-400">Track your enlistment progress and manage your documents securely.</p>
        </div>

        {/* Progress Tracker */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-black uppercase text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-army-gold" />
            Enlistment Progress
          </h3>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-800" />
            <div className="space-y-6 relative">
              {stages.map((stage, index) => {
                const isCompleted = currentStage >= stage.id;
                const isCurrent = currentStage === stage.id - 1;
                
                return (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-colors",
                      isCompleted ? "bg-neon-green border-neon-green text-army-black" :
                      isCurrent ? "bg-army-gold border-army-gold text-army-black" :
                      "bg-zinc-900 border-zinc-700 text-zinc-500"
                    )}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-black">{stage.id}</span>}
                    </div>
                    <div>
                      <div className={cn(
                        "font-black uppercase tracking-wider text-sm",
                        isCompleted ? "text-neon-green" :
                        isCurrent ? "text-army-gold" :
                        "text-zinc-500"
                      )}>
                        {stage.label}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-black uppercase text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-army-gold" />
            Secure Documents
          </h3>
          
          <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-4" />
            <p className="text-sm font-bold text-zinc-300 mb-1">Click to upload documents</p>
            <p className="text-xs text-zinc-500">ID, Social Security Card, Transcripts, etc.</p>
          </div>
          
          <div className="mt-6 space-y-2">
            {playerData?.documents?.length > 0 ? (
              playerData.documents.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-army-gold" />
                    <span className="text-sm text-zinc-300">{doc.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">No documents uploaded yet.</p>
            )}
          </div>
        </div>
      </main>

      <SharedChatbot />
    </div>
  );
};
