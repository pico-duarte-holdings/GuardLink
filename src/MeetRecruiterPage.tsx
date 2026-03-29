import React from 'react';
import { ChevronLeft } from 'lucide-react';

export const MeetRecruiterPage = ({ onBack, slugParam }: { onBack: () => void, slugParam?: string }) => (
  <div className="min-h-screen bg-army-black text-white p-6">
    <button onClick={onBack} className="flex items-center gap-2 text-army-gold mb-6 hover:underline"><ChevronLeft className="w-4 h-4" /> Back</button>
    <h1 className="text-3xl font-black uppercase tracking-wider text-army-gold mb-8">Meet Your Recruiter</h1>
    <p>Placeholder for Meet Recruiter Page</p>
  </div>
);
