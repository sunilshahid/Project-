import { create } from 'zustand';
import {
  deriveKey,
  encryptData,
  decryptData,
  hashIdentifier,
  generateSalt,
  buf2hex,
  hex2buf,
} from '@/lib/crypto';
import { toast } from 'sonner';

export interface FallacySelection {
  fallacyId: string;
  customNote: string;
}

export interface Note {
  id: string;
  type: 'note' | 'check';
  title: string;
  content: string;
  selections: FallacySelection[];
  tags: string[];
  isPinned?: boolean;
  sourceUrl?: string;
  createdAt: number;
  updatedAt: number;
}

interface VaultData {
  notes: Note[];
  version?: number;
  settings?: {
    autoLockMinutes?: number;
  };
}

interface StoreState {
  isUnlocked: boolean;
  isUnlocking: boolean;
  cryptoKey: CryptoKey | null;
  userHash: string | null;
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  selectedTag: string | null;
  autoLockMinutes: number;
  lastActivity: number;

  // Authentication & Session
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (identifier: string, password: string) => Promise<boolean>;
  lock: () => void;
  updateActivity: () => void;
  setAutoLockMinutes: (mins: number) => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;

  // Note CRUD
  createNote: (
    type: 'note' | 'check',
    title: string,
    content?: string,
    selections?: FallacySelection[],
    tags?: string[],
    sourceUrl?: string
  ) => Promise<string | undefined>;
  updateNote: (id: string, updates: Partial<Note>) => void;
  updateActiveNote: (updates: Partial<Note>) => void;
  setActiveNoteId: (id: string | null) => void;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => void;
  addTagToNote: (id: string, tag: string) => void;
  removeTagFromNote: (id: string, tag: string) => void;

  // Filter & Search
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;

  // Manual persistence flush
  flushSave: () => Promise<void>;
  exportVaultJson: () => string;
}

// Debounce state
let saveTimeout: NodeJS.Timeout | null = null;
let pendingVaultData: VaultData | null = null;

async function executeVaultSave(key: CryptoKey, userHash: string, vault: VaultData) {
  try {
    const json = JSON.stringify(vault);
    const encrypted = await encryptData(key, json);
    localStorage.setItem(`vault_${userHash}`, JSON.stringify(encrypted));
  } catch (err) {
    console.error('Failed to save encrypted vault:', err);
    toast.error('Failed to encrypt and save vault to local storage.');
  }
}

function scheduleSave(get: () => StoreState) {
  const { cryptoKey, userHash, notes, autoLockMinutes } = get();
  if (!cryptoKey || !userHash) return;

  pendingVaultData = {
    notes,
    version: 2,
    settings: {
      autoLockMinutes,
    },
  };

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // 750ms debounce to prevent freezing during fast typing
  saveTimeout = setTimeout(async () => {
    if (pendingVaultData && cryptoKey && userHash) {
      await executeVaultSave(cryptoKey, userHash, pendingVaultData);
      pendingVaultData = null;
    }
  }, 750);
}

export function extractFallaciesFromHtml(html: string): string[] {
  if (!html) return [];
  const regex = /data-fallacy="([^"]+)"/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && !matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}

async function loadEncryptedVault(key: CryptoKey, userHash: string): Promise<VaultData> {
  const stored = localStorage.getItem(`vault_${userHash}`);
  if (!stored) {
    return { notes: [] };
  }
  try {
    const { ciphertext, iv } = JSON.parse(stored);
    const decryptedJson = await decryptData(key, ciphertext, iv);
    const parsed = JSON.parse(decryptedJson) as VaultData;
    
    // Normalize notes structure
    const normalizedNotes = (parsed.notes || []).map((n) => ({
      ...n,
      tags: Array.isArray(n.tags) ? n.tags : [],
      selections: Array.isArray(n.selections) ? n.selections : [],
      createdAt: n.createdAt || n.updatedAt || Date.now(),
      updatedAt: n.updatedAt || Date.now(),
      isPinned: Boolean(n.isPinned),
    }));

    return {
      notes: normalizedNotes,
      version: parsed.version || 1,
      settings: parsed.settings || {},
    };
  } catch (e) {
    console.error('Failed to decrypt vault:', e);
    throw new Error('Invalid password or corrupted vault');
  }
}

export const useStore = create<StoreState>((set, get) => ({
  isUnlocked: false,
  isUnlocking: false,
  cryptoKey: null,
  userHash: null,
  notes: [],
  activeNoteId: null,
  searchQuery: '',
  selectedTag: null,
  autoLockMinutes: 15,
  lastActivity: Date.now(),

  updateActivity: () => set({ lastActivity: Date.now() }),

  setAutoLockMinutes: (mins: number) => {
    set({ autoLockMinutes: mins });
    scheduleSave(get);
  },

  login: async (identifier: string, password: string) => {
    set({ isUnlocking: true });
    try {
      const userHash = await hashIdentifier(identifier);
      const saltHex = localStorage.getItem(`salt_${userHash}`);

      if (!saltHex) {
        toast.error('Invalid username or password, or account does not exist.');
        set({ isUnlocking: false });
        return false;
      }

      const salt = new Uint8Array(hex2buf(saltHex));
      const key = await deriveKey(password, salt);

      const vault = await loadEncryptedVault(key, userHash);

      set({
        isUnlocked: true,
        cryptoKey: key,
        userHash,
        notes: vault.notes,
        activeNoteId: vault.notes.length > 0 ? vault.notes[0].id : null,
        autoLockMinutes: vault.settings?.autoLockMinutes ?? 15,
        lastActivity: Date.now(),
        isUnlocking: false,
      });
      return true;
    } catch (e) {
      set({ isUnlocking: false });
      toast.error('Invalid username or password, or vault could not be decrypted.');
      return false;
    }
  },

  signup: async (identifier: string, password: string) => {
    set({ isUnlocking: true });
    try {
      const userHash = await hashIdentifier(identifier);
      if (localStorage.getItem(`salt_${userHash}`)) {
        toast.error('Account already exists for this identifier.');
        set({ isUnlocking: false });
        return false;
      }

      const salt = await generateSalt();
      localStorage.setItem(`salt_${userHash}`, buf2hex(salt.buffer));

      const key = await deriveKey(password, salt);

      const emptyVault: VaultData = {
        notes: [],
        version: 2,
        settings: { autoLockMinutes: 15 },
      };
      await executeVaultSave(key, userHash, emptyVault);

      set({
        isUnlocked: true,
        cryptoKey: key,
        userHash,
        notes: [],
        activeNoteId: null,
        lastActivity: Date.now(),
        isUnlocking: false,
      });
      return true;
    } catch (e) {
      set({ isUnlocking: false });
      toast.error('Error creating encrypted account.');
      return false;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { cryptoKey, userHash, notes, autoLockMinutes } = get();
    if (!cryptoKey || !userHash) return false;

    try {
      const saltHex = localStorage.getItem(`salt_${userHash}`);
      if (!saltHex) return false;

      // Verify old password
      const oldSalt = new Uint8Array(hex2buf(saltHex));
      const testKey = await deriveKey(oldPassword, oldSalt);
      await loadEncryptedVault(testKey, userHash);

      // Generate new salt and new key
      const newSalt = await generateSalt();
      const newKey = await deriveKey(newPassword, newSalt);

      // Save under new key
      localStorage.setItem(`salt_${userHash}`, buf2hex(newSalt.buffer));
      const currentVault: VaultData = {
        notes,
        version: 2,
        settings: { autoLockMinutes },
      };
      await executeVaultSave(newKey, userHash, currentVault);

      set({ cryptoKey: newKey });
      toast.success('Master password successfully changed.');
      return true;
    } catch (err) {
      toast.error('Password change failed. Verify your current password.');
      return false;
    }
  },

  lock: () => {
    // Flush any pending save synchronously if possible before wiping memory
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    const { cryptoKey, userHash, notes, autoLockMinutes } = get();
    if (cryptoKey && userHash && pendingVaultData) {
      executeVaultSave(cryptoKey, userHash, pendingVaultData);
      pendingVaultData = null;
    }

    set({
      isUnlocked: false,
      cryptoKey: null,
      userHash: null,
      notes: [],
      activeNoteId: null,
      searchQuery: '',
      selectedTag: null,
    });
    toast.info('Vault locked securely.');
  },

  createNote: async (
    type: 'note' | 'check',
    title: string,
    content?: string,
    selections?: FallacySelection[],
    tags?: string[],
    sourceUrl?: string
  ) => {
    const { cryptoKey, userHash, notes } = get();
    if (!cryptoKey || !userHash) return;

    const now = Date.now();
    const newNote: Note = {
      id: crypto.randomUUID(),
      type,
      title: title || (type === 'note' ? 'Untitled Note' : 'Untitled Logical Check'),
      content: content || '',
      selections: selections || [],
      tags: tags || [],
      isPinned: false,
      sourceUrl: sourceUrl || '',
      createdAt: now,
      updatedAt: now,
    };

    const newNotes = [newNote, ...notes];
    set({ notes: newNotes, activeNoteId: newNote.id });
    scheduleSave(get);
    return newNote.id;
  },

  updateNote: (id: string, updates: Partial<Note>) => {
    const { notes } = get();
    const newNotes = notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    set({ notes: newNotes });
    scheduleSave(get);
  },

  updateActiveNote: (updates: Partial<Note>) => {
    const { notes, activeNoteId } = get();
    if (!activeNoteId) return;

    const newNotes = notes.map((n) =>
      n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    set({ notes: newNotes });
    scheduleSave(get);
  },

  setActiveNoteId: (id: string | null) => set({ activeNoteId: id }),

  deleteNote: async (id: string) => {
    const { notes, activeNoteId } = get();
    const newNotes = notes.filter((n) => n.id !== id);

    set({
      notes: newNotes,
      activeNoteId: activeNoteId === id ? (newNotes.length > 0 ? newNotes[0].id : null) : activeNoteId,
    });
    scheduleSave(get);
  },

  togglePinNote: (id: string) => {
    const { notes } = get();
    const newNotes = notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n
    );
    set({ notes: newNotes });
    scheduleSave(get);
  },

  addTagToNote: (id: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (!cleanTag) return;
    const { notes } = get();
    const newNotes = notes.map((n) => {
      if (n.id !== id) return n;
      const currentTags = n.tags || [];
      if (currentTags.includes(cleanTag)) return n;
      return { ...n, tags: [...currentTags, cleanTag], updatedAt: Date.now() };
    });
    set({ notes: newNotes });
    scheduleSave(get);
  },

  removeTagFromNote: (id: string, tag: string) => {
    const { notes } = get();
    const newNotes = notes.map((n) => {
      if (n.id !== id) return n;
      return {
        ...n,
        tags: (n.tags || []).filter((t) => t !== tag),
        updatedAt: Date.now(),
      };
    });
    set({ notes: newNotes });
    scheduleSave(get);
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedTag: (tag: string | null) => set({ selectedTag: tag }),

  flushSave: async () => {
    const { cryptoKey, userHash, notes, autoLockMinutes } = get();
    if (!cryptoKey || !userHash) return;
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    await executeVaultSave(cryptoKey, userHash, {
      notes,
      version: 2,
      settings: { autoLockMinutes },
    });
    pendingVaultData = null;
  },

  exportVaultJson: () => {
    const { notes, autoLockMinutes } = get();
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: 2,
        notes,
        settings: { autoLockMinutes },
      },
      null,
      2
    );
  },
}));
