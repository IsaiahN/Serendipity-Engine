/**
 * Parse character names from markdown content (questions-answered.md, etc.)
 *
 * Extracted from GenreShiftDashboard so it can be unit-tested independently
 * and reused across components.
 */

// Stopwords: common sentence starters / non-name words that appear at line starts
const STOP = /^(yes|no|none|all|each|every|some|the|this|that|both|not|but|and|or|if|so|her|his|she|he|they|it|we|my|our|its|there|here|very|only|also|just|like|from|with|into|over|by|about|more|most|much|many|such|other|what|when|where|which|while|because|although|however|therefore|furthermore|meanwhile|additionally|fundamentally|ultimately|essentially|generally|basically|initially|originally|overall|primarily|subsequently|together|perhaps|never|always|sometimes|often|usually|really|quite|rather|indeed|certainly|probably|possibly|eventually|apparently)$/i;

export default function parseCharsFromContent(content) {
  const parsed = [];
  const seen = new Set();

  const addChar = (name) => {
    if (!name || name.length < 2 || name.length > 60) return;
    const cleaned = name.replace(/[—–].*$/, '').replace(/\s*\(.*?\)\s*$/, '').replace(/\.$/, '').trim();
    if (!cleaned || cleaned.length < 2) return;
    // Reject if entire string or its first word is a stopword
    if (STOP.test(cleaned)) return;
    const firstWord = cleaned.split(/\s+/)[0];
    if (STOP.test(firstWord)) return;
    // Reject names that don't start with uppercase
    if (!/^[A-Z]/.test(cleaned)) return;
    // Reject single words that are too short to be a confident name (< 3 chars)
    if (cleaned.split(/\s+/).length === 1 && cleaned.length < 3) return;
    const slug = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (seen.has(slug)) return;
    seen.add(slug);
    parsed.push({ slug, name: cleaned, path: 'characters/questions-answered.md' });
  };

  // Match "Who is the protagonist/antagonist?" answers
  for (const pat of [
    /who is the protagonist\?[*_\s]*\n+\s*([A-Z][A-Za-z'., -]+?)[\s—–]/im,
    /who is the antagonist\?[*_\s]*\n+\s*([A-Z][A-Za-z'., -]+?)[\s—–]/im,
  ]) {
    const m = content.match(pat);
    if (m) addChar(m[1].trim());
  }
  // Match "### CharacterName" headers
  for (const m of content.matchAll(/^###\s+([A-Z][A-Za-z'., -]+?)(?:\s*[—–(]|$)/gm)) addChar(m[1].trim());
  // Match "**CharacterName**" bold names
  for (const m of content.matchAll(/\*\*([A-Z][A-Za-z'., -]{2,40})\*\*/g)) {
    if (!/^(who|what|how|the cast|protagonist|antagonist|supporting|note|genre|theme)/i.test(m[1].trim())) addChar(m[1].trim());
  }
  // Match "Name — description" lines
  for (const m of content.matchAll(/^([A-Z][A-Za-z'., -]{2,40})\s*[—–]\s/gm)) {
    const candidate = m[1].trim();
    if (/^[A-Z][a-z]/.test(candidate)) addChar(candidate);
  }

  // Deduplicate: remove partial matches (e.g. "Bishop" when "Bishop Ezra Eicher" exists)
  const deduped = parsed.filter((entry) => {
    const lower = entry.name.toLowerCase();
    return !parsed.some(other =>
      other.name.toLowerCase() !== lower &&
      other.name.toLowerCase().includes(lower) &&
      other.name.length > entry.name.length
    );
  });

  return deduped;
}
