/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
*/

import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface SharedNavbarProps {
  slugParam: string;
  onBack: () => void;
  onDashboardClick?: () => void;
}

export const SharedNavbar = ({ slugParam, onBack, onDashboardClick }: SharedNavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const slugQuery = slugParam ? `?r=${slugParam}` : '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pageLinks = [
    { name: 'Home', to: `/${slugQuery}` },
    { name: 'How to Join', to: `/join${slugQuery}` },
    { name: 'ASVAB', to: `/asvab${slugQuery}` },
    { name: 'Benefits', to: `/benefits${slugQuery}` },
    { name: 'Officers', to: `/officers${slugQuery}` },
    { name: 'FAQ', to: `/faq${slugQuery}` },
    { name: 'Meet Your Recruiter', to: `/meet${slugQuery}` },
    { name: 'Rank Up', to: `/rank-up${slugQuery}` },
  ];

  const handleDashboard = () => {
    if (onDashboardClick) {
      onDashboardClick();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-army-black/90 backdrop-blur-md border-b border-army-gold/20 py-3" : "bg-army-black py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to={`/${slugQuery}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <GuardLinkIcon className="text-army-gold w-7 h-7 glow-text" />
          <span className="text-xl font-black tracking-tighter text-white leading-none">GUARD<span className="text-army-gold">LINK</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {pageLinks.map((link) => (
            <Link key={link.name} to={link.to} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-army-gold transition-all font-mono relative group">
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-army-gold transition-all group-hover:w-full" />
            </Link>
          ))}
          <span className="h-4 w-px bg-zinc-800/50" />
          <button onClick={handleDashboard} className="text-[9px] text-zinc-600 hover:text-army-gold transition-colors uppercase font-black font-mono">Admin_Login</button>
        </div>

        {/* Mobile: Admin + Hamburger */}
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={handleDashboard}
            className="text-[10px] text-zinc-400 hover:text-army-gold transition-colors uppercase font-black font-mono flex items-center gap-1.5"
            aria-label="Admin Login"
          >
            <Lock className="w-3.5 h-3.5" />
            Admin
          </button>
          <button className="text-white p-2 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6 text-army-gold" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 bg-black z-50 flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <GuardLinkIcon className="text-army-gold w-8 h-8" />
                <span className="text-2xl font-black tracking-tighter text-white">GUARD<span className="text-army-gold">LINK</span></span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full"><X className="w-6 h-6 text-army-gold" /></button>
            </div>

            <div className="space-y-3 flex-1">
              {pageLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-3 px-4 text-lg font-black uppercase tracking-tight text-white hover:text-army-gold border border-zinc-800 hover:border-army-gold/40 bg-zinc-950/50 transition-all group"
                  >
                    {link.name}
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-army-gold transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-3">
              <Link
                to={`/${slugQuery}#register`}
                onClick={() => setIsOpen(false)}
                className="block w-full py-4 text-center font-black uppercase tracking-widest bg-army-gold text-army-black text-sm hover:scale-[1.02] transition-transform"
              >
                Start Your Application
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleDashboard();
                }}
                className="w-full text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest pt-2"
              >
                // Admin_Access_Portal //
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
