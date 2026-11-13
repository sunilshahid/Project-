'use client';

import { useState, useMemo } from 'react';
import {
  UNIFIED_FALLACIES,
  FallacyDefinition,
  FallacyCategory,
  CATEGORY_LABELS,
} from '@/lib/fallacies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Maximize2,
  RotateCcw,
  Search,
  X,
  Compass,
  Check,
  Copy,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function FallacyGrid({
  onCreateCheckWithFallacy,
}: {
  onCreateCheckWithFallacy?: (fallacyId: string) => void;
}) {
  const [selectedFallacy, setSelectedFallacy] = useState<FallacyDefinition | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FallacyCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: Array<{ id: FallacyCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Items' },
    { id: 'relevance', label: 'Relevance' },
    { id: 'presumption', label: 'Presumption' },
    { id: 'induction', label: 'Induction' },
    { id: 'formal', label: 'Formal' },
    { id: 'cognitive-bias', label: 'Biases' },
    { id: 'epistemic-tool', label: 'Epistemic Tools' },
  ];

  const filtered = useMemo(() => {
    return UNIFIED_FALLACIES.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.shortDescription.toLowerCase().includes(term) ||
        item.sniffTest.toLowerCase().includes(term);
      return matchesCat && matchesSearch;
    });
  }, [search, activeCategory]);

  const copySniffTest = (item: FallacyDefinition) => {
    navigator.clipboard.writeText(`"${item.sniffTest}" — Sniff test for ${item.name}`);
    setCopiedId(item.id);
    toast.success('Sniff test copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4" />
            Field Guide & Knowledge Base
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Skeptic’s Toolkit</h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Interactive heuristics, sniff tests, and counter-strategies for logical fallacies,
            cognitive biases, and rationalist tools.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search sniff tests or fallacies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900/60 border-zinc-800 text-sm focus-visible:ring-emerald-500 text-zinc-200"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 pb-4 border-b border-zinc-900 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeCategory === cat.id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-zinc-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of 3D Cards */}
      <div className="flex-1 overflow-y-auto pr-1 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 text-sm">
            No fallacies or biases match your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <InteractiveCard
                key={item.id}
                item={item}
                onExpand={() => setSelectedFallacy(item)}
                onCopy={() => copySniffTest(item)}
                isCopied={copiedId === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deep Dive Dialog */}
      <Dialog open={!!selectedFallacy} onOpenChange={(open) => !open && setSelectedFallacy(null)}>
        <DialogContent className="sm:max-w-xl bg-zinc-950 border border-zinc-900 text-zinc-200 p-6 shadow-2xl">
          {selectedFallacy && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl border flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${selectedFallacy.hexColor}15`,
                        borderColor: `${selectedFallacy.hexColor}40`,
                        color: selectedFallacy.hexColor,
                      }}
                    >
                      <selectedFallacy.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold tracking-tight text-white">
                        {selectedFallacy.name}
                      </DialogTitle>
                      <span className="text-xs font-mono text-zinc-400">
                        {selectedFallacy.categoryLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-3 max-h-[70vh] overflow-y-auto pr-1">
                {/* Definition */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Definition
                  </h4>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {selectedFallacy.description}
                  </p>
                </div>

                {/* Sniff Test */}
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    The Sniff Test
                  </h4>
                  <p className="text-sm text-zinc-200 font-medium">
                    {selectedFallacy.sniffTest}
                  </p>
                </div>

                {/* Example */}
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Example in the Wild
                  </h4>
                  <p className="italic text-sm text-zinc-300 font-mono">
                    {selectedFallacy.example}
                  </p>
                </div>

                {/* How to counter */}
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    How to Counter
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedFallacy.counter}
                  </p>
                </div>

                {/* Skeptic Tip */}
                <div className="p-3.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    Skeptic’s Epistemic Tip
                  </h4>
                  <p className="text-sm text-zinc-200">
                    {selectedFallacy.tip}
                  </p>
                </div>

                {/* Action button */}
                {onCreateCheckWithFallacy && (
                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        const id = selectedFallacy.id;
                        setSelectedFallacy(null);
                        onCreateCheckWithFallacy(id);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Start Logical Check with this Fallacy
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InteractiveCard({
  item,
  onExpand,
  onCopy,
  isCopied,
}: {
  item: FallacyDefinition;
  onExpand: () => void;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = item.icon;

  return (
    <div className="relative h-64 w-full [perspective:1000px] select-none group">
      <div
        className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front Face */}
        <div
          onClick={() => setIsFlipped(true)}
          className="absolute inset-0 backface-hidden bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/50 transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider"
              style={{
                backgroundColor: `${item.hexColor}15`,
                color: item.hexColor,
                borderColor: `${item.hexColor}30`,
              }}
            >
              {item.category}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(true);
              }}
              title="Flip for Sniff Test"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="my-auto flex flex-col items-center text-center gap-2.5">
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                backgroundColor: `${item.hexColor}15`,
                borderColor: `${item.hexColor}30`,
                color: item.hexColor,
              }}
            >
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight leading-tight">
              {item.name}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {item.shortDescription}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px] text-zinc-500">
            <span>Tap to flip</span>
            <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform">
              Sniff Test →
            </span>
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-zinc-900 border border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              The Sniff Test
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-zinc-200 leading-relaxed font-medium bg-black/40 p-3 rounded-lg border border-zinc-800/80 line-clamp-4">
            {item.sniffTest}
          </p>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-zinc-400 hover:text-white px-2 gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-zinc-800/80 border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-700 gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onExpand();
              }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Deep Dive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
