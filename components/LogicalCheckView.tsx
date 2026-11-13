'use client';

import { useStore } from '@/store/useStore';
import { UNIFIED_FALLACIES } from '@/lib/fallacies';
import { Button } from '@/components/ui/button';
import { Trash2, Info, Edit3, ExternalLink, Tag as TagIcon, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function LogicalCheckView({ onEdit }: { onEdit?: () => void }) {
  const { notes, activeNoteId, deleteNote } = useStore();
  const note = notes.find((n) => n.id === activeNoteId);

  if (!note) return null;

  const handleDelete = () => {
    deleteNote(note.id);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-4 sm:p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-900 gap-4 mb-6">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              Logical Check
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">
            {note.title || 'Untitled Check'}
          </h1>

          {/* Source Link */}
          {note.sourceUrl && (
            <a
              href={note.sourceUrl.startsWith('http') ? note.sourceUrl : `https://${note.sourceUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline pt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="truncate max-w-md">{note.sourceUrl}</span>
            </a>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Check
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete Logical Check"
                />
              }
            >
              <Trash2 className="w-4 h-4" />
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-950 border border-zinc-900 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this logical check?</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400 text-sm">
                  This check and all recorded fallacy justifications will be permanently removed from your encrypted vault.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pb-16">
        {!note.selections || note.selections.length === 0 ? (
          <div className="text-zinc-500 py-16 text-center text-sm border border-dashed border-zinc-800 rounded-xl">
            No fallacies or biases were recorded for this check.
            {onEdit && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="text-xs border-zinc-800"
                >
                  Add Fallacies Now
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Identified Flaws ({note.selections.length})
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TooltipProvider>
                {note.selections.map((sel) => {
                  const fallacy = UNIFIED_FALLACIES.find((f) => f.id === sel.fallacyId);
                  if (!fallacy) return null;
                  const Icon = fallacy.icon;

                  return (
                    <div
                      key={sel.fallacyId}
                      className="flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-md"
                    >
                      <div className="flex items-center gap-3 p-3.5 bg-zinc-900/60 border-b border-zinc-800/80">
                        <div
                          className="p-2 rounded-lg border flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${fallacy.hexColor}15`,
                            borderColor: `${fallacy.hexColor}30`,
                            color: fallacy.hexColor,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-zinc-100 truncate">
                            {fallacy.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {fallacy.categoryLabel}
                          </span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-help shrink-0 p-1"
                          >
                            <Info className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 text-zinc-200 border-zinc-700 max-w-xs p-3 text-xs shadow-xl">
                            <p className="font-semibold text-emerald-400 mb-1">{fallacy.name}</p>
                            <p className="leading-relaxed">{fallacy.description}</p>
                            <div className="mt-2 pt-2 border-t border-zinc-800 text-zinc-400">
                              <span className="text-emerald-400 font-semibold">Sniff test: </span>
                              {fallacy.sniffTest}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Custom User Justification */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                            Your Epistemic Note:
                          </span>
                          {sel.customNote ? (
                            <p className="text-zinc-300 leading-relaxed italic bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-900">
                              &ldquo;{sel.customNote}&rdquo;
                            </p>
                          ) : (
                            <span className="text-zinc-600 italic">No notes provided.</span>
                          )}
                        </div>

                        {/* Sniff Test Hint */}
                        <div className="pt-2 border-t border-zinc-900 text-[11px] text-zinc-500">
                          <span className="text-emerald-500 font-medium">Quick Counter: </span>
                          {fallacy.counter}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
