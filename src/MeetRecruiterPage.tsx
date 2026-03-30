/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MessageSquare, MapPin, ArrowRight,
  Instagram, Facebook, Linkedin, Youtube, Link as LinkIcon, Users,
  Music, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { SharedNavbar } from './SharedNavbar';
import { FloatingCTA } from './FloatingCTA';
import { SharedChatbot } from './SharedChatbot';
import { SharedLeadCapture } from './SharedLeadCapture';
import { SharedFooter } from './SharedFooter';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { RecruiterFinder } from './RecruiterFinder';
import GuardLinkIcon from './GuardLinkIcon';

interface RecruiterProfile {
  displayName: string;
  rank: string;
  firstName: string;
  lastName: string;
  cellPhone: string;
  publicEmail: string;
  locationType: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  photoURL: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  discord: string;
  linkedin: string;
  youtube: string;
  linktree: string;
  whyJoined: string;
  civilianCareer: string;
  favoritePartOfServing: string;
  favoriteHobbies: string;
  favoriteTravelPlace: string;
  messageToProspects: string;
}

const DEFAULT: RecruiterProfile = {
  displayName: '',
  rank: '',
  firstName: '',
  lastName: '',
  cellPhone: '',
  publicEmail: '',
  locationType: '',
  address1: '',
  city: '',
  state: 'FL',
  zip: '',
  photoURL: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  discord: '',
  linkedin: '',
  youtube: '',
  linktree: '',
  whyJoined: '',
  civilianCareer: '',
  favoritePartOfServing: '',
  favoriteHobbies: '',
  favoriteTravelPlace: '',
  messageToProspects: '',
};

export const MeetRecruiterPage = ({
  onBack,
  slugParam,
}: {
  onBack: () => void;
  slugParam: string;
}) => {
  const [profile, setProfile] = useState<RecruiterProfile>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  const slugQuery = slugParam ? '?r=' + slugParam : '';

  useEffect(() => {
    const fetchProfile = async () => {
      if (slugParam) {
        try {
          const q = query(collection(db, 'users'), where('slug', '==', slugParam));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0].data();
            console.log('Meet page fetched profile:', d);
            setProfile({
              displayName: d.displayName || DEFAULT.displayName,
              rank: d.rank || '',
              firstName: d.firstName || '',
              lastName: d.lastName || '',
              cellPhone: d.cellPhone || d.phoneNumber || DEFAULT.cellPhone,
              publicEmail: d.publicEmail || d.email || DEFAULT.publicEmail,
              locationType: d.locationType || 'Armory',
              address1: d.address1 || '',
              city: d.city || '',
              state: d.state || 'FL',
              zip: d.zip || '',
              photoURL: d.photoURL || d.profilePhoto || '',
              instagram: d.instagram || '',
              facebook: d.facebook || '',
              tiktok: d.tiktok || '',
              discord: d.discord || '',
              linkedin: d.linkedin || '',
              youtube: d.youtube || '',
              linktree: d.linktree || '',
              whyJoined: d.whyJoined || '',
              civilianCareer: d.civilianCareer || '',
              favoritePartOfServing: d.favoritePartOfServing || '',
              favoriteHobbies: d.favoriteHobbies || '',
              favoriteTravelPlace: d.favoriteTravelPlace || '',
              messageToProspects: d.messageToProspects || '',
            });
          }
        } catch (err) {
          console.error('Error fetching recruiter profile:', err);
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [slugParam]);

  const qaItems = [
    { q: 'Why did you join the Guard?', a: profile.whyJoined },
    { q: "What's your civilian career?", a: profile.civilianCareer },
    { q: 'What do you like most about serving?', a: profile.favoritePartOfServing },
    { q: 'Favorite hobbies?', a: profile.favoriteHobbies },
    { q: "Favorite place you've traveled?", a: profile.favoriteTravelPlace },
  ].filter(item => item.a);

  const makeUrl = (base: string, handle: string) => handle.startsWith('http') ? handle : `${base}${handle}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-army-black flex items-center justify-center">
        <div className="text-center">
          <GuardLinkIcon className="w-12 h-12 text-army-gold mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // If no slug, show the Recruiter Finder instead of a profile
  if (!slugParam) {
    return (
      <div className="min-h-screen bg-army-black text-white">
        <SharedNavbar slugParam={slugParam} onBack={onBack} />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-24">
          <RecruiterFinder variant="full" />
        </div>

        {/* Lead Capture for generic */}
        <SharedLeadCapture slugParam={slugParam} source="meet-recruiter-finder" title="CAN'T FIND YOUR RECRUITER?" subtitle="// DROP_YOUR_INFO_AND_WE'LL_CONNECT_YOU //" />

        {/* Fixed Call/Text/Email */}
        <FloatingCTA slugParam={slugParam} />

        <SharedFooter slugParam={slugParam} />

        <SharedChatbot slugParam={slugParam} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-army-black text-white">
      {/* Shared Navbar */}
      <SharedNavbar slugParam={slugParam} onBack={onBack} />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          {/* Photo */}
          <div className="mb-8">
            {profile.photoURL ? (
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-army-gold/60 shadow-[0_0_40px_rgba(255,213,48,0.2)] mx-auto">
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-army-gold/30 bg-zinc-900 flex items-center justify-center mx-auto">
                <Users className="w-16 h-16 text-zinc-700" />
              </div>
            )}
          </div>

          <p className="text-[10px] font-mono text-army-gold uppercase tracking-[0.3em] mb-3">// Meet Your Hometown Recruiter //</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">{profile.displayName}</h1>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400 font-bold uppercase">
            {profile.locationType && profile.city && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-army-gold" /> {profile.address1 ? `${profile.address1}, ` : ''}{profile.city}, {profile.state}
              </span>
            )}
          </div>

          {/* Contact Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <a href={`tel:${profile.cellPhone}`} className="flex items-center gap-2 px-6 py-3 bg-army-gold text-army-black font-black uppercase text-sm tracking-wider hover:scale-105 transition-transform shadow-xl">
              <Phone className="w-4 h-4" /> Call
            </a>
            <a href={`sms:${profile.cellPhone}`} className="flex items-center gap-2 px-6 py-3 bg-army-gold text-army-black font-black uppercase text-sm tracking-wider hover:scale-105 transition-transform shadow-xl">
              <MessageSquare className="w-4 h-4" /> Text
            </a>
            <a href={`mailto:${profile.publicEmail}`} className="flex items-center gap-2 px-6 py-3 bg-army-gold text-army-black font-black uppercase text-sm tracking-wider hover:scale-105 transition-transform shadow-xl">
              <Mail className="w-4 h-4" /> Email
            </a>
          </div>

          {/* Social Links */}
          {(profile.instagram || profile.facebook || profile.tiktok || profile.discord || profile.linkedin || profile.youtube || profile.linktree) && (
            <div className="flex justify-center gap-3 mt-6">
              {profile.instagram && <a href={makeUrl('https://instagram.com/', profile.instagram)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><Instagram className="w-5 h-5"/></a>}
              {profile.facebook && <a href={makeUrl('https://facebook.com/', profile.facebook)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><Facebook className="w-5 h-5"/></a>}
              {profile.tiktok && <a href={makeUrl('https://tiktok.com/@', profile.tiktok)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><Music className="w-5 h-5"/></a>}
              {profile.discord && <a href={makeUrl('https://discord.gg/', profile.discord)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><MessageCircle className="w-5 h-5"/></a>}
              {profile.linkedin && <a href={makeUrl('https://linkedin.com/in/', profile.linkedin)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><Linkedin className="w-5 h-5"/></a>}
              {profile.youtube && <a href={makeUrl('https://youtube.com/@', profile.youtube)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><Youtube className="w-5 h-5"/></a>}
              {profile.linktree && <a href={makeUrl('https://linktr.ee/', profile.linktree)} target="_blank" rel="noreferrer" className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-army-gold hover:border-army-gold transition-all"><LinkIcon className="w-5 h-5"/></a>}
            </div>
          )}
        </motion.div>

        {/* Message to Prospects */}
        {profile.messageToProspects && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hud-border p-8 md:p-12 bg-army-gold/5 border-army-gold/20 mb-12 text-center"
          >
            <p className="text-[10px] font-mono text-army-gold uppercase tracking-[0.2em] mb-4">// Message to Future Soldiers //</p>
            <p className="text-lg md:text-xl text-zinc-300 font-bold leading-relaxed italic">"{profile.messageToProspects}"</p>
            <p className="text-sm text-army-gold font-black uppercase mt-6">— {profile.displayName}</p>
          </motion.div>
        )}

        {/* Q&A Section */}
        {qaItems.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-center mb-10">Get to <span className="text-army-gold">Know Me</span></h2>
            <div className="space-y-6">
              {qaItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="hud-border p-6 bg-zinc-900/30"
                >
                  <p className="text-[10px] font-black text-army-gold uppercase tracking-widest mb-3">{item.q}</p>
                  <p className="text-zinc-300 text-sm font-bold leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fixed Call/Text/Email */}
      <FloatingCTA slugParam={slugParam} />

      <SharedLeadCapture slugParam={slugParam} source="meet-recruiter" title="READY TO CONNECT?" subtitle="// SCHEDULE_YOUR_MISSION_BRIEF //" />

      {/* Footer */}
      <SharedFooter slugParam={slugParam} />

      {/* Shared AI Chatbot */}
      <SharedChatbot slugParam={slugParam} />
    </div>
  );
};
