'use client';

import { useState } from 'react';
import { useStore, Note } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogicalCheckCreator } from './LogicalCheckCreator';
import { LogicalCheckView } from './LogicalCheckView';
import { StatsChart } from './StatsChart';
import { Editor } from '@/components/editor/Editor';
import { Plus, Search, FileText, Compass, Shield, Lock, Settings, Menu, BarChart2, CheckSquare, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';

function NoteList({ 
  notes, 
  activeNoteId, 
  type,
  onCreateNote,
  onCreateCheck,
  setActiveNoteId, 
  onNoteSelected 
}: { 
  notes: Note[], 
  activeNoteId: string | null, 
  type: 'note' | 'check',
  onCreateNote: () => void,
  onCreateCheck: () => void,
  setActiveNoteId: (id: string | null) => void,
  onNoteSelected?: () => void
}) {
  const filteredNotes = notes.filter(n => n.type === type);

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      <div className="p-4 flex items-center justify-between border-b border-zinc-900 md:p-3 md:border-none">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">
          {type === 'note' ? 'Your Notes' : 'Logical Checks'}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full transition-all">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300">
            <DropdownMenuItem onClick={onCreateNote} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              New Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateCheck} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
              <CheckSquare className="w-4 h-4 mr-2" />
              New Logical Check
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => {
                  setActiveNoteId(note.id);
                  onNoteSelected?.();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex flex-col gap-1.5 ${
                  activeNoteId === note.id 
                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="font-medium truncate text-sm leading-none">{note.title || (type === 'note' ? 'Untitled Note' : 'Untitled Check')}</span>
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  {type === 'check' && (
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded-md text-[9px] border border-zinc-700">
                      {note.selections?.length || 0} items
                    </span>
                  )}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-xs text-zinc-600">
              No {type === 'note' ? 'notes' : 'checks'} yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function Workspace() {
  const [view, setView] = useState<'notes' | 'checks' | 'stats' | 'settings'>('checks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatingCheck, setIsCreatingCheck] = useState(false);
  
  const { notes, activeNoteId, setActiveNoteId, createNote, updateActiveNote, deleteNote, lock } = useStore();

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleDeleteNote = () => {
    if (activeNote) {
      deleteNote(activeNote.id);
    }
  };

  const handleCreateNote = () => {
    setIsCreatingCheck(false);
    createNote('note', 'Untitled Note', '', []);
    setView('notes');
  };

  const handleCreateCheck = () => {
    setActiveNoteId(null);
    setIsCreatingCheck(true);
    setView('checks');
  };

  const handleCancelCreate = () => {
    setIsCreatingCheck(false);
    const checkNotes = notes.filter(n => n.type === 'checks');
    if (checkNotes.length > 0) {
      setActiveNoteId(checkNotes[0].id);
    }
  };

  const renderContent = () => {
    if (view === 'stats') {
      return (
        <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
          <StatsChart />
        </motion.div>
      );
    }
    
    if (view === 'settings') {
      return (
        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
          <Settings className="w-12 h-12 opacity-20" />
          <p>Settings coming soon</p>
        </motion.div>
      );
    }

    if (view === 'checks' && isCreatingCheck) {
      return (
        <motion.div key="create-check" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
          <LogicalCheckCreator onCancel={handleCancelCreate} />
        </motion.div>
      );
    }

    if (view === 'checks' && activeNote?.type === 'check') {
      return (
        <motion.div key="view-check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
          <LogicalCheckView />
        </motion.div>
      );
    }

    if (view === 'notes' && activeNote?.type === 'note') {
      return (
        <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full">
          <div className="h-16 flex items-center px-4 sm:px-8 shrink-0 border-b md:border-none border-zinc-900 mt-4 gap-4">
            <Input 
              value={activeNote.title}
              onChange={(e) => updateActiveNote({ title: e.target.value })}
              className="text-3xl font-bold bg-transparent border-none placeholder:text-zinc-700 px-0 h-auto focus-visible:ring-0 text-white tracking-tight flex-1"
              placeholder="Note Title..."
            />
            
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
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    This action cannot be undone. This will permanently delete your note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800 hover:text-white">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700 text-white">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <Editor 
              content={activeNote.content || ''} 
              onChange={(content) => updateActiveNote({ content })}
            />
          </div>
        </motion.div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 flex-col gap-4 h-full">
        {view === 'notes' ? <FileText className="w-12 h-12 opacity-20" /> : <CheckSquare className="w-12 h-12 opacity-20" />}
        <p>No {view.slice(0, -1)} selected</p>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col hidden md:flex">
        <div className="h-14 flex items-center px-4 border-b border-zinc-900 justify-between">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-300">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="tracking-tight">SkepticVault</span>
          </div>
          <Button variant="ghost" size="icon" onClick={lock} className="w-8 h-8 text-zinc-500 hover:text-white" title="Lock App">
            <Lock className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-3 space-y-1.5 border-b border-zinc-900">
          <Button 
            variant="ghost" 
            className={`w-full justify-start h-9 text-sm transition-all ${view === 'checks' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            onClick={() => setView('checks')}
          >
            <CheckSquare className={`w-4 h-4 mr-3 ${view === 'checks' ? 'text-emerald-500' : ''}`} />
            Checks
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start h-9 text-sm transition-all ${view === 'notes' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            onClick={() => setView('notes')}
          >
            <FileText className={`w-4 h-4 mr-3 ${view === 'notes' ? 'text-emerald-500' : ''}`} />
            Notes
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start h-9 text-sm transition-all ${view === 'stats' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            onClick={() => setView('stats')}
          >
            <BarChart2 className={`w-4 h-4 mr-3 ${view === 'stats' ? 'text-emerald-500' : ''}`} />
            Analysis
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start h-9 text-sm transition-all ${view === 'settings' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
            onClick={() => setView('settings')}
          >
            <Settings className={`w-4 h-4 mr-3 ${view === 'settings' ? 'text-emerald-500' : ''}`} />
            Settings
          </Button>
        </div>

        {(view === 'notes' || view === 'checks') && (
          <div className="flex-1 min-h-0 bg-zinc-950/50">
            <NoteList 
              type={view === 'notes' ? 'note' : 'check'}
              notes={notes} 
              activeNoteId={activeNoteId} 
              onCreateNote={handleCreateNote} 
              onCreateCheck={handleCreateCheck}
              setActiveNoteId={(id) => {
                setIsCreatingCheck(false);
                setActiveNoteId(id);
              }} 
            />
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative">
        {/* Mobile Header */}
        <div className="h-14 md:hidden flex items-center px-4 border-b border-zinc-900 justify-between bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-300">
            <Shield className="w-4 h-4 text-emerald-500" />
            SkepticVault
          </div>
          {(view === 'notes' || view === 'checks') && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 bg-zinc-950 border-r-zinc-900 text-white">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="h-full flex flex-col px-1">
                  <div className="p-4 py-6">
                    <h2 className="text-lg font-semibold px-2 mb-4">SkepticVault</h2>
                    <div className="space-y-1">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { setView('checks'); setIsMobileMenuOpen(false); }}>
                        <CheckSquare className="w-4 h-4 mr-2" /> Checks
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => { setView('notes'); setIsMobileMenuOpen(false); }}>
                        <FileText className="w-4 h-4 mr-2" /> Notes
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 pb-4">
                    <NoteList 
                      type={view === 'notes' ? 'note' : 'check'}
                      notes={notes} 
                      activeNoteId={activeNoteId} 
                      onCreateNote={() => { handleCreateNote(); setIsMobileMenuOpen(false); }} 
                      onCreateCheck={() => { handleCreateCheck(); setIsMobileMenuOpen(false); }}
                      setActiveNoteId={(id) => {
                        setIsCreatingCheck(false);
                        setActiveNoteId(id);
                        setIsMobileMenuOpen(false);
                      }} 
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden h-[60px] border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md flex items-center justify-around px-1 shrink-0 pb-safe">
        <Button 
          variant="ghost" 
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-1 transition-all ${view === 'checks' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setView('checks')}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Checks</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-1 transition-all ${view === 'notes' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setView('notes')}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium">Notes</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-1 transition-all ${view === 'stats' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setView('stats')}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Analysis</span>
        </Button>
        <Button 
          variant="ghost" 
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-1 transition-all ${view === 'settings' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          onClick={() => setView('settings')}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </Button>
      </div>
    </div>
  );
}
