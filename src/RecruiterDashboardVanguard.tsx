import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RecruiterDashboardVanguard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#121319] text-[#e3e1ea] font-['Space_Grotesk'] selection:bg-[#ffd530] selection:text-[#715c00] min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-[#1b1b21] font-['JetBrains_Mono'] text-xs uppercase tracking-widest rounded-none w-64">
        <div className="p-6 flex flex-col gap-1">
          <h1 className="font-['Space_Grotesk'] font-bold text-[#FFD530] text-xl">RECRUIT_OPS</h1>
          <span className="opacity-40 text-[10px]">V0.42_STABLE</span>
        </div>
        <nav className="flex-1 mt-8">
          <div className="space-y-1">
            <button onClick={() => navigate('/vanguard/pipeline')} className="w-full flex items-center gap-4 px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
              <span className="material-symbols-outlined">account_tree</span>
              <span>Pipeline</span>
            </button>
            <button onClick={() => navigate('/vanguard/intake')} className="w-full flex items-center gap-4 px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
              <span className="material-symbols-outlined">group</span>
              <span>Candidates</span>
            </button>
            <button className="w-full flex items-center gap-4 px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
              <span className="material-symbols-outlined">business</span>
              <span>Clients</span>
            </button>
            <button className="w-full flex items-center gap-4 px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
              <span className="material-symbols-outlined">query_stats</span>
              <span>Analytics</span>
            </button>
            <button className="w-full flex items-center gap-4 px-6 py-4 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1">
              <span className="material-symbols-outlined">inventory_2</span>
              <span>Archive</span>
            </button>
          </div>
        </nav>
        <div className="p-6 border-t border-[#4d4633]/10">
          <button className="w-full bg-gradient-to-br from-[#fff4dc] to-[#ffd530] text-[#231b00] font-bold py-3 rounded-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            NEW_PLACEMENT
          </button>
          <div className="mt-6 space-y-4">
            <button className="flex items-center gap-4 text-[#d0c6ac] hover:text-[#FFD530]">
              <span className="material-symbols-outlined text-sm">help_center</span>
              <span>Support</span>
            </button>
            <button className="flex items-center gap-4 text-[#d0c6ac] hover:text-[#FFD530]">
              <span className="material-symbols-outlined text-sm">terminal</span>
              <span>System_Logs</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <header className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-50 bg-[#121319] border-b-0">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/dashboard')} className="text-[#d0c6ac] hover:text-[#ffd530] transition-colors active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold">Exit</span>
            </button>
            <div className="text-xl font-black tracking-tighter text-[#FFD530] uppercase font-['Space_Grotesk']">
              VANGUARD_CRM
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#d0c6ac] text-sm">search</span>
              <input 
                className="bg-[#0d0e14] border-none text-xs font-['JetBrains_Mono'] uppercase py-2 pl-10 pr-4 w-64 focus:ring-0 border-b-2 border-transparent focus:border-[#ffd530] transition-all outline-none text-white" 
                placeholder="QUERY_DATABASE..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="text-[#d0c6ac] hover:text-[#ffd530] transition-colors active:scale-95">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
              <button className="text-[#d0c6ac] hover:text-[#ffd530] transition-colors active:scale-95 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffd530] rounded-full"></span>
              </button>
              <button className="text-[#d0c6ac] hover:text-[#ffd530] transition-colors active:scale-95">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="h-8 w-px bg-[#4d4633]/20"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-['JetBrains_Mono'] font-bold leading-none text-[#ffd530]">UNIT_01</p>
                <p className="text-[10px] font-['JetBrains_Mono'] opacity-60 leading-none mt-1">THE_GOONIES</p>
              </div>
              <img 
                alt="Recruiter Profile" 
                className="w-8 h-8 rounded-sm grayscale hover:grayscale-0 transition-all cursor-pointer object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpmcTA8HmQ3zboyHqrLelV6-PLs0zbR8th3DLvhDv52QCdjfKQ5xHj7R9tGTk7R6n_QBE047wySyXJi9ZSUNx8Vb0e2EYIrZ316axAoYNRofzqIec9SCeUbeYJUpcPwXLH6Pkf7dClUKrvnFFtr4UAx9F-h0SWwlbFk8E44B8Xjh35LH53q5iUKtLbb0ydsMam9Qw-oalBk7fD6fTXSlTYFEI0mTk3QOgSHK-mqen3IYx18jTRlYVlXjJaWk8WA0ZZUKn8OFMVRYaL"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <section className="p-8 flex-1 bg-[#121319]">
          {/* Hero Grid: Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Prospects */}
            <div className="bg-[#1b1b21] p-6 relative overflow-hidden group border-l-4 border-[#ffd530]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-40">METRIC_ALPHA</span>
                <span className="material-symbols-outlined text-[#ffd530] opacity-20 group-hover:opacity-100 transition-opacity">radar</span>
              </div>
              <h3 className="font-headline text-4xl font-black text-[#fff4dc] tracking-tighter">1,248</h3>
              <p className="font-['JetBrains_Mono'] text-[10px] mt-1 text-[#d0c6ac]">TOTAL_PROSPECTS</p>
              <div className="mt-6 flex gap-1">
                <div className="h-1 flex-1 bg-[#ffd530]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#ffd530]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#ffd530]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#ffd530]/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#ffd530]/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
              </div>
            </div>

            {/* Candidates in Pipeline */}
            <div className="bg-[#1b1b21] p-6 relative overflow-hidden group border-l-4 border-[#fff4dc]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-40">METRIC_BETA</span>
                <span className="material-symbols-outlined text-[#fff4dc] opacity-20 group-hover:opacity-100 transition-opacity">conversion_path</span>
              </div>
              <h3 className="font-headline text-4xl font-black text-[#fff4dc] tracking-tighter">342</h3>
              <p className="font-['JetBrains_Mono'] text-[10px] mt-1 text-[#d0c6ac]">ACTIVE_PIPELINE</p>
              <div className="mt-6 flex gap-1">
                <div className="h-1 flex-1 bg-[#fff4dc]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#fff4dc]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#fff4dc]/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#fff4dc]/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#fff4dc]/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
              </div>
            </div>

            {/* Shippers */}
            <div className="bg-[#1b1b21] p-6 relative overflow-hidden group border-l-4 border-[#b4b4bd]">
              <div className="flex justify-between items-start mb-4">
                <span className="font-['JetBrains_Mono'] text-[10px] opacity-40">METRIC_GAMMA</span>
                <span className="material-symbols-outlined text-[#b4b4bd] opacity-20 group-hover:opacity-100 transition-opacity">deployed_code</span>
              </div>
              <h3 className="font-headline text-4xl font-black text-[#fff4dc] tracking-tighter">89</h3>
              <p className="font-['JetBrains_Mono'] text-[10px] mt-1 text-[#d0c6ac]">SHIPPED_PLACEMENTS</p>
              <div className="mt-6 flex gap-1">
                <div className="h-1 flex-1 bg-[#b4b4bd]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#b4b4bd]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#b4b4bd]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#b4b4bd]/40" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
                <div className="h-1 flex-1 bg-[#b4b4bd]/10" style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0 100%)' }}></div>
              </div>
            </div>
          </div>

          {/* Dashboard Center: Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Main Pipeline View (Large) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-[#1b1b21] p-1">
                <div className="bg-[#121319] p-6">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-headline font-black text-xl tracking-tight uppercase">Strategic_Overview</h2>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[#34343b] font-['JetBrains_Mono'] text-[10px] border border-[#4d4633]/20">7_DAYS</button>
                      <button className="px-3 py-1 bg-[#ffd530] text-[#3b2f00] font-['JetBrains_Mono'] text-[10px] font-bold">30_DAYS</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* Tactical List Item 1 */}
                    <div className="bg-[#1b1b21] p-4 flex items-center justify-between hover:bg-[#292930] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#34343b] flex items-center justify-center border border-[#4d4633]/10">
                          <span className="material-symbols-outlined text-[#ffd530]">shield_person</span>
                        </div>
                        <div>
                          <p className="font-['JetBrains_Mono'] text-[10px] text-[#ffd530] font-bold">L1_CANDIDATE</p>
                          <h4 className="font-headline font-bold text-lg leading-tight uppercase">Mickey_Walsh.exe</h4>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="font-['JetBrains_Mono'] text-[10px] opacity-40">STAGE</p>
                        <p className="font-['JetBrains_Mono'] font-bold text-xs">FINAL_INTERVIEW</p>
                      </div>
                      <div className="w-32 h-2 bg-[#34343b] relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-[#ffd530] w-[85%]"></div>
                      </div>
                      <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">chevron_right</span>
                    </div>

                    {/* Tactical List Item 2 */}
                    <div className="bg-[#1b1b21] p-4 flex items-center justify-between hover:bg-[#292930] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#34343b] flex items-center justify-center border border-[#4d4633]/10">
                          <span className="material-symbols-outlined text-[#fff4dc]">psychology</span>
                        </div>
                        <div>
                          <p className="font-['JetBrains_Mono'] text-[10px] text-[#fff4dc] font-bold">L2_CANDIDATE</p>
                          <h4 className="font-headline font-bold text-lg leading-tight uppercase">Data_Wang.bin</h4>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="font-['JetBrains_Mono'] text-[10px] opacity-40">STAGE</p>
                        <p className="font-['JetBrains_Mono'] font-bold text-xs">TECH_ASSESSMENT</p>
                      </div>
                      <div className="w-32 h-2 bg-[#34343b] relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-[#fff4dc] w-[45%]"></div>
                      </div>
                      <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">chevron_right</span>
                    </div>

                    {/* Tactical List Item 3 */}
                    <div className="bg-[#1b1b21] p-4 flex items-center justify-between hover:bg-[#292930] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-[#34343b] flex items-center justify-center border border-[#4d4633]/10">
                          <span className="material-symbols-outlined text-[#b4b4bd]">construction</span>
                        </div>
                        <div>
                          <p className="font-['JetBrains_Mono'] text-[10px] text-[#b4b4bd] font-bold">L3_CANDIDATE</p>
                          <h4 className="font-headline font-bold text-lg leading-tight uppercase">Chunk_Cohen.dmg</h4>
                        </div>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="font-['JetBrains_Mono'] text-[10px] opacity-40">STAGE</p>
                        <p className="font-['JetBrains_Mono'] font-bold text-xs">SCREENING</p>
                      </div>
                      <div className="w-32 h-2 bg-[#34343b] relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-[#b4b4bd] w-[15%]"></div>
                      </div>
                      <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Critical Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Pending Documents Widget */}
              <div className="bg-[#292930] p-6 border-t-2 border-[#ffd530]">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[#ffd530]">description</span>
                  <h3 className="font-['JetBrains_Mono'] font-bold text-xs uppercase tracking-tighter">Pending_Documents</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#4d4633]/10">
                    <span className="font-['JetBrains_Mono'] text-[10px] uppercase">Background_Check.pdf</span>
                    <span className="bg-[#ffb4ab]/10 text-[#ffb4ab] text-[9px] px-2 py-0.5 font-bold">OVERDUE</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#4d4633]/10">
                    <span className="font-['JetBrains_Mono'] text-[10px] uppercase">NDA_V4_EXEC.docs</span>
                    <span className="bg-[#ffd530]/10 text-[#ffd530] text-[9px] px-2 py-0.5 font-bold">PENDING</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-['JetBrains_Mono'] text-[10px] uppercase">ID_Verification.jpg</span>
                    <span className="bg-[#ffd530]/10 text-[#ffd530] text-[9px] px-2 py-0.5 font-bold">PENDING</span>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 border border-[#ffd530]/30 text-[#ffd530] text-[10px] font-['JetBrains_Mono'] font-bold hover:bg-[#ffd530] hover:text-[#3b2f00] transition-all">VIEW_ALL_RECORDS</button>
              </div>

              {/* Signatures Required Widget */}
              <div className="bg-[#292930] p-6 border-t-2 border-[#fff4dc]">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[#fff4dc]">signature</span>
                  <h3 className="font-['JetBrains_Mono'] font-bold text-xs uppercase tracking-tighter">Signatures_Required</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-[#0d0e14] p-3 border border-[#4d4633]/5">
                    <div className="w-8 h-8 rounded-full bg-[#fff4dc]/20 flex items-center justify-center font-['JetBrains_Mono'] text-[#fff4dc] font-bold text-[10px]">BM</div>
                    <div className="flex-1">
                      <p className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold">B. Mouth</p>
                      <p className="text-[9px] opacity-40">Offer_Letter_V1</p>
                    </div>
                    <button className="material-symbols-outlined text-[#fff4dc] text-lg">forward_to_inbox</button>
                  </div>
                  <div className="flex items-center gap-4 bg-[#0d0e14] p-3 border border-[#4d4633]/5">
                    <div className="w-8 h-8 rounded-full bg-[#fff4dc]/20 flex items-center justify-center font-['JetBrains_Mono'] text-[#fff4dc] font-bold text-[10px]">SR</div>
                    <div className="flex-1">
                      <p className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold">S. Rosalita</p>
                      <p className="text-[9px] opacity-40">Contract_Appendix</p>
                    </div>
                    <button className="material-symbols-outlined text-[#fff4dc] text-lg">forward_to_inbox</button>
                  </div>
                </div>
              </div>

              {/* Tactical HUD Stats */}
              <div className="bg-[#34343b]/40 backdrop-blur-md p-6 border border-[#4d4633]/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-['JetBrains_Mono'] text-[9px] opacity-40 mb-1">TEAM_MORALE</p>
                    <div className="flex gap-0.5">
                      <div className="w-2 h-4 bg-[#ffd530]"></div>
                      <div className="w-2 h-4 bg-[#ffd530]"></div>
                      <div className="w-2 h-4 bg-[#ffd530]"></div>
                      <div className="w-2 h-4 bg-[#ffd530]"></div>
                      <div className="w-2 h-4 bg-[#34343b]"></div>
                    </div>
                  </div>
                  <div>
                    <p className="font-['JetBrains_Mono'] text-[9px] opacity-40 mb-1">LOAD_CAPACITY</p>
                    <div className="flex gap-0.5">
                      <div className="w-2 h-4 bg-[#fff4dc]"></div>
                      <div className="w-2 h-4 bg-[#fff4dc]"></div>
                      <div className="w-2 h-4 bg-[#34343b]"></div>
                      <div className="w-2 h-4 bg-[#34343b]"></div>
                      <div className="w-2 h-4 bg-[#34343b]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Footer */}
        <footer className="w-full py-4 px-8 flex justify-between items-center border-t border-[#4d4633]/15 bg-[#121319] font-['JetBrains_Mono'] text-[10px] uppercase opacity-60">
          <div>
            ©2024 VANGUARD_SYSTEMS // ALL_RIGHTS_RESERVED
          </div>
          <div className="flex gap-8">
            <button className="hover:text-[#FFD530] transition-colors">Documentation</button>
            <button className="hover:text-[#FFD530] transition-colors">Privacy_Protocol</button>
            <button className="flex items-center gap-1 hover:text-[#FFD530] transition-colors">
              <span className="w-1.5 h-1.5 bg-[#ffd530] rounded-full"></span>
              API_Status: OPERATIONAL
            </button>
          </div>
        </footer>
      </main>

      {/* Tactical HUD Element (Floating) */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-[#34343b]/60 backdrop-blur-xl p-4 border border-[#ffd530]/20 rounded-sm shadow-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-[#ffd530] flex items-center justify-center rounded-sm">
            <span className="material-symbols-outlined text-[#3b2f00] font-bold">bolt</span>
          </div>
          <div>
            <p className="font-['JetBrains_Mono'] text-[10px] text-[#ffd530] font-black">SYSTEM_ACTIVE</p>
            <p className="font-['JetBrains_Mono'] text-[9px] opacity-60 tracking-widest">THROUGHPUT: 12.4 GB/S</p>
          </div>
        </div>
      </div>
    </div>
  );
};
