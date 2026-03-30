/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Plus, Send, Loader2, X, RefreshCw, CheckCircle,
  BarChart3, AlertTriangle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import {
  getSMSCampaigns,
  createSMSCampaign,
  sendSMSCampaignNow,
  getContactLists,
  type BrevoSMSCampaign,
} from './lib/brevo';
import { cn } from './lib/utils';

interface ContactList {
  id: number;
  name: string;
  totalSubscribers: number;
  folderId: number;
}

interface SMSCampaignManagerProps {
  profileData: {
    rank?: string;
    firstName?: string;
    lastName?: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400 bg-zinc-900 border-zinc-700',
  sent: 'text-neon-green bg-neon-green/10 border-neon-green/30',
  scheduled: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
  queued: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  inProgress: 'text-army-gold bg-army-gold/10 border-army-gold/30',
  suspended: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const SMS_TEMPLATES = [
  {
    label: 'Follow-Up',
    content: 'Hey, this is {recruiter} with the Army National Guard. Still thinking about serving? Reply and let\'s connect!',
  },
  {
    label: 'ASVAB Reminder',
    content: 'Reminder: Your ASVAB score unlocks every career in the Guard. Ready to schedule? Reply YES and I\'ll set it up. -{recruiter}',
  },
  {
    label: 'Benefits Blast',
    content: 'Guard benefits: tuition, bonuses up to $20K, healthcare & more. 1 weekend/month. Interested? Reply now. -{recruiter}',
  },
];

const MAX_SMS_LENGTH = 160;

export const SMSCampaignManager: React.FC<SMSCampaignManagerProps> = ({ profileData }) => {
  const [campaigns, setCampaigns] = useState<BrevoSMSCampaign[]>([]);
  const [lists, setLists] = useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);

  const defaultSender =
    `${profileData.rank || ''} ${profileData.lastName || ''}`.trim().replace(/\s+/g, '').substring(0, 11) ||
    'GuardLink';

  const [form, setForm] = useState({
    name: '',
    sender: '',
    content: '',
    selectedListIds: [] as number[],
    scheduledAt: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const effectiveSender = (form.sender || defaultSender).substring(0, 11);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [campRes, listRes] = await Promise.all([
        getSMSCampaigns({ limit: 50 }),
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
    if (!form.name || !form.content) {
      setCreateError('Campaign name and message content are required.');
      return;
    }
    if (form.content.length > MAX_SMS_LENGTH) {
      setCreateError(`Message must be ${MAX_SMS_LENGTH} characters or fewer.`);
      return;
    }
    if (form.selectedListIds.length === 0) {
      setCreateError('Select at least one contact list.');
      return;
    }
    setCreating(true);
    try {
      await createSMSCampaign({
        name: form.name,
        sender: effectiveSender,
        content: form.content,
        listIds: form.selectedListIds,
        ...(form.scheduledAt ? { scheduledAt: new Date(form.scheduledAt).toISOString() } : {}),
      });
      setShowCreate(false);
      setForm({ name: '', sender: '', content: '', selectedListIds: [], scheduledAt: '' });
      await loadData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create SMS campaign');
    }
    setCreating(false);
  };

  const handleSendNow = async (campaign: BrevoSMSCampaign) => {
    if (!window.confirm(`Send SMS campaign "${campaign.name}" to all recipients now?`)) return;
    setSending(campaign.id);
    try {
      await sendSMSCampaignNow(campaign.id);
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

  const applyTemplate = (tpl: (typeof SMS_TEMPLATES)[0]) => {
    const recruiterName = `${profileData.rank || ''} ${profileData.lastName || ''}`.trim() || 'your recruiter';
    setForm(prev => ({
      ...prev,
      content: tpl.content.replace('{recruiter}', recruiterName),
    }));
  };

  const charsLeft = MAX_SMS_LENGTH - form.content.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest glow-text flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-army-gold" /> SMS Campaigns
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            Powered by Brevo — send targeted SMS blasts to your contact lists
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
            href="https://app.brevo.com/sms-campaign/list"
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
            <Plus className="w-3 h-3" /> New SMS Campaign
          </button>
        </div>
      </div>

      {/* API Key Warning */}
      {!import.meta.env.VITE_BREVO_API_KEY && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 p-4 text-yellow-400 text-[10px] font-mono uppercase">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          VITE_BREVO_API_KEY not set. Add it to your .env file to enable SMS campaigns.
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
            <h3 className="text-sm font-black uppercase text-army-gold">Create New SMS Campaign</h3>
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
              {SMS_TEMPLATES.map(tpl => (
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
                  placeholder="e.g. Sept Follow-Up SMS"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">
                  Sender Name (max 11 chars)
                </label>
                <input
                  value={form.sender}
                  maxLength={11}
                  onChange={e => setForm({ ...form, sender: e.target.value })}
                  placeholder={effectiveSender}
                  className="w-full bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white outline-none focus:border-army-gold"
                />
                <p className="text-[9px] text-zinc-600 mt-1">
                  Alphanumeric only — shown as the sender on recipient's phone
                </p>
              </div>
            </div>

            {/* SMS Content */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase text-zinc-500">
                  Message Content *
                </label>
                <span className={cn('text-[9px] font-mono', charsLeft < 0 ? 'text-red-400' : charsLeft < 20 ? 'text-yellow-400' : 'text-zinc-500')}>
                  {charsLeft} chars remaining
                </span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={MAX_SMS_LENGTH}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Your SMS message here (160 chars max)..."
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-xs text-white outline-none focus:border-army-gold font-mono resize-none"
              />
              <p className="text-[9px] text-zinc-600 mt-1">
                160 characters = 1 SMS credit. Contacts must have a phone number (SMS attribute) set in Brevo.
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
          <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-black uppercase">No SMS campaigns yet</p>
          <p className="text-zinc-600 text-[10px] font-mono mt-2">Create your first SMS campaign to blast your contact lists</p>
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
                const stats = camp.statistics;
                const isExpanded = expandedId === camp.id;
                return (
                  <React.Fragment key={camp.id}>
                    <tr className="hover:bg-white/5">
                      <td className="p-3">
                        <div className="font-black text-white">{camp.name}</div>
                        <div className="text-zinc-500 text-[9px] font-mono mt-0.5 truncate max-w-[200px]">
                          {camp.content}
                        </div>
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
                        {stats && (stats.delivered != null || stats.sent != null) ? (
                          <div className="flex gap-4 text-[9px]">
                            <span className="text-zinc-400">
                              <span className="text-white font-black">{stats.sent ?? stats.delivered ?? 0}</span> sent
                            </span>
                            <span className="text-zinc-400">
                              <span className="text-neon-green font-black">{stats.delivered ?? 0}</span> delivered
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="p-3 text-zinc-500 font-mono hidden sm:table-cell">
                        {camp.scheduledAt
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
                          {(camp.status === 'sent') && (
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
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {[
                              { label: 'Sent', value: stats?.sent ?? '—', color: 'text-white' },
                              { label: 'Delivered', value: stats?.delivered ?? '—', color: 'text-neon-green' },
                              { label: 'Soft Bounces', value: stats?.softBounces ?? '—', color: 'text-orange-400' },
                              { label: 'Hard Bounces', value: stats?.hardBounces ?? '—', color: 'text-red-400' },
                              { label: 'Unsubscribed', value: stats?.unsubscribed ?? '—', color: 'text-red-400' },
                              { label: 'Answers', value: stats?.answered ?? '—', color: 'text-neon-cyan' },
                              {
                                label: 'Scheduled',
                                value: camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleString() : '—',
                                color: 'text-zinc-400',
                              },
                            ].map(stat => (
                              <div key={stat.label} className="bg-zinc-900 border border-zinc-800 p-3">
                                <p className="text-[9px] uppercase text-zinc-500 mb-1">{stat.label}</p>
                                <p className={cn('text-xl font-black', stat.color)}>
                                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="bg-zinc-900 border border-zinc-800 p-3">
                            <p className="text-[9px] uppercase text-zinc-500 mb-1">Message Preview</p>
                            <p className="text-xs text-zinc-300 font-mono">{camp.content}</p>
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
    </div>
  );
};
