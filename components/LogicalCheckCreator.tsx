'use client';

import { useState } from 'react';
import { useStore, FallacySelection, Note } from '@/store/useStore';
import { UNIFIED_FALLACIES, FallacyCategory, CATEGORY_LABELS } from '@/lib/fallacies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Info, Search, Link as LinkIcon, Tag as TagIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LogicalCheckCreatorProps {
  onCancel: () => void;
  initialCheck?: Note | null;
  defaultFallacyId?: string;
}

export function LogicalCheckCreator({
  onCancel,
  initialCheck,
  defaultFallacyId,
}: LogicalCheckCreatorProps) {
  const { createNote, updateNote, setActiveNoteId } = useStore();
  
  const [title, setTitle] = useState(initialCheck?.title || '');
  const [sourceUrl, setSourceUrl] = useState(initialCheck?.sourceUrl || '');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FallacyCategory | 'all'>('all');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialCheck?.tags || []);

  // Initialize selections map
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initialMap: Record<string, string> = {};
    if (initialCheck?.selections) {
      initialCheck.selections.forEach((s) => {
        initialMap[s.fallacyId] = s.customNote || '';
      });
    }
    if (defaultFallacyId && !initialMap[defaultFallacyId]) {
      initialMap[defaultFallacyId] = '';
    }
    return initialMap;
  });

  const categories: Array<{ id: FallacyCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'relevance', label: 'Relevance' },
    { id: 'presumption', label: 'Presumption' },
    { id: 'induction', label: 'Induction' },
    { id: 'formal', label: 'Formal' },
    { id: 'cognitive-bias', label: 'Biases' },
    { id: 'epistemic-tool', label: 'Tools' },
  ];

  const filteredFallacies = UNIFIED_FALLACIES.filter((f) => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      f.name.toLowerCase().includes(term) ||
      f.shortDescription.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  const toggleFallacy = (id: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (id in next) {
        delete next[id];
      } else {
        next[id] = '';
      }
      return next;
    });
  };

  const updateNoteText = (id: string, note: string) => {
    setSelections((prev) => ({
      ...prev,
      [id]: note,
    }));
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim() && Object.keys(selections).length === 0) return;

    const formattedSelections: FallacySelection[] = Object.entries(selections).map(
      ([id, note]) => ({
        fallacyId: id,
        customNote: note,
      })
    );

    if (initialCheck) {
      updateNote(initialCheck.id, {
        title: title.trim() || 'Untitled Logical Check',
        sourceUrl: sourceUrl.trim(),
        selections: formattedSelections,
        tags,
      });
      setActiveNoteId(initialCheck.id);
    } else {
      const newId = await createNote(
        'check',
        title.trim() || 'Untitled Logical Check',
        '',
        formattedSelections,
        tags,
        sourceUrl.trim()
      );
      if (newId) {
        setActiveNoteId(newId);
      }
    }
    onCancel();
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-4 sm:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-900">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {initialCheck ? 'Edit Logical Check' : 'New Logical Check'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Audit an argument, debate topic, or claim by identifying structural flaws and biases.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm px-5"
          >
            Save Check
          </Button>
        </div>
      </div>

      <div className="space-y-6 flex-1 pb-16">
        {/* Topic Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Heading / Topic
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
            placeholder="E.g., Claim that vaccine causes autism in debate..."
          />
        </div>

        {/* Source URL & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
              Source URL / Article Link
            </label>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="text-xs bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-zinc-500" />
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="text-xs bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
                placeholder="Add tag and press Enter..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                className="bg-zinc-900 border-zinc-800 text-xs"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    onClick={() => handleRemoveTag(t)}
                    className="cursor-pointer px-2 py-0.5 rounded-full text-[11px] bg-zinc-800 text-zinc-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                  >
                    #{t} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fallacy Selection Grid */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Select Identified Fallacies & Biases ({Object.keys(selections).length} active)
            </label>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Filter fallacies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs bg-zinc-900/50 border-zinc-800 text-zinc-200"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-all ${
                  activeCategory === c.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1">
            <TooltipProvider>
              {filteredFallacies.map((fallacy) => {
                const Icon = fallacy.icon;
                const isSelected = fallacy.id in selections;

                return (
                  <div
                    key={fallacy.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFallacy(fallacy.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFallacy(fallacy.id);
                      }
                    }}
                    className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 text-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-black rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger
                        className="absolute top-2 left-2 text-zinc-500 hover:text-zinc-300 cursor-help p-0.5"
                        onClick={(e) => e.stopPropagation()}
                        type="button"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 text-zinc-200 border-zinc-700 max-w-xs p-2.5 text-xs shadow-xl">
                        <p className="font-semibold text-emerald-400 mb-1">{fallacy.name}</p>
                        <p>{fallacy.shortDescription}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Icon
                      className={`w-6 h-6 transition-transform ${
                        isSelected ? 'text-emerald-400 scale-110' : 'text-zinc-500'
                      }`}
                    />
                    <span className="text-xs font-medium leading-tight line-clamp-1">
                      {fallacy.name}
                    </span>
                  </div>
                );
              })}
            </TooltipProvider>
          </div>
        </div>

        {/* Justifications / Detailed Notes */}
        {Object.keys(selections).length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Epistemic Justification (Why does this apply?)
            </label>
            <div className="space-y-3">
              {Object.keys(selections).map((id) => {
                const fallacy = UNIFIED_FALLACIES.find((f) => f.id === id);
                if (!fallacy) return null;
                const Icon = fallacy.icon;

                return (
                  <div
                    key={id}
                    className="flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <Icon className="w-4 h-4" />
                        {fallacy.name}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {fallacy.categoryLabel}
                      </span>
                    </div>
                    <Textarea
                      value={selections[id]}
                      onChange={(e) => updateNoteText(id, e.target.value)}
                      placeholder={`Explain where and how ${fallacy.name} is manifested in the argument...`}
                      className="bg-zinc-900/60 border-zinc-800 text-xs placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500/50 resize-none min-h-[70px]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
