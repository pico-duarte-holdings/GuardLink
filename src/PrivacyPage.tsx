import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { SharedFooter } from './SharedFooter';

const sections = [
  ['Information We Collect', 'We collect information you provide, including contact details, recruiter or candidate profile information, lead and workflow data, and messages. We may also collect basic device, browser, security, and usage data needed to operate and protect the platform.'],
  ['How We Use Information', 'We use information to provide the GuardLink service, route inquiries, support recruiting workflows, authenticate accounts, prevent misuse, improve features, and communicate about service or security updates.'],
  ['Recruiting and Government Information', 'Do not submit classified information, controlled unclassified information, medical records, Social Security numbers, financial account details, or other information that is not approved for the platform. Users remain responsible for following applicable agency and command data-handling rules.'],
  ['Sharing', 'We do not sell personal information. We may share information with service providers that help operate GuardLink, with authorized organizational administrators, when you direct us to share it, or when law requires it.'],
  ['Cookies and Analytics', 'GuardLink may use essential browser storage, security tools, and measurement services to keep users signed in, remember preferences, detect abuse, and understand site performance. Browser controls may limit optional technologies.'],
  ['Retention and Security', 'We retain information only as long as reasonably needed for the service, legal obligations, security, and dispute resolution. We use reasonable administrative and technical safeguards, but no online system can guarantee absolute security.'],
  ['Your Choices', 'You may request access, correction, or deletion of personal information, subject to legal and operational retention requirements. Organization-managed accounts may also be controlled by an authorized administrator.'],
  ['Children', 'GuardLink is not directed to children under 13. We do not knowingly collect personal information from children under 13.'],
  ['Changes', 'We may update this policy as GuardLink changes. The date on this page identifies the current version, and material changes will be posted here.'],
];

export const PrivacyPage = ({ onBack, slugParam = '' }: { onBack: () => void, slugParam?: string }) => (
  <>
    <main className="min-h-screen bg-army-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-army-gold mb-8 hover:underline"><ChevronLeft className="w-4 h-4" /> Back to GuardLink</button>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">Legal // Data Handling</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-army-gold mb-3">Privacy Policy</h1>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-10">Last updated: October 10, 2026</p>
        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section><h2 className="text-xl font-bold text-white mb-3">Who We Are</h2><p>GuardLink is a privately operated recruiting-support platform owned by Pico Duarte Holdings LLC and operated by GuardLink Technologies LLC. This policy applies to guardlink.site, GuardLink accounts, forms, and related communications.</p></section>
          {sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-bold text-white mb-3">{title}</h2><p>{body}</p></section>)}
          <section><h2 className="text-xl font-bold text-white mb-3">Contact</h2><p>For privacy questions or requests, email <a className="text-army-gold hover:underline" href="mailto:support@guardlink.site">support@guardlink.site</a>.</p></section>
        </div>
      </div>
    </main>
    <SharedFooter slugParam={slugParam} />
  </>
);
