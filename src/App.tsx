/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { LandingPage } from './LandingPage';
import { useXP } from './useXP';
import { XPBar } from './XPBar';

const RecruiterDashboard = lazy(() => import('./RecruiterDashboard').then(m => ({ default: m.RecruiterDashboard })));
const PlayerDashboard = lazy(() => import('./PlayerDashboard').then(m => ({ default: m.PlayerDashboard })));
const RecruiterDashboardVanguard = lazy(() => import('./RecruiterDashboardVanguard').then(m => ({ default: m.RecruiterDashboardVanguard })));
const CandidatePipelineVanguard = lazy(() => import('./CandidatePipelineVanguard').then(m => ({ default: m.CandidatePipelineVanguard })));
const CandidateIntakeVanguard = lazy(() => import('./CandidateIntakeVanguard').then(m => ({ default: m.CandidateIntakeVanguard })));
const FAQPage = lazy(() => import('./FAQPage').then(m => ({ default: m.FAQPage })));
const BenefitsPage = lazy(() => import('./BenefitsPage').then(m => ({ default: m.BenefitsPage })));
const OfficerPage = lazy(() => import('./OfficerPage').then(m => ({ default: m.OfficerPage })));
const MeetRecruiterPage = lazy(() => import('./MeetRecruiterPage').then(m => ({ default: m.MeetRecruiterPage })));
const HowToJoinPage = lazy(() => import('./HowToJoinPage').then(m => ({ default: m.HowToJoinPage })));
const ASVABPage = lazy(() => import('./ASVABPage').then(m => ({ default: m.ASVABPage })));
const RankUpPage = lazy(() => import('./RankUpPage').then(m => ({ default: m.RankUpPage })));
const TermsPage = lazy(() => import('./TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./PrivacyPage').then(m => ({ default: m.PrivacyPage })));

function AppRoutes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const slugParam = searchParams.get('r') || '';
  const slugQuery = slugParam ? `?r=${slugParam}` : '';

  const xp = useXP();

  // Grant page-visit XP based on route
  useEffect(() => {
    const path = location.pathname;
    const pageXPMap: Record<string, string> = {
      '/benefits': 'page-benefits',
      '/asvab': 'page-asvab',
      '/officers': 'page-officers',
      '/faq': 'page-faq',
      '/join': 'page-how-to-join',
      '/meet': 'page-meet',
      '/rank-up': 'page-rank-up',
    };
    const action = pageXPMap[path];
    if (action) {
      xp.grantXP(action);
    }
  }, [location.pathname]);

  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/vanguard') || location.pathname.startsWith('/player');

  return (
    <main className="bg-army-black text-white selection:bg-army-gold selection:text-army-black">
      {/* XP Bar visible on all pages except dashboard */}
      {!isDashboard && (
        <XPBar
          level={xp.level}
          xp={xp.xp}
          maxXP={xp.maxXP}
          totalXP={xp.totalXP}
          rankTitle={xp.rankTitle}
          tierName={xp.tierName}
          tier={xp.tier}
          levelUpEvent={xp.levelUpEvent}
          clearLevelUp={xp.clearLevelUp}
          xpPopup={xp.xpPopup}
          clearXpPopup={xp.clearXpPopup}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-army-black flex items-center justify-center"><div className="text-army-gold font-black text-xl animate-pulse uppercase tracking-widest">Loading...</div></div>}>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage onDashboardClick={() => navigate('/dashboard')} onPlayerLogin={() => navigate('/player')} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <RecruiterDashboard onBack={() => navigate(`/${slugQuery}`)} />
          }
        />
        <Route
          path="/player"
          element={
            <PlayerDashboard onBack={() => navigate(`/${slugQuery}`)} />
          }
        />
        <Route
          path="/vanguard/dashboard"
          element={<RecruiterDashboardVanguard />}
        />
        <Route
          path="/vanguard/pipeline"
          element={<CandidatePipelineVanguard />}
        />
        <Route
          path="/vanguard/intake"
          element={<CandidateIntakeVanguard />}
        />
        <Route
          path="/faq"
          element={
            <FAQPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/benefits"
          element={
            <BenefitsPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/officers"
          element={
            <OfficerPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/meet"
          element={
            <MeetRecruiterPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/join"
          element={
            <HowToJoinPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/asvab"
          element={
            <ASVABPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/rank-up"
          element={
            <RankUpPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/terms"
          element={
            <TermsPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />
        <Route
          path="/privacy"
          element={
            <PrivacyPage onBack={() => navigate(`/${slugQuery}`)} slugParam={slugParam} />
          }
        />            </Routes>
      </Suspense>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
