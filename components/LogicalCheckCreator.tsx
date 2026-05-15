'use client';

import { useState } from 'react';
import { useStore, FallacySelection } from '@/store/useStore';
import { STANDALONE_FALLACIES } from '@/lib/fallacies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export function LogicalCheckCreator({ onCancel }: { onCancel: () => void }) {
  const { createNote } = useStore();
  const [title, setTitle] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>({});

  const toggleFallacy = (id: string) => {
    setSelections(prev => {
      const next = { ...prev };
      if (id in next) {
        delete next[id];
      } else {
        next[id] = '';
      }
      return next;
    });
  };

  const updateNote = (id: string, note: string) => {
    setSelections(prev => ({
      ...prev,
      [id]: note
    }));
  };

  const handleSave = () => {
    if (!title.trim() && Object.keys(selections).length === 0) return;
    
    const formattedSelections: FallacySelection[] = Object.entries(selections).map(([id, note]) => ({
      fallacyId: id,
      customNote: note
    }));
    
    createNote('check', title, '', formattedSelections);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-6 sm:p-10 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">New Logical Check</h2>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-900" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-md">
            Save
          </Button>
        </div>
      </div>
      
      <div className="space-y-8 flex-1 overflow-y-auto min-h-0 pr-4 pb-12">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Heading / Topic</label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
            placeholder="E.g., Debate on universal healthcare..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-zinc-400">Select Fallacies & Biases</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <TooltipProvider>
              {STANDALONE_FALLACIES.map((fallacy) => {
                const Icon = fallacy.icon;
                const isSelected = fallacy.id in selections;
                
                return (
                  <div
                    key={fallacy.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFallacy(fallacy.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFallacy(fallacy.id); } }}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-black rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger 
                        className="absolute top-2 left-2 text-zinc-500 hover:text-zinc-300 cursor-help p-1" 
                        onClick={(e) => e.stopPropagation()}
                        type="button"
                      >
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700 max-w-xs">
                        <p className="text-sm">{fallacy.description}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Icon className={`w-8 h-8 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span className="text-sm font-medium">{fallacy.name}</span>
                  </div>
                );
              })}
            </TooltipProvider>
          </div>
        </div>

        {Object.keys(selections).length > 0 && (
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <label className="text-sm font-medium text-zinc-400">Why are these used? (Optional notes)</label>
            <div className="space-y-4">
              {Object.keys(selections).map(id => {
                const fallacy = STANDALONE_FALLACIES.find(f => f.id === id);
                if (!fallacy) return null;
                const Icon = fallacy.icon;
                
                return (
                  <div key={id} className="flex flex-col gap-2 p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                      <Icon className="w-4 h-4" />
                      {fallacy.name}
                    </div>
                    <Textarea 
                      value={selections[id]}
                      onChange={(e) => updateNote(id, e.target.value)}
                      placeholder={`How is ${fallacy.name} mapping to the topic?`}
                      className="bg-black border-zinc-800 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700 resize-none min-h-[80px]"
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
