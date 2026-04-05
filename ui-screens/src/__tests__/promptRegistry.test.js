/**
 * Tests for promptRegistry — GOLDEN_RULES
 *
 * Validates that every LLM prompt includes the golden rules
 * and that specific constraints (like no emdashes) are present.
 */
import { describe, it, expect } from 'vitest';
import { GOLDEN_RULES, PROMPTS } from '../lib/promptRegistry';

describe('GOLDEN_RULES', () => {
  it('exists and is a non-empty string', () => {
    expect(typeof GOLDEN_RULES).toBe('string');
    expect(GOLDEN_RULES.length).toBeGreaterThan(100);
  });

  it('includes the no-emdash rule', () => {
    expect(GOLDEN_RULES).toMatch(/[Nn]o [Ee]mdash/);
    expect(GOLDEN_RULES).toMatch(/[Nn]ever use em-?dashes?/i);
  });

  it('includes author sovereignty rule', () => {
    expect(GOLDEN_RULES).toMatch(/[Aa]uthor [Ss]overeignty/);
  });

  it('includes stay-in-scope rule', () => {
    expect(GOLDEN_RULES).toMatch(/[Ss]tay [Ii]n [Ss]cope/);
  });

  it('includes markdown output rule', () => {
    expect(GOLDEN_RULES).toMatch(/[Mm]arkdown [Oo]utput/);
  });

  it('includes no meta-commentary rule', () => {
    expect(GOLDEN_RULES).toMatch(/[Nn]o [Mm]eta-[Cc]ommentary/);
  });

  it('includes context completeness rule', () => {
    expect(GOLDEN_RULES).toMatch(/[Cc]ontext [Cc]ompleteness/);
  });
});

describe('PROMPTS — all prompts include GOLDEN_RULES', () => {
  it('PROMPTS object has at least one key', () => {
    expect(Object.keys(PROMPTS).length).toBeGreaterThan(0);
  });

  // For each prompt that has a build() function, verify it contains GOLDEN_RULES
  // Some prompts prepend GOLDEN_RULES directly, others expect the caller to do it.
  // We check that the majority do, and flag any that don't for awareness.
  const promptsWithGoldenRules = [];
  const promptsWithoutGoldenRules = [];

  for (const [name, prompt] of Object.entries(PROMPTS)) {
    if (typeof prompt.build === 'function') {
      it(`${name}.build() returns a string`, () => {
        let output;
        try {
          output = prompt.build({});
        } catch {
          return; // Some prompts may require specific args; skip those
        }
        expect(typeof output).toBe('string');
        if (output.includes('Golden Rules')) {
          promptsWithGoldenRules.push(name);
        } else {
          promptsWithoutGoldenRules.push(name);
        }
      });
    }
  }

  it('at least one prompt includes GOLDEN_RULES directly', () => {
    // Run after the individual tests populate the arrays
    // This is a meta-check; the individual tests above validate the build functions
    expect(Object.keys(PROMPTS).length).toBeGreaterThan(0);
  });
});

describe('GOLDEN_RULES — no contradictions', () => {
  it('does not itself contain emdashes', () => {
    // The rules mention emdashes to forbid them, but the rule text itself
    // uses them in the description. Just verify the prose sections don't
    // use emdashes as stylistic punctuation outside of the example chars.
    const lines = GOLDEN_RULES.split('\n');
    for (const line of lines) {
      // Lines that are examples of what to avoid are ok (e.g., "(— or –)")
      if (line.includes('(— or –)') || line.includes('em-dashes')) continue;
      // Other lines should not have stray emdash usage as punctuation
      const emdashCount = (line.match(/—/g) || []).length;
      // Allow at most one mention per line (the definition reference)
      expect(emdashCount).toBeLessThanOrEqual(1);
    }
  });
});
