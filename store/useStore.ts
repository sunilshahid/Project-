import { create } from 'zustand';
import { deriveKey, encryptData, decryptData, ENCRYPTED_VAULT_KEY, hashIdentifier, generateSalt, buf2hex, hex2buf } from '@/lib/crypto';
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
  updatedAt: number;
}

interface VaultData {
  notes: Note[];
}

interface StoreState {
  isUnlocked: boolean;
  isUnlocking: boolean;
  cryptoKey: CryptoKey | null;
  userHash: string | null;
  notes: Note[];
  activeNoteId: string | null;
  
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (identifier: string, password: string) => Promise<boolean>;
  lock: () => void;
  createNote: (type: 'note' | 'check', title: string, content?: string, selections?: FallacySelection[]) => Promise<void>;
  updateActiveNote: (updates: Partial<Note>) => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
  deleteNote: (id: string) => Promise<void>;
}

async function loadEncryptedVault(key: CryptoKey, userHash: string): Promise<VaultData> {
  const stored = localStorage.getItem(`vault_${userHash}`);
  if (!stored) {
    return { notes: [] };
  }
  try {
    const { ciphertext, iv } = JSON.parse(stored);
    const decryptedJson = await decryptData(key, ciphertext, iv);
    return JSON.parse(decryptedJson) as VaultData;
  } catch (e) {
    console.error("Failed to decrypt vault:", e);
    throw new Error("Invalid password or corrupted vault");
  }
}

async function saveEncryptedVault(key: CryptoKey, userHash: string, vault: VaultData) {
  const json = JSON.stringify(vault);
  const encrypted = await encryptData(key, json);
  localStorage.setItem(`vault_${userHash}`, JSON.stringify(encrypted));
}

export const useStore = create<StoreState>((set, get) => ({
  isUnlocked: false,
  isUnlocking: false,
  cryptoKey: null,
  userHash: null,
  notes: [],
  activeNoteId: null,

  login: async (identifier: string, password: string) => {
    set({ isUnlocking: true });
    try {
      const userHash = await hashIdentifier(identifier);
      const saltHex = localStorage.getItem(`salt_${userHash}`);
      
      if (!saltHex) {
        toast.error("Invalid username or password, or account does not exist.");
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
        isUnlocking: false,
      });
      return true;
    } catch (e) {
      set({ isUnlocking: false });
      toast.error("Invalid username or password, or account does not exist.");
      return false;
    }
  },

  signup: async (identifier: string, password: string) => {
    set({ isUnlocking: true });
    try {
      const userHash = await hashIdentifier(identifier);
      if (localStorage.getItem(`salt_${userHash}`)) {
        toast.error("Account already exists");
        set({ isUnlocking: false });
        return false;
      }

      const salt = await generateSalt();
      localStorage.setItem(`salt_${userHash}`, buf2hex(salt.buffer));
      
      const key = await deriveKey(password, salt);
      
      const emptyVault = { notes: [] };
      await saveEncryptedVault(key, userHash, emptyVault);
      
      set({
        isUnlocked: true,
        cryptoKey: key,
        userHash,
        notes: [],
        activeNoteId: null,
        isUnlocking: false,
      });
      return true;
    } catch(e) {
      set({ isUnlocking: false });
      toast.error("Error creating account");
      return false;
    }
  },

  lock: () => {
    set({
      isUnlocked: false,
      cryptoKey: null,
      userHash: null,
      notes: [],
      activeNoteId: null,
    });
  },

  createNote: async (type: 'note' | 'check', title: string, content?: string, selections?: FallacySelection[]) => {
    const { cryptoKey, userHash, notes } = get();
    if (!cryptoKey || !userHash) return;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      type,
      title: title || (type === 'note' ? 'Untitled Note' : 'Untitled Logical Check'),
      content: content || '',
      selections: selections || [],
      updatedAt: Date.now(),
    };
    
    const newNotes = [newNote, ...notes];
    await saveEncryptedVault(cryptoKey, userHash, { notes: newNotes });
    
    set({ notes: newNotes, activeNoteId: newNote.id });
  },

  updateActiveNote: async (updates: Partial<Note>) => {
    const { cryptoKey, userHash, notes, activeNoteId } = get();
    if (!cryptoKey || !userHash || !activeNoteId) return;

    const newNotes = notes.map(n => 
      n.id === activeNoteId ? { ...n, ...updates, updatedAt: Date.now() } : n
    );

    await saveEncryptedVault(cryptoKey, userHash, { notes: newNotes });
    set({ notes: newNotes });
  },

  setActiveNoteId: (id: string | null) => set({ activeNoteId: id }),

  deleteNote: async (id: string) => {
    const { cryptoKey, userHash, notes, activeNoteId } = get();
    if (!cryptoKey || !userHash) return;

    const newNotes = notes.filter(n => n.id !== id);
    await saveEncryptedVault(cryptoKey, userHash, { notes: newNotes });
    
    set({
      notes: newNotes,
      activeNoteId: activeNoteId === id ? (newNotes.length > 0 ? newNotes[0].id : null) : activeNoteId
    });
  }
}));
