'use client';

import { useStore, extractFallaciesFromHtml } from '@/store/useStore';
import { UNIFIED_FALLACIES, getFallacyById, FallacyCategory, CATEGORY_LABELS } from '@/lib/fallacies';
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { ShieldCheck, TrendingUp, AlertTriangle, Brain, Filter, Layers } from 'lucide-react';

export function StatsChart() {
  const { notes } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'categories'>('all');

  // Compute aggregated stats combining both Logical Checks AND inline Note highlights
  const { fallacyStats, categoryStats, totalTagsCount, notesCount, checksCount } = useMemo(() => {
    const counts: Record<string, { count: number; sources: { checks: number; notes: number } }> = {};
    const catCounts: Record<FallacyCategory, number> = {
      relevance: 0,
      presumption: 0,
      induction: 0,
      formal: 0,
      'cognitive-bias': 0,
      'epistemic-tool': 0,
    };

    let totalTags = 0;
    let nNotes = 0;
    let nChecks = 0;

    notes.forEach((note) => {
      if (note.type === 'check') {
        nChecks++;
        note.selections?.forEach((sel) => {
          if (!counts[sel.fallacyId]) {
            counts[sel.fallacyId] = { count: 0, sources: { checks: 0, notes: 0 } };
          }
          counts[sel.fallacyId].count++;
          counts[sel.fallacyId].sources.checks++;
          totalTags++;

          const def = getFallacyById(sel.fallacyId);
          if (def && catCounts[def.category] !== undefined) {
            catCounts[def.category]++;
          }
        });
      } else if (note.type === 'note') {
        nNotes++;
        // Extract inline fallacy marks from note HTML
        const inlineFallacies = extractFallaciesFromHtml(note.content || '');
        inlineFallacies.forEach((id) => {
          if (!counts[id]) {
            counts[id] = { count: 0, sources: { checks: 0, notes: 0 } };
          }
          counts[id].count++;
          counts[id].sources.notes++;
          totalTags++;

          const def = getFallacyById(id);
          if (def && catCounts[def.category] !== undefined) {
            catCounts[def.category]++;
          }
        });
      }
    });

    const formattedFallacies = Object.entries(counts)
      .map(([id, info]) => {
        const fallacy = getFallacyById(id);
        return {
          id,
          name: fallacy?.name || id,
          category: fallacy?.category || 'relevance',
          categoryLabel: fallacy?.categoryLabel || 'Other',
          hexColor: fallacy?.hexColor || '#10b981',
          count: info.count,
          checksCount: info.sources.checks,
          notesCount: info.sources.notes,
        };
      })
      .sort((a, b) => b.count - a.count);

    const formattedCategories = Object.entries(catCounts)
      .filter(([_, count]) => count > 0)
      .map(([catKey, count]) => {
        const cat = catKey as FallacyCategory;
        const colorMap: Record<FallacyCategory, string> = {
          relevance: '#f97316',
          presumption: '#6366f1',
          induction: '#10b981',
          formal: '#06b6d4',
          'cognitive-bias': '#eab308',
          'epistemic-tool': '#34d399',
        };
        return {
          name: CATEGORY_LABELS[cat] || catKey,
          category: cat,
          count,
          color: colorMap[cat] || '#a1a1aa',
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      fallacyStats: formattedFallacies,
      categoryStats: formattedCategories,
      totalTagsCount: totalTags,
      notesCount: nNotes,
      checksCount: nChecks,
    };
  }, [notes]);

  const topIdentified = fallacyStats.length > 0 ? fallacyStats[0] : null;

  return (
    <div className="flex flex-col h-full bg-black text-white p-4 sm:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1">
          <TrendingUp className="w-4 h-4" />
          Rationalist Metrics & Analytics
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Epistemic Analysis</h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Aggregated bias detection and rhetorical pattern distribution across your notes and
          logical checks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Total Patterns Tagged</span>
          <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-2">
            <span>{totalTagsCount}</span>
            <span className="text-[11px] text-zinc-500 font-normal">occurrences</span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Audited Artifacts</span>
          <div className="text-2xl font-bold text-emerald-400 mt-2 flex items-baseline gap-2">
            <span>{notesCount + checksCount}</span>
            <span className="text-[11px] text-zinc-500 font-normal">
              ({checksCount} checks, {notesCount} notes)
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Most Frequent Flaw</span>
          <div className="text-base font-semibold text-amber-400 mt-2 truncate">
            {topIdentified ? topIdentified.name : 'None yet'}
          </div>
          {topIdentified && (
            <span className="text-[11px] text-zinc-500">{topIdentified.count} instances recorded</span>
          )}
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Epistemic Diversity</span>
          <div className="text-2xl font-bold text-purple-400 mt-2 flex items-baseline gap-2">
            <span>{fallacyStats.length}</span>
            <span className="text-[11px] text-zinc-500 font-normal">distinct types</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-[420px] bg-zinc-950 border border-zinc-900 rounded-xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Fallacies & Biases
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'categories'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              By Epistemic Category
            </button>
          </div>
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
            Synchronized from Notes & Checks
          </span>
        </div>

        {totalTagsCount === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 gap-3 py-16">
            <Brain className="w-10 h-10 opacity-30 text-emerald-400" />
            <p className="text-sm">No fallacies or biases identified yet.</p>
            <p className="text-xs text-zinc-600 max-w-sm text-center">
              Tag fallacies inside your rich text notes using the Bubble Menu, or create a new
              Logical Check to populate your reasoning dashboard.
            </p>
          </div>
        ) : activeTab === 'all' ? (
          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={fallacyStats}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#27272a"
                />
                <XAxis type="number" allowDecimals={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#d4d4d8', fontSize: 12 }}
                  width={160}
                />
                <RechartsTooltip
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} total (${item.payload.checksCount} in checks, ${item.payload.notesCount} in notes)`,
                    'Identified',
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {fallacyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hexColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 min-h-[320px] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={4}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-zinc-300 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-zinc-400">{cat.count}</span>
                    <span className="text-zinc-500 font-mono text-[10px]">
                      {Math.round((cat.count / totalTagsCount) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
