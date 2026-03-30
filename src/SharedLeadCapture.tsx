/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { ArrowRight, Share2, Copy, Check } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { addOrUpdateContact, normalizePhoneE164 } from './lib/brevo';

const SOUNDS = {
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

const playSound = (url: string, volume = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(() => {});
};

interface SharedLeadCaptureProps {
  slugParam: string;
  source: string;
  recruiterId?: string;
  title?: string;
  subtitle?: string;
  onSubmitSuccess?: () => void;
}

export const SharedLeadCapture = ({
  slugParam,
  source,
  recruiterId,
  title = "JOIN THE SQUAD",
  subtitle = "// DEPLOYMENT_READY? //"
}: SharedLeadCaptureProps) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    age: '', education: '', interest: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    playSound(SOUNDS.CLICK);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert("Please fill out all required fields.");
      setStatus('idle');
      return;
    }

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age: formData.age || '',
        education: formData.education || 'HS Graduate',
        interest: formData.interest || 'Enlisted',
        timestamp: new Date().toISOString(),
        status: 'New',
        source: source || 'Website',
        mos: 'TBD',
        slugParam: slugParam,
      };

      if (recruiterId) {
        payload.recruiterId = recruiterId;
      }

      await addDoc(collection(db, 'leads'), payload);

      // Sync to Brevo contacts (fire-and-forget — never block lead save)
      addOrUpdateContact({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: normalizePhoneE164(formData.phone),
      }).catch(() => {});

      setStatus('success');
      playSound(SOUNDS.SUCCESS);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', age: '', education: '', interest: '' });

      // Dispatch custom event for XP system
      window.dispatchEvent(new CustomEvent('guardlink:lead-submitted'));

      // Keep success state longer so user can share
      setTimeout(() => {
        setStatus('idle');
      }, 15000);
    } catch (err: any) {
      console.error('Submission error:', err);
      alert("Error submitting intel: " + err.message);
      setStatus('error');
    }
  };

  return (
    <section id="register" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4">
        <div className="hud-border p-6 md:p-12 border-army-gold/40">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-7xl font-black mb-4 uppercase italic tracking-tighter">
              {title.split(' ').map((word, i, arr) =>
                i === arr.length - 1
                  ? <span key={i} className="text-army-gold">{word}</span>
                  : <span key={i}>{word} </span>
              )}
            </h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{subtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">First_Name</label>
                <input required className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">Last_Name</label>
                <input required className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">Email</label>
                <input required type="email" className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">Phone</label>
                <input required type="tel" className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold uppercase italic" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">Age</label>
                <input required className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-bold" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">Education</label>
                <select required className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="HS Student">HS Student</option>
                  <option value="HS Graduate">HS Graduate</option>
                  <option value="College Student">College Student</option>
                  <option value="College Graduate">College Graduate</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-army-gold font-mono">Interest</label>
                <select required className="w-full bg-army-black border-2 border-zinc-800 p-4 focus:border-army-gold outline-none font-black uppercase italic" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}>
                  <option value="">Select...</option>
                  <option value="Enlisted">Enlisted</option>
                  <option value="Officer">Officer</option>
                  <option value="Warrant Officer">Warrant Officer</option>
                </select>
              </div>
            </div>
            <button disabled={status === 'loading'} className="w-full btn-gaming py-6 text-2xl flex items-center justify-center gap-4 disabled:opacity-50 italic">
              {status === 'loading' ? 'TRANSMITTING...' : 'SEND INTEL'} <ArrowRight className="w-8 h-8" />
            </button>
            {status === 'success' && (
              <div className="space-y-4">
                <div className="p-6 bg-army-gold text-army-black text-center font-black uppercase italic glow-border">
                  {">>"} INTEL_RECEIVED {"<<"}
                </div>
                {/* Share-for-XP Section */}
                <ShareForXP slugParam={slugParam} />
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

// --- Share-for-XP Component ---
const ShareForXP = ({ slugParam }: { slugParam: string }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${slugParam ? `?r=${slugParam}` : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Grant share XP
      window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'share-link' } }));
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'share-link' } }));
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GuardLink — Level Up Your Future',
          text: 'Check out what the National Guard has to offer. Level up your future!',
          url: shareUrl,
        });
        window.dispatchEvent(new CustomEvent('guardlink:xp-grant', { detail: { action: 'share-link' } }));
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="p-6 bg-zinc-900/80 border-2 border-neon-cyan/30 text-center space-y-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-neon-cyan">
        // Bonus_XP_Available //
      </div>
      <h3 className="text-xl font-black uppercase italic text-white">
        SHARE & EARN <span className="text-neon-green">+75 XP</span>
      </h3>
      <p className="text-xs text-zinc-400">
        Send your link to a friend. Every share earns you XP toward your next rank.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 border-2 border-neon-cyan/40 text-neon-cyan font-black uppercase text-xs hover:bg-neon-cyan/20 hover:border-neon-cyan transition-all"
        >
          <Share2 className="w-4 h-4" /> SHARE LINK
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border-2 border-zinc-700 text-zinc-300 font-black uppercase text-xs hover:border-army-gold hover:text-army-gold transition-all"
        >
          {copied ? <><Check className="w-4 h-4 text-neon-green" /> COPIED!</> : <><Copy className="w-4 h-4" /> COPY LINK</>}
        </button>
      </div>
      <p className="text-[9px] font-mono text-zinc-600 mt-2">
        {shareUrl}
      </p>
    </div>
  );
};
