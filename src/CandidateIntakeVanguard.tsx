import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CandidateIntakeVanguard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#121319] text-[#e3e1ea] font-['Space_Grotesk'] overflow-x-hidden selection:bg-[#ffd530] selection:text-[#715c00] min-h-screen flex flex-col">
      {/* TopNavBar Implementation */}
      <header className="flex justify-between items-center w-full px-6 py-3 sticky top-0 z-50 bg-[#121319]">
        <div className="flex items-center gap-6">
          <span className="text-xl font-black tracking-tighter text-[#FFD530] uppercase font-['Space_Grotesk'] cursor-pointer" onClick={() => navigate('/vanguard/dashboard')}>VANGUARD_CRM</span>
          <div className="hidden md:flex gap-4 font-['Space_Grotesk'] tracking-tight uppercase text-xs">
            <button className="text-[#FFD530] border-b-2 border-[#FFD530] py-1">Onboarding</button>
            <button className="text-[#d0c6ac] hover:bg-[#34343b] transition-colors duration-100 py-1 px-2">Compliance</button>
            <button className="text-[#d0c6ac] hover:bg-[#34343b] transition-colors duration-100 py-1 px-2">Support</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button className="p-2 text-[#d0c6ac] hover:bg-[#34343b] transition-colors duration-100 active:scale-95">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button className="p-2 text-[#d0c6ac] hover:bg-[#34343b] transition-colors duration-100 active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-[#d0c6ac] hover:bg-[#34343b] transition-colors duration-100 active:scale-95">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="w-8 h-8 rounded-none overflow-hidden bg-[#292930] border border-[#4d4633]/20">
            <img 
              alt="Recruiter Profile" 
              className="w-full h-full object-cover grayscale contrast-125" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC089yTHycLrHluQVU6Ee1SuFLu9YMY02qVzfzp8oEN5AsoMNm7J7xge9qUysB2z76HTxGuE4bGD2OMv3UHj6et7LATnfwZGMYkd_daY_HQ72iDCcxzHjFWPICLYny6-R2UyiSihlFy89W-SR1mg8qJsjIPKkruqDU22yETo2nomIeCsOAKEinbs1uQ11C-iO2taVL5muOIWwGFsUnXZ2lJNcYTz3cObb0IkKFuISnuP0SjntR3j25U6flTMw_DWXLS55ZQiDfW7NRg"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* SideNavBar Implementation */}
        <aside className="fixed left-0 top-0 h-full flex flex-col z-40 bg-[#1b1b21] rounded-none w-64 border-r border-[#4d4633]/10 hidden lg:flex">
          <div className="p-6">
            <h2 className="font-['Space_Grotesk'] font-bold text-[#FFD530] text-xl">RECRUIT_OPS</h2>
            <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac] opacity-60">V0.42_STABLE</p>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <div className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest px-3 py-4 text-[#d0c6ac]/40">Primary_Ops</div>
            <button onClick={() => navigate('/vanguard/pipeline')} className="w-full flex items-center gap-3 px-4 py-3 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1 font-['JetBrains_Mono'] text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined">account_tree</span>
              Pipeline
            </button>
            <button onClick={() => navigate('/vanguard/intake')} className="w-full flex items-center gap-3 px-4 py-3 bg-[#FFD530] text-[#121319] font-bold border-r-4 border-[#fff4dc] font-['JetBrains_Mono'] text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined">group</span>
              Candidates
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-[#d0c6ac] hover:bg-[#34343b] hover:text-[#FFD530] transition-transform duration-100 hover:translate-x-1 font-['JetBrains_Mono'] text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined">business</span>
              Clients
            </button>
          </nav>
          <div className="p-4 mt-auto border-t border-[#4d4633]/10">
            <button className="w-full py-3 bg-gradient-to-br from-[#fff4dc] to-[#ffd530] text-[#231b00] font-bold font-['JetBrains_Mono'] text-xs tracking-tighter uppercase rounded-sm hover:brightness-110 active:scale-[0.98] transition-all">
              NEW_PLACEMENT
            </button>
            <div className="mt-4 space-y-2">
              <button className="flex items-center gap-2 px-2 text-[#d0c6ac] font-['JetBrains_Mono'] text-[10px] uppercase hover:text-[#FFD530]">
                <span className="material-symbols-outlined text-sm">help_center</span> Support
              </button>
              <button className="flex items-center gap-2 px-2 text-[#d0c6ac] font-['JetBrains_Mono'] text-[10px] uppercase hover:text-[#FFD530]">
                <span className="material-symbols-outlined text-sm">terminal</span> System_Logs
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <button onClick={() => navigate('/dashboard')} className="text-[#d0c6ac] hover:text-[#ffd530] transition-colors active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold">Exit</span>
            </button>
          </div>
          {/* Tactical HUD Header */}
          <section className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#ffd530] animate-pulse"></span>
                <span className="font-['JetBrains_Mono'] text-xs text-[#ffd530] tracking-[0.2em] uppercase">SECURE_ONBOARDING_INITIALIZED</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter uppercase text-[#e3e1ea] leading-none">
                CANDIDATE<br/><span className="text-[#ffd530]">INTAKE_PORTAL</span>
              </h1>
            </div>
            <div className="backdrop-blur-md bg-[#34343b]/40 p-4 border-l-4 border-[#ffd530]">
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#d0c6ac]">Encryption_Status</p>
                  <p className="font-['JetBrains_Mono'] text-lg font-bold text-[#ffd530]">AES_256_ACTIVE</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-[#ffd530]">verified_user</span>
              </div>
            </div>
          </section>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Section 1: Account Verification */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[#1b1b21] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#ffd530]/10 rotate-45 translate-x-8 -translate-y-8"></div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-[#ffd530]">[ 01_AUTH ]</span>
                  <span className="material-symbols-outlined text-[#d0c6ac] opacity-50">key</span>
                </div>
                <h3 className="font-headline font-bold text-2xl uppercase mb-6 tracking-tight">Account_Verification</h3>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac]">Email_Address</label>
                    <div className="bg-[#0d0e14] h-12 flex items-center px-4 relative group">
                      <input 
                        className="bg-transparent border-none w-full focus:ring-0 text-[#fff4dc] font-['JetBrains_Mono'] placeholder:text-[#d0c6ac]/20 uppercase text-xs outline-none" 
                        placeholder="CANDIDATE@VANGUARD.SYS" 
                        type="email"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#fff4dc] group-focus-within:w-full transition-all duration-300"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac]">Access_Key</label>
                    <div className="bg-[#0d0e14] h-12 flex items-center px-4 relative group">
                      <input 
                        className="bg-transparent border-none w-full focus:ring-0 text-[#fff4dc] font-['JetBrains_Mono'] uppercase text-xs outline-none" 
                        type="password" 
                        defaultValue="••••••••••••"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#fff4dc] group-focus-within:w-full transition-all duration-300"></div>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-[#34343b] text-[#ffd530] font-bold font-['JetBrains_Mono'] text-xs tracking-widest uppercase hover:bg-[#ffd530] hover:text-[#3b2f00] transition-colors duration-200">
                    VALIDATE_CREDENTIALS
                  </button>
                </form>
              </div>

              <div className="bg-[#292930] p-4 flex items-start gap-4 border border-[#4d4633]/10">
                <span className="material-symbols-outlined text-[#ffd530]">info</span>
                <div>
                  <p className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold text-[#ffd530] mb-1">System_Notice</p>
                  <p className="text-xs text-[#d0c6ac] leading-relaxed">Multi-factor authentication (MFA) will be triggered upon successful primary validation.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Biometric Data & Vault */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Biometric Data Profile */}
              <div className="md:col-span-2 bg-[#1b1b21] p-8 relative">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-[#ffd530]">[ 02_IDENTITY ]</span>
                    <h3 className="font-headline font-bold text-3xl uppercase tracking-tighter mt-2">Biometric_Data_Profile</h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-[#d0c6ac]/20">fingerprint</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac]">Full_Legal_Name</label>
                      <div className="bg-[#0d0e14] h-12 flex items-center px-4 relative">
                        <input 
                          className="bg-transparent border-none w-full focus:ring-0 text-[#fff4dc] font-['JetBrains_Mono'] uppercase text-xs outline-none" 
                          placeholder="SURNAME, GIVEN" 
                          type="text"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#4d4633]/30"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac]">Social_Security_Index</label>
                      <div className="bg-[#0d0e14] h-12 flex items-center px-4 relative">
                        <input 
                          className="bg-transparent border-none w-full focus:ring-0 text-[#fff4dc] font-['JetBrains_Mono'] uppercase text-xs outline-none" 
                          placeholder="000-00-0000" 
                          type="text"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#4d4633]/30"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac]">Birth_Chronology</label>
                      <div className="bg-[#0d0e14] h-12 flex items-center px-4 relative">
                        <input 
                          className="bg-transparent border-none w-full focus:ring-0 text-[#fff4dc] font-['JetBrains_Mono'] uppercase text-xs outline-none [color-scheme:dark]" 
                          type="date"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#4d4633]/30"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#d0c6ac]">Tax_Jurisdiction</label>
                      <select className="bg-[#0d0e14] border-none w-full h-12 focus:ring-0 text-[#fff4dc] font-['JetBrains_Mono'] uppercase text-xs px-4 outline-none">
                        <option>NORTH_AMERICA_US</option>
                        <option>EURO_ZONE_UK</option>
                        <option>ASIA_PACIFIC_SG</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Vault */}
              <div className="bg-[#1b1b21] p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-[#ffd530]">[ 03_VAULT ]</span>
                  <div className="h-px flex-1 bg-[#4d4633]/20"></div>
                </div>
                <h3 className="font-headline font-bold text-2xl uppercase mb-8 tracking-tight">Document_Vault</h3>
                <div className="space-y-4 flex-1">
                  <div className="group cursor-pointer bg-[#0d0e14] p-4 flex items-center justify-between hover:bg-[#34343b] transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#ffd530]">description</span>
                      <div>
                        <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#e3e1ea] font-bold">Birth_Certificate</p>
                        <p className="font-['JetBrains_Mono'] text-[9px] uppercase text-[#d0c6ac]">PDF_REQUIRED</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#d0c6ac] group-hover:text-[#fff4dc] transition-colors">upload_file</span>
                  </div>
                  <div className="group cursor-pointer bg-[#0d0e14] p-4 flex items-center justify-between border-l-2 border-[#ffd530]/40">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#ffd530]">badge</span>
                      <div>
                        <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#e3e1ea] font-bold">SSN_Card_Scan</p>
                        <p className="font-['JetBrains_Mono'] text-[9px] uppercase text-[#d0c6ac]">JPEG_PNG_VALID</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#d0c6ac] group-hover:text-[#fff4dc] transition-colors">upload_file</span>
                  </div>
                  <div className="group cursor-pointer bg-[#0d0e14] p-4 flex items-center justify-between opacity-50 grayscale">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined">home_work</span>
                      <div>
                        <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#e3e1ea] font-bold">Proof_Of_Residency</p>
                        <p className="font-['JetBrains_Mono'] text-[9px] uppercase text-[#d0c6ac]">LOCKED_UNTIL_STEP_02</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined">lock</span>
                  </div>
                </div>
              </div>

              {/* Visual Security Indicators */}
              <div className="bg-[#292930] p-8 flex flex-col justify-between overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                </div>
                <div>
                  <h4 className="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#ffd530] mb-4">SECURITY_PROTOCOL_STATS</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between font-['JetBrains_Mono'] text-[10px] uppercase">
                        <span>Encryption_Load</span>
                        <span>94%</span>
                      </div>
                      <div className="h-1 bg-[#0d0e14] w-full">
                        <div className="h-full bg-[#ffd530] w-[94%]"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-['JetBrains_Mono'] text-[10px] uppercase">
                        <span>Packet_Sanitization</span>
                        <span>ACTIVE</span>
                      </div>
                      <div className="h-1 bg-[#0d0e14] w-full">
                        <div className="h-full bg-[#ffd530] w-full opacity-50"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#ffd530] text-sm">encrypted</span>
                    <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest">End-to-End Vault Encryption</span>
                  </div>
                  <p className="text-[10px] text-[#d0c6ac] leading-tight">All assets uploaded to the Document Vault are scrubbed for metadata and stored in a cold-storage enclave.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="mt-12 p-8 bg-[#0d0e14] flex flex-col md:flex-row items-center justify-between border-t border-[#ffd530]/20">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="text-center md:text-left">
                <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#d0c6ac] mb-1">Onboarding_Progress</p>
                <div className="flex gap-1">
                  <div className="w-8 h-1 bg-[#ffd530]"></div>
                  <div className="w-8 h-1 bg-[#ffd530]/30"></div>
                  <div className="w-8 h-1 bg-[#ffd530]/10"></div>
                  <div className="w-8 h-1 bg-[#ffd530]/10"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-transparent border border-[#4d4633] text-[#d0c6ac] font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-widest hover:bg-[#292930] transition-all">
                SAVE_DRAFT
              </button>
              <button className="px-12 py-3 bg-gradient-to-br from-[#fff4dc] to-[#ffd530] text-[#231b00] font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-widest rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#ffd530]/10">
                COMMIT_DATA_SCAN
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Global Footer */}
      <footer className="w-full py-4 px-8 flex flex-col md:flex-row justify-between items-center border-t border-[#4d4633]/15 bg-[#121319] gap-4 mt-auto">
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase opacity-60 text-[#d0c6ac]">
          ©2024 VANGUARD_SYSTEMS // ALL_RIGHTS_RESERVED
        </div>
        <div className="flex gap-6">
          <button className="font-['JetBrains_Mono'] text-[10px] uppercase opacity-60 text-[#d0c6ac] hover:text-[#FFD530] hover:opacity-100 transition-all">Documentation</button>
          <button className="font-['JetBrains_Mono'] text-[10px] uppercase opacity-60 text-[#d0c6ac] hover:text-[#FFD530] hover:opacity-100 transition-all">Privacy_Protocol</button>
          <button className="font-['JetBrains_Mono'] text-[10px] uppercase opacity-60 text-[#d0c6ac] hover:text-[#FFD530] hover:opacity-100 transition-all">API_Status</button>
        </div>
      </footer>
    </div>
  );
};
