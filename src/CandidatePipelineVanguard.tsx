import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CandidatePipelineVanguard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#121319] text-[#e3e1ea] font-['Space_Grotesk'] selection:bg-[#ffd530] selection:text-[#715c00] min-h-screen flex">
      {/* SideNavBar (Shared Component) */}
      <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-[#1b1b21] font-['JetBrains_Mono'] text-xs uppercase tracking-widest rounded-none w-64">
        <div className="p-6">
          <div className="font-['Space_Grotesk'] font-bold text-[#FFD530] text-lg tracking-tighter">RECRUIT_OPS</div>
          <div className="text-[10px] opacity-50 mt-1">V0.42_STABLE</div>
        </div>
        <nav className="flex-1 mt-8 space-y-1">
          <button onClick={() => navigate('/vanguard/pipeline')} className="w-full flex items-center px-6 py-4 bg-[#FFD530] text-[#121319] font-bold border-r-4 border-[#fff4dc] transition-transform duration-100 translate-x-1">
            <span className="material-symbols-outlined mr-4">account_tree</span>
            <span>Pipeline</span>
          </button>
          <button onClick={() => navigate('/vanguard/intake')} className="w-full flex items-center px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
            <span className="material-symbols-outlined mr-4">group</span>
            <span>Candidates</span>
          </button>
          <button className="w-full flex items-center px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
            <span className="material-symbols-outlined mr-4">business</span>
            <span>Clients</span>
          </button>
          <button className="w-full flex items-center px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
            <span className="material-symbols-outlined mr-4">query_stats</span>
            <span>Analytics</span>
          </button>
          <button className="w-full flex items-center px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
            <span className="material-symbols-outlined mr-4">inventory_2</span>
            <span>Archive</span>
          </button>
        </nav>
        <div className="p-6 mb-4">
          <button className="w-full py-3 bg-gradient-to-br from-[#fff4dc] to-[#ffd530] text-[#231b00] font-black text-[10px] rounded-sm tracking-[0.2em] shadow-lg shadow-[#ebc318]/5">
            NEW_PLACEMENT
          </button>
        </div>
        <div className="mt-auto border-t border-[#4d4633]/15 p-4 space-y-2">
          <button className="flex items-center px-2 py-1 text-[#d0c6ac] hover:text-[#FFD530]">
            <span className="material-symbols-outlined text-sm mr-2">help_center</span>
            <span className="text-[10px]">Support</span>
          </button>
          <button className="flex items-center px-2 py-1 text-[#d0c6ac] hover:text-[#FFD530]">
            <span className="material-symbols-outlined text-sm mr-2">terminal</span>
            <span className="text-[10px]">System_Logs</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* TopNavBar (Shared Component) */}
        <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 bg-[#121319] rounded-none border-b-0 font-['Space_Grotesk'] tracking-tight uppercase">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="text-[#d0c6ac] hover:text-[#ffd530] transition-colors active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold">Exit</span>
            </button>
            <h1 className="text-xl font-black tracking-tighter text-[#FFD530] uppercase cursor-pointer" onClick={() => navigate('/vanguard/dashboard')}>VANGUARD_CRM</h1>
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#d0c6ac] text-lg">search</span>
              <input 
                className="w-full bg-[#0d0e14] border-none py-2 pl-10 pr-4 text-xs font-['JetBrains_Mono'] text-[#d0c6ac] focus:ring-1 focus:ring-[#ffd530] transition-all outline-none" 
                placeholder="QUERY_RECRUITS..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4 items-center">
              <button className="text-[#d0c6ac] hover:bg-[#34343b] p-2 transition-colors duration-100 active:scale-95" title="Add New">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <button className="text-[#d0c6ac] hover:bg-[#34343b] p-2 transition-colors duration-100 active:scale-95" title="Notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="text-[#d0c6ac] hover:bg-[#34343b] p-2 transition-colors duration-100 active:scale-95" title="Settings">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="h-10 w-10 bg-[#292930] border-2 border-[#4d4633]/30 rounded-sm overflow-hidden">
              <img 
                alt="Recruiter Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA71Jr7XzwWyY0R2HI37orCJjGaFNTzi86mFi-nWIhTHqEP5-AUWwv0Yp_xBG-_ZdyAZ_drLKVpnyfipGt-L0VeCBizMUEMQctHdY4dV4NyESwt01Vf53jFEY08OasGofGGfITshmlfkF_sbANn2gYgBNGUsf1e34j6apcNehnla_UVkT0sCodU877WTdkCRaNJKllsRpc-wQ1Ra3sKb9Uzs5lzOQxN50JnEy1-vpByXZZWO81mZvPP3ko9HIMrbxkVfunOo_eMjcPw"
              />
            </div>
          </div>
        </header>

        {/* Main View: Pipeline Board */}
        <section className="flex-1 p-8 space-y-8 overflow-hidden flex flex-col">
          {/* Tactical HUD Header */}
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">OPERATIONAL_PIPELINE</h2>
              <p className="font-['JetBrains_Mono'] text-xs text-[#ffd530] tracking-[0.3em]">CANDIDATE_FLOW_MONITOR // ACTIVE_SESSION</p>
            </div>
            <div className="backdrop-blur-md bg-[#34343b]/40 px-6 py-4 flex gap-12 border-l-2 border-[#ffd530]">
              <div className="text-center">
                <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] mb-1">LIVE_POOL</div>
                <div className="text-2xl font-black font-headline">1,204</div>
              </div>
              <div className="text-center">
                <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] mb-1">CONVERSION</div>
                <div className="text-2xl font-black font-headline">14.2%</div>
              </div>
              <div className="text-center">
                <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] mb-1">VELOCITY</div>
                <div className="text-2xl font-black font-headline text-[#ffd530]">FAST</div>
              </div>
            </div>
          </div>

          {/* Pipeline Board */}
          <div className="flex-1 flex gap-4 overflow-x-auto pb-6">
            {/* Stage: Lead */}
            <div className="flex-none w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1b1b21] border-l-4 border-[#d0c6ac]">
                <span className="font-['JetBrains_Mono'] font-bold text-xs tracking-widest text-[#d0c6ac]">01_LEAD</span>
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-50 px-2 bg-[#0d0e14]">08</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {/* Candidate Card */}
                <div className="bg-[#1f1f25] p-4 border border-[#4d4633]/10 hover:border-[#ffd530]/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm tracking-tight group-hover:text-[#ffd530] transition-colors">DR. ELARA VANCE</div>
                      <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] uppercase">Senior Bio-Engineer</div>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30">drag_indicator</span>
                  </div>
                  {/* XP Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase tracking-tighter">
                      <span className="text-[#d0c6ac]">DOSSIER_COMPLETION</span>
                      <span>22%</span>
                    </div>
                    <div className="w-full h-1 bg-[#0d0e14] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc]" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="px-2 py-0.5 bg-[#0d0e14] font-['JetBrains_Mono'] text-[8px] text-[#d0c6ac] border border-[#4d4633]/10">EXECUTIVE</div>
                    <div className="px-2 py-0.5 bg-[#0d0e14] font-['JetBrains_Mono'] text-[8px] text-[#d0c6ac] border border-[#4d4633]/10">US_BASED</div>
                  </div>
                </div>

                <div className="bg-[#1f1f25] p-4 border border-[#4d4633]/10 hover:border-[#ffd530]/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm tracking-tight group-hover:text-[#ffd530] transition-colors">MARCUS THORNE</div>
                      <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] uppercase">DevOps Architect</div>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-30">drag_indicator</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase tracking-tighter">
                      <span className="text-[#d0c6ac]">DOSSIER_COMPLETION</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full h-1 bg-[#0d0e14] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc]" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage: Prospect */}
            <div className="flex-none w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1b1b21] border-l-4 border-[#ffd530]">
                <span className="font-['JetBrains_Mono'] font-bold text-xs tracking-widest text-[#ffd530]">02_PROSPECT</span>
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-50 px-2 bg-[#0d0e14]">03</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-[#292930] p-4 border border-[#4d4633]/20 relative">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-[#ffd530] translate-x-1/2 -translate-y-1/2"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm tracking-tight text-[#fff4dc]">SARAH_JENKINS.XLSX</div>
                      <div className="font-['JetBrains_Mono'] text-[10px] text-[#ffd530] uppercase">Data Scientist // L8</div>
                    </div>
                    <span className="material-symbols-outlined text-sm text-[#ffd530]">priority_high</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase tracking-tighter">
                      <span className="text-[#d0c6ac]">DOSSIER_COMPLETION</span>
                      <span className="text-[#ffd530] font-bold">48%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0d0e14] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc]" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-none bg-[#0d0e14] border border-[#4d4633]/20 flex items-center justify-center text-[8px] font-bold">JD</div>
                      <div className="w-6 h-6 rounded-none bg-[#ffd530] text-[#3b2f00] flex items-center justify-center text-[8px] font-bold">MT</div>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-[8px] text-[#d0c6ac]">UPDATED_2H_AGO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage: Applicant */}
            <div className="flex-none w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1b1b21] border-l-4 border-[#fff4dc]">
                <span className="font-['JetBrains_Mono'] font-bold text-xs tracking-widest text-[#fff4dc]">03_APPLICANT</span>
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-50 px-2 bg-[#0d0e14]">12</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-[#1f1f25] p-4 border border-[#4d4633]/10">
                  <div className="font-bold text-sm mb-1">KAI SHIMADA</div>
                  <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] mb-4 uppercase">Quantum Computing Spec.</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase">
                      <span className="text-[#d0c6ac]">DOSSIER_COMPLETION</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full h-1 bg-[#0d0e14]">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc]" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1f1f25] p-4 border border-[#4d4633]/10 opacity-60">
                  <div className="font-bold text-sm mb-1">ELENA RODRIGUEZ</div>
                  <div className="font-['JetBrains_Mono'] text-[10px] text-[#d0c6ac] mb-4 uppercase">Full Stack Lead</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase">
                      <span className="text-[#d0c6ac]">DOSSIER_COMPLETION</span>
                      <span>59%</span>
                    </div>
                    <div className="w-full h-1 bg-[#0d0e14]">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc]" style={{ width: '59%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage: Vetting */}
            <div className="flex-none w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1b1b21] border-l-4 border-[#ffd530]">
                <span className="font-['JetBrains_Mono'] font-bold text-xs tracking-widest text-[#ffd530]">04_VETTING</span>
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-50 px-2 bg-[#0d0e14]">02</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-[#292930] p-4 border-l-2 border-[#ffd530]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#0d0e14] border border-[#4d4633]/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ffd530]">verified_user</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm">VICTOR KRAVITZ</div>
                      <div className="font-['JetBrains_Mono'] text-[10px] text-[#ffd530]">SEC_CHECK_ACTIVE</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase">
                      <span className="text-[#d0c6ac]">DOSSIER_COMPLETION</span>
                      <span className="text-[#ffd530] font-bold">89%</span>
                    </div>
                    <div className="w-full h-2 bg-[#0d0e14] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc]" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-[#0d0e14] border border-[#ffd530]/20 font-['JetBrains_Mono'] text-[9px] text-[#ffd530] hover:bg-[#ffd530] hover:text-[#3b2f00] transition-all uppercase tracking-widest">Run_Technical_Audit</button>
                </div>
              </div>
            </div>

            {/* Stage: Shipper */}
            <div className="flex-none w-80 flex flex-col gap-4">
              <div className="flex items-center justify-between px-3 py-2 bg-[#1b1b21] border-l-4 border-[#ffe17c]">
                <span className="font-['JetBrains_Mono'] font-bold text-xs tracking-widest text-[#ffe17c]">05_SHIPPER</span>
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-50 px-2 bg-[#0d0e14]">01</span>
              </div>
              <div className="flex-1 space-y-3">
                <div className="bg-gradient-to-br from-[#292930] to-[#1b1b21] p-5 border border-[#ffd530]/10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="font-black text-lg tracking-tighter leading-none">ANNA VOLKOV</div>
                      <div className="font-['JetBrains_Mono'] text-[10px] text-[#ffd530]">FINAL_OFFER_STAGE</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#ffd530] flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-[#3b2f00] text-sm">rocket_launch</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between font-['JetBrains_Mono'] text-[9px] uppercase">
                      <span className="text-[#fff4dc]">DEPLOYMENT_READY</span>
                      <span className="text-[#ffd530] font-bold">100%</span>
                    </div>
                    <div className="w-full h-3 bg-[#0d0e14] overflow-hidden relative group">
                      <div className="h-full bg-gradient-to-r from-[#ffd530] to-[#fff4dc] w-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/2 h-full bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-[#ffd530] text-[#3b2f00] font-black font-headline text-[10px] tracking-widest">DEPLOY_TO_CLIENT</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer (Shared Component) */}
        <footer className="w-full py-4 px-8 flex justify-between items-center border-t border-[#4d4633]/15 bg-[#121319] font-['JetBrains_Mono'] text-[10px] uppercase opacity-60">
          <div className="flex gap-8">
            <span className="hover:text-[#FFD530] cursor-pointer">Documentation</span>
            <span className="hover:text-[#FFD530] cursor-pointer">Privacy_Protocol</span>
            <span className="hover:text-[#FFD530] cursor-pointer">API_Status</span>
          </div>
          <div>
            ©2024 VANGUARD_SYSTEMS // ALL_RIGHTS_RESERVED
          </div>
          <div className="flex gap-4 items-center">
            <span>SYS_LATENCY: 42MS</span>
            <div className="w-2 h-2 bg-[#ffd530] rounded-full"></div>
          </div>
        </footer>
      </main>

      {/* Tactical HUD Element */}
      <div className="fixed bottom-12 right-12 z-50">
        <div className="backdrop-blur-md bg-[#34343b]/40 p-1 border-l-2 border-t-2 border-[#ffd530]">
          <div className="bg-[#34343b]/60 p-4 space-y-3">
            <div className="flex justify-between items-center gap-8">
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#ffd530] tracking-widest">V0.42_CORE</span>
              <span className="material-symbols-outlined text-[#ffd530] text-sm">sync</span>
            </div>
            <div className="space-y-1">
              <div className="font-['JetBrains_Mono'] text-[8px] opacity-50 uppercase">Session_Load</div>
              <div className="w-32 h-1 bg-[#0d0e14]">
                <div className="h-full bg-[#ffd530] w-3/4"></div>
              </div>
            </div>
            <div className="flex justify-between font-['JetBrains_Mono'] text-[9px]">
              <span className="opacity-50">NODE_B_12</span>
              <span className="text-[#ffd530]">STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
