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
  { id: 7, name: 'Review', key: 'review', description: 'AI-driven audit of all phases with actionable suggestions' },
  { id: 8, name: 'Outline', key: 'outline', description: 'Generate, review, and finalize the story outline' },
  { id: 9, name: 'Execution', key: 'execution', description: 'Chapter-by-chapter drafting with pre/post-flight checks' },
  { id: 10, name: 'Editor', key: 'editor', description: 'Review generated content, run quality checks, and refine' },
];

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

// ── Medium Outline Profiles ────────────────────────────────
// Defines how each medium type structures its outline: what the primary
// segmentation unit is, what goes INSIDE each unit, how the content
// hierarchy works, and specific formatting rules for the AI.
export const MEDIUM_OUTLINE_PROFILES = {
  novel: {
    primaryUnit: 'Chapter',
    primaryUnitPlural: 'Chapters',
    typicalCount: [15, 30],
    structure: '3-act or 4-act',
    unitContent: [
      'Word Count Target (e.g. 3,000–4,500)',
      'Dominant Tone (e.g. "Meditative tension building toward rupture")',
      'POV Character (if multi-POV)',
      'Chapter Summary — 3-5 sentences describing the narrative arc of the chapter: what the character wants, what they do, what goes wrong or right, and how the chapter ends',
      'Emotional Arc — start → middle → end (e.g. "Guarded hope → confrontation → quiet devastation")',
      'Key Moments — 2-3 pivotal beats that happen in this chapter',
      'Active Threads — which story threads are advanced',
      'Hook / Transition — what propels the reader into the next chapter',
    ],
    doNot: 'Do NOT break chapters into numbered scenes. Novels flow as continuous prose — describe the chapter as a narrative arc, not a scene list.',
    formatNote: 'Each chapter should be its own clearly separated section. Use --- dividers between chapters. Describe what HAPPENS in each chapter as a narrative summary, not as a bulleted scene breakdown.',
  },
  'short-story': {
    primaryUnit: 'Section',
    primaryUnitPlural: 'Sections',
    typicalCount: [3, 7],
    structure: 'linear, circular, or fragmented',
    unitContent: [
      'Word Count Target',
      'Focus — what this section accomplishes in the overall arc',
      'Section Summary — 2-3 sentences describing narrative movement',
      'Emotional Register — the dominant feeling',
      'Transition — how this section hands off to the next',
    ],
    doNot: 'Do NOT over-structure a short story. Keep sections fluid. Do not add scene breakdowns within sections.',
    formatNote: 'Short stories need economy. Each section description should be concise — the outline for a short story should itself be short.',
  },
  novella: {
    primaryUnit: 'Chapter',
    primaryUnitPlural: 'Chapters',
    typicalCount: [8, 15],
    structure: '3-act',
    unitContent: [
      'Word Count Target (e.g. 2,000–3,500)',
      'Dominant Tone',
      'Chapter Summary — 3-4 sentences describing the narrative arc',
      'Emotional Arc — start → end',
      'Key Moments — 1-2 pivotal beats',
      'Active Threads',
      'Hook / Transition',
    ],
    doNot: 'Do NOT break chapters into scenes. Novellas are tight — describe each chapter as a flowing narrative beat.',
    formatNote: 'Novellas are compressed novels. Each chapter outline should be tighter than a novel chapter but structured the same way.',
  },
  screenplay: {
    primaryUnit: 'Scene',
    primaryUnitPlural: 'Scenes',
    typicalCount: [40, 70],
    structure: '3-act with midpoint and turning points',
    unitContent: [
      'Scene Heading (INT./EXT. — LOCATION — TIME)',
      'Characters Present',
      'Scene Purpose — what this scene accomplishes',
      'Visual Description — key visual beats and tone',
      'Dialogue Notes — any critical lines or exchanges',
      'Transition — cut type or emotional bridge to next scene',
    ],
    doNot: 'Do NOT write prose summaries. Screenplays are visual — describe what the camera sees and what the audience hears.',
    formatNote: 'Group scenes under act headings (Act 1, Act 2A, Act 2B, Act 3). Each scene should read like a mini slug line + action description.',
  },
  'tv-show': {
    primaryUnit: 'Episode',
    primaryUnitPlural: 'Episodes',
    typicalCount: [6, 13],
    structure: 'season arc with episodic A/B/C plots',
    unitContent: [
      'Episode Title',
      'Episode Logline — one sentence hook',
      'A-Plot — main storyline for this episode',
      'B-Plot — secondary storyline',
      'C-Plot (if applicable) — tertiary runner',
      'Cold Open — what grabs the audience',
      'Act Breaks — what happens at each commercial break / act break',
      'Episode End — cliffhanger, resolution, or emotional landing',
      'Season Arc Progress — how this episode advances the overarching storyline',
    ],
    doNot: 'Do NOT write episodes as chapters. Each episode must have its own self-contained dramatic arc with A/B plots. Include act breaks.',
    formatNote: 'TV outlines should read like a showrunner\'s beat sheet. Each episode is a mini-movie with its own structure.',
  },
  'stage-play': {
    primaryUnit: 'Act',
    primaryUnitPlural: 'Acts',
    typicalCount: [1, 5],
    structure: 'act-based with scenes within acts',
    unitContent: [
      'Act Summary — overall dramatic movement',
      'Scenes within Act — for each scene: location, characters on stage, dramatic purpose, key dialogue moments',
      'Stage Directions Notes — significant blocking, lighting, or set changes',
      'Emotional Trajectory — how tension builds across the act',
      'Act Curtain — how the act ends (blackout, tableau, exit)',
    ],
    doNot: 'Do NOT ignore the physical stage. Theater is spatial — note entrances, exits, and the relationship between characters and the set.',
    formatNote: 'Stage plays ARE structured as acts containing scenes. List scenes within each act with clear stage directions.',
  },
  podcast: {
    primaryUnit: 'Episode',
    primaryUnitPlural: 'Episodes',
    typicalCount: [6, 20],
    structure: 'serialized or anthology with season arc',
    unitContent: [
      'Episode Title',
      'Episode Runtime Target',
      'Cold Open / Hook — audio hook that grabs the listener',
      'Episode Summary — narrative beats for this episode',
      'Sound Design Notes — key audio cues, music, ambient sound',
      'Voice Cast — which characters/narrators are heard',
      'Cliffhanger / Outro — how the episode ends and teases the next',
    ],
    doNot: 'Do NOT write for the eye. Audio drama is about what the listener HEARS — sound, silence, voice, and pacing matter more than visuals.',
    formatNote: 'Podcast outlines should emphasize the audio experience. Note sound design, voice layering, and pacing for the ear.',
  },
  'graphic-novel': {
    primaryUnit: 'Chapter',
    primaryUnitPlural: 'Chapters',
    typicalCount: [5, 12],
    structure: 'visual narrative with page-turn reveals',
    unitContent: [
      'Page Count Target',
      'Chapter Summary — narrative arc described visually',
      'Key Splash Pages / Spreads — pivotal visual moments',
      'Panel Density — tight grid vs. open layouts',
      'Visual Motifs — recurring imagery for this chapter',
      'Dialogue Load — heavy, moderate, or silent stretches',
      'Page-Turn Reveals — what the reader discovers on a turn',
    ],
    doNot: 'Do NOT describe like a novel. Graphic novels are paced by page turns and panel layouts. Think visually.',
    formatNote: 'Graphic novel outlines should feel like a storyboard plan. Emphasize visual pacing and page-turn dramatic reveals.',
  },
  interactive: {
    primaryUnit: 'Branch',
    primaryUnitPlural: 'Branches',
    typicalCount: [5, 15],
    structure: 'branching narrative with convergence points',
    unitContent: [
      'Branch / Node Name',
      'Entry Conditions — how the reader arrives here',
      'Narrative Content — what happens in this passage',
      'Choices Offered — what decisions the reader can make',
      'Consequences — where each choice leads',
      'Convergence — does this branch rejoin the main path?',
      'Variables Tracked — any state changes (trust, inventory, flags)',
    ],
    doNot: 'Do NOT write linearly. Interactive fiction is a graph, not a line. Map the branching structure clearly.',
    formatNote: 'Interactive fiction outlines should map the decision tree. Show branches, convergence points, and how choices affect the narrative.',
  },
  essay: {
    primaryUnit: 'Section',
    primaryUnitPlural: 'Sections',
    typicalCount: [3, 8],
    structure: 'argument-driven with thesis and evidence',
    unitContent: [
      'Section Heading',
      'Section Thesis — the argument this section makes',
      'Key Points — 2-3 main points with supporting evidence',
      'Transition — how this section connects to the next',
    ],
    doNot: 'Do NOT narrativize an essay. Essays argue — keep the outline focused on thesis, evidence, and logical progression.',
    formatNote: 'Essay outlines should read like an argument map. Each section advances the thesis with clear logical structure.',
  },
};

// Helper: get outline profile for a medium key, with fallback to novel
export function getOutlineProfile(mediumKey) {
  return MEDIUM_OUTLINE_PROFILES[mediumKey] || MEDIUM_OUTLINE_PROFILES.novel;
}

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
  { key: 'anthropic', label: 'Anthropic (Claude)', models: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001', 'claude-sonnet-4-5', 'claude-opus-4-5'], apiKeyUrl: 'https://console.anthropic.com/settings/keys' },
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
  // Anthropic — current (Claude 4.6)
  'claude-opus-4-6':              { context: 1000000, maxOutput: 128000 },
  'claude-sonnet-4-6':            { context: 1000000, maxOutput: 64000 },
  'claude-haiku-4-5':             { context: 200000,  maxOutput: 64000 },
  // Anthropic — legacy
  'claude-sonnet-4-5':            { context: 200000,  maxOutput: 64000 },
  'claude-opus-4-5':              { context: 200000,  maxOutput: 64000 },
  'claude-sonnet-4-0':            { context: 200000,  maxOutput: 64000 },
  'claude-opus-4-0':              { context: 200000,  maxOutput: 32000 },
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
  advanced: { label: 'Advanced', description: 'Four specialized roles with individual model assignment' },
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
