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
import { STORY_MEDIUMS } from '../lib/constants.js';

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

  const { onProgress, title: providedTitle, medium } = options;
  const cleanText = sourceText.trim();
  const metadata = {
    medium: medium || 'novel',
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
 * Re-decompose selected steps only, for an existing project.
 * Runs each selected step in pipeline order so dependencies are respected.
 * Returns the new files that should overwrite existing ones.
 *
 * @param {Function} sendMessage - LLM communication function
 * @param {string} sourceText - The full manuscript / source text
 * @param {string[]} stepKeys - Array of step keys to re-run (e.g. ['characters', 'characters-detail'])
 * @param {object} existingFiles - Current project files (used as context for dependent steps)
 * @param {object} options - { onProgress, title, medium }
 * @returns {{ files: { path: content }, metadata: { steps } }}
 */
export async function redecomposeSteps(sendMessage, sourceText, stepKeys, existingFiles = {}, options = {}) { // v2-fixed
  if (!sourceText?.trim()) {
    throw new Error('Source text is required for re-decomposition');
  }
  if (!stepKeys?.length) {
    throw new Error('No steps selected for re-decomposition');
  }

  const { onProgress, title, medium } = options;
  const cleanText = sourceText.trim();
  const metadata = {
    medium: medium || 'novel',
    wordCount: cleanText.split(/\s+/).length,
    title: title || extractTitleHeuristic(cleanText),
    sourceLength: cleanText.length,
    steps: [],
  };

  // Start with existing files as context — new results will overwrite matching paths
  const files = { ...existingFiles };
  const newFiles = {};

  // Filter to only the selected steps, but keep them in pipeline order
  const stepsToRun = DECOMPOSITION_STEPS.filter(s => stepKeys.includes(s.key));
  const totalSteps = stepsToRun.length;

  for (let i = 0; i < stepsToRun.length; i++) {
    const step = stepsToRun[i];

    try {
      if (onProgress) {
        onProgress({ step: step.key, label: step.label, completed: i, total: totalSteps });
      }

      const result = await decomposeStep(sendMessage, cleanText, step, files, metadata);

      // Merge into both running context and the new-files output
      Object.assign(files, result.files);
      Object.assign(newFiles, result.files);
      metadata.steps.push({
        key: step.key,
        label: step.label,
        success: true,
        fileCount: Object.keys(result.files).length,
      });
    } catch (err) {
      console.warn(`Re-decompose step ${step.key} failed:`, err);
      metadata.steps.push({
        key: step.key,
        label: step.label,
        success: false,
        error: err.message,
      });

      const placeholder = createPlaceholder(step.key);
      Object.assign(files, placeholder);
      Object.assign(newFiles, placeholder);
    }
  }

  if (onProgress) {
    onProgress({ step: 'complete', label: 'Complete', completed: totalSteps, total: totalSteps });
  }

  // Return only the newly generated files (not the full existing set)
  return { files: newFiles, metadata };
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

    case 'characters': {
      // Three-pass character extraction to ensure ALL characters are profiled:
      //   Pass 1: Lightweight name scan across the FULL text (short output, cheap)
      //   Pass 2: Batch profile generation — split the character list into batches
      //           of ~8 characters so no single LLM call runs out of output tokens
      //   Pass 3: Verification — check which characters from the scan were actually
      //           profiled and re-run any that were missed

      // --- Pass 1: Character name scan (FULL text, capped at 180k chars for safety) ---
      let characterList = '';
      let scanLines = [];
      try {
        // Cap source text for scan: 180k chars (~45k tokens) is plenty to catch all characters.
        // Very long novels may exceed context windows if sent in full.
        const scanSourceText = sourceText.length > 180000
          ? sourceText.substring(0, 180000) + '\n\n[... remaining text truncated for scan — all characters appearing before this point and referenced in dialogue/narration will be captured ...]'
          : sourceText;
        const scanPrompt = PROMPTS.DECOMPOSE_CHARACTERS_SCAN.build({ sourceText: scanSourceText });
        console.log('[Decomposition] Scan prompt length:', scanPrompt.length, 'chars (~', Math.round(scanPrompt.length / 4), 'tokens)');
        const scanResult = await sendMessage({
          messages: [{ role: 'user', content: scanPrompt }],
          role: 'analyst',
          maxTokens: 4000, // Generous — big casts with collectives + societies
        });
        console.log('[Decomposition] Scan result keys:', Object.keys(scanResult), 'success:', scanResult.success, 'content length:', scanResult.content?.length, 'error:', scanResult.error);
        if (scanResult.success && scanResult.content) {
          characterList = removeEmdashes(scanResult.content);
          console.log('[Decomposition] Raw scan response (first 800 chars):', characterList.substring(0, 800));

          // Strip code fence markers (```...```) that LLMs sometimes wrap output in
          const stripped = characterList
            .replace(/```[\w]*\n?/g, '')  // opening code fence
            .replace(/```/g, '');          // closing code fence

          // Primary parse: lines with pipe separator
          scanLines = stripped.split('\n').filter(l => l.trim() && l.includes('|'));

          // Fallback: if no pipe lines, try lines that look like character entries
          // (e.g. "Dorothy Gale - protagonist - Chapter 1" or "1. Dorothy Gale (protagonist)")
          if (scanLines.length === 0) {
            console.log('[Decomposition] No pipe-separated lines found, trying fallback parsing...');
            const allLines = stripped.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            // Try dash separator
            const dashLines = allLines.filter(l => l.includes(' - ') && !l.startsWith('#') && !l.startsWith('*'));
            if (dashLines.length >= 3) {
              // Convert "Name - tier - context" to "Name | tier | context"
              scanLines = dashLines.map(l => l.replace(/\s*-\s*/g, ' | '));
              console.log('[Decomposition] Fallback: converted dash-separated lines:', scanLines.length);
            }
          }

          // Fallback 2: numbered or bulleted list lines with parenthetical tiers
          if (scanLines.length === 0) {
            const listLines = stripped.split('\n')
              .map(l => l.trim())
              .filter(l => /^[\d\-\*\•]+[\.\)]\s+\w/.test(l) || /^[A-Z][\w\s]+\(/.test(l));
            if (listLines.length >= 3) {
              // Try to extract "Name (tier)" pattern and convert to pipe format
              scanLines = listLines.map(l => {
                const clean = l.replace(/^[\d\-\*\•]+[\.\)]\s*/, '');
                const tierMatch = clean.match(/^(.+?)\s*\((\w+)\)\s*[,\-—]?\s*(.*)/);
                if (tierMatch) return `${tierMatch[1].trim()} | ${tierMatch[2]} | ${tierMatch[3] || ''}`;
                return clean.includes('|') ? clean : null;
              }).filter(Boolean);
              console.log('[Decomposition] Fallback 2: converted list lines:', scanLines.length);
            }
          }

          // Clean up scan lines — remove any that are headers, blank, or metadata
          scanLines = scanLines.filter(l => {
            const trimmed = l.trim();
            if (!trimmed) return false;
            if (trimmed.startsWith('#')) return false;
            if (trimmed.startsWith('---')) return false;
            if (/^(example|note|where|output|format)/i.test(trimmed)) return false;
            // Must have at least one letter (filter out pure separator lines)
            return /[a-zA-Z]/.test(trimmed);
          });

          console.log('[Decomposition] Character scan found:', scanLines.length, 'characters');
          if (scanLines.length > 0 && scanLines.length <= 3) {
            console.log('[Decomposition] Scan lines:', scanLines);
          }
        } else {
          console.warn('[Decomposition] Scan returned empty or failed:', scanResult.error || 'empty content');
        }
      } catch (scanErr) {
        console.warn('[Decomposition] Character scan pass failed, proceeding with single-pass:', scanErr);
      }

      // --- Pass 2: Batched character profiles ---
      // Why batching? When there are 15+ characters and the template is deep (voice
      // fingerprint, MBTI, wound/flaw/virtue, etc.), a single LLM call can run out of
      // output tokens and silently drop characters at the end. Minor characters are
      // sorted last, so they get dropped first. By batching into groups of ~8,
      // every character gets profiled even on weaker models.
      const BATCH_SIZE = 8; // Characters per batch — balances depth vs API calls
      const allCharacterFiles = {};

      if (scanLines.length > 0) {
        // Split scan lines into batches
        const batches = [];
        for (let i = 0; i < scanLines.length; i += BATCH_SIZE) {
          batches.push(scanLines.slice(i, i + BATCH_SIZE));
        }
        console.log(`[Decomposition] Processing ${scanLines.length} characters in ${batches.length} batch(es)`);

        for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
          const batch = batches[batchIdx];
          const batchList = batch.join('\n');
          const batchPrompt = buildCharacterProfilesPrompt(sourceText, batchList);

          // Token budget: generous per-character allocation since batch is small
          const batchMaxTokens = Math.min(16000, Math.max(4000, batch.length * 1500));

          console.log(`[Decomposition] Batch ${batchIdx + 1}/${batches.length}: ${batch.length} characters, maxTokens=${batchMaxTokens}`);

          try {
            const batchResult = await sendMessage({
              messages: [{ role: 'user', content: batchPrompt }],
              role: 'analyst',
              maxTokens: batchMaxTokens,
            });
            if (batchResult.success) {
              const cleaned = removeEmdashes(batchResult.content);
              const batchFiles = parseCharacterMarkdown(cleaned);
              Object.assign(allCharacterFiles, batchFiles);
              console.log(`[Decomposition] Batch ${batchIdx + 1} produced ${Object.keys(batchFiles).length} character files`);
            } else {
              console.warn(`[Decomposition] Batch ${batchIdx + 1} failed:`, batchResult.error);
            }
          } catch (batchErr) {
            console.warn(`[Decomposition] Batch ${batchIdx + 1} error:`, batchErr);
          }
        }
      } else {
        // Fallback: no scan results — single-pass with full text
        console.log('[Decomposition] No scan results — running single-pass character extraction');
        prompt = buildCharacterProfilesPrompt(sourceText, '');
        const fallbackResult = await sendMessage({
          messages: [{ role: 'user', content: prompt }],
          role: 'analyst',
          maxTokens: 16000,
        });
        if (fallbackResult.success) {
          const cleaned = removeEmdashes(fallbackResult.content);
          Object.assign(allCharacterFiles, parseCharacterMarkdown(cleaned));
        } else {
          throw new Error(fallbackResult.error || 'Character profile extraction failed');
        }
      }

      // --- Pass 3: Verification — catch any missed characters ---
      if (scanLines.length > 0) {
        const profiledSlugs = new Set(Object.keys(allCharacterFiles).map(p =>
          p.replace('characters/', '').replace('.md', '')
        ));

        // Check each scan line character against profiled files
        const missed = scanLines.filter(line => {
          const namePart = line.split('|')[0].trim();
          const slug = namePart.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          // Check if any profiled slug contains this slug or vice versa
          return ![...profiledSlugs].some(ps => ps.includes(slug) || slug.includes(ps) || ps === slug);
        });

        if (missed.length > 0) {
          console.log(`[Decomposition] Verification found ${missed.length} missed characters, running recovery batch:`, missed.map(l => l.split('|')[0].trim()));
          const recoveryList = missed.join('\n');
          const recoveryPrompt = buildCharacterProfilesPrompt(sourceText, recoveryList);
          const recoveryMaxTokens = Math.min(16000, Math.max(4000, missed.length * 1500));

          try {
            const recoveryResult = await sendMessage({
              messages: [{ role: 'user', content: recoveryPrompt }],
              role: 'analyst',
              maxTokens: recoveryMaxTokens,
            });
            if (recoveryResult.success) {
              const cleaned = removeEmdashes(recoveryResult.content);
              const recoveryFiles = parseCharacterMarkdown(cleaned);
              Object.assign(allCharacterFiles, recoveryFiles);
              console.log(`[Decomposition] Recovery batch produced ${Object.keys(recoveryFiles).length} additional character files`);
            }
          } catch (recErr) {
            console.warn('[Decomposition] Recovery batch failed:', recErr);
          }
        } else {
          console.log('[Decomposition] Verification passed — all scanned characters have profiles');
        }
      }

      console.log(`[Decomposition] Total character files produced: ${Object.keys(allCharacterFiles).length}`);
      Object.assign(files, allCharacterFiles);
      break;
    }

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
      // Generate relationships/relationship-graph.json (JSON edges format)
      const charFileNames = Object.keys(previousFiles).filter(p => p.startsWith('characters/') && !p.includes('questions-answered'));
      const charSlugs = charFileNames.map(p => p.replace('characters/', '').replace('.md', ''));
      const charNames = charSlugs.map(slug =>
        slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      );
      console.log('[Decomposition] Relationship graph: building JSON for', charSlugs.length, 'characters:', charSlugs.slice(0, 5).join(', '));
      prompt = PROMPTS.DECOMPOSE_RELATIONSHIPS_DETAIL.build({
        sourceExcerpt: sourceText.substring(0, 5000),
        characterSlugs: charSlugs,
        characterNames: charNames,
        relSummary: (previousFiles['relationships/questions-answered.md'] || '').substring(0, 2000),
        title: metadata.title || 'this manuscript',
      });
      const rdResult = await sendMessage({
        messages: [{ role: 'user', content: prompt }],
        role: 'analyst',
        maxTokens: 4000,
      });
      console.log('[Decomposition] Relationship graph result: success=', rdResult.success, 'content length=', rdResult.content?.length);
      if (rdResult.success && rdResult.content) {
        const cleaned = removeEmdashes(rdResult.content);
        const graphJson = extractRelationshipJSON(cleaned, charSlugs);
        files['relationships/relationship-graph.json'] = JSON.stringify(graphJson, null, 2);
        console.log('[Decomposition] Relationship graph: extracted', graphJson.edges?.length || 0, 'edges');
      } else {
        console.warn('[Decomposition] Relationship graph LLM call failed:', rdResult.error || 'empty content');
        throw new Error(rdResult.error || 'Relationship graph generation failed (empty response)');
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
      // MECHANICAL SECTION SPLITTING — medium-aware detection of section boundaries
      // (chapters, acts, scenes, episodes, etc.) preserving original text exactly.
      // Falls back to LLM-based splitting only if no boundaries are found.
      const splitResult = splitSectionsMechanically(sourceText, metadata.medium);

      if (splitResult && Object.keys(splitResult.files).length >= 2) {
        // Mechanical split succeeded
        Object.assign(files, splitResult.files);
        // Store split metadata for the UI
        metadata.splitUnit = splitResult.unitLabel;
        metadata.splitSlug = splitResult.unitSlug;
        metadata.splitCount = Object.keys(splitResult.files).length;
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
          // Signal that manual splitting may be needed
          metadata.splitFailed = true;
          metadata.splitFailReason = chaptersResult.error || 'Could not detect section boundaries automatically';
          throw new Error('auto-split-failed');
        }
      }
      break;
    }

    default:
      throw new Error(`Unknown decomposition step: ${key}`);
  }

  return { files };
}

// ─── Mechanical Section Splitter ────────────────────────────────────────

/**
 * Section-type patterns keyed by medium.
 * Each medium defines an ordered list of pattern sets to try.
 * Each pattern set has: label (human-readable unit name), regex patterns
 * to match against each line, and an optional slug function for filenames.
 *
 * The splitter tries each pattern set in order for the given medium.
 * If a medium's patterns don't yield ≥ 2 sections, falls through to
 * the universal fallback set (chapters, parts, headings, dividers).
 */
const SPELLED_NUMBERS = 'One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|Twenty[- ]?(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine)|Thirty';
const ROMAN_NUMERALS = 'I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XVI{0,3}|XIX|XXI{0,3}|XXIV|XXVI{0,3}|XXIX|XXXI{0,3}';
const NUMERIC_ID = `(?:${ROMAN_NUMERALS}|\\d+|(?:${SPELLED_NUMBERS})[a-z]*)`;

/** Reusable base pattern builders */
const chapterPatterns = [
  { regex: new RegExp(`^#{0,4}\\s*(?:Chapter|CHAPTER)\\s*\\^?${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: /^#{1,4}\s*Chapter\s*$/i, numbered: false },
];

const actPatterns = [
  { regex: new RegExp(`^#{0,4}\\s*(?:ACT|Act)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: /^#{1,4}\s*(?:ACT|Act)\s*$/i, numbered: false },
];

const scenePatterns = [
  { regex: new RegExp(`^#{0,4}\\s*(?:SCENE|Scene)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: /^#{0,2}\s*(?:INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s+(.+)/i, numbered: false, isSlugline: true },
];

const episodePatterns = [
  { regex: new RegExp(`^#{0,4}\\s*(?:Episode|EPISODE|Ep\\.?)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: /^#{0,2}\s*(?:COLD OPEN|TEASER|PREVIOUSLY ON)\s*$/i, numbered: false },
];

const partPatterns = [
  { regex: new RegExp(`^#{0,4}\\s*(?:Part|PART)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
];

const pagePatterns = [
  { regex: new RegExp(`^#{0,4}\\s*(?:Page|PAGE)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: new RegExp(`^#{0,4}\\s*(?:Issue|ISSUE)\\s*#?\\s*${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: new RegExp(`^#{0,4}\\s*(?:Panel|PANEL)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
];

const passagePatterns = [
  { regex: /^::\s*(.+)/, numbered: false, isPassage: true },
  { regex: /^#{1,4}\s*(?:Node|Choice|Path|Branch)\s*[:\-]\s*(.*)/i, numbered: false },
];

const sectionPatterns = [
  { regex: new RegExp(`^#{1,4}\\s*(?:Section|SECTION)\\s+${NUMERIC_ID}\\b[.:;\\s—\\-]*(.*)`, 'i'), numbered: true },
  { regex: new RegExp(`^#{1,4}\\s+(${ROMAN_NUMERALS})\\.?\\s+(.*)`, 'i'), numbered: true },
];

const dividerPatterns = [
  { regex: /^\s*(?:\*\s*\*\s*\*|\*{3,}|-{3,}|={3,}|§|♦|#)\s*$/, numbered: false, isDivider: true },
];

/**
 * Medium → prioritised pattern sets to try.
 * Each entry is { label, unitSlug, patterns[] }.
 * `unitSlug` is the singular noun used in filenames (e.g. "chapter" → chapter-01.md).
 */
const MEDIUM_PATTERNS = {
  'novel':           [
    { label: 'Chapter',  unitSlug: 'chapter',  patterns: chapterPatterns },
    { label: 'Part',     unitSlug: 'part',      patterns: partPatterns },
  ],
  'novella':         [
    { label: 'Chapter',  unitSlug: 'chapter',  patterns: chapterPatterns },
    { label: 'Part',     unitSlug: 'part',      patterns: partPatterns },
    { label: 'Section',  unitSlug: 'section',  patterns: sectionPatterns },
  ],
  'short-story':     [
    { label: 'Section',  unitSlug: 'section',  patterns: sectionPatterns },
    { label: 'Part',     unitSlug: 'part',      patterns: partPatterns },
    { label: 'Break',    unitSlug: 'section',  patterns: dividerPatterns },
  ],
  'screenplay':      [
    { label: 'Act',      unitSlug: 'act',       patterns: actPatterns },
    { label: 'Scene',    unitSlug: 'scene',     patterns: scenePatterns },
  ],
  'tv-show':         [
    { label: 'Episode',  unitSlug: 'episode',  patterns: episodePatterns },
    { label: 'Act',      unitSlug: 'act',       patterns: actPatterns },
    { label: 'Scene',    unitSlug: 'scene',     patterns: scenePatterns },
  ],
  'stage-play':      [
    { label: 'Act',      unitSlug: 'act',       patterns: actPatterns },
    { label: 'Scene',    unitSlug: 'scene',     patterns: scenePatterns },
  ],
  'podcast':         [
    { label: 'Episode',  unitSlug: 'episode',  patterns: episodePatterns },
    { label: 'Segment',  unitSlug: 'segment',  patterns: sectionPatterns },
  ],
  'graphic-novel':   [
    { label: 'Page',     unitSlug: 'page',      patterns: pagePatterns },
    { label: 'Chapter',  unitSlug: 'chapter',  patterns: chapterPatterns },
  ],
  'interactive':     [
    { label: 'Passage',  unitSlug: 'passage',  patterns: passagePatterns },
    { label: 'Chapter',  unitSlug: 'chapter',  patterns: chapterPatterns },
  ],
  'essay':           [
    { label: 'Section',  unitSlug: 'section',  patterns: sectionPatterns },
    { label: 'Part',     unitSlug: 'part',      patterns: partPatterns },
  ],
};

/** Universal fallback order (tried after medium-specific patterns) */
const UNIVERSAL_FALLBACK = [
  { label: 'Chapter',  unitSlug: 'chapter',  patterns: chapterPatterns },
  { label: 'Part',     unitSlug: 'part',      patterns: partPatterns },
  { label: 'Act',      unitSlug: 'act',       patterns: actPatterns },
  { label: 'Scene',    unitSlug: 'scene',     patterns: scenePatterns },
  { label: 'Episode',  unitSlug: 'episode',  patterns: episodePatterns },
  { label: 'Section',  unitSlug: 'section',  patterns: sectionPatterns },
  { label: 'Break',    unitSlug: 'section',  patterns: dividerPatterns },
];

/**
 * Scan lines for boundaries using a set of regex patterns.
 * Returns array of { lineNum, title, isDivider } or empty array.
 */
function findBoundaries(lines, patterns) {
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');
    for (const pat of patterns) {
      if (pat.isDivider) {
        if (pat.regex.test(line)) {
          hits.push({ lineNum: i, title: '', isDivider: true });
          break;
        }
        continue;
      }
      const m = line.match(pat.regex);
      if (m) {
        let title = '';
        if (pat.isSlugline || pat.isPassage) {
          title = m[1]?.trim() || '';
        } else if (pat.numbered && m[m.length - 1]) {
          title = m[m.length - 1].trim();
        }
        // Look ahead for a title on the next few lines if none found inline
        if (!title) {
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const titleMatch = lines[j].replace(/\r$/, '').match(/^#{1,5}\s+(.+)/);
            if (titleMatch) {
              title = titleMatch[1].trim();
              break;
            }
          }
        }
        hits.push({ lineNum: i, title, isDivider: false });
        break;
      }
    }
  }
  return hits;
}

/**
 * Split source text at the given boundary lines.
 * Returns object of { 'story/{unitSlug}-N.md': content }.
 */
function splitAtBoundaries(lines, boundaries, unitLabel, unitSlug) {
  const files = {};
  for (let c = 0; c < boundaries.length; c++) {
    const num = c + 1;
    const startLine = boundaries[c].lineNum;
    const endLine = c + 1 < boundaries.length ? boundaries[c + 1].lineNum : lines.length;

    // For divider splits, include the content AFTER the divider
    const bodyStart = boundaries[c].isDivider ? startLine + 1 : startLine;
    const sectionLines = lines.slice(bodyStart, endLine);

    // Strip leading header lines from non-divider sections
    const bodyLines = [];
    let pastHeaders = false;
    for (let k = 0; k < sectionLines.length; k++) {
      const cl = sectionLines[k].replace(/\r$/, '');
      if (!pastHeaders && !boundaries[c].isDivider) {
        if (/^#{1,5}\s/.test(cl) || /^\s*(?:INT\.|EXT\.)/i.test(cl) || /^::\s/.test(cl) || cl.trim() === '') {
          if (/^#{1,5}\s+\S/.test(cl) && !/^#{1,4}\s*(?:Chapter|Part|Act|Scene|Episode|Section)/i.test(cl)) {
            pastHeaders = true;
          }
          continue;
        }
      }
      pastHeaders = true;
      bodyLines.push(sectionLines[k]);
    }

    const body = bodyLines.join('\n').trim();
    const titlePart = boundaries[c].title ? `: ${boundaries[c].title}` : '';
    const padded = String(num).padStart(2, '0');
    files[`story/${unitSlug}-${padded}.md`] = `# ${unitLabel} ${num}${titlePart}\n\n${body}`;
  }
  return files;
}

/**
 * Detect existing section boundaries in a manuscript and split at those points.
 * This is a MECHANICAL operation — no LLM is used. We scan for header patterns
 * appropriate to the story's medium, falling back to universal patterns.
 *
 * @param {string} sourceText - The full manuscript text
 * @param {string} [medium] - Story medium key (e.g. 'novel', 'screenplay', 'stage-play')
 * @returns {{ files: Object, unitLabel: string, unitSlug: string }|null}
 *   Map of file paths to section content, plus the unit label/slug used.
 *   Returns null if fewer than 2 sections detected.
 */
export function splitSectionsMechanically(sourceText, medium) {
  if (!sourceText) return null;

  const lines = sourceText.split('\n');

  // Build the ordered list of pattern sets to try
  const mediumSets = MEDIUM_PATTERNS[medium] || [];
  const fallbackSets = UNIVERSAL_FALLBACK.filter(
    fb => !mediumSets.some(ms => ms.unitSlug === fb.unitSlug)
  );
  const allSets = [...mediumSets, ...fallbackSets];

  for (const pset of allSets) {
    const boundaries = findBoundaries(lines, pset.patterns);
    if (boundaries.length >= 2) {
      const files = splitAtBoundaries(lines, boundaries, pset.label, pset.unitSlug);
      return { files, unitLabel: pset.label, unitSlug: pset.unitSlug };
    }
  }

  return null;
}

/** Backward-compat alias used internally */
function splitChaptersMechanically(sourceText) {
  const result = splitSectionsMechanically(sourceText, 'novel');
  return result ? result.files : null;
}

/**
 * Get the section unit info for a given medium.
 * Used by the UI to label manual split sections.
 */
export function getSectionUnitForMedium(medium) {
  const sets = MEDIUM_PATTERNS[medium];
  if (sets && sets.length > 0) {
    return { label: sets[0].label, slug: sets[0].unitSlug };
  }
  return { label: 'Chapter', slug: 'chapter' };
}

/**
 * Get all available section types for the manual splitter.
 * Returns the medium-specific types first, then universal ones.
 */
export function getAvailableSectionTypes(medium) {
  const mediumSets = MEDIUM_PATTERNS[medium] || [];
  const seen = new Set(mediumSets.map(s => s.unitSlug));
  const result = mediumSets.map(s => ({ label: s.label, slug: s.unitSlug }));

  for (const fb of UNIVERSAL_FALLBACK) {
    if (!seen.has(fb.unitSlug)) {
      seen.add(fb.unitSlug);
      result.push({ label: fb.label, slug: fb.unitSlug });
    }
  }
  return result;
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

function buildCharacterProfilesPrompt(sourceText, characterList = '') {
  // Send as much of the source text as possible so the LLM can write accurate profiles.
  // The character scan list (pass 1) ensures we know WHO to profile even if the excerpt
  // doesn't show every character.
  //
  // Strategy:
  // - Short texts (<60k chars / ~15k tokens): send everything
  // - Medium texts (60k-200k): send everything (fits in Claude/GPT-4 context easily)
  // - Very long texts (200k+): send first 180k chars (~45k tokens) which is still most of the book
  //   The name scan already caught all characters, so even if the tail is trimmed,
  //   the LLM has the checklist to work from.
  const maxExcerpt = 180000; // ~45k tokens — fits comfortably in 200k context with prompt overhead
  const excerpt = sourceText.length <= maxExcerpt
    ? sourceText
    : sourceText.substring(0, maxExcerpt) + '\n\n[... text truncated for length — all characters were identified in the scan above ...]';

  return PROMPTS.DECOMPOSE_CHARACTERS.build({
    sourceExcerpt: excerpt,
    characterList: characterList || '',
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
- Relationship graph: ${(previousFiles['relationships/relationship-graph.json'] || previousFiles['relationships/relationship-graph.csv']) ? 'yes' : 'no'}
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

  // Strip markdown code fences (```markdown ... ``` or ``` ... ```)
  let cleaned = content.replace(/^```(?:markdown|md)?\s*\n/gm, '').replace(/^```\s*$/gm, '').trim();

  // Try splitting by ## (h2) first — this is the expected format
  let sections = cleaned.split(/^## /m).slice(1);

  // Fallback: if no ## sections found, try # (h1) — skip any "# Characters" header
  if (sections.length === 0) {
    const h1Parts = cleaned.split(/^# /m).slice(1);
    // Filter out meta-headers like "# Characters", "# Cast", "# Character Profiles"
    sections = h1Parts.filter(s => {
      const firstLine = s.split('\n')[0].trim().toLowerCase();
      return !['characters', 'cast', 'character profiles', 'character list'].includes(firstLine);
    });
  }

  // Fallback: try ### (h3) if nothing else matched
  if (sections.length === 0) {
    sections = cleaned.split(/^### /m).slice(1);
  }

  if (sections.length === 0) {
    console.warn('[parseCharacterMarkdown] Could not find any character sections in LLM output. First 500 chars:', cleaned.substring(0, 500));
  }

  sections.forEach((section) => {
    const lines = section.split('\n');
    let charName = lines[0].trim();
    if (!charName) return; // skip empty sections

    // Strip trailing dash-separated suffixes like " — Character Decomposition", " - Literary Analysis"
    charName = charName.replace(/\s*[—–]+\s*(Character Decomposition|Literary Analy\w+|Deep Character Extraction|Character Extraction|Character Census).*$/i, '').trim();

    // Strip parenthetical aliases/type markers for the filename slug (keep in content)
    // "Elphaba Thropp (The Wicked Witch of the West)" → "Elphaba Thropp"
    // "The Land of Oz (Society)" → "The Land of Oz"
    // "The Munchkins (Collective)" → "The Munchkins"
    const nameForSlug = charName.replace(/\s*\(.*?\)\s*/g, '').trim();
    const safeName = (nameForSlug || charName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!safeName) return; // skip if name produces empty slug

    // Determine the heading prefix to restore based on which split matched
    const rawFirstLine = lines[0].trim();
    const headingPrefix = cleaned.includes(`## ${rawFirstLine}`) ? '## ' :
                          cleaned.includes(`# ${rawFirstLine}`) ? '# ' :
                          cleaned.includes(`### ${rawFirstLine}`) ? '### ' : '## ';

    // Replace the raw first line with the cleaned charName in the stored content
    const cleanedSection = charName + section.slice(rawFirstLine.length);
    files[`characters/${safeName}.md`] = `${headingPrefix}${cleanedSection}`.trim();
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
    const padded = String(index + 1).padStart(2, '0');
    files[`story/chapter-${padded}.md`] = `# Chapter ${chapter}`.trim();
  });

  return files;
}

/**
 * Extract relationship graph JSON from an LLM response.
 * Handles: fenced JSON blocks, raw JSON, or falls back to building edges from text.
 */
function extractRelationshipJSON(content, validSlugs) {
  const VALID_TYPES = new Set(['family', 'friend', 'rival', 'authority', 'mentor', 'ally']);
  const slugSet = new Set(validSlugs);

  // Try to find fenced JSON block
  const fencedMatch = content.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const jsonStr = fencedMatch ? fencedMatch[1].trim() : content.trim();

  // Try to parse as JSON
  try {
    // Find the first { ... } in the string (handles LLM prose before/after)
    const braceStart = jsonStr.indexOf('{');
    const braceEnd = jsonStr.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd > braceStart) {
      const parsed = JSON.parse(jsonStr.substring(braceStart, braceEnd + 1));
      const rawEdges = parsed.edges || parsed.relationships || [];

      // Validate and clean each edge
      const edges = rawEdges
        .filter(e => e && e.from && e.to && e.from !== e.to)
        .map(e => ({
          from: e.from.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
          to: e.to.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''),
          type: VALID_TYPES.has(e.type) ? e.type : 'ally',
          strength: Math.max(1, Math.min(5, parseInt(e.strength) || 3)),
          description: (e.description || '').substring(0, 300),
        }))
        // Deduplicate edges (keep first occurrence per pair)
        .filter((edge, idx, arr) => {
          const pairKey = [edge.from, edge.to].sort().join('|');
          return idx === arr.findIndex(e2 => [e2.from, e2.to].sort().join('|') === pairKey);
        });

      // Warn about unrecognized slugs (helps debugging)
      const usedSlugs = new Set(edges.flatMap(e => [e.from, e.to]));
      const unknown = [...usedSlugs].filter(s => !slugSet.has(s));
      if (unknown.length > 0) {
        console.warn('[Decomposition] Relationship graph has unknown slugs:', unknown,
          '— will attempt fuzzy matching at render time');
      }

      console.log('[Decomposition] Parsed', edges.length, 'valid edges from JSON');
      return { edges };
    }
  } catch (parseErr) {
    console.warn('[Decomposition] JSON parse failed:', parseErr.message);
  }

  // Fallback: return empty graph
  console.warn('[Decomposition] Could not extract relationship JSON from LLM response');
  return { edges: [] };
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
    'relationships-detail': { 'relationships/relationship-graph.json': '{"edges":[]}' },
    structure: { 'outline.md': '# Outline\n\n(Placeholder)', 'story/arc.md': '# Story Arc\n\n(Placeholder)' },
    'story-detail': {
      'story/questions-answered.md': '# Story - Questions Answered\n\n(Placeholder - decomposition step failed)',
      'abstract.md': '# Abstract\n\n(Placeholder - decomposition step failed)',
    },
    review: { 'dry-run-audit.md': '# Structural Review\n\n(Placeholder - decomposition step failed)' },
    chapters: { 'story/chapter-01.md': '# Chapter 1\n\n(Placeholder - decomposition step failed)' },
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
