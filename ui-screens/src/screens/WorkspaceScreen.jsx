import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import PhaseProgress from '../components/PhaseProgress';
import CastRoster from '../components/CastRoster';
import HealthBar from '../components/HealthBar';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  FileText, FolderTree, ChevronRight, ChevronDown,
  Compass, Edit3, BookOpen, GitCompare, Network, MessageSquare,
  Clock, Palette, Settings, Download, Volume2, Search,
  Lightbulb, AlertTriangle, Pencil, ChevronUp, Send, SendHorizontal, ChevronsLeft, ChevronsRight, Globe,
  Upload, Library, ArrowLeftRight, TrendingUp, Brain, Eye, Globe2, Users, Heart, BarChart3, Music, HelpCircle, UserCheck, Sparkles, ChevronLeft,
} from 'lucide-react';

/* ─── Smooth Auto-Scroll Utility ─── */
/* Drop <ScrollIntoView /> at the end of content that appears after a wizard selection. */
function ScrollIntoView({ delay = 80 }) {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <div ref={ref} />;
}

const centerStageModes = [
  { key: 'guided', icon: Compass, label: 'Guide' },
  { key: 'chat', icon: MessageSquare, label: 'Story Assistant' },
  { key: 'reader', icon: BookOpen, label: 'Reader' },
  { key: 'editor', icon: Edit3, label: 'Editor' },
  { key: 'timeline', icon: Clock, label: 'Timeline' },
  { key: 'graph', icon: Network, label: 'Relationships' },
  { key: 'world', icon: Globe, label: 'World Building' },
  { key: 'comparison', icon: GitCompare, label: 'Comparison' },
  { key: 'board', icon: Palette, label: 'Drawing Board' },
];

const fileTree = [
  // Story project files (from Creations)
  { name: 'author.md', exists: true },
  { name: 'narrator.md', exists: true },
  { name: 'abstract.md', exists: true },
  { name: 'outline.md', exists: true },
  { name: 'dry-run-audit.md', exists: true },
  { name: 'characters/', exists: true, children: [
    'maren-yoder.md', 'ruth-yoder.md', 'bishop-ezra-eicher.md',
    'esther-flint.md', 'jean-luc-dupree.md', 'clara-penner-thumbnail.md',
    'questions-answered.md',
  ]},
  { name: 'relationships/', exists: true, children: ['questions-answered.md'] },
  { name: 'world/', exists: true, children: ['world-building.md', 'questions-answered.md'] },
  { name: 'story/', exists: true, children: [
    'arc.md', 'chapter-1.md', 'chapter-1-notes.md',
    'chapter-checklist.md', 'metafiles-review.md', 'questions-answered.md',
  ]},
  { name: 'feedback/', exists: true, children: ['editor-v1.md'] },
  { name: 'drawing-board/', exists: true, children: ['notes.md'] },
  { name: 'media/', exists: true, children: ['characters/', 'hallmarks/', 'locations/'] },
  // Engine reference files (Quality Control / MetaFiles)
  { name: 'quality-control/', exists: true, section: 'engine', children: [
    'Master-Story-Checklist.md', 'seven-story-deaths.md', 'story-consciousness-theory.md',
    'story-network-theory.md', 'tonal-control.md', 'writing-prose-styles.md',
    'language-content.md', 'randomization-engine.md', 'author-profile-template.md',
    'questions.md',
  ]},
  { name: 'engine-characters/', exists: true, section: 'engine', children: [
    'Identity/', 'Personality/', 'Development/', 'Names/', 'Questions.md',
  ]},
  { name: 'engine-story/', exists: true, section: 'engine', children: [
    'genres.md', 'narrator.md', 'plot-structure.md', 'plot-twist-types.md',
    'narrative-techniques.md', 'story-elements.md', 'themes-and-tropes.md',
    'world-hallmarks.md', 'questions.md', 'World Building/',
  ]},
  { name: 'engine-relationships/', exists: true, section: 'engine', children: [
    'relationship-dynamics.md', 'relationship-types.md', 'relationship-structures.md',
    'questions.md',
  ]},
];

const healthDimensions = [
  { name: 'Author Depth', rating: 5 },
  { name: 'Narrator Clarity', rating: 4 },
  { name: 'World Integrity', rating: 3, flag: 'Seven Deaths audit: 2 unresolved' },
  { name: 'Character Depth', rating: 2, flag: 'Two characters share same wound' },
  { name: 'Relationship Arch.', rating: 3 },
  { name: 'Story Structure', rating: 4 },
  { name: 'Theoretical Alignment', rating: 3 },
  { name: 'Voice Consistency', rating: 4 },
  { name: 'Conflict Depth', rating: 3 },
  { name: 'Theme Resonance', rating: 5 },
];

/* ─── Center Stage Content ─── */
function GuidedFlow() {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.3s ease' }}>
      <Badge variant="muted" style={{ marginBottom: 12 }}>Phase 4 — World / Question 4 of 8</Badge>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>
        What are the hallmarks of this world?
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7 }}>
        Hallmarks are the objects, symbols, places, and recurring elements that make your story world recognizable. Think of them as the visual and cultural DNA — what would someone see in a movie poster?
      </p>
      <div style={{
        background: 'var(--accent-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 16,
        marginBottom: 24,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
      }}>
        <Lightbulb size={14} color="var(--accent)" style={{ marginRight: 6 }} />
        Example: In a Mennonite thriller, hallmarks might include prayer caps, horse-drawn buggies, gas lamps, the community kitchen, the shunning chair, and the county line.
      </div>
      <textarea
        placeholder="Describe the hallmarks of your story's world..."
        style={{
          width: '100%', minHeight: 120, padding: 16,
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)', fontSize: '0.9rem', resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button variant="ghost" onClick={() => {}}>← Previous</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => {}}>
            <Sparkles size={14} style={{ marginRight: 4 }} /> Roll for Me
          </Button>
          <Button variant="primary" onClick={() => {}}>Continue →</Button>
        </div>
      </div>
    </div>
  );
}

function EditorMode() {
  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editor Review — Chapter 5</h2>
        <Badge variant="accent">Pass 2</Badge>
      </div>
      <div style={{
        background: '#1a1410',
        border: '1px solid #3d2e1a',
        borderRadius: 'var(--radius-md)',
        padding: 24,
        minHeight: 300,
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <Badge style={{ background: '#f9731622', color: '#f97316' }}>3 Issues</Badge>
          <Badge style={{ background: '#fbbf2422', color: '#fbbf24' }}>5 Suggestions</Badge>
          <Badge style={{ background: '#4ade8022', color: '#4ade80' }}>2 Strengths</Badge>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#d4a574', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#f97316' }}>Issue:</strong> Marcus's dialogue in the confrontation scene (lines 34-41) sounds too formal for someone in emotional crisis. His register should drop — shorter sentences, fragments, raw vocabulary.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: '#fbbf24' }}>Suggestion:</strong> The physical description of the hallway before Elena opens the door is doing important tension work. Consider extending it — the reader needs to feel her hesitation before the reveal.
          </p>
          <p>
            <strong style={{ color: '#4ade80' }}>Strength:</strong> The emotional trajectory from dread → shock → fury → quiet grief is perfectly paced. The fury is brief and cathartic — the grief that replaces it is the real payload. Don't change this.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button variant="primary">Accept All</Button>
        <Button variant="secondary">Review One by One</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>
    </div>
  );
}

// Sample content for different files
const fileContents = {
  'story/chapter-1.md': {
    title: 'Chapter 1 — The Quilt',
    content: [
      'The quilting frame had been in Miriam\'s family for four generations, though no one could say exactly who had built it. Oak, hand-planed, with joints so tight you couldn\'t slide a hair between them. It stood in the front room like an altar, and in a way that\'s what it was.',
      'Every Tuesday, the women came. Ruth first, always Ruth, carrying her basket of scraps sorted by color and weight. Then the Stoltzfus sisters, whispering between themselves about something Miriam was never meant to hear. Sarah Miller arrived last, because Sarah Miller always arrived last.',
      'Miriam threaded her needle and bent to the frame. The pattern this season was Double Wedding Ring — interlocking circles that required precision she found almost meditative. Each stitch a tiny prayer. Each circle a bond she wasn\'t sure she believed in anymore.',
    ],
    chapter: true, chapterNum: 1, totalChapters: 12, pages: 12,
  },
  'story/chapter-2.md': {
    title: 'Chapter 2 — The Letter',
    content: [
      'Daniel found the letter on a Thursday. Miriam knew because she\'d hidden it inside the almanac — the one book he never opened — and when she came in from hanging laundry, the almanac was on the kitchen table, spine cracked, pages fanned like a confession.',
      'He didn\'t say anything at supper. Passed the bread, bowed his head for grace, asked Hannah about her arithmetic. Normal as breathing. But his eyes never found Miriam\'s, and that silence was louder than any shout the Bishop had ever delivered from the pulpit.',
      'She washed the dishes slowly, letting the hot water sting her hands. Behind her, Daniel\'s chair scraped back. His boots crossed the kitchen floor. The back door opened and closed. She didn\'t turn around.',
    ],
    chapter: true, chapterNum: 2, totalChapters: 12, pages: 9,
  },
  'story/arc.md': {
    title: 'Story Arc',
    content: [
      '# The Shunning Season — Story Arc\n\n## Act 1: The Quiet Before (Chapters 1-3)\nMiriam\'s world appears stable but something is fraying. Introduce the quilting circle, the community rhythms, and the first hints that Miriam harbors a secret self. The letter is discovered.',
      '## Act 2: The Tightening (Chapters 4-9)\nBishop Lapp\'s new restrictions force everyone to choose sides. Daniel pulls away. Ruth becomes Miriam\'s lifeline. Sarah leverages the situation. Eli offers dangerous wisdom. Hannah begins her own awakening.',
      '## Act 3: The Reckoning (Chapters 10-12)\nThe shunning vote. Miriam must decide: submit and keep everything she loves, or leave and keep herself. The answer is not what anyone expects — including Miriam.',
    ],
    chapter: false,
  },
  'author.md': {
    title: 'Author Notes',
    content: [
      '# Author Profile\n\nWriting this story from a place of deep respect for Amish culture while being honest about the universal tension between belonging and autonomy. Research includes two years of reading, three visits to Lancaster County, and conversations with people who\'ve left.',
      'The goal is not to judge the community but to inhabit one woman\'s experience with full emotional fidelity. Miriam is not a hero. She\'s a person in an impossible situation making the least wrong choice she can find.',
    ],
    chapter: false,
  },
  'narrator.md': {
    title: 'Narrator Voice',
    content: [
      '# Narrator\n\nClose third person, Miriam\'s POV throughout. The narrator knows only what Miriam knows, sees what she sees, misunderstands what she misunderstands. Prose style: quiet, precise, attentive to the physical world. Short sentences in crisis, longer ones in calm.',
      'Key constraint: The narrator never explains Amish customs. They exist as given. The reader learns by immersion, the way Miriam lives — inside it, without distance.',
    ],
    chapter: false,
  },
  'world/world-building.md': {
    title: 'World Building',
    content: [
      '# World — Lancaster Settlement\n\nA fictional Old Order Amish district in Lancaster County, Pennsylvania. Population approximately 180 baptized members across 12 families. The settlement sits in a shallow valley between two ridges, with the English town of Millbrook four miles east.',
      '## Key Locations\n- **Yoder Homestead**: White clapboard farmhouse, 40 acres. The kitchen is where everything happens.\n- **Meeting House rotation**: Services move between homes. Hosting is both honor and burden.\n- **Byler General Store**: Community hub. Ruth runs the counter.\n- **The Covered Bridge**: Boundary between worlds. Where Hannah goes to think.',
    ],
    chapter: false,
  },
  'world/hallmarks.md': {
    title: 'Hallmarks',
    content: [
      '# Hallmarks — Recurring Sensory Anchors\n\nThese are the physical textures that make this world real. Each appears multiple times and carries accumulating meaning.',
      '**The Quilting Frame** — Community and silence. Women share truths stitching together that they can\'t say aloud. Chapters 2, 5, 9.\n\n**Kerosene Lamplight** — Warm amber glow = safety. Flickering = doubt. Extinguished = crisis.\n\n**The Garden** — Miriam\'s private space. Growing things = nurturing secret self. Seasons mirror her arc.\n\n**Bread Baking** — Communal duty. Miriam kneads anger into dough. Breaking bread = reconciliation or hypocrisy.\n\n**The Letter** — An unsent letter to the outside world. Represents hidden desire. Found = catastrophe.',
    ],
    chapter: false,
  },
  'characters/elena.md': {
    title: 'Character — Elena',
    content: ['# Elena\n\nProtagonist of the parallel timeline. Elena\'s journey mirrors Miriam\'s in a contemporary urban setting — the same questions of belonging vs. authenticity played out against different walls.'],
    chapter: false,
  },

  /* ── Engine Reference: Quality Control (MetaFiles) ── */
  'quality-control/Master-Story-Checklist.md': {
    title: 'Master Story Checklist',
    content: [
      '# Master Story Checklist\n\n*The complete workflow for generating a story using the Serendipity Engine — from first roll to final chapter.*',
      '## DECOMPOSITION MODE — Read This First\n\n> **If you are generating a new story from scratch, skip this entire section and proceed to "Before You Begin — Seed the Engine" below. Nothing here applies.**\n>\n> **If you have been given an existing work to decompose — a novel, play, screenplay, short story, or any completed narrative text — this section replaces the standard generation pipeline.**',
      '### What Decomposition Is\n\nDecomposition is the process of reverse-engineering an existing work through the Serendipity Engine\'s vocabulary. Instead of rolling attributes to generate a story, you are reading a finished story and reconstructing the attribute set that produced it. The output is a forensic structural audit: what the author had (consciously or not), what the system would have generated, and where the work deviates from what the engine would have built.',
      'The output folder mirrors the Creations folder exactly — same files, same structure — but every claim is annotated with an epistemic marker:\n\n- **[CONFIRMED]** — directly verifiable from the text or from independently verifiable biographical/historical fact\n- **[INFERRED]** — a reasoned inference; state the reasoning explicitly beside it.',
    ],
    chapter: false,
  },
  'quality-control/seven-story-deaths.md': {
    title: 'The Seven Story Deaths',
    content: [
      '# The Seven Story Deaths\n## The Antilife Seals Applied to Storytelling\n\n*The seven conditions that kill intelligence in networks also kill stories. Each seal describes a failure mode — for characters, for worlds, for casts, for narratives. They are most useful in three ways: as a **diagnostic** (what\'s wrong with this draft?), as a **conflict engine** (what force is the world pushing against?), and as an **antagonist architecture** (what does this villain actually embody?)*',
      '### Seal 1 — The Monolith\n**"All intelligence must centralize."**\n\nThe story funnels everything through one node — one character, one perspective, one explanatory framework. Everything must pass through the protagonist to matter.\n\n**In characters:** The hero who must be the best at everything, know the most, solve every problem. No specialization. The cast exists to confirm the protagonist\'s centrality.',
      '### Seal 2 — Amnesia\n**"Memory must be ephemeral."**\n\nThe story forgets its own past. Events that should have consequences don\'t. Characters who learned something in Chapter 3 have unlearned it by Chapter 7. The world resets between scenes.',
      '**Story health check:** Can the story\'s knowledge be distributed? Does each character carry something no other character carries? Do events have permanent consequences?',
    ],
    chapter: false,
  },
  'quality-control/story-consciousness-theory.md': {
    title: 'Story Consciousness Theory',
    content: [
      '# Story Consciousness Theory\n## Applied from the Unified Theory of Agent Consciousness\n\n*A character is conscious for the same reason an agent is conscious: they are caught between two streams of knowledge that contradict each other, and they must choose. That choosing IS the story.*',
      '## The Central Claim\n\n**A character\'s consciousness — and by extension, a story — is the weighted integration of two knowledge streams, mediated by an ensemble of internal voices, woven together by a persistent identity thread.**\n\nWhen both streams agree, a character moves through their life automatically. They don\'t notice their own decisions. Nothing interesting happens on the page.\n\nWhen both streams conflict, consciousness becomes vivid. The character must deliberate. They must choose. **This conflict IS the story.**',
      '## Part I: The Two Streams of a Character\n\nEvery character carries two streams of knowledge at all times. Both streams are always active. Both are always influencing behavior. The drama lives in the gap between them.',
    ],
    chapter: false,
  },
  'quality-control/story-network-theory.md': {
    title: 'Story Network Theory',
    content: [
      '# Story Network Theory\n## Applied from the Unified Network Theory of Intelligence\n\n*A story world is an organism. Characters are its temporary neurons. The world persists. The characters die. And when they\'re gone, what they discovered — if it mattered — becomes part of what the world knows.*',
      '## The Central Claim\n\n**No single character can carry a story. No single storyline can contain a theme. Stories are distributed intelligence systems, and their power emerges from the network — from what multiple characters, subplots, relationships, and images discover and validate together.**\n\nThe traditional view: the protagonist IS the story.\nThe network view: the story world IS the organism. The protagonist is one neuron. A particularly important one — but still temporary.',
      '## Part I: The World-as-Organism\n\nThe world is not a setting. It is not a backdrop. It is the living system within which every character, event, and relationship exists. It has its own logic, its own memory, its own way of preserving or destroying knowledge.',
    ],
    chapter: false,
  },
  'quality-control/tonal-control.md': {
    title: 'Tonal Control',
    content: [
      '# Tonal Control\n\n*The sustained management of a story\'s emotional register across its full length. Tone is not mood — it is the author\'s consistent attitude toward the material, expressed through every sentence-level decision: word choice, syntax, what is named and what is withheld, how violence or tenderness or absurdity is framed.*',
      '## What Tone Is Not\n\n**Tone is not emotional register.** Register is what a character feels. Tone is the author\'s relationship to what the character feels — how it is framed, how much weight it receives, whether the narrative leans in or holds back.\n\n**Tone is not genre.** Horror and comedy can share the same tone (deadpan). Romance and tragedy can share the same tone (earnest).\n\n**Tone is not consistent.** A tone that never shifts is flat. Tonal control is not about maintaining the same tone — it is about moving through tones deliberately.',
      '## Tone Types\n\n*Roll 1 as the dominant authorial tone, or derive from the author\'s rolled Moral Alignment + Life Philosophy. This is the default stance the prose returns to when not in a designed departure.*',
    ],
    chapter: false,
  },
  'quality-control/writing-prose-styles.md': {
    title: 'Writing Prose Styles',
    content: [
      '# Writing Prose Styles\n\n*Author-specific. The literary tradition, era, cultural voice, and prose tendencies that shape how this author writes — not what they write about, but how the words feel on the page.*',
      '## Literary Eras & Their Tendencies\n\n**1900s–1910s — Edwardian & Late Victorian** — Formal, ornate, morally structured. Long sentences. Class consciousness. Restraint as a virtue.\n*Touchstones: Henry James, E.M. Forster, Edith Wharton*\n\n**1920s–1930s — Modernism** — Fragmented, stream-of-consciousness, experimental. Time is elastic. Interiority over plot.\n*Touchstones: Virginia Woolf, James Joyce, William Faulkner, Gertrude Stein*',
      '**1950s–1960s — The Beats & Postwar Realism** — Raw, spontaneous, confessional. Reject structure. Movement as meaning.\n*Touchstones: Jack Kerouac, Allen Ginsberg, James Baldwin, Flannery O\'Connor*\n\n**1970s–1980s — Minimalism & Dirty Realism** — Sparse, declarative, emotionally submerged. What\'s left out matters more.\n*Touchstones: Raymond Carver, Joan Didion, Denis Johnson, Bobbie Ann Mason*',
    ],
    chapter: false,
  },
  'quality-control/language-content.md': {
    title: 'Language & Content',
    content: [
      '# Language & Tone\n\n*A reference for content calibration — swear words, euphemisms, intensity levels, and witty banter patterns. Used to tune the voice of a character or author and filter content for audience rating.*',
      '## Content Rating Levels\n\n**G / All Ages** — No profanity. No explicit content. Conflict exists but violence and sexuality are implied or off-page.\n\n**PG / Kids–Tweens** — Mild exclamations (damn, hell). Conflict and stakes can be real. No sexual content.\n\n**PG-13 / Teens** — Moderate profanity (shit, ass, bastard). Romantic tension without explicit content. Violence can be present but not gratuitous.\n\n**R / Adult** — Full profanity permitted. Sexual content can be present and moderately explicit. Violence can be graphic.\n\n**18+ / Explicit** — No restrictions. Language, violence, and sexual content are limited only by the story\'s needs.',
    ],
    chapter: false,
  },
  'quality-control/randomization-engine.md': {
    title: 'Randomization Engine',
    content: [
      '# Randomization Engine\n\n*File-agnostic. Knows nothing about specific lists. Each list file tells you how many entries it has and how to roll — this file tells you how to roll fairly.*',
      '## 1. Generating a Seed\n\nTake the current datetime and write it as a 12-digit integer:\n\n```\nYYYYMMDDHHMM → e.g. February 22 2026, 2:47 PM = 202602221447\n```\n\nWrite this as the first line of your session file. Every roll in the session derives from it. Same seed = same story. Different seed = different story.',
      '## 2. Rolling Against Any List of N Entries\n\nUse 3-digit windows from the seed. Move through the seed left to right, one digit at a time. Each window gives one roll.\n\n**Formula:** `(3-digit window) mod N` → gives zero-indexed position. Add 1 for the 1-indexed entry.',
    ],
    chapter: false,
  },
  'quality-control/author-profile-template.md': {
    title: 'Author Profile Template',
    content: [
      '# Author Profile — Real Author Template\n\n*Use this file when you are writing as yourself, as a real person, or as a deliberate persona — rather than generating a randomized author in Phase 1.*',
      '## Instructions\n\nAnswer every field directly and honestly. This is not a public document. It is a structural briefing for the story system.\n\nThe wound question (under Development) is the most important field in this file. It is the thing the story will unconsciously be written toward or away from — the generator of the author\'s blind spots, their thematic obsessions, and their instinctive sympathies.',
      'Do not skip the Big Picture Statement. It governs everything in Phase 2 onward.',
    ],
    chapter: false,
  },
  'quality-control/questions.md': {
    title: 'Author Questions',
    content: [
      '# Author Questions\n\n*Questions to build and simulate the author before writing the story. The author\'s life shapes the prose — their wounds, joys, obsessions, and blind spots bleed into every sentence.*',
      '## Identity & Background\n- What is the author\'s gender? How does it inform their voice?\n- What is their cultural, ethnic, or national background?\n- What is their socioeconomic background? How does class shape what they notice?\n- What is their religion or faith — past or present?\n- What language or dialect did they grow up speaking?',
      '## Life Stage & Emotional State\n- How old are they right now?\n- What life stage are they in — hungry and unproven, mid-life reckoning, retrospective elder, grieving, rebuilding?\n- What are they afraid of right now?\n- What do they want most in the world right now — not as a writer, but as a person?',
    ],
    chapter: false,
  },

  /* ── Engine Reference: Characters ── */
  'engine-characters/Questions.md': {
    title: 'Character Roster Questions',
    content: [
      '# Character Roster Questions\n\n*Top-level questions about the cast as a whole — who exists, how they relate, and what work they do in the story.*',
      '## The Cast\n- How many characters does this story need?\n- Who is the protagonist? Is there more than one?\n- Who is the antagonist? Are they a person, a system, or something internal?\n- Which characters are essential to the story\'s engine? Which are disposable?\n- Which characters exist only to serve the protagonist\'s arc, and which have their own?',
      '## Structure & Contrast\n- Do any characters mirror each other — same goal, different methods?\n- Do any characters contrast each other — same situation, different choices?\n- What is the power hierarchy among the characters?\n- Are there characters who shift position in that hierarchy over the course of the story?',
      '## Change & Function\n- Which characters change? Which refuse to change?\n- Is there a character who represents the world\'s status quo? What happens when they\'re challenged?',
    ],
    chapter: false,
  },

  /* ── Engine Reference: Story ── */
  'engine-story/genres.md': {
    title: 'Genres',
    content: [
      '# Genres\n\n> **Author (Phase 1):** Randomly select 2 different sublists; pick 1 genre from each. These are the author\'s home genre and secondary influence.\n> **Story (Phase 3):** Randomly select 3 distinct sublists; pick 1 genre from each. The first is primary; the other two are tonal or structural blends.',
      '## Literary & Contemporary Fiction\nClassic fiction, Coming-of-Age, Contemporary fiction, Domestic fiction, Epistolary, Family saga, Literary fiction, Magical realism, New adult, Picaresque, Short story, Slice of life, Transgressive fiction, Women\'s fiction, Young adult',
      '## Fantasy\nContemporary / Urban, Dark fantasy, Epic / High, Fairy tales / Folklore retellings, Gaslamp / Historical, Hard magic systems, Low / Gritty, Magical realism (crossover), Mythic, Portal, Science fantasy, Soft magic systems, Sword & sorcery',
      '## Mystery & Crime\nClassic whodunit, Cozy mystery, Detective / PI, Hardboiled, Legal thriller, Noir, Police procedural, Psychological suspense, Heist / Caper, True crime fiction, Locked room',
    ],
    chapter: false,
  },
  'engine-story/narrator.md': {
    title: 'Narrator Reference',
    content: [
      '# Narrator\n\n> **Story-level only (Phase 2):** Roll 1 reliability type + 1 perspective, after the Author is built. The narrator is a mask the author puts on — not the author themselves.',
      '## Reliability\n\n### Reliable Narrator\nThe reader can trust the narrator\'s account at face value. Events are reported accurately, even if the narrator lacks full information.\n\n### Unreliable Narrator\nThe narrator\'s credibility is compromised — by inexperience, bias, delusion, trauma, or deliberate deception.\n\n- **Naive** — Unreliable due to inexperience or immaturity\n- **Outsider** — New to the culture or community of the story\n- **Picaro** — Embellishes and exaggerates; a born storyteller\n- **Self-deluded** — Sincerely believes their own false version\n- **Traumatized** — Events distorted by PTSD, grief, or shock\n- **Liar** — Deliberately withholding or fabricating',
      '## Perspective\n\n**First Person** — "I" narration. Deep interiority, limited knowledge. Reader knows only what the narrator knows.\n\n**Second Person** — "You" narration. Unusual, immersive, creates complicity or discomfort.\n\n**Third Person Limited** — Narrator outside the character but bound to their perception.\n\n**Third Person Omniscient** — Narrator knows everything. Can move between characters.',
    ],
    chapter: false,
  },
  'engine-story/plot-structure.md': {
    title: 'Plot & Conflict Structure',
    content: [
      '# Plot & Conflict Structure\n\n> **Story-level only (Phase 3):** Roll or select 1 base structure as the primary spine. A second structure can be layered in but one must dominate — the story needs a single answer to "where are we in the arc?" at any given moment.',
      '## Conflict Types\n\n### Classic Conflict Categories\nMan vs. Self (internal — fear, addiction, identity, grief, guilt)\nMan vs. Man (direct antagonist, personal rivalry, betrayal)\nMan vs. Society (systemic injustice, institutions, cultural norms)\nMan vs. Nature (survival, environment, disaster, animal)\nMan vs. Technology (AI, machines, surveillance, social media)\nMan vs. Fate / Supernatural (destiny, gods, prophecy, the unknown)\nMan vs. Time (deadline, aging, memory, irreversibility)',
      '## Story Structures\n\nThree-Act Structure, Five-Act Structure, Hero\'s Journey, Save the Cat, Kishōtenketsu (introduction–development–twist–reconciliation), In Medias Res, Frame Narrative, Rashomon / Multi-Perspective, Nonlinear / Fragmented, Episodic',
    ],
    chapter: false,
  },
  'engine-story/plot-twist-types.md': {
    title: 'Plot Twist Types',
    content: [
      '# Plot Twist Types\n\n*Categories of narrative surprises that recontextualize what the reader thought they knew.*',
      '## Identity & Recognition\n- **Anagnorisis** — A character discovers a crucial truth about themselves or another\n- **Hidden Identity** — A character is not who they (or the reader) believed\n- **Secret Relationships** — Two characters\' connection is revealed to be different than assumed\n- **Unreliable Memory** — A character\'s recollection is discovered to be false or manipulated\n- **False Expert** — A character\'s authority or knowledge was fabricated',
      '## Betrayal & Alliance\n- **The Mole** — An ally is secretly working against the protagonist\n- **Double Agent** — Loyalties shift or were always elsewhere\n- **Forced Betrayal** — A character betrays under coercion\n- **Enemy to Ally** — An antagonist becomes a collaborator',
    ],
    chapter: false,
  },
  'engine-story/narrative-techniques.md': {
    title: 'Narrative Techniques',
    content: [
      '# Narrative Techniques\n\n*Craft decisions distinct from story content. These are the how, not the what — the mechanisms that deliver the story to the reader.*',
      '## Plot Mechanics\nCall to adventure, Quest / Mission, Obstacles & escalation, Dead ends & false leads, Subplots, Ticking clock, MacGuffin, Red herring, Deus ex machina (use sparingly), Chekhov\'s gun, Foreshadowing / Planted evidence, Flashback / Flashforward',
      '## Information Architecture\nDramatic irony (reader knows more than character), Suspense (reader and character both in the dark), Mystery (reader in the dark, character may not be), Revelation / Anagnorisis, Slow revelation, Unreliable information, Parallel storylines revealing the same theme',
    ],
    chapter: false,
  },
  'engine-story/story-elements.md': {
    title: 'Story Elements',
    content: [
      '# Story Elements\n\n*Every story, in every genre, in every tradition, is built from the same seven materials. These are not steps or phases — they are simultaneous, interdependent dimensions. A weakness in any one element weakens all the others.*',
      '## Element 1 — Theme\n*What the story is secretly asking. Not the answer — the question.*\n\nTheme is the organizing principle that makes a story more than a sequence of events. It is the question the story poses to itself, to its characters, and to the reader.',
      '## Element 2 — Character\n*Who the story happens to, and who changes.*\n\n## Element 3 — Conflict\n*What stands between the character and what they need.*\n\n## Element 4 — World\n*Where the story happens — not a backdrop but a living system.*\n\n## Element 5 — Relationships\n*How characters are connected, and how those connections change.*\n\n## Element 6 — POV & Voice\n*Through whose eyes the reader sees, and in whose voice.*\n\n## Element 7 — Pacing\n*How time moves in the story — the rhythm of scene, summary, and silence.*',
    ],
    chapter: false,
  },
  'engine-story/themes-and-tropes.md': {
    title: 'Themes & Tropes',
    content: [
      '# Themes & Tropes\n\n*Core themes to roll or select, and rolling instructions for designating tropes as straight, subverted, or mutated.*',
      '## Core Themes\n\n**Self & Identity** — Who am I? Can I change? What defines me?\n**Love & Relationships** — What do we owe each other? Can love survive truth?\n**Power & Corruption** — What does power cost? Who deserves it?\n**Freedom & Captivity** — What are the walls, and who built them?\n**Death & Mortality** — How do we face endings? What survives us?\n**Justice & Revenge** — Is justice possible? Where does revenge lead?\n**Truth & Deception** — What do we owe the truth? When is a lie merciful?',
      '## Trope Treatment\n\nFor each rolled trope, designate one treatment:\n- **Straight** — The trope plays as expected. Audience recognition is the asset.\n- **Subverted** — The trope is set up but resolved against expectation.\n- **Mutated** — The trope is recognizable but transplanted into an unexpected context.',
    ],
    chapter: false,
  },
  'engine-story/world-hallmarks.md': {
    title: 'World Hallmarks',
    content: [
      '# World Hallmarks\n\n*Elements so tightly fused with story identity they\'re recognizable outside the text — objects, places, forces, rules. Distinguished from internal callbacks; these are the brand DNA of the story world.*',
      '## What Hallmarks Are\n\nA hallmark is something a fan would put on a poster. It is the thing that, if you removed it, the story would be recognizable but diminished. The One Ring. The TARDIS. The Upside Down. The mockingjay. The wardrobe.\n\nHallmarks are not symbols (those belong to Theme). They are physical, tangible, worldbound — objects, places, forces, or rules that only exist in this story and that the audience associates with it instantly.',
      '## Categories\n\n**Objects** — A physical thing characters interact with. The lightsaber. The golden compass.\n**Places** — A location that only exists in this world. Hogwarts. Narnia. Mordor.\n**Forces** — A natural or supernatural law unique to this world. The Force. Magic systems. Time loops.\n**Rules** — Constraints that shape behavior in this world. The Hunger Games. Fight Club\'s rules.',
    ],
    chapter: false,
  },
  'engine-story/questions.md': {
    title: 'Story Questions',
    content: [
      '# Story Questions\n\n*Top-level questions about the story itself — covering the core, genre & tone, conflict & stakes, character arcs, and world transformation.*',
      '## The Core\n- What is this story about — in one sentence?\n- What is the theme — not the subject, but the question the story asks?\n- How does it end? (Not the plot — the emotional resolution.)\n- Why does this story need to be told now?',
      '## Conflict & Stakes\n- What does the protagonist want? What do they need? Are these the same thing?\n- What stands in the way — externally and internally?\n- What happens if they fail? What happens if they succeed?\n- Are the stakes escalating across the arc?',
    ],
    chapter: false,
  },

  /* ── Engine Reference: Relationships ── */
  'engine-relationships/relationship-dynamics.md': {
    title: 'Relationship Dynamics',
    content: [
      '# Relationship Dynamics\n\n> **Per significant relationship pair (Phase 5):** Roll 1 attachment style per person in the pair (2 rolls), then roll 1 core dynamic + 1 power dynamic.',
      '## Attachment Style\n*How a person emotionally bonds and responds to closeness, separation, and conflict.*\n\n**Secure** — Comfortable with intimacy and independence. Trusts others, communicates needs.\n\n**Anxious / Preoccupied** — Craves closeness but fears abandonment. Hypervigilant to signs of rejection.\n\n**Avoidant / Dismissive** — Values independence above closeness. Withdraws under pressure.\n\n**Fearful-Avoidant / Disorganized** — Wants closeness but is frightened by it. Oscillates between approach and retreat.',
      '## Core Relationship Dynamic\n\n**Demand / Withdrawal** — One person pursues; the other shuts down. The more one pursues, the more the other retreats.\n\n**Pursuer / Distancer** — Similar to demand/withdrawal but less hostile. One always wants more closeness; the other always needs more space.\n\n**Fear / Shame** — One person operates from fear (of abandonment, of loss); the other from shame (of inadequacy, of exposure).\n\n**Caretaker / Dependent** — One person manages the other\'s emotional life. Feels generous at first; becomes resentment.',
    ],
    chapter: false,
  },
  'engine-relationships/relationship-types.md': {
    title: 'Relationship Types',
    content: [
      '# Relationship Types\n\n*Categories of relationships that characters can have, used for rolling and selection during Phase 5.*',
      '## Romantic & Intimate\nHoneymoon, Long-term committed, Secret affair, Forbidden (social/cultural barriers), Friends-to-lovers, Enemies-to-lovers, Arranged / Forced proximity, Long-distance, On-again/off-again, One-sided / Unrequited, Power-imbalanced, Codependent, Polyamorous / Open',
      '## Familial\nParent-child (healthy), Parent-child (toxic), Siblings (close), Siblings (estranged), Chosen family, Inheritance / Legacy, Caretaker-dependent, Intergenerational conflict',
      '## Professional & Adversarial\nMentor-student, Rivals / Competitors, Commander-subordinate, Business partners, Allies of convenience, Captor-captive, Betrayer-betrayed',
    ],
    chapter: false,
  },
  'engine-relationships/relationship-structures.md': {
    title: 'Relationship Structures',
    content: [
      '# Relationship Structures\n\n*How relationships are organized — especially relevant for romantic and intimate relationships.*',
      '## Structures\n\n**Monogamy** — Two people, exclusive commitment.\n\n**Hierarchical Polyamory** — Multiple relationships with a designated primary partner.\n\n**Non-Hierarchical Polyamory** — Multiple relationships with no ranking.\n\n**Solo Poly** — Multiple relationships but the person does not merge lives (no cohabitation, shared finances, etc.)\n\n**Relationship Anarchy** — Rejects all hierarchy and labeling; each relationship is defined on its own terms.\n\n**Triads / Quads / Vees** — Specific multi-person configurations.',
      '**For storytelling:** The structure itself is not the drama — the collision between the structure and the characters\' actual attachment styles is. A character who is Anxious in a non-hierarchical polyamorous relationship will experience very different conflict than a Secure character in the same structure.',
    ],
    chapter: false,
  },
  'engine-relationships/questions.md': {
    title: 'Relationship Questions',
    content: [
      '# Relationship Questions\n\n*Questions about relationships themselves — type, structure, how they met, what each person wants, power dynamics, attachment styles, and how relationships evolve through the story.*',
      '## The Relationship Itself\n- What type of relationship is this? (Romantic, familial, professional, adversarial, etc.)\n- How did they meet? What were their first impressions — and were those impressions accurate?\n- What does each person want from this relationship? Are those desires compatible?',
      '## Power & Dynamics\n- Who has more power? Is it acknowledged or denied?\n- What is the attachment style of each person? How do those styles interact?\n- What is the core dynamic? (Demand/withdrawal, fear/shame, caretaker/dependent?)\n- What happens to this relationship under stress?',
    ],
    chapter: false,
  },
};

// Fallback content for files without specific content
const defaultFileContent = (fileName) => ({
  title: fileName.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  content: [`# ${fileName}\n\nThis file is part of the project structure. Content will be developed as the story progresses.`],
  chapter: false,
});

/* ─── Lightweight Markdown Renderer ─── */
function renderInlineMarkdown(text, keyPrefix = '') {
  // Process inline markdown: bold, italic, code, links, strikethrough
  const parts = [];
  let remaining = text;
  let idx = 0;

  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/, render: (m, k) => <strong key={k}><em>{m[1]}</em></strong> },
    { regex: /\*\*(.+?)\*\*/, render: (m, k) => <strong key={k}>{m[1]}</strong> },
    { regex: /\*(.+?)\*/, render: (m, k) => <em key={k}>{m[1]}</em> },
    { regex: /_(.+?)_/, render: (m, k) => <em key={k}>{m[1]}</em> },
    { regex: /`(.+?)`/, render: (m, k) => <code key={k} style={{ background: 'var(--bg-tertiary)', padding: '1px 5px', borderRadius: 3, fontSize: '0.9em', fontFamily: 'monospace' }}>{m[1]}</code> },
    { regex: /~~(.+?)~~/, render: (m, k) => <del key={k}>{m[1]}</del> },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (m, k) => <a key={k} href={m[2]} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{m[1]}</a> },
  ];

  while (remaining.length > 0) {
    let earliest = null;
    let earliestIndex = Infinity;
    let earliestPattern = null;

    for (const p of patterns) {
      const match = remaining.match(p.regex);
      if (match && match.index < earliestIndex) {
        earliest = match;
        earliestIndex = match.index;
        earliestPattern = p;
      }
    }

    if (earliest && earliestPattern) {
      if (earliestIndex > 0) {
        parts.push(remaining.substring(0, earliestIndex));
      }
      parts.push(earliestPattern.render(earliest, `${keyPrefix}-${idx}`));
      remaining = remaining.substring(earliestIndex + earliest[0].length);
      idx++;
    } else {
      parts.push(remaining);
      break;
    }
  }
  return parts;
}

function MarkdownBlock({ text, isMarkdown }) {
  if (!isMarkdown) {
    return <p style={{ marginBottom: 20, whiteSpace: 'pre-wrap' }}>{text}</p>;
  }

  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];
  let listType = null; // 'ul' or 'ol'
  let codeBlock = null;

  const flushList = () => {
    if (listBuffer.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag key={`list-${elements.length}`} style={{ margin: '12px 0', paddingLeft: 24, lineHeight: 1.8 }}>
          {listBuffer.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{renderInlineMarkdown(item, `li-${elements.length}-${i}`)}</li>)}
        </Tag>
      );
      listBuffer = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fence
    if (line.startsWith('```')) {
      if (codeBlock !== null) {
        elements.push(
          <pre key={`code-${elements.length}`} style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: 16, overflowX: 'auto',
            fontFamily: 'monospace', fontSize: '0.85em', lineHeight: 1.6, margin: '12px 0',
          }}>
            <code>{codeBlock}</code>
          </pre>
        );
        codeBlock = null;
      } else {
        flushList();
        codeBlock = '';
      }
      continue;
    }
    if (codeBlock !== null) {
      codeBlock += (codeBlock ? '\n' : '') + line;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const sizes = { 1: '1.6rem', 2: '1.3rem', 3: '1.1rem', 4: '1rem', 5: '0.9rem', 6: '0.85rem' };
      elements.push(
        <div key={`h-${elements.length}`} style={{
          fontSize: sizes[level], fontWeight: 700, fontFamily: 'system-ui, sans-serif',
          margin: level <= 2 ? '28px 0 12px' : '20px 0 8px',
          borderBottom: level <= 2 ? '1px solid var(--border)' : 'none',
          paddingBottom: level <= 2 ? 8 : 0,
          color: 'var(--text-primary)',
        }}>
          {renderInlineMarkdown(headingMatch[2], `h${level}-${elements.length}`)}
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushList();
      elements.push(<hr key={`hr-${elements.length}`} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`bq-${elements.length}`} style={{
          borderLeft: '3px solid var(--accent)', paddingLeft: 16, margin: '12px 0',
          color: 'var(--text-secondary)', fontStyle: 'italic',
        }}>
          {renderInlineMarkdown(line.substring(2), `bq-${elements.length}`)}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^[\-\*\+]\s+/.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listBuffer.push(line.replace(/^[\-\*\+]\s+/, ''));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listBuffer.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={`p-${elements.length}`} style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}>
        {renderInlineMarkdown(line, `p-${elements.length}`)}
      </p>
    );
  }
  flushList();

  return <>{elements}</>;
}

function ReaderMode({ file, onEdit, editedContent }) {
  const fc = fileContents[file] || defaultFileContent(file || 'chapter-1.md');
  const isMarkdown = file && file.endsWith('.md');
  // If there's edited content, parse it into paragraphs for display
  const displayContent = editedContent !== undefined
    ? { ...fc, content: editedContent.split('\n\n').filter(Boolean), rawText: editedContent }
    : { ...fc, rawText: fc.content.join('\n\n') };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.3s ease' }}>
      {/* Top bar with file name + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fc.title}</span>
          {file && (
            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 100, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {file}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem',
            }}
          >
            <Pencil size={12} /> Edit
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Volume2 size={16} /></button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Settings size={16} /></button>
        </div>
      </div>

      {/* Prose content */}
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: '1.05rem',
        lineHeight: 2,
        color: 'var(--text-primary)',
      }}>
        {isMarkdown ? (
          <MarkdownBlock text={displayContent.rawText} isMarkdown={true} />
        ) : (
          displayContent.content.map((para, i) => (
            <p key={i} style={{
              marginBottom: 20,
              textIndent: displayContent.chapter ? '2em' : 0,
              whiteSpace: 'pre-wrap',
            }}>
              {para}
            </p>
          ))
        )}
      </div>

      {/* Chapter navigation (only for chapter files) */}
      {displayContent.chapter && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40 }}>
          <Button variant="ghost" disabled={fc.chapterNum <= 1}>← Chapter {fc.chapterNum - 1}</Button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>
            Page 1 of {fc.pages}
          </span>
          <Button variant="ghost" disabled={fc.chapterNum >= fc.totalChapters}>Chapter {fc.chapterNum + 1} →</Button>
        </div>
      )}
    </div>
  );
}

/* ─── IDE-like File Editor ─── */
function FileEditorMode({ file, onPreview, onEditorReview, editedContent, onContentChange, onSave }) {
  const fc = fileContents[file] || defaultFileContent(file || 'untitled.md');
  const fallbackText = fc.content.join('\n\n');
  const content = editedContent !== undefined ? editedContent : fallbackText;
  const [saved, setSaved] = useState(editedContent === undefined);
  const [showMinimap, setShowMinimap] = useState(true);

  const lines = content.split('\n');
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleChange = (e) => {
    onContentChange(e.target.value);
    setSaved(false);
  };

  const handleSave = () => {
    onSave(content);
    setSaved(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeIn 0.3s ease' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <FileText size={13} color="var(--accent)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fc.title}</span>
          <span style={{ color: 'var(--text-muted)' }}>— {file || 'untitled.md'}</span>
          {!saved && <span style={{ color: '#f97316', fontWeight: 600 }}>● unsaved</span>}
          {saved && <span style={{ color: '#4ade80' }}>saved</span>}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onPreview} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 12px', borderRadius: 'var(--radius-sm)',
            border: 'none', background: 'var(--accent)',
            color: 'var(--accent-btn-text, #000)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
          }}>
            <BookOpen size={12} /> Preview in Reader
          </button>
          <button onClick={onEditorReview} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.72rem',
          }}>
            <Search size={11} /> Run Editor
          </button>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: 'none', background: saved ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: saved ? 'var(--text-muted)' : 'var(--accent-btn-text, #000)', cursor: 'pointer',
            fontSize: '0.72rem', fontWeight: 600,
          }}>
            Save
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Line numbers + textarea */}
        <div style={{ flex: 1, display: 'flex', overflow: 'auto', background: 'var(--editor-bg, #0d0f14)' }}>
          {/* Line numbers gutter */}
          <div style={{
            padding: '12px 0', minWidth: 48, textAlign: 'right',
            fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: '0.78rem',
            lineHeight: '1.65', color: 'var(--text-muted)', userSelect: 'none',
            borderRight: '1px solid var(--border)', background: 'var(--editor-gutter, #0a0c10)',
            paddingRight: 8, flexShrink: 0,
          }}>
            {lines.map((_, i) => (
              <div key={i} style={{ opacity: 0.4 }}>{i + 1}</div>
            ))}
          </div>

          {/* Code area */}
          <textarea
            value={content}
            onChange={handleChange}
            spellCheck={false}
            style={{
              flex: 1, padding: '12px 16px', border: 'none', outline: 'none',
              background: 'transparent', color: 'var(--editor-text, #c9d1d9)',
              fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: '0.78rem',
              lineHeight: '1.65', resize: 'none', tabSize: 2,
              minHeight: '100%',
            }}
            onKeyDown={(e) => {
              if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSave();
              }
              // Tab inserts spaces
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                onContentChange(content.substring(0, start) + '  ' + content.substring(end));
                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
              }
            }}
          />
        </div>

        {/* Minimap (optional) */}
        {showMinimap && (
          <div style={{
            width: 80, background: 'var(--editor-gutter, #0a0c10)', borderLeft: '1px solid var(--border)',
            overflow: 'hidden', padding: '8px 4px', flexShrink: 0,
          }}>
            <div style={{
              fontSize: '1.5px', lineHeight: '2px', color: 'var(--editor-minimap, #c9d1d944)',
              fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              overflow: 'hidden', maxHeight: '100%',
            }}>
              {content}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '4px 12px', fontSize: '0.68rem', color: 'var(--text-muted)',
        background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
      }}>
        <span>Ln {lines.length}, Col 1</span>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
        <span>Markdown</span>
        <span style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setShowMinimap(!showMinimap)}>
          {showMinimap ? 'Hide' : 'Show'} Minimap
        </span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

/* ─── Full Cast Mode ─── */
function FullCastMode({ onCharacterClick, onBack }) {
  const allChars = Object.entries(characterProfiles);
  const mainChars = allChars.filter(([, c]) => c.tier !== 'minor');
  const minorChars = allChars.filter(([, c]) => c.tier === 'minor');

  const CharCard = ({ name, char }) => {
    const isMinor = char.tier === 'minor';
    return (
      <div
        onClick={() => onCharacterClick(name)}
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: isMinor ? 16 : 20, cursor: 'pointer',
          transition: 'var(--transition)', display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: isMinor ? 36 : 48, height: isMinor ? 36 : 48, borderRadius: '50%', background: char.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isMinor ? 16 : 20, fontWeight: 700, color: '#000', flexShrink: 0,
          }}>
            {name[0]}
          </div>
          <div>
            <div style={{ fontSize: isMinor ? '0.9rem' : '1rem', fontWeight: 700 }}>{char.name}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <Badge variant="accent" style={{ fontSize: '0.65rem' }}>{char.role}</Badge>
              {char.type && <Badge variant="muted" style={{ fontSize: '0.65rem' }}>{char.type}</Badge>}
            </div>
          </div>
        </div>
        {char.physicalDescription && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {char.physicalDescription.split('.').slice(0, 2).join('.') + '.'}
          </p>
        )}
        {char.backstory && !char.physicalDescription && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {char.backstory.split('.').slice(0, 2).join('.') + '.'}
          </p>
        )}
        {(char.mbti || char.enneagramWing || char.alignment) && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {char.mbti && <Badge style={{ background: `${char.color || 'var(--accent)'}20`, color: char.color || 'var(--accent)', fontSize: '0.6rem' }}>{char.mbti}</Badge>}
            {char.enneagramWing && <Badge style={{ background: '#fbbf2420', color: '#fbbf24', fontSize: '0.6rem' }}>{char.enneagramWing}</Badge>}
            {char.alignment && <Badge style={{ background: '#a78bfa20', color: '#a78bfa', fontSize: '0.6rem' }}>{char.alignment}</Badge>}
          </div>
        )}
        {(char.wound || char.flaw || char.virtue) && (
          <div style={{ display: 'grid', gridTemplateColumns: [char.wound, char.flaw, char.virtue].filter(Boolean).length > 1 ? `repeat(${[char.wound, char.flaw, char.virtue].filter(Boolean).length}, 1fr)` : '1fr', gap: 8, marginTop: 4 }}>
            {char.wound && (
              <div style={{ padding: '6px 8px', background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #ef4444' }}>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: 600 }}>Wound</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{char.wound}</div>
              </div>
            )}
            {char.flaw && (
              <div style={{ padding: '6px 8px', background: 'rgba(251,191,36,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #fbbf24' }}>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#fbbf24', fontWeight: 600 }}>Flaw</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{char.flaw}</div>
              </div>
            )}
            {char.virtue && (
              <div style={{ padding: '6px 8px', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid #10b981' }}>
                <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 600 }}>Virtue</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{char.virtue}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer',
          padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <ChevronLeft size={14} /> Back
        </button>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Full Cast — The Shunning Season</h2>
        <Badge variant="muted">{allChars.length} characters</Badge>
      </div>

      {/* Main Characters */}
      <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Main Characters
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 28 }}>
        {mainChars.map(([name, char]) => <CharCard key={name} name={name} char={char} />)}
      </div>

      {/* Minor Characters */}
      <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Minor Characters
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {minorChars.map(([name, char]) => <CharCard key={name} name={name} char={char} />)}
      </div>
    </div>
  );
}

function ChatMode() {
  const [chatInput, setChatInput] = useState('');
  const suggestionsRef = useState(null);

  const suggestions = [
    'Talk to a character',
    'Talk to the editor',
    'Work on Chapter 5',
    'Brainstorm plot ideas',
    'Fix a plot hole',
    'Develop a backstory',
    'Explore a what-if',
    'Strengthen a scene',
    'Work on dialogue',
    'Review pacing',
    'Deepen a relationship',
    'Build tension',
  ];

  const [scrollLeft, setScrollLeft] = useState(0);
  const pillsRef = { current: null };

  const scrollPills = (dir) => {
    const el = pillsRef.current;
    if (!el) return;
    const amount = 180;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleSuggestionClick = (s) => {
    setChatInput(s);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, animation: 'fadeIn 0.3s ease' }}>
      {/* Title */}
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' }}>Story Assistant</h1>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ alignSelf: 'flex-end', maxWidth: '70%', background: 'var(--accent-glow)', border: '1px solid var(--border)', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', fontSize: '0.85rem' }}>
          What if Marcus knew the truth all along? How would that change the confrontation in Chapter 5?
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          That's a fascinating what-if. If Marcus already knew, the confrontation shifts from revelation to reckoning — Elena isn't delivering news, she's forcing him to stop pretending. His emotional arc in that scene would change from shock → anger to quiet admission → shame. The wound dynamics would be completely different...
        </div>
      </div>

      {/* Suggestion pills — horizontally scrollable with arrow buttons */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        {/* Left scroll button */}
        <button onClick={() => scrollPills('left')} style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, width: 28, height: 28, borderRadius: '50%',
          border: '1px solid var(--border)', background: 'var(--bg-secondary)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
        }}>‹</button>

        {/* Scrollable container */}
        <div
          ref={(el) => { pillsRef.current = el; }}
          style={{
            display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
            padding: '4px 36px', msOverflowStyle: 'none',
          }}
        >
          {suggestions.map(s => (
            <button key={s} onClick={() => handleSuggestionClick(s)} style={{
              padding: '5px 14px', fontSize: '0.75rem', borderRadius: 100, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-glow)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >{s}</button>
          ))}
        </div>

        {/* Right scroll button */}
        <button onClick={() => scrollPills('right')} style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, width: 28, height: 28, borderRadius: '50%',
          border: '1px solid var(--border)', background: 'var(--bg-secondary)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
        }}>›</button>
      </div>

      {/* Chat input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask about your story, brainstorm ideas, or request changes..."
          style={{
            flex: 1, padding: '10px 16px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
          }}
        />
        <Button variant="primary">Send</Button>
      </div>
    </div>
  );
}

/* ─── Timeline Data ─── */
// arc = planned arc (from outline), realityArc = actual written arc (diverges as drafts evolve)
const timelineCharacters = [
  // ── Main Characters ──
  {
    name: 'Elena', color: '#2dd4bf', gradient: 'linear-gradient(135deg, #2dd4bf, #f472b6)', tier: 'main',
    arc: [3, 4, 6, 5, 8, 9, 7, 10, 6, 4, 5, 3],
    realityArc: [3, 5, 7, 4, 7, 10, 8, 9, 7, 5, 4, 3],
    beats: ['Ordinary life', 'Discovers letter', 'Confronts Marcus', 'Investigates past', 'Betrayal revealed', 'Confrontation', 'Grief & doubt', 'Final reckoning', 'Quiet resolve', 'Rebuilding', 'New normal', 'Epilogue'],
    interactions: { Marcus: [0,1,0,1,0,1,1,1,1,0,0,1], Priya: [1,1,0,0,1,0,0,0,1,1,0,0], Thomas: [0,0,0,1,0,0,1,0,0,0,0,0], Ruth: [1,0,0,0,0,0,0,0,1,1,0,0], 'Bishop Lapp': [0,0,0,0,0,1,0,1,0,0,0,0] },
  },
  {
    name: 'Marcus', color: '#818cf8', gradient: 'linear-gradient(135deg, #818cf8, #f97316)', tier: 'main',
    arc: [5, 3, 4, 6, 7, 9, 10, 8, 5, 3, 4, 2],
    realityArc: [4, 4, 3, 5, 8, 8, 10, 9, 6, 2, 3, 2],
    beats: ['Keeping secrets', 'Avoidance', 'Deflection', 'Cracking facade', 'Exposed', 'Rage', 'Rock bottom', 'Admission', 'Penance', 'Withdrawal', 'Tentative return', 'Open wound'],
    interactions: { Elena: [0,1,0,1,0,1,1,1,1,0,0,1], Priya: [0,0,1,0,1,0,0,1,0,0,1,0], Thomas: [1,0,0,0,0,1,0,0,0,1,0,0], Ruth: [0,0,0,0,0,0,0,0,0,0,0,0], 'Bishop Lapp': [0,0,0,0,1,0,0,0,0,0,0,0] },
  },
  {
    name: 'Priya', color: '#a78bfa', gradient: 'linear-gradient(135deg, #fbbf24, #a78bfa)', tier: 'main',
    arc: [2, 3, 3, 4, 6, 5, 7, 6, 8, 7, 5, 4],
    realityArc: [2, 2, 4, 5, 5, 6, 6, 7, 9, 6, 5, 4],
    beats: ['Background ally', 'Concerned friend', 'Overhears', 'Starts digging', 'Caught in middle', 'Picks a side', 'Confronts Elena', 'Bridge builder', 'Own revelation', 'Taking charge', 'Mediator', 'New path'],
    interactions: { Elena: [1,1,0,0,1,0,0,0,1,1,0,0], Marcus: [0,0,1,0,1,0,0,1,0,0,1,0], Thomas: [0,0,0,0,0,0,1,0,0,1,1,0], Ruth: [0,1,0,0,0,0,0,0,0,0,0,0], 'Bishop Lapp': [0,0,0,0,0,0,0,0,0,0,0,0] },
  },
  // ── Minor Characters ──
  {
    name: 'Thomas', color: '#6ee7b7', gradient: 'linear-gradient(135deg, #6ee7b7, #60a5fa)', tier: 'minor',
    arc: [1, 1, 2, 3, 2, 4, 5, 3, 2, 3, 2, 1],
    realityArc: [1, 1, 1, 4, 2, 3, 6, 4, 2, 2, 2, 1],
    beats: ['Peripheral', 'Mentioned', 'Brief scene', 'Key info', 'Absent', 'Catalyst', 'Complication', 'Fades', 'Minor role', 'Small return', 'Background', 'Coda'],
    interactions: { Elena: [0,0,0,1,0,0,1,0,0,0,0,0], Marcus: [1,0,0,0,0,1,0,0,0,1,0,0], Priya: [0,0,0,0,0,0,1,0,0,1,1,0] },
  },
  {
    name: 'Ruth', color: '#f9a8d4', gradient: 'linear-gradient(135deg, #f9a8d4, #818cf8)', tier: 'minor',
    arc: [2, 1, 0, 0, 0, 0, 0, 0, 3, 4, 2, 1],
    realityArc: [2, 2, 1, 0, 0, 0, 0, 1, 4, 5, 2, 1],
    beats: ['Present', 'Fades', '—', '—', '—', '—', '—', '—', 'Returns', 'Key scene', 'Support', 'Coda'],
    interactions: { Elena: [1,0,0,0,0,0,0,0,1,1,0,0], Priya: [0,1,0,0,0,0,0,0,0,0,0,0] },
  },
  {
    name: 'Bishop Lapp', color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #475569)', tier: 'minor',
    arc: [0, 0, 0, 1, 2, 4, 1, 3, 0, 0, 0, 0],
    realityArc: [0, 0, 1, 2, 3, 5, 2, 2, 0, 0, 0, 0],
    beats: ['—', '—', '—', 'Mentioned', 'Warning', 'Judgment', 'Recedes', 'Final word', '—', '—', '—', '—'],
    interactions: { Elena: [0,0,0,0,0,1,0,1,0,0,0,0], Marcus: [0,0,0,0,1,0,0,0,0,0,0,0] },
  },
];

// The main plot spine (fate/time thread)
const plotSpine = [4, 4, 5, 5, 7, 8, 9, 10, 7, 5, 4, 3];

// Act structure — three-act breakdown
const acts = [
  { label: 'Act 1 — Setup', start: 0, end: 3, color: 'rgba(96, 165, 250, 0.05)', borderColor: 'rgba(96, 165, 250, 0.15)', labelColor: '#60a5fa' },
  { label: 'Act 2 — Confrontation', start: 3, end: 9, color: 'rgba(249, 115, 22, 0.05)', borderColor: 'rgba(249, 115, 22, 0.12)', labelColor: '#f97316' },
  { label: 'Act 3 — Resolution', start: 9, end: 12, color: 'rgba(74, 222, 128, 0.05)', borderColor: 'rgba(74, 222, 128, 0.15)', labelColor: '#4ade80' },
];

// SVG helper: build a smooth curve path through points
function buildPath(points, width, height, maxVal = 10, smooth = true) {
  const stepX = width / (points.length - 1);
  const coords = points.map((v, i) => ({ x: i * stepX, y: height - (v / maxVal) * height }));
  if (!smooth) {
    return coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ');
  }
  // Catmull-Rom to Bezier for smooth curves
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(i - 1, 0)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(i + 2, coords.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ─── Interwoven Threads View (Overview) ─── */
function ThreadsOverview({ onSelectChar, journeyMode, visibleChars, dataView }) {
  const W = 900, H = 300, PAD = { top: 30, bottom: 30, left: 10, right: 10 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const chapters = 12;
  const stepX = plotW / (chapters - 1);

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
        {/* Act background regions */}
        {acts.map((act) => {
          const x1 = PAD.left + (act.start === 0 ? -5 : (act.start - 0.5) * stepX);
          const x2 = PAD.left + (act.end === 12 ? plotW + 5 : (act.end - 0.5) * stepX);
          return (
            <g key={act.label}>
              <rect
                x={x1} y={PAD.top - 16}
                width={x2 - x1} height={plotH + 18}
                fill={act.color}
                rx={4}
              />
              <line x1={x1} y1={PAD.top - 16} x2={x1} y2={PAD.top + plotH + 2} stroke={act.borderColor} strokeWidth={1} strokeDasharray="3 3" />
              <text
                x={(x1 + x2) / 2} y={PAD.top - 6}
                textAnchor="middle" fill={act.labelColor} fontSize={9} fontWeight={600} opacity={0.7}
              >
                {act.label}
              </text>
            </g>
          );
        })}

        {/* Chapter grid lines */}
        {Array.from({ length: chapters }, (_, i) => {
          const x = PAD.left + i * stepX;
          return (
            <g key={i}>
              <line x1={x} y1={PAD.top} x2={x} y2={H - PAD.bottom} stroke="rgba(100,116,139,0.1)" strokeWidth={1} />
              <text x={x} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>Ch {i + 1}</text>
            </g>
          );
        })}

        {/* Plot spine — the thread of fate (thick, translucent) */}
        <path
          d={buildPath(plotSpine, plotW, plotH, 10, !journeyMode)}
          fill="none"
          stroke="rgba(251,191,36,0.25)"
          strokeWidth={journeyMode ? 6 : 4}
          strokeLinecap="round"
          transform={`translate(${PAD.left}, ${PAD.top})`}
        />

        {/* Character threads — interwoven around the spine */}
        {visibleChars.map((char) => {
          const isMinor = char.tier === 'minor';
          const showPlan = dataView === 'plan' || dataView === 'both';
          const showReality = dataView === 'reality' || dataView === 'both';
          const isBoth = dataView === 'both';
          return (
            <g key={char.name}>
              {/* Plan arc */}
              {showPlan && (
                <>
                  <path
                    d={buildPath(char.arc, plotW, plotH, 10, !journeyMode)}
                    fill="none"
                    stroke={char.color}
                    strokeWidth={isMinor ? 1.2 : 2}
                    strokeLinecap="round"
                    strokeDasharray={isBoth ? '6 3' : (isMinor ? '6 3' : 'none')}
                    opacity={isBoth ? (isMinor ? 0.3 : 0.4) : (isMinor ? 0.6 : 0.85)}
                    transform={`translate(${PAD.left}, ${PAD.top})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectChar(char.name)}
                  />
                  {/* Plan data points */}
                  {char.arc.map((v, i) => {
                    if (isMinor && v === 0) return null;
                    const cx = PAD.left + i * stepX;
                    const cy = PAD.top + plotH - (v / 10) * plotH;
                    return (
                      <circle
                        key={`plan-${i}`}
                        cx={cx} cy={cy} r={isBoth ? 2 : (isMinor ? (i < 6 ? 2.5 : 2) : (i < 6 ? 4 : 2.5))}
                        fill={isBoth ? 'transparent' : (i < 6 ? char.color : 'var(--bg-tertiary)')}
                        stroke={char.color}
                        strokeWidth={isBoth ? 1 : (isMinor ? 1 : 1.5)}
                        opacity={isBoth ? 0.4 : (i < 6 ? (isMinor ? 0.7 : 1) : 0.4)}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelectChar(char.name)}
                      />
                    );
                  })}
                </>
              )}
              {/* Reality arc */}
              {showReality && (
                <>
                  {/* Glow for reality */}
                  <path
                    d={buildPath(char.realityArc, plotW, plotH, 10, !journeyMode)}
                    fill="none"
                    stroke={char.color}
                    strokeWidth={isMinor ? 2 : 4}
                    strokeLinecap="round"
                    opacity={isMinor ? 0.08 : 0.15}
                    transform={`translate(${PAD.left}, ${PAD.top})`}
                  />
                  <path
                    d={buildPath(char.realityArc, plotW, plotH, 10, !journeyMode)}
                    fill="none"
                    stroke={char.color}
                    strokeWidth={isMinor ? 1.2 : 2}
                    strokeLinecap="round"
                    strokeDasharray={isMinor ? '6 3' : 'none'}
                    opacity={isMinor ? 0.6 : 0.85}
                    transform={`translate(${PAD.left}, ${PAD.top})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectChar(char.name)}
                  />
                  {/* Reality data points — solid filled */}
                  {char.realityArc.map((v, i) => {
                    if (isMinor && v === 0) return null;
                    const cx = PAD.left + i * stepX;
                    const cy = PAD.top + plotH - (v / 10) * plotH;
                    return (
                      <circle
                        key={`real-${i}`}
                        cx={cx} cy={cy} r={isMinor ? (i < 6 ? 2.5 : 2) : (i < 6 ? 4 : 2.5)}
                        fill={i < 6 ? char.color : 'var(--bg-tertiary)'}
                        stroke={char.color}
                        strokeWidth={isMinor ? 1 : 1.5}
                        opacity={i < 6 ? (isMinor ? 0.7 : 1) : 0.4}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelectChar(char.name)}
                      />
                    );
                  })}
                </>
              )}
            </g>
          );
        })}

        {/* Y-axis label */}
        <text x={4} y={PAD.top + 4} fill="var(--text-muted)" fontSize={8} textAnchor="start">High</text>
        <text x={4} y={H - PAD.bottom - 2} fill="var(--text-muted)" fontSize={8} textAnchor="start">Low</text>
      </svg>

      {/* Character legend — clickable, grouped */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'rgba(251,191,36,0.6)' }}>
          <span style={{ width: 16, height: 3, background: 'rgba(251,191,36,0.4)', borderRadius: 2, display: 'inline-block' }} />
          Plot Spine
        </span>
        <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
        {visibleChars.filter(c => c.tier === 'main').map((c) => (
          <span
            key={c.name}
            onClick={() => onSelectChar(c.name)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: c.color, cursor: 'pointer', fontWeight: 600 }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
            {c.name}
          </span>
        ))}
        {visibleChars.some(c => c.tier === 'minor') && (
          <>
            <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
            {visibleChars.filter(c => c.tier === 'minor').map((c) => (
              <span
                key={c.name}
                onClick={() => onSelectChar(c.name)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: c.color, cursor: 'pointer', fontWeight: 400, opacity: 0.8 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block', border: `1px dashed ${c.color}` }} />
                {c.name}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Single Character Arc Detail ─── */
function CharacterArcDetail({ charName, onBack, onSelectChar, journeyMode, dataView }) {
  const char = timelineCharacters.find(c => c.name === charName);
  if (!char) return null;
  const others = timelineCharacters.filter(c => c.name !== charName);

  const W = 900, H = 240, PAD = { top: 20, bottom: 30, left: 10, right: 10 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const chapters = 12;
  const stepX = plotW / (chapters - 1);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>← All Characters</button>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: char.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000' }}>{char.name[0]}</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: char.color }}>{char.name}'s Arc</h3>
        <div style={{ flex: 1 }} />
        {others.map((o) => (
          <span
            key={o.name}
            onClick={() => onSelectChar(o.name)}
            style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: o.color, cursor: 'pointer', padding: '3px 8px', borderRadius: 100, border: `1px solid ${o.color}33` }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: o.color }} />
            {o.name}
          </span>
        ))}
      </div>

      {/* Main arc chart */}
      <div style={{ width: '100%' }}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          {/* Grid */}
          {Array.from({ length: chapters }, (_, i) => {
            const x = PAD.left + i * stepX;
            return (
              <g key={i}>
                <line x1={x} y1={PAD.top} x2={x} y2={H - PAD.bottom} stroke="rgba(100,116,139,0.1)" strokeWidth={1} />
                <text x={x} y={H - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={10}>Ch {i + 1}</text>
              </g>
            );
          })}

          {/* Ghost lines for other characters (dimmed) — use reality or plan based on dataView */}
          {others.map((o) => {
            const ghostArc = (dataView === 'plan') ? o.arc : o.realityArc;
            return (
              <path
                key={o.name}
                d={buildPath(ghostArc, plotW, plotH, 10, !journeyMode)}
                fill="none"
                stroke={o.color}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={0.2}
                transform={`translate(${PAD.left}, ${PAD.top})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectChar(o.name)}
              />
            );
          })}

          {/* Interaction markers */}
          {others.map((o) => {
            const interactions = char.interactions[o.name] || [];
            const mainArc = (dataView === 'plan') ? char.arc : char.realityArc;
            const otherArc = (dataView === 'plan') ? o.arc : o.realityArc;
            return interactions.map((val, i) => {
              if (!val) return null;
              const cx = PAD.left + i * stepX;
              const cy = PAD.top + plotH - (mainArc[i] / 10) * plotH;
              return (
                <g key={`${o.name}-${i}`}>
                  <line
                    x1={cx} y1={cy}
                    x2={cx} y2={PAD.top + plotH - (otherArc[i] / 10) * plotH}
                    stroke={o.color} strokeWidth={1} strokeDasharray="2 2" opacity={0.3}
                  />
                  <circle cx={cx} cy={cy} r={6} fill="none" stroke={o.color} strokeWidth={1.5} opacity={0.5} />
                </g>
              );
            });
          })}

          {/* Plan arc (dashed in Both mode, solid in Plan mode) */}
          {(dataView === 'plan' || dataView === 'both') && (
            <>
              <path
                d={buildPath(char.arc, plotW, plotH, 10, !journeyMode) + ` L ${plotW} ${plotH} L 0 ${plotH} Z`}
                fill={char.color}
                opacity={dataView === 'both' ? 0.03 : 0.06}
                transform={`translate(${PAD.left}, ${PAD.top})`}
              />
              <path
                d={buildPath(char.arc, plotW, plotH, 10, !journeyMode)}
                fill="none"
                stroke={char.color}
                strokeWidth={dataView === 'both' ? 1.5 : 2.5}
                strokeLinecap="round"
                strokeDasharray={dataView === 'both' ? '8 4' : 'none'}
                opacity={dataView === 'both' ? 0.4 : 1}
                transform={`translate(${PAD.left}, ${PAD.top})`}
              />
              {/* Plan data points */}
              {char.arc.map((v, i) => {
                const cx = PAD.left + i * stepX;
                const cy = PAD.top + plotH - (v / 10) * plotH;
                return (
                  <g key={`plan-${i}`}>
                    <circle cx={cx} cy={cy} r={dataView === 'both' ? 3 : 5}
                      fill={dataView === 'both' ? 'transparent' : char.color}
                      stroke={char.color} strokeWidth={dataView === 'both' ? 1 : 2}
                      opacity={dataView === 'both' ? 0.4 : 1}
                    />
                    {dataView === 'plan' && (
                      <text x={cx} y={cy - 10} textAnchor="middle" fill={char.color} fontSize={8} fontWeight={500} opacity={0.8}>
                        {char.beats[i]}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* Reality arc (solid, primary in Reality and Both modes) */}
          {(dataView === 'reality' || dataView === 'both') && (
            <>
              <path
                d={buildPath(char.realityArc, plotW, plotH, 10, !journeyMode) + ` L ${plotW} ${plotH} L 0 ${plotH} Z`}
                fill={char.color}
                opacity={0.06}
                transform={`translate(${PAD.left}, ${PAD.top})`}
              />
              <path
                d={buildPath(char.realityArc, plotW, plotH, 10, !journeyMode)}
                fill="none"
                stroke={char.color}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.2}
                transform={`translate(${PAD.left}, ${PAD.top})`}
              />
              <path
                d={buildPath(char.realityArc, plotW, plotH, 10, !journeyMode)}
                fill="none"
                stroke={char.color}
                strokeWidth={2.5}
                strokeLinecap="round"
                transform={`translate(${PAD.left}, ${PAD.top})`}
              />
              {/* Reality data points with beat labels */}
              {char.realityArc.map((v, i) => {
                const cx = PAD.left + i * stepX;
                const cy = PAD.top + plotH - (v / 10) * plotH;
                return (
                  <g key={`real-${i}`}>
                    <circle cx={cx} cy={cy} r={5} fill={char.color} stroke="var(--bg-primary)" strokeWidth={2} />
                    <text x={cx} y={cy - 10} textAnchor="middle" fill={char.color} fontSize={8} fontWeight={500} opacity={0.8}>
                      {char.beats[i]}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* Interaction grid for this character */}
      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
          Interactions
        </h4>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 2, paddingLeft: 80, marginBottom: 4 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ width: 60, textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>Ch {i + 1}</div>
            ))}
          </div>
          {others.map((o) => {
            const interactions = char.interactions[o.name] || [];
            return (
              <div key={o.name} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <span
                  onClick={() => onSelectChar(o.name)}
                  style={{ width: 80, fontSize: '0.7rem', color: o.color, textAlign: 'right', paddingRight: 8, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                >
                  {o.name}
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {interactions.map((val, i) => (
                    <div key={i} style={{
                      width: 60, height: 20, borderRadius: 3,
                      background: val ? `${o.color}33` : 'var(--bg-tertiary)',
                      border: val ? `1px solid ${o.color}55` : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {val ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: o.color }} /> : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline Mode (Redesigned) ─── */
function TimelineMode() {
  const [view, setView] = useState('overview'); // 'overview' | 'character'
  const [selectedChar, setSelectedChar] = useState(null);
  const [journeyMode, setJourneyMode] = useState(true);
  const [showMain, setShowMain] = useState(true);
  const [showMinor, setShowMinor] = useState(true);
  const [dataView, setDataView] = useState('both'); // 'plan' | 'reality' | 'both'

  const visibleChars = timelineCharacters.filter(c =>
    (c.tier === 'main' && showMain) || (c.tier === 'minor' && showMinor)
  );

  const handleSelectChar = (name) => {
    setSelectedChar(name);
    setView('character');
  };

  return (
    <div style={{ padding: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Story Timeline</h2>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Character group toggles */}
          <button
            onClick={() => setShowMain(!showMain)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: showMain ? 'rgba(240,160,80,0.15)' : 'transparent',
              border: showMain ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: showMain ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            Main ({timelineCharacters.filter(c => c.tier === 'main').length})
          </button>
          <button
            onClick={() => setShowMinor(!showMinor)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
              background: showMinor ? 'rgba(148,163,184,0.15)' : 'transparent',
              border: showMinor ? '1px solid #94a3b8' : '1px solid var(--border)',
              color: showMinor ? '#94a3b8' : 'var(--text-muted)',
            }}
          >
            Minor ({timelineCharacters.filter(c => c.tier === 'minor').length})
          </button>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          {/* View mode */}
          <Badge
            variant={journeyMode ? 'accent' : 'muted'}
            style={{ cursor: 'pointer' }}
            onClick={() => setJourneyMode(true)}
          >
            Journey
          </Badge>
          <Badge
            variant={!journeyMode ? 'accent' : 'muted'}
            style={{ cursor: 'pointer' }}
            onClick={() => setJourneyMode(false)}
          >
            Linear
          </Badge>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <Badge variant={dataView === 'plan' ? 'accent' : 'muted'} style={{ cursor: 'pointer' }} onClick={() => setDataView('plan')}>Plan</Badge>
          <Badge variant={dataView === 'reality' ? 'accent' : 'muted'} style={{ cursor: 'pointer' }} onClick={() => setDataView('reality')}>Reality</Badge>
          <Badge variant={dataView === 'both' ? 'accent' : 'muted'} style={{ cursor: 'pointer' }} onClick={() => setDataView('both')}>Both</Badge>
        </div>
      </div>

      {view === 'overview' && (
        <ThreadsOverview onSelectChar={handleSelectChar} journeyMode={journeyMode} visibleChars={visibleChars} dataView={dataView} />
      )}
      {view === 'character' && selectedChar && (
        <CharacterArcDetail
          charName={selectedChar}
          onBack={() => setView('overview')}
          onSelectChar={handleSelectChar}
          journeyMode={journeyMode}
          dataView={dataView}
        />
      )}

      {/* Legend indicator — adapts to dataView */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        {(dataView === 'both') && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 14, height: 0, borderTop: '2px solid var(--text-muted)', display: 'inline-block' }} />
              Solid = reality (written)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 14, height: 0, borderTop: '2px dashed var(--text-muted)', display: 'inline-block' }} />
              Dashed = plan (outlined)
            </span>
          </>
        )}
        {(dataView === 'plan') && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Showing planned arcs from outline
          </span>
        )}
        {(dataView === 'reality') && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Showing actual arcs from written chapters
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)', display: 'inline-block' }} />
          Solid dots = drafted
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'inline-block' }} />
          Hollow dots = planned
        </span>
      </div>
    </div>
  );
}

function DrawingBoard() {
  const items = [
    { type: 'note', text: '"What if the detective is lying too?"', used: false },
    { type: 'image', label: 'Fog bridge reference', used: 'hallmarks/bridge' },
    { type: 'note', text: 'Marcus backstory — grew up in foster care, first arrest at 16', used: 'characters/marcus.md' },
    { type: 'draft', text: 'Ch.3 opening alternate version', used: false },
    { type: 'note', text: 'Mennonite funeral customs — check wiki', used: 'world/hallmarks' },
    { type: 'image', label: 'Council hall interior ref', used: 'hallmarks/council-hall' },
  ];

  return (
    <div style={{ padding: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>The Drawing Board</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge variant="accent">Board</Badge>
          <Badge variant="muted">List</Badge>
          <Badge variant="muted">Gallery</Badge>
          <Badge variant="muted">Unlinked</Badge>
          <Button size="sm" variant="secondary">+ Add</Button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {items.map((item, i) => (
          <Card key={i} style={{ padding: 14 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              {item.type === 'note' ? '📝 Note' : item.type === 'image' ? '🖼 Image' : '📄 Draft'}
            </div>
            <div style={{ fontSize: '0.8rem', marginBottom: 8, lineHeight: 1.5 }}>
              {item.text || item.label}
            </div>
            {item.type === 'image' && (
              <div style={{
                height: 60, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '0.7rem',
              }}>
                [image preview]
              </div>
            )}
            <div style={{ fontSize: '0.7rem' }}>
              {item.used ? (
                <span style={{ color: 'var(--health-exceptional)' }}>Used in: → {item.used}</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Not yet used</span>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Groups: </span>
        {['Characters', 'World Research', 'Alternate Ideas', 'Unsorted'].map((g) => (
          <Badge key={g} variant="muted" style={{ marginRight: 4, cursor: 'pointer' }}>{g}</Badge>
        ))}
      </div>
    </div>
  );
}

/* ─── Comparison Mode ─── */
/* ─── Deep Comparison Lab ─── */
const comparisonTypes = [
  { key: 'projects', icon: Library, label: 'Your Projects', desc: 'Compare any two works from your library' },
  { key: 'uploaded', icon: Upload, label: 'Uploaded vs Uploaded', desc: 'Decompose and compare two external books' },
  { key: 'vs-external', icon: ArrowLeftRight, label: 'Your Work vs External', desc: 'Compare your story against a published work' },
  { key: 'series', icon: TrendingUp, label: 'Series Progression', desc: 'Track how a series evolves across books' },
];

const comparisonDimensions = [
  { key: 'author', icon: Brain, label: 'Author Psychology', color: '#a78bfa' },
  { key: 'narrator', icon: Eye, label: 'Narrator', color: '#60a5fa' },
  { key: 'world', icon: Globe2, label: 'World', color: '#34d399' },
  { key: 'characters', icon: Users, label: 'Characters', color: '#f472b6' },
  { key: 'relationships', icon: Heart, label: 'Relationships', color: '#fb7185' },
  { key: 'structure', icon: BarChart3, label: 'Story Structure', color: '#fbbf24' },
  { key: 'tone', icon: Music, label: 'Tone', color: '#c084fc' },
  { key: 'theme', icon: HelpCircle, label: 'Theme', color: '#2dd4bf' },
  { key: 'audience', icon: UserCheck, label: 'Audience', color: '#fb923c' },
  { key: 'inferences', icon: Sparkles, label: 'Author Inferences', color: '#e879f9' },
];

const sampleWorksLibrary = [
  { id: 'bridge', title: 'The Bridge of Forgetting', type: 'novel', chapters: 24, status: 'In Progress' },
  { id: 'lantern', title: 'The Lantern Keeper', type: 'novel', chapters: 18, status: 'Complete' },
  { id: 'echo', title: 'Echo Chamber', type: 'novella', chapters: 8, status: 'Draft 2' },
  { id: 'roots', title: 'Roots of the Old World', type: 'novel', chapters: 31, status: 'Complete' },
];

const sampleComparisonData = {
  workA: { title: 'The Bridge of Forgetting', type: 'Your Project' },
  workB: { title: 'The Remains of the Day', type: 'External Upload' },
  overallDivergence: 62,
  topChanges: [
    'Narrator reliability is the single largest structural difference — your narrator actively deceives while Ishiguro\'s withholds.',
    'Both use memory-as-structure, but your timeline fragments while his compresses linearly.',
    'Character wound patterns diverge sharply: yours centers abandonment, his centers duty-over-self.',
    'Tonal registers share melancholy but diverge in humor — yours is absent, his is deeply ironic.',
  ],
  dimensions: {
    author: {
      divergence: 58, scoreA: 7, scoreB: 8,
      summaryA: 'Wound: abandonment. Enneagram 4w5. Prose tendency: lyrical fragmentation, sensory-heavy. Bias toward isolation as virtue.',
      summaryB: 'Wound: duty over authentic self. Enneagram 1w9. Prose tendency: precise understatement, emotional restraint. Bias toward service as identity.',
      keyDiff: 'Your author processes loss through poetic excess; Ishiguro\'s through surgical omission. Both are grief engines — different compression algorithms.',
    },
    narrator: {
      divergence: 82, scoreA: 6, scoreB: 9,
      summaryA: 'Type: First-person unreliable. POV: Limited. Distance: Close. Actively deceives reader through selective memory. Knowledge: fragmented, contradictory.',
      summaryB: 'Type: First-person unreliable. POV: Limited. Distance: Medium. Withholds through self-deception rather than deception of reader. Knowledge: comprehensive but filtered.',
      keyDiff: 'Both narrators are unreliable, but yours lies to the reader while Stevens lies to himself. The reader\'s relationship to truth is fundamentally different.',
    },
    world: {
      divergence: 71, scoreA: 7, scoreB: 6,
      summaryA: 'Genre: Literary fantasy. Rules: Memory is physical — forgetting has geography. Hallmarks: bridges, fog, thresholds. Society-as-character: small town as pressure cooker.',
      summaryB: 'Genre: Literary realism. Rules: Class is physical — service has geography. Hallmarks: great houses, motorcars, silver. Society-as-character: declining British aristocracy.',
      keyDiff: 'Your world literalizes internal states (fog = confusion). Ishiguro\'s world externalizes them through social architecture. Both trap characters in symbolic spaces.',
    },
    characters: {
      divergence: 45, scoreA: 8, scoreB: 9,
      summaryA: 'Archetypes: Wounded healer (Miriam), Shadow (Thomas), Anima/Animus (Elena). Growth: spiral — characters revisit wounds. Foils: Miriam/Thomas mirror abandonment responses.',
      summaryB: 'Archetypes: Loyal servant (Stevens), Lost love (Miss Kenton), Fallen authority (Lord Darlington). Growth: compressed revelation. Foils: Stevens/Miss Kenton mirror duty vs feeling.',
      keyDiff: 'Similar character architecture — both built around a central figure who can\'t see themselves clearly, with a foil who represents the unlived life.',
    },
    relationships: {
      divergence: 53, scoreA: 7, scoreB: 8,
      summaryA: 'Network: spoke-and-hub centered on Miriam. Attachment: anxious-avoidant dominant. Power dynamics: shifting. Alliance patterns: alliances form and dissolve around memory.',
      summaryB: 'Network: triangular (Stevens-Kenton-Darlington). Attachment: avoidant dominant. Power dynamics: rigid hierarchy. Alliance patterns: professional bonds masking emotional ones.',
      keyDiff: 'Your relationships are fluid and contested. Ishiguro\'s are frozen in hierarchy — the tragedy is that they never become what they could be.',
    },
    structure: {
      divergence: 67, scoreA: 6, scoreB: 9,
      summaryA: 'Plot: Non-linear spiral. Acts: 4 (fragmented). Pacing: variable — rushes and lingers. Subplots: 4 active. Ending: ambiguous, cyclical.',
      summaryB: 'Plot: Linear journey with embedded flashbacks. Acts: 3 (classical). Pacing: steady compression. Subplots: 2 (subtle). Ending: devastating understated revelation.',
      keyDiff: 'Your structure mirrors your narrator\'s confusion. Ishiguro\'s structure mirrors his narrator\'s control — the form IS the character in both cases.',
    },
    tone: {
      divergence: 72, scoreA: 7, scoreB: 9,
      summaryA: 'Register: Melancholic-lyrical. Humor: absent. Darkness: moderate-high. Content: PG-13. Prose: dense, image-heavy, paragraph-length sentences.',
      summaryB: 'Register: Melancholic-restrained. Humor: deeply ironic. Darkness: moderate (devastating by understatement). Content: PG. Prose: precise, short, devastatingly simple.',
      keyDiff: 'You and Ishiguro share melancholy but achieve it through opposite means — yours through accumulation of beauty, his through accumulation of absence.',
    },
    theme: {
      divergence: 38, scoreA: 8, scoreB: 9,
      summaryA: 'Central question: Can we choose what to remember? Supporting: identity vs memory, love vs letting go, the cost of knowledge. Ambiguity: high. Didacticism: low.',
      summaryB: 'Central question: Can we live authentically within systems of duty? Supporting: dignity vs feeling, service vs self, the cost of loyalty. Ambiguity: high. Didacticism: low.',
      keyDiff: 'Both ask "what do we sacrifice to maintain our self-image?" — yours frames it as active forgetting, his as active repression. Same wound, different scar.',
    },
    audience: {
      divergence: 44, scoreA: 6, scoreB: 8,
      summaryA: 'Assumed reader: Literary fiction reader comfortable with ambiguity, non-linear storytelling, and magical realism. Reading level: advanced. Genre expectations: subverted.',
      summaryB: 'Assumed reader: Literary fiction reader who values emotional restraint, historical setting, and slow revelation. Reading level: moderate-advanced. Genre expectations: fulfilled then transcended.',
      keyDiff: 'Your reader needs patience with confusion. Ishiguro\'s needs patience with propriety. Both demand emotional intelligence from the reader.',
    },
    inferences: {
      divergence: 55, scoreA: 7, scoreB: 9,
      summaryA: 'The author fears losing themselves. The fragmented structure suggests someone processing a real loss through fiction. The magical elements are a safety valve — literalizing pain makes it survivable.',
      summaryB: 'The author understands regret at a structural level. The restraint suggests someone who has chosen craft over confession. The historical distance is permission to feel without exposure.',
      keyDiff: 'Your work reads as an open wound finding form. Ishiguro\'s reads as a healed wound being examined. Both are deeply personal — yours is raw, his is distilled.',
    },
  },
};

function ComparisonMode() {
  const [phase, setPhase] = useState('select'); // 'select' | 'picking' | 'results'
  const [comparisonType, setComparisonType] = useState(null);
  const [workA, setWorkA] = useState(null);
  const [workB, setWorkB] = useState(null);
  const [pickingSide, setPickingSide] = useState(null); // 'A' | 'B'
  const [activeDimensions, setActiveDimensions] = useState(comparisonDimensions.map(d => d.key));
  const [expandedDimension, setExpandedDimension] = useState(null);
  const [showRadar, setShowRadar] = useState(true);

  const toggleDimension = (key) => {
    setActiveDimensions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Radar chart SVG helper
  const renderRadarChart = () => {
    const cx = 150, cy = 150, r = 120;
    const dims = comparisonDimensions.filter(d => activeDimensions.includes(d.key));
    const n = dims.length;
    if (n < 3) return null;

    const angleStep = (Math.PI * 2) / n;
    const getPoint = (index, value, maxVal = 10) => {
      const angle = (index * angleStep) - Math.PI / 2;
      const dist = (value / maxVal) * r;
      return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };

    // Grid rings
    const rings = [0.25, 0.5, 0.75, 1];
    const gridLines = rings.map(pct => {
      const pts = dims.map((_, i) => {
        const angle = (i * angleStep) - Math.PI / 2;
        return `${cx + r * pct * Math.cos(angle)},${cy + r * pct * Math.sin(angle)}`;
      });
      return <polygon key={pct} points={pts.join(' ')} fill="none" stroke="var(--border)" strokeWidth={0.5} opacity={0.4} />;
    });

    // Axis lines
    const axes = dims.map((d, i) => {
      const angle = (i * angleStep) - Math.PI / 2;
      const lx = cx + r * Math.cos(angle);
      const ly = cy + r * Math.sin(angle);
      const labelX = cx + (r + 18) * Math.cos(angle);
      const labelY = cy + (r + 18) * Math.sin(angle);
      return (
        <g key={d.key}>
          <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
          <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle"
            fill={d.color} fontSize={7} fontWeight={500}>{d.label}</text>
        </g>
      );
    });

    // Work A polygon
    const ptsA = dims.map((d, i) => {
      const val = sampleComparisonData.dimensions[d.key]?.scoreA || 5;
      const p = getPoint(i, val);
      return `${p.x},${p.y}`;
    }).join(' ');

    // Work B polygon
    const ptsB = dims.map((d, i) => {
      const val = sampleComparisonData.dimensions[d.key]?.scoreB || 5;
      const p = getPoint(i, val);
      return `${p.x},${p.y}`;
    }).join(' ');

    return (
      <svg width="100%" viewBox="0 0 300 300" style={{ maxHeight: 300 }}>
        {gridLines}
        {axes}
        <polygon points={ptsA} fill="var(--accent)" fillOpacity={0.15} stroke="var(--accent)" strokeWidth={1.5} />
        <polygon points={ptsB} fill="#f472b6" fillOpacity={0.15} stroke="#f472b6" strokeWidth={1.5} />
        {/* Data points */}
        {dims.map((d, i) => {
          const valA = sampleComparisonData.dimensions[d.key]?.scoreA || 5;
          const valB = sampleComparisonData.dimensions[d.key]?.scoreB || 5;
          const pA = getPoint(i, valA);
          const pB = getPoint(i, valB);
          return (
            <g key={d.key}>
              <circle cx={pA.x} cy={pA.y} r={3} fill="var(--accent)" />
              <circle cx={pB.x} cy={pB.y} r={3} fill="#f472b6" />
            </g>
          );
        })}
      </svg>
    );
  };

  /* ── Selection / Landing Screen ── */
  if (phase === 'select') {
    return (
      <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Deep Comparison Lab
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 480, margin: '0 auto' }}>
              Structural DNA analysis across every dimension of storytelling. Not plagiarism detection — architectural fingerprinting.
            </p>
          </div>

          {/* Comparison type cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {comparisonTypes.map(ct => {
              const Icon = ct.icon;
              const active = comparisonType === ct.key;
              return (
                <Card key={ct.key} onClick={() => setComparisonType(ct.key)} style={{
                  padding: 20, cursor: 'pointer', transition: 'all 0.2s',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: active ? 'var(--accent-glow)' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Icon size={18} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: active ? 'var(--accent)' : 'var(--text-primary)' }}>{ct.label}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{ct.desc}</p>
                </Card>
              );
            })}
          </div>

          {/* Work selection slots */}
          {comparisonType && (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Select Works to Compare</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                {/* Work A slot */}
                <Card onClick={() => { setPickingSide('A'); setPhase('picking'); }} style={{
                  padding: 20, cursor: 'pointer', textAlign: 'center', minHeight: 100,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: workA ? '1px solid var(--accent)' : '1px dashed var(--border)',
                  background: workA ? 'var(--accent-glow)' : undefined,
                }}>
                  {workA ? (
                    <>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>{workA.title}</div>
                      <Badge variant="accent">{workA.type}</Badge>
                    </>
                  ) : (
                    <>
                      <Upload size={20} color="var(--text-muted)" style={{ marginBottom: 6 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Work A</span>
                    </>
                  )}
                </Card>

                <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>vs</div>

                {/* Work B slot */}
                <Card onClick={() => { setPickingSide('B'); setPhase('picking'); }} style={{
                  padding: 20, cursor: 'pointer', textAlign: 'center', minHeight: 100,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: workB ? '1px solid #f472b6' : '1px dashed var(--border)',
                  background: workB ? 'rgba(244,114,182,0.08)' : undefined,
                }}>
                  {workB ? (
                    <>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f472b6', marginBottom: 4 }}>{workB.title}</div>
                      <Badge variant="muted">{workB.type}</Badge>
                    </>
                  ) : (
                    <>
                      <Upload size={20} color="var(--text-muted)" style={{ marginBottom: 6 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select Work B</span>
                    </>
                  )}
                </Card>
              </div>

              {/* Run comparison button */}
              <div style={{ textAlign: 'center' }}>
                <Button
                  variant={workA && workB ? 'primary' : 'secondary'}
                  onClick={() => { if (workA && workB) setPhase('results'); }}
                  style={{ opacity: workA && workB ? 1 : 0.4, pointerEvents: workA && workB ? 'auto' : 'none', padding: '10px 32px' }}
                >
                  <Sparkles size={14} style={{ marginRight: 6 }} />
                  Run Deep Comparison
                </Button>
              </div>
              <ScrollIntoView />
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Work Picker ── */
  if (phase === 'picking') {
    const isExternal = comparisonType === 'uploaded' || (comparisonType === 'vs-external' && pickingSide === 'B');
    return (
      <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <button onClick={() => setPhase('select')} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', marginBottom: 16, padding: 0,
          }}>
            <ChevronLeft size={14} /> Back
          </button>

          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>
            Select Work {pickingSide}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
            {isExternal ? 'Upload an external book or paste text for decomposition.' : 'Choose from your library.'}
          </p>

          {isExternal && (
            <Card style={{ padding: 24, marginBottom: 16, textAlign: 'center', border: '1px dashed var(--border)' }}>
              <Upload size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>Drop a file here or click to upload</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>.txt, .md, .epub, .pdf — up to 500k words</div>
              <div style={{ marginTop: 12 }}>
                <Button variant="secondary" onClick={() => {
                  const ext = { id: 'external', title: pickingSide === 'A' ? 'The Wizard of Oz' : 'The Remains of the Day', type: 'External Upload', chapters: '?' };
                  if (pickingSide === 'A') setWorkA(ext); else setWorkB(ext);
                  setPhase('select');
                }}>
                  <Upload size={12} style={{ marginRight: 4 }} /> Simulate Upload
                </Button>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sampleWorksLibrary.map(w => (
              <Card key={w.id} onClick={() => {
                if (pickingSide === 'A') setWorkA({ ...w, type: 'Your Project' });
                else setWorkB({ ...w, type: 'Your Project' });
                setPhase('select');
              }} style={{
                padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.15s',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{w.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.type} · {w.chapters} chapters</div>
                </div>
                <Badge variant={w.status === 'Complete' ? 'green' : 'amber'}>{w.status}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Results Screen ── */
  const data = sampleComparisonData;
  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => setPhase('select')} style={{
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem',
        }}>
          <ChevronLeft size={14} /> New Comparison
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            <span style={{ color: 'var(--accent)' }}>{data.workA.title}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 10px', fontWeight: 400 }}>vs</span>
            <span style={{ color: '#f472b6' }}>{data.workB.title}</span>
          </h2>
        </div>
        <Badge variant="accent" style={{ fontSize: '0.85rem', padding: '5px 14px' }}>
          {data.overallDivergence}% divergent
        </Badge>
      </div>

      {/* What Changed summary */}
      <Card style={{ padding: 16, marginBottom: 16, background: 'linear-gradient(135deg, var(--accent-glow) 0%, rgba(244,114,182,0.06) 100%)' }}>
        <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 10 }}>
          <Sparkles size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> What Changed — Key Structural Differences
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.topChanges.map((change, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span>{change}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Dimension toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {comparisonDimensions.map(d => {
          const Icon = d.icon;
          const active = activeDimensions.includes(d.key);
          return (
            <Badge key={d.key} onClick={() => toggleDimension(d.key)} variant={active ? 'accent' : 'muted'} style={{
              cursor: 'pointer', opacity: active ? 1 : 0.5, transition: 'all 0.15s',
              border: active ? `1px solid ${d.color}40` : '1px solid transparent',
              background: active ? `${d.color}15` : undefined,
              color: active ? d.color : undefined,
            }}>
              <Icon size={10} style={{ marginRight: 4 }} /> {d.label}
            </Badge>
          );
        })}
        <Badge onClick={() => setShowRadar(!showRadar)} variant={showRadar ? 'accent' : 'muted'} style={{ cursor: 'pointer', marginLeft: 'auto' }}>
          Radar {showRadar ? 'On' : 'Off'}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showRadar ? '1fr 320px' : '1fr', gap: 16 }}>
        {/* Dimension cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comparisonDimensions.filter(d => activeDimensions.includes(d.key)).map(d => {
            const Icon = d.icon;
            const dim = data.dimensions[d.key];
            if (!dim) return null;
            const expanded = expandedDimension === d.key;

            return (
              <Card key={d.key} style={{ overflow: 'hidden', border: expanded ? `1px solid ${d.color}40` : undefined }}>
                {/* Dimension header */}
                <div onClick={() => setExpandedDimension(expanded ? null : d.key)} style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  background: expanded ? `${d.color}08` : undefined,
                }}>
                  <Icon size={16} color={d.color} />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', flex: 1 }}>{d.label}</span>

                  {/* Divergence bar */}
                  <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden', marginRight: 8 }}>
                    <div style={{
                      width: `${dim.divergence}%`, height: '100%', borderRadius: 3,
                      background: dim.divergence > 70 ? '#ef4444' : dim.divergence > 40 ? '#fbbf24' : '#34d399',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: dim.divergence > 70 ? '#ef4444' : dim.divergence > 40 ? '#fbbf24' : '#34d399', minWidth: 28 }}>
                    {dim.divergence}%
                  </span>
                  <ChevronDown size={14} color="var(--text-muted)" style={{
                    transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                  }} />
                </div>

                {/* Key difference summary (always visible) */}
                <div style={{ padding: '0 16px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {dim.keyDiff}
                </div>

                {/* Expanded detail: side by side */}
                {expanded && (
                  <div style={{ padding: '0 16px 16px', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{
                        padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--accent-glow)',
                        border: '1px solid var(--accent)', borderColor: 'rgba(var(--accent-rgb, 99,102,241), 0.2)',
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {data.workA.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{dim.summaryA}</div>
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Structural Score</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>{dim.scoreA}/10</span>
                        </div>
                      </div>
                      <div style={{
                        padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(244,114,182,0.06)',
                        border: '1px solid rgba(244,114,182,0.2)',
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f472b6', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {data.workB.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{dim.summaryB}</div>
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Structural Score</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f472b6' }}>{dim.scoreB}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Radar chart sidebar */}
        {showRadar && (
          <div style={{ position: 'sticky', top: 0 }}>
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>
                Structural Fingerprint
              </h3>
              {renderRadarChart()}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} />
                  {data.workA.title.split(' ').slice(0, 3).join(' ')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f472b6' }} />
                  {data.workB.title.split(' ').slice(0, 3).join(' ')}
                </div>
              </div>
            </Card>

            {/* Quick stats */}
            <Card style={{ padding: 16, marginTop: 10 }}>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                Dimension Divergence
              </h3>
              {comparisonDimensions.filter(d => activeDimensions.includes(d.key)).map(d => {
                const dim = data.dimensions[d.key];
                if (!dim) return null;
                return (
                  <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.7rem', color: d.color, width: 70, flexShrink: 0 }}>{d.label}</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${dim.divergence}%`, height: '100%', borderRadius: 2, background: d.color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>{dim.divergence}</span>
                  </div>
                );
              })}
            </Card>

            {/* Export */}
            <Card style={{ padding: 16, marginTop: 10 }}>
              <Button variant="secondary" style={{ width: '100%', marginBottom: 6 }}>
                <Download size={12} style={{ marginRight: 4 }} /> Export as Markdown
              </Button>
              <Button variant="secondary" style={{ width: '100%' }}>
                <Download size={12} style={{ marginRight: 4 }} /> Export as PDF
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Relationship Graph ─── */
function RelationshipGraph() {
  const [centerCharacter, setCenterCharacter] = useState('miriam');
  const [filterType, setFilterType] = useState(null); // null = show all
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.4, Math.min(3, z + delta)));
  };

  const handleSvgMouseDown = (e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleSvgMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleSvgMouseUp = () => setIsPanning(false);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const characters = {
    miriam:  { name: 'Miriam Yoder',    initials: 'MY', color: '#e85d2a' },
    daniel:  { name: 'Daniel Yoder',    initials: 'DY', color: '#818cf8' },
    bishop:  { name: 'Bishop Lapp',     initials: 'BL', color: '#64748b' },
    ruth:    { name: 'Ruth Byler',      initials: 'RB', color: '#f472b6' },
    sarah:   { name: 'Sarah Miller',    initials: 'SM', color: '#f97316' },
    eli:     { name: 'Eli Stoltzfus',   initials: 'ES', color: '#fbbf24' },
    hannah:  { name: 'Hannah Yoder',    initials: 'HY', color: '#2dd4bf' },
  };

  // Full relationship web — characters connect to EACH OTHER, not just Miriam
  const relationships = [
    // Miriam's connections
    { from: 'miriam', to: 'daniel',  type: 'family',    label: 'Married', strength: 5 },
    { from: 'miriam', to: 'hannah',  type: 'family',    label: 'Mother-Daughter', strength: 5 },
    { from: 'miriam', to: 'ruth',    type: 'friend',    label: 'Close friends', strength: 4 },
    { from: 'miriam', to: 'sarah',   type: 'rival',     label: 'Tension over standing', strength: 3 },
    { from: 'miriam', to: 'eli',     type: 'mentor',    label: 'Spiritual guide', strength: 3 },
    { from: 'miriam', to: 'bishop',  type: 'authority',  label: 'Under his authority', strength: 2 },
    // Daniel's connections (beyond Miriam)
    { from: 'daniel', to: 'hannah',  type: 'family',    label: 'Father-Daughter', strength: 4 },
    { from: 'daniel', to: 'bishop',  type: 'authority',  label: 'Congregant', strength: 2 },
    { from: 'daniel', to: 'eli',     type: 'friend',    label: 'Old friends', strength: 3 },
    // Hannah's connections
    { from: 'hannah', to: 'ruth',    type: 'friend',    label: 'Auntie figure', strength: 3 },
    { from: 'hannah', to: 'sarah',   type: 'rival',     label: 'Distrusts her', strength: 1 },
    // Ruth's connections
    { from: 'ruth', to: 'sarah',     type: 'rival',     label: 'Former friends', strength: 2 },
    { from: 'ruth', to: 'bishop',    type: 'authority',  label: 'Questions his judgment', strength: 1 },
    // Sarah's connections
    { from: 'sarah', to: 'bishop',   type: 'ally',      label: 'Aligned interests', strength: 3 },
    // Eli's connections
    { from: 'eli', to: 'bishop',     type: 'rival',     label: 'Theological disagreement', strength: 2 },
    { from: 'eli', to: 'hannah',     type: 'mentor',    label: 'Teaching her', strength: 2 },
  ];

  const relationshipColors = {
    family: '#818cf8',
    friend: '#2dd4bf',
    rival: '#f97316',
    authority: '#a78bfa',
    mentor: '#fbbf24',
    ally: '#4ade80',
  };

  // Circular layout positions centered on selected character
  const getPositions = () => {
    const charKeys = Object.keys(characters);
    const cx = 300, cy = 240, radius = 160;
    const centerIdx = charKeys.indexOf(centerCharacter);
    const others = charKeys.filter(k => k !== centerCharacter);
    const positions = {};
    positions[centerCharacter] = { x: cx, y: cy };
    others.forEach((k, i) => {
      const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
      positions[k] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    });
    return positions;
  };
  const positions = getPositions();

  // Count connections per character
  const connectionCounts = {};
  Object.keys(characters).forEach(k => {
    connectionCounts[k] = relationships.filter(r => r.from === k || r.to === k).length;
  });
  const mostConnected = Object.entries(connectionCounts).sort((a, b) => b[1] - a[1])[0];
  const strongestBond = [...relationships].sort((a, b) => b.strength - a.strength)[0];

  // Filter relationships by type if filter is active
  const visibleRels = filterType ? relationships.filter(r => r.type === filterType) : relationships;

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Character Relationships</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click a character to recenter. Click a relationship type to filter.</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { type: null, label: 'All' },
            { type: 'family', label: 'Family' },
            { type: 'friend', label: 'Friends' },
            { type: 'rival', label: 'Rivals' },
            { type: 'authority', label: 'Authority' },
            { type: 'mentor', label: 'Mentors' },
            { type: 'ally', label: 'Allies' },
          ].map(f => (
            <button key={f.label} onClick={() => setFilterType(f.type)} style={{
              padding: '3px 10px', fontSize: '0.7rem', borderRadius: 100, cursor: 'pointer',
              border: `1px solid ${filterType === f.type ? (f.type ? relationshipColors[f.type] : 'var(--accent)') : 'var(--border)'}`,
              background: filterType === f.type ? (f.type ? relationshipColors[f.type] + '22' : 'var(--accent-glow)') : 'transparent',
              color: filterType === f.type ? (f.type ? relationshipColors[f.type] : 'var(--accent)') : 'var(--text-muted)',
              fontWeight: filterType === f.type ? 600 : 400,
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, flex: 1, minHeight: 0 }}>
        {/* SVG Graph */}
        <Card style={{ padding: 0, overflow: 'hidden', background: 'var(--bg-tertiary)', position: 'relative' }}>
          {/* Zoom controls */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 5,
            display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: 2,
          }}>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} style={{
              width: 28, height: 28, border: 'none', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <button onClick={resetView} style={{
              height: 28, border: 'none', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.65rem', padding: '0 6px',
            }}>{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(z => Math.max(0.4, z - 0.2))} style={{
              width: 28, height: 28, border: 'none', borderRadius: 'var(--radius-sm)',
              background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
          </div>

          <svg width="100%" height="100%" viewBox="0 0 600 480"
            style={{ background: 'var(--bg-tertiary)', minHeight: 340, cursor: isPanning ? 'grabbing' : 'grab' }}
            onWheel={handleWheel}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
          <g transform={`translate(${300 + pan.x / zoom}, ${240 + pan.y / zoom}) scale(${zoom}) translate(${-300}, ${-240})`}>
            {/* Draw relationship lines */}
            {visibleRels.map(rel => {
              const f = positions[rel.from];
              const t = positions[rel.to];
              if (!f || !t) return null;
              const color = relationshipColors[rel.type] || '#818cf8';
              const dash = rel.type === 'authority' ? '6,4' : rel.type === 'rival' ? '3,3' : '';
              const opacity = rel.strength >= 4 ? 0.8 : rel.strength >= 2 ? 0.5 : 0.3;
              const width = rel.strength >= 4 ? 2.5 : rel.strength >= 2 ? 1.5 : 1;
              // Curved lines to avoid overlap — offset midpoint
              const mx = (f.x + t.x) / 2 + (f.y - t.y) * 0.12;
              const my = (f.y + t.y) / 2 + (t.x - f.x) * 0.12;
              return (
                <g key={`${rel.from}-${rel.to}`}>
                  <path
                    d={`M ${f.x} ${f.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                    stroke={color}
                    strokeWidth={width}
                    strokeDasharray={dash}
                    fill="none"
                    opacity={opacity}
                  />
                  {/* Label at midpoint */}
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize="7.5" fill={color} opacity={0.8}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {rel.label}
                  </text>
                </g>
              );
            })}

            {/* Draw character nodes */}
            {Object.entries(characters).map(([key, char]) => {
              const pos = positions[key];
              const isCenter = centerCharacter === key;
              const r = isCenter ? 26 : 20;
              const connCount = connectionCounts[key];
              return (
                <g key={key} onClick={() => setCenterCharacter(key)} style={{ cursor: 'pointer' }}>
                  {/* Glow ring for center character */}
                  {isCenter && <circle cx={pos.x} cy={pos.y} r={r + 6} fill="none" stroke={char.color} strokeWidth={1.5} opacity={0.3} />}
                  <circle cx={pos.x} cy={pos.y} r={r}
                    fill={isCenter ? char.color : 'var(--bg-card)'}
                    stroke={char.color} strokeWidth={isCenter ? 3 : 2}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <text x={pos.x} y={pos.y} textAnchor="middle" dy="0.35em"
                    fontSize={isCenter ? '11' : '10'} fontWeight="700"
                    fill={isCenter ? '#fff' : 'var(--text-primary)'}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {char.initials}
                  </text>
                  <text x={pos.x} y={pos.y + r + 14} textAnchor="middle"
                    fontSize="11" fontWeight="500" fill="var(--text-secondary)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {char.name.split(' ')[0]}
                  </text>
                  {/* Connection count badge */}
                  <circle cx={pos.x + r * 0.7} cy={pos.y - r * 0.7} r={8}
                    fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth={1} />
                  <text x={pos.x + r * 0.7} y={pos.y - r * 0.7} textAnchor="middle" dy="0.35em"
                    fontSize="8" fontWeight="600" fill="var(--text-muted)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {connCount}
                  </text>
                </g>
              );
            })}
          </g>
          </svg>
        </Card>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          {/* Focused character info */}
          <Card style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: characters[centerCharacter].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              }}>{characters[centerCharacter].initials}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{characters[centerCharacter].name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {connectionCounts[centerCharacter]} connections
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {relationships.filter(r => r.from === centerCharacter || r.to === centerCharacter).map(rel => {
                const otherKey = rel.from === centerCharacter ? rel.to : rel.from;
                const other = characters[otherKey];
                return (
                  <div key={`${rel.from}-${rel.to}`} onClick={() => setCenterCharacter(otherKey)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      background: 'var(--bg-tertiary)', fontSize: '0.75rem',
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: relationshipColors[rel.type], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-primary)' }}>{other.name.split(' ')[0]}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{rel.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <Card style={{ padding: 12 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Relationship Types</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(relationshipColors).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}>
                  <div style={{ width: 12, height: 3, background: color, borderRadius: 2 }} />
                  <span style={{ textTransform: 'capitalize' }}>{type}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card style={{ padding: 12 }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Network Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Characters</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{Object.keys(characters).length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Connections</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{relationships.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Strongest</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {characters[strongestBond.from].name.split(' ')[0]} ↔ {characters[strongestBond.to].name.split(' ')[0]}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Most Connected</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {characters[mostConnected[0]].name.split(' ')[0]} ({mostConnected[1]})
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── World Building View ─── */
function WorldBuildingMode() {
  const [activeTab, setActiveTab] = useState('overview');

  const worldTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'locations', label: 'Locations' },
    { key: 'culture', label: 'Culture & Rules' },
    { key: 'history', label: 'History' },
    { key: 'hallmarks', label: 'Hallmarks' },
  ];

  const locations = [
    { name: 'Yoder Homestead', type: 'Residence', importance: 'Primary', desc: 'The family farmhouse where Miriam and Daniel live. White clapboard, wraparound porch, kitchen is the emotional center.', connections: ['Miriam', 'Daniel', 'Hannah'] },
    { name: 'Byler General Store', type: 'Commerce', importance: 'Secondary', desc: 'Community gathering point. Where gossip spreads and alliances form. Ruth runs the counter.', connections: ['Ruth', 'Sarah'] },
    { name: 'Meeting House', type: 'Sacred', importance: 'Primary', desc: 'Rotating church services held in community homes. The physical space where communal judgment is passed.', connections: ['Bishop Lapp', 'Eli'] },
    { name: "Eli's Workshop", type: 'Private', importance: 'Secondary', desc: 'A woodworking shop at the edge of the settlement. Smells of cedar and linseed. Where forbidden conversations happen.', connections: ['Eli', 'Miriam'] },
    { name: 'The Covered Bridge', type: 'Landmark', importance: 'Symbolic', desc: 'Literal and metaphorical crossing point between the Amish settlement and the English world beyond.', connections: ['Hannah'] },
    { name: 'Miller Farm', type: 'Residence', importance: 'Secondary', desc: 'Sarah\'s family property, larger and more prosperous. Source of quiet resentment in the community.', connections: ['Sarah'] },
  ];

  const cultureRules = [
    { rule: 'Ordnung', category: 'Governance', desc: 'Unwritten code of conduct governing every aspect of daily life. Interpreted by the Bishop.', tension: 'high' },
    { rule: 'Rumspringa', category: 'Coming of Age', desc: 'Period where youth experience the outside world before choosing baptism. Hannah is approaching hers.', tension: 'medium' },
    { rule: 'Meidung (Shunning)', category: 'Punishment', desc: 'Social avoidance of those who break rules. The central threat hanging over Miriam.', tension: 'critical' },
    { rule: 'Gelassenheit', category: 'Values', desc: 'Yielding to God\'s will and community. Submission over individuality. The ideology Miriam wrestles with.', tension: 'high' },
    { rule: 'Plain Dress', category: 'Identity', desc: 'Kapps, aprons, suspenders. Visible markers of belonging that become symbols of conformity.', tension: 'low' },
    { rule: 'Technology Boundaries', category: 'Daily Life', desc: 'No electricity from grid, limited phone use, horse-and-buggy. The lines are blurring.', tension: 'medium' },
  ];

  const hallmarks = [
    { name: 'The Quilting Frame', type: 'Object', significance: 'Community and silence. Women share truths stitching together that they can\'t say aloud.', chapters: [2, 5, 9] },
    { name: 'Kerosene Lamplight', type: 'Atmosphere', significance: 'Warm amber glow = safety. Flickering = doubt. Extinguished = crisis.', chapters: [1, 4, 7, 11] },
    { name: 'Horse & Buggy', type: 'Transportation', significance: 'Slow pace of life. Claustrophobia of the settlement. The sound of hooves = approaching judgment.', chapters: [3, 6, 8] },
    { name: 'The Garden', type: 'Setting', significance: 'Miriam\'s private space. Growing things = nurturing secret self. Seasons mirror her arc.', chapters: [1, 4, 7, 10, 12] },
    { name: 'Bread Baking', type: 'Ritual', significance: 'Communal duty. Miriam kneads anger into dough. Breaking bread = reconciliation or hypocrisy.', chapters: [2, 6, 11] },
    { name: 'The Letter', type: 'Object', significance: 'An unsent letter to the outside world. Represents Miriam\'s hidden desire. Found = catastrophe.', chapters: [5, 8, 12] },
  ];

  const history = [
    { year: '1720s', event: 'Amish settlement established in Lancaster County', relevance: 'Foundation of the community\'s identity' },
    { year: '1850s', event: 'The Great Schism — community splits over modernization', relevance: 'Echo of current tensions. Eli remembers stories from his grandfather.' },
    { year: '1970s', event: 'Wisconsin v. Yoder — Supreme Court exempts Amish from compulsory education', relevance: 'Legal precedent that both protects and isolates the community' },
    { year: '2005', event: 'Miriam & Daniel\'s wedding — community celebration', relevance: 'High point of belonging. What Miriam risks losing.' },
    { year: '2018', event: 'Hannah\'s birth — difficult delivery, English hospital', relevance: 'First crack — Miriam saw another world and can\'t unsee it.' },
    { year: '2024', event: 'Bishop Lapp\'s new restrictions — stricter Ordnung interpretation', relevance: 'Catalyst for the story. The tightening that forces Miriam to choose.' },
  ];

  const tensionColor = (t) => t === 'critical' ? '#ef4444' : t === 'high' ? '#f97316' : t === 'medium' ? '#fbbf24' : '#4ade80';

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 2 }}>World Building</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>The Shunning Season — Lancaster County, PA</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
        {worldTabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)',
            border: 'none', cursor: 'pointer',
            background: activeTab === t.key ? 'var(--accent-glow)' : 'transparent',
            color: activeTab === t.key ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: activeTab === t.key ? 600 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>Setting</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                A tight-knit Old Order Amish community in Lancaster County, Pennsylvania. Present day. Rolling farmland, horse-drawn buggies, white fences — a world that looks pastoral from the outside but seethes with hidden tensions underneath.
              </div>
            </Card>
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>Time Period</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Contemporary (2024-2025). The story spans one year — from early spring planting through winter communion. Seasonal rhythms mirror Miriam's internal journey from compliance to questioning to decision.
              </div>
            </Card>
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>Tone & Atmosphere</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Quiet but taut. Silence carries weight. Beauty and claustrophobia coexist — golden wheat fields enclosed by invisible walls. Domestic suspense. The danger is not violence but erasure.
              </div>
            </Card>
            <Card style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>Central Tension</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Individual conscience vs. communal belonging. Miriam's growing awareness that she cannot remain who she is within the community — and the devastating cost of leaving everything she loves to become herself.
              </div>
            </Card>
            {/* Quick stats row */}
            <Card style={{ padding: 16, gridColumn: '1 / -1', display: 'flex', gap: 24 }}>
              {[
                { label: 'Locations', value: locations.length, color: '#2dd4bf' },
                { label: 'Cultural Rules', value: cultureRules.length, color: '#a78bfa' },
                { label: 'Hallmarks', value: hallmarks.length, color: '#fbbf24' },
                { label: 'Historical Events', value: history.length, color: '#818cf8' },
                { label: 'Tension Level', value: 'High', color: '#f97316' },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Locations */}
        {activeTab === 'locations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {locations.map(loc => (
              <Card key={loc.name} style={{ padding: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                  background: loc.importance === 'Primary' ? 'var(--accent-glow)' : loc.importance === 'Symbolic' ? 'rgba(251,191,36,0.15)' : 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                }}>
                  {loc.type === 'Residence' ? '🏠' : loc.type === 'Commerce' ? '🏪' : loc.type === 'Sacred' ? '⛪' : loc.type === 'Private' ? '🔨' : loc.type === 'Landmark' ? '🌉' : '🏡'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{loc.name}</span>
                    <span style={{
                      fontSize: '0.6rem', padding: '1px 6px', borderRadius: 100,
                      background: loc.importance === 'Primary' ? 'var(--accent-glow)' : loc.importance === 'Symbolic' ? 'rgba(251,191,36,0.15)' : 'var(--bg-tertiary)',
                      color: loc.importance === 'Primary' ? 'var(--accent)' : loc.importance === 'Symbolic' ? '#fbbf24' : 'var(--text-muted)',
                    }}>{loc.importance}</span>
                    <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 100, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{loc.type}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{loc.desc}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {loc.connections.map(c => (
                      <span key={c} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 100, border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{c}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Culture & Rules */}
        {activeTab === 'culture' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cultureRules.map(rule => (
              <Card key={rule.rule} style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tensionColor(rule.tension), flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rule.rule}</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 100, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{rule.category}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '1px 6px', borderRadius: 100,
                    background: tensionColor(rule.tension) + '22', color: tensionColor(rule.tension),
                  }}>{rule.tension} tension</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingLeft: 16 }}>{rule.desc}</div>
              </Card>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            {/* Vertical timeline line */}
            <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.map((h, i) => (
                <div key={h.year} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  {/* Dot on the line */}
                  <div style={{
                    position: 'absolute', left: -20, top: 8,
                    width: 10, height: 10, borderRadius: '50%',
                    background: i >= history.length - 2 ? 'var(--accent)' : 'var(--bg-tertiary)',
                    border: `2px solid ${i >= history.length - 2 ? 'var(--accent)' : 'var(--border)'}`,
                  }} />
                  <Card style={{ padding: 12, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{h.year}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{h.event}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{h.relevance}</div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hallmarks */}
        {activeTab === 'hallmarks' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {hallmarks.map(h => (
              <Card key={h.name} style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{h.name}</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 100, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{h.type}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{h.significance}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {h.chapters.map(ch => (
                    <span key={ch} style={{
                      fontSize: '0.65rem', padding: '1px 6px', borderRadius: 100,
                      background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 500,
                    }}>Ch {ch}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Character Profile ─── */
const characterProfiles = {
  Elena: {
    name: 'Elena Vasquez', role: 'Protagonist', type: 'Main protagonist', tier: 'main',
    color: '#2dd4bf', gradient: 'linear-gradient(135deg, #2dd4bf, #f472b6)',
    age: '28', gender: 'Cis woman', sexuality: 'Heterosexual',
    religion: 'Lapsed Catholic', lifePhilosophy: 'Existentialism',
    relationshipStatus: 'Recently separated', parentalStatus: 'No children',
    livingStatus: 'Lives alone', financialUpbringing: 'Middle class', currentFinancial: 'Financially stable',
    emotionalRegister: 'Anxious',
    mbti: 'INFJ-T', mbtiLabel: 'The Advocate',
    enneagram: 'Type 4 — The Individualist', enneagramWing: '4w5',
    alignment: 'Chaotic Good',
    zodiac: 'Scorpio',
    build: 'Slim', height: 'Average (5\'4"–5\'6")', hairColor: 'Dark brown', eyeColor: 'Hazel-green', skinTone: 'Olive',
    flaw: 'Fear of abandonment', virtue: 'Empathy', wound: 'Conditional love — only loved when performing/achieving',
    coreValues: ['Honesty / Integrity', 'Freedom / Autonomy'],
    personalCode: ['Never lie to someone who trusts you', 'Question every authority', 'If you break it, you fix it'],
    selfCareHealthy: 'Meaningful conversation with a trusted person',
    selfCareDestructive: 'Isolation that becomes withdrawal',
    socialPositioning: 'Insider who secretly doesn\'t belong',
    networkArchetype: 'Bridge',
    antilifeSeal: 'Projection (Seal 5) — assigns her own fears to others and then reacts to the projection',
    voice: {
      speechRhythm: 'Circling / Recursive', vocabularyRegister: 'Educated Casual',
      volumePacing: 'Quiet by default', dialogueTic: 'Starts sentences with "I mean—" when about to say something true',
      metaphorFamily: 'Architecture / Structure', defensiveSpeech: 'Becomes overly analytical',
      subtextDefault: 'Cannot say "I need you"',
    },
    arcStart: 'Ordinary life — performing normalcy after separation',
    arcEnd: 'Quiet resolve — accepts imperfection, stops performing',
    arcType: 'Positive arc with regression',
    beats: ['Ordinary life', 'Discovers letter', 'Confronts Marcus', 'Investigates past', 'Betrayal revealed', 'Confrontation', 'Grief & doubt', 'Final reckoning', 'Quiet resolve', 'Rebuilding', 'New normal', 'Epilogue'],
    physicalDescription: 'Elena is twenty-eight and looks it — not in the way that means young, but in the way that means she has started to carry things. Slim, average height, olive-toned skin that holds the remnants of summers she barely remembers enjoying. Dark brown hair she keeps shoulder-length and mostly forgets about. Hazel-green eyes that change color depending on the light, which people comment on and she finds exhausting.',
    // Radar chart data
    strengths: { emotional: 9, analytical: 7, social: 6, physical: 4, creative: 8, resilience: 5, intuition: 9, leadership: 5 },
    temperament: { openness: 9, conscientiousness: 6, extraversion: 3, agreeableness: 7, neuroticism: 8 },
    swot: {
      strengths: ['Deep empathy reads people accurately', 'Strong moral compass', 'Creative problem-solver'],
      weaknesses: ['Overthinks to paralysis', 'Avoids direct confrontation', 'Performance-based self-worth'],
      opportunities: ['Separation forces genuine self-discovery', 'New relationships without pretense', 'Marcus situation demands courage she has but doesn\'t know'],
      threats: ['Abandonment wound triggered by every departure', 'Isolation spiral when overwhelmed', 'Projection flaw creates false enemies'],
    },
    relationships: [
      { name: 'Marcus', type: 'Deuteragonist', dynamic: 'Complicated ally / former trust', attachment: 'Anxious-Avoidant' },
      { name: 'Priya', type: 'Supporting', dynamic: 'Best friend / honest mirror', attachment: 'Secure' },
      { name: 'Thomas', type: 'Minor', dynamic: 'Information source / old connection', attachment: 'Avoidant' },
      { name: 'Ruth', type: 'Minor', dynamic: 'Maternal figure / quiet anchor', attachment: 'Secure' },
      { name: 'Bishop Lapp', type: 'Minor', dynamic: 'Authority figure / pressure', attachment: 'Fearful-Avoidant' },
    ],
  },
  Marcus: {
    name: 'Marcus Chen', role: 'Deuteragonist', type: 'Antihero', tier: 'main',
    color: '#818cf8', gradient: 'linear-gradient(135deg, #818cf8, #f97316)',
    age: '32', gender: 'Cis man', sexuality: 'Heterosexual',
    religion: 'Agnostic', lifePhilosophy: 'Pragmatism',
    relationshipStatus: 'Single — recently ended', parentalStatus: 'No children',
    livingStatus: 'Lives alone', financialUpbringing: 'Upper-middle class', currentFinancial: 'Comfortable',
    emotionalRegister: 'Tense',
    mbti: 'ENTJ-A', mbtiLabel: 'The Commander',
    enneagram: 'Type 3 — The Achiever', enneagramWing: '3w4',
    alignment: 'Lawful Neutral',
    zodiac: 'Capricorn',
    build: 'Athletic / Toned', height: 'Tall (5\'11"–6\'1")', hairColor: 'Black', eyeColor: 'Dark brown', skinTone: 'Warm tan',
    flaw: 'Compulsive lying', virtue: 'Determination', wound: 'Had success stolen or uncredited',
    coreValues: ['Achievement / Excellence', 'Loyalty'],
    personalCode: ['Never let them see you bleed', 'Always finish what you start', 'The ends justify the means'],
    selfCareHealthy: 'Physical movement — running, training',
    selfCareDestructive: 'Overworking to the point of collapse',
    socialPositioning: 'Overestimated position',
    networkArchetype: 'Hub',
    antilifeSeal: 'Deception (Seal 3) — the lie he told is the load-bearing wall; remove it and everything falls',
    voice: {
      speechRhythm: 'Declarative / Direct', vocabularyRegister: 'Formal / Elevated',
      volumePacing: 'Measured regardless', dialogueTic: 'Names people in conversation — "Elena, listen" — as a control mechanism',
      metaphorFamily: 'Business / Transactions', defensiveSpeech: 'Becomes charming',
      subtextDefault: 'Cannot say "I was wrong"',
    },
    arcStart: 'Keeping secrets — maintaining the edifice',
    arcEnd: 'Open wound — the lie undone, no rebuild yet',
    arcType: 'Negative arc (fall)',
    beats: ['Keeping secrets', 'Avoidance', 'Deflection', 'Cracking facade', 'Exposed', 'Rage', 'Rock bottom', 'Admission', 'Penance', 'Withdrawal', 'Tentative return', 'Open wound'],
    physicalDescription: 'Marcus is thirty-two and built like someone who runs before dawn — athletic, toned, the specific kind of fit that reads as discipline rather than vanity. Tall, dark-haired, dark-eyed, warm tan skin. He dresses well in the way that costs money but pretends not to. His face is handsome and controlled — the kind of face that looks like it is listening carefully when it is actually calculating.',
    strengths: { emotional: 4, analytical: 9, social: 8, physical: 7, creative: 5, resilience: 7, intuition: 6, leadership: 9 },
    temperament: { openness: 5, conscientiousness: 9, extraversion: 8, agreeableness: 3, neuroticism: 4 },
    swot: {
      strengths: ['Charismatic and persuasive', 'Strategic thinker', 'Physically disciplined'],
      weaknesses: ['Cannot be vulnerable', 'Compulsive dishonesty under pressure', 'Confuses control with care'],
      opportunities: ['Exposure forces authenticity', 'Elena\'s integrity could model another way', 'Rock bottom creates genuine humility'],
      threats: ['Success-wound makes any failure existential', 'Charm is both asset and cage', 'Overwork spiral masks emotional collapse'],
    },
    relationships: [
      { name: 'Elena', type: 'Protagonist', dynamic: 'Former trust / guilt object', attachment: 'Avoidant' },
      { name: 'Priya', type: 'Supporting', dynamic: 'Reluctant mediator', attachment: 'Dismissive' },
      { name: 'Thomas', type: 'Minor', dynamic: 'Old ally / liability', attachment: 'Transactional' },
      { name: 'Bishop Lapp', type: 'Minor', dynamic: 'Authority confrontation', attachment: 'Antagonistic' },
    ],
  },
  Priya: {
    name: 'Priya Sharma', role: 'Supporting', type: 'Foil', tier: 'main',
    color: '#a78bfa', gradient: 'linear-gradient(135deg, #fbbf24, #a78bfa)',
    age: '30', gender: 'Cis woman', sexuality: 'Lesbian',
    religion: 'Hindu (cultural, not practicing)', lifePhilosophy: 'Stoicism',
    relationshipStatus: 'In a long-term relationship', parentalStatus: 'No children',
    livingStatus: 'Lives with partner', financialUpbringing: 'Upper-middle class', currentFinancial: 'Comfortable',
    emotionalRegister: 'Sardonic',
    mbti: 'ENTP-A', mbtiLabel: 'The Debater',
    enneagram: 'Type 8 — The Challenger', enneagramWing: '8w7',
    alignment: 'Neutral Good',
    zodiac: 'Aries',
    build: 'Curvy', height: 'Average (5\'4"–5\'6")', hairColor: 'Black', eyeColor: 'Dark brown', skinTone: 'Medium brown',
    flaw: 'Sarcasm as a weapon', virtue: 'Courage', wound: 'First experience of racism during formative years',
    coreValues: ['Justice / Fairness', 'Courage'],
    personalCode: ['Say what you mean', 'Protect those who can\'t protect themselves', 'Don\'t take more than your share'],
    selfCareHealthy: 'Humor — finding something to laugh at',
    selfCareDestructive: 'Social saturation — being with people constantly',
    socialPositioning: 'Orientation lateral',
    networkArchetype: 'Connector',
    antilifeSeal: 'None — she is the story\'s clearest-seeing character, which costs her differently',
    voice: {
      speechRhythm: 'Question-forward', vocabularyRegister: 'Educated Casual',
      volumePacing: 'Loud by default — fills the room', dialogueTic: 'Deflects with humor when the subject is serious',
      metaphorFamily: 'Food / Cooking', defensiveSpeech: 'Gets louder and funnier',
      subtextDefault: 'Cannot say "I\'m scared for you"',
    },
    arcStart: 'Background ally — concerned but uninvolved',
    arcEnd: 'New path — own agency discovered through others\' crisis',
    arcType: 'Positive arc (growth)',
    beats: ['Background ally', 'Concerned friend', 'Overhears', 'Starts digging', 'Caught in middle', 'Picks a side', 'Confronts Elena', 'Bridge builder', 'Own revelation', 'Taking charge', 'Mediator', 'New path'],
    physicalDescription: 'Priya is thirty and built like someone who enjoys life — curvy in the way that means she eats well and moves when she wants to. Average height, black hair she wears in different styles depending on her mood. Dark brown eyes that are always slightly amused, which people find either disarming or infuriating.',
    strengths: { emotional: 6, analytical: 7, social: 9, physical: 5, creative: 7, resilience: 8, intuition: 7, leadership: 7 },
    temperament: { openness: 8, conscientiousness: 5, extraversion: 9, agreeableness: 6, neuroticism: 3 },
    swot: {
      strengths: ['Fearless truth-teller', 'Reads rooms instantly', 'Natural mediator despite combative style'],
      weaknesses: ['Humor as deflection prevents depth', 'Over-identifies as the strong one', 'Social saturation avoids self-reflection'],
      opportunities: ['Friends\' crisis reveals her own unlived questions', 'Bridge-building develops leadership', 'Confrontation with Elena deepens the friendship'],
      threats: ['Being everyone\'s anchor exhausts her', 'Sarcasm alienates at the wrong moment', 'Justice orientation can become self-righteousness'],
    },
    relationships: [
      { name: 'Elena', type: 'Protagonist', dynamic: 'Best friend / honest mirror', attachment: 'Secure' },
      { name: 'Marcus', type: 'Deuteragonist', dynamic: 'Reluctant mediator / suspicious', attachment: 'Guarded' },
      { name: 'Thomas', type: 'Minor', dynamic: 'Unexpected ally', attachment: 'Curious' },
    ],
  },
  Thomas: {
    name: 'Thomas Weaver', role: 'Minor', type: 'Unexpected ally', tier: 'minor',
    color: '#6ee7b7', gradient: 'linear-gradient(135deg, #6ee7b7, #60a5fa)',
    age: '45', gender: 'Cis man', religion: 'Mennonite (Plain)',
    emotionalRegister: 'Cautious',
    mbti: 'ISFJ-T', mbtiLabel: 'The Defender',
    enneagram: 'Type 6 — The Loyalist', enneagramWing: '6w5',
    alignment: 'Lawful Neutral',
    build: 'Sturdy', height: 'Tall (5\'10"–5\'11")', hairColor: 'Gray-brown', eyeColor: 'Blue-gray', skinTone: 'Fair',
    flaw: 'Overprotectiveness', virtue: 'Reliability', wound: 'Lost faith in community institutions',
    voice: {
      speechRhythm: 'Measured', vocabularyRegister: 'Plain-spoken',
      subtextDefault: 'Cannot say "I am afraid for you"',
    },
    arcStart: 'Isolated insider — caught between two worlds',
    arcEnd: 'Deliberate choice — chooses his own path',
    arcType: 'Subtle positive arc',
    beats: ['Isolation', 'First contact', 'Suspicion', 'Shared truth', 'Commitment', 'Consequence', 'Standing firm'],
    physicalDescription: 'Thomas is forty-five and looks like someone who has worked with his hands all his life. Sturdy build, tall, with graying hair and blue-gray eyes. The kind of quiet presence that takes up space without demanding attention.',
    strengths: { emotional: 5, analytical: 6, social: 4, physical: 7, creative: 3, resilience: 7, intuition: 6, leadership: 4 },
    relationships: [
      { name: 'Elena', type: 'Protagonist', dynamic: 'Information source / old connection', attachment: 'Avoidant' },
      { name: 'Marcus', type: 'Deuteragonist', dynamic: 'Old ally / liability', attachment: 'Transactional' },
    ],
    swot: {
      strengths: ['Trustworthy', 'Deep community knowledge', 'Physically capable'],
      weaknesses: ['Difficulty with direct confrontation', 'Bound by loyalty codes', 'Isolated from mainstream support'],
      opportunities: ['New relationships outside the community', 'Voice of dissent becomes strength', 'Redemption through honesty'],
      threats: ['Community rejection if truth emerges', 'Caught between protecting others and himself', 'Age and isolation compound isolation'],
    },
  },
  Ruth: {
    name: 'Ruth Miller', role: 'Minor', type: 'Maternal anchor', tier: 'minor',
    color: '#f9a8d4', gradient: 'linear-gradient(135deg, #f9a8d4, #818cf8)',
    age: '58', gender: 'Cis woman', religion: 'Mennonite (Plain)',
    emotionalRegister: 'Grounded',
    mbti: 'ISFP-A', mbtiLabel: 'The Adventurer',
    enneagram: 'Type 2 — The Helper', enneagramWing: '2w1',
    alignment: 'Lawful Good',
    build: 'Round', height: 'Average (5\'2"–5\'3")', hairColor: 'Gray with silver', eyeColor: 'Warm brown', skinTone: 'Fair',
    flaw: 'Enables others\' avoidance', virtue: 'Kindness', wound: 'Too much responsibility too young',
    voice: {
      speechRhythm: 'Gentle', vocabularyRegister: 'Plain-spoken with warmth',
      subtextDefault: 'Cannot say "You must face this yourself"',
    },
    arcStart: 'Quiet anchor — holding space for others',
    arcEnd: 'Gentle boundaries — love with honesty',
    arcType: 'Subtle positive arc',
    beats: ['Ordinary duty', 'Elena arrives', 'Small kindnesses', 'Hears truth', 'Torn loyalty', 'Clear sight', 'Quiet wisdom'],
    physicalDescription: 'Ruth is fifty-eight and moves through the world with the ease of someone who has settled into her own skin. Round-faced, warm brown eyes, gray and silver hair pulled back. Her hands are always doing something — counting change, wiping a counter, reaching out to steady someone.',
    strengths: { emotional: 8, analytical: 4, social: 7, physical: 5, creative: 4, resilience: 7, intuition: 7, leadership: 3 },
    relationships: [
      { name: 'Elena', type: 'Protagonist', dynamic: 'Maternal figure / quiet anchor', attachment: 'Secure' },
    ],
    swot: {
      strengths: ['Genuine kindness', 'Deep listening', 'Community trusted'],
      weaknesses: ['Difficulty setting boundaries', 'Over-identifies with caretaker role', 'Conflict avoidance'],
      opportunities: ['Truth-telling deepens relationships', 'Discovering own needs', 'Modeling healthy boundaries'],
      threats: ['Community judgment if loyalty questioned', 'Compassion fatigue', 'Enabling others\' harm cycles'],
    },
  },
  'Bishop Lapp': {
    name: 'Bishop Lapp', role: 'Minor', type: 'Authority figure', tier: 'minor',
    color: '#94a3b8', gradient: 'linear-gradient(135deg, #94a3b8, #475569)',
    age: '72', gender: 'Cis man', religion: 'Mennonite (Plain) — Elder',
    emotionalRegister: 'Rigid',
    mbti: 'ISTJ-T', mbtiLabel: 'The Logistician',
    enneagram: 'Type 1 — The Reformer', enneagramWing: '1w2',
    alignment: 'Lawful Neutral',
    build: 'Lean', height: 'Tall (5\'9"–5\'10")', hairColor: 'White', eyeColor: 'Steel gray', skinTone: 'Fair',
    flaw: 'Righteousness disguises fear', virtue: 'Principle', wound: 'Changing world threatens identity',
    voice: {
      speechRhythm: 'Declarative', vocabularyRegister: 'Biblical / formal',
      subtextDefault: 'Cannot say "I don\'t know what to do"',
    },
    arcStart: 'Absolute authority — enforcing the law',
    arcEnd: 'Uncertain ground — law fails to contain truth',
    arcType: 'Negative arc (pressure)',
    beats: ['Absolute order', 'First challenge', 'Community pressure', 'Rules invoked', 'Rule fails', 'Confrontation', 'Helplessness'],
    physicalDescription: 'Bishop Lapp is seventy-two and carries authority in his posture. Lean, tall, white-bearded, with steel gray eyes that see through every pretense. His clothes are severe Plain dress — the uniform of his office.',
    strengths: { emotional: 2, analytical: 7, social: 6, physical: 3, creative: 2, resilience: 5, intuition: 3, leadership: 8 },
    relationships: [
      { name: 'Elena', type: 'Protagonist', dynamic: 'Authority figure / pressure', attachment: 'Fearful-Avoidant' },
      { name: 'Marcus', type: 'Deuteragonist', dynamic: 'Authority confrontation', attachment: 'Antagonistic' },
    ],
    swot: {
      strengths: ['Community respect and authority', 'Clear moral framework', 'Decades of experience'],
      weaknesses: ['Cannot adapt to changing values', 'Weaponizes scripture', 'Deaf to dissenting voices'],
      opportunities: ['Crisis forces reflection on doctrine', 'Meeting resistance shows limits of power', 'Possible growth toward humility'],
      threats: ['Community fractures if authority questioned', 'Personal faith shaken', 'Becomes isolated fixture of old order'],
    },
  },
};

function CharacterProfile({ characterName, onBack, onViewArc, onViewRelationships }) {
  const [activeTab, setActiveTab] = useState('overview');
  const char = characterProfiles[characterName];
  if (!char) return <div style={{ padding: 40, textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Character profile not found.</p></div>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'identity', label: 'Identity' },
    { key: 'personality', label: 'Personality' },
    { key: 'voice', label: 'Voice' },
    { key: 'arc', label: 'Arc & Role' },
    { key: 'radar', label: 'Analysis' },
  ];

  // Radar chart renderer
  const renderRadar = (data, labels, colors, title, size = 220) => {
    const cx = size / 2, cy = size / 2, r = size / 2 - 30;
    const keys = Object.keys(data);
    const n = keys.length;
    if (n < 3) return null;
    const angleStep = (Math.PI * 2) / n;
    const getPoint = (i, val, maxVal = 10) => {
      const angle = (i * angleStep) - Math.PI / 2;
      return { x: cx + (val / maxVal) * r * Math.cos(angle), y: cy + (val / maxVal) * r * Math.sin(angle) };
    };
    const rings = [0.25, 0.5, 0.75, 1];
    return (
      <div>
        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>{title}</h4>
        <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ maxHeight: size }}>
          {rings.map(pct => {
            const pts = keys.map((_, i) => {
              const angle = (i * angleStep) - Math.PI / 2;
              return `${cx + r * pct * Math.cos(angle)},${cy + r * pct * Math.sin(angle)}`;
            });
            return <polygon key={pct} points={pts.join(' ')} fill="none" stroke="var(--border)" strokeWidth={0.5} opacity={0.4} />;
          })}
          {keys.map((k, i) => {
            const angle = (i * angleStep) - Math.PI / 2;
            const lx = cx + r * Math.cos(angle);
            const ly = cy + r * Math.sin(angle);
            const labelX = cx + (r + 16) * Math.cos(angle);
            const labelY = cy + (r + 16) * Math.sin(angle);
            return (
              <g key={k}>
                <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
                <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle"
                  fill={colors || char.color} fontSize={6.5} fontWeight={500}>{labels?.[k] || k}</text>
              </g>
            );
          })}
          <polygon
            points={keys.map((k, i) => { const p = getPoint(i, data[k]); return `${p.x},${p.y}`; }).join(' ')}
            fill={char.color} fillOpacity={0.2} stroke={char.color} strokeWidth={1.5}
          />
          {keys.map((k, i) => {
            const p = getPoint(i, data[k]);
            return <circle key={k} cx={p.x} cy={p.y} r={3} fill={char.color} />;
          })}
        </svg>
      </div>
    );
  };

  const sectionStyle = { marginBottom: 20 };
  const labelStyle = { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 };
  const valueStyle = { fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 };
  const gridRowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 };
  const attrCard = (label, value, accent) => (
    <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ ...valueStyle, color: accent || 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <ChevronLeft size={14} /> Cast
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: char.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#000', flexShrink: 0 }}>
            {characterName[0]}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{char.name}</h1>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <Badge variant="accent">{char.role}</Badge>
              <Badge variant="muted">{char.type}</Badge>
              <Badge style={{ background: `${char.color}20`, color: char.color }}>{char.mbti}</Badge>
              <Badge style={{ background: '#fbbf2420', color: '#fbbf24' }}>{char.enneagramWing}</Badge>
              <Badge style={{ background: '#a78bfa20', color: '#a78bfa' }}>{char.alignment}</Badge>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button variant="secondary" onClick={onViewArc} style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
            <TrendingUp size={12} style={{ marginRight: 4 }} /> View Arc
          </Button>
          <Button variant="secondary" onClick={onViewRelationships} style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
            <Heart size={12} style={{ marginRight: 4 }} /> Relationships
          </Button>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            background: 'none', border: 'none', padding: '8px 14px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: activeTab === t.key ? 600 : 400,
            color: activeTab === t.key ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div>
            {/* Physical description */}
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <h3 style={labelStyle}>Physical Description</h3>
              <p style={{ ...valueStyle, fontStyle: 'italic', fontSize: '0.83rem' }}>{char.physicalDescription}</p>
            </Card>

            {/* Quick stats grid */}
            <div style={gridRowStyle}>
              {attrCard('Age', char.age)}
              {char.zodiac ? attrCard('Zodiac', char.zodiac) : attrCard('Tier', char.tier === 'minor' ? 'Minor Character' : 'Main Character')}
            </div>
            <div style={gridRowStyle}>
              {attrCard('Build', char.build)}
              {attrCard('Height', char.height)}
            </div>
            <div style={gridRowStyle}>
              {attrCard('Hair', char.hairColor)}
              {attrCard('Eyes', char.eyeColor)}
            </div>

            {/* Wound / Flaw / Virtue triangle */}
            <Card style={{ padding: 16, marginTop: 4, background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(16,185,129,0.06) 100%)' }}>
              <h3 style={{ ...labelStyle, color: 'var(--accent)' }}>Wound → Flaw → Virtue</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>WOUND</div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{char.wound}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>FLAW</div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{char.flaw}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, marginBottom: 4 }}>VIRTUE</div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{char.virtue}</div>
                </div>
              </div>
            </Card>

            {/* SWOT */}
            <div style={{ marginTop: 16 }}>
              <h3 style={labelStyle}>SWOT Analysis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { key: 'strengths', label: 'Strengths', color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
                  { key: 'weaknesses', label: 'Weaknesses', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
                  { key: 'opportunities', label: 'Opportunities', color: '#60a5fa', bg: 'rgba(96,165,250,0.06)' },
                  { key: 'threats', label: 'Threats', color: '#fbbf24', bg: 'rgba(251,191,36,0.06)' },
                ].map(s => (
                  <Card key={s.key} style={{ padding: 12, background: s.bg, border: `1px solid ${s.color}20` }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: s.color, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
                    {char.swot[s.key].map((item, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 3, paddingLeft: 8, borderLeft: `2px solid ${s.color}30` }}>
                        {item}
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Radar charts */}
          <div>
            <Card style={{ padding: 16, marginBottom: 12 }}>
              {char.strengths && renderRadar(char.strengths, {
                emotional: 'Emotional', analytical: 'Analytical', social: 'Social', physical: 'Physical',
                creative: 'Creative', resilience: 'Resilience', intuition: 'Intuition', leadership: 'Leadership',
              }, null, 'Strengths Profile')}
            </Card>
            {char.temperament && (
              <Card style={{ padding: 16 }}>
                {renderRadar(char.temperament, {
                  openness: 'Openness', conscientiousness: 'Conscient.', extraversion: 'Extraversion',
                  agreeableness: 'Agreeable.', neuroticism: 'Neuroticism',
                }, '#a78bfa', 'Big Five Temperament')}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ── Identity Tab ── */}
      {activeTab === 'identity' && (
        <div style={{ maxWidth: 680 }}>
          <div style={gridRowStyle}>
            {attrCard('Gender', char.gender || '—')}
            {char.sexuality ? attrCard('Sexuality', char.sexuality) : attrCard('Emotional Register', char.emotionalRegister, char.color)}
          </div>
          <div style={gridRowStyle}>
            {attrCard('Religion / Faith', char.religion || '—')}
            {attrCard('Life Philosophy', char.lifePhilosophy || '—')}
          </div>
          {char.relationshipStatus && (
            <div style={gridRowStyle}>
              {attrCard('Relationship Status', char.relationshipStatus)}
              {attrCard('Parental Status', char.parentalStatus || '—')}
            </div>
          )}
          {char.livingStatus && (
            <div style={gridRowStyle}>
              {attrCard('Living Situation', char.livingStatus)}
              {attrCard('Emotional Register', char.emotionalRegister, char.color)}
            </div>
          )}
          {char.financialUpbringing && (
            <div style={gridRowStyle}>
              {attrCard('Financial Upbringing', char.financialUpbringing)}
              {attrCard('Current Financial', char.currentFinancial || '—')}
            </div>
          )}

          {/* Core Values & Personal Code — only for main characters */}
          {char.coreValues && (
            <Card style={{ padding: 16, marginTop: 8 }}>
              <h3 style={labelStyle}>Core Values</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {char.coreValues.map(v => <Badge key={v} variant="accent">{v}</Badge>)}
              </div>
              {char.personalCode && (
                <>
                  <h3 style={labelStyle}>Personal Code</h3>
                  {char.personalCode.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid var(--accent)', opacity: 0.9 }}>
                      "{c}"
                    </div>
                  ))}
                </>
              )}
            </Card>
          )}

          {char.selfCareHealthy && (
            <div style={{ ...gridRowStyle, marginTop: 12 }}>
              <Card style={{ padding: 12 }}>
                <div style={labelStyle}>Self-Care (Healthy)</div>
                <div style={{ fontSize: '0.82rem', color: '#10b981' }}>{char.selfCareHealthy}</div>
              </Card>
              <Card style={{ padding: 12 }}>
                <div style={labelStyle}>Self-Care (Destructive)</div>
                <div style={{ fontSize: '0.82rem', color: '#ef4444' }}>{char.selfCareDestructive}</div>
              </Card>
            </div>
          )}

          {char.socialPositioning && (
            <div style={gridRowStyle}>
              {attrCard('Social Positioning', char.socialPositioning)}
              {attrCard('Network Archetype', char.networkArchetype || '—')}
            </div>
          )}

          {char.antilifeSeal && (
            <Card style={{ padding: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ ...labelStyle, color: '#ef4444' }}>Antilife Seal</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{char.antilifeSeal}</div>
            </Card>
          )}

          {/* Simplified identity card for minor characters */}
          {char.tier === 'minor' && (
            <Card style={{ padding: 16, marginTop: 12, background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>Minor Character</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This is a minor character with a simplified profile. Key identity details are shown above. For deeper analysis, see the Personality and Arc tabs.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ── Personality Tab ── */}
      {activeTab === 'personality' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* MBTI Card */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: `${char.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={22} color={char.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: char.color }}>{char.mbti}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{char.mbtiLabel}</div>
              </div>
            </div>
            {/* MBTI axes visualization */}
            {[
              { axis: 'E/I', left: 'Extrovert', right: 'Introvert', value: char.mbti.includes('I') ? 75 : 25 },
              { axis: 'S/N', left: 'Sensing', right: 'Intuitive', value: char.mbti.includes('N') ? 75 : 25 },
              { axis: 'T/F', left: 'Thinking', right: 'Feeling', value: char.mbti.includes('F') ? 75 : 25 },
              { axis: 'J/P', left: 'Judging', right: 'Perceiving', value: char.mbti.includes('P') ? 75 : 25 },
            ].map(a => (
              <div key={a.axis} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                  <span>{a.left}</span><span>{a.right}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: `${a.value}%`, height: '100%', borderRadius: 3, background: char.color, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Variant: <span style={{ color: char.mbti.includes('-T') ? '#fbbf24' : '#10b981', fontWeight: 600 }}>{char.mbti.includes('-T') ? 'Turbulent' : 'Assertive'}</span>
            </div>
          </Card>

          {/* Enneagram Card */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fbbf2420', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24' }}>{char.enneagramWing[0]}</span>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>{char.enneagramWing}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{char.enneagram}</div>
              </div>
            </div>
            {/* Enneagram circle visualization */}
            <svg width="100%" viewBox="0 0 200 200" style={{ maxHeight: 180 }}>
              {Array.from({ length: 9 }, (_, i) => {
                const angle = ((i) * (Math.PI * 2) / 9) - Math.PI / 2;
                const cx2 = 100 + 70 * Math.cos(angle);
                const cy2 = 100 + 70 * Math.sin(angle);
                const typeNum = i + 1;
                const isMain = char.enneagramWing.startsWith(String(typeNum));
                const isWing = char.enneagramWing.includes(`w${typeNum}`);
                return (
                  <g key={i}>
                    <circle cx={cx2} cy={cy2} r={isMain ? 16 : isWing ? 13 : 10}
                      fill={isMain ? '#fbbf24' : isWing ? '#fbbf2440' : 'var(--bg-tertiary)'}
                      stroke={isMain || isWing ? '#fbbf24' : 'var(--border)'} strokeWidth={isMain ? 2 : 1}
                    />
                    <text x={cx2} y={cy2} textAnchor="middle" dominantBaseline="central"
                      fill={isMain ? '#000' : isWing ? '#fbbf24' : 'var(--text-muted)'}
                      fontSize={isMain ? 11 : 9} fontWeight={isMain ? 700 : 400}>{typeNum}</text>
                  </g>
                );
              })}
            </svg>
          </Card>

          {/* Alignment Card */}
          <Card style={{ padding: 16 }}>
            <h3 style={labelStyle}>Moral Alignment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'].map(a => {
                const isActive = a === char.alignment;
                const row = a.includes('Good') ? '#10b981' : a.includes('Evil') ? '#ef4444' : '#fbbf24';
                return (
                  <div key={a} style={{
                    padding: '6px 4px', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                    fontSize: '0.65rem', fontWeight: isActive ? 700 : 400,
                    background: isActive ? `${row}20` : 'var(--bg-tertiary)',
                    border: isActive ? `2px solid ${row}` : '1px solid var(--border)',
                    color: isActive ? row : 'var(--text-muted)',
                  }}>{a}</div>
                );
              })}
            </div>
          </Card>

          {/* Emotional Register */}
          <Card style={{ padding: 16 }}>
            <h3 style={labelStyle}>Emotional Register (Baseline)</h3>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: char.color, marginBottom: 8 }}>{char.emotionalRegister}</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              This is where {characterName} starts — not where they end. The arc is the phase shift away from and back toward this register.
            </p>
          </Card>
        </div>
      )}

      {/* ── Voice Tab ── */}
      {activeTab === 'voice' && (
        <div style={{ maxWidth: 680 }}>
          <Card style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, var(--accent-glow) 0%, var(--bg-secondary) 100%)' }}>
            <h3 style={{ ...labelStyle, color: 'var(--accent)' }}>Voice Fingerprint</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Derived from {char.mbti} + {char.enneagramWing} + wound ({char.wound?.split(' — ')[0] || char.wound})
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Speech Rhythm', value: char.voice?.speechRhythm },
                { label: 'Vocabulary Register', value: char.voice?.vocabularyRegister },
                { label: 'Volume & Pacing', value: char.voice?.volumePacing },
                { label: 'Dialogue Tic', value: char.voice?.dialogueTic },
                { label: 'Metaphor Family', value: char.voice?.metaphorFamily },
                { label: 'Defensive Speech', value: char.voice?.defensiveSpeech },
              ].filter(v => v.value).map(v => (
                <div key={v.label} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: char.color, fontWeight: 600, marginBottom: 4 }}>{v.label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{v.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {char.voice?.subtextDefault && (
            <Card style={{ padding: 16, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <h3 style={{ ...labelStyle, color: '#ef4444' }}>Subtext Default — What They Cannot Say</h3>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                "{char.voice.subtextDefault}"
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Arc & Role Tab ── */}
      {activeTab === 'arc' && (
        <div style={{ maxWidth: 720 }}>
          <div style={gridRowStyle}>
            {attrCard('Arc Type', char.arcType, char.color)}
            {attrCard('Story Role', `${char.role} — ${char.type}`)}
          </div>

          <Card style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={labelStyle}>Arc Journey</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{char.arcStart}</div>
              <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, var(--text-muted) 0%, ${char.color} 100%)` }} />
              <div style={{ padding: '6px 10px', background: `${char.color}15`, borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: char.color, fontWeight: 600 }}>{char.arcEnd}</div>
            </div>
          </Card>

          {/* Beat-by-beat timeline */}
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={labelStyle}>Chapter Beats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {char.beats.map((beat, i) => {
                const tc = timelineCharacters.find(c => c.name === characterName);
                const intensity = tc ? tc.arc[i] : 5;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 40, flexShrink: 0 }}>Ch {i + 1}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${intensity * 10}%`, height: '100%', borderRadius: 3, background: char.color, opacity: 0.4 + (intensity / 10) * 0.6, transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 120 }}>{beat}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 20, textAlign: 'right' }}>{intensity}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Relationships quick list */}
          <Card style={{ padding: 16 }}>
            <h3 style={labelStyle}>Key Relationships</h3>
            {char.relationships.map((rel, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < char.relationships.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: (characterProfiles[rel.name]?.gradient || 'var(--bg-tertiary)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000' }}>
                  {rel.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rel.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>{rel.type}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rel.dynamic}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Attachment: {rel.attachment}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── Analysis Tab (Radar Charts) ── */}
      {activeTab === 'radar' && (
        <div style={{ display: 'grid', gridTemplateColumns: char.temperament ? '1fr 1fr' : '1fr', gap: 16 }}>
          {char.strengths && (
            <Card style={{ padding: 20 }}>
              {renderRadar(char.strengths, {
                emotional: 'Emotional', analytical: 'Analytical', social: 'Social', physical: 'Physical',
                creative: 'Creative', resilience: 'Resilience', intuition: 'Intuition', leadership: 'Leadership',
              }, null, 'Strengths & Capabilities', 280)}
            </Card>
          )}
          {char.temperament && (
            <Card style={{ padding: 20 }}>
              {renderRadar(char.temperament, {
                openness: 'Openness', conscientiousness: 'Conscientiousness', extraversion: 'Extraversion',
                agreeableness: 'Agreeableness', neuroticism: 'Neuroticism',
              }, '#a78bfa', 'Big Five Temperament', 280)}
            </Card>
          )}
          <Card style={{ padding: 20, gridColumn: '1 / -1' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Attribute Scores</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {Object.entries(char.strengths).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 70, textTransform: 'capitalize' }}>{k}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ width: `${v * 10}%`, height: '100%', borderRadius: 4, background: char.color, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: char.color, width: 20 }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function PlaceholderMode({ name }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>{name}</h2>
      <p style={{ color: 'var(--text-muted)' }}>This mode will be built out with full interactivity.</p>
    </div>
  );
}

/* ─── Phase Colors ─── */
const phaseColors = {
  1: '#818cf8', // Author — indigo
  2: '#a78bfa', // Narrator — violet
  3: '#60a5fa', // Quality Control — blue
  4: '#2dd4bf', // World — teal
  5: '#f472b6', // Characters — pink
  6: '#f9a8d4', // Relationships — rose
  7: '#fbbf24', // Story Foundation — amber
  8: '#f97316', // Chapter Execution — orange
  9: '#4ade80', // Editor — green
};

const phaseNames = {
  1: 'Phase 1 — Author',
  2: 'Phase 2 — Narrator',
  3: 'Phase 3 — Quality Control',
  4: 'Phase 4 — World',
  5: 'Phase 5 — Characters',
  6: 'Phase 6 — Relationships',
  7: 'Phase 7 — Story Foundation',
  8: 'Phase 8 — Chapter Execution',
  9: 'Phase 9 — Editor',
};

function BottomStatusBar({ currentPhase, wordCount, wordLimit, onPhaseClick, onOverLimitClick }) {
  const isOver = wordCount > wordLimit;
  const pColor = phaseColors[currentPhase] || 'var(--text-muted)';
  const pName = phaseNames[currentPhase] || `Phase ${currentPhase}`;

  const fmtCount = wordCount.toLocaleString();
  const fmtLimit = wordLimit.toLocaleString();

  return (
    <div style={{
      height: 32,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      fontSize: '0.7rem',
      color: 'var(--text-muted)',
      gap: 16,
    }}>
      {/* Phase — clickable, colored per phase */}
      <span
        onClick={onPhaseClick}
        style={{ color: pColor, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
        title="Go to phase list"
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: pColor, display: 'inline-block' }} />
        {pName}
      </span>

      <span style={{ color: 'var(--border)' }}>|</span>

      {/* Word Count — turns red when over limit */}
      {isOver ? (
        <span
          onClick={onOverLimitClick}
          style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          title="Over word limit — click for help trimming"
        >
          <AlertTriangle size={11} />
          {fmtCount} / {fmtLimit} words (+{(wordCount - wordLimit).toLocaleString()} over)
        </span>
      ) : (
        <span>{fmtCount} / {fmtLimit} words</span>
      )}

      <span style={{ color: 'var(--border)' }}>|</span>
      <span>Auto-saved</span>
      <div style={{ flex: 1 }} />
      <span>Novel (Adult) · Literary Fiction + Thriller</span>
    </div>
  );
}

/* ─── Persistent Quick Chat ─── */
function QuickChat({ expanded, onToggle, onOpenFull, onSetMode }) {
  const [msg, setMsg] = useState('');
  const [focused, setFocused] = useState(false);

  // Uses CSS variables so colors adapt to theme changes
  const bgStyle = {
    background: `linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)`,
    borderTop: '1px solid var(--accent-border)',
  };

  // Collapsed: a single-line input pill with inline send icon
  if (!expanded) {
    return (
      <div style={{ ...bgStyle, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          onClick={onToggle}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            borderRadius: 100,
            cursor: 'text',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          <MessageSquare size={14} color="var(--accent)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400, flex: 1 }}>
            Ask about your story, brainstorm ideas, or request changes...
          </span>
          {/* Inline send icon — partial opacity, inside the pill */}
          <SendHorizontal size={16} color="var(--accent)" style={{ opacity: 0.3, flexShrink: 0 }} />
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            borderRadius: 100,
            color: 'var(--accent)',
            cursor: 'pointer',
            padding: '5px 8px',
            display: 'flex', alignItems: 'center',
          }}
          title="Expand chat"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  // Expanded: full chat input area — all colors via CSS vars
  return (
    <div style={{
      ...bgStyle,
      padding: '10px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquare size={13} color="var(--accent)" />
        <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>Quick Chat</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { onSetMode('chat'); onToggle(); }}
          style={{
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            borderRadius: 100,
            color: 'var(--accent)',
            cursor: 'pointer',
            padding: '3px 10px',
            fontSize: '0.68rem',
            fontWeight: 500,
          }}
        >
          Open Full Story Assistant
        </button>
        <button
          onClick={onToggle}
          style={{
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-border)',
            borderRadius: 100,
            color: 'var(--accent)',
            cursor: 'pointer',
            padding: '5px 8px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <ChevronDown size={13} />
        </button>
      </div>
      {/* Input area */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask about your story, brainstorm ideas, or request changes..."
            rows={2}
            style={{
              width: '100%', padding: '10px 40px 10px 16px',
              background: 'var(--accent-subtle)',
              border: focused ? '1px solid var(--accent-focus)' : '1px solid var(--accent-border)',
              borderRadius: 16, color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)', fontSize: '0.8rem', resize: 'vertical',
              minHeight: 44, maxHeight: 160,
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box',
            }}
          />
          {/* Send icon inside textarea, vertically centered right */}
          <button
            style={{
              position: 'absolute',
              right: 10, top: '50%', transform: 'translateY(-50%)',
              background: msg.trim() ? 'var(--accent)' : 'var(--accent-glow)',
              border: 'none',
              borderRadius: 100,
              color: msg.trim() ? '#fff' : 'var(--accent)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: msg.trim() ? 1 : 0.4,
              transition: 'all 0.2s ease',
            }}
          >
            <SendHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Theme Presets ─── */
const themePresets = {
  midnight: {
    name: 'Midnight', preview: '#0f172a',
    vars: { '--bg-primary': '#0f172a', '--bg-secondary': '#1e293b', '--bg-tertiary': '#334155', '--bg-card': '#283548', '--bg-hover': '#2d3a4d', '--bg-active': '#334155', '--text-primary': '#f1f5f9', '--text-secondary': '#cbd5e1', '--text-muted': '#64748b', '--accent': '#818cf8', '--accent-subtle': 'rgba(129,140,248,0.10)', '--accent-glow': 'rgba(129,140,248,0.20)', '--accent-muted': 'rgba(129,140,248,0.7)', '--accent-border': 'rgba(129,140,248,0.25)', '--accent-focus': 'rgba(129,140,248,0.35)', '--accent-tint': 'rgba(129,140,248,0.08)', '--accent-btn-text': '#000', '--border': '#334155', '--editor-bg': '#0c1425', '--editor-gutter': '#0a1120', '--editor-text': '#cbd5e1', '--editor-minimap': 'rgba(203,213,225,0.15)' },
  },
  ember: {
    name: 'Ember', preview: '#1c1412',
    vars: { '--bg-primary': '#1c1412', '--bg-secondary': '#2a1f1b', '--bg-tertiary': '#3d2e28', '--bg-card': '#332720', '--bg-hover': '#3a2d25', '--bg-active': '#3d2e28', '--text-primary': '#fef2f2', '--text-secondary': '#d6bcb0', '--text-muted': '#8b7265', '--accent': '#f97316', '--accent-subtle': 'rgba(249,115,22,0.10)', '--accent-glow': 'rgba(249,115,22,0.20)', '--accent-muted': 'rgba(249,115,22,0.7)', '--accent-border': 'rgba(249,115,22,0.25)', '--accent-focus': 'rgba(249,115,22,0.35)', '--accent-tint': 'rgba(249,115,22,0.08)', '--accent-btn-text': '#000', '--border': '#3d2e28', '--editor-bg': '#16100e', '--editor-gutter': '#120d0b', '--editor-text': '#d6bcb0', '--editor-minimap': 'rgba(214,188,176,0.15)' },
  },
  forest: {
    name: 'Forest', preview: '#0f1a14',
    vars: { '--bg-primary': '#0f1a14', '--bg-secondary': '#1a2e22', '--bg-tertiary': '#264032', '--bg-card': '#20362a', '--bg-hover': '#253d2f', '--bg-active': '#264032', '--text-primary': '#ecfdf5', '--text-secondary': '#a7d1b8', '--text-muted': '#5b8a6e', '--accent': '#34d399', '--accent-subtle': 'rgba(52,211,153,0.10)', '--accent-glow': 'rgba(52,211,153,0.20)', '--accent-muted': 'rgba(52,211,153,0.7)', '--accent-border': 'rgba(52,211,153,0.25)', '--accent-focus': 'rgba(52,211,153,0.35)', '--accent-tint': 'rgba(52,211,153,0.08)', '--accent-btn-text': '#000', '--border': '#264032', '--editor-bg': '#0c1510', '--editor-gutter': '#0a120d', '--editor-text': '#a7d1b8', '--editor-minimap': 'rgba(167,209,184,0.15)' },
  },
  twilight: {
    name: 'Twilight', preview: '#1a1025',
    vars: { '--bg-primary': '#1a1025', '--bg-secondary': '#261838', '--bg-tertiary': '#3a2650', '--bg-card': '#301f44', '--bg-hover': '#352449', '--bg-active': '#3a2650', '--text-primary': '#f5f3ff', '--text-secondary': '#c4b5fd', '--text-muted': '#7c5fbf', '--accent': '#a78bfa', '--accent-subtle': 'rgba(167,139,250,0.10)', '--accent-glow': 'rgba(167,139,250,0.20)', '--accent-muted': 'rgba(167,139,250,0.7)', '--accent-border': 'rgba(167,139,250,0.25)', '--accent-focus': 'rgba(167,139,250,0.35)', '--accent-tint': 'rgba(167,139,250,0.08)', '--accent-btn-text': '#000', '--border': '#3a2650', '--editor-bg': '#150d20', '--editor-gutter': '#120a1c', '--editor-text': '#c4b5fd', '--editor-minimap': 'rgba(196,181,253,0.15)' },
  },
  daylight: {
    name: 'Daylight', preview: '#fafaf9',
    vars: { '--bg-primary': '#fafaf9', '--bg-secondary': '#f5f5f4', '--bg-tertiary': '#e7e5e4', '--bg-card': '#e8e6e4', '--bg-hover': '#dddbd8', '--bg-active': '#d6d3d1', '--text-primary': '#1c1917', '--text-secondary': '#44403c', '--text-muted': '#78716c', '--accent': '#2563eb', '--accent-hover': '#1d4ed8', '--accent-subtle': 'rgba(37,99,235,0.10)', '--accent-glow': 'rgba(37,99,235,0.18)', '--accent-muted': 'rgba(37,99,235,0.7)', '--accent-border': 'rgba(37,99,235,0.25)', '--accent-focus': 'rgba(37,99,235,0.35)', '--accent-tint': 'rgba(37,99,235,0.08)', '--accent-btn-text': '#ffffff', '--border': '#ccc9c6', '--editor-bg': '#ebeae8', '--editor-gutter': '#e3e1df', '--editor-text': '#1c1917', '--editor-minimap': '#1c191722' },
  },
};

/* ─── Modal Overlay ─── */
function ModalOverlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
        padding: 24, minWidth: 360, maxWidth: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Export Modal ─── */
function ExportModal({ onClose }) {
  const formats = [
    { label: 'Markdown (.md)', desc: 'Plain text with formatting — works everywhere', icon: FileText },
    { label: 'Word Document (.docx)', desc: 'Microsoft Word format with styles', icon: FileText },
    { label: 'PDF (.pdf)', desc: 'Print-ready document with layout', icon: FileText },
    { label: 'JSON Bundle', desc: 'Full project data for backup or migration', icon: Download },
  ];
  const scopes = ['Full Project', 'Current Chapter', 'Characters Only', 'World Building Only'];
  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Export Project</h3>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Format</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {formats.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: i === 0 ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
            border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}>
            <f.icon size={16} color={i === 0 ? 'var(--accent)' : 'var(--text-muted)'} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{f.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Scope</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {scopes.map((s, i) => (
          <Badge key={s} variant={i === 0 ? 'accent' : 'muted'} style={{ cursor: 'pointer', padding: '4px 10px' }}>{s}</Badge>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary"><Download size={14} style={{ marginRight: 4 }} /> Export</Button>
      </div>
    </ModalOverlay>
  );
}

/* ─── Settings Modal ─── */
function SettingsModal({ onClose, currentTheme, onThemeChange }) {
  const settings = [
    { label: 'Auto-save interval', value: '30 seconds', type: 'select' },
    { label: 'Word count goal', value: '70,000', type: 'input' },
    { label: 'Show writing tips', value: true, type: 'toggle' },
    { label: 'Spell check', value: true, type: 'toggle' },
    { label: 'Dark mode', value: currentTheme !== 'daylight', type: 'toggle' },
  ];
  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Settings</h3>
      {/* Theme picker section */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Appearance</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {Object.entries(themePresets).map(([key, theme]) => (
          <div key={key} onClick={() => onThemeChange(key)} style={{
            width: 48, height: 48, borderRadius: 'var(--radius-sm)',
            background: theme.preview, border: currentTheme === key ? '2px solid var(--accent)' : '2px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3,
            transition: 'var(--transition)', position: 'relative',
          }}>
            <span style={{ fontSize: '0.55rem', color: key === 'daylight' ? '#44403c' : '#e2e8f0', fontWeight: 500 }}>{theme.name}</span>
            {currentTheme === key && (
              <div style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
      {/* Other settings */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>General</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {settings.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.label}</span>
            {s.type === 'toggle' ? (
              <div style={{
                width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                background: s.value ? 'var(--accent)' : 'var(--bg-tertiary)', border: '1px solid var(--border)',
                position: 'relative', transition: 'var(--transition)',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2, left: s.value ? 19 : 2, transition: 'var(--transition)',
                }} />
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>{s.value}</span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={onClose}>Save</Button>
      </div>
    </ModalOverlay>
  );
}

/* ─── Theme Picker Modal ─── */
function ThemePickerModal({ onClose, currentTheme, onThemeChange }) {
  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Choose Theme</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>Select a color theme for your workspace</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(themePresets).map(([key, theme]) => (
          <div key={key} onClick={() => { onThemeChange(key); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            background: currentTheme === key ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
            border: currentTheme === key ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition)',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: theme.preview,
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: theme.vars['--accent'] }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: currentTheme === key ? 'var(--accent)' : 'var(--text-primary)' }}>{theme.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: 4, marginTop: 3 }}>
                {['--bg-primary', '--accent', '--text-primary'].map(v => (
                  <div key={v} style={{ width: 12, height: 12, borderRadius: 2, background: theme.vars[v], border: '1px solid rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
            {currentTheme === key && <Badge variant="accent">Active</Badge>}
          </div>
        ))}
      </div>
    </ModalOverlay>
  );
}

/* ─── Main Workspace ─── */
export default function WorkspaceScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'guided';
  const [activeMode, setActiveMode] = useState(initialMode);
  const [activeFile, setActiveFile] = useState(null); // tracks which file is open
  const [selectedCharacter, setSelectedCharacter] = useState(null); // for character profile view
  // Shared editable file contents — persists across editor/reader mode switches
  const [editedFiles, setEditedFiles] = useState({});
  const [leftTab, setLeftTab] = useState('phases');
  const [expandedDim, setExpandedDim] = useState(null);
  const [projectFilesOpen, setProjectFilesOpen] = useState(true);
  const [engineRefOpen, setEngineRefOpen] = useState(false);
  const [quickChatOpen, setQuickChatOpen] = useState(false);
  const [threadExpanded, setThreadExpanded] = useState(false);
  const [overLimitPrompt, setOverLimitPrompt] = useState(false);

  // Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('midnight');

  // Apply theme to document
  const applyTheme = (themeKey) => {
    setCurrentTheme(themeKey);
    const theme = themePresets[themeKey];
    if (theme) {
      Object.entries(theme.vars).forEach(([prop, val]) => {
        document.documentElement.style.setProperty(prop, val);
      });
    }
  };

  // Collapsible + resizable sidebars
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(280);
  const [dragging, setDragging] = useState(null); // 'left' | 'right' | null

  const handleMouseDown = (side) => (e) => {
    e.preventDefault();
    setDragging(side);
    const startX = e.clientX;
    const startWidth = side === 'left' ? leftWidth : rightWidth;
    const onMove = (ev) => {
      const delta = side === 'left' ? ev.clientX - startX : startX - ev.clientX;
      const newW = Math.max(160, Math.min(400, startWidth + delta));
      if (side === 'left') setLeftWidth(newW);
      else setRightWidth(newW);
    };
    const onUp = () => {
      setDragging(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Word count state — in production this comes from the actual manuscript files
  const wordCount = 72450;
  const wordLimit = 70000;

  const openFile = (fileName, parentFolder) => {
    const fullPath = parentFolder ? `${parentFolder}${fileName}` : fileName;
    setActiveFile(fullPath);
    // Chapters and story content open in reader, everything else in file editor
    if (fileName.startsWith('chapter-') || parentFolder === 'story/') {
      setActiveMode('reader');
    } else {
      setActiveMode('file-editor');
    }
  };

  const renderCenter = () => {
    switch (activeMode) {
      case 'guided': return <GuidedFlow />;
      case 'editor': return <EditorMode file={activeFile} />;
      case 'reader': return <ReaderMode file={activeFile} onEdit={() => { setActiveMode('file-editor'); }} editedContent={editedFiles[activeFile]} />;
      case 'file-editor': return <FileEditorMode
        file={activeFile}
        onPreview={() => setActiveMode('reader')}
        onEditorReview={() => setActiveMode('editor')}
        editedContent={editedFiles[activeFile]}
        onContentChange={(text) => setEditedFiles(prev => ({ ...prev, [activeFile]: text }))}
        onSave={(text) => setEditedFiles(prev => ({ ...prev, [activeFile]: text }))}
      />;
      case 'full-cast': return <FullCastMode
        onCharacterClick={(name) => { setSelectedCharacter(name); setActiveMode('character-profile'); }}
        onBack={() => setActiveMode('guided')}
      />;
      case 'comparison': return <ComparisonMode />;
      case 'graph': return <RelationshipGraph />;
      case 'chat': return <ChatMode />;
      case 'timeline': return <TimelineMode />;
      case 'board': return <DrawingBoard />;
      case 'world': return <WorldBuildingMode />;
      case 'character-profile': return <CharacterProfile
        characterName={selectedCharacter}
        onBack={() => setActiveMode('guided')}
        onViewArc={() => { setActiveMode('timeline'); }}
        onViewRelationships={() => { setActiveMode('graph'); }}
      />;
      default: return <PlaceholderMode name={centerStageModes.find(m => m.key === activeMode)?.label || activeMode} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        projectName="The Shunning Season"
        healthRating={4}
        onHealthClick={() => {
          setRightCollapsed(false);
          setTimeout(() => {
            const el = document.getElementById('project-health-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        onSettingsClick={() => setShowSettingsModal(true)}
        onThemeClick={() => setShowThemeModal(true)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── Thread List (far left) — expandable ─── */}
        <div
          onMouseEnter={() => setThreadExpanded(true)}
          onMouseLeave={() => setThreadExpanded(false)}
          style={{
            width: threadExpanded ? 180 : 52,
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 8,
            gap: 4,
            transition: 'width 0.2s ease',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative',
            zIndex: threadExpanded ? 50 : 1,
          }}
        >
          {/* Project items */}
          {[
            { abbr: 'TS', name: 'The Shunning Season', gradient: 'linear-gradient(135deg, #818cf8, #f97316)', active: true },
            { abbr: 'OD', name: 'Orbital Decay', gradient: 'linear-gradient(135deg, #2dd4bf, #60a5fa)', active: false },
            { abbr: 'GD', name: 'Gatsby Decomposition', gradient: 'linear-gradient(135deg, #fbbf24, #f472b6)', active: false },
          ].map((p) => (
            <div
              key={p.abbr}
              onClick={() => p.active ? navigate('/hub') : null}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: threadExpanded ? '4px 10px' : '4px 8px',
                cursor: 'pointer',
                borderLeft: p.active ? '2px solid var(--accent)' : '2px solid transparent',
                opacity: p.active ? 1 : 0.5,
                minHeight: 36,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: p.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                border: p.active ? '2px solid var(--accent)' : 'none',
              }}>
                {p.abbr}
              </div>
              {threadExpanded && (
                <span style={{
                  fontSize: '0.78rem', fontWeight: p.active ? 600 : 400,
                  color: p.active ? 'var(--text-primary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {p.name}
                </span>
              )}
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* New project */}
          <div
            onClick={() => navigate('/wizard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: threadExpanded ? '4px 10px' : '4px 8px',
              cursor: 'pointer',
              marginBottom: 8,
              minHeight: 36,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', color: 'var(--text-muted)', flexShrink: 0,
            }}>
              +
            </div>
            {threadExpanded && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                New Project
              </span>
            )}
          </div>

          {/* Collapse hint when expanded */}
          {threadExpanded && (
            <div
              onClick={() => setThreadExpanded(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '6px 0', borderTop: '1px solid var(--border)',
                cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)',
              }}
            >
              <ChevronsLeft size={12} /> Collapse
            </div>
          )}
        </div>

        {/* ─── Left Nav ─── */}
        <div style={{
          width: leftCollapsed ? 0 : leftWidth,
          minWidth: leftCollapsed ? 0 : undefined,
          background: 'var(--bg-secondary)',
          borderRight: leftCollapsed ? 'none' : '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: dragging === 'left' ? 'none' : 'width 0.2s ease',
          position: 'relative',
          flexShrink: 0,
        }}>
          {!leftCollapsed && (
            <>
              {/* Tab switcher */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                {[
                  { key: 'phases', label: 'Phases' },
                  { key: 'cast', label: 'Cast' },
                  { key: 'files', label: 'Files' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setLeftTab(t.key)}
                    style={{
                      flex: 1, padding: '8px 0', border: 'none', fontSize: '0.75rem', cursor: 'pointer',
                      background: leftTab === t.key ? 'var(--accent-glow)' : 'transparent',
                      color: leftTab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                      fontWeight: leftTab === t.key ? 600 : 400,
                      borderBottom: leftTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
                {/* Collapse button */}
                <button onClick={() => setLeftCollapsed(true)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: '0 6px', fontSize: '0.75rem',
                  display: 'flex', alignItems: 'center',
                }}>
                  <ChevronsLeft size={14} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {leftTab === 'phases' && <PhaseProgress currentPhase={4} />}
                {leftTab === 'cast' && (
                  <CastRoster
                    onCharacterClick={(name) => { setSelectedCharacter(name); setActiveMode('character-profile'); }}
                    onViewFullCast={() => setActiveMode('full-cast')}
                  />
                )}
                {leftTab === 'files' && (
                  <div style={{ fontSize: '0.8rem' }}>
                    {/* Story Project Files — Collapsible */}
                    <div
                      onClick={() => setProjectFilesOpen(prev => !prev)}
                      style={{
                        fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--text-muted)', padding: '4px 4px 6px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {projectFilesOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      Project Files
                    </div>
                    {projectFilesOpen && fileTree.filter(f => !f.section).map((f) => (
                      <div key={f.name}>
                        <div
                          onClick={() => !f.children && f.name.endsWith('.md') ? openFile(f.name, null) : null}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 4px',
                            cursor: f.children ? 'default' : 'pointer',
                            color: f.exists ? 'var(--text-secondary)' : 'var(--text-muted)',
                            borderRadius: 'var(--radius-sm)',
                            background: activeFile === f.name ? 'var(--accent-glow)' : 'transparent',
                            fontWeight: activeFile === f.name ? 600 : 400,
                          }}
                        >
                          {f.children ? <FolderTree size={13} /> : <FileText size={13} />}
                          <span>{f.name}</span>
                        </div>
                        {f.children && f.children.map((c) => {
                          const fullPath = f.name + c;
                          const isFolder = c.endsWith('/');
                          return (
                            <div
                              key={c}
                              onClick={() => !isFolder ? openFile(c, f.name) : null}
                              style={{
                                paddingLeft: 24, fontSize: '0.75rem',
                                color: activeFile === fullPath ? 'var(--accent)' : 'var(--text-muted)',
                                padding: '3px 4px 3px 24px',
                                cursor: isFolder ? 'default' : 'pointer',
                                borderRadius: 'var(--radius-sm)',
                                background: activeFile === fullPath ? 'var(--accent-glow)' : 'transparent',
                                fontWeight: activeFile === fullPath ? 600 : 400,
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              {isFolder ? <FolderTree size={10} /> : <FileText size={10} />}
                              {c}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {/* Engine Reference Files — Collapsible (collapsed by default) */}
                    <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                    <div
                      onClick={() => setEngineRefOpen(prev => !prev)}
                      style={{
                        fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--text-muted)', padding: '4px 4px 6px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {engineRefOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      Engine Reference
                    </div>
                    {engineRefOpen && fileTree.filter(f => f.section === 'engine').map((f) => (
                      <div key={f.name}>
                        <div
                          onClick={() => !f.children && f.name.endsWith('.md') ? openFile(f.name, null) : null}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 4px',
                            cursor: f.children ? 'default' : 'pointer',
                            color: 'var(--text-muted)',
                            borderRadius: 'var(--radius-sm)',
                            background: activeFile === f.name ? 'var(--accent-glow)' : 'transparent',
                            fontWeight: activeFile === f.name ? 600 : 400,
                          }}
                        >
                          {f.children ? <Library size={13} /> : <FileText size={13} />}
                          <span>{f.name}</span>
                        </div>
                        {f.children && f.children.map((c) => {
                          const fullPath = f.name + c;
                          const isFolder = c.endsWith('/');
                          return (
                            <div
                              key={c}
                              onClick={() => !isFolder ? openFile(c, f.name) : null}
                              style={{
                                paddingLeft: 24, fontSize: '0.75rem',
                                color: activeFile === fullPath ? 'var(--accent)' : 'var(--text-muted)',
                                padding: '3px 4px 3px 24px',
                                cursor: isFolder ? 'default' : 'pointer',
                                borderRadius: 'var(--radius-sm)',
                                background: activeFile === fullPath ? 'var(--accent-glow)' : 'transparent',
                                fontWeight: activeFile === fullPath ? 600 : 400,
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}
                            >
                              {isFolder ? <FolderTree size={10} /> : <FileText size={10} />}
                              {c}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Download */}
              <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                <Button variant="ghost" size="sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowExportModal(true)}>
                  <Download size={13} /> Export Project
                </Button>
              </div>

              {/* Drag resize handle */}
              <div
                onMouseDown={handleMouseDown('left')}
                style={{
                  position: 'absolute', right: -3, top: 0, bottom: 0, width: 6,
                  cursor: 'col-resize', zIndex: 10,
                }}
              />
            </>
          )}
        </div>
        {/* Left expand button when collapsed */}
        {leftCollapsed && (
          <button onClick={() => setLeftCollapsed(false)} style={{
            width: 20, background: 'var(--bg-secondary)', border: 'none',
            borderRight: '1px solid var(--border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', flexShrink: 0,
          }}>
            <ChevronsRight size={14} />
          </button>
        )}

        {/* ─── Center Stage ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Mode Tabs */}
          <div style={{
            display: 'flex',
            gap: 2,
            padding: '4px 8px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}>
            {centerStageModes.map((m) => {
              const Icon = m.icon;
              const isActive = activeMode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveMode(m.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon size={13} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
            {renderCenter()}
          </div>
        </div>

        {/* Right expand button when collapsed */}
        {rightCollapsed && (
          <button onClick={() => setRightCollapsed(false)} style={{
            width: 20, background: 'var(--bg-secondary)', border: 'none',
            borderLeft: '1px solid var(--border)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', flexShrink: 0,
          }}>
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* ─── Right Sidebar ─── */}
        <div style={{
          width: rightCollapsed ? 0 : rightWidth,
          minWidth: rightCollapsed ? 0 : undefined,
          background: 'var(--bg-secondary)',
          borderLeft: rightCollapsed ? 'none' : '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: dragging === 'right' ? 'none' : 'width 0.2s ease',
          position: 'relative',
          flexShrink: 0,
        }}>
          {!rightCollapsed && (
            <>
              {/* Drag resize handle */}
              <div
                onMouseDown={handleMouseDown('right')}
                style={{
                  position: 'absolute', left: -3, top: 0, bottom: 0, width: 6,
                  cursor: 'col-resize', zIndex: 10,
                }}
              />

              {/* Collapse button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 6px 0', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                <button onClick={() => setRightCollapsed(true)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  gap: 4, fontSize: '0.65rem',
                }}>
                  Collapse <ChevronsRight size={13} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {/* Section 1: Next Steps */}
                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Next Steps
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                  {[
                    { label: 'Answer hallmarks questions (3 remaining)', action: () => setActiveMode('guided') },
                    { label: 'Run Seven Deaths audit', action: () => { openFile('seven-story-deaths.md', 'quality-control/'); } },
                    { label: 'Review world diagnostic', action: () => setActiveMode('world') },
                    { label: 'Begin Phase 5 — Characters', action: () => { setLeftTab('phases'); } },
                  ].map((step, i) => (
                    <div key={i} onClick={step.action} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)',
                      cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                    }}>
                      <span style={{ color: 'var(--accent)' }}>→</span>
                      {step.label}
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                {/* Section 2: Project Health */}
                <h4 id="project-health-section" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Project Health
                </h4>
                <HealthBar rating={4} style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                  {healthDimensions.map((d) => (
                    <div key={d.name}>
                      <div
                        onClick={() => setExpandedDim(expandedDim === d.name ? null : d.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                        <HealthBar rating={d.rating} showLabel={false} size="sm" style={{ width: 60 }} />
                      </div>
                      {d.flag && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--health-developing)', paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={10} /> {d.flag}
                        </div>
                      )}
                      {expandedDim === d.name && (
                        <div style={{ padding: '8px 8px 8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', margin: '4px 0' }}>
                          Click to view full breakdown with sub-factors and suggestions.
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Needs Attention */}
                <div style={{
                  background: 'rgba(249, 115, 22, 0.06)',
                  border: '1px solid rgba(249, 115, 22, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                  marginBottom: 16,
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--health-needs-work)', marginBottom: 6 }}>
                    Needs Your Attention
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    → Character Depth: Developing (2 issues)<br />
                    → World Integrity: Seven Deaths audit incomplete
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                {/* Section 3: Teaching Tip */}
                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Teaching Tip
                </h4>
                <Card style={{ padding: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <Lightbulb size={13} color="var(--accent)" style={{ marginBottom: 4 }} />
                  <p>Hallmarks are the physical texture of your world. The reader won't remember your theme statement — they'll remember the prayer cap, the gas lamp, the county line. Make them specific enough to photograph.</p>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Persistent Quick Chat ─── */}
      {activeMode !== 'chat' && (
        <QuickChat
          expanded={quickChatOpen}
          onToggle={() => setQuickChatOpen(!quickChatOpen)}
          onSetMode={setActiveMode}
        />
      )}

      {/* ─── Bottom Bar ─── */}
      <BottomStatusBar
        currentPhase={4}
        wordCount={wordCount}
        wordLimit={wordLimit}
        onPhaseClick={() => { setLeftCollapsed(false); setLeftTab('phases'); }}
        onOverLimitClick={() => { setActiveMode('chat'); setOverLimitPrompt(true); }}
      />

      {/* Modals */}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} currentTheme={currentTheme} onThemeChange={applyTheme} />}
      {showThemeModal && <ThemePickerModal onClose={() => setShowThemeModal(false)} currentTheme={currentTheme} onThemeChange={applyTheme} />}
    </div>
  );
}
