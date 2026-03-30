/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Plus, Send, Loader2, X, RefreshCw, CheckCircle, Clock,
  BarChart3, Users, AlertTriangle, Eye, Trash2, ChevronDown, ChevronUp,
  ExternalLink
} from 'lucide-react';
import {
  getEmailCampaigns,
  createEmailCampaign,
  sendEmailCampaignNow,
  getContactLists,
  type BrevoEmailCampaign,
} from './lib/brevo';
import { cn } from './lib/utils';

interface ContactList {
  id: number;
  name: string;
  totalSubscribers: number;
  folderId: number;
}

interface CampaignManagerProps {
  profileData: {
    rank?: string;
    firstName?: string;
    lastName?: string;
    publicEmail?: string;
    firstName?: string;
    senderEmail?: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400 bg-zinc-900 border-zinc-700',
  sent: 'text-neon-green bg-neon-green/10 border-neon-green/30',
  scheduled: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
  queued: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  suspended: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const STARTER_TEMPLATES = [
  {
    label: 'ASVAB Reminder',
    subject: 'ASVAB Study Resources — Army National Guard',
    body: `<h2 style="color:#FFD530;text-transform:uppercase;">Don't Forget — ASVAB Is Your Key</h2>
<p style="color:#ccc;line-height:1.7;">Your ASVAB score unlocks every career path in the Army National Guard. The higher you score, the more MOS options are available to you.</p>
<ul style="color:#ccc;line-height:2;">
  <li>Free study guide: <a href="https://www.military.com/join-the-military/asvab/" style="color:#FFD530;">Military.com ASVAB Prep</a></li>
  <li>Official practice: <a href="https://www.officialasvab.com" style="color:#FFD530;">officialasvab.com</a></li>
</ul>
<p style="color:#ccc;line-height:1.7;">Ready to schedule? Reply to this email and let's lock in a date.</p>`,
  },
  {
    label: 'Follow-Up Blast',
    subject: 'Still Interested in the Army National Guard?',
    body: `<h2 style="color:#FFD530;text-transform:uppercase;">Your Future is Waiting</h2>
<p style="color:#ccc;line-height:1.7;">We haven't connected in a while, but we haven't forgotten about you. The Army National Guard offers unmatched benefits — college tuition, job training, leadership experience — while you continue your civilian career.</p>
<p style="color:#ccc;line-height:1.7;">If you're still interested, reply to this email or call us. There's no pressure — just a conversation.</p>`,
  },
  {
    label: 'Benefits Highlight',
    subject: 'What the Guard Can Do for Your Career',
    body: `<h2 style="color:#FFD530;text-transform:uppercase;">Guard Benefits That Work for You</h2>
<ul style="color:#ccc;line-height:2.2;">
  <li>💰 <strong style="color:#fff;">Enlistment Bonuses</strong> up to $20,000+</li>
  <li>🎓 <strong style="color:#fff;">100% Tuition Assistance</strong> for college courses</li>
  <li>🏥 <strong style="color:#fff;">Tricare Health Insurance</strong> for you and your family</li>
  <li>🏚️ <strong style="color:#fff;">Montgomery GI Bill</strong> — housing stipend during school</li>
  <li>🛡️ <strong style="color:#fff;">Life Insurance</strong> at low group rates</li>
  <li>🌎 <strong style="color:#fff;">Travel Opportunities</strong> and specialized training</li>
</ul>
<p style="color:#ccc;line-height:1.7;margin-top:16px;">One weekend a month. Two weeks a year. All that in return.</p>`,
  },
];

export const CampaignManager: React.FC<CampaignManagerProps> = ({ profileData }) => {
  const [campaigns, setCampaigns] = useState<BrevoEmailCampaign[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);

  // Create form state
  const [form, setForm] = useState({
    name: '',
    subject: '',
    senderName: '',
    senderEmail: '',
    htmlBody: '',
    selectedListIds: [] as number[],
    scheduledAt: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const senderName =
    form.senderName ||
    `${profileData.rank || ''} ${profileData.lastName || ''}${profileData.firstName ? ', ' + profileData.firstName : ''}`.trim() ||
    'GuardLink Recruiting';
  const VERIFIED_SENDER = 'support@guardlink.site';
  const senderEmail = form.senderEmail || VERIFIED_SENDER;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [campRes, listRes] = await Promise.all([
        getEmailCampaigns({ limit: 50 }),
        getContactLists(),
      ]);
      setCampaigns(campRes.campaigns || []);
      setLists(listRes.lists || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load from Brevo. Check your API key.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!form.name || !form.subject || !form.htmlBody) {
      setCreateError('Campaign name, subject, and body are required.');
      return;
    }
    if (!senderEmail) {
      setCreateError('Sender email is required. Set your public email in Profile settings.');
      return;
    }
    if (form.selectedListIds.length === 0) {
      setCreateError('Select at least one contact list.');
      return;
    }
    setCreating(true);
    try {
      const fullHtml = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#030000;font-family:Arial,sans-serif;color:#fff;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 16px;background:#030000;">
  <tr><td style="text-align:center;padding:24px 0;background:#030000;">
    <img src="https://gen-lang-client-0786963463.web.app/logo-email.png" alt="GuardLink" width="160" height="160" style="display:block;margin:0 auto;" />
  </td></tr>
  <tr><td style="background:#111;border:1px solid rgba(255,213,48,0.2);padding:32px;">
    ${form.htmlBody}
  </td></tr>
  <tr><td style="background:#030000;padding:16px;text-align:center;">
    <p style="color:#444;font-size:10px;margin:0;">Sent by <strong style="color:#666;">${senderName}</strong> via GuardLink. To unsubscribe reply STOP to <a href="mailto:support@guardlink.site" style="color:#FFD530;">support@guardlink.site</a>.</p>
  </td></tr>
</table>
</body></html>`;

      const replyToEmail = profileData.publicEmail || VERIFIED_SENDER;
      await createEmailCampaign({
        name: form.name,
        subject: form.subject,
        htmlContent: fullHtml,
        senderName,
        senderEmail,
        listIds: form.selectedListIds,
        replyTo: replyToEmail,
        ...(form.scheduledAt ? { scheduledAt: new Date(form.scheduledAt).toISOString() } : {}),
      });

      setShowCreate(false);
      setForm({ name: '', subject: '', senderName: '', senderEmail: '', htmlBody: '', selectedListIds: [], scheduledAt: '' });
      await loadData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create campaign');
    }
    setCreating(false);
  };

  const handleSendNow = async (campaign: BrevoEmailCampaign) => {
    if (!window.confirm(`Send campaign "${campaign.name}" to all recipients now?`)) return;
    setSending(campaign.id);
    try {
      await sendEmailCampaignNow(campaign.id);
      await loadData();
    } catch (err: any) {
      alert('Failed to send: ' + err.message);
    }
    setSending(null);
  };

  const toggleList = (id: number) => {
    setForm(prev => ({
      ...prev,
      selectedListIds: prev.selectedListIds.includes(id)
        ? prev.selectedListIds.filter(x => x !== id)
        : [...prev.selectedListIds, id],
    }));
  };

  const applyTemplate = (tpl: (typeof STARTER_TEMPLATES)[0]) => {
    setForm(prev => ({ ...prev, subject: tpl.subject, htmlBody: tpl.body }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest glow-text flex items-center gap-2">
            <Mail className="w-5 h-5 text-army-gold" /> Email Campaigns
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            Powered by Brevo — design, schedule & track mass email campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-zinc-500 hover:text-army-gold"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <a
            href="https://app.brevo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-army-gold"
            title="Open Brevo Dashboard"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-army-gold text-black font-black uppercase text-[10px] tracking-wider"
          >
            <Plus className="w-3 h-3" /> New Campaign
          </button>
        </div>
      </div>

      {/* API Key Warning */}
      {!import.meta.env.VITE_BREVO_API_KEY && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 p-4 text-yellow-400 text-[10px] font-mono uppercase">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          VITE_BREVO_API_KEY not set. Add it to your .env file to enable campaigns.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-[10px] font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create Campaign Form */}
      {showCreate && (
        <div className="hud-border bg-zinc-950 p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black uppercase text-army-gold">Create New Campaign</h3>
            <button onClick={() => setShowCreate(false)}>
              <X className="w-4 h-4 text-zinc-500 hover:text-white" />
            </button>
          </div>

          {/* Starter Templates */}
          <div>
            <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">
              Quick-Start Templates
            </label>
            <div className="flex gap-2 flex-wrap">
              {STARTER_TEMPLATES.map(tpl => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-[10px] font-black uppercase text-zinc-400 hover:border-army-gold hover:text-army-gold"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                  Campaign Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sept Follow-Up Blast"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                  Email Subject *
                </label>
                <input
                  required
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Still Interested in the Guard?"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                  Sender Name
                </label>
                <input
                  value={form.senderName}
                  onChange={e => setForm({ ...form, senderName: e.target.value })}
                  placeholder={senderName}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                  Sender Email *
                </label>
                <input
                  type="email"
                  value={form.senderEmail}
                  onChange={e => setForm({ ...form, senderEmail: e.target.value })}
                  placeholder={senderEmail || VERIFIED_SENDER}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
                />
                <p className="text-[9px] text-zinc-600 mt-1">
                  Must be a verified sender in your Brevo account
                </p>
              </div>
            </div>

            {/* Body Editor */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                Email Body (HTML) *
              </label>
              <textarea
                required
                rows={10}
                value={form.htmlBody}
                onChange={e => setForm({ ...form, htmlBody: e.target.value })}
                placeholder="<h2 style='color:#FFD530;'>Your message here...</h2><p>Body content...</p>"
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white outline-none focus:border-army-gold font-mono resize-y"
              />
              <p className="text-[9px] text-zinc-600 mt-1">
                HTML snippet — GuardLink header/footer will be added automatically
              </p>
            </div>

            {/* Contact Lists */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">
                Send To (Contact Lists) *
              </label>
              {lists.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic">
                  No contact lists found. Create lists in{' '}
                  <a
                    href="https://app.brevo.com/contact/list"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-army-gold underline"
                  >
                    Brevo
                  </a>{' '}
                  and add contacts via the Leads tab.
                </p>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {lists.map(list => (
                    <label
                      key={list.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 border text-[10px] font-black uppercase cursor-pointer',
                        form.selectedListIds.includes(list.id)
                          ? 'bg-army-gold/10 border-army-gold text-army-gold'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedListIds.includes(list.id)}
                        onChange={() => toggleList(list.id)}
                        className="accent-army-gold"
                      />
                      {list.name} ({list.totalSubscribers.toLocaleString()})
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                Schedule Send (optional — leave blank to keep as draft)
              </label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                className="bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
              />
            </div>

            {createError && (
              <p className="text-red-400 text-[10px] font-mono bg-red-500/10 border border-red-500/30 p-3">
                {createError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 font-black uppercase text-[10px] text-zinc-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2 bg-army-gold text-black font-black uppercase text-[10px] disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                {form.scheduledAt ? 'Create & Schedule' : 'Create Draft'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-army-gold mx-auto" />
          <p className="text-zinc-500 text-[10px] font-mono uppercase mt-3">Loading from Brevo...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-800">
          <Mail className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-black uppercase">No campaigns yet</p>
          <p className="text-zinc-600 text-[10px] font-mono mt-2">Create your first campaign to get started</p>
        </div>
      ) : (
        <div className="hud-border overflow-hidden">
          <table className="w-full text-left text-[10px] uppercase">
            <thead className="bg-zinc-900/50 text-zinc-500 font-black border-b border-zinc-800">
              <tr>
                <th className="p-3">Campaign</th>
                <th className="p-3 hidden md:table-cell">Status</th>
                <th className="p-3 hidden lg:table-cell">Stats</th>
                <th className="p-3 hidden sm:table-cell">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {campaigns.map(camp => {
                const stats = camp.statistics?.globalStats;
                const isExpanded = expandedId === camp.id;
                return (
                  <React.Fragment key={camp.id}>
                    <tr className="hover:bg-white/5">
                      <td className="p-3">
                        <div className="font-black text-white">{camp.name}</div>
                        <div className="text-zinc-500 text-[9px] font-mono mt-0.5">{camp.subject}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span
                          className={cn(
                            'px-2 py-0.5 border text-[9px] font-black uppercase',
                            STATUS_COLORS[camp.status] || STATUS_COLORS.draft
                          )}
                        >
                          {camp.status}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        {stats ? (
                          <div className="flex gap-4 text-[9px]">
                            <span className="text-zinc-400">
                              <span className="text-white font-black">{stats.delivered ?? 0}</span> sent
                            </span>
                            <span className="text-zinc-400">
                              <span className="text-neon-green font-black">
                                {stats.uniqueOpens ?? 0}
                              </span>{' '}
                              opens
                            </span>
                            <span className="text-zinc-400">
                              <span className="text-neon-cyan font-black">
                                {stats.uniqueClicks ?? 0}
                              </span>{' '}
                              clicks
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-zinc-500 font-mono hidden sm:table-cell">
                        {camp.sentDate
                          ? new Date(camp.sentDate).toLocaleDateString()
                          : camp.scheduledAt
                          ? `Scheduled ${new Date(camp.scheduledAt).toLocaleDateString()}`
                          : new Date(camp.modifiedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {camp.status === 'draft' && (
                            <button
                              onClick={() => handleSendNow(camp)}
                              disabled={sending === camp.id}
                              title="Send Now"
                              className="p-1.5 text-zinc-500 hover:text-army-gold disabled:opacity-40"
                            >
                              {sending === camp.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {camp.status === 'sent' && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : camp.id)}
                              title="View Stats"
                              className="p-1.5 text-zinc-500 hover:text-army-gold"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : camp.id)}
                            className="p-1.5 text-zinc-500 hover:text-army-gold"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="bg-zinc-900/30 px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Delivered', value: stats?.delivered ?? '—', color: 'text-white' },
                              { label: 'Unique Opens', value: stats?.uniqueOpens ?? '—', color: 'text-neon-green' },
                              { label: 'Unique Clicks', value: stats?.uniqueClicks ?? '—', color: 'text-neon-cyan' },
                              { label: 'Unsubscribes', value: stats?.unsubscribed ?? '—', color: 'text-red-400' },
                              { label: 'Soft Bounces', value: stats?.bounces ?? '—', color: 'text-orange-400' },
                              {
                                label: 'Open Rate',
                                value:
                                  stats && stats.delivered && stats.delivered > 0
                                    ? `${((stats.uniqueOpens / stats.delivered) * 100).toFixed(1)}%`
                                    : '—',
                                color: 'text-army-gold',
                              },
                              {
                                label: 'Click Rate',
                                value:
                                  stats && stats.delivered && stats.delivered > 0
                                    ? `${((stats.uniqueClicks / stats.delivered) * 100).toFixed(1)}%`
                                    : '—',
                                color: 'text-army-gold',
                              },
                              {
                                label: 'Scheduled',
                                value: camp.scheduledAt
                                  ? new Date(camp.scheduledAt).toLocaleString()
                                  : '—',
                                color: 'text-zinc-400',
                              },
                            ].map(stat => (
                              <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-3">
                                <p className="text-[9px] uppercase text-zinc-500 mb-1">{stat.label}</p>
                                <p className={cn('text-xl font-black', stat.color)}>
                                  {typeof stat.value === 'number'
                                    ? stat.value.toLocaleString()
                                    : stat.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Lists Overview */}
      {!isLoading && lists.length > 0 && (
        <div className="hud-border p-4">
          <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-3 flex items-center gap-2">
            <Users className="w-3 h-3" /> Brevo Contact Lists
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lists.map(list => (
              <div key={list.id} className="bg-zinc-900 border border-zinc-800 p-3">
                <p className="text-[9px] uppercase text-zinc-500 truncate">{list.name}</p>
                <p className="text-xl font-black text-army-gold">
                  {list.totalSubscribers.toLocaleString()}
                </p>
                <p className="text-[8px] text-zinc-600">subscribers</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-zinc-600 mt-3">
            Contacts are added to Brevo lists automatically when leads are imported or players
            complete intake. Manage lists at{' '}
            <a
              href="https://app.brevo.com/contact/list"
              target="_blank"
              rel="noopener noreferrer"
              className="text-army-gold underline"
            >
              app.brevo.com
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
};
