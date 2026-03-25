/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import { useState } from 'react';
import { LandingPage } from './LandingPage';
import { RecruiterDashboard } from './RecruiterDashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  return (
    <main className="bg-army-black text-white selection:bg-army-gold selection:text-army-black">
      {view === 'landing' ? (
        <LandingPage onDashboardClick={() => setView('dashboard')} />
      ) : (
        <RecruiterDashboard onBack={() => setView('landing')} />
      )}
    </main>
  );
}
