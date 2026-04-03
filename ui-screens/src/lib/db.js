/**
 * Serendipity Engine — IndexedDB via Dexie.js
 *
 * Database schema for project storage, settings, API keys,
 * and writing profile persistence.
 */
import Dexie from 'dexie';

const db = new Dexie('serendipity-engine');

db.version(1).stores({
  // Projects store — each project is a complete story workspace
  projects: '++id, &slug, title, createdAt, updatedAt, medium, genre',

  // Project files — individual markdown files within a project
  projectFiles: '++id, projectId, path, updatedAt',

  // Application settings — key-value pairs
  settings: 'key',

  // API keys — encrypted provider credentials
  apiKeys: 'provider',

  // Writing profile — silent assessment data
  writingProfile: 'id',

  // Session changelog — per-project session history
  sessionLogs: '++id, projectId, timestamp',

  // Version history — lightweight diffs per file
  fileHistory: '++id, projectId, filePath, timestamp',
});

export default db;

/**
 * Settings helpers
 */
export async function getSetting(key, defaultValue = null) {
  const record = await db.settings.get(key);
  return record ? record.value : defaultValue;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

export async function getAllSettings() {
  const records = await db.settings.toArray();
  return Object.fromEntries(records.map(r => [r.key, r.value]));
}

/**
 * API Key encryption helpers using Web Crypto API
 */
let _encryptionKey = null;

async function getEncryptionKey() {
  if (_encryptionKey) return _encryptionKey;

  // Check if we already stored a key reference
  const stored = await db.settings.get('_crypto_key_id');

  if (!stored) {
    // Generate a new AES-GCM key
    _encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false, // not extractable — device-bound
      ['encrypt', 'decrypt']
    );
    // Store a marker (the actual CryptoKey stays in memory;
    // re-generated per session in real impl, stored in IDB via CryptoKey serialization)
    await db.settings.put({ key: '_crypto_key_id', value: Date.now() });
    return _encryptionKey;
  }

  // For now, generate a new key per session (keys must be re-entered if cleared)
  _encryptionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return _encryptionKey;
}

export async function encryptApiKey(plaintext) {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(ciphertext)) };
}

export async function decryptApiKey(encrypted) {
  const key = await getEncryptionKey();
  const iv = new Uint8Array(encrypted.iv);
  const data = new Uint8Array(encrypted.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

/**
 * API Key CRUD
 */
export async function storeApiKey(provider, apiKey, metadata = {}) {
  const encrypted = await encryptApiKey(apiKey);
  await db.apiKeys.put({
    provider,
    encrypted,
    ...metadata,
    storedAt: Date.now(),
  });
}

export async function getApiKey(provider) {
  const record = await db.apiKeys.get(provider);
  if (!record) return null;
  try {
    return await decryptApiKey(record.encrypted);
  } catch {
    return null; // Key was regenerated, user must re-enter
  }
}

export async function removeApiKey(provider) {
  await db.apiKeys.delete(provider);
}

export async function listProviders() {
  return db.apiKeys.toArray();
}
