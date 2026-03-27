/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Link } from 'react-router-dom';

// GuardLink Diamond Badge Logo Component
const GuardLinkIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(20, 20) rotate(45)">
      <rect x="-16" y="-16" width="32" height="32" rx="4" ry="4"
        fill="none" stroke="currentColor" strokeWidth="2" />
    </g>
    <g transform="translate(20, 20)">
      <path d="M0 -9 L8 0 L5.5 0 L0 -6 L-5.5 0 L-8 0 Z" fill="currentColor" />
      <path d="M0 -1 L8 8 L5.5 8 L0 2 L-5.5 8 L-8 8 Z" fill="currentColor" opacity="0.5" />
    </g>
  </svg>
);

const DEFAULT_PROFILE = {
  uid: 'admin',
  displayName: 'SFC Angel Lantigua',
  cellPhone: '561-459-7845',
  publicEmail: 'angel.m.lantigua.mil@army.mil',
  locationType: 'HQ',
  address1: 'FAU Boca Raton',
  address2: '',
  city: 'Boca Raton',
  state: 'FL',
  zip: '33431',
  instagram: 'palmbeachrsp',
  facebook: '',
  tiktok: '',
  linkedin: '',
  discord: '',
  youtube: '',
  linktree: ''
};

export const SharedFooter = ({ slugParam }: { slugParam: string }) => {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const slugQuery = slugParam ? `?r=${slugParam}` : '';
  const hasSlug = !!slugParam;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slugParam) return;
      try {
        const q = query(collection(db, 'users'), where('slug', '==', slugParam));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setProfile({
            uid: userDoc.uid || 'unassigned',
            displayName: userDoc.displayName || DEFAULT_PROFILE.displayName,
            cellPhone: userDoc.cellPhone || userDoc.phoneNumber || DEFAULT_PROFILE.cellPhone,
            publicEmail: userDoc.publicEmail || userDoc.email || DEFAULT_PROFILE.publicEmail,
            locationType: userDoc.locationType || 'Armory',
            address1: userDoc.address1 || '',
            address2: userDoc.address2 || '',
            city: userDoc.city || '',
            state: userDoc.state || 'FL',
            zip: userDoc.zip || '',
            instagram: userDoc.instagram || '',
            facebook: userDoc.facebook || '',
            tiktok: userDoc.tiktok || '',
            linkedin: userDoc.linkedin || '',
            discord: userDoc.discord || '',
            youtube: userDoc.youtube || '',
            linktree: userDoc.linktree || ''
          });
        }
      } catch (error) {
        console.error('Error fetching recruiter profile:', error);
      }
    };
    fetchProfile();
  }, [slugParam]);

  return (
    <footer className="py-20 border-t border-zinc-900 bg-army-black/50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-12 text-center">
        <Link to={`/${slugQuery}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <GuardLinkIcon className="text-army-gold w-8 h-8 glow-text" />
          <span className="text-3xl font-black tracking-tighter uppercase italic text-white">GUARD<span className="text-army-gold">LINK</span></span>
        </Link>

        {hasSlug ? (
          <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] leading-loose space-y-2">
            <p className="text-army-gold font-black text-xs">{profile.displayName}</p>
            <p>{profile.publicEmail} // {profile.cellPhone}</p>
            {profile.address1 && (
              <p>{profile.locationType}: {profile.address1} {profile.address2}, {profile.city}, {profile.state} {profile.zip}</p>
            )}
          </div>
        ) : (
          <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] leading-loose space-y-2">
            <p className="text-army-gold font-black text-xs">LEVEL UP YOUR FUTURE.</p>
          </div>
        )}

        {/* Terms & Privacy */}
        <div className="flex gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
          <Link to={`/terms${slugQuery}`} className="hover:text-army-gold transition-colors">Terms of Service</Link>
          <span className="text-zinc-800">|</span>
          <Link to={`/privacy${slugQuery}`} className="hover:text-army-gold transition-colors">Privacy Policy</Link>
        </div>

        {/* DoD Disclaimer */}
        <div className="max-w-3xl text-zinc-600 text-[9px] font-mono leading-relaxed px-4">
          <p className="opacity-60">GuardLink is a privately operated informational platform owned by Pico Duarte Holdings LLC and operated by GuardLink Technologies LLC. It is not an official website of the United States Government, the Department of Defense (also known as the Department of War), the Department of the Army, the National Guard Bureau, or the Florida Department of Military Affairs. The views, information, and content presented on this site are those of the site operator and do not represent the official position of any U.S. Government agency or military organization. Use of military rank, job titles, and photographs in uniform does not imply endorsement by the Department of the Army or the Department of Defense. All information is provided for general informational and recruiting support purposes only.</p>
        </div>

        <div className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] leading-loose space-y-2">
          <p className="opacity-50">&copy; 2026 Pico Duarte Holdings LLC. All rights reserved. Operated by GuardLink Technologies LLC.</p>
        </div>
      </div>
    </footer>
  );
};
