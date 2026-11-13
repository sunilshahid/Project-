import { Mark, mergeAttributes } from '@tiptap/core';
import { UNIFIED_FALLACIES, getFallacyById, FallacyDefinition } from '@/lib/fallacies';

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
        parseHTML: (element) => element.getAttribute('data-fallacy'),
        renderHTML: (attributes) => {
          if (!attributes.fallacyId) {
            return {};
          }

          const def = getFallacyById(attributes.fallacyId);
          const colorClass = def ? def.badgeClass : 'bg-zinc-800 text-zinc-300 border-zinc-700';
          const title = def ? `${def.name} [${def.categoryLabel}]: ${def.shortDescription}` : 'Fallacy Tag';

          return {
            'data-fallacy': attributes.fallacyId,
            class: `fallacy-mark border-b-2 cursor-pointer pb-[1px] px-1 rounded-sm ${colorClass}`,
            title,
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
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFallacy:
        (fallacyId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { fallacyId });
        },
      unsetFallacy:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

export const fallacies = UNIFIED_FALLACIES;
