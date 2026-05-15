import { Mark, mergeAttributes } from '@tiptap/core';
import { STANDALONE_FALLACIES } from '@/lib/fallacies';

export interface FallacyOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fallacy: {
      setFallacy: (fallacyId: string) => ReturnType;
      unsetFallacy: () => ReturnType;
    };
  }
}

export const fallacies = [
  { id: 'strawman', name: 'Strawman', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'ad-hominem', name: 'Ad Hominem', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'appeal-emotion', name: 'Appeal to Emotion', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { id: 'slippery-slope', name: 'Slippery Slope', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { id: 'false-cause', name: 'False Cause', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'tu-quoque', name: 'Tu Quoque', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'personal-incredulity', name: 'Personal Incredulity', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { id: 'special-pleading', name: 'Special Pleading', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { id: 'loaded-question', name: 'Loaded Question', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'burden-proof', name: 'Burden of Proof', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  { id: 'ambiguity', name: 'Ambiguity', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { id: 'gamblers-fallacy', name: "The Gambler's Fallacy", color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'bandwagon', name: 'Bandwagon', color: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' },
  { id: 'appeal-authority', name: 'Appeal to Authority', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'composition-division', name: 'Composition/Division', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'no-true-scotsman', name: 'No True Scotsman', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'genetic', name: 'Genetic', color: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  { id: 'black-or-white', name: 'Black-or-White', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  { id: 'begging-question', name: 'Begging the Question', color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30' },
  { id: 'appeal-nature', name: 'Appeal to Nature', color: 'bg-stone-500/20 text-stone-400 border-stone-500/30' },
];

export const FallacyMark = Mark.create<FallacyOptions>({
  name: 'fallacy',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fallacyId: {
        default: null,
        parseHTML: element => element.getAttribute('data-fallacy'),
        renderHTML: attributes => {
          if (!attributes.fallacyId) {
            return {};
          }

          const fallacyColorDef = fallacies.find(f => f.id === attributes.fallacyId);
          const standaloneFallacy = STANDALONE_FALLACIES.find(f => f.id === attributes.fallacyId);
          
          return {
            'data-fallacy': attributes.fallacyId,
            class: `fallacy-mark border-b-2 cursor-pointer pb-[1px] ${fallacyColorDef ? fallacyColorDef.color : ''}`,
            title: standaloneFallacy ? `${standaloneFallacy.name}: ${standaloneFallacy.description}` : (fallacyColorDef ? fallacyColorDef.name : 'Unknown Fallacy'),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-fallacy]',
      },
      {
        tag: 'mark[data-fallacy]',
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFallacy: (fallacyId: string) => ({ commands }) => {
        return commands.setMark(this.name, { fallacyId });
      },
      unsetFallacy: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});
