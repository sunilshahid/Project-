/**
 * Web Crypto API utilities for SkepticVault
 * PBKDF2 with 600,000 iterations for key derivation
 * AES-256-GCM for zero-knowledge client-side encryption
 */

const ITERATIONS = 600000;
const KEY_LENGTH = 256;
const ALGORITHM = 'AES-GCM';
const DOMAIN_SALT = 'skeptic_vault_domain_salt_v1:';

export const SALT_KEY = 'sv_salt';
export const ENCRYPTED_VAULT_KEY = 'sv_vault';

export function buf2hex(buffer: ArrayBufferLike): string {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

export function hex2buf(hexString: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Hash user identifier with domain separation to protect against precomputed rainbow tables.
 * Also checks legacy un-salted hash for seamless backward compatibility.
 */
export async function hashIdentifier(identifier: string): Promise<string> {
  const enc = new TextEncoder();
  const cleanId = identifier.toLowerCase().trim();
  
  // Primary domain-salted hash
  const saltedHashBuffer = await window.crypto.subtle.digest(
    'SHA-256',
    enc.encode(DOMAIN_SALT + cleanId)
  );
  const saltedHash = buf2hex(saltedHashBuffer);

  // If modern salted salt exists in storage, return it
  if (typeof window !== 'undefined' && localStorage.getItem(`salt_${saltedHash}`)) {
    return saltedHash;
  }

  // Legacy fallback: check if user previously signed up with unsalted hash
  const legacyHashBuffer = await window.crypto.subtle.digest(
    'SHA-256',
    enc.encode(cleanId)
  );
  const legacyHash = buf2hex(legacyHashBuffer);
  if (typeof window !== 'undefined' && localStorage.getItem(`salt_${legacyHash}`)) {
    return legacyHash;
  }

  return saltedHash;
}

export async function generateSalt(): Promise<Uint8Array> {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(
  key: CryptoKey,
  data: string
): Promise<{ ciphertext: string; iv: string }> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv as any as BufferSource,
    },
    key,
    enc.encode(data)
  );

  return {
    ciphertext: buf2hex(encrypted),
    iv: buf2hex(iv.buffer),
  };
}

export async function decryptData(
  key: CryptoKey,
  ciphertextHex: string,
  ivHex: string
): Promise<string> {
  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: new Uint8Array(hex2buf(ivHex)) as any as BufferSource,
    },
    key,
    hex2buf(ciphertextHex) as any as BufferSource
  );
  return dec.decode(decrypted);
}
