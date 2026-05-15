'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { FallacyMark, fallacies } from './fallacy-extension';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const [search, setSearch] = useState('');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      FallacyMark,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content, { emitUpdate: false });
      editor.commands.setTextSelection({ from, to });
    }
  }, [content, editor]);

  if (!editor) return null;

  const filteredFallacies = fallacies.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <BubbleMenu editor={editor} className="flex bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden p-1 gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Tag className="w-3 h-3 mr-2" />
              Tag Fallacy
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 bg-zinc-950 border-zinc-800" align="start">
            <div className="p-2 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search fallacies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 bg-zinc-900 border-none text-xs focus-visible:ring-1 focus-visible:ring-zinc-700"
                />
              </div>
            </div>
            <ScrollArea className="h-64">
              <div className="p-1 flex flex-col gap-1">
                {filteredFallacies.map((fallacy) => (
                  <button
                    key={fallacy.id}
                    onClick={() => {
                      editor.chain().focus().setFallacy(fallacy.id).run();
                    }}
                    className={`text-left px-2 py-1.5 text-xs rounded-sm hover:bg-zinc-800 transition-colors flex items-center justify-between ${editor.isActive('fallacy', { fallacyId: fallacy.id }) ? 'bg-zinc-800' : ''}`}
                  >
                    <span>{fallacy.name}</span>
                    <div className={`w-2 h-2 rounded-full ${fallacy.color.split(' ')[0]}`} />
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-1 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={() => editor.chain().focus().unsetFallacy().run()}
                disabled={!editor.isActive('fallacy')}
              >
                Clear Tag
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </BubbleMenu>
      
      <div className="p-4 sm:p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
