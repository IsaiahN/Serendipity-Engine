/**
 * Silent Writing Assessment Service
 * Passively analyzes user writing to build a writing profile.
 * Runs in the background after file saves.
 */

/**
 * Analyze text metrics locally (no LLM needed)
 */
export function analyzeTextMetrics(text) {
  if (!text || !text.trim()) return null;

  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  // Word length distribution
  const wordLengths = words.map(w => w.replace(/[^a-zA-Z]/g, '').length);
  const avgWordLength = wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length || 0;

  // Sentence length
  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;

  // Dialogue ratio
  const dialogueMatches = text.match(/[""][^""]*[""]|["'][^"']*["']/g) || [];
  const dialogueWords = dialogueMatches.join(' ').split(/\s+/).length;
  const dialogueRatio = words.length > 0 ? (dialogueWords / words.length) : 0;

  // Adverb usage (simple detection of -ly words)
  const adverbs = words.filter(w => /ly$/i.test(w) && w.length > 3);
  const adverbRatio = words.length > 0 ? (adverbs.length / words.length) : 0;

  // Passive voice indicators
  const passivePatterns = text.match(/\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi) || [];
  const passiveRatio = sentences.length > 0 ? (passivePatterns.length / sentences.length) : 0;

  // Vocabulary richness (type-token ratio)
  const uniqueWords = new Set(
    words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
  );
  const vocabularyRichness = words.length > 0 ? (uniqueWords.size / words.length) : 0;

  // Readability (simplified Flesch-Kincaid)
  const syllableCount = words.reduce((count, word) => {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    let syllables = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/i, '').match(/[aeiouy]{1,2}/gi);
    return count + (syllables ? Math.max(syllables.length, 1) : 1);
  }, 0);

  let fleschKincaid = 0;
  if (words.length > 0 && sentences.length > 0) {
    fleschKincaid = 0.39 * (words.length / sentences.length) + 11.8 * (syllableCount / words.length) - 15.59;
  }

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    dialogueRatio: Math.round(dialogueRatio * 100),
    adverbRatio: Math.round(adverbRatio * 1000) / 10,
    passiveRatio: Math.round(passiveRatio * 100),
    vocabularyRichness: Math.round(vocabularyRichness * 100),
    readabilityGrade: Math.round(fleschKincaid * 10) / 10,
  };
}

/**
 * Aggregate multiple assessments into a profile
 */
export function aggregateProfile(assessments) {
  if (!assessments || !assessments.length) return null;

  const avg = (key) => {
    const vals = assessments.map(a => a[key]).filter(v => v != null);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  };

  return {
    samplesAnalyzed: assessments.length,
    totalWords: assessments.reduce((sum, a) => sum + (a.wordCount || 0), 0),
    avgWordLength: avg('avgWordLength'),
    avgSentenceLength: avg('avgSentenceLength'),
    dialogueRatio: avg('dialogueRatio'),
    adverbUsage: avg('adverbRatio'),
    passiveVoice: avg('passiveRatio'),
    vocabularyRichness: avg('vocabularyRichness'),
    readabilityGrade: avg('readabilityGrade'),
    lastUpdated: Date.now(),
  };
}

/**
 * Get an aggregated profile from raw assessment records
 * Returns null if no assessments exist
 */
export async function getAggregatedProfile(projectId = null) {
  try {
    const db = (await import('../lib/db')).default;
    let records;

    if (projectId) {
      // Get profile for specific project
      records = await db.writingProfile
        .where('projectId')
        .equals(projectId)
        .toArray();
    } else {
      // Get all profiles across all projects
      records = await db.writingProfile.toArray();
    }

    const assessments = records.map(r => r.metrics).filter(Boolean);
    return assessments.length ? aggregateProfile(assessments) : null;
  } catch (err) {
    console.warn('Failed to get aggregated profile:', err);
    return null;
  }
}
