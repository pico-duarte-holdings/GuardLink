import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface SharedNavbarProps {
  onBack: () => void;
  title: string;
  slugParam?: string;
}

export const SharedNavbar = ({ onBack, title, slugParam }: SharedNavbarProps) => {
  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-50">
      <button onClick={onBack} className="flex items-center gap-2 text-army-gold hover:underline font-bold uppercase tracking-wider text-sm">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-xl font-black uppercase tracking-wider text-white">{title}</h1>
      <div className="w-16"></div> {/* Spacer for centering */}
    </nav>
  );
};
