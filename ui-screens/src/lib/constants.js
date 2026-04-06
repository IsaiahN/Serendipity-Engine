/**
 * Serendipity | StoryWeaver — Shared Constants
 */

// ── Phases ──────────────────────────────────────────────
export const PHASES = [
  { id: 1, name: 'Author', key: 'author', description: 'Define the author profile, wound, and Big Picture Statement' },
  { id: 2, name: 'Narrator', key: 'narrator', description: 'Define point of view, reliability, tense, and voice' },
  { id: 3, name: 'World', key: 'world', description: 'Build the world: genre, themes, hallmarks, society, scenery' },
  { id: 4, name: 'Characters', key: 'characters', description: 'Design the cast: attributes, palettes, somatic signatures' },
  { id: 5, name: 'Relationships', key: 'relationships', description: 'Map dynamics, attachment styles, emotional textures' },
  { id: 6, name: 'Story Foundation', key: 'story', description: 'Ending-first: title, abstract, arc, outline, tonal arc' },
  { id: 7, name: 'Review', key: 'review', description: 'Full structural diagnostic against all theory pillars' },
  { id: 8, name: 'Execution', key: 'execution', description: 'Chapter-by-chapter drafting with pre/post-flight checks' },
];

// Phase 7 → 8 bridge
export const BRIDGE_PHASE = {
  id: 'bridge',
  name: 'Bridge',
  description: 'Five threshold questions before entering chapter execution',
};

// ── Health Rating Tiers ─────────────────────────────────
export const HEALTH_TIERS = [
  { key: 'just-started', label: 'Just Started', color: 'var(--health-just-started)', min: 0 },
  { key: 'developing', label: 'Developing', color: 'var(--health-developing)', min: 1 },
  { key: 'good', label: 'Good', color: 'var(--health-good)', min: 2 },
  { key: 'strong', label: 'Strong', color: 'var(--health-strong)', min: 3 },
  { key: 'exceptional', label: 'Exceptional', color: 'var(--health-exceptional)', min: 4 },
];

// ── Health Scoring Dimensions ───────────────────────────
export const HEALTH_DIMENSIONS = [
  'Author Depth',
  'Narrator Integration',
  'World Integrity',
  'Character Depth',
  'Relationship Architecture',
  'Plot Structure',
  'Tonal Coherence',
  'Theme Resonance',
  'Consciousness Integration',
  'Network Resonance',
];

// ── Story Mediums / Types ───────────────────────────────
export const STORY_MEDIUMS = [
  { key: 'novel', label: 'Novel / Book', unit: 'chapters', wordRange: [50000, 120000] },
  { key: 'short-story', label: 'Short Story', unit: 'sections', wordRange: [1000, 10000] },
  { key: 'novella', label: 'Novella', unit: 'chapters', wordRange: [17500, 40000] },
  { key: 'screenplay', label: 'Screenplay / Film', unit: 'scenes', wordRange: [21000, 28000] },
  { key: 'tv-show', label: 'TV Show', unit: 'episodes', wordRange: [10000, 60000] },
  { key: 'stage-play', label: 'Stage Play / Theater', unit: 'acts', wordRange: [10000, 25000] },
  { key: 'podcast', label: 'Podcast / Audio Drama', unit: 'episodes', wordRange: [5000, 30000] },
  { key: 'graphic-novel', label: 'Graphic Novel / Manga', unit: 'pages', wordRange: [5000, 20000] },
  { key: 'interactive', label: 'Interactive Fiction', unit: 'passages', wordRange: [10000, 50000] },
  { key: 'essay', label: 'Essay / Article', unit: 'sections', wordRange: [500, 10000] },
];

// ── Genre Categories ────────────────────────────────────
export const PRIMARY_GENRES = [
  'Literary & Contemporary Fiction',
  'Science Fiction & Speculative',
  'Fantasy & Magical Realism',
  'Mystery & Thriller',
  'Horror & Dark Fiction',
  'Romance & Relationship-Driven',
  'Historical & Period',
  'Adventure & Action',
  'Comedy & Satire',
  'Drama & Character Study',
  'Experimental & Meta',
  'Graphic & Visual',
];

export const TONAL_TYPES = [
  'Lyrical', 'Noir', 'Wry', 'Earnest', 'Whimsical', 'Brutal',
  'Subtle', 'Baroque', 'Minimalist', 'Irreverent', 'Melancholic',
  'Ascetic', 'Playful', 'Gothic',
];

// ── Content Ratings ─────────────────────────────────────
export const CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'R', '18+'];

// ── LLM Providers ───────────────────────────────────────
export const LLM_PROVIDERS = [
  { key: 'anthropic', label: 'Anthropic (Claude)', models: ['claude-sonnet-4-5-20250514', 'claude-opus-4-5-20250414', 'claude-haiku-3-5-20241022'], apiKeyUrl: 'https://console.anthropic.com/settings/keys' },
  { key: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'], apiKeyUrl: 'https://platform.openai.com/api-keys' },
  { key: 'deepseek', label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'], apiKeyUrl: 'https://platform.deepseek.com/api_keys' },
  { key: 'google', label: 'Google (Gemini)', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'], apiKeyUrl: 'https://aistudio.google.com/apikey' },
  { key: 'ollama', label: 'Ollama (Local)', models: [], apiKeyUrl: 'https://ollama.com/download' },
  { key: 'openrouter', label: 'OpenRouter', models: [], apiKeyUrl: 'https://openrouter.ai/keys' },
  { key: 'custom', label: 'Custom (OpenAI-compatible)', models: [] },
];

// ── Model Context Windows (tokens) ─────────────────────
// Maps model name → { context: max input tokens, maxOutput: max output tokens }
// Used by sendMessage() to auto-fit prompts and cap output requests.
// For OpenRouter/Ollama/custom models not listed here, falls back to a
// conservative 8k default so the app never sends more than the model can handle.
export const MODEL_LIMITS = {
  // Anthropic
  'claude-sonnet-4-5-20250514':   { context: 200000, maxOutput: 8192 },
  'claude-opus-4-5-20250414':     { context: 200000, maxOutput: 8192 },
  'claude-haiku-3-5-20241022':    { context: 200000, maxOutput: 8192 },
  // OpenAI
  'gpt-4o':                       { context: 128000, maxOutput: 16384 },
  'gpt-4-turbo':                  { context: 128000, maxOutput: 4096 },
  'gpt-4':                        { context: 8192,   maxOutput: 4096 },
  'gpt-3.5-turbo':                { context: 16385,  maxOutput: 4096 },
  // DeepSeek
  'deepseek-chat':                { context: 64000,  maxOutput: 8192 },
  'deepseek-reasoner':            { context: 64000,  maxOutput: 8192 },
  // Google Gemini
  'gemini-2.0-flash':             { context: 1048576, maxOutput: 8192 },
  'gemini-1.5-pro':               { context: 2097152, maxOutput: 8192 },
  'gemini-1.5-flash':             { context: 1048576, maxOutput: 8192 },
};

// Conservative fallback for unknown models (OpenRouter free tiers, Ollama, custom)
export const DEFAULT_MODEL_LIMITS = { context: 8000, maxOutput: 4096 };

// Helper: get limits for a model name (exact match or prefix match)
export function getModelLimits(modelName) {
  if (!modelName) return DEFAULT_MODEL_LIMITS;
  // Exact match
  if (MODEL_LIMITS[modelName]) return MODEL_LIMITS[modelName];
  // Prefix match (handles dated variants like "gpt-4o-2024-11-20")
  for (const [key, limits] of Object.entries(MODEL_LIMITS)) {
    if (modelName.startsWith(key)) return limits;
  }
  return DEFAULT_MODEL_LIMITS;
}

// ── Role Assignment ─────────────────────────────────────
export const ROLE_ASSIGNMENT_MODES = {
  simple: { label: 'Simple', description: 'One model handles everything' },
  standard: { label: 'Standard', description: 'Four specialized roles' },
  granular: { label: 'Granular', description: '15+ individually assignable tasks' },
};

export const STANDARD_ROLES = [
  { key: 'generator', label: 'Content Generation', description: 'Chapters, architecture, profiles, worlds' },
  { key: 'editor', label: 'Editing & Review', description: 'Editor passes, consistency, critique' },
  { key: 'chat', label: 'Chat & Conversation', description: 'Story Assistant, Editor chat, Talk to Character' },
  { key: 'analyst', label: 'Analysis', description: 'Decomposition, writing assessment, health scoring' },
];

// ── Project File Structure Template ─────────────────────
export const PROJECT_FILE_TEMPLATE = {
  'author.md': '',
  'narrator.md': '',
  'abstract.md': '',
  'outline.md': '',
  'dry-run-audit.md': '',
  'characters/': null,
  'characters/questions-answered.md': '',
  'relationships/': null,
  'relationships/questions-answered.md': '',
  'world/': null,
  'world/world-building.md': '',
  'world/questions-answered.md': '',
  'story/': null,
  'story/arc.md': '',
  'story/chapter-checklist.md': '',
  'story/metafiles-review.md': '',
  'story/questions-answered.md': '',
  'feedback/': null,
  'drawing-board/': null,
  'drawing-board/notes.md': '',
};

// ── Auto-save Intervals ─────────────────────────────────
export const AUTOSAVE_INTERVALS = [
  { value: 15000, label: '15 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '60 seconds' },
  { value: 0, label: 'Off' },
];

// ── Export Formats ───────────────────────────────────────
export const EXPORT_FORMATS = [
  { key: 'docx', label: '.docx (Word)' },
  { key: 'pdf', label: '.pdf' },
  { key: 'epub', label: '.epub' },
  { key: 'fountain', label: '.fountain (Screenplay)' },
  { key: 'md', label: '.md (Markdown)' },
  { key: 'zip', label: '.zip (Full Project)' },
  { key: 'json', label: '.json (Data)' },
];

// ── Font Options ────────────────────────────────────────
export const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter (Default)' },
  { value: 'georgia', label: 'Georgia (Serif)' },
  { value: 'merriweather', label: 'Merriweather' },
  { value: 'jetbrains', label: 'JetBrains Mono' },
  { value: 'system', label: 'System Default' },
];

// ── Editor Quality Thresholds ───────────────────────────
export const QUALITY_THRESHOLDS = ['Off', 'Developing', 'Good', 'Strong', 'Exceptional'];

// ── Keyboard Shortcuts ──────────────────────────────────
export const KEYBOARD_SHORTCUTS = {
  global: [
    { keys: 'Ctrl+N', mac: 'Cmd+N', action: 'New Project' },
    { keys: 'Ctrl+O', mac: 'Cmd+O', action: 'Open Project' },
    { keys: 'Ctrl+S', mac: 'Cmd+S', action: 'Save' },
    { keys: 'Ctrl+K', mac: 'Cmd+K', action: 'Command Palette' },
    { keys: 'Ctrl+,', mac: 'Cmd+,', action: 'Settings' },
    { keys: 'Ctrl+/', mac: 'Cmd+/', action: 'Keyboard Shortcuts' },
  ],
  workspace: [
    { keys: 'Ctrl+1-8', mac: 'Cmd+1-8', action: 'Jump to Phase' },
    { keys: 'Ctrl+]', mac: 'Cmd+]', action: 'Next Phase' },
    { keys: 'Ctrl+[', mac: 'Cmd+[', action: 'Previous Phase' },
    { keys: 'Ctrl+J', mac: 'Cmd+J', action: 'Toggle Center Stage Mode' },
    { keys: 'Ctrl+R', mac: 'Cmd+R', action: 'Toggle Panels' },
  ],
  editor: [
    { keys: 'Ctrl+Enter', mac: 'Cmd+Enter', action: 'Approve / Save' },
    { keys: 'Ctrl+D', mac: 'Cmd+D', action: 'Diff View' },
    { keys: 'Ctrl+E', mac: 'Cmd+E', action: 'Run Editor' },
  ],
};
