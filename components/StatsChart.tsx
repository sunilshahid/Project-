'use client';

import { useStore } from '@/store/useStore';
import { STANDALONE_FALLACIES } from '@/lib/fallacies';
import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export function StatsChart() {
  const { notes } = useStore();

  const data = useMemo(() => {
    // Aggregate counts
    const counts: Record<string, number> = {};
    
    notes.forEach(note => {
      note.selections?.forEach(sel => {
        counts[sel.fallacyId] = (counts[sel.fallacyId] || 0) + 1;
      });
    });

    // Map back to fallacies and format for Recharts
    const chartData = Object.entries(counts)
      .map(([id, count]) => {
        const fallacy = STANDALONE_FALLACIES.find(f => f.id === id);
        return {
          name: fallacy?.name || id,
          count,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort descending

    return chartData;
  }, [notes]);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
        <p>No data to visualize yet.</p>
        <p className="text-sm">Create some logical checks to see stats here.</p>
      </div>
    );
  }

  // Emerald palette for bars
  const colors = [
    '#059669', // Emerald 600
    '#10b981', // Emerald 500
    '#34d399', // Emerald 400
    '#6ee7b7', // Emerald 300
    '#a7f3d0'  // Emerald 200
  ];

  return (
    <div className="flex flex-col h-full bg-black text-white p-6 sm:p-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Analysis Dashboard</h2>
        <p className="text-zinc-400">Most commonly identified fallacies and biases across your notes.</p>
      </div>
      
      <div className="flex-1 min-h-0 bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-xl">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                width={150}
              />
              <RechartsTooltip 
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p>You haven&apos;t tagged any fallacies yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
