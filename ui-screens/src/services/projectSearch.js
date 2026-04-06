/**
 * Serendipity | StoryWeaver — Project Search Engine
 *
 * Full-text search across all project files with relevance ranking,
 * context snippets, and fuzzy matching support.
 */

/**
 * Escape regex special characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a search index from project files
 */
export function buildSearchIndex(files) {
  if (!files) return [];

  const entries = [];
  for (const [path, content] of Object.entries(files)) {
    if (content === null || content === undefined || typeof content !== 'string') continue;

    const lines = content.split('\n');
    const words = content.toLowerCase().split(/\s+/).filter(Boolean);

    entries.push({
      path,
      content,
      contentLower: content.toLowerCase(),
      lines,
      wordCount: words.length,
      // Extract title from first heading or filename
      title: extractTitle(path, content),
      // Extract file type category
      category: categorizeFile(path),
    });
  }

  return entries;
}

/**
 * Extract display title from file content or path
 */
function extractTitle(path, content) {
  // Try first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();

  // Fall back to filename
  const filename = path.split('/').pop();
  return filename
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Categorize file by path
 */
function categorizeFile(path) {
  if (path.startsWith('characters/')) return 'Character';
  if (path.startsWith('world/')) return 'World';
  if (path.startsWith('story/') || path.match(/chapter-\d+/)) return 'Story';
  if (path.startsWith('relationships/')) return 'Relationships';
  if (path.startsWith('feedback/')) return 'Feedback';
  if (path.startsWith('quality-control/')) return 'Quality Control';
  if (path === 'author.md') return 'Author';
  if (path === 'narrator.md') return 'Narrator';
  if (path === 'outline.md') return 'Outline';
  return 'Other';
}

/**
 * Search project files for a query string
 * Returns sorted results with context snippets
 */
export function searchFiles(files, query, options = {}) {
  if (!query || query.trim().length < 2) return [];

  const {
    maxResults = 50,
    contextChars = 100,
    fuzzy = false,
    fileFilter = null,    // e.g. 'Character' or 'Story'
    caseSensitive = false,
  } = options;

  const index = buildSearchIndex(files);
  const normalizedQuery = caseSensitive ? query.trim() : query.trim().toLowerCase();
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  // Build regex for matching
  let pattern;
  if (fuzzy) {
    // Fuzzy: match characters with optional gaps
    const fuzzyPattern = queryWords
      .map(w => w.split('').map(escapeRegex).join('[^\\s]*'))
      .join('|');
    pattern = new RegExp(`(${fuzzyPattern})`, caseSensitive ? 'g' : 'gi');
  } else {
    // Exact phrase or individual words
    const wordPatterns = queryWords.map(w => `\\b${escapeRegex(w)}\\b`);
    pattern = new RegExp(`(${wordPatterns.join('|')})`, caseSensitive ? 'g' : 'gi');
  }

  const results = [];

  for (const entry of index) {
    // Apply file filter
    if (fileFilter && entry.category !== fileFilter) continue;

    const searchContent = caseSensitive ? entry.content : entry.contentLower;

    // Count matches
    const matches = [];
    let match;
    const testPattern = new RegExp(pattern.source, pattern.flags);

    while ((match = testPattern.exec(entry.content)) !== null && matches.length < 20) {
      matches.push({
        index: match.index,
        text: match[0],
        line: entry.content.substring(0, match.index).split('\n').length,
      });
    }

    if (matches.length === 0) continue;

    // Generate context snippets (up to 3)
    const snippets = matches.slice(0, 3).map(m => {
      const start = Math.max(0, m.index - contextChars);
      const end = Math.min(entry.content.length, m.index + m.text.length + contextChars);
      let snippet = entry.content.substring(start, end);

      // Clean up snippet boundaries
      if (start > 0) snippet = '...' + snippet.replace(/^\S*\s/, '');
      if (end < entry.content.length) snippet = snippet.replace(/\s\S*$/, '') + '...';

      return {
        text: snippet,
        matchStart: m.index - start + (start > 0 ? 3 : 0),
        matchLength: m.text.length,
        lineNumber: m.line,
      };
    });

    // Calculate relevance score
    let score = matches.length * 10;

    // Boost for title matches
    const titleLower = entry.title.toLowerCase();
    if (queryWords.some(w => titleLower.includes(w))) {
      score += 50;
    }

    // Boost for exact phrase match
    if (searchContent.includes(normalizedQuery)) {
      score += 30;
    }

    // Boost for shorter files (more focused content)
    if (entry.wordCount < 500) score += 5;

    // Boost for story/character files (more likely what user wants)
    if (entry.category === 'Story' || entry.category === 'Character') score += 10;

    results.push({
      path: entry.path,
      title: entry.title,
      category: entry.category,
      matchCount: matches.length,
      snippets,
      score,
      wordCount: entry.wordCount,
    });
  }

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, maxResults);
}

/**
 * Search and replace across project files
 * Returns a preview of changes without applying them
 */
export function searchAndReplace(files, searchQuery, replaceWith, options = {}) {
  const { caseSensitive = false, wholeWord = false } = options;

  let flags = caseSensitive ? 'g' : 'gi';
  let pattern;
  if (wholeWord) {
    pattern = new RegExp(`\\b${escapeRegex(searchQuery)}\\b`, flags);
  } else {
    pattern = new RegExp(escapeRegex(searchQuery), flags);
  }

  const changes = [];

  for (const [path, content] of Object.entries(files)) {
    if (content === null || content === undefined || typeof content !== 'string') continue;

    const matches = content.match(pattern);
    if (!matches || matches.length === 0) continue;

    const newContent = content.replace(pattern, replaceWith);

    changes.push({
      path,
      originalContent: content,
      newContent,
      replacementCount: matches.length,
    });
  }

  return changes;
}

/**
 * Get search suggestions based on partial input
 * Returns common words/phrases from the project
 */
export function getSearchSuggestions(files, partialQuery, limit = 8) {
  if (!partialQuery || partialQuery.length < 2) return [];

  const query = partialQuery.toLowerCase();
  const wordCounts = {};

  for (const content of Object.values(files)) {
    if (content === null || content === undefined || typeof content !== 'string') continue;

    // Extract words and bigrams
    const words = content.split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      const clean = word.toLowerCase().replace(/[^a-z0-9'-]/g, '');
      if (clean.startsWith(query) && clean !== query) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    }
  }

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
