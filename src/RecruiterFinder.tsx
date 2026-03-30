/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Phone, MessageSquare, Mail, ArrowRight, Users, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { cn } from './lib/utils';
import GuardLinkIcon from './GuardLinkIcon';

interface MatchedRecruiter {
  slug: string;
  displayName: string;
  cellPhone: string;
  publicEmail: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  photoURL: string;
  locationType: string;
}

export const RecruiterFinder = ({ variant = 'full' }: { variant?: 'full' | 'compact' }) => {
  const [zipCode, setZipCode] = useState('');
  const [results, setResults] = useState<MatchedRecruiter[]>([]);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    const zip = zipCode.trim();
    if (!zip || zip.length < 5) return;

    setIsSearching(true);
    setSearched(false);

    try {
      // Fetch all recruiters who have assignedZipCodes
      const snap = await getDocs(collection(db, 'users'));
      const matches: MatchedRecruiter[] = [];

      snap.forEach(doc => {
        const d = doc.data();
        const assignedZips: string[] = d.assignedZipCodes || [];
        if (assignedZips.includes(zip)) {
          matches.push({
            slug: d.slug || '',
            displayName: d.displayName || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
            cellPhone: d.cellPhone || d.phoneNumber || '',
            publicEmail: d.publicEmail || d.email || '',
            address1: d.address1 || '',
            city: d.city || '',
            state: d.state || 'FL',
            zip: d.zip || '',
            photoURL: d.photoURL || d.profilePhoto || '',
            locationType: d.locationType || '',
          });
        }
      });

      setResults(matches);
      setSearched(true);
    } catch (err) {
      console.error('Error searching for recruiters:', err);
    }
    setIsSearching(false);
  };

  return (
    <div className={cn(
      "w-full",
      variant === 'full' && "max-w-3xl mx-auto"
    )}>
      {variant === 'full' && (
        <div className="text-center mb-10">
          <GuardLinkIcon className="w-12 h-12 text-army-gold mx-auto mb-4" />
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
            FIND YOUR <span className="text-army-gold">HOMETOWN</span> RECRUITER
          </h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
            // Enter your zip code to connect with a recruiter in your area //
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-army-gold" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="ENTER YOUR ZIP CODE"
            value={zipCode}
            onChange={e => setZipCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full bg-zinc-900 border-2 border-zinc-800 focus:border-army-gold pl-12 pr-4 py-4 text-sm font-black uppercase tracking-wider outline-none transition-colors placeholder:text-zinc-600"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || zipCode.length < 5}
          className="btn-gaming px-8 py-4 text-sm font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          SEARCH
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {searched && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-[10px] font-mono text-army-gold uppercase tracking-widest mb-4">
              // {results.length} RECRUITER{results.length > 1 ? 'S' : ''} FOUND FOR {zipCode} //
            </p>
            {results.map((recruiter, i) => (
              <motion.div
                key={recruiter.slug || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="hud-border p-6 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all"
              >
                <div className="flex items-center gap-5">
                  {/* Photo */}
                  {recruiter.photoURL ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-army-gold/40 flex-shrink-0">
                      <img src={recruiter.photoURL} alt={recruiter.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-army-gold/20 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Users className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black uppercase tracking-tight">{recruiter.displayName}</h3>
                    {recruiter.city && (
                      <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-army-gold" />
                        {recruiter.address1 ? `${recruiter.address1}, ` : ''}{recruiter.city}, {recruiter.state}
                      </p>
                    )}

                    {/* Contact Row */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {recruiter.cellPhone && (
                        <>
                          <a href={`tel:${recruiter.cellPhone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-army-gold text-army-black text-[10px] font-black uppercase hover:scale-105 transition-transform">
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          <a href={`sms:${recruiter.cellPhone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-army-gold text-army-black text-[10px] font-black uppercase hover:scale-105 transition-transform">
                            <MessageSquare className="w-3 h-3" /> Text
                          </a>
                        </>
                      )}
                      {recruiter.publicEmail && (
                        <a href={`mailto:${recruiter.publicEmail}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-army-gold text-army-black text-[10px] font-black uppercase hover:scale-105 transition-transform">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      )}
                    </div>
                  </div>

                  {/* View Profile Link */}
                  {recruiter.slug && (
                    <a
                      href={`/?r=${recruiter.slug}`}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 border border-army-gold/30 text-army-gold text-[10px] font-black uppercase tracking-wider hover:bg-army-gold/10 transition-all flex-shrink-0"
                    >
                      View Profile <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Mobile View Profile */}
                {recruiter.slug && (
                  <a
                    href={`/?r=${recruiter.slug}`}
                    className="sm:hidden flex items-center justify-center gap-2 mt-4 py-2 border border-army-gold/30 text-army-gold text-[10px] font-black uppercase tracking-wider hover:bg-army-gold/10 transition-all"
                  >
                    View Full Profile <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {searched && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-400 mb-2">No Recruiters Found for {zipCode}</h3>
            <p className="text-sm text-zinc-600 mb-6">
              We don't have a recruiter assigned to that zip code yet.
            </p>
            <p className="text-xs text-zinc-500 font-mono uppercase">
              Try a nearby zip code or contact our main office
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
