/*
Copyright 2026 Pico Duarte Holdings LLC. All rights reserved.
This code, design, and associated assets may not be reproduced, distributed, or transmitted in any form or by any means without prior written permission.
*/
import { useState, useMemo } from 'react';
import {
  Users, TrendingUp, Clock, CheckCircle, AlertTriangle, Zap,
  Phone, MessageSquare, Mail, Edit, ChevronRight, Flame,
  Target, Activity, Eye, UserPlus, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Lead } from '../types';

// ─── Gaming Color Palette ────────────────────────────────────────────────────
const COLORS = {
  gold: '#FFD530',
  cyan: '#00f2ff',
  green: '#39ff14',
  magenta: '#ff0055',
  purple: '#a855f7',
  orange: '#ff8c00',
  blue: '#3b82f6',
  pink: '#ec4899',
};

const LEAD_STATUSES = ['New', 'Contacted', 'Appointment', 'ASVAB', 'Physical', 'Waiver', 'Qualified', 'Enlisted'];

const STATUS_COLORS: Record<string, string> = {
  New: COLORS.cyan,
  Contacted: COLORS.blue,
  Appointment: COLORS.purple,
  ASVAB: COLORS.orange,
  Physical: COLORS.pink,
  Waiver: COLORS.magenta,
  Qualified: COLORS.green,
  Enlisted: COLORS.gold,
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface CommandCenterProps {
  leads: Lead[];
  team: any[];
  isCommander: boolean;
  userRole: 'admin' | 'recruiter' | 'pending' | null;
  onNavigateToFunnel: (filter?: string) => void;
  onEditLead: (lead: Lead) => void;
}

// ─── Utility: group leads by time bucket ─────────────────────────────────────
function groupByWeek(leads: Lead[], weeks: number = 8): { label: string; count: number }[] {
  const now = new Date();
  const buckets: { label: string; count: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = leads.filter(l => {
      const d = new Date(l.timestamp);
      return d >= weekStart && d < weekEnd;
    }).length;

    const month = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const day = weekStart.getDate();
    buckets.push({ label: `${month} ${day}`, count });
  }
  return buckets;
}

function getConversionRate(leads: Lead[], fromStatus: string, toStatus: string): number {
  const fromIdx = LEAD_STATUSES.indexOf(fromStatus);
  const toIdx = LEAD_STATUSES.indexOf(toStatus);
  const fromCount = leads.filter(l => LEAD_STATUSES.indexOf(l.status) >= fromIdx).length;
  const toCount = leads.filter(l => LEAD_STATUSES.indexOf(l.status) >= toIdx).length;
  if (fromCount === 0) return 0;
  return Math.round((toCount / fromCount) * 100);
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const GamingTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-950/95 border border-army-gold/30 px-3 py-2 backdrop-blur-md">
      <p className="text-[10px] font-black text-zinc-400 uppercase">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black" style={{ color: p.color || COLORS.cyan }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Tile ────────────────────────────────────────────────────────────────
function KPITile({
  label, value, icon: Icon, color, subValue, onClick, pulse
}: {
  label: string; value: number | string; icon: any; color: string;
  subValue?: string; onClick?: () => void; pulse?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden text-left w-full group"
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 80%, ${color}15, transparent 70%)` }}
      />
      <div className="hud-border p-4 md:p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black tracking-widest mb-1" style={{ color: `${color}99` }}>{label}</p>
            <p className="text-3xl md:text-4xl font-black tracking-tight" style={{ color }}>
              {value}
            </p>
            {subValue && (
              <p className="text-[9px] font-mono text-zinc-500 mt-1">{subValue}</p>
            )}
          </div>
          <div
            className={cn("p-2 rounded-lg", pulse && "animate-pulse")}
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </div>
    </motion.button>
  );
}

// ─── Funnel Stage Bar ────────────────────────────────────────────────────────
function FunnelBar({ stage, count, total, color, onClick }: { stage: string; count: number; total: number; color: string; onClick: () => void }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <button onClick={onClick} className="group flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded transition-all">
      <span className="text-[9px] font-black w-24 text-right" style={{ color }}>{stage}</span>
      <div className="flex-1 h-7 bg-zinc-900/80 rounded-sm overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, 2)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-sm relative"
          style={{ background: `linear-gradient(90deg, ${color}40, ${color}90)` }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(180deg, white, transparent)` }} />
        </motion.div>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/80">{count}</span>
      </div>
      <span className="text-[10px] font-mono w-12 text-right" style={{ color: `${color}99` }}>{pct.toFixed(0)}%</span>
      <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-white transition-colors" />
    </button>
  );
}

// ─── Stale Lead Row ──────────────────────────────────────────────────────────
function StaleLeadRow({ lead, onEdit }: { lead: Lead; onEdit: () => void }) {
  const hours = Math.round((Date.now() - new Date(lead.timestamp).getTime()) / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const timeLabel = days > 0 ? `${days}d ${hours % 24}h` : `${hours}h`;

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-red-950/20 rounded transition-all group border-l-2 border-red-500/50">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white truncate">
          {(lead.lastName || '').toUpperCase()}, {(lead.firstName || '').toUpperCase()}
        </p>
        <p className="text-[9px] text-zinc-500 font-mono">{lead.status} • {timeLabel} ago</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a href={`tel:${lead.phone}`} className="p-1.5 text-zinc-500 hover:text-green-400"><Phone className="w-3.5 h-3.5" /></a>
        <a href={`sms:${lead.phone}`} className="p-1.5 text-zinc-500 hover:text-cyan-400"><MessageSquare className="w-3.5 h-3.5" /></a>
        <button onClick={onEdit} className="p-1.5 text-zinc-500 hover:text-army-gold"><Edit className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function CommandCenter({ leads, team, isCommander, userRole, onNavigateToFunnel, onEditLead }: CommandCenterProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // ── Time-filtered leads ──
  const filteredLeads = useMemo(() => {
    if (timeRange === 'all') return leads;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return leads.filter(l => new Date(l.timestamp) >= cutoff);
  }, [leads, timeRange]);

  // ── Status counts ──
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    LEAD_STATUSES.forEach(s => counts[s] = 0);
    filteredLeads.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++; });
    return counts;
  }, [filteredLeads]);

  // ── Stale leads (72h+ without activity) ──
  const staleLeads = useMemo(() => {
    return leads.filter(l => {
      if (l.status !== 'New' && l.status !== 'Contacted') return false;
      let lastAction = new Date(l.timestamp).getTime();
      if (l.notes && Array.isArray(l.notes) && l.notes.length > 0) {
        lastAction = Math.max(lastAction, new Date(l.notes[l.notes.length - 1].timestamp).getTime());
      }
      return (Date.now() - lastAction) / (1000 * 60 * 60) > 72;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [leads]);

  // ── Follow-ups due today ──
  const followUpsDue = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return leads.filter(l => {
      if (!(l as any).followUpDate) return false;
      const due = new Date((l as any).followUpDate); due.setHours(0, 0, 0, 0);
      return due.getTime() <= today.getTime();
    });
  }, [leads]);

  // ── Lead velocity (weekly) ──
  const velocityData = useMemo(() => groupByWeek(leads, 8), [leads]);

  // ── Source breakdown ──
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredLeads.forEach(l => { const s = l.source || 'Unknown'; map[s] = (map[s] || 0) + 1; });
    const colors = [COLORS.cyan, COLORS.magenta, COLORS.purple, COLORS.green, COLORS.orange, COLORS.gold, COLORS.blue, COLORS.pink];
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], i) => ({ name, count, color: colors[i % colors.length] }));
  }, [filteredLeads]);

  // ── Recruiter leaderboard ──
  const leaderboard = useMemo(() => {
    if (!team.length) return [];
    const map: Record<string, { name: string; total: number; enlisted: number; new: number }> = {};
    team.forEach(t => { map[t.uid] = { name: t.displayName || 'Unknown', total: 0, enlisted: 0, new: 0 }; });
    filteredLeads.forEach(l => {
      const rid = l.recruiterId;
      if (rid && map[rid]) {
        map[rid].total++;
        if (l.status === 'Enlisted') map[rid].enlisted++;
        if (l.status === 'New') map[rid].new++;
      }
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [filteredLeads, team]);

  // ── Conversion rates ──
  const convNewToContact = getConversionRate(leads, 'New', 'Contacted');
  const convContactToAppt = getConversionRate(leads, 'Contacted', 'Appointment');
  const convApptToEnlist = getConversionRate(leads, 'Appointment', 'Enlisted');
  const convOverall = getConversionRate(leads, 'New', 'Enlisted');

  // ── Funnel chart data ──
  const funnelData = LEAD_STATUSES.map(s => ({
    stage: s, count: statusCounts[s] || 0, color: STATUS_COLORS[s],
  }));

  // ── This week vs last week comparison ──
  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    return leads.filter(l => new Date(l.timestamp) >= weekAgo).length;
  }, [leads]);

  const lastWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
    return leads.filter(l => { const d = new Date(l.timestamp); return d >= twoWeeksAgo && d < weekAgo; }).length;
  }, [leads]);

  const weekDelta = thisWeekCount - lastWeekCount;
  const weekTrend = weekDelta >= 0 ? 'up' : 'down';

  return (
    <div className="space-y-6">
      {/* ── Header + Time Range ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            <span className="text-army-gold glow-text">Command</span>{' '}
            <span className="text-white">Center</span>
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            Real-time recruiting intelligence • {leads.length} total assets
          </p>
        </div>
        <div className="flex gap-1 bg-zinc-900/80 p-1 rounded-sm border border-zinc-800">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm",
                timeRange === range
                  ? "bg-army-gold text-army-black"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800"
              )}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPITile
          label="Total Pipeline"
          value={filteredLeads.length}
          icon={Users}
          color={COLORS.cyan}
          subValue={`${weekTrend === 'up' ? '+' : ''}${weekDelta} this week`}
          onClick={() => onNavigateToFunnel('All')}
        />
        <KPITile
          label="New Intel"
          value={statusCounts['New'] || 0}
          icon={Zap}
          color={COLORS.green}
          subValue="Awaiting contact"
          onClick={() => onNavigateToFunnel('New')}
        />
        <KPITile
          label="Appointments"
          value={statusCounts['Appointment'] || 0}
          icon={Calendar}
          color={COLORS.purple}
          onClick={() => onNavigateToFunnel('Appointment')}
        />
        <KPITile
          label="Enlistments"
          value={statusCounts['Enlisted'] || 0}
          icon={CheckCircle}
          color={COLORS.gold}
          subValue={`${convOverall}% conversion`}
          onClick={() => onNavigateToFunnel('Enlisted')}
        />
        <KPITile
          label="Stale Leads"
          value={staleLeads.length}
          icon={AlertTriangle}
          color={COLORS.magenta}
          subValue="72h+ no contact"
          pulse={staleLeads.length > 0}
        />
        <KPITile
          label="Follow-Ups Due"
          value={followUpsDue.length}
          icon={Clock}
          color={COLORS.orange}
          subValue="Due today"
          pulse={followUpsDue.length > 0}
        />
      </div>

      {/* ── Conversion Rate Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New → Contacted', rate: convNewToContact, color: COLORS.cyan },
          { label: 'Contacted → Appt', rate: convContactToAppt, color: COLORS.purple },
          { label: 'Appt → Enlisted', rate: convApptToEnlist, color: COLORS.gold },
          { label: 'Overall Conversion', rate: convOverall, color: COLORS.green },
        ].map((c, i) => (
          <div key={i} className="bg-zinc-950/80 border border-zinc-800/50 p-3 rounded-sm">
            <p className="text-[8px] font-black text-zinc-500 tracking-widest mb-2">{c.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black" style={{ color: c.color }}>{c.rate}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${c.rate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${c.color}60, ${c.color})` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1: Funnel + Lead Velocity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="hud-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-widest">
              <span className="text-army-gold">Pipeline</span> Funnel
            </h3>
            <Target className="w-4 h-4 text-army-gold/50" />
          </div>
          <div className="space-y-1">
            {funnelData.map(f => (
              <FunnelBar
                key={f.stage}
                stage={f.stage}
                count={f.count}
                total={filteredLeads.length}
                color={f.color}
                onClick={() => onNavigateToFunnel(f.stage)}
              />
            ))}
          </div>
        </div>

        {/* Lead Velocity */}
        <div className="hud-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-widest">
              <span className="text-neon-cyan">Lead</span> Velocity
            </h3>
            <div className="flex items-center gap-1 text-[9px] font-black">
              {weekTrend === 'up' ? (
                <><ArrowUpRight className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">+{weekDelta}</span></>
              ) : (
                <><ArrowDownRight className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">{weekDelta}</span></>
              )}
              <span className="text-zinc-500 ml-1">vs last wk</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="label" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip content={<GamingTooltip />} />
                <Area
                  type="monotone" dataKey="count" name="Leads"
                  stroke={COLORS.cyan} strokeWidth={2}
                  fill="url(#velocityGradient)"
                  dot={{ fill: COLORS.cyan, r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: COLORS.cyan, r: 5, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Source Breakdown + Recruiter Leaderboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Analysis */}
        <div className="hud-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-widest">
              <span className="text-purple-400">Source</span> Intel
            </h3>
            <Activity className="w-4 h-4 text-purple-400/50" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    dataKey="count" paddingAngle={3}
                    stroke="none"
                  >
                    {sourceData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<GamingTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {sourceData.slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-black text-zinc-300 flex-1 truncate">{s.name}</span>
                  <span className="text-[10px] font-black tabular-nums" style={{ color: s.color }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recruiter Leaderboard */}
        {(isCommander || userRole === 'admin') && leaderboard.length > 0 && (
          <div className="hud-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black tracking-widest">
                <span className="text-army-gold">Recruiter</span> Leaderboard
              </h3>
              <Flame className="w-4 h-4 text-army-gold/50" />
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaderboard} layout="vertical" barCategoryGap="20%">
                  <defs>
                    <linearGradient id="leaderGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                  <XAxis type="number" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis
                    type="category" dataKey="name" stroke="#52525b" fontSize={9}
                    width={100} tickLine={false} axisLine={false}
                  />
                  <Tooltip content={<GamingTooltip />} />
                  <Bar dataKey="total" name="Total Leads" fill="url(#leaderGradient)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="enlisted" name="Enlisted" fill={COLORS.green} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* If not admin, show a status breakdown bar chart instead */}
        {userRole === 'recruiter' && (
          <div className="hud-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black tracking-widest">
                <span className="text-army-gold">Status</span> Breakdown
              </h3>
              <Target className="w-4 h-4 text-army-gold/50" />
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="stage" stroke="#52525b" fontSize={8} tickLine={false} angle={-30} textAnchor="end" height={50} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip content={<GamingTooltip />} />
                  <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                    {funnelData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Row: Stale Alerts + Follow-Ups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stale Leads */}
        <div className="hud-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-widest">
              <span className="text-red-400">Stale</span> Alerts
              {staleLeads.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[9px] bg-red-500/20 text-red-400 rounded-sm">{staleLeads.length}</span>
              )}
            </h3>
            <AlertTriangle className="w-4 h-4 text-red-400/50" />
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
            {staleLeads.length > 0 ? (
              staleLeads.slice(0, 10).map((lead, i) => (
                <StaleLeadRow key={lead.id || i} lead={lead} onEdit={() => onEditLead(lead)} />
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-400/30 mx-auto mb-2" />
                <p className="text-[10px] font-black text-zinc-500">All clear — no stale leads</p>
              </div>
            )}
            {staleLeads.length > 10 && (
              <button className="w-full py-2 text-[9px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">
                View All {staleLeads.length} Stale Leads →
              </button>
            )}
          </div>
        </div>

        {/* Follow-Ups Due */}
        <div className="hud-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black tracking-widest">
              <span className="text-orange-400">Follow-Ups</span> Due
              {followUpsDue.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-[9px] bg-orange-500/20 text-orange-400 rounded-sm">{followUpsDue.length}</span>
              )}
            </h3>
            <Clock className="w-4 h-4 text-orange-400/50" />
          </div>
          <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
            {followUpsDue.length > 0 ? (
              followUpsDue.slice(0, 10).map((lead, i) => (
                <div
                  key={lead.id || i}
                  className="flex items-center gap-3 p-3 hover:bg-orange-950/20 rounded transition-all group border-l-2 border-orange-500/50"
                >
                  <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-white truncate">
                      {(lead.lastName || '').toUpperCase()}, {(lead.firstName || '').toUpperCase()}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-mono">
                      {lead.status} • Due: {(lead as any).followUpDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`tel:${lead.phone}`} className="p-1.5 text-zinc-500 hover:text-green-400"><Phone className="w-3.5 h-3.5" /></a>
                    <button onClick={() => onEditLead(lead)} className="p-1.5 text-zinc-500 hover:text-army-gold"><Edit className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-400/30 mx-auto mb-2" />
                <p className="text-[10px] font-black text-zinc-500">No follow-ups due today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly Trend vs Last Week ── */}
      <div className="hud-border p-5">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", weekTrend === 'up' ? "bg-green-500/10" : "bg-red-500/10")}>
            {weekTrend === 'up' ? <TrendingUp className="w-5 h-5 text-green-400" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}
          </div>
          <div>
            <p className="text-xs font-black">
              <span className={weekTrend === 'up' ? 'text-green-400' : 'text-red-400'}>
                {weekTrend === 'up' ? '+' : ''}{weekDelta} leads
              </span>{' '}
              <span className="text-zinc-500">vs last week</span>
            </p>
            <p className="text-[9px] font-mono text-zinc-600">
              This week: {thisWeekCount} • Last week: {lastWeekCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
