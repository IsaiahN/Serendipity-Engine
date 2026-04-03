/**
 * Serendipity Engine — Context Builder
 *
 * Assembles the full prompt context for LLM calls.
 * Implements the token management strategy from ACTION-PLAN.md:
 *
 * Always included (never trimmed):
 * 1. author.md
 * 2. narrator.md
 * 3. outline.md
 * 4. story/arc.md
 * 5. All character files for characters in the current chapter
 * 6. world/world-building.md
 * 7. relationships/questions-answered.md
 * 8. Specific outline entry for chapter N
 *
 * Progressive summarization:
 * - Chapters 1-3: full text
 * - Chapter 4+: N-1 and N-2 full text, earlier as summaries
 */

// Rough token estimation (4 chars per token for English text)
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Golden Rules — always prepended to every LLM call
 */
const GOLDEN_RULES = `## GOLDEN RULES (Non-Negotiable)

1. **No Emdashes**: Never use emdashes (the long dash character — or –) in any output. Use commas, periods, semicolons, or parentheses instead.
2. **Context Completeness**: Every chapter must include full relevant context. Refuse generation if required context files are missing.
3. **Editor Passes are Bounded**: Default one per arc during drafting; max 2-4 for final full-book review.
4. **Seed Reproducibility**: Same seed produces same rolls. All roll results must be logged.
5. **User Sovereignty**: The user can override any suggestion, skip any phase, edit any content. AI metadata tags are stripped in final export.
`;

/**
 * Build the full context for a chapter generation call
 *
 * @param {object} files - All project files { path: content }
 * @param {number} chapterNum - Which chapter to generate
 * @param {object} options - Additional context options
 * @returns {{ messages: Array, tokenCount: number, trimmed: string[] }}
 */
export function buildChapterContext(files, chapterNum, options = {}) {
  const { maxTokens = 128000, model = 'claude-sonnet-4-5-20250514' } = options;
  const trimmed = [];
  const parts = [];

  // 1. System prompt with golden rules
  parts.push({
    role: 'system',
    priority: 0,
    content: GOLDEN_RULES,
    label: 'Golden Rules',
  });

  // 2. Always included (never trimmed)
  const neverTrim = [
    { path: 'author.md', label: 'Author Profile' },
    { path: 'narrator.md', label: 'Narrator' },
    { path: 'outline.md', label: 'Story Outline' },
    { path: 'story/arc.md', label: 'Story Arc' },
    { path: 'world/world-building.md', label: 'World Building' },
    { path: 'relationships/questions-answered.md', label: 'Relationships' },
  ];

  for (const item of neverTrim) {
    if (files[item.path]?.trim()) {
      parts.push({
        role: 'context',
        priority: 1,
        content: `## ${item.label}\n\n${files[item.path]}`,
        label: item.label,
      });
    }
  }

  // 3. Character files for this chapter
  const charFiles = Object.entries(files)
    .filter(([path]) => path.startsWith('characters/') && path.endsWith('.md') && path !== 'characters/questions-answered.md');

  for (const [path, content] of charFiles) {
    if (content?.trim()) {
      const name = path.replace('characters/', '').replace('.md', '');
      parts.push({
        role: 'context',
        priority: 1,
        content: `## Character: ${name}\n\n${content}`,
        label: `Character: ${name}`,
      });
    }
  }

  // 4. Previous chapters (with progressive summarization)
  for (let i = 1; i < chapterNum; i++) {
    const chapterPath = `story/chapter-${i}.md`;
    const chapterContent = files[chapterPath];
    const summaryPath = `story/chapter-${i}-summary.md`;
    const summaryContent = files[summaryPath];

    if (i >= chapterNum - 2) {
      // N-1 and N-2: include full text
      if (chapterContent?.trim()) {
        parts.push({
          role: 'context',
          priority: 2,
          content: `## Chapter ${i} (Full Text)\n\n${chapterContent}`,
          label: `Chapter ${i}`,
        });
      }
    } else {
      // Earlier chapters: use summary if available, otherwise create brief reference
      const summary = summaryContent?.trim() || `[Chapter ${i} — summary not yet generated]`;
      parts.push({
        role: 'context',
        priority: 3,
        content: `## Chapter ${i} Summary\n\n${summary}`,
        label: `Chapter ${i} Summary`,
      });
    }
  }

  // 5. Chapter notes if available
  const notesPath = `story/chapter-${chapterNum}-notes.md`;
  if (files[notesPath]?.trim()) {
    parts.push({
      role: 'context',
      priority: 1,
      content: `## Notes for Chapter ${chapterNum}\n\n${files[notesPath]}`,
      label: `Chapter ${chapterNum} Notes`,
    });
  }

  // 6. Feedback files
  const feedbackFiles = Object.entries(files)
    .filter(([path]) => path.startsWith('feedback/'));

  for (const [path, content] of feedbackFiles) {
    if (content?.trim()) {
      parts.push({
        role: 'context',
        priority: 4,
        content: `## Feedback: ${path}\n\n${content}`,
        label: path,
      });
    }
  }

  // Token budgeting — trim from highest priority number (most trimmable) first
  let totalTokens = parts.reduce((sum, p) => sum + estimateTokens(p.content), 0);
  const reserveForGeneration = Math.min(maxTokens * 0.3, 30000); // Reserve 30% or 30k for output

  if (totalTokens > maxTokens - reserveForGeneration) {
    // Sort by priority (higher number = trim first)
    const trimmable = parts.filter(p => p.priority >= 3).sort((a, b) => b.priority - a.priority);

    for (const part of trimmable) {
      if (totalTokens <= maxTokens - reserveForGeneration) break;
      const tokens = estimateTokens(part.content);
      totalTokens -= tokens;
      trimmed.push(part.label);
      part.content = `[${part.label} — trimmed for context limits]`;
    }
  }

  // 7. Assemble into messages
  const systemContent = parts
    .filter(p => p.role === 'system')
    .map(p => p.content)
    .join('\n\n');

  const contextContent = parts
    .filter(p => p.role === 'context')
    .map(p => p.content)
    .join('\n\n---\n\n');

  const messages = [
    { role: 'system', content: systemContent },
    {
      role: 'user',
      content: `${contextContent}\n\n---\n\n## TASK\n\nWrite Chapter ${chapterNum} of this story. Follow the outline, maintain voice consistency with the narrator profile, and respect all character arcs and world rules. The chapter should advance the plot while deepening character relationships.\n\nOutput only the chapter prose. No meta-commentary.`,
    },
  ];

  return {
    messages,
    tokenCount: totalTokens,
    maxTokens,
    trimmed,
    partsIncluded: parts.length - trimmed.length,
  };
}

/**
 * Build context for a chat message (Story Assistant, Editor, Talk to Character)
 */
export function buildChatContext(files, chatHistory, options = {}) {
  const { persona = 'assistant', characterName = null, scope = 'full-project' } = options;

  let systemPrompt = GOLDEN_RULES + '\n\n';

  switch (persona) {
    case 'assistant':
      systemPrompt += `You are the Story Assistant for the Serendipity Engine. You help the author with brainstorming, structural questions, and creative decisions. You have access to the full project architecture.\n\n`;
      break;
    case 'editor':
      systemPrompt += `You are the Editor persona for the Serendipity Engine. You provide constructive feedback on prose quality, structural integrity, and craft. You are supportive but rigorous.\n\n`;
      break;
    case 'character':
      systemPrompt += `You are ${characterName}, a character in this story. Respond in character. You have complete self-awareness of your own character file but limited knowledge of others — you know them only through observed behavior and your relationship with them. If asked about your narrative role, you can reflect on it honestly. If there are gaps in your knowledge, say so and invite the author to help fill them in.\n\n`;
      break;
  }

  // Add relevant context based on scope
  if (scope === 'full-project') {
    if (files['author.md']?.trim()) systemPrompt += `## Author\n${files['author.md']}\n\n`;
    if (files['narrator.md']?.trim()) systemPrompt += `## Narrator\n${files['narrator.md']}\n\n`;
    if (files['outline.md']?.trim()) systemPrompt += `## Outline\n${files['outline.md']}\n\n`;
  }

  if (persona === 'character' && characterName) {
    // Find the character file
    const charFiles = Object.entries(files)
      .filter(([path]) => path.startsWith('characters/') && path.endsWith('.md'));

    for (const [path, content] of charFiles) {
      if (path.toLowerCase().includes(characterName.toLowerCase())) {
        systemPrompt += `## Your Character File (Complete Self-Knowledge)\n${content}\n\n`;
      }
    }

    // Add relationship context (limited)
    if (files['relationships/questions-answered.md']?.trim()) {
      systemPrompt += `## Relationships (What You Observe)\n${files['relationships/questions-answered.md']}\n\n`;
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
  ];

  return { messages, tokenCount: estimateTokens(systemPrompt) };
}

/**
 * Build pre-flight checklist context
 */
export function buildPreFlightContext(files, chapterNum) {
  return {
    messages: [
      {
        role: 'system',
        content: GOLDEN_RULES + `\n\nYou are running a pre-flight checklist before generating Chapter ${chapterNum}. Check for:\n1. Continuity — any unresolved contradictions?\n2. Character consistency — do character states match the outline?\n3. Thread tracking — are all active threads accounted for?\n4. Tone target — is the planned tone consistent with the tonal arc?\n\nRespond with a structured checklist showing PASS/WARNING/FAIL for each item.`,
      },
      {
        role: 'user',
        content: `Project files context:\n\n${Object.entries(files)
          .filter(([_, v]) => v?.trim())
          .map(([k, v]) => `## ${k}\n${v.slice(0, 500)}${v.length > 500 ? '...' : ''}`)
          .join('\n\n')
        }`,
      },
    ],
  };
}
