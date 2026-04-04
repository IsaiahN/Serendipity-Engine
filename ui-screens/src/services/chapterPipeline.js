/**
 * Serendipity Engine — Chapter Generation Pipeline
 *
 * Implements the Phase 8 execution flow:
 *   Pre-flight checklist → Chapter generation → Post-flight checklist → Summary generation
 *
 * Each chapter is a major LLM event with full context loading.
 * Uses the contextBuilder for prompt assembly and the llmStore for API calls.
 */

import { buildChapterContext, buildPreFlightContext, getSeriesContextForProject } from './contextBuilder.js';
import { removeEmdashes } from '../lib/randomEngine.js';
import { PROMPTS } from '../lib/promptRegistry.js';

// ─── Pre-Flight Checklist ───────────────────────────────────────────────────

/**
 * Run pre-flight checks before generating a chapter.
 * Returns structured results the UI can display as a checklist.
 *
 * @param {Function} sendMessage - llmStore.sendMessage
 * @param {object} files - all project files { path: content }
 * @param {number} chapterNum - chapter about to be generated
 * @returns {{ items: Array<{ label, status, detail }>, canProceed: boolean }}
 */
export async function runPreFlight(sendMessage, files, chapterNum) {
  const checks = [];

  // 1. Local checks (no LLM needed)
  // ── Required files present? ──
  const requiredFiles = ['author.md', 'narrator.md', 'outline.md'];
  const missingFiles = requiredFiles.filter(f => !files[f]?.trim());

  if (missingFiles.length > 0) {
    checks.push({
      label: 'Required project files',
      status: 'fail',
      detail: `Missing: ${missingFiles.join(', ')}. Complete earlier phases first.`,
    });
  } else {
    checks.push({ label: 'Required project files', status: 'pass', detail: 'All core files present.' });
  }

  // ── Previous chapter exists (if not Chapter 1)? ──
  if (chapterNum > 1) {
    const prevChapter = files[`story/chapter-${chapterNum - 1}.md`];
    if (!prevChapter?.trim()) {
      checks.push({
        label: `Chapter ${chapterNum - 1} exists`,
        status: 'fail',
        detail: `Chapter ${chapterNum - 1} has not been written yet. Write previous chapters first.`,
      });
    } else {
      checks.push({
        label: `Chapter ${chapterNum - 1} exists`,
        status: 'pass',
        detail: `Chapter ${chapterNum - 1} is present (${prevChapter.split(/\s+/).length} words).`,
      });
    }
  }

  // ── Character files check ──
  const charFiles = Object.keys(files).filter(
    p => p.startsWith('characters/') && p.endsWith('.md') && p !== 'characters/questions-answered.md'
  );
  if (charFiles.length === 0) {
    checks.push({ label: 'Character files', status: 'warning', detail: 'No character files found. Chapter may lack character depth.' });
  } else {
    checks.push({ label: 'Character files', status: 'pass', detail: `${charFiles.length} character file(s) available.` });
  }

  // ── Outline entry for this chapter ──
  const outline = files['outline.md'] || '';
  const chapterPattern = new RegExp(`chapter\\s*${chapterNum}\\b`, 'i');
  if (!chapterPattern.test(outline)) {
    checks.push({ label: `Outline entry for Chapter ${chapterNum}`, status: 'warning', detail: 'No specific outline entry found for this chapter. Generation will rely on overall arc.' });
  } else {
    checks.push({ label: `Outline entry for Chapter ${chapterNum}`, status: 'pass', detail: 'Outline entry found.' });
  }

  // 2. LLM-powered checks (continuity, character state, tone)
  try {
    const ctx = buildPreFlightContext(files, chapterNum);
    const result = await sendMessage({
      messages: ctx.messages,
      role: 'analyst',
      maxTokens: 1500,
    });

    if (result.success) {
      const cleaned = removeEmdashes(result.content);
      // Parse LLM checklist response
      const lines = cleaned.split('\n').filter(l => l.trim());

      for (const line of lines) {
        const passMatch = line.match(/(?:PASS|✓|✅)\s*[:\-—]?\s*(.*)/i);
        const warnMatch = line.match(/(?:WARNING|⚠|🟡)\s*[:\-—]?\s*(.*)/i);
        const failMatch = line.match(/(?:FAIL|✗|❌)\s*[:\-—]?\s*(.*)/i);

        if (passMatch) {
          checks.push({ label: 'AI Check', status: 'pass', detail: passMatch[1].trim() });
        } else if (warnMatch) {
          checks.push({ label: 'AI Check', status: 'warning', detail: warnMatch[1].trim() });
        } else if (failMatch) {
          checks.push({ label: 'AI Check', status: 'fail', detail: failMatch[1].trim() });
        }
      }

      // If no structured items were parsed, add the raw response as a single item
      if (checks.length <= 4) {
        checks.push({ label: 'AI Continuity Review', status: 'pass', detail: cleaned.slice(0, 300) });
      }
    } else {
      checks.push({ label: 'AI Pre-flight', status: 'warning', detail: `Skipped: ${result.error}` });
    }
  } catch (err) {
    checks.push({ label: 'AI Pre-flight', status: 'warning', detail: `Skipped: ${err.message}` });
  }

  // Determine if we can proceed (fail = can proceed with warning, not blocked per spec)
  const hasFail = checks.some(c => c.status === 'fail');

  return {
    items: checks,
    canProceed: true, // Spec says: "shows a warning but does not block generation"
    hasWarnings: checks.some(c => c.status === 'warning'),
    hasFailures: hasFail,
  };
}

// ─── Chapter Generation ─────────────────────────────────────────────────────

/**
 * Generate a chapter using the full context pipeline.
 *
 * @param {Function} sendMessage - llmStore.sendMessage
 * @param {object} files - all project files
 * @param {number} chapterNum - chapter to generate
 * @param {object} options - { maxTokens, userNotes, emotionalBeats, project }
 * @returns {{ success, content, usage, trimmed }}
 */
export async function generateChapter(sendMessage, files, chapterNum, options = {}) {
  const { maxTokens = 128000, userNotes = '', emotionalBeats = [], project = null } = options;

  let seriesCtx = '';
  if (project) {
    try {
      seriesCtx = await getSeriesContextForProject(project);
    } catch (err) {
      console.warn('Failed to load series context:', err);
    }
  }

  const ctx = buildChapterContext(files, chapterNum, { maxTokens, seriesContext: seriesCtx });

  // Inject user notes if provided
  if (userNotes.trim()) {
    const lastMsg = ctx.messages[ctx.messages.length - 1];
    lastMsg.content += `\n\n## Author Notes for This Chapter\n\n${userNotes}`;
  }

  // Inject emotional beats if provided
  if (emotionalBeats.length > 0) {
    const lastMsg = ctx.messages[ctx.messages.length - 1];
    const emotionLabels = emotionalBeats.map(beat => {
      // Format: "primary:secondary:tertiary" -> "tertiary"
      return beat.split(':').pop();
    }).join(', ');
    lastMsg.content += `\n\n## Emotional Beats\n\nFocus on these emotional tones: ${emotionLabels}`;
  }

  const result = await sendMessage({
    messages: ctx.messages,
    role: 'generator',
    maxTokens: 8192, // output tokens for the chapter
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const content = removeEmdashes(result.content);

  return {
    success: true,
    content,
    usage: result.usage,
    provider: result.provider,
    model: result.model,
    trimmed: ctx.trimmed,
    tokenCount: ctx.tokenCount,
  };
}

// ─── Post-Flight Checklist ──────────────────────────────────────────────────

/**
 * Run post-flight analysis after a chapter is generated/reviewed.
 * Generates the chapter notes file and a progressive summary.
 *
 * @param {Function} sendMessage - llmStore.sendMessage
 * @param {object} files - all project files (including the new chapter)
 * @param {number} chapterNum - chapter just generated
 * @returns {{ notes: string, summary: string }}
 */
export async function runPostFlight(sendMessage, files, chapterNum) {
  const chapterContent = files[`story/chapter-${chapterNum}.md`] || '';

  if (!chapterContent.trim()) {
    return { notes: '', summary: '' };
  }

  // 1. Generate chapter notes (post-flight items)
  const notesPrompt = PROMPTS.POST_FLIGHT_NOTES.build({ chapterNum });

  const notesResult = await sendMessage({
    messages: [
      { role: 'system', content: notesPrompt },
      { role: 'user', content: `## Chapter ${chapterNum}\n\n${chapterContent}` },
    ],
    role: 'analyst',
    maxTokens: 2000,
  });

  const notes = notesResult.success ? removeEmdashes(notesResult.content) : '';

  // 2. Generate progressive summary
  const summaryPrompt = PROMPTS.POST_FLIGHT_SUMMARY.build({ chapterNum });

  const summaryResult = await sendMessage({
    messages: [
      { role: 'system', content: summaryPrompt },
      { role: 'user', content: `## Chapter ${chapterNum}\n\n${chapterContent}` },
    ],
    role: 'analyst',
    maxTokens: 1000,
  });

  const summary = summaryResult.success ? removeEmdashes(summaryResult.content) : '';

  return { notes, summary };
}

// ─── Full Pipeline Orchestrator ─────────────────────────────────────────────

/**
 * Run the complete chapter pipeline:
 *   1. Pre-flight → 2. Generate → 3. Post-flight → 4. Save all artifacts
 *
 * @param {object} params
 * @param {Function} params.sendMessage - llmStore.sendMessage
 * @param {object} params.files - project files
 * @param {number} params.chapterNum - chapter to generate
 * @param {Function} params.updateFile - projectStore.updateFile
 * @param {Function} params.logSession - projectStore.logSession
 * @param {Function} params.onProgress - callback({ stage, detail })
 * @param {string} params.userNotes - optional author notes
 * @param {array} params.emotionalBeats - selected emotions from the wheel (array of strings)
 * @param {object} params.project - project object (for series context)
 * @returns {{ success, chapter, preflight, postflight, error }}
 */
export async function runChapterPipeline({
  sendMessage,
  files,
  chapterNum,
  updateFile,
  logSession,
  onProgress = () => {},
  userNotes = '',
  emotionalBeats = [],
  project = null,
}) {
  const startTime = Date.now();

  try {
    // ── Stage 1: Pre-flight ──
    onProgress({ stage: 'preflight', detail: 'Running pre-flight checklist...' });
    const preflight = await runPreFlight(sendMessage, files, chapterNum);

    // Log pre-flight
    if (logSession) {
      await logSession({
        type: 'preflight',
        chapter: chapterNum,
        result: preflight.hasFailures ? 'warnings' : 'clean',
        items: preflight.items.length,
      });
    }

    // ── Stage 2: Generate chapter ──
    onProgress({ stage: 'generating', detail: `Generating Chapter ${chapterNum}...` });
    const genResult = await generateChapter(sendMessage, files, chapterNum, { userNotes, emotionalBeats, project });

    if (!genResult.success) {
      return { success: false, error: genResult.error, preflight, postflight: null };
    }

    // Save the chapter file
    const chapterPath = `story/chapter-${chapterNum}.md`;
    await updateFile(chapterPath, genResult.content);

    // Update files object with new chapter for post-flight
    const updatedFiles = { ...files, [chapterPath]: genResult.content };

    // ── Stage 3: Post-flight ──
    onProgress({ stage: 'postflight', detail: 'Running post-flight analysis...' });
    const postflight = await runPostFlight(sendMessage, updatedFiles, chapterNum);

    // Save post-flight artifacts
    if (postflight.notes) {
      await updateFile(`story/chapter-${chapterNum}-notes.md`, postflight.notes);
    }
    if (postflight.summary) {
      await updateFile(`story/chapter-${chapterNum}-summary.md`, postflight.summary);
    }

    // ── Stage 4: Log completion ──
    const duration = Date.now() - startTime;
    if (logSession) {
      await logSession({
        type: 'chapter-generated',
        chapter: chapterNum,
        wordCount: genResult.content.split(/\s+/).length,
        provider: genResult.provider,
        model: genResult.model,
        duration,
        trimmed: genResult.trimmed,
      });
    }

    onProgress({ stage: 'complete', detail: `Chapter ${chapterNum} generated successfully.` });

    return {
      success: true,
      chapter: genResult.content,
      preflight,
      postflight,
      usage: genResult.usage,
      duration,
    };
  } catch (err) {
    onProgress({ stage: 'error', detail: err.message });
    return { success: false, error: err.message, preflight: null, postflight: null };
  }
}
