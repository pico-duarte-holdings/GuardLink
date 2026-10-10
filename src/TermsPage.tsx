import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { SharedFooter } from './SharedFooter';

const sections = [
  ['The Service', 'GuardLink provides informational, administrative, lead-tracking, and workflow tools for recruiting support. Features may change, and we may suspend or discontinue any part of the service.'],
  ['No Government Affiliation', 'GuardLink is privately operated. It is not an official website or service of the United States Government, Department of Defense, Department of the Army, National Guard Bureau, Florida Department of Military Affairs, or any other government agency. Government or military references do not imply endorsement.'],
  ['No Recruiting Guarantee', 'GuardLink does not guarantee enlistment, appointment, qualification, waiver approval, job selection, benefits, accession, or any other recruiting outcome. Official eligibility and processing decisions belong to authorized government personnel.'],
  ['Accounts and Security', 'You are responsible for accurate account information, protecting your credentials, and activity under your account. Notify us promptly of suspected unauthorized access.'],
  ['Acceptable Use', 'You may not misuse the service, disrupt its operation, bypass security, scrape or reverse engineer protected portions, upload unlawful or unauthorized information, impersonate another person, or use GuardLink in violation of applicable policy or law.'],
  ['Data Responsibility', 'You must have authority to submit information to GuardLink and must follow all applicable privacy, records, command, and agency rules. Do not upload classified information, controlled unclassified information, medical records, Social Security numbers, or financial account data.'],
  ['Intellectual Property', 'GuardLink software, branding, design, text, and original content are owned by Pico Duarte Holdings LLC or its licensors and are licensed to GuardLink Technologies LLC for operation. These Terms do not transfer ownership rights to users.'],
  ['Third-Party Services', 'GuardLink may link to or rely on third-party services. Their separate terms and privacy policies apply, and we are not responsible for services we do not control.'],
  ['Disclaimer', 'The service is provided on an “as is” and “as available” basis to the fullest extent permitted by law. We do not warrant uninterrupted operation, error-free data, or fitness for a particular recruiting outcome.'],
  ['Limitation of Liability', 'To the fullest extent permitted by law, GuardLink Technologies LLC, Pico Duarte Holdings LLC, and their affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from use of the service.'],
  ['Suspension and Termination', 'We may suspend or terminate access for misuse, security risk, legal requirements, or breach of these Terms. Provisions that should reasonably survive termination will remain in effect.'],
  ['Governing Law', 'Florida law governs these Terms without regard to conflict-of-law rules. Any dispute will be brought in the state or federal courts serving Palm Beach County, Florida.'],
];

export const TermsPage = ({ onBack, slugParam = '' }: { onBack: () => void, slugParam?: string }) => (
  <>
    <main className="min-h-screen bg-army-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-army-gold mb-8 hover:underline"><ChevronLeft className="w-4 h-4" /> Back to GuardLink</button>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 mb-3">Legal // Rules of Use</p>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-army-gold mb-3">Terms of Service</h1>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-10">Last updated: October 10, 2026</p>
        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section><h2 className="text-xl font-bold text-white mb-3">Acceptance</h2><p>These Terms govern your use of guardlink.site and related GuardLink services, operated by GuardLink Technologies LLC under Pico Duarte Holdings LLC. By using the service, you agree to these Terms and the Privacy Policy.</p></section>
          {sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-bold text-white mb-3">{title}</h2><p>{body}</p></section>)}
          <section><h2 className="text-xl font-bold text-white mb-3">Changes and Contact</h2><p>We may update these Terms by posting a revised version here. Questions may be sent to <a className="text-army-gold hover:underline" href="mailto:support@guardlink.site">support@guardlink.site</a>.</p></section>
        </div>
      </div>
    </main>
    <SharedFooter slugParam={slugParam} />
  </>
);
