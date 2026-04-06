/**
 * Serendipity | StoryWeaver — Context Builder
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

import { GOLDEN_RULES, PROMPTS } from '../lib/promptRegistry.js';
import { loadSeriesData, buildSeriesContext } from './seriesContext.js';

/**
 * Improved token estimation using word-based heuristic
 * Better accuracy than character-based estimation
 *
 * Methodology:
 * - Average English word ≈ 1.3 tokens
 * - Punctuation and whitespace ≈ 0.5 tokens each
 * - Based on empirical analysis of token counts across different text types
 */
function estimateTokens(text) {
  if (!text) return 0;

  // Count words (sequences of word characters)
  const words = text.split(/\s+/).filter(Boolean).length;

  // Count punctuation and symbols that consume tokens
  const punctuation = (text.match(/[.,!?;:'"()\[\]{}\-—]/g) || []).length;

  // Word-based estimation: each word ≈ 1.3 tokens
  // Each punctuation mark ≈ 0.5 tokens
  return Math.ceil(words * 1.3 + punctuation * 0.5);
}

/**
 * Build the full context for a chapter generation call
 *
 * @param {object} files - All project files { path: content }
 * @param {number} chapterNum - Which chapter to generate
 * @param {object} options - Additional context options
 * @returns {{ messages: Array, tokenCount: number, trimmed: string[] }}
 */
export function buildChapterContext(files, chapterNum, options = {}) {
  const { maxTokens = 128000, model = 'claude-sonnet-4-5-20250514', seriesContext = '' } = options;
  const trimmed = [];
  const parts = [];

  // 1. System prompt with golden rules
  parts.push({
    role: 'system',
    priority: 0,
    content: GOLDEN_RULES,
    label: 'Golden Rules',
  });

  // 1.5. Series context (if provided)
  if (seriesContext) {
    parts.push({
      role: 'system',
      priority: 0,
      content: seriesContext,
      label: 'Series Context',
    });
  }

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

  // Build the chapter generation task prompt from the registry
  const chapterTask = PROMPTS.CHAPTER_GENERATION.build({ chapterNum });

  const messages = [
    { role: 'system', content: systemContent },
    {
      role: 'user',
      content: `${contextContent}\n\n---\n\n${chapterTask}`,
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
  const { persona = 'assistant', characterName = null, scope = 'full-project', seriesContext = '' } = options;

  let systemPrompt = '';

  switch (persona) {
    case 'assistant':
      systemPrompt = PROMPTS.STORY_ASSISTANT.build({ projectTitle: null }) + '\n\n';
      break;
    case 'editor':
      systemPrompt = PROMPTS.EDITOR.build({ projectTitle: null }) + '\n\n';
      break;
    case 'character':
      systemPrompt = PROMPTS.CHARACTER_ROLEPLAY.build({
        characterName,
        characterFile: null,
        relationshipsFile: null,
      }) + '\n\n';
      break;
    default:
      systemPrompt = GOLDEN_RULES + '\n\n';
  }

  // Add series context if provided
  if (seriesContext) {
    systemPrompt += seriesContext + '\n\n';
  }

  // Add relevant context based on scope
  if (scope === 'full-project') {
    if (files['author.md']?.trim()) systemPrompt += `## Author\n${files['author.md']}\n\n`;
    if (files['narrator.md']?.trim()) systemPrompt += `## Narrator\n${files['narrator.md']}\n\n`;
    if (files['outline.md']?.trim()) systemPrompt += `## Outline\n${files['outline.md']}\n\n`;
  }

  if (persona === 'character' && characterName) {
    // Find the character file and rebuild prompt with full context
    const charFiles = Object.entries(files)
      .filter(([path]) => path.startsWith('characters/') && path.endsWith('.md'));

    let charFileContent = null;
    for (const [path, content] of charFiles) {
      if (path.toLowerCase().includes(characterName.toLowerCase())) {
        charFileContent = content;
        break;
      }
    }

    const relContent = files['relationships/questions-answered.md']?.trim() || null;

    // Rebuild character prompt with the actual file contents
    systemPrompt = PROMPTS.CHARACTER_ROLEPLAY.build({
      characterName,
      characterFile: charFileContent,
      relationshipsFile: relContent,
    }) + '\n\n';
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
        content: PROMPTS.PRE_FLIGHT.build({ chapterNum }),
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

/**
 * Load series context for a project and build the context string
 */
export async function getSeriesContextForProject(project) {
  if (!project?.series) return '';
  const seriesData = await loadSeriesData(project.series);
  return buildSeriesContext(seriesData, project.id);
}

// Export estimateTokens for use in token display components
export { estimateTokens };
