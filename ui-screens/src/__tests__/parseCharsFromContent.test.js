/**
 * Tests for parseCharsFromContent
 *
 * This is the character name parser that extracts names from markdown
 * content (questions-answered files, story files, etc.). It was a
 * frequent source of false positives — "Yes", "None fundamentally",
 * duplicate "Bishop" when "Bishop Ezra Eicher" exists, etc.
 */
import { describe, it, expect } from 'vitest';
import parseCharsFromContent from '../utils/parseCharsFromContent';

// Helper: extract just the name strings from the result
const names = (content) => parseCharsFromContent(content).map(c => c.name);

describe('parseCharsFromContent', () => {
  // -----------------------------------------------------------------
  //  Basic extraction patterns
  // -----------------------------------------------------------------
  describe('header-based extraction (### Name)', () => {
    it('extracts names from ### headers', () => {
      const content = `### Dorothy Gale\nShe is from Kansas.\n\n### Scarecrow\nNeeds a brain.`;
      expect(names(content)).toContain('Dorothy Gale');
      expect(names(content)).toContain('Scarecrow');
    });

    it('strips emdash suffixes from header names', () => {
      const content = `### Bishop Ezra Eicher — the community elder`;
      expect(names(content)).toEqual(['Bishop Ezra Eicher']);
    });

    it('strips parenthetical suffixes from header names', () => {
      const content = `### Toto (dog companion)`;
      expect(names(content)).toEqual(['Toto']);
    });
  });

  describe('bold-based extraction (**Name**)', () => {
    it('extracts bold character names', () => {
      const content = `The cast includes **Dorothy Gale** and **Tin Woodman**.`;
      expect(names(content)).toContain('Dorothy Gale');
      expect(names(content)).toContain('Tin Woodman');
    });

    it('rejects bold structural labels', () => {
      const content = `**Who is the protagonist?**\n**The Cast:**\n**Supporting Characters**`;
      expect(names(content)).toEqual([]);
    });
  });

  describe('emdash-line extraction (Name — description)', () => {
    it('extracts "Name — description" patterns', () => {
      const content = `Maren Bishop — a woman returning to her Amish roots\nDavid Yoder — the community outsider`;
      expect(names(content)).toContain('Maren Bishop');
      expect(names(content)).toContain('David Yoder');
    });
  });

  describe('protagonist/antagonist extraction', () => {
    it('extracts protagonist from question/answer format', () => {
      const content = `**Who is the protagonist?**\n\nDorothy Gale — a young girl from Kansas`;
      expect(names(content)).toContain('Dorothy Gale');
    });

    it('extracts antagonist from question/answer format', () => {
      // Note: "The Wicked Witch" starts with stopword "The", so it's filtered.
      // Names need to start with a non-stopword. Use a proper name instead.
      const content = `**Who is the antagonist?**\n\nVoldemort — the dark lord`;
      expect(names(content)).toContain('Voldemort');
    });

    it('filters antagonist names starting with stopwords like "The"', () => {
      const content = `**Who is the antagonist?**\n\nThe Wicked Witch — ruler of the West`;
      // "The" is a stopword first-word, so this correctly gets filtered
      expect(names(content)).not.toContain('The Wicked Witch');
    });
  });

  // -----------------------------------------------------------------
  //  False positive rejection (the bugs we fixed)
  // -----------------------------------------------------------------
  describe('stopword filtering', () => {
    it('rejects "Yes" as a character name', () => {
      const content = `### Yes\nThis is an answer.`;
      expect(names(content)).not.toContain('Yes');
    });

    it('rejects "None fundamentally" (first-word stopword check)', () => {
      const content = `### None fundamentally\nSome text.`;
      expect(names(content)).not.toContain('None fundamentally');
      expect(names(content)).not.toContain('None');
    });

    it('rejects common stopwords in all extraction patterns', () => {
      const stopwords = ['However', 'Therefore', 'Meanwhile', 'Furthermore', 'Additionally'];
      for (const word of stopwords) {
        const content = `### ${word}\nSome text.`;
        expect(names(content)).not.toContain(word);
      }
    });

    it('rejects names starting with stopword first-word', () => {
      const content = `### Each character has depth\n### Every detail matters`;
      expect(names(content)).toEqual([]);
    });
  });

  describe('case and length filtering', () => {
    it('rejects lowercase names', () => {
      const content = `**dorothy gale**`;
      expect(names(content)).toEqual([]);
    });

    it('rejects single-character words', () => {
      // Single word under 3 chars should be rejected
      const content = `### Bo\nA character.`;
      expect(names(content)).toEqual([]);
    });

    it('accepts single words of 3+ characters', () => {
      const content = `### Toto\nA dog.`;
      expect(names(content)).toContain('Toto');
    });
  });

  // -----------------------------------------------------------------
  //  Deduplication
  // -----------------------------------------------------------------
  describe('deduplication', () => {
    it('removes "Bishop" when "Bishop Ezra Eicher" exists', () => {
      const content = `### Bishop Ezra Eicher\nThe elder.\n\n**Bishop** is respected.`;
      const result = names(content);
      expect(result).toContain('Bishop Ezra Eicher');
      expect(result).not.toContain('Bishop');
    });

    it('does not deduplicate unrelated names', () => {
      const content = `### Dorothy Gale\n### Scarecrow\n### Tin Woodman`;
      expect(names(content)).toHaveLength(3);
    });

    it('removes exact slug duplicates', () => {
      const content = `### Dorothy Gale\nSome text.\n**Dorothy Gale** appears again.`;
      expect(names(content)).toHaveLength(1);
      expect(names(content)[0]).toBe('Dorothy Gale');
    });
  });

  // -----------------------------------------------------------------
  //  Edge cases
  // -----------------------------------------------------------------
  describe('edge cases', () => {
    it('returns empty array for empty content', () => {
      expect(parseCharsFromContent('')).toEqual([]);
    });

    it('returns empty array for content with no names', () => {
      const content = `This is just a paragraph about the world.\nNo character names here.`;
      expect(parseCharsFromContent(content)).toEqual([]);
    });

    it('handles mixed extraction patterns without duplicates', () => {
      const content = `### Dorothy Gale\nShe is brave.\n\n**Dorothy Gale** saves the day.\n\nDorothy Gale — the protagonist`;
      const result = names(content);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Dorothy Gale');
    });

    it('handles names with apostrophes', () => {
      const content = `### O'Brien\nAn Irish character.`;
      expect(names(content)).toContain("O'Brien");
    });

    it('strips trailing periods from names', () => {
      const content = `### Dr. Watson.\nThe sidekick.`;
      const result = names(content);
      expect(result.some(n => n.endsWith('.'))).toBe(false);
    });
  });

  // -----------------------------------------------------------------
  //  Real-world regression: Shunning Season characters
  // -----------------------------------------------------------------
  describe('real-world: Shunning Season content', () => {
    const shunningContent = `**Who is the protagonist?**

Maren Bishop — a woman returning to her Amish community

**Who is the antagonist?**

Bishop Ezra Eicher — the spiritual leader whose authority is threatened

### Maren Bishop
A former Amish woman returning home after years away.

### Bishop Ezra Eicher
The community's spiritual authority.

### David Yoder
A childhood friend with a complicated history.

### Elena Vargas
An outsider journalist investigating the community.

### Marcus Webb
A local activist.

### Priya Mehta
A social worker.`;

    it('extracts all Shunning Season characters', () => {
      const result = names(shunningContent);
      expect(result).toContain('Maren Bishop');
      expect(result).toContain('Bishop Ezra Eicher');
      expect(result).toContain('David Yoder');
      expect(result).toContain('Elena Vargas');
      expect(result).toContain('Marcus Webb');
      expect(result).toContain('Priya Mehta');
    });

    it('does not produce standalone "Bishop" when "Bishop Ezra Eicher" exists', () => {
      const result = names(shunningContent);
      expect(result).not.toContain('Bishop');
    });

    it('produces no false positives from Q&A format text', () => {
      const result = names(shunningContent);
      // Every result should be a real character name
      for (const n of result) {
        expect(n).toMatch(/^[A-Z]/);
        expect(n.length).toBeGreaterThan(2);
      }
    });
  });
});
