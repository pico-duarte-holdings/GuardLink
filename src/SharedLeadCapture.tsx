import React, { useState } from 'react';

export const SharedLeadCapture = ({ onComplete, source, slugParam, recruiterId }: { onComplete: () => void, source: string, slugParam?: string, recruiterId?: any }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
      <h3 className="text-xl font-black uppercase text-army-gold mb-4">Start Your Journey</h3>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 px-4 py-2 text-white mb-4"
      />
      <button onClick={onComplete} className="w-full bg-army-gold text-army-black font-black uppercase py-2">
        Submit
      </button>
    </div>
  );
};
