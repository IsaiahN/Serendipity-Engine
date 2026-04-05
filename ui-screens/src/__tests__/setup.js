/**
 * Vitest global setup
 *
 * - Polyfills IndexedDB via fake-indexeddb so Dexie works in Node
 * - Sets up minimal localStorage mock
 */
import 'fake-indexeddb/auto';
