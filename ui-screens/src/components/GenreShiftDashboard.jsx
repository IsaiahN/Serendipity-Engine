/**
 * ParadigmShiftDashboard.jsx  (still exported as GenreShiftDashboard for compat)
 *
 * Unified panel for exploring paradigm shifts:
 *  - Multi-select genre blending
 *  - Medium transposition
 *  - POV character change
 *  - Narrator tone/style change
 *
 * When "Create Shifted Project" is clicked:
 *  1. Forks the source project (deep copy)
 *  2. Deletes chapters/scenes, chapter notes, summaries (so they regenerate fresh)
 *  3. Filters characters to only those the POV character would interact with
 *  4. Regenerates narrator.md, abstract.md, outline.md, story/arc.md via LLM
 *  5. Resets phase answers — phases 1-5 stay complete, 6+ are marked incomplete
 *  6. Shows a blur overlay while generating
 *  7. Navigates to new project after generation completes
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useLlmStore } from '../stores/llmStore';
import { STORY_MEDIUMS } from '../lib/constants';
import db from '../lib/db';
import fileContents from '../data/fileData';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Zap,
  Sparkles, User, Mic, BookOpen, Layers, Eye, Loader2, Pencil,
} from 'lucide-react';
import Button from './Button';
import Card from './Card';

// ── Genre list ──
const GENRES = [
  'Literary Fiction', 'Thriller', 'Horror', 'Romance', 'Science Fiction',
  'Fantasy', 'Mystery', 'Historical Fiction', 'Comedy', 'Drama',
  'Dystopian', 'Magical Realism', 'Western', 'Crime', 'Gothic',
  'Satire', 'Adventure', 'Psychological', 'Noir', 'Mythic',
  'Surrealist', 'Absurdist', 'Slice of Life', 'Erotica',
];

// ── Narrator styles ──
const NARRATOR_STYLES = [
  { key: 'hardboiled', label: 'Hard-boiled', desc: 'Terse, cynical, street-wise' },
  { key: 'lyrical', label: 'Lyrical', desc: 'Poetic, flowing, image-rich' },
  { key: 'minimalist', label: 'Minimalist', desc: 'Sparse, Hemingway-esque' },
  { key: 'baroque', label: 'Baroque', desc: 'Ornate, dense, maximalist' },
  { key: 'sardonic', label: 'Sardonic', desc: 'Dry wit, dark humor' },
  { key: 'earnest', label: 'Earnest', desc: 'Sincere, warm, hopeful' },
  { key: 'gothic', label: 'Gothic', desc: 'Dark, atmospheric, brooding' },
  { key: 'whimsical', label: 'Whimsical', desc: 'Playful, light, fantastical' },
  { key: 'journalistic', label: 'Journalistic', desc: 'Factual, observational, neutral' },
  { key: 'stream', label: 'Stream of Consciousness', desc: 'Unfiltered inner monologue' },
  { key: 'unreliable', label: 'Unreliable Narrator', desc: 'Deceptive, contradictory' },
  { key: 'epistolary', label: 'Epistolary', desc: 'Letters, diaries, found documents' },
];

// ── Generation step definitions ──
const GENERATION_STEPS = [
  { key: 'filter-characters', label: 'Filtering characters for new POV' },
  { key: 'delete-chapters', label: 'Clearing chapter files' },
  { key: 'gen-narrator', label: 'Regenerating narrator voice' },
  { key: 'gen-abstract', label: 'Regenerating story abstract' },
  { key: 'gen-outline', label: 'Regenerating outline' },
  { key: 'gen-arc', label: 'Regenerating story arc' },
  { key: 'gen-world', label: 'Updating world building' },
  { key: 'gen-characters', label: 'Regenerating character profiles' },
  { key: 'gen-phase-answers', label: 'Rewriting guide answers for new POV' },
  { key: 'reset-phases', label: 'Resetting phase progress' },
  { key: 'finalize', label: 'Finalizing project' },
];

// ── Chip component ──
function Chip({ selected, onClick, children, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 100,
        border: selected ? `2px solid ${accent || 'var(--accent)'}` : '1px solid var(--border)',
        background: selected ? `${accent || 'var(--accent)'}18` : 'var(--bg-card)',
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontWeight: selected ? 600 : 400,
        fontSize: '0.82rem',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

// ── Section header ──
function Section({ icon: Icon, title, subtitle, expanded, onToggle, accent, children }) {
  return (
    <Card style={{ marginBottom: 16, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '14px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', color: 'var(--text-primary)',
        }}
      >
        {Icon && <Icon size={16} color={accent || 'var(--accent)'} />}
        <span style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1, textAlign: 'left' }}>{title}</span>
        {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 8 }}>{subtitle}</span>}
        {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {expanded && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </Card>
  );
}

// ── Generation overlay ──
function GenerationOverlay({ currentStep, completedSteps, totalSteps, stepLabel }) {
  const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24,
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: '40px 48px',
        maxWidth: 520, width: '90%', textAlign: 'center',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <Sparkles size={36} color="var(--accent)" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Generating Shifted Project
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          Re-imagining the story from a new perspective...
        </p>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: 6, background: 'var(--bg-tertiary)',
          borderRadius: 100, overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{
            height: '100%', borderRadius: 100,
            background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
            width: `${pct}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>

        {/* Step label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Loader2 size={14} style={{ animation: 'spin 1.2s linear infinite' }} color="var(--accent)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {stepLabel || 'Preparing...'}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Step {completedSteps + 1} of {totalSteps} ({pct}%)
        </div>
      </div>
    </div>
  );
}


/**
 * Determine which characters the POV character would realistically interact with.
 * Returns an array of character slugs that should be KEPT.
 *
 * Algorithm:
 * 1. The POV character always stays
 * 2. Scan each character file for mentions of the POV character's name
 * 3. Scan the POV character's file for mentions of other characters
 * 4. Scan story files for co-occurrence (both names within same paragraph)
 * 5. Characters with strong connections stay; others are removed
 */
function filterCharactersForPOV(povSlug, characters, files) {
  const povChar = characters.find(c => c.slug === povSlug);
  if (!povChar) return characters.map(c => c.slug);

  const povName = povChar.name.toLowerCase();
  const povFirstName = povName.split(' ')[0];
  const povContent = (files[`characters/${povSlug}.md`] || '').toLowerCase();

  // Gather all story content
  const storyContent = Object.entries(files)
    .filter(([p]) => p.startsWith('story/') && p.endsWith('.md'))
    .map(([, c]) => (c || '').toLowerCase())
    .join('\n\n');

  // Also gather relationship file content
  const relContent = Object.entries(files)
    .filter(([p]) => p.startsWith('relationships/') && p.endsWith('.md'))
    .map(([, c]) => (c || '').toLowerCase())
    .join('\n\n');

  // Score each character's connection to the POV character
  const scores = {};
  for (const char of characters) {
    if (char.slug === povSlug) {
      scores[char.slug] = 999; // POV always keeps
      continue;
    }

    const charName = char.name.toLowerCase();
    const charFirstName = charName.split(' ')[0];
    const charContent = (files[`characters/${char.slug}.md`] || '').toLowerCase();
    let score = 0;

    // 1. POV's character file mentions this character
    if (povContent.includes(charName) || povContent.includes(charFirstName)) {
      score += 10;
    }

    // 2. This character's file mentions the POV character
    if (charContent.includes(povName) || charContent.includes(povFirstName)) {
      score += 10;
    }

    // 3. Relationship files mention both characters
    if ((relContent.includes(charName) || relContent.includes(charFirstName)) &&
        (relContent.includes(povName) || relContent.includes(povFirstName))) {
      score += 8;
    }

    // 4. Story co-occurrence — split into paragraphs and check for both names
    const paragraphs = storyContent.split(/\n\n+/);
    let coOccurrences = 0;
    for (const para of paragraphs) {
      const hasPov = para.includes(povName) || para.includes(povFirstName);
      const hasChar = para.includes(charName) || para.includes(charFirstName);
      if (hasPov && hasChar) coOccurrences++;
    }
    score += Math.min(coOccurrences * 2, 20); // Cap at 20

    // 5. Check if this character appears in the outline near the POV character
    const outline = (files['outline.md'] || '').toLowerCase();
    if ((outline.includes(charName) || outline.includes(charFirstName)) &&
        (outline.includes(povName) || outline.includes(povFirstName))) {
      score += 5;
    }

    // 6. World building might mention both
    const worldContent = (files['world/world-building.md'] || '').toLowerCase();
    if (worldContent.includes(charName) || worldContent.includes(charFirstName)) {
      score += 2;
    }

    scores[char.slug] = score;
  }

  // Keep characters with score > 0 (any connection at all)
  // But also keep characters that appear central in the story even without direct POV link
  const kept = characters
    .filter(c => scores[c.slug] > 0)
    .map(c => c.slug);

  // Safety: always keep at least the POV character + 1 other if available
  if (kept.length <= 1 && characters.length > 1) {
    // Sort remaining by whatever score they have, add top ones
    const sorted = characters
      .filter(c => c.slug !== povSlug)
      .sort((a, b) => (scores[b.slug] || 0) - (scores[a.slug] || 0));
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      if (!kept.includes(sorted[i].slug)) kept.push(sorted[i].slug);
    }
  }

  return kept;
}


function GenreShiftDashboard() {
  const navigate = useNavigate();
  const activeProject = useProjectStore(s => s.activeProject);
  const files = useProjectStore(s => s.files);
  const updateProject = useProjectStore(s => s.updateProject);
  const updateFile = useProjectStore(s => s.updateFile);
  const forkProject = useProjectStore(s => s.forkProject);
  const deleteFiles = useProjectStore(s => s.deleteFiles);
  const sendMessage = useLlmStore.getState().sendMessage;

  // ── Shift selections ──
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [targetMedium, setTargetMedium] = useState(null);
  const [povCharacter, setPovCharacter] = useState(null);
  const [narratorStyle, setNarratorStyle] = useState(null);

  // ── UI state ──
  const [expanded, setExpanded] = useState({
    currentState: true,
    genres: true,
    medium: false,
    pov: false,
    narrator: false,
    analysis: true,
    apply: true,
    history: false,
  });
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [applyMode, setApplyMode] = useState('fork');
  const [applying, setApplying] = useState(false);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [customTitle, setCustomTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);

  // ── Generation overlay state ──
  const [generationOverlay, setGenerationOverlay] = useState(null);

  // ── Derived data: Characters ──
  // Helper: parse character names from a markdown content blob
  const parseCharsFromContent = useCallback((content) => {
    const parsed = [];
    const seen = new Set();

    // Stopwords: common sentence starters / non-name words that appear at line starts
    const STOP = /^(yes|no|none|all|each|every|some|the|this|that|both|not|but|and|or|if|so|her|his|she|he|they|it|we|my|our|its|there|here|very|only|also|just|like|from|with|into|over|by|about|more|most|much|many|such|other|what|when|where|which|while|because|although|however|therefore|furthermore|meanwhile|additionally|fundamentally|ultimately|essentially|generally|basically|initially|originally|overall|primarily|subsequently|together|perhaps|never|always|sometimes|often|usually|really|quite|rather|indeed|certainly|probably|possibly|eventually|apparently)$/i;

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
    for (const pat of [/who is the protagonist\?[*_\s]*\n+\s*([A-Z][A-Za-z'., -]+?)[\s—–]/im, /who is the antagonist\?[*_\s]*\n+\s*([A-Z][A-Za-z'., -]+?)[\s—–]/im]) {
      const m = content.match(pat);
      if (m) addChar(m[1].trim());
    }
    // Match "### CharacterName" headers
    for (const m of content.matchAll(/^###\s+([A-Z][A-Za-z'., -]+?)(?:\s*[—–(]|$)/gm)) addChar(m[1].trim());
    // Match "**CharacterName**" bold names
    for (const m of content.matchAll(/\*\*([A-Z][A-Za-z'., -]{2,40})\*\*/g)) {
      if (!/^(who|what|how|the cast|protagonist|antagonist|supporting|note|genre|theme)/i.test(m[1].trim())) addChar(m[1].trim());
    }
    // Match "Name — description" lines (require at least one uppercase word to be a name)
    for (const m of content.matchAll(/^([A-Z][A-Za-z'., -]{2,40})\s*[—–]\s/gm)) {
      const candidate = m[1].trim();
      // Only accept if it looks like a proper name (has at least one capitalized word)
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
  }, []);

  // Individual character files (characters/dorothy.md, characters/toto.md, etc.)
  const individualChars = useMemo(() => {
    return Object.entries(files)
      .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions'))
      .map(([path, content]) => {
        const slug = path.replace('characters/', '').replace('.md', '');
        const h1 = (content || '').split('\n').find(l => l.startsWith('# '));
        const clean = h1 ? h1.replace(/^#+\s+/, '').replace(/\s*[—–]+\s*(Character|Literary|Deep).*/i, '').replace(/\s*\([^)]*\)\s*$/, '') : null;
        const name = clean || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { slug, name, path };
      });
  }, [files]);

  // Fallback: async-load from IndexedDB for decomposed projects where store content is empty
  const [dbParsedChars, setDbParsedChars] = useState([]);
  useEffect(() => {
    if (individualChars.length > 0) return;
    if (!activeProject?.id) return;

    // Check store files first (non-empty content)
    const storeContent = (path) => (files[path] && files[path].trim()) ? files[path] : null;

    const qaText = storeContent('characters/questions-answered.md');
    if (qaText) {
      const chars = parseCharsFromContent(qaText);
      if (chars.length > 0) { setDbParsedChars(chars); return; }
    }

    const storyQaText = storeContent('story/questions-answered.md');
    if (storyQaText) {
      const chars = parseCharsFromContent(storyQaText);
      if (chars.length > 0) { setDbParsedChars(chars); return; }
    }

    // Check if this is the demo project, and only then use static fileData fallback
    const demoId = localStorage.getItem('demoProjectId');
    const isDemo = demoId && String(activeProject.id) === String(demoId);

    if (isDemo) {
      const tryStatic = (path) => {
        const fc = fileContents[path];
        if (fc?.content) {
          return Array.isArray(fc.content) ? fc.content.join('\n\n') : String(fc.content);
        }
        return null;
      };
      for (const p of ['characters/questions-answered.md', 'story/questions-answered.md']) {
        const text = tryStatic(p);
        if (text) {
          const chars = parseCharsFromContent(text);
          if (chars.length > 0) { setDbParsedChars(chars); return; }
        }
      }
    }

    // Last resort: async DB fetch in case content is stored there
    (async () => {
      try {
        for (const path of ['characters/questions-answered.md', 'story/questions-answered.md']) {
          const record = await db.projectFiles
            .where('[projectId+path]')
            .equals([activeProject.id, path])
            .first();
          if (record?.content) {
            const chars = parseCharsFromContent(record.content);
            if (chars.length > 0) { setDbParsedChars(chars); return; }
          }
        }
      } catch (err) {
        console.warn('[ParadigmShift] Failed to load chars from DB:', err);
      }
    })();
  }, [activeProject?.id, individualChars.length, parseCharsFromContent]);

  const characters = individualChars.length > 0 ? individualChars : dbParsedChars;

  const currentMediumObj = STORY_MEDIUMS.find(m => m.key === activeProject?.medium) || STORY_MEDIUMS[0];
  const hasAnySelection = selectedGenres.length > 0 || targetMedium || povCharacter || narratorStyle;

  // Count active shifts for summary
  const shiftCount = [
    selectedGenres.length > 0,
    !!targetMedium,
    !!povCharacter,
    !!narratorStyle,
  ].filter(Boolean).length;

  // ── Load history ──
  useEffect(() => {
    const historyContent = files['drawing-board/genre-shifts.md'] || '';
    if (historyContent) {
      const shifts = historyContent.split('\n').filter(l => l.startsWith('- ')).map(s => s.replace(/^- /, ''));
      setShiftHistory(shifts);
    }
  }, [files]);

  if (!activeProject) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No project loaded. Open a project to use Paradigm Shift.
      </div>
    );
  }

  // ── Genre toggle (multi-select) ──
  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  // ── Toggle section ──
  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Build summary of selected shifts ──
  const buildShiftSummary = () => {
    const parts = [];
    if (selectedGenres.length > 0) parts.push(`Genres: ${selectedGenres.join(' + ')}`);
    if (targetMedium) {
      const med = STORY_MEDIUMS.find(m => m.key === targetMedium);
      parts.push(`Medium: ${med?.label || targetMedium}`);
    }
    if (povCharacter) {
      const char = characters.find(c => c.slug === povCharacter);
      parts.push(`POV: ${char?.name || povCharacter}`);
    }
    if (narratorStyle) {
      const style = NARRATOR_STYLES.find(s => s.key === narratorStyle);
      parts.push(`Narrator: ${style?.label || narratorStyle}`);
    }
    return parts.join(' | ');
  };

  // ── Build the shift title suffix for new project ──
  const buildTitleSuffix = () => {
    const parts = [];
    if (selectedGenres.length > 0) parts.push(selectedGenres.join('/'));
    if (povCharacter) {
      const char = characters.find(c => c.slug === povCharacter);
      parts.push(`${char?.name?.split(' ')[0] || 'Alt'} POV`);
    }
    if (narratorStyle) {
      const style = NARRATOR_STYLES.find(s => s.key === narratorStyle);
      parts.push(style?.label || narratorStyle);
    }
    if (targetMedium) {
      const med = STORY_MEDIUMS.find(m => m.key === targetMedium);
      parts.push(med?.label || targetMedium);
    }
    return parts.join(' · ');
  };

  // ── Analysis prompt ──
  const buildAnalysisPrompt = () => {
    const currentGenre = activeProject.genre || 'Unknown';
    const currentMedium = activeProject.medium || 'novel';
    const outline = files['outline.md'] || '';
    const charSummary = characters.map(c => {
      const content = files[`characters/${c.slug}.md`] || '';
      const firstPara = content.split('\n\n').slice(0, 2).join('\n');
      return `**${c.name}**: ${firstPara.slice(0, 300)}`;
    }).join('\n\n');
    const narrator = files['narrator.md'] || '';

    let shiftDesc = '';
    if (selectedGenres.length > 0) shiftDesc += `\n- **Genre blend**: ${selectedGenres.join(' + ')} (currently: ${currentGenre})`;
    if (targetMedium) {
      const med = STORY_MEDIUMS.find(m => m.key === targetMedium);
      shiftDesc += `\n- **Medium**: ${med?.label || targetMedium} (currently: ${currentMedium})`;
    }
    if (povCharacter) {
      const char = characters.find(c => c.slug === povCharacter);
      shiftDesc += `\n- **POV Character**: Retell from ${char?.name || povCharacter}'s perspective`;
    }
    if (narratorStyle) {
      const style = NARRATOR_STYLES.find(s => s.key === narratorStyle);
      shiftDesc += `\n- **Narrator Style**: ${style?.label} — ${style?.desc}`;
    }

    return `## Current Story\n**Genre:** ${currentGenre} | **Medium:** ${currentMedium}\n\n### Outline\n${outline.slice(0, 1500) || '(none)'}\n\n### Characters\n${charSummary || '(none)'}\n\n### Narrator\n${narrator.slice(0, 500) || '(none)'}\n\n---\n\n## Paradigm Shift\nAnalyze what would change if the following shifts were applied simultaneously:${shiftDesc}\n\nProvide a concrete impact analysis:\n1. **Tone & Voice** — How the emotional texture shifts\n2. **Character Reframing** — How arcs, motivations, relationships change\n3. **Plot & Structure** — What scenes/events change, are cut, or added\n4. **World & Setting** — Environmental/atmospheric shifts\n5. **New Possibilities** — Creative opportunities the shift unlocks\n6. **Risks & Losses** — What might be lost or weakened\n\nBe specific — reference actual story elements.`;
  };

  // ── Analyze ──
  const handleAnalyze = async () => {
    if (!hasAnySelection) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysis(null);
    const result = await sendMessage({
      messages: [
        { role: 'system', content: 'You are a narrative craft expert analyzing how paradigm shifts (genre, medium, POV, narrator style) would transform a story. Be specific and grounded.' },
        { role: 'user', content: buildAnalysisPrompt() },
      ],
      role: 'chat',
      maxTokens: 2500,
    });
    if (result.success) setAnalysis(result.content);
    else setAnalysisError(result.error || 'Failed to generate analysis.');
    setAnalysisLoading(false);
  };

  // ── Helper: update generation overlay step ──
  const updateOverlayStep = (stepIdx) => {
    setGenerationOverlay({
      currentStep: GENERATION_STEPS[stepIdx]?.key || 'unknown',
      completedSteps: stepIdx,
      totalSteps: GENERATION_STEPS.length,
      stepLabel: GENERATION_STEPS[stepIdx]?.label || 'Processing...',
    });
  };

  // ── Build context for LLM generation ──
  const buildShiftContext = () => {
    const parts = [];
    parts.push(`# Original Story: "${activeProject.title}"`);
    parts.push(`**Original Genre:** ${activeProject.genre || 'Not specified'}`);
    parts.push(`**Original Medium:** ${activeProject.medium || 'novel'}`);
    parts.push('');

    // Shift parameters
    parts.push('## Paradigm Shift Parameters');
    if (selectedGenres.length > 0) parts.push(`- **New Genre(s):** ${selectedGenres.join(' / ')}`);
    if (targetMedium) {
      const med = STORY_MEDIUMS.find(m => m.key === targetMedium);
      parts.push(`- **New Medium:** ${med?.label || targetMedium}`);
    }
    if (povCharacter) {
      const char = characters.find(c => c.slug === povCharacter);
      parts.push(`- **New POV Character:** ${char?.name || povCharacter}`);
    }
    if (narratorStyle) {
      const style = NARRATOR_STYLES.find(s => s.key === narratorStyle);
      parts.push(`- **New Narrator Style:** ${style?.label} — ${style?.desc}`);
    }
    parts.push('');

    // Source material
    const outline = files['outline.md'] || '';
    const abstract = files['abstract.md'] || '';
    const narrator = files['narrator.md'] || '';
    const arc = files['story/arc.md'] || '';
    const world = files['world/world-building.md'] || '';
    const author = files['author.md'] || '';

    if (abstract) parts.push(`## Original Abstract\n${abstract.slice(0, 2000)}\n`);
    if (outline) parts.push(`## Original Outline\n${outline.slice(0, 4000)}\n`);
    if (arc) parts.push(`## Original Story Arc\n${arc.slice(0, 2000)}\n`);
    if (narrator) parts.push(`## Original Narrator\n${narrator.slice(0, 1500)}\n`);
    if (world) parts.push(`## Original World\n${world.slice(0, 2000)}\n`);
    if (author) parts.push(`## Author Profile\n${author.slice(0, 1000)}\n`);

    return parts.join('\n');
  };

  // ── Apply all shifts at once ──
  const handleApplyAll = async () => {
    if (!hasAnySelection) return;
    setApplying(true);
    setAnalysisError(null);

    try {
      const updates = {};
      if (selectedGenres.length > 0) updates.genre = selectedGenres.join(' / ');
      if (targetMedium) {
        updates.medium = targetMedium;
        const med = STORY_MEDIUMS.find(m => m.key === targetMedium);
        if (med) updates.wordGoal = Math.floor((med.wordRange[0] + med.wordRange[1]) / 2);
      }

      const suffix = buildTitleSuffix();
      const historyEntry = buildShiftSummary();
      const forkTitle = customTitle || `${activeProject.title} — ${suffix}`;

      if (applyMode === 'fork') {
        // Show the generation overlay
        updateOverlayStep(0);

        // ── Step 0: Fork the project (deep copy of all files) ──
        const forked = await forkProject(activeProject.id, {
          title: forkTitle,
          forkType: 'paradigm-shift',
        });

        if (!forked) throw new Error('Failed to fork project');

        // NOTE: Do NOT call setActiveProject here — it unmounts GenreShiftDashboard
        // and kills the async pipeline. We call it after all generation steps complete.
        const store = useProjectStore.getState();

        // Helpers: operate on the FORKED project directly via DB
        // (We can't use store methods because they use activeProjectId which is still the original)
        const updateForkedFile = async (path, content) => {
          const existing = await db.projectFiles
            .where('[projectId+path]')
            .equals([forked.id, path])
            .first();
          if (existing) {
            await db.projectFiles.update(existing.id, { content, updatedAt: Date.now() });
          } else {
            await db.projectFiles.add({ projectId: forked.id, path, content, updatedAt: Date.now() });
          }
        };

        const deleteForkedFiles = async (paths) => {
          for (const pathPattern of paths) {
            if (pathPattern.endsWith('*')) {
              const prefix = pathPattern.slice(0, -1);
              const matches = await db.projectFiles
                .where('projectId').equals(forked.id)
                .filter(f => f.path.startsWith(prefix))
                .toArray();
              for (const m of matches) {
                await db.projectFiles.delete(m.id);
              }
            } else {
              const record = await db.projectFiles
                .where('[projectId+path]')
                .equals([forked.id, pathPattern])
                .first();
              if (record) await db.projectFiles.delete(record.id);
            }
          }
        };

        // ── Step 1: Filter characters for new POV ──
        updateOverlayStep(0);
        let keptCharSlugs = characters.map(c => c.slug); // default: keep all
        const povChar = povCharacter ? characters.find(c => c.slug === povCharacter) : null;

        if (povCharacter) {
          keptCharSlugs = filterCharactersForPOV(povCharacter, characters, files);

          // Delete character files for characters that didn't make the cut
          const toDelete = characters
            .filter(c => !keptCharSlugs.includes(c.slug))
            .map(c => `characters/${c.slug}.md`);
          if (toDelete.length > 0) {
            await deleteForkedFiles(toDelete);
          }
        }

        // ── Step 2: Delete chapter files, notes, summaries ──
        updateOverlayStep(1);
        const chapterFilePaths = Object.keys(files).filter(p =>
          p.match(/^story\/(chapter|act|scene|episode|part|section|passage|page)-\d+/) ||
          p.match(/^story\/.*-(notes|summary)\.md$/) ||
          p === 'story/chapter-checklist.md' ||
          p === 'story/metafiles-review.md'
        );
        if (chapterFilePaths.length > 0) {
          await deleteForkedFiles(chapterFilePaths);
        }
        // Also clear the dry-run audit since it's from the old structure
        await deleteForkedFiles(['dry-run-audit.md']);

        // ── Step 3: Build shift context for LLM ──
        const shiftContext = buildShiftContext();
        const genreStr = selectedGenres.length > 0 ? selectedGenres.join(' / ') : (activeProject.genre || 'General Fiction');
        const mediumStr = targetMedium
          ? (STORY_MEDIUMS.find(m => m.key === targetMedium)?.label || targetMedium)
          : (STORY_MEDIUMS.find(m => m.key === activeProject.medium)?.label || 'Novel');
        const povStr = povChar ? povChar.name : 'the original protagonist';
        const styleStr = narratorStyle
          ? NARRATOR_STYLES.find(s => s.key === narratorStyle)
          : null;

        // Check if LLM is available
        const llmAvailable = useLlmStore.getState().activeProviders?.length > 0;


        // Timeout wrapper to prevent hanging on slow/dead LLM providers
        const withTimeout = (promise, ms = 8000) =>
          Promise.race([
            promise,
            new Promise(resolve => setTimeout(() => resolve({ success: false, error: 'timeout' }), ms)),
          ]);

        // ── Step 4: Regenerate narrator.md ──
        updateOverlayStep(2);
        if (llmAvailable) {
          const narratorResult = await withTimeout(sendMessage({
            messages: [
              { role: 'system', content: 'You are an expert narrative designer. Generate a comprehensive narrator profile in Markdown. No em-dashes. Be specific and grounded in the source material. Output ONLY the markdown content, no preamble.' },
              { role: 'user', content: `${shiftContext}\n\n---\n\nGenerate a complete narrator.md for this shifted story.\n\nThe story is now told from **${povStr}**'s perspective.\nGenre: ${genreStr}\nMedium: ${mediumStr}\n${styleStr ? `Narrator Style: ${styleStr.label} -- ${styleStr.desc}` : ''}\n\nInclude:\n- Point of view (1st person if POV shift, otherwise appropriate)\n- Narrative voice and tense\n- Reliability assessment\n- Tonal qualities\n- How this narrator perceives and describes the world\n- What this narrator would notice vs. miss\n- Voice fingerprint (speech patterns, vocabulary, metaphor family)\n\nGround everything in what ${povStr} would actually know, see, and feel. This character's limitations and biases should shape the narration.` },
            ],
            role: 'generator',
            maxTokens: 2000,
          }));
          if (narratorResult.success) {
            await updateForkedFile('narrator.md', narratorResult.content);
          }
        } else {
          // Fallback: write a template narrator file
          const narratorTemplate = `# Narrator Profile — ${forkTitle}\n\n## Point of View\n${povChar ? `First person, told through **${povStr}**'s eyes and voice.` : 'Third person limited.'}\n\n## Genre & Style\n**Genre:** ${genreStr}\n**Medium:** ${mediumStr}\n${styleStr ? `**Style:** ${styleStr.label} — ${styleStr.desc}` : ''}\n\n## Voice Notes\n*This narrator profile needs to be developed. Use the Narrator phase (Phase 2) to flesh out the voice, tense, reliability, and tonal qualities.*\n\n## What This Narrator Knows\n${povChar ? `${povStr} can only narrate what they directly witness, overhear, or are told. Their biases, fears, and desires color every description.` : 'Standard narrative awareness.'}\n`;
          await updateForkedFile('narrator.md', narratorTemplate);
        }

        // ── Step 5: Regenerate abstract.md ──
        updateOverlayStep(3);
        if (llmAvailable) {
          const abstractResult = await withTimeout(sendMessage({
            messages: [
              { role: 'system', content: 'You are an expert story architect. Generate a compelling story abstract/pitch in Markdown. No em-dashes. Output ONLY the markdown content.' },
              { role: 'user', content: `${shiftContext}\n\n---\n\nGenerate a new abstract.md for this shifted story.\n\nThis is now a **${genreStr}** ${mediumStr.toLowerCase()} told from **${povStr}**'s perspective.\n\nThe abstract should:\n- Open with a hook that reflects the new genre/POV\n- Describe the story as ${povStr} would understand it\n- Highlight the central conflict from this new angle\n- Show what's at stake for ${povStr} specifically\n- Suggest the emotional journey and thematic core\n- Be 200-400 words\n\nRemember: events that the original POV character knew about might be mysteries to ${povStr}, and vice versa. Lean into that.` },
            ],
            role: 'generator',
            maxTokens: 1500,
          }));
          if (abstractResult.success) {
            await updateForkedFile('abstract.md', abstractResult.content);
          }
        } else {
          await updateForkedFile('abstract.md', `# Abstract — ${forkTitle}\n\n*This abstract needs to be written. The story has been shifted to ${genreStr} told from ${povStr}'s perspective as a ${mediumStr.toLowerCase()}.*\n\n*Use Phase 6 (Story Foundation) to develop the abstract.*\n`);
        }

        // ── Step 6: Regenerate outline.md ──
        updateOverlayStep(4);
        if (llmAvailable) {
          const keptCharNames = characters
            .filter(c => keptCharSlugs.includes(c.slug))
            .map(c => c.name);

          const outlineResult = await withTimeout(sendMessage({
            messages: [
              { role: 'system', content: 'You are an expert story architect. Generate a detailed chapter-by-chapter outline in Markdown. No em-dashes. Output ONLY the markdown content.' },
              { role: 'user', content: `${shiftContext}\n\n---\n\nGenerate a new outline.md for this shifted story.\n\nThis is now a **${genreStr}** ${mediumStr.toLowerCase()} told from **${povStr}**'s perspective.\n\nAvailable characters: ${keptCharNames.join(', ')}\n\nThe outline should:\n- Structure the story in chapters/episodes appropriate for a ${mediumStr.toLowerCase()}\n- Every scene must be something ${povStr} is present for or learns about\n- Events the original story told from another POV must be re-imagined from ${povStr}'s limited view\n- Include chapter titles, brief description, key events, and emotional beats\n- Show character interactions ${povStr} would actually have\n- Reflect the ${genreStr} genre conventions and tone\n- Account for what ${povStr} would NOT know (creating mystery, dramatic irony, or surprise)\n- Aim for ${targetMedium ? STORY_MEDIUMS.find(m => m.key === targetMedium)?.wordRange?.join('-') + ' words total' : 'appropriate length'}\n\nBe specific. Reference actual plot points from the original and show how they transform.` },
            ],
            role: 'generator',
            maxTokens: 4000,
          }));
          if (outlineResult.success) {
            await updateForkedFile('outline.md', outlineResult.content);
          }
        } else {
          await updateForkedFile('outline.md', `# Outline — ${forkTitle}\n\n*This outline needs to be developed. The story structure should be reimagined from ${povStr}'s perspective in the ${genreStr} genre.*\n\n*Use Phase 6 (Story Foundation) to build the outline.*\n`);
        }

        // ── Step 7: Regenerate story/arc.md ──
        updateOverlayStep(5);
        if (llmAvailable) {
          const arcResult = await withTimeout(sendMessage({
            messages: [
              { role: 'system', content: 'You are an expert story architect. Generate a story arc document in Markdown. No em-dashes. Output ONLY the markdown content.' },
              { role: 'user', content: `${shiftContext}\n\n---\n\nGenerate a new story/arc.md for this shifted story.\n\nThis is now a **${genreStr}** ${mediumStr.toLowerCase()} with **${povStr}** as the protagonist.\n\nInclude:\n- **Protagonist**: ${povStr}'s internal arc (wound, want, need, growth)\n- **Central Conflict**: What ${povStr} is up against\n- **Stakes**: What ${povStr} stands to lose\n- **Subplots**: Key secondary storylines visible from ${povStr}'s position\n- **Tonal Arc**: How the emotional register shifts across the story (reflecting ${genreStr})\n- **Thematic Core**: What the story is really about, seen through ${povStr}'s eyes\n- **Key Turning Points**: Act breaks and pivotal moments\n\nGround everything in what ${povStr} actually experiences and understands.` },
            ],
            role: 'generator',
            maxTokens: 2500,
          }));
          if (arcResult.success) {
            await updateForkedFile('story/arc.md', arcResult.content);
          }
        } else {
          await updateForkedFile('story/arc.md', `# Story Arc — ${forkTitle}\n\n**Protagonist:** ${povStr}\n**Genre:** ${genreStr}\n\n*This story arc needs to be developed. Use Phase 6 to build out the protagonist's journey, conflict, stakes, and thematic core.*\n`);
        }

        // ── Step 8: Update world building ──
        updateOverlayStep(6);
        if (llmAvailable && (selectedGenres.length > 0 || targetMedium)) {
          const existingWorld = files['world/world-building.md'] || '';
          const worldResult = await withTimeout(sendMessage({
            messages: [
              { role: 'system', content: 'You are an expert world-builder. Update a world-building document to reflect a genre/medium shift. No em-dashes. Output ONLY the markdown content.' },
              { role: 'user', content: `## Current World Building\n${existingWorld.slice(0, 3000)}\n\n---\n\nUpdate this world-building document for a shift to **${genreStr}** as a ${mediumStr.toLowerCase()}.\n\n${povChar ? `The story is now told from ${povStr}'s perspective, so focus on the parts of the world ${povStr} inhabits and interacts with.` : ''}\n\nKeep what still applies, but transform the tone, atmosphere, and emphasis to match the new genre. Add genre-specific world elements (e.g., horror atmosphere, sci-fi technology, romance social dynamics).` },
            ],
            role: 'generator',
            maxTokens: 2500,
          }));
          if (worldResult.success) {
            await updateForkedFile('world/world-building.md', worldResult.content);
          }
        }

        // ── Step 9: Regenerate kept character profiles ──
        updateOverlayStep(7);
        if (llmAvailable && povCharacter) {
          // Regenerate each kept character's profile through the new POV lens
          const keptChars = characters.filter(c => keptCharSlugs.includes(c.slug));
          for (const char of keptChars) {
            const existingProfile = files[`characters/${char.slug}.md`] || '';
            const isPov = char.slug === povCharacter;

            const charResult = await withTimeout(sendMessage({
              messages: [
                { role: 'system', content: 'You are an expert character designer. Rewrite a character profile for a paradigm-shifted story. No em-dashes. Output ONLY the markdown content. Preserve the character attribute tables if present.' },
                { role: 'user', content: `## Existing Character Profile\n${existingProfile.slice(0, 3000)}\n\n---\n\nRewrite this character profile for the shifted story:\n- **Genre:** ${genreStr}\n- **POV Character:** ${povStr}\n- **This character:** ${char.name} ${isPov ? '(THIS IS THE NEW POV CHARACTER / PROTAGONIST)' : ''}\n\n${isPov
                  ? `As the new protagonist, flesh out ${char.name}'s:\n- Internal world (fears, desires, contradictions)\n- How they perceive the other characters\n- Their voice and perspective\n- Their wound and growth arc\n- What they notice vs. what they miss`
                  : `Reframe ${char.name} as seen through ${povStr}'s eyes:\n- How ${povStr} perceives and relates to ${char.name}\n- What ${povStr} knows and doesn't know about ${char.name}\n- Their role in ${povStr}'s story\n- Key interactions from ${povStr}'s perspective`
                }\n\nPreserve the character's core identity but adapt their role for the new genre and POV.` },
              ],
              role: 'generator',
              maxTokens: 2000,
            }));
            if (charResult.success) {
              await updateForkedFile(`characters/${char.slug}.md`, charResult.content);
            }
          }
        }

        // ── Step 10: Regenerate phase answers 1-5 for new POV ──
        updateOverlayStep(8);

        if (llmAvailable && povCharacter) {
          const existingAnswers = { ...(forked.phaseAnswers || {}) };
          const phaseLabels = { 1: 'Author', 2: 'Narrator', 3: 'World', 4: 'Characters', 5: 'Relationships' };
          const phaseInstructions = {
            1: `Keep the author identity but adjust genre and theme answers to reflect the shift to ${povStr}'s perspective in the ${genreStr} genre.`,
            2: `Rewrite for ${povStr}'s narrative perspective. The story is now told through ${povStr}'s eyes, voice, and limitations. Adjust POV, tense, and voice style accordingly.`,
            3: `Reframe the world as ${povStr} experiences it. Focus on what ${povStr} would notice, how they'd perceive the environment, and what aspects of the world matter most from their vantage point.`,
            4: `CRITICAL: ${povStr} is now the PROTAGONIST. Rewrite Q1 ("Who is your protagonist?") to describe ${povStr} in detail. The former protagonist (e.g. Dorothy) becomes a supporting character. Reframe the antagonist and supporting cast from ${povStr}'s perspective.`,
            5: `Reframe all relationships from ${povStr}'s perspective. The central relationship should be the most important bond in ${povStr}'s journey.`,
          };

          // Regenerate each phase separately — decomposed answers can be huge single blobs
          for (const phase of [1, 2, 3, 4, 5]) {
            const phaseKey = String(phase);
            const pAnswers = existingAnswers[phaseKey];
            if (!pAnswers || typeof pAnswers !== 'object') continue;

            // Get all answer content for this phase (may be one big blob in key "1")
            const answerKeys = Object.keys(pAnswers).filter(k => k !== '_decomposed');
            const combinedContent = answerKeys
              .map(k => typeof pAnswers[k] === 'string' ? pAnswers[k] : '')
              .join('\n\n')
              .slice(0, 4000); // truncate to fit LLM context

            if (!combinedContent.trim()) continue;

            const phaseResult = await withTimeout(sendMessage({
              messages: [
                { role: 'system', content: `You are an expert story architect performing a paradigm shift. You will receive original story-guide answers and must rewrite them for a new POV character. RULES:\n1. Output ONLY the rewritten markdown content — no preamble, no instructions, no "Phase" headers, no "Instructions" sections.\n2. Start your output directly with the first heading or content from the original (e.g. "### questions answered" or "# Characters").\n3. Preserve the original markdown structure (headers, bullets, bold) but update ALL substance.\n4. Do NOT echo back any part of the prompt, parameters, or instructions.` },
                { role: 'user', content: `SHIFT PARAMETERS: New protagonist = ${povStr}, Genre = ${genreStr}, Medium = ${mediumStr}${styleStr ? `, Narrator Style = ${styleStr.label}` : ''}\n\nTASK: ${phaseInstructions[phase]}\n\nORIGINAL CONTENT TO REWRITE:\n${combinedContent}\n\nRewrite the above so ${povStr} is the protagonist. Start your output with the first markdown heading from the original content. Do not include any instructions or parameters in your output.` },
              ],
              role: 'generator',
              maxTokens: 4000,
            }), 45000); // 45s timeout — phase answers are large prompts

            if (phaseResult.success && phaseResult.content) {
              // Strip any accidental instructions preamble the LLM may have echoed
              let cleaned = phaseResult.content;
              const contentStart = cleaned.search(/^#{1,3}\s+(questions answered|characters|narrator|world|relationship|author)/im);
              if (contentStart > 0) {
                cleaned = cleaned.substring(contentStart);
              }

              // Replace the primary answer key with the rewritten content
              // Decomposed projects typically store everything in key "1"
              const primaryKey = answerKeys[0] || '1';
              existingAnswers[phaseKey] = { ...pAnswers };
              existingAnswers[phaseKey][primaryKey] = cleaned;
              delete existingAnswers[phaseKey]._decomposed;
            } else {
              console.warn(`[ParadigmShift] Phase ${phase} regen failed:`, phaseResult.error || 'no content');
            }
          }
          // Write back so the metadata step below uses the updated answers
          forked.phaseAnswers = existingAnswers;
        }

        // ── Step 11: Reset phase answers and project metadata ──
        updateOverlayStep(9);

        // Build the full update payload for the forked project
        const dbUpdates = {
          ...updates,
          mode: 'create',
          isDecomposed: false,
          updatedAt: Date.now(),
        };

        // Ensure metadata.mode is set to 'create'
        dbUpdates.metadata = { ...(activeProject.metadata || {}), mode: 'create' };

        // Reset phase answers: keep phases 1-5 content but clear decomposed flags,
        // and wipe phases 6+ so they show as incomplete
        const cleanedAnswers = { ...(forked.phaseAnswers || {}) };
        // Remove _decomposed flags from ALL phases (keys may be numbers or strings)
        for (const key of Object.keys(cleanedAnswers)) {
          if (cleanedAnswers[key] && typeof cleanedAnswers[key] === 'object') {
            cleanedAnswers[key] = { ...cleanedAnswers[key] };
            delete cleanedAnswers[key]._decomposed;
          }
        }
        // Clear phases 6+ (story foundation, review, execution, bridge)
        // Phase keys could be numbers ("6", "7", "8") or named ("story", "review", "execution", "bridge")
        const phasesToClear = ['6', '7', '8', '9', 'story', 'review', 'execution', 'bridge', '\u27e1'];
        for (const pk of phasesToClear) {
          delete cleanedAnswers[pk];
        }
        dbUpdates.phaseAnswers = cleanedAnswers;

        // Direct DB update for reliability — bypasses store to avoid timing issues
        try {
          await db.projects.update(forked.id, dbUpdates);
        } catch (dbErr) {
          console.warn('Direct DB update failed, trying store:', dbErr);
        }
        // Also update via store to sync in-memory state
        await store.setActiveProject(forked.id);

        // ── Step 12: Finalize ──
        updateOverlayStep(10);

        // Reload project files to ensure everything is in sync
        await store.loadProjectFiles(forked.id);

        // Small delay for the overlay to show "Finalizing"
        await new Promise(r => setTimeout(r, 600));

        // Clear overlay and navigate
        setGenerationOverlay(null);

        // Navigate to the new project workspace in guide mode
        navigate('/workspace?mode=guide');

      } else {
        // ── Direct apply mode (no fork, no generation) ──
        updateProject(updates);

        if (povCharacter) {
          const char = characters.find(c => c.slug === povCharacter);
          const existing = files['narrator.md'] || '';
          const povNote = `\n\n---\n## POV Shift\nThis story is now told from **${char?.name || povCharacter}**'s perspective.\n`;
          updateFile('narrator.md', existing + povNote);
        }

        if (narratorStyle) {
          const style = NARRATOR_STYLES.find(s => s.key === narratorStyle);
          const existing = files['narrator.md'] || '';
          const styleNote = `\n\n---\n## Narrator Style Shift\nNarrator style: **${style?.label}** — ${style?.desc}\n`;
          updateFile('narrator.md', existing + styleNote);
        }
      }

      // Record history
      const timestamp = new Date().toLocaleString();
      const newEntry = `${historyEntry} (${applyMode === 'fork' ? 'new project' : 'applied'}) — ${timestamp}`;
      const updatedHistory = [newEntry, ...shiftHistory];
      setShiftHistory(updatedHistory);

      // Only update history on original project if we're still on it
      if (applyMode !== 'fork') {
        updateFile('drawing-board/genre-shifts.md', ['# Paradigm Shift History', '', ...updatedHistory.map(h => `- ${h}`)].join('\n'));
      }

      // Reset selections
      setSelectedGenres([]);
      setTargetMedium(null);
      setPovCharacter(null);
      setNarratorStyle(null);
      setAnalysis(null);
      setCustomTitle('');
      setIsEditingTitle(false);
    } catch (err) {
      setGenerationOverlay(null);
      setAnalysisError(`Failed to apply: ${err.message}`);
    }
    setApplying(false);
  };

  return (
    <div style={{ padding: '1.25rem', maxWidth: 1100, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      {/* ─ Generation overlay ─ */}
      {generationOverlay && (
        <GenerationOverlay
          currentStep={generationOverlay.currentStep}
          completedSteps={generationOverlay.completedSteps}
          totalSteps={generationOverlay.totalSteps}
          stepLabel={generationOverlay.stepLabel}
        />
      )}

      {/* ─ Header ─ */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="var(--accent)" />
          Paradigm Shift
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Mix and match genre blends, POV, narrator style, and medium — then apply all at once.
          When creating a new project, chapters are cleared and the outline, characters, and narrator are regenerated to match the new paradigm.
        </p>
      </div>

      {/* ─ Current State ─ */}
      <Section icon={BookOpen} title="Current State" expanded={expanded.currentState} onToggle={() => toggle('currentState')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <StateChip label="Genre" value={activeProject.genre || 'Not set'} />
          <StateChip label="Medium" value={currentMediumObj.label} />
          <StateChip label="Rating" value={activeProject.contentRating || 'Not set'} />
          <StateChip label="Word Goal" value={`${(activeProject.wordGoal || 0).toLocaleString()} words`} />
        </div>
      </Section>

      {/* ─ Genre Blend (multi-select) ─ */}
      <Section
        icon={Layers}
        title="Genre Blend"
        subtitle={selectedGenres.length > 0 ? `${selectedGenres.length} selected` : null}
        expanded={expanded.genres}
        onToggle={() => toggle('genres')}
        accent="#a78bfa"
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Select one or more genres to blend. Current: <strong>{activeProject.genre || 'Not set'}</strong>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {GENRES.map(genre => (
            <Chip
              key={genre}
              selected={selectedGenres.includes(genre)}
              onClick={() => toggleGenre(genre)}
              accent="#a78bfa"
            >
              {genre === activeProject.genre && '• '}
              {genre}
            </Chip>
          ))}
        </div>
        {selectedGenres.length > 1 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(167,139,250,0.08)', borderRadius: 8, fontSize: '0.8rem', color: '#a78bfa' }}>
            Blend: {selectedGenres.join(' + ')}
          </div>
        )}
      </Section>

      {/* ─ POV Character ─ */}
      <Section
        icon={Eye}
        title="Change POV Character"
        subtitle={povCharacter ? characters.find(c => c.slug === povCharacter)?.name : null}
        expanded={expanded.pov}
        onToggle={() => toggle('pov')}
        accent="#2dd4bf"
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Retell the story from a different character's perspective. Characters not connected to the new POV will be filtered out.
        </p>
        {characters.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No characters found in project.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {characters.map(char => (
                <Chip
                  key={char.slug}
                  selected={povCharacter === char.slug}
                  onClick={() => setPovCharacter(prev => prev === char.slug ? null : char.slug)}
                  accent="#2dd4bf"
                >
                  <User size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {char.name}
                </Chip>
              ))}
            </div>
            {/* Preview which characters would be kept */}
            {povCharacter && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(45,212,191,0.08)', borderRadius: 8, fontSize: '0.8rem', border: '1px solid rgba(45,212,191,0.2)' }}>
                <div style={{ fontWeight: 600, color: '#2dd4bf', marginBottom: 6 }}>Character Filter Preview</div>
                {(() => {
                  const kept = filterCharactersForPOV(povCharacter, characters, files);
                  const keptChars = characters.filter(c => kept.includes(c.slug));
                  const removedChars = characters.filter(c => !kept.includes(c.slug));
                  return (
                    <>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
                        <strong>Kept ({keptChars.length}):</strong> {keptChars.map(c => c.name).join(', ')}
                      </div>
                      {removedChars.length > 0 && (
                        <div style={{ color: 'var(--text-muted)' }}>
                          <strong>Removed ({removedChars.length}):</strong> {removedChars.map(c => c.name).join(', ')}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </Section>

      {/* ─ Narrator Style ─ */}
      <Section
        icon={Mic}
        title="Narrator Style"
        subtitle={narratorStyle ? NARRATOR_STYLES.find(s => s.key === narratorStyle)?.label : null}
        expanded={expanded.narrator}
        onToggle={() => toggle('narrator')}
        accent="#fbbf24"
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Change the narrative voice and tone.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {NARRATOR_STYLES.map(style => (
            <button
              key={style.key}
              onClick={() => setNarratorStyle(prev => prev === style.key ? null : style.key)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: narratorStyle === style.key ? '2px solid #fbbf24' : '1px solid var(--border)',
                background: narratorStyle === style.key ? 'rgba(251,191,36,0.08)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: narratorStyle === style.key ? '#fbbf24' : 'var(--text-primary)', marginBottom: 2 }}>
                {style.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{style.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* ─ Medium Transposition ─ */}
      <Section
        icon={BookOpen}
        title="Medium Transposition"
        subtitle={targetMedium ? STORY_MEDIUMS.find(m => m.key === targetMedium)?.label : null}
        expanded={expanded.medium}
        onToggle={() => toggle('medium')}
        accent="#f97316"
      >
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          Transpose to a different story medium. Current: <strong>{currentMediumObj.label}</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {STORY_MEDIUMS.map(med => (
            <button
              key={med.key}
              onClick={() => setTargetMedium(prev => prev === med.key ? null : med.key)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: targetMedium === med.key ? '2px solid #f97316' : '1px solid var(--border)',
                background: med.key === activeProject.medium ? 'var(--bg-tertiary)' : targetMedium === med.key ? 'rgba(249,115,22,0.08)' : 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: med.key === activeProject.medium ? 600 : 500, fontSize: '0.85rem', color: targetMedium === med.key ? '#f97316' : 'var(--text-primary)' }}>
                {med.key === activeProject.medium && '• '}
                {med.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {med.wordRange[0].toLocaleString()} – {med.wordRange[1].toLocaleString()} words
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* ─ Impact Analysis ─ */}
      {hasAnySelection && (
        <Section icon={Zap} title="Impact Analysis" expanded={expanded.analysis} onToggle={() => toggle('analysis')} accent="#818cf8">
          {!analysis && !analysisLoading && (
            <Button variant="primary" onClick={handleAnalyze} style={{ marginBottom: 12 }}>
              <Zap size={14} style={{ marginRight: 6 }} />
              Analyze Paradigm Shift
            </Button>
          )}
          {analysisError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, marginBottom: 12, display: 'flex', gap: 8, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{analysisError}</span>
            </div>
          )}
          {analysisLoading && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Loader2 size={20} style={{ animation: 'spin 1.2s linear infinite', marginRight: 8, verticalAlign: 'middle' }} />
              Analyzing paradigm shift...
            </div>
          )}
          {analysis && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, lineHeight: 1.65, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <AnalysisContent content={analysis} />
            </div>
          )}
        </Section>
      )}

      {/* ─ Apply All ─ */}
      {hasAnySelection && (
        <Card style={{ marginBottom: 16, padding: 20 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
            Apply Paradigm Shift
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
              {shiftCount} shift{shiftCount > 1 ? 's' : ''} selected
            </span>
          </h3>

          {/* Summary of what's being applied */}
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {selectedGenres.length > 0 && <div><strong>Genres:</strong> {selectedGenres.join(' + ')}</div>}
            {povCharacter && <div><strong>POV:</strong> {characters.find(c => c.slug === povCharacter)?.name}</div>}
            {narratorStyle && <div><strong>Narrator:</strong> {NARRATOR_STYLES.find(s => s.key === narratorStyle)?.label}</div>}
            {targetMedium && <div><strong>Medium:</strong> {STORY_MEDIUMS.find(m => m.key === targetMedium)?.label}</div>}
          </div>

          {/* What will happen */}
          <div style={{
            marginBottom: 16, padding: '10px 14px',
            background: 'rgba(168, 85, 247, 0.06)', borderRadius: 8,
            border: '1px solid rgba(168, 85, 247, 0.15)',
            fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontSize: '0.82rem' }}>
              What happens when you create a shifted project:
            </div>
            <div>1. A copy of your project is created with all source material</div>
            <div>2. Chapter files are cleared (they'll be rewritten from scratch)</div>
            {povCharacter && <div>3. Characters are filtered to those connected to the new POV</div>}
            <div>{povCharacter ? '4' : '3'}. Narrator, abstract, outline, and story arc are regenerated by AI</div>
            <div>{povCharacter ? '5' : '4'}. Phase progress resets for Story Foundation onward</div>
            <div>{povCharacter ? '6' : '5'}. You land in the new project ready to write</div>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="applyMode" value="fork" checked={applyMode === 'fork'} onChange={() => setApplyMode('fork')} />
              <span>Create new project <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(recommended)</span></span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="radio" name="applyMode" value="direct" checked={applyMode === 'direct'} onChange={() => setApplyMode('direct')} />
              <span>Apply to current project <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(metadata only)</span></span>
            </label>
          </div>

          {/* Editable title for fork */}
          {applyMode === 'fork' && (
            <div style={{ marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>New project:</span>
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); if (e.key === 'Escape') { setCustomTitle(''); setIsEditingTitle(false); } }}
                    style={{
                      flex: 1, fontSize: '0.85rem', fontWeight: 600,
                      color: 'var(--text-primary)', background: 'var(--bg-tertiary)',
                      border: '1px solid var(--accent)', borderRadius: 4,
                      padding: '3px 8px', outline: 'none', maxWidth: 500,
                    }}
                  />
                ) : (
                  <>
                    <strong style={{ color: 'var(--text-secondary)' }}>
                      {customTitle || `${activeProject.title} — ${buildTitleSuffix()}`}
                    </strong>
                    <button
                      onClick={() => {
                        setCustomTitle(customTitle || `${activeProject.title} — ${buildTitleSuffix()}`);
                        setIsEditingTitle(true);
                        setTimeout(() => titleInputRef.current?.focus(), 50);
                      }}
                      title="Edit project title"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: 2, display: 'flex',
                        alignItems: 'center', borderRadius: 4, transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      <Pencil size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Single Apply button */}
          <Button
            variant="primary"
            onClick={handleApplyAll}
            disabled={applying}
            style={{ minWidth: 200 }}
          >
            {applying ? (
              <><Loader2 size={14} style={{ animation: 'spin 1.2s linear infinite', marginRight: 6 }} /> Generating...</>
            ) : applyMode === 'fork' ? (
              <><Sparkles size={14} style={{ marginRight: 6 }} /> Create Shifted Project</>
            ) : (
              <><Zap size={14} style={{ marginRight: 6 }} /> Apply All Shifts</>
            )}
          </Button>

          {applyMode === 'direct' && (
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
              Direct apply only updates genre, medium, and narrator metadata. No files are regenerated.
            </p>
          )}
        </Card>
      )}

      {/* ─ History ─ */}
      {shiftHistory.length > 0 && (
        <Section icon={RefreshCw} title="Shift History" expanded={expanded.history} onToggle={() => toggle('history')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shiftHistory.map((shift, idx) => (
              <div key={idx} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {shift}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ──

function StateChip({ label, value }) {
  return (
    <div style={{ padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

function AnalysisContent({ content }) {
  const sections = content.split(/\n(?=\d\.\s+\*\*)/);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sections.map((section, idx) => {
        const lines = section.split('\n');
        const titleLine = lines[0] || '';
        const bodyLines = lines.slice(1);
        const titleMatch = titleLine.match(/\d\.\s+\*\*(.+?)\*\*/);
        const title = titleMatch ? titleMatch[1] : titleLine;
        return (
          <div key={idx}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>{title}</h4>
            <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.88rem' }}>
              {bodyLines.map((line, li) => {
                if (!line.trim()) return null;
                const parts = line.split(/(\*\*[^*]+\*\*)/);
                return (
                  <p key={li} style={{ marginBottom: 4 }}>
                    {parts.map((part, pi) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={pi}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GenreShiftDashboard;
