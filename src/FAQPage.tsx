import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface FAQPageProps {
  onBack: () => void;
  slugParam?: string;
}

export const FAQPage = ({ onBack, slugParam }: FAQPageProps) => {
  return (
    <div className="min-h-screen bg-army-black text-white p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-army-gold mb-6 hover:underline">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-black uppercase tracking-wider text-army-gold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">What are the requirements to join?</h3>
          <p className="text-zinc-400">You must be between 17 and 35 years old, a U.S. citizen or permanent resident, have a high school diploma or equivalent, and meet physical and medical standards.</p>
        </div>
        <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">How long is Basic Training?</h3>
          <p className="text-zinc-400">Basic Combat Training (BCT) is approximately 10 weeks long.</p>
        </div>
        <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Can I choose my job?</h3>
          <p className="text-zinc-400">Yes, your job (MOS) is chosen before you sign your contract, based on your ASVAB scores and available openings.</p>
        </div>
      </div>
    </div>
  );
};
