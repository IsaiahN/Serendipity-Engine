/**
 * Tests for demo content gating logic
 *
 * The core invariant: static demo content from fileData.js should ONLY
 * be served when the active project IS the demo project. All other
 * projects should never see static demo content.
 *
 * This tests the gating logic pattern used in both WorkspaceScreen's
 * getDemoFileContent() and GenreShiftDashboard's character fallback.
 */
import { describe, it, expect, beforeEach } from 'vitest';

// Replicate the gating logic as a pure function for testing
// (mirrors WorkspaceScreen.getDemoFileContent and GenreShiftDashboard's isDemo check)
function shouldUseDemoContent(activeProjectId, demoProjectId) {
  if (!demoProjectId) return false;
  if (!activeProjectId) return false;
  return String(activeProjectId) === String(demoProjectId);
}

describe('demo content gating', () => {
  describe('shouldUseDemoContent', () => {
    it('returns true when active project matches demo project', () => {
      expect(shouldUseDemoContent('abc-123', 'abc-123')).toBe(true);
    });

    it('returns false when active project differs from demo', () => {
      expect(shouldUseDemoContent('wizard-of-oz-id', 'shunning-season-id')).toBe(false);
    });

    it('returns false when no demo project exists', () => {
      expect(shouldUseDemoContent('abc-123', null)).toBe(false);
      expect(shouldUseDemoContent('abc-123', undefined)).toBe(false);
      expect(shouldUseDemoContent('abc-123', '')).toBe(false);
    });

    it('returns false when no active project', () => {
      expect(shouldUseDemoContent(null, 'abc-123')).toBe(false);
      expect(shouldUseDemoContent(undefined, 'abc-123')).toBe(false);
    });

    it('handles numeric vs string ID comparison', () => {
      // IDs might come as numbers from some code paths
      expect(shouldUseDemoContent(123, '123')).toBe(true);
      expect(shouldUseDemoContent('123', 123)).toBe(true);
    });

    it('handles UUID format IDs', () => {
      const uuid = '293eae04-0c0a-437f-a55d-3c0d45fdd75a';
      expect(shouldUseDemoContent(uuid, uuid)).toBe(true);
      expect(shouldUseDemoContent(uuid, '07035184-d42a-405b-a4f2-98cb5970362a')).toBe(false);
    });
  });

  describe('file fallback chain invariant', () => {
    // Simulate the fallback chain:
    // storeFiles[path] -> getDemoFileContent(path) -> defaultFileContent(path)
    function resolveFileContent(path, storeFiles, demoContent, activeId, demoId) {
      // 1. Try store (IndexedDB content)
      if (storeFiles[path]) return { source: 'store', content: storeFiles[path] };
      // 2. Try demo (only if active project IS the demo)
      if (shouldUseDemoContent(activeId, demoId) && demoContent[path]) {
        return { source: 'demo', content: demoContent[path] };
      }
      // 3. Default placeholder
      return { source: 'default', content: `# ${path}\nPlaceholder.` };
    }

    const demoContent = {
      'author.md': { title: 'Author: Isaiah', content: ['Shunning Season author...'] },
      'narrator.md': { title: 'Narrator', content: ['First person...'] },
    };

    it('non-demo project with empty store gets default, NOT demo content', () => {
      const result = resolveFileContent('author.md', {}, demoContent, 'wizard-id', 'demo-id');
      expect(result.source).toBe('default');
      expect(result.content).not.toContain('Isaiah');
    });

    it('demo project with empty store gets demo content', () => {
      const result = resolveFileContent('author.md', {}, demoContent, 'demo-id', 'demo-id');
      expect(result.source).toBe('demo');
    });

    it('store content always wins regardless of demo status', () => {
      const storeFiles = { 'author.md': '# My Custom Author Profile' };
      const resultDemo = resolveFileContent('author.md', storeFiles, demoContent, 'demo-id', 'demo-id');
      const resultNonDemo = resolveFileContent('author.md', storeFiles, demoContent, 'other-id', 'demo-id');
      expect(resultDemo.source).toBe('store');
      expect(resultNonDemo.source).toBe('store');
    });

    it('non-existent demo ID means demo content is never served', () => {
      // Stale demoProjectId that doesn't match any project
      const result = resolveFileContent('author.md', {}, demoContent, 'wizard-id', 'stale-deleted-id');
      expect(result.source).toBe('default');
    });
  });
});
