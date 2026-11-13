'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore, Note } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogicalCheckCreator } from './LogicalCheckCreator';
import { LogicalCheckView } from './LogicalCheckView';
import { StatsChart } from './StatsChart';
import { FallacyGrid } from './fallacy/FallacyGrid';
import { SettingsView } from './SettingsView';
import { Editor } from '@/components/editor/Editor';
import {
  Plus,
  Search,
  FileText,
  Compass,
  Shield,
  Lock,
  Settings,
  Menu,
  BarChart2,
  CheckSquare,
  Trash2,
  Pin,
  Tag as TagIcon,
  X,
  BookOpen,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

function NoteList({
  notes,
  activeNoteId,
  type,
  onCreateNote,
  onCreateCheck,
  setActiveNoteId,
  onNoteSelected,
}: {
  notes: Note[];
  activeNoteId: string | null;
  type: 'note' | 'check';
  onCreateNote: () => void;
  onCreateCheck: () => void;
  setActiveNoteId: (id: string | null) => void;
  onNoteSelected?: () => void;
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Collect all unique tags for this note type
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    notes
      .filter((n) => n.type === type)
      .forEach((n) => {
        n.tags?.forEach((t) => set.add(t));
      });
    return Array.from(set);
  }, [notes, type]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => n.type === type)
      .filter((n) => {
        const matchesTag = !selectedTagFilter || (n.tags && n.tags.includes(selectedTagFilter));
        const term = localSearch.toLowerCase();
        const matchesSearch =
          !term ||
          (n.title && n.title.toLowerCase().includes(term)) ||
          (n.content && n.content.toLowerCase().includes(term)) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(term)));
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        // Pinned notes always on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }, [notes, type, localSearch, selectedTagFilter]);

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border-r border-zinc-900">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-900">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          {type === 'note' ? 'Your Notes' : 'Logical Checks'} ({filteredNotes.length})
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full transition-all"
              />
            }
          >
            <Plus className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-300">
            <DropdownMenuItem onClick={onCreateNote} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
              <FileText className="w-4 h-4 mr-2 text-emerald-400" />
              New Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateCheck} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
              <CheckSquare className="w-4 h-4 mr-2 text-emerald-400" />
              New Logical Check
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-zinc-900/80">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder={`Search ${type === 'note' ? 'notes' : 'checks'}...`}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-zinc-900/60 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40"
          />
        </div>

        {/* Tag Filters */}
        {availableTags.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pt-2 pb-1 no-scrollbar">
            {selectedTagFilter && (
              <button
                onClick={() => setSelectedTagFilter(null)}
                className="px-2 py-0.5 rounded text-[10px] bg-red-950/60 text-red-300 border border-red-900/80 flex items-center gap-1 shrink-0"
              >
                Clear #{selectedTagFilter} ×
              </button>
            )}
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                className={`px-2 py-0.5 rounded text-[10px] shrink-0 transition-colors ${
                  selectedTagFilter === tag
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note List Scroll Area */}
      <ScrollArea className="flex-1 px-2 pt-2">
        <div className="space-y-1 pb-4">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
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
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="font-medium truncate text-xs leading-none text-zinc-200">
                  {note.title || (type === 'note' ? 'Untitled Note' : 'Untitled Check')}
                </span>
                {note.isPinned && (
                  <Pin className="w-3 h-3 text-emerald-400 shrink-0 fill-emerald-400/20" />
                )}
              </div>

              <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between gap-2">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                {type === 'check' && (
                  <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-[9px] border border-zinc-800 text-emerald-400 font-mono">
                    {note.selections?.length || 0} flaws
                  </span>
                )}
              </div>

              {/* Tag Pills */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] text-zinc-400 bg-zinc-900/80 px-1.5 py-0.2 rounded border border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-[9px] text-zinc-500">+{note.tags.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-xs text-zinc-600">
              No {type === 'note' ? 'notes' : 'logical checks'} found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function Workspace() {
  const [view, setView] = useState<'checks' | 'notes' | 'toolkit' | 'stats' | 'settings'>('checks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreatingCheck, setIsCreatingCheck] = useState(false);
  const [editingCheck, setEditingCheck] = useState<Note | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [defaultCheckFallacyId, setDefaultCheckFallacyId] = useState<string | undefined>(undefined);

  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    updateActiveNote,
    deleteNote,
    togglePinNote,
    addTagToNote,
    removeTagFromNote,
    autoLockMinutes,
    lastActivity,
    updateActivity,
    lock,
  } = useStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Inactivity auto-lock listener
  useEffect(() => {
    if (autoLockMinutes <= 0) return;

    const interval = setInterval(() => {
      const idleTimeMs = Date.now() - lastActivity;
      if (idleTimeMs > autoLockMinutes * 60 * 1000) {
        lock();
      }
    }, 15000);

    const handleUserActivity = () => updateActivity();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [autoLockMinutes, lastActivity, updateActivity, lock]);

  const handleDeleteNote = () => {
    if (activeNote) {
      deleteNote(activeNote.id);
    }
  };

  const handleCreateNote = () => {
    setIsCreatingCheck(false);
    setEditingCheck(null);
    createNote('note', 'Untitled Note', '', [], []);
    setView('notes');
  };

  const handleCreateCheck = (defaultFallacy?: string) => {
    setEditingCheck(null);
    setDefaultCheckFallacyId(defaultFallacy);
    setActiveNoteId(null);
    setIsCreatingCheck(true);
    setView('checks');
  };

  const handleCancelCreate = () => {
    setIsCreatingCheck(false);
    setEditingCheck(null);
    setDefaultCheckFallacyId(undefined);
    // Fixed bug: checks type was 'checks', now properly 'check'
    const checkNotes = notes.filter((n) => n.type === 'check');
    if (checkNotes.length > 0) {
      setActiveNoteId(checkNotes[0].id);
    }
  };

  const handleEditCheck = () => {
    if (activeNote && activeNote.type === 'check') {
      setEditingCheck(activeNote);
      setIsCreatingCheck(true);
    }
  };

  const handleAddTag = () => {
    if (activeNote && tagInput.trim()) {
      addTagToNote(activeNote.id, tagInput.trim());
      setTagInput('');
    }
  };

  const renderContent = () => {
    if (view === 'toolkit') {
      return (
        <div key="toolkit" className="h-full">
          <FallacyGrid
            onCreateCheckWithFallacy={(fallacyId) => {
              handleCreateCheck(fallacyId);
            }}
          />
        </div>
      );
    }

    if (view === 'stats') {
      return (
        <div key="stats" className="h-full">
          <StatsChart />
        </div>
      );
    }

    if (view === 'settings') {
      return (
        <div key="settings" className="h-full">
          <SettingsView />
        </div>
      );
    }

    if (view === 'checks' && isCreatingCheck) {
      return (
        <div key="create-check" className="h-full">
          <LogicalCheckCreator
            onCancel={handleCancelCreate}
            initialCheck={editingCheck}
            defaultFallacyId={defaultCheckFallacyId}
          />
        </div>
      );
    }

    if (view === 'checks' && activeNote?.type === 'check') {
      return (
        <div key="view-check" className="h-full">
          <LogicalCheckView onEdit={handleEditCheck} />
        </div>
      );
    }

    if (view === 'notes' && activeNote?.type === 'note') {
      return (
        <div key="editor" className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Note Title & Header Metadata */}
          <div className="px-4 sm:px-8 pt-4 pb-2 border-b border-zinc-900 bg-zinc-950/40 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <Input
                value={activeNote.title}
                onChange={(e) => updateActiveNote({ title: e.target.value })}
                className="text-2xl sm:text-3xl font-bold bg-transparent border-none placeholder:text-zinc-700 px-0 h-auto focus-visible:ring-0 text-white tracking-tight flex-1"
                placeholder="Note Title..."
              />

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePinNote(activeNote.id)}
                  className={`h-8 w-8 ${activeNote.isPinned ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                  title={activeNote.isPinned ? 'Unpin Note' : 'Pin Note to Top'}
                >
                  <Pin className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete Note"
                      />
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-950 border border-zinc-900 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Permanently delete this note?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400 text-sm">
                        This note will be erased from your encrypted vault and cannot be recovered.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteNote} className="bg-red-600 hover:bg-red-700 text-white">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Note Tags & Timestamps */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-zinc-500">
              <span className="font-mono text-[11px]">
                Updated {new Date(activeNote.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {activeNote.tags?.map((t) => (
                  <span
                    key={t}
                    onClick={() => removeTagFromNote(activeNote.id, t)}
                    className="cursor-pointer px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                    title="Click to remove tag"
                  >
                    #{t} ×
                  </span>
                ))}

                <div className="flex items-center gap-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="+ Add tag..."
                    className="h-6 w-24 text-[10px] bg-zinc-900 border-zinc-800 px-2 py-0 text-zinc-300 focus-visible:ring-emerald-500/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full TipTap Rich Markdown Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              content={activeNote.content || ''}
              onChange={(content) => updateActiveNote({ content })}
              noteTitle={activeNote.title}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600 flex-col gap-4 h-full p-6 text-center">
        {view === 'notes' ? (
          <FileText className="w-12 h-12 opacity-20 text-emerald-400" />
        ) : (
          <CheckSquare className="w-12 h-12 opacity-20 text-emerald-400" />
        )}
        <p className="text-sm">No {view === 'notes' ? 'note' : 'check'} selected.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={view === 'notes' ? handleCreateNote : () => handleCreateCheck()}
          className="text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
        >
          Create {view === 'notes' ? 'a Note' : 'a Logical Check'}
        </Button>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-full bg-black text-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-900 bg-zinc-950 flex flex-col hidden md:flex">
        {/* Brand & Lock */}
        <div className="h-14 flex items-center px-4 border-b border-zinc-900 justify-between">
          <div className="flex items-center gap-2 font-medium text-sm text-zinc-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="tracking-tight font-semibold">SkepticVault</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={lock}
            className="w-8 h-8 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg"
            title="Lock Vault"
          >
            <Lock className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 space-y-1 border-b border-zinc-900">
          <Button
            variant="ghost"
            className={`w-full justify-start h-9 text-xs transition-all ${
              view === 'checks'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            onClick={() => setView('checks')}
          >
            <CheckSquare className={`w-4 h-4 mr-2.5 ${view === 'checks' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Logical Checks
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start h-9 text-xs transition-all ${
              view === 'notes'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            onClick={() => setView('notes')}
          >
            <FileText className={`w-4 h-4 mr-2.5 ${view === 'notes' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Rich Notes
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start h-9 text-xs transition-all ${
              view === 'toolkit'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            onClick={() => setView('toolkit')}
          >
            <Compass className={`w-4 h-4 mr-2.5 ${view === 'toolkit' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Skeptic Toolkit
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start h-9 text-xs transition-all ${
              view === 'stats'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            onClick={() => setView('stats')}
          >
            <BarChart2 className={`w-4 h-4 mr-2.5 ${view === 'stats' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Analysis Dashboard
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start h-9 text-xs transition-all ${
              view === 'settings'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            onClick={() => setView('settings')}
          >
            <Settings className={`w-4 h-4 mr-2.5 ${view === 'settings' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Vault Settings
          </Button>
        </div>

        {/* Note List in Sidebar */}
        {(view === 'notes' || view === 'checks') && (
          <div className="flex-1 min-h-0">
            <NoteList
              type={view === 'notes' ? 'note' : 'check'}
              notes={notes}
              activeNoteId={activeNoteId}
              onCreateNote={handleCreateNote}
              onCreateCheck={() => handleCreateCheck()}
              setActiveNoteId={(id) => {
                setIsCreatingCheck(false);
                setEditingCheck(null);
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
            <span className="font-semibold">SkepticVault</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={lock}
              className="h-8 w-8 text-zinc-500 hover:text-white"
              title="Lock Vault"
            >
              <Lock className="w-4 h-4" />
            </Button>

            {(view === 'notes' || view === 'checks') && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-white"
                    />
                  }
                >
                  <Menu className="h-5 w-5" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 bg-zinc-950 border-r-zinc-900 text-white">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        SkepticVault
                      </div>
                    </div>
                    <div className="flex-1 min-h-0">
                      <NoteList
                        type={view === 'notes' ? 'note' : 'check'}
                        notes={notes}
                        activeNoteId={activeNoteId}
                        onCreateNote={() => {
                          handleCreateNote();
                          setIsMobileMenuOpen(false);
                        }}
                        onCreateCheck={() => {
                          handleCreateCheck();
                          setIsMobileMenuOpen(false);
                        }}
                        setActiveNoteId={(id) => {
                          setIsCreatingCheck(false);
                          setEditingCheck(null);
                          setActiveNoteId(id);
                          setIsMobileMenuOpen(false);
                        }}
                        onNoteSelected={() => setIsMobileMenuOpen(false)}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden h-[60px] border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md flex items-center justify-around px-1 shrink-0 pb-safe">
        <Button
          variant="ghost"
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-0.5 transition-all ${
            view === 'checks' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setView('checks')}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="text-[9px] font-medium">Checks</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-0.5 transition-all ${
            view === 'notes' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setView('notes')}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[9px] font-medium">Notes</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-0.5 transition-all ${
            view === 'toolkit' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setView('toolkit')}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px] font-medium">Toolkit</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-0.5 transition-all ${
            view === 'stats' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setView('stats')}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-[9px] font-medium">Stats</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-col h-12 w-full gap-1 rounded-xl mx-0.5 transition-all ${
            view === 'settings' ? 'text-emerald-400 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setView('settings')}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] font-medium">Settings</span>
        </Button>
      </div>
    </div>
  );
}
