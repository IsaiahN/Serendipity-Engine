/**
 * Serendipity Engine — Decomposition Engine
 *
 * Reverse-scaffolding: takes an existing story/manuscript and breaks it down
 * into the engine's 8-phase structure. This is used for:
 * - Analyzing existing works (Wizard of Oz example)
 * - Importing user manuscripts for editing
 * - Learning from published works
 *
 * The decomposition runs as a series of LLM calls, each extracting a different
 * dimension from the source text. After each analytical step, a follow-up
 * "detail" step generates the questions-answered and supplemental files that
 * mirror the Creations folder structure.
 *
 * Chapter splitting is done mechanically by detecting existing chapter headers
 * in the manuscript, preserving the original text exactly.
 */

import { removeEmdashes } from '../lib/randomEngine.js';
import { PROMPTS } from '../lib/promptRegistry.js';

/**
 * Define the decomposition pipeline steps.
 *
 * Each step maps to one or more output files. "Detail" steps generate the
 * questions-answered.md and supplemental files (hallmarks, relationship CSV,
 * abstract) that the reference decomposition folder expects.
 */
export const DECOMPOSITION_STEPS = [
  { key: 'author', label: 'Author Voice', phase: 1, description: 'Extract writing style and voice' },
  { key: 'narrator', label: 'Narrator Analysis', phase: 2, description: 'Identify narrator and perspective' },
  { key: 'world', label: 'World Building', phase: 3, description: 'Extract world details and setting' },
  { key: 'world-detail', label: 'World Detail', phase: 3, description: 'World hallmarks and questions' },
  { key: 'characters', label: 'Character Profiles', phase: 4, description: 'Profile major characters' },
  { key: 'characters-detail', label: 'Cast Questions', phase: 4, description: 'Cast-level questions answered' },
  { key: 'relationships', label: 'Relationships', phase: 5, description: 'Map character relationships' },
  { key: 'relationships-detail', label: 'Relationship Graph', phase: 5, description: 'Build relationship CSV matrix' },
  { key: 'structure', label: 'Story Structure', phase: 6, description: 'Extract plot arc and structure' },
  { key: 'story-detail', label: 'Story Detail', phase: 6, description: 'Story questions and abstract' },
  { key: 'review', label: 'Structural Review', phase: 7, description: 'Analyze and review structure' },
  { key: 'chapters', label: 'Chapter Split', phase: 8, description: 'Split manuscript into chapters' },
];

/**
 * Decompose an entire story/manuscript into Serendipity Engine project structure
 *
 * @param {Function} sendMessage - LLM communication function (returns { success, content, error })
 * @param {string} sourceText - The full manuscript text to decompose
 * @param {object} options - Configuration
 *   - title: Story title (extracted from sourceText if not provided)
 *   - onProgress: Callback function called after each step with { step, completed, total }
 * @returns {{ files: { path: content }, metadata: { title, wordCount, steps } }}
 */
export async function decomposeStory(sendMessage, sourceText, options = {}) {
  if (!sourceText?.trim()) {
    throw new Error('Source text is required for decomposition');
  }

  const { onProgress, title: providedTitle } = options;
  const cleanText = sourceText.trim();
  const metadata = {
    wordCount: cleanText.split(/\s+/).length,
    title: providedTitle || extractTitleHeuristic(cleanText),
    sourceLength: cleanText.length,
    steps: [],
  };

  const files = {};
  const totalSteps = DECOMPOSITION_STEPS.length;

  // Run each decomposition step in sequence
  for (let i = 0; i < DECOMPOSITION_STEPS.length; i++) {
    const step = DECOMPOSITION_STEPS[i];

    try {
      if (onProgress) {
        onProgress({ step: step.key, label: step.label, completed: i, total: totalSteps });
      }

      const result = await decomposeStep(sendMessage, cleanText, step, files, metadata);

      // Merge files and metadata from this step
      Object.assign(files, result.files);
      metadata.steps.push({
        key: step.key,
        label: step.label,
        success: true,
        fileCount: Object.keys(result.files).length,
      });
    } catch (err) {
      console.warn(`Decomposition step ${step.key} failed:`, err);
      metadata.steps.push({
        key: step.key,
        label: step.label,
        success: false,
        error: err.message,
      });

      // Continue to next step even if one fails
      // But create a minimal placeholder
      const placeholder = createPlaceholder(step.key);
      Object.assign(files, placeholder);
    }
  }

  if (onProgress) {
    onProgress({ step: 'complete', label: 'Complete', completed: totalSteps, total: totalSteps });
  }

  return { files, metadata };
}

/**
 * Run a single decomposition step
 *
 * @param {Function} sendMessage - LLM communication function
 * @param {string} sourceText - Full manuscript text
 * @param {object} step - Step definition { key, label, phase }
 * @param {object} previousFiles - Files generated by previous steps
 * @param {object} metadata - Metadata from previous steps
 * @returns {{ files: { path: content } }}
 */
export async function decomposeStep(sendMessage, sourceText, step, previousFiles = {}, metadata = {}) {
  const { key } = step;
  let prompt;
  const files = {};

  switch (key) {
    case 'author':
      prompt = buildAuthorVoicePrompt(sourceText);
      const authorResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 2000,
      });
      if (authorResult.success) {
        files['author.md'] = formatWithHeader(removeEmdashes(authorResult.content), '# Author Voice Profile');
      } else {
        throw new Error(authorResult.error || 'Author voice extraction failed');
      }
      break;

    case 'narrator':
      prompt = buildNarratorPrompt(sourceText);
      const narratorResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 1500,
      });
      if (narratorResult.success) {
        files['narrator.md'] = formatWithHeader(removeEmdashes(narratorResult.content), '# Narrator Analysis');
      } else {
        throw new Error(narratorResult.error || 'Narrator analysis failed');
      }
      break;

    case 'world':
      prompt = buildWorldBuildingPrompt(sourceText);
      const worldResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 2500,
      });
      if (worldResult.success) {
        files['world/world-building.md'] = formatWithHeader(removeEmdashes(worldResult.content), '# World Building');
      } else {
        throw new Error(worldResult.error || 'World building extraction failed');
      }
      break;

    case 'world-detail': {
      // Generate world/hallmarks.md and world/questions-answered.md
      const worldContent = previousFiles['world/world-building.md'] || '';
      prompt = PROMPTS.DECOMPOSE_WORLD_DETAIL.build({
        sourceExcerpt: sourceText.substring(0, 6000),
        worldSummary: worldContent.substring(0, 2000),
        title: metadata.title || 'this manuscript',
      });
      const wdResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 3000,
      });
      if (wdResult.success) {
        const cleaned = removeEmdashes(wdResult.content);
        const parsed = parseSplitResponse(cleaned, [
          { marker: /#{1,2}\s*(?:World\s+)?Hallmarks/i, file: 'world/hallmarks.md' },
          { marker: /#{1,2}\s*(?:World\s+)?(?:Building\s+)?Questions?\s*(?:Answered)?/i, file: 'world/questions-answered.md' },
        ]);
        if (parsed['world/hallmarks.md']) {
          files['world/hallmarks.md'] = parsed['world/hallmarks.md'];
        }
        if (parsed['world/questions-answered.md']) {
          files['world/questions-answered.md'] = parsed['world/questions-answered.md'];
        }
        // Fallback: if parsing didn't split, store as questions-answered
        if (!files['world/hallmarks.md'] && !files['world/questions-answered.md']) {
          files['world/questions-answered.md'] = formatWithHeader(cleaned, '# World Building - Questions Answered');
        }
      } else {
        throw new Error(wdResult.error || 'World detail extraction failed');
      }
      break;
    }

    case 'characters':
      prompt = buildCharacterProfilesPrompt(sourceText);
      const charsResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 3000,
      });
      if (charsResult.success) {
        const cleaned = removeEmdashes(charsResult.content);
        const characterFiles = parseCharacterMarkdown(cleaned);
        Object.assign(files, characterFiles);
      } else {
        throw new Error(charsResult.error || 'Character profile extraction failed');
      }
      break;

    case 'characters-detail': {
      // Generate characters/questions-answered.md (cast-level questions)
      const charFileNames = Object.keys(previousFiles).filter(p => p.startsWith('characters/') && p !== 'characters/questions-answered.md');
      const charNames = charFileNames.map(p => p.replace('characters/', '').replace('.md', '').replace(/-/g, ' '));
      prompt = PROMPTS.DECOMPOSE_CHARACTERS_DETAIL.build({
        sourceExcerpt: sourceText.substring(0, 5000),
        characterNames: charNames.join(', '),
        title: metadata.title || 'this manuscript',
      });
      const cdResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 2000,
      });
      if (cdResult.success) {
        files['characters/questions-answered.md'] = formatWithHeader(
          removeEmdashes(cdResult.content),
          '# Characters - Questions Answered (Cast-Level)'
        );
      } else {
        throw new Error(cdResult.error || 'Characters detail extraction failed');
      }
      break;
    }

    case 'relationships':
      prompt = buildRelationshipsPrompt(sourceText, previousFiles);
      const relResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 2000,
      });
      if (relResult.success) {
        files['relationships/questions-answered.md'] = formatWithHeader(
          removeEmdashes(relResult.content),
          '# Relationships - Questions Answered'
        );
      } else {
        throw new Error(relResult.error || 'Relationships extraction failed');
      }
      break;

    case 'relationships-detail': {
      // Generate relationships/relationship-graph.csv
      const charFileNames = Object.keys(previousFiles).filter(p => p.startsWith('characters/') && !p.includes('questions-answered'));
      const charNames = charFileNames.map(p => {
        const base = p.replace('characters/', '').replace('.md', '');
        return base.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      });
      prompt = PROMPTS.DECOMPOSE_RELATIONSHIPS_DETAIL.build({
        sourceExcerpt: sourceText.substring(0, 5000),
        characterNames: charNames,
        relSummary: (previousFiles['relationships/questions-answered.md'] || '').substring(0, 2000),
        title: metadata.title || 'this manuscript',
      });
      const rdResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 3000,
      });
      if (rdResult.success) {
        const cleaned = removeEmdashes(rdResult.content);
        // Extract CSV content - look for the CSV block
        const csvContent = extractCSVFromResponse(cleaned, charNames);
        files['relationships/relationship-graph.csv'] = csvContent;
      } else {
        throw new Error(rdResult.error || 'Relationship graph generation failed');
      }
      break;
    }

    case 'structure':
      prompt = buildStructurePrompt(sourceText);
      const structResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 2500,
      });
      if (structResult.success) {
        const cleaned = removeEmdashes(structResult.content);
        const structFiles = parseStructureMarkdown(cleaned);
        Object.assign(files, structFiles);
      } else {
        throw new Error(structResult.error || 'Structure extraction failed');
      }
      break;

    case 'story-detail': {
      // Generate story/questions-answered.md and abstract.md
      const outlineContent = previousFiles['outline.md'] || '';
      const arcContent = previousFiles['story/arc.md'] || '';
      prompt = PROMPTS.DECOMPOSE_STORY_DETAIL.build({
        sourceExcerpt: sourceText.substring(0, 5000),
        outlineSummary: outlineContent.substring(0, 2000),
        arcSummary: arcContent.substring(0, 1500),
        title: metadata.title || 'this manuscript',
      });
      const sdResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 2500,
      });
      if (sdResult.success) {
        const cleaned = removeEmdashes(sdResult.content);
        const parsed = parseSplitResponse(cleaned, [
          { marker: /#{1,2}\s*Abstract/i, file: 'abstract.md' },
          { marker: /#{1,2}\s*(?:Story\s+)?Questions?\s*(?:Answered)?/i, file: 'story/questions-answered.md' },
        ]);
        if (parsed['abstract.md']) {
          files['abstract.md'] = parsed['abstract.md'];
        }
        if (parsed['story/questions-answered.md']) {
          files['story/questions-answered.md'] = parsed['story/questions-answered.md'];
        }
        // Fallback: if no split was possible, store entire response
        if (!files['abstract.md'] && !files['story/questions-answered.md']) {
          files['story/questions-answered.md'] = formatWithHeader(cleaned, '# Story - Questions Answered');
          files['abstract.md'] = generateMinimalAbstract(metadata.title, cleaned);
        }
      } else {
        throw new Error(sdResult.error || 'Story detail extraction failed');
      }
      break;
    }

    case 'review':
      prompt = buildReviewPrompt(sourceText, previousFiles, metadata);
      const reviewResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 1500,
      });
      if (reviewResult.success) {
        files['dry-run-audit.md'] = formatWithHeader(removeEmdashes(reviewResult.content), '# Structural Review');
      } else {
        throw new Error(reviewResult.error || 'Structural review failed');
      }
      break;

    case 'chapters': {
      // MECHANICAL CHAPTER SPLITTING — detect existing chapter headers in the source text
      // and split at those boundaries, preserving original text exactly.
      // Falls back to LLM-based splitting only if no chapter headers are found.
      const mechanicalChapters = splitChaptersMechanically(sourceText);

      if (mechanicalChapters && Object.keys(mechanicalChapters).length >= 2) {
        // Mechanical split succeeded — use the detected chapters
        Object.assign(files, mechanicalChapters);
      } else {
        // Fallback: use LLM to split (limited by token count, best-effort)
        prompt = buildChapterSplitPrompt(sourceText, previousFiles['outline.md']);
        const chaptersResult = await sendMessage({
          messages: [{ role: 'user', content: prompt }],
          role: 'analyst',
          maxTokens: 4000,
        });
        if (chaptersResult.success) {
          const cleaned = removeEmdashes(chaptersResult.content);
          const chapterFiles = parseChapterMarkdown(cleaned);
          Object.assign(files, chapterFiles);
        } else {
          throw new Error(chaptersResult.error || 'Chapter split failed');
        }
      }
      break;
    }

    default:
      throw new Error(`Unknown decomposition step: ${key}`);
  }

  return { files };
}

// ─── Mechanical Chapter Splitter ────────────────────────────────────────

/**
 * Detect existing chapter boundaries in a manuscript and split at those points.
 * Handles a wide variety of chapter header formats:
 *   - "Chapter I", "CHAPTER 1", "Chapter One"
 *   - "# Chapter 1", "## Chapter I: The Title"
 *   - Roman numerals (I, II, III, IV, etc.)
 *   - Markdown headings that look like chapters
 *
 * @param {string} sourceText - The full manuscript text
 * @returns {Object|null} - Map of file paths to chapter content, or null if no chapters detected
 */
function splitChaptersMechanically(sourceText) {
  if (!sourceText) return null;

  // Strategy: find all lines that look like chapter boundaries, then split.
  // We handle many common formats:
  //   "# Chapter 1", "## Chapter I", "### Chapter" (unnumbered), "# Chapter^1"
  //   "Chapter 1: Title", "CHAPTER ONE", etc.
  // Also detect the title line that often follows on the next line (e.g. "#### The Cyclone")
  const lines = sourceText.split('\n');
  const chapterStarts = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');

    // Pattern A: "# Chapter^N", "# Chapter 1", "## Chapter IV", "CHAPTER ONE"
    const mNumbered = line.match(
      /^#{0,4}\s*(?:Chapter|CHAPTER)\s*\^?([IVXLCDM]+|\d+|(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|Twenty[- ]?(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine)|Thirty)[a-z]*)\b[.:\s—\-]*(.*)/i
    );

    // Pattern B: "### Chapter" or "# Chapter" with no number (sequential)
    const mUnnumbered = !mNumbered && /^#{1,4}\s*Chapter\s*$/i.test(line);

    if (mNumbered || mUnnumbered) {
      // Look for the chapter title on the next few non-empty lines
      let title = mNumbered && mNumbered[2] ? mNumbered[2].trim() : '';
      if (!title) {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const titleMatch = lines[j].replace(/\r$/, '').match(/^#{1,5}\s+(.+)/);
          if (titleMatch) {
            title = titleMatch[1].trim();
            break;
          }
        }
      }
      chapterStarts.push({ lineNum: i, title });
    }
  }

  if (chapterStarts.length < 2) return null;

  // Split text at chapter boundaries
  const files = {};
  for (let c = 0; c < chapterStarts.length; c++) {
    const chNum = c + 1;
    const startLine = chapterStarts[c].lineNum;
    const endLine = c + 1 < chapterStarts.length ? chapterStarts[c + 1].lineNum : lines.length;

    // Collect body lines, skipping the chapter header and title header
    const chapterLines = lines.slice(startLine, endLine);
    const bodyLines = [];
    let pastHeaders = false;
    for (let k = 0; k < chapterLines.length; k++) {
      const cl = chapterLines[k].replace(/\r$/, '');
      if (!pastHeaders && (
        /^#{1,4}\s*Chapter/i.test(cl) ||
        (/^#{1,5}\s+\S/.test(cl) && !/^#{1,4}\s*Chapter/i.test(cl)) ||
        cl.trim() === ''
      )) {
        if (/^#{1,5}\s+\S/.test(cl) && !/^#{1,4}\s*Chapter/i.test(cl)) {
          pastHeaders = true; // title found, everything after is body
        }
        continue;
      }
      pastHeaders = true;
      bodyLines.push(chapterLines[k]);
    }

    const body = bodyLines.join('\n').trim();
    const titlePart = chapterStarts[c].title ? `: ${chapterStarts[c].title}` : '';
    files[`story/chapter-${chNum}.md`] = `# Chapter ${chNum}${titlePart}\n\n${body}`;
  }

  return files;
}

// ─── Prompt Builders ────────────────────────────────────────────────────

function buildAuthorVoicePrompt(sourceText) {
  return PROMPTS.DECOMPOSE_AUTHOR.build({
    sourceExcerpt: sourceText.substring(0, 3000),
    sourceLength: sourceText.length,
  });
}

function buildNarratorPrompt(sourceText) {
  return PROMPTS.DECOMPOSE_NARRATOR.build({
    sourceExcerpt: sourceText.substring(0, 2000),
  });
}

function buildWorldBuildingPrompt(sourceText) {
  return PROMPTS.DECOMPOSE_WORLD.build({
    sourceExcerpt: sourceText.substring(0, 4000),
  });
}

function buildCharacterProfilesPrompt(sourceText) {
  return PROMPTS.DECOMPOSE_CHARACTERS.build({
    sourceExcerpt: sourceText.substring(0, 3500),
  });
}

function buildRelationshipsPrompt(sourceText, _previousFiles) {
  return PROMPTS.DECOMPOSE_RELATIONSHIPS.build({
    sourceExcerpt: sourceText.substring(0, 2500),
  });
}

function buildStructurePrompt(sourceText) {
  return PROMPTS.DECOMPOSE_STRUCTURE.build({
    sourceExcerpt: sourceText.substring(0, 5000),
  });
}

function buildReviewPrompt(sourceText, previousFiles, _metadata) {
  const analysisStatus = `- Author voice: ${previousFiles['author.md'] ? 'yes' : 'no'}
- Narrator: ${previousFiles['narrator.md'] ? 'yes' : 'no'}
- World building: ${previousFiles['world/world-building.md'] ? 'yes' : 'no'}
- World hallmarks: ${previousFiles['world/hallmarks.md'] ? 'yes' : 'no'}
- Character profiles: ${Object.keys(previousFiles).filter(p => p.startsWith('characters/') && !p.includes('questions-answered')).length || 0} files
- Characters questions-answered: ${previousFiles['characters/questions-answered.md'] ? 'yes' : 'no'}
- Relationships: ${previousFiles['relationships/questions-answered.md'] ? 'yes' : 'no'}
- Relationship graph: ${previousFiles['relationships/relationship-graph.csv'] ? 'yes' : 'no'}
- Story structure: ${previousFiles['outline.md'] || previousFiles['story/arc.md'] ? 'yes' : 'no'}
- Story questions-answered: ${previousFiles['story/questions-answered.md'] ? 'yes' : 'no'}
- Abstract: ${previousFiles['abstract.md'] ? 'yes' : 'no'}`;

  return PROMPTS.DECOMPOSE_REVIEW.build({
    sourceExcerpt: sourceText.substring(0, 2000),
    analysisStatus,
  });
}

function buildChapterSplitPrompt(sourceText, outlineContent) {
  return PROMPTS.DECOMPOSE_CHAPTERS.build({
    fullText: sourceText,
    outlineContent: outlineContent || null,
  });
}

// ─── Response Parsers ───────────────────────────────────────────────────

/**
 * Parse a combined LLM response into multiple files by detecting section markers.
 * Used when a single LLM call produces content for two or more output files.
 *
 * @param {string} content - The full LLM response
 * @param {Array} sections - Array of { marker: RegExp, file: string }
 * @returns {Object} - Map of file paths to content
 */
function parseSplitResponse(content, sections) {
  const result = {};
  const lines = content.split('\n');
  let currentFile = null;
  let currentLines = [];

  for (const line of lines) {
    // Check if this line matches any section marker
    let matched = false;
    for (const { marker, file } of sections) {
      if (marker.test(line)) {
        // Save previous section
        if (currentFile && currentLines.length > 0) {
          result[currentFile] = currentLines.join('\n').trim();
        }
        currentFile = file;
        currentLines = [line];
        matched = true;
        break;
      }
    }
    if (!matched) {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentFile && currentLines.length > 0) {
    result[currentFile] = currentLines.join('\n').trim();
  }

  return result;
}

function parseCharacterMarkdown(content) {
  const files = {};
  // Split by character sections
  const sections = content.split(/^## /m).slice(1);

  sections.forEach((section) => {
    const lines = section.split('\n');
    const charName = lines[0].trim();
    const safeName = charName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

    files[`characters/${safeName}.md`] = `## ${section}`.trim();
  });

  return files;
}

function parseStructureMarkdown(content) {
  const files = {};

  // Separate outline and arc from the response
  const outlineMatch = content.match(/^#+.*Outline[\s\S]*?(?=^#+|$)/m);
  const arcMatch = content.match(/^#+.*Arc[\s\S]*?(?=^#+|$)/m);

  if (outlineMatch) {
    files['outline.md'] = outlineMatch[0].trim();
  } else {
    files['outline.md'] = extractOutlineSection(content);
  }

  if (arcMatch) {
    files['story/arc.md'] = arcMatch[0].trim();
  } else {
    files['story/arc.md'] = extractArcSection(content);
  }

  return files;
}

function parseChapterMarkdown(content) {
  const files = {};
  const chapters = content.split(/^# Chapter /m).slice(1);

  chapters.forEach((chapter, index) => {
    const chapterNum = index + 1;
    files[`story/chapter-${chapterNum}.md`] = `# Chapter ${chapter}`.trim();
  });

  return files;
}

/**
 * Extract CSV content from an LLM response that may wrap it in fences or prose.
 */
function extractCSVFromResponse(content, characterNames) {
  // Try to find fenced CSV block first
  const fencedMatch = content.match(/```(?:csv)?\s*\n([\s\S]*?)\n```/);
  if (fencedMatch) return fencedMatch[1].trim();

  // Try to find lines that look like CSV (contain commas and character names)
  const lines = content.split('\n');
  const csvLines = [];
  let inCSV = false;

  for (const line of lines) {
    const commaCount = (line.match(/,/g) || []).length;
    // CSV rows typically have many commas; look for header row or data rows
    if (commaCount >= 2 && (line.includes('From/To') || line.includes('SELF') || characterNames.some(n => line.includes(n)))) {
      inCSV = true;
    }
    if (inCSV && commaCount >= 2) {
      csvLines.push(line);
    } else if (inCSV && commaCount < 2 && line.trim()) {
      // End of CSV block
      break;
    }
  }

  if (csvLines.length >= 2) return csvLines.join('\n');

  // Last resort: use the whole content
  return content.trim();
}

// ─── Markdown Formatters ────────────────────────────────────────────────

/**
 * Ensure content starts with a markdown heading. If it already has one, leave it.
 */
function formatWithHeader(content, defaultHeader) {
  let formatted = content.trim();
  if (!formatted.startsWith('#')) {
    formatted = `${defaultHeader}\n\n${formatted}`;
  }
  return formatted;
}

/**
 * Generate a minimal abstract when the LLM didn't produce a separate one.
 */
function generateMinimalAbstract(title, contextContent) {
  const firstParagraph = contextContent.split('\n\n').find(p => p.trim().length > 50) || '';
  return `# Abstract\n## *${title}*\n\n---\n\n## Short Description\n\n${firstParagraph.substring(0, 500).trim()}\n`;
}

// ─── Placeholders for Failed Steps ──────────────────────────────────────

function createPlaceholder(stepKey) {
  const placeholders = {
    author: { 'author.md': '# Author Voice\n\n(Placeholder - decomposition step failed)\n\nPlease manually fill in author voice details.' },
    narrator: { 'narrator.md': '# Narrator\n\n(Placeholder - decomposition step failed)\n\nPlease manually fill in narrator details.' },
    world: { 'world/world-building.md': '# World Building\n\n(Placeholder - decomposition step failed)\n\nPlease manually fill in world building details.' },
    'world-detail': {
      'world/questions-answered.md': '# World Building - Questions Answered\n\n(Placeholder - decomposition step failed)',
      'world/hallmarks.md': '# World Hallmarks\n\n(Placeholder - decomposition step failed)',
    },
    characters: { 'characters/placeholder.md': '# Characters\n\n(Placeholder - decomposition step failed)\n\nPlease manually add character files.' },
    'characters-detail': { 'characters/questions-answered.md': '# Characters - Questions Answered\n\n(Placeholder - decomposition step failed)' },
    relationships: { 'relationships/questions-answered.md': '# Relationships\n\n(Placeholder - decomposition step failed)\n\nPlease manually fill in relationship details.' },
    'relationships-detail': { 'relationships/relationship-graph.csv': 'From/To\n(Placeholder - decomposition step failed)' },
    structure: { 'outline.md': '# Outline\n\n(Placeholder)', 'story/arc.md': '# Story Arc\n\n(Placeholder)' },
    'story-detail': {
      'story/questions-answered.md': '# Story - Questions Answered\n\n(Placeholder - decomposition step failed)',
      'abstract.md': '# Abstract\n\n(Placeholder - decomposition step failed)',
    },
    review: { 'dry-run-audit.md': '# Structural Review\n\n(Placeholder - decomposition step failed)' },
    chapters: { 'story/chapter-1.md': '# Chapter 1\n\n(Placeholder - decomposition step failed)' },
  };

  return placeholders[stepKey] || {};
}

// ─── Helper Functions ────────────────────────────────────────────────

function extractTitleHeuristic(text) {
  // Try to find a title in first few lines
  const lines = text.split('\n').slice(0, 10);
  for (const line of lines) {
    const cleaned = line.replace(/^#+\s*/, '').trim();
    if (cleaned.length > 3 && cleaned.length < 100 && !cleaned.includes('.')) {
      return cleaned;
    }
  }
  return 'Untitled Manuscript';
}

function extractOutlineSection(content) {
  const lines = content.split('\n');
  const outline = [];
  let inOutline = false;

  for (const line of lines) {
    if (line.match(/outline|chapter|act/i)) {
      inOutline = true;
    }
    if (inOutline && (line.startsWith('-') || line.startsWith('*') || line.match(/^\d+\./))) {
      outline.push(line);
    }
  }

  return outline.length > 0 ? outline.join('\n') : '# Outline\n\n' + content.substring(0, 500);
}

function extractArcSection(content) {
  const lines = content.split('\n');
  const arc = [];
  const arcKeywords = ['inciting', 'rising', 'climax', 'falling', 'resolution'];

  for (const line of lines) {
    if (arcKeywords.some(kw => line.toLowerCase().includes(kw))) {
      arc.push(line);
    }
  }

  return arc.length > 0 ? arc.join('\n') : '# Story Arc\n\n' + content.substring(0, 500);
}
