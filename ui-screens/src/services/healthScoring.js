/**
 * Health Scoring Engine for Serendipity Engine StoryBuilder
 *
 * Computes 10 health dimensions from real project data:
 * 1. Narrative Arc - outline structure
 * 2. Character Depth - character file completeness
 * 3. World Building - world detail
 * 4. Dialogue Quality - dialogue presence and variety
 * 5. Pacing - chapter length variance and act structure
 * 6. Thematic Coherence - theme consistency
 * 7. Prose Quality - sentence variety, vocabulary diversity
 * 8. Emotional Resonance - emotional language density
 * 9. Plot Consistency - character/setting consistency
 * 10. Reader Engagement - hooks and tension patterns
 *
 * All scores are 0.0 to 5.0 based on heuristic analysis.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const HEALTH_LABELS = {
  0: 'Critical',
  1: 'Weak',
  2: 'Developing',
  3: 'Solid',
  4: 'Strong',
  5: 'Exceptional'
};

// Keywords that indicate character depth components
const CHARACTER_DEPTH_KEYWORDS = [
  'backstory', 'background', 'history',
  'wound', 'flaw', 'weakness',
  'virtue', 'strength', 'trait',
  'mbti', 'personality', 'archetype',
  'goal', 'desire', 'motivation',
  'conflict', 'fear', 'desire'
];

// Weak words that lower prose quality
const WEAK_WORDS = [
  'very', 'really', 'just', 'quite', 'actually',
  'basically', 'literally', 'totally', 'somewhat',
  'seems', 'appears', 'rather', 'somewhat',
  'kind of', 'sort of', 'a bit', 'little'
];

// Emotion-laden words for emotional resonance
const EMOTION_WORDS = [
  'feel', 'feeling', 'felt',
  'fear', 'afraid', 'scared',
  'love', 'loved', 'adore',
  'grief', 'grieve', 'mourning',
  'joy', 'happy', 'happiness', 'delighted',
  'anger', 'angry', 'rage',
  'hope', 'hopeful',
  'despair', 'desperate',
  'ache', 'aching', 'longing',
  'desire', 'crave', 'cravings',
  'shame', 'guilt', 'regret',
  'bitter', 'bitterness',
  'tender', 'tender-hearted',
  'anguish', 'torment',
  'ecstasy', 'bliss',
  'sorrow', 'sadness',
  'yearning', 'yearn'
];

// World building markers
const WORLD_BUILDING_MARKERS = [
  'world', 'setting', 'environment',
  'geography', 'landscape', 'terrain',
  'culture', 'custom', 'tradition',
  'magic', 'magical',
  'technology', 'tech',
  'society', 'government',
  'history', 'past',
  'flora', 'fauna', 'creature',
  'language', 'dialect'
];

// Dialogue tag variety indicators
const DIALOGUE_TAGS = [
  'said', 'asked', 'whispered', 'shouted', 'screamed',
  'replied', 'answered', 'responded', 'muttered',
  'called', 'declared', 'exclaimed', 'commanded',
  'breathed', 'groaned', 'laughed', 'gasped',
  'hissed', 'snapped', 'snarled', 'growled'
];

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Computes all 10 health dimensions from project data
 * @param {Object} files - Map of file paths to content strings
 * @param {Object} phaseAnswers - Story planning phase answers
 * @param {Object} project - Project metadata
 * @returns {Object} Health dimensions object with scores 0-5
 */
export function computeHealthDimensions(files = {}, phaseAnswers = {}, project = {}) {
  const dimensions = {
    narrativeArc: computeNarrativeArc(files),
    characterDepth: computeCharacterDepth(files),
    worldBuilding: computeWorldBuilding(files),
    dialogueQuality: computeDialogueQuality(files),
    pacing: computePacing(files),
    thematicCoherence: computeThematicCoherence(files, phaseAnswers),
    proseQuality: computeProseQuality(files),
    emotionalResonance: computeEmotionalResonance(files),
    plotConsistency: computePlotConsistency(files),
    readerEngagement: computeReaderEngagement(files)
  };

  return dimensions;
}

// ============================================================================
// DIMENSION SCORING FUNCTIONS
// ============================================================================

/**
 * Narrative Arc: Does the outline exist and have clear structure?
 * Checks for outline.md and story/arc.md with structural markers (headings, chapters)
 */
function computeNarrativeArc(files) {
  let score = 0;

  // Check for outline.md
  const outlineFile = findFile(files, 'outline.md');
  if (outlineFile) {
    const content = outlineFile.content;
    const wordCount = content.split(/\s+/).length;

    // Base points for existence
    score += 1.5;

    // Bonus for content length
    if (wordCount > 500) score += 1;
    if (wordCount > 1500) score += 0.5;

    // Bonus for structure markers (headings)
    const headingCount = (content.match(/^#+\s/gm) || []).length;
    if (headingCount >= 3) score += 0.5;
    if (headingCount >= 6) score += 0.5;

    // Bonus for act structure markers
    const actMarkers = (content.match(/\b(act|Act|ACT)\s+\d+\b/gi) || []).length;
    if (actMarkers >= 3) score += 0.5;

    // Bonus for chapter references
    const chapterMarkers = (content.match(/\b(chapter|Chapter|CHAPTER)\s+\d+\b/gi) || []).length;
    if (chapterMarkers >= 5) score += 0.5;
  }

  // Check for arc.md or story/arc.md
  const arcFile = findFile(files, 'arc.md') || findFile(files, 'story/arc.md');
  if (arcFile) {
    score += 0.5;
    if (arcFile.content.split(/\s+/).length > 300) score += 0.5;
  }

  return Math.min(score, 5.0);
}

/**
 * Character Depth: How complete are character files?
 * Scores on: number of characters, file length, key section keywords
 */
function computeCharacterDepth(files) {
  const characterFiles = findFiles(files, /characters?\/[^/]+\.md$/i);

  if (characterFiles.length === 0) return 0;

  let totalScore = 0;
  let characterCount = 0;

  characterFiles.forEach(file => {
    let charScore = 1.5; // Base for having a file
    const content = file.content;
    const wordCount = content.split(/\s+/).length;

    // Bonus for file length (well-developed character)
    if (wordCount > 300) charScore += 0.5;
    if (wordCount > 600) charScore += 0.5;
    if (wordCount > 1000) charScore += 0.5;

    // Bonus for key character depth sections
    const depthKeywords = CHARACTER_DEPTH_KEYWORDS.filter(keyword =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(content)
    );

    const keywordDensity = depthKeywords.length / CHARACTER_DEPTH_KEYWORDS.length;
    if (keywordDensity > 0.4) charScore += 0.5;
    if (keywordDensity > 0.6) charScore += 0.5;

    totalScore += charScore;
    characterCount++;
  });

  // Bonus for having multiple characters (at least 3)
  let charCountBonus = 0;
  if (characterCount >= 2) charCountBonus = 0.5;
  if (characterCount >= 3) charCountBonus = 1.0;
  if (characterCount >= 5) charCountBonus = 1.5;

  const avgScore = characterCount > 0 ? totalScore / characterCount : 0;
  return Math.min(avgScore + charCountBonus, 5.0);
}

/**
 * World Building: Is the world built out?
 * Scores on: world-building.md content, hallmarks, genre markers
 */
function computeWorldBuilding(files) {
  let score = 0;

  // Check for world-building.md
  const worldFile = findFile(files, 'world-building.md') || findFile(files, 'world.md');
  if (worldFile) {
    const content = worldFile.content;
    const wordCount = content.split(/\s+/).length;

    // Base points
    score += 1.5;

    // Length bonuses
    if (wordCount > 500) score += 1;
    if (wordCount > 1500) score += 1;

    // World building marker density
    const markerCount = WORLD_BUILDING_MARKERS.filter(marker =>
      new RegExp(`\\b${marker}\\b`, 'i').test(content)
    ).length;

    if (markerCount >= 5) score += 0.5;
    if (markerCount >= 8) score += 0.5;
  }

  // Check for hallmarks or genre-specific files
  const hallmarksFile = findFile(files, 'hallmarks.md');
  if (hallmarksFile) {
    score += 0.5;
    if (hallmarksFile.content.split(/\s+/).length > 200) score += 0.5;
  }

  // Check for genre file (common pattern)
  const genreFile = findFile(files, 'genre.md');
  if (genreFile) {
    score += 0.5;
  }

  return Math.min(score, 5.0);
}

/**
 * Dialogue Quality: Are dialogues present and varied?
 * Scores on: dialogue presence ratio, tag variety, dialogue-to-narration ratio
 */
function computeDialogueQuality(files) {
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);

  if (chapterFiles.length === 0) return 0;

  let totalScore = 0;
  let scoredChapters = 0;

  chapterFiles.forEach(file => {
    const content = file.content;

    // Look for quoted dialogue
    const dialogueMatches = content.match(/"[^"]*"/g) || [];
    const dialogueCount = dialogueMatches.length;

    if (dialogueCount === 0) return; // Skip chapters with no dialogue

    let chapterScore = 1.5; // Base for having dialogue

    // Bonus for high dialogue presence
    const totalWords = content.split(/\s+/).length;
    const dialogueWordCount = dialogueMatches.reduce((sum, match) => sum + match.split(/\s+/).length, 0);
    const dialogueRatio = dialogueWordCount / totalWords;

    if (dialogueRatio > 0.1) chapterScore += 0.5;
    if (dialogueRatio > 0.25) chapterScore += 0.5;
    if (dialogueRatio > 0.4) chapterScore += 0.5;

    // Bonus for dialogue tag variety
    const tagsFound = DIALOGUE_TAGS.filter(tag =>
      new RegExp(`\\b${tag}\\b`, 'i').test(content)
    ).length;

    if (tagsFound >= 3) chapterScore += 0.5;
    if (tagsFound >= 6) chapterScore += 0.5;

    totalScore += chapterScore;
    scoredChapters++;
  });

  if (scoredChapters === 0) return 0;

  // Bonus if many chapters have dialogue
  let volumeBonus = 0;
  if (scoredChapters >= 3) volumeBonus = 0.5;
  if (scoredChapters >= 8) volumeBonus = 1.0;

  const avgScore = totalScore / chapterFiles.length;
  return Math.min(avgScore + volumeBonus, 5.0);
}

/**
 * Pacing: Chapter length variance and act structure
 * Penalizes huge variance (uneven pacing), checks for act markers
 */
function computePacing(files) {
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);

  if (chapterFiles.length < 2) return 0;

  // Calculate chapter word counts
  const chapterLengths = chapterFiles.map(file =>
    file.content.split(/\s+/).length
  );

  // Calculate variance
  const mean = chapterLengths.reduce((a, b) => a + b) / chapterLengths.length;
  const variance = chapterLengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / chapterLengths.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  let score = 3; // Base for having multiple chapters

  // Penalize high variance (CV > 0.5 is very uneven)
  if (coefficientOfVariation > 0.7) score -= 1.5;
  else if (coefficientOfVariation > 0.5) score -= 1;
  else if (coefficientOfVariation > 0.3) score -= 0.5;
  else score += 1; // Bonus for consistent pacing

  // Bonus for good pacing consistency
  if (coefficientOfVariation < 0.2) score += 0.5;

  // Check for act structure markers in outline
  const outlineFile = findFile(files, 'outline.md');
  if (outlineFile) {
    const actCount = (outlineFile.content.match(/\b(act|Act|ACT)\s+\d+\b/gi) || []).length;
    if (actCount >= 3) score += 1;
  }

  return Math.min(Math.max(score, 0), 5.0);
}

/**
 * Thematic Coherence: Theme consistency across chapters
 * Looks for theme keywords across multiple files
 */
function computeThematicCoherence(files, phaseAnswers = {}) {
  let score = 0;

  // Try to extract theme from phase answers
  let themeKeywords = [];
  if (phaseAnswers.theme) {
    themeKeywords = phaseAnswers.theme.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  }

  // If no theme in answers, look for it in a themes.md file
  if (themeKeywords.length === 0) {
    const themeFile = findFile(files, 'theme.md') || findFile(files, 'themes.md');
    if (themeFile) {
      const content = themeFile.content.toLowerCase();
      // Extract first substantial phrase as theme
      const firstLine = content.split('\n')[0];
      themeKeywords = firstLine.split(/\s+/).filter(word => word.length > 3);
      score += 0.5;
    }
  }

  if (themeKeywords.length === 0) return 0;

  // Check how consistently theme keywords appear across chapters
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);
  if (chapterFiles.length === 0) return score;

  let chaptersWithTheme = 0;
  let totalThemeMatches = 0;

  chapterFiles.forEach(file => {
    const content = file.content.toLowerCase();
    const themeMatches = themeKeywords.filter(keyword =>
      content.includes(keyword)
    ).length;

    if (themeMatches > 0) chaptersWithTheme++;
    totalThemeMatches += themeMatches;
  });

  const themeConsistency = chaptersWithTheme / chapterFiles.length;

  if (themeConsistency >= 0.7) score += 2;
  else if (themeConsistency >= 0.5) score += 1.5;
  else if (themeConsistency >= 0.3) score += 1;
  else if (themeConsistency > 0) score += 0.5;

  // Bonus for high theme density
  if (totalThemeMatches > chapterFiles.length * 2) score += 0.5;

  return Math.min(score, 5.0);
}

/**
 * Prose Quality: Sentence variety, vocabulary diversity, weak word avoidance
 * Analyzes sentence length variance and word variety
 */
function computeProseQuality(files) {
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);

  if (chapterFiles.length === 0) return 0;

  let totalScore = 0;
  let scoredChapters = 0;

  chapterFiles.forEach(file => {
    const content = file.content;

    // Extract sentences (simple heuristic)
    const sentences = content.match(/[.!?]+/g) || [];
    if (sentences.length < 3) return; // Skip very short chapters

    let chapterScore = 2; // Base score

    // Sentence length variance (variety is good)
    const words = content.split(/\s+/);
    const sentenceTexts = content.split(/[.!?]+/).filter(s => s.trim());
    const sentenceLengths = sentenceTexts.map(s => s.split(/\s+/).length);

    if (sentenceLengths.length > 1) {
      const sentenceMean = sentenceLengths.reduce((a, b) => a + b) / sentenceLengths.length;
      const sentenceVariance = sentenceLengths.reduce((sum, length) => sum + Math.pow(length - sentenceMean, 2), 0) / sentenceLengths.length;
      const sentenceStdDev = Math.sqrt(sentenceVariance);

      // Good prose has sentence variety
      if (sentenceStdDev > 3) chapterScore += 1; // Good variety
      else if (sentenceStdDev > 1.5) chapterScore += 0.5;
    }

    // Vocabulary diversity (unique words / total words)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()).filter(w => w.length > 2));
    const vocabulary = uniqueWords.size / words.length;

    if (vocabulary > 0.6) chapterScore += 1;
    else if (vocabulary > 0.5) chapterScore += 0.5;

    // Weak word avoidance
    const weakWordCount = WEAK_WORDS.filter(weak =>
      new RegExp(`\\b${weak}\\b`, 'i').test(content)
    ).length;

    const weakWordDensity = weakWordCount / words.length;
    if (weakWordDensity < 0.02) chapterScore += 0.5; // Low density is good
    else if (weakWordDensity < 0.04) chapterScore += 0.25;
    else if (weakWordDensity > 0.08) chapterScore -= 0.5; // Penalize high weak word use

    totalScore += chapterScore;
    scoredChapters++;
  });

  if (scoredChapters === 0) return 0;

  const avgScore = totalScore / scoredChapters;
  return Math.min(avgScore, 5.0);
}

/**
 * Emotional Resonance: Emotional language density
 * Scans for emotion-laden words and computes density per chapter
 */
function computeEmotionalResonance(files) {
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);

  if (chapterFiles.length === 0) return 0;

  let totalScore = 0;
  let scoredChapters = 0;

  chapterFiles.forEach(file => {
    const content = file.content;
    const words = content.split(/\s+/);

    if (words.length < 50) return; // Skip very short chapters

    // Count emotion word instances
    const emotionMatches = EMOTION_WORDS.filter(emotion =>
      new RegExp(`\\b${emotion}\\b`, 'i').test(content)
    ).length;

    let chapterScore = emotionMatches > 0 ? 1.5 : 0;

    const emotionDensity = emotionMatches / words.length;

    // Calibrated thresholds
    if (emotionDensity > 0.01) chapterScore += 1;
    if (emotionDensity > 0.02) chapterScore += 1;
    if (emotionDensity > 0.03) chapterScore += 0.5;
    if (emotionDensity > 0.05) chapterScore += 0.5; // Rich emotional content

    // Penalize if too sparse
    if (emotionMatches === 0) chapterScore = 0;

    totalScore += chapterScore;
    scoredChapters++;
  });

  if (scoredChapters === 0) return 0;

  const avgScore = totalScore / scoredChapters;
  return Math.min(avgScore, 5.0);
}

/**
 * Plot Consistency: Character name and setting consistency
 * Checks for character name consistency across chapters
 */
function computePlotConsistency(files) {
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);

  if (chapterFiles.length < 2) return 3; // Neutral score if not enough chapters

  // Extract character names from character files
  const characterFiles = findFiles(files, /characters?\/[^/]+\.md$/i);
  const characterNames = new Set();

  characterFiles.forEach(file => {
    // Extract first heading as character name
    const heading = file.content.match(/^#\s+(.+)$/m);
    if (heading) {
      characterNames.add(heading[1].trim());
    }
  });

  if (characterNames.size === 0) return 3; // Can't assess without character info

  // Check consistency across chapters
  let consistencyScore = 3; // Base score
  let nameAppearances = new Map();

  chapterFiles.forEach(file => {
    const content = file.content;

    characterNames.forEach(name => {
      const count = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
      if (count > 0) {
        nameAppearances.set(name, (nameAppearances.get(name) || 0) + 1);
      }
    });
  });

  // Bonus for consistent character presence
  const consistentCharacters = Array.from(nameAppearances.values()).filter(
    count => count >= chapterFiles.length * 0.5
  ).length;

  if (consistentCharacters >= characterNames.size * 0.8) consistencyScore += 1.5;
  else if (consistentCharacters >= characterNames.size * 0.5) consistencyScore += 1;

  // Check for major contradictions (same character in two places simultaneously)
  // This is a simple heuristic: penalize if character appears in multiple scenes in same chapter
  let contradictionPenalty = 0;
  chapterFiles.forEach(file => {
    const content = file.content;
    const locationMarkers = (content.match(/\b(in|at|inside|outside)\s+[A-Z][a-z]+/g) || []).length;
    const characterMentions = Array.from(characterNames).reduce(
      (sum, name) => sum + (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length,
      0
    );

    if (locationMarkers > 5 && characterMentions > 10) {
      // Potential for tracking issues, but mild penalty
      contradictionPenalty += 0.1;
    }
  });

  consistencyScore -= Math.min(contradictionPenalty, 1);

  return Math.min(Math.max(consistencyScore, 0), 5.0);
}

/**
 * Reader Engagement: Hooks, cliffhangers, tension patterns
 * Looks for chapter-ending hooks (questions, cliffhangers, ellipses, dramatic short sentences)
 */
function computeReaderEngagement(files) {
  const chapterFiles = findFiles(files, /chapters?\/[^/]+\.md$/i);

  if (chapterFiles.length === 0) return 0;

  let totalScore = 0;
  let engagedChapters = 0;

  chapterFiles.forEach(file => {
    const content = file.content.trim();

    if (!content) return;

    let chapterScore = 1; // Base for having content

    // Extract last paragraph (last 100 words approximately)
    const words = content.split(/\s+/);
    const lastWords = words.slice(Math.max(0, words.length - 100)).join(' ');

    // Check for question marks (cliffhangers, hooks)
    if (/\?/.test(lastWords)) chapterScore += 1.5;

    // Check for ellipses (trailing tension)
    if (/\.\.\./.test(lastWords)) chapterScore += 1;

    // Check for exclamation marks (dramatic endings)
    const exclamationCount = (lastWords.match(/!/g) || []).length;
    if (exclamationCount >= 1) chapterScore += 0.5;
    if (exclamationCount >= 2) chapterScore += 0.5;

    // Check for short dramatic sentences at end (typically < 10 words)
    const lastSentences = lastWords.match(/[^.!?]*[.!?]/g) || [];
    if (lastSentences.length > 0) {
      const finalSentence = lastSentences[lastSentences.length - 1];
      const finalWordCount = finalSentence.split(/\s+/).length;

      if (finalWordCount > 0 && finalWordCount < 10) {
        chapterScore += 0.75; // Short dramatic final sentence
      }
    }

    // Check for tension/action words in last paragraph
    const tensionWords = ['suddenly', 'then', 'but', 'however', 'when', 'what'];
    const tensionMatches = tensionWords.filter(word =>
      new RegExp(`\\b${word}\\b`, 'i').test(lastWords)
    ).length;

    if (tensionMatches >= 2) chapterScore += 0.5;

    totalScore += chapterScore;
    engagedChapters++;
  });

  if (engagedChapters === 0) return 0;

  const avgScore = totalScore / chapterFiles.length;
  return Math.min(avgScore, 5.0);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Finds a single file matching a pattern in the files map
 * @param {Object} files - File map
 * @param {string|RegExp} pattern - File path pattern
 * @returns {Object|null} File object with {path, content} or null
 */
function findFile(files, pattern) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

  for (const [path, content] of Object.entries(files)) {
    if (regex.test(path)) {
      return { path, content };
    }
  }

  return null;
}

/**
 * Finds all files matching a pattern in the files map
 * @param {Object} files - File map
 * @param {string|RegExp} pattern - File path pattern
 * @returns {Array} Array of file objects with {path, content}
 */
function findFiles(files, pattern) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
  const matches = [];

  for (const [path, content] of Object.entries(files)) {
    if (regex.test(path)) {
      matches.push({ path, content });
    }
  }

  return matches;
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Computes overall health as weighted average of all dimensions
 * Narrative Arc and Character Depth are weighted 1.5x
 * @param {Object} dimensions - Health dimensions object
 * @returns {number} Overall health score (0-5)
 */
export function computeOverallHealth(dimensions) {
  const {
    narrativeArc = 0,
    characterDepth = 0,
    worldBuilding = 0,
    dialogueQuality = 0,
    pacing = 0,
    thematicCoherence = 0,
    proseQuality = 0,
    emotionalResonance = 0,
    plotConsistency = 0,
    readerEngagement = 0
  } = dimensions;

  // Weighted average: narrative arc and character depth 1.5x
  const totalWeight = 1.5 + 1.5 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1;
  const weightedSum =
    narrativeArc * 1.5 +
    characterDepth * 1.5 +
    worldBuilding * 1 +
    dialogueQuality * 1 +
    pacing * 1 +
    thematicCoherence * 1 +
    proseQuality * 1 +
    emotionalResonance * 1 +
    plotConsistency * 1 +
    readerEngagement * 1;

  return weightedSum / totalWeight;
}

/**
 * Gets human-readable label for a health score
 * @param {number} score - Health score (0-5)
 * @returns {string} Label (Critical, Weak, Developing, Solid, Strong, Exceptional)
 */
export function getHealthLabel(score) {
  if (score < 0.5) return HEALTH_LABELS[0];
  if (score < 1.5) return HEALTH_LABELS[1];
  if (score < 2.5) return HEALTH_LABELS[2];
  if (score < 3.5) return HEALTH_LABELS[3];
  if (score < 4.5) return HEALTH_LABELS[4];
  return HEALTH_LABELS[5];
}

/**
 * Gets all health labels
 * @returns {Object} Map of score to label
 */
export const HEALTH_LABELS_EXPORT = HEALTH_LABELS;

// Export constants for reference
export { HEALTH_LABELS };
