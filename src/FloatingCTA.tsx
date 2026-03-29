import React from 'react';

export const FloatingCTA = ({ onClick, text, slugParam }: { onClick: () => void, text: string, slugParam?: string }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <button onClick={onClick} className="bg-army-gold text-army-black font-black uppercase px-8 py-4 rounded shadow-2xl hover:scale-105 transition-transform">
      {text}
    </button>
  </div>
);
