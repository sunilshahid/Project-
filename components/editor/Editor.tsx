'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { FallacyMark } from './fallacy-extension';
import { UNIFIED_FALLACIES, FallacyDefinition, getFallacyById } from '@/lib/fallacies';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Tag,
  Search,
  Sparkles,
  Download,
  Terminal,
  Minus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  runAiAudit,
  runSteelman,
  runSyllogismDeconstruction,
  AuditResult,
  SteelmanResult,
  SyllogismResult,
} from '@/lib/ai';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  noteTitle?: string;
}

export function Editor({ content, onChange, noteTitle }: EditorProps) {
  const [search, setSearch] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiModalType, setAiModalType] = useState<'audit' | 'steelman' | 'syllogism' | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [steelmanResult, setSteelmanResult] = useState<SteelmanResult | null>(null);
  const [syllogismResult, setSyllogismResult] = useState<SyllogismResult | null>(null);

  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      FallacyMark,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[450px] text-zinc-200 text-sm leading-relaxed',
      },
    },
  });

  // Guard against selection resetting while typing
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const filteredFallacies = UNIFIED_FALLACIES.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.shortDescription.toLowerCase().includes(search.toLowerCase())
  );

  const handleApplyFallacy = (fallacyId: string) => {
    if (savedSelectionRef.current) {
      const { from, to } = savedSelectionRef.current;
      editor.chain().setTextSelection({ from, to }).setFallacy(fallacyId).focus().run();
      savedSelectionRef.current = null;
    } else {
      editor.chain().focus().setFallacy(fallacyId).run();
    }
  };

  const handleClearFallacy = () => {
    if (savedSelectionRef.current) {
      const { from, to } = savedSelectionRef.current;
      editor.chain().setTextSelection({ from, to }).unsetFallacy().focus().run();
      savedSelectionRef.current = null;
    } else {
      editor.chain().focus().unsetFallacy().run();
    }
  };

  const handleExportMarkdown = () => {
    const title = (noteTitle || 'Untitled Note').replace(/[^a-zA-Z0-9_-]/g, '_');
    // Simple HTML to readable text conversion for markdown export
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.getHTML();
    const markdownContent = `# ${noteTitle || 'Untitled Note'}\n\n${tempDiv.innerText}`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Note exported as Markdown.');
  };

  // AI Actions
  const getSelectedOrFullText = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText && selectedText.trim().length > 5) {
      return selectedText;
    }
    return editor.getText();
  };

  const handleRunAudit = async () => {
    const text = getSelectedOrFullText();
    if (!text || text.trim().length < 10) {
      toast.error('Please write or highlight at least a sentence to audit.');
      return;
    }

    setIsAiLoading(true);
    setAiModalType('audit');
    try {
      const result = await runAiAudit(text, noteTitle);
      setAuditResult(result);
    } catch (err: any) {
      toast.error(err.message || 'Logic audit failed.');
      setAiModalType(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRunSteelman = async () => {
    const text = getSelectedOrFullText();
    if (!text || text.trim().length < 10) {
      toast.error('Please write or highlight an argument to steelman.');
      return;
    }

    setIsAiLoading(true);
    setAiModalType('steelman');
    try {
      const result = await runSteelman(text);
      setSteelmanResult(result);
    } catch (err: any) {
      toast.error(err.message || 'Steelmanning failed.');
      setAiModalType(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRunSyllogism = async () => {
    const text = getSelectedOrFullText();
    if (!text || text.trim().length < 10) {
      toast.error('Please write or highlight an argument to deconstruct.');
      return;
    }

    setIsAiLoading(true);
    setAiModalType('syllogism');
    try {
      const result = await runSyllogismDeconstruction(text);
      setSyllogismResult(result);
    } catch (err: any) {
      toast.error(err.message || 'Syllogism deconstruction failed.');
      setAiModalType(null);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Sticky Formatting Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-0.5 border-r border-zinc-800 pr-1.5 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-7 w-7 text-xs ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-7 w-7 text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`h-7 w-7 text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 border-r border-zinc-800 pr-1.5 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('bold') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('italic') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('underline') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Underline"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('strike') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('code') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 border-r border-zinc-800 pr-1.5 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('bulletList') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('orderedList') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('blockquote') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-7 w-7 text-xs ${editor.isActive('codeBlock') ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400 hover:text-white'}`}
            title="Code Block"
          >
            <Terminal className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="h-7 w-7 text-xs text-zinc-400 hover:text-white"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 border-r border-zinc-800 pr-1.5 mr-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7 text-xs text-zinc-400 hover:text-white disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 text-xs text-zinc-400 hover:text-white disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* AI Toolkit Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRunAudit}
            className="h-7 text-xs bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 gap-1.5"
            title="Scan argument for logical fallacies and biases with Gemini AI"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Audit with AI</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRunSteelman}
            className="h-7 text-xs text-emerald-400 hover:bg-emerald-500/10 gap-1"
            title="Steelman this argument charitably"
          >
            <Scale className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Steelman</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleExportMarkdown}
            className="h-7 w-7 text-zinc-400 hover:text-white"
            title="Export note as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Floating Selection Bubble Menu */}
      <BubbleMenu
        editor={editor}
        className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1 gap-1 z-20"
      >
        <Popover
          onOpenChange={(open) => {
            if (open) {
              const { from, to } = editor.state.selection;
              savedSelectionRef.current = { from, to };
            }
          }}
        >
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-zinc-200 hover:text-white hover:bg-zinc-800 gap-1.5"
              />
            }
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            Tag Fallacy
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-zinc-950 border-zinc-800 shadow-2xl" align="start">
            <div className="p-2 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                <Input
                  placeholder="Search fallacies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 pl-8 bg-zinc-900 border-none text-xs text-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-700"
                />
              </div>
            </div>
            <ScrollArea className="h-64">
              <div className="p-1 flex flex-col gap-0.5">
                {filteredFallacies.map((fallacy) => (
                  <button
                    key={fallacy.id}
                    onClick={() => handleApplyFallacy(fallacy.id)}
                    className="text-left px-2.5 py-1.5 text-xs rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium text-zinc-200 truncate">{fallacy.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {fallacy.categoryLabel}
                      </span>
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: fallacy.hexColor }}
                    />
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-1.5 border-t border-zinc-800 flex justify-between gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={handleClearFallacy}
              >
                Clear Fallacy Tag
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-[1px] h-4 bg-zinc-800 mx-0.5" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-7 w-7 p-0 ${editor.isActive('bold') ? 'text-emerald-400' : 'text-zinc-400'}`}
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-7 w-7 p-0 ${editor.isActive('italic') ? 'text-emerald-400' : 'text-zinc-400'}`}
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
      </BubbleMenu>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 cursor-text" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      {/* AI Analysis Dialog */}
      <Dialog open={!!aiModalType} onOpenChange={(open) => !open && setAiModalType(null)}>
        <DialogContent className="sm:max-w-xl bg-zinc-950 border border-zinc-900 text-zinc-200 p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Skeptic AI Intelligence
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white mt-1">
              {aiModalType === 'audit' && 'Argument Audit & Bias Scan'}
              {aiModalType === 'steelman' && 'Charitable Argument Steelmanning'}
              {aiModalType === 'syllogism' && 'Syllogistic Formal Deconstruction'}
            </DialogTitle>
          </DialogHeader>

          {isAiLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-sm text-zinc-400">Consulting Gemini reasoning model...</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {aiModalType === 'audit' && auditResult && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                    <span className="text-xs text-zinc-400 font-semibold uppercase">
                      Logical Soundness Score
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {auditResult.soundnessScore}/100
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Identified Fallacies ({auditResult.fallacies?.length || 0})
                    </h4>
                    {auditResult.fallacies?.length === 0 ? (
                      <p className="text-xs text-emerald-400">No major logical fallacies detected!</p>
                    ) : (
                      <div className="space-y-2">
                        {auditResult.fallacies.map((f, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-amber-400">{f.fallacyName}</span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {f.confidence}% confidence
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 italic font-mono bg-black/40 p-1.5 rounded">
                              &ldquo;{f.quote}&rdquo;
                            </p>
                            <p className="text-xs text-zinc-400">{f.explanation}</p>
                            <div className="pt-1 text-[11px] text-emerald-400">
                              <span className="font-semibold">Counter: </span>
                              {f.counterStrategy}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {auditResult.unstatedAssumptions?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Hidden Unstated Assumptions
                      </h4>
                      <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                        {auditResult.unstatedAssumptions.map((u, i) => (
                          <li key={i}>{u}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                      Auditor Assessment
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {auditResult.overallAssessment}
                    </p>
                  </div>
                </>
              )}

              {aiModalType === 'steelman' && steelmanResult && (
                <>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Steelmanned Formulation
                    </h4>
                    <p className="text-sm text-zinc-100 leading-relaxed font-medium">
                      {steelmanResult.steelmannedArgument}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Key Valid Premises to Acknowledge
                    </h4>
                    <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                      {steelmanResult.strongestPremises?.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs">
                    <span className="font-semibold text-amber-400 block mb-1">
                      Crux of Genuine Disagreement:
                    </span>
                    <p className="text-zinc-300">{steelmanResult.cruxOfDisagreement}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
                    <span className="font-semibold text-purple-400 block mb-1">
                      Socratic Falsification Test:
                    </span>
                    <p className="text-zinc-200">{steelmanResult.bestSocraticCounter}</p>
                  </div>
                </>
              )}

              {aiModalType === 'syllogism' && syllogismResult && (
                <>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                      <span className="text-zinc-500 uppercase font-mono block text-[10px]">
                        Major Premise
                      </span>
                      <p className="text-zinc-200 font-medium">{syllogismResult.majorPremise}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                      <span className="text-zinc-500 uppercase font-mono block text-[10px]">
                        Minor Premise
                      </span>
                      <p className="text-zinc-200 font-medium">{syllogismResult.minorPremise}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <span className="text-emerald-400 uppercase font-mono block text-[10px]">
                        Deductive Conclusion
                      </span>
                      <p className="text-white font-semibold">{syllogismResult.conclusion}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs">
                    <div className="flex-1 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Deductively Valid</span>
                      <span
                        className={`font-semibold ${syllogismResult.isValidDeductively ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {syllogismResult.isValidDeductively ? 'Yes (Valid)' : 'No (Invalid)'}
                      </span>
                    </div>

                    <div className="flex-1 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-500 block text-[10px]">Soundness</span>
                      <span
                        className={`font-semibold ${syllogismResult.isSound ? 'text-emerald-400' : 'text-amber-400'}`}
                      >
                        {syllogismResult.isSound ? 'Sound' : 'Unsound / Unverified'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
                    {syllogismResult.analysis}
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
