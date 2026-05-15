'use client';

import { useStore } from '@/store/useStore';
import { STANDALONE_FALLACIES } from '@/lib/fallacies';
import { Button } from '@/components/ui/button';
import { Trash2, Info } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
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
} from "@/components/ui/alert-dialog";

export function LogicalCheckView() {
  const { notes, activeNoteId, deleteNote } = useStore();
  const note = notes.find(n => n.id === activeNoteId);

  if (!note) return null;

  const handleDelete = () => {
    deleteNote(note.id);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white p-6 sm:p-10 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900 line-clamp-2 gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-white">{note.title || 'Untitled Check'}</h2>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
              title="Delete Note"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-950 border border-zinc-900 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This action cannot be undone. This will permanently delete your logical check.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 hover:text-white">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Check
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-4 pb-12">
        {(!note.selections || note.selections.length === 0) ? (
          <div className="text-zinc-500 py-12 text-center text-sm border border-dashed border-zinc-800 rounded-xl">
            No fallacies or biases were selected for this topic.
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Identified Patterns</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <TooltipProvider>
                {note.selections.map((sel) => {
                  const fallacy = STANDALONE_FALLACIES.find(f => f.id === sel.fallacyId);
                  if (!fallacy) return null;
                  const Icon = fallacy.icon;
                  
                  return (
                    <div key={sel.fallacyId} className="flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 p-4 bg-zinc-900/60 border-b border-zinc-800/80">
                        <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                          <Icon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 font-semibold text-zinc-200">
                          {fallacy.name}
                        </div>
                        <Tooltip>
                          <TooltipTrigger className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-help shrink-0 p-1">
                            <Info className="w-4 h-4" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700 max-w-xs p-3 shadow-xl">
                            <p className="text-sm leading-relaxed">{fallacy.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div className="p-4 text-sm leading-relaxed text-zinc-400 italic">
                        {sel.customNote ? (
                          `"${sel.customNote}"`
                        ) : (
                          <span className="text-zinc-600">No notes provided for this selection.</span>
                        )}
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
