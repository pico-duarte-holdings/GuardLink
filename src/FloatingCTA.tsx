/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Mail } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const DEFAULT_PHONE = '561-459-7845';
const DEFAULT_EMAIL = 'angel.m.lantigua.mil@army.mil';

export const FloatingCTA = ({ slugParam }: { slugParam: string }) => {
  const [cellPhone, setCellPhone] = useState(DEFAULT_PHONE);
  const [email, setEmail] = useState(DEFAULT_EMAIL);

  useEffect(() => {
    const fetchContact = async () => {
      if (!slugParam) return;
      try {
        const q = query(collection(db, 'users'), where('slug', '==', slugParam));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0].data();
          setCellPhone(d.cellPhone || d.phoneNumber || DEFAULT_PHONE);
          setEmail(d.publicEmail || d.email || DEFAULT_EMAIL);
        }
      } catch (err) {
        console.error('Error fetching contact info:', err);
      }
    };
    fetchContact();
  }, [slugParam]);

  return (
    <div className="fixed bottom-8 left-8 z-40 flex gap-2">
      <a
        href={`tel:${cellPhone}`}
        className="w-12 h-12 bg-army-gold flex items-center justify-center hover:scale-110 transition-all shadow-2xl glow-border"
        aria-label="Call recruiter"
      >
        <Phone className="w-5 h-5 text-army-black" />
      </a>
      <a
        href={`sms:${cellPhone}`}
        className="w-12 h-12 bg-army-gold flex items-center justify-center hover:scale-110 transition-all shadow-2xl glow-border"
        aria-label="Text recruiter"
      >
        <MessageSquare className="w-5 h-5 text-army-black" />
      </a>
      <a
        href={`mailto:${email}`}
        className="w-12 h-12 bg-army-gold flex items-center justify-center hover:scale-110 transition-all shadow-2xl glow-border"
        aria-label="Email recruiter"
      >
        <Mail className="w-5 h-5 text-army-black" />
      </a>
    </div>
  );
};
