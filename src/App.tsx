/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './LandingPage';
import { RecruiterDashboard } from './RecruiterDashboard';
import { FAQPage } from './FAQPage';
import { BenefitsPage } from './BenefitsPage';
import { OfficerPage } from './OfficerPage';
import { MeetRecruiterPage } from './MeetRecruiterPage';
import { HowToJoinPage } from './HowToJoinPage';
import { ASVABPage } from './ASVABPage';
import { RankUpPage } from './RankUpPage';
import { TermsPage } from './TermsPage';
import { PrivacyPage } from './PrivacyPage';
import { useXP } from './useXP';
import { XPBar } from './XPBar';

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

  const isDashboard = location.pathname === '/dashboard';

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
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage onDashboardClick={() => navigate('/dashboard')} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <RecruiterDashboard onBack={() => navigate(`/${slugQuery}`)} />
          }
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
        />
      </Routes>
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
