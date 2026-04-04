import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProductTour from '../components/ProductTour';
import PhaseProgress, { phases, allPrereqsComplete, overallProgress, currentActivePhase } from '../components/PhaseProgress';
import CastRoster from '../components/CastRoster';
import fileContents from '../data/fileData';
import HealthBar from '../components/HealthBar';
import MarkdownEditor from '../components/MarkdownEditor';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  FileText, FolderTree, ChevronRight, ChevronDown,
  Compass, Edit3, BookOpen, GitCompare, Network, MessageSquare,
  Clock, Palette, Settings, Download, Volume2, Search,
  Lightbulb, AlertTriangle, Pencil, ChevronUp, Send, SendHorizontal, ChevronsLeft, ChevronsRight, Globe,
  Upload, Plus, Library, ArrowLeftRight, TrendingUp, Brain, Eye, Globe2, Users, Heart, BarChart3, Music, HelpCircle, UserCheck, Sparkles, ChevronLeft, X, Copy,
} from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useLlmStore } from '../stores/llmStore';
import { useTTS } from '../hooks/useTTS';
import { removeEmdashes } from '../lib/randomEngine';
import { PROMPTS, STORY_GLOSSARY } from '../lib/promptRegistry';
import { useUndoRedo, useUndoRedoKeys } from '../hooks/useUndoRedo';
import VersionHistory from '../components/VersionHistory';
import SearchPanel from '../components/SearchPanel';
import TokenEstimate from '../components/TokenEstimate';
import DeconstructionOverlay from '../components/DeconstructionOverlay';
import EmotionWheel from '../components/EmotionWheel';
import CharacterGuide from '../components/CharacterGuide';
import TonalArcDesigner from '../components/TonalArcDesigner';
import SubproblemTracker from '../components/SubproblemTracker';
import SceneMetadataEditor from '../components/SceneMetadataEditor';
import ConversationalTeacher from '../components/ConversationalTeacher';
import SceneDynamicsForecast from '../components/SceneDynamicsForecast';
import ReaderExperienceReport from '../components/ReaderExperienceReport';
import VoiceCasting from '../components/VoiceCasting';
import FeedbackManager from '../components/FeedbackManager';
import SandboxMode from '../components/SandboxMode';
import GenreShiftDashboard from '../components/GenreShiftDashboard';
import { countWords } from '../services/exportEngine';
import { STORY_MEDIUMS } from '../lib/constants';

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

/* ─── Consistent Randomizer Button ─── */
/* Use <RollButton /> for ALL randomization actions across the app:
   Roll for Me, Re-roll, Randomize, Shuffle — always Sparkles icon + amber accent. */
function RollButton({ label = 'Roll for Me', onClick, size = 'default', variant = 'secondary' }) {
  const iconSize = size === 'small' ? 12 : 14;
  const fontSize = size === 'small' ? '0.75rem' : undefined;
  return (
    <Button variant={variant} onClick={onClick} style={fontSize ? { fontSize } : undefined}>
      <Sparkles size={iconSize} style={{ marginRight: size === 'small' ? 3 : 4 }} /> {label}
    </Button>
  );
}

/* ─── Gradient colors for project avatars ─── */
const GRADIENTS = [
  'linear-gradient(135deg, #818cf8, #f97316)',
  'linear-gradient(135deg, #2dd4bf, #60a5fa)',
  'linear-gradient(135deg, #fbbf24, #f472b6)',
  'linear-gradient(135deg, #f97316, #ef4444)',
  'linear-gradient(135deg, #a78bfa, #ec4899)',
  'linear-gradient(135deg, #22c55e, #3b82f6)',
  'linear-gradient(135deg, #06b6d4, #8b5cf6)',
  'linear-gradient(135deg, #eab308, #22c55e)',
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
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
  { key: 'voice-casting', icon: Music, label: 'Voice Casting' },
  { key: 'feedback', icon: BarChart3, label: 'Feedback' },
  { key: 'genre-shift', icon: Sparkles, label: 'Genre Shift' },
  { key: 'sandbox', icon: Copy, label: 'Sandbox' },
  { key: 'search', icon: Search, label: 'Search' },
];

// Engine reference files (static — these are template/reference files that don't change per-project)
const engineFileTree = [
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

/**
 * Build project file tree dynamically from store files object.
 * Groups files into folders (characters/, story/, world/, etc.) and lists root-level files.
 */
function buildProjectFileTree(files) {
  const folders = {};
  const rootFiles = [];

  Object.keys(files).sort().forEach(path => {
    const slashIdx = path.indexOf('/');
    if (slashIdx === -1) {
      // Root-level file
      rootFiles.push({ name: path, exists: true });
    } else {
      const folder = path.substring(0, slashIdx + 1); // e.g. "characters/"
      const child = path.substring(slashIdx + 1);       // e.g. "elena.md"
      if (!folders[folder]) folders[folder] = [];
      if (child) folders[folder].push(child);
    }
  });

  const tree = [];
  // Root files first
  rootFiles.forEach(f => tree.push(f));
  // Then folders with their children
  Object.keys(folders).sort().forEach(folder => {
    tree.push({ name: folder, exists: true, children: folders[folder].sort() });
  });

  return tree;
}

// Health dimensions are now computed dynamically — see useHealthDimensions() in the workspace component
// Fallback static data used only until the store hydrates
const defaultHealthDimensions = [
  { name: 'Narrative Arc', key: 'narrativeArc', phase: 6, tip: 'Measures outline quality and story structure.' },
  { name: 'Character Depth', key: 'characterDepth', phase: 4, tip: 'Character file completeness and differentiation.' },
  { name: 'World Building', key: 'worldBuilding', phase: 3, tip: 'World-building detail and consistency.' },
  { name: 'Dialogue Quality', key: 'dialogueQuality', phase: 8, tip: 'Dialogue presence, variety, and naturalism.' },
  { name: 'Pacing', key: 'pacing', phase: 8, tip: 'Chapter length consistency and act structure.' },
  { name: 'Thematic Coherence', key: 'thematicCoherence', phase: 1, tip: 'Theme consistency across the project.' },
  { name: 'Prose Quality', key: 'proseQuality', phase: 8, tip: 'Vocabulary diversity and sentence variety.' },
  { name: 'Emotional Resonance', key: 'emotionalResonance', phase: 8, tip: 'Emotional language density in chapters.' },
  { name: 'Plot Consistency', key: 'plotConsistency', phase: 7, tip: 'Character and event continuity across chapters.' },
  { name: 'Reader Engagement', key: 'readerEngagement', phase: 8, tip: 'Hooks, tension, and cliffhangers.' },
];

/* ─── Center Stage Content ─── */
/* ─── Phase Questions Data ─── */
const phaseQuestions = {
  1: [
    { id: 1, q: 'Who are you as an author?', desc: 'Tell us about yourself — your background, writing experience, and what drives you to tell stories.', hint: 'Example: "I grew up in a small Midwestern town, studied literature, and have always been drawn to stories about communities under pressure."', placeholder: 'Describe yourself as the author...' },
    { id: 2, q: 'What genre(s) does this story fall into?', desc: 'Choose the primary and any secondary genres. This shapes tone, pacing, and reader expectations.', hint: 'Example: Literary Fiction + Thriller — a character-driven story with suspense elements.', placeholder: 'e.g. Literary Fiction, Thriller, Romance...' },
    { id: 3, q: 'What is the format and audience?', desc: 'Novel, novella, short story? Adult, YA, middle-grade?', hint: 'Example: Novel (Adult) — targeting readers who enjoy Tana French and Celeste Ng.', placeholder: 'e.g. Novel (Adult)' },
    { id: 4, q: 'What are the core themes?', desc: 'The deeper currents running beneath your story. What questions does your story ask?', hint: 'Example: Belonging vs. authenticity, institutional power vs. individual truth.', placeholder: 'Describe the themes your story explores...' },
  ],
  2: [
    { id: 1, q: 'What is the narrative perspective?', desc: 'First person, third-person limited, omniscient, second person? Whose eyes do we see through?', hint: 'Example: Third-person limited, close to Elena — we only know what she knows.', placeholder: 'Describe the point of view...' },
    { id: 2, q: 'What tense and temporal structure?', desc: 'Past tense, present tense? Linear, fragmented, frame narrative?', hint: 'Example: Present tense for immediacy; linear with brief flashbacks triggered by objects.', placeholder: 'e.g. Present tense, linear...' },
    { id: 3, q: 'What is the narrative voice and style?', desc: 'How does the prose feel? Lyrical, spare, conversational, formal?', hint: 'Example: Literary but accessible. Short punchy sentences in tense moments, longer flowing ones in reflective passages.', placeholder: 'Describe the prose style...' },
  ],
  3: [
    { id: 1, q: 'Where and when does this story take place?', desc: 'The primary setting — geography, era, and environment.', hint: 'Example: Rural Lancaster County, Pennsylvania. Present day, but a community living by 18th-century rules.', placeholder: 'Describe the setting...' },
    { id: 2, q: 'What is the time period?', desc: 'Historical, contemporary, near-future? How does time shape the story?', hint: 'Example: Contemporary, but the Amish setting creates a feeling of being outside time.', placeholder: 'e.g. Contemporary, 2024...' },
    { id: 3, q: 'What is the social structure?', desc: 'How is power organized? What are the rules — written and unwritten?', hint: 'Example: Patriarchal church leadership. Bishop holds ultimate authority. Shunning is the ultimate sanction.', placeholder: 'Describe the social structure...' },
    { id: 4, q: 'What are the hallmarks of this world?', desc: 'Objects, symbols, places, and recurring elements that make your story world recognizable.', hint: 'Example: Prayer caps, horse-drawn buggies, gas lamps, the community kitchen, the shunning chair, and the county line.', placeholder: 'Describe the hallmarks...' },
    { id: 5, q: 'What are the rules of this world?', desc: 'What can and cannot happen here? Physical rules, social rules, supernatural rules?', hint: 'Example: No electricity. No contact with the shunned. Church authority is absolute. The outside world is "English."', placeholder: 'List the world rules...' },
    { id: 6, q: 'What is the emotional geography?', desc: 'What does this world feel like? Claustrophobic, expansive, dreamlike?', hint: 'Example: Claustrophobic despite open farmland. Everyone is watching. Silence carries judgment.', placeholder: 'Describe how the world feels...' },
    { id: 7, q: 'What is the central tension of this world?', desc: 'What inherent conflict exists in the setting itself?', hint: 'Example: A community built on love and togetherness uses exclusion as its ultimate weapon.', placeholder: 'Describe the world tension...' },
    { id: 8, q: 'What is unique about your version of this world?', desc: 'What makes YOUR take on this setting different from anything else written about it?', hint: 'Example: The story is told from inside the system by someone who still loves it — not an outsider looking in.', placeholder: 'What makes your world unique...' },
  ],
  4: [
    { id: 1, q: 'Who is your protagonist?', desc: 'Name, age, role, and the essential detail that defines them.', placeholder: 'Describe your main character...' },
    { id: 2, q: 'What is their wound?', desc: 'The deep internal injury that shapes their behavior before the story begins.', placeholder: 'What happened to them before the story...' },
    { id: 3, q: 'Who is the antagonist or opposing force?', desc: 'The person, institution, or force that creates resistance.', placeholder: 'Describe the opposition...' },
    { id: 4, q: 'Who are the key supporting characters?', desc: 'List 2-5 characters who shape the protagonist\'s journey.', placeholder: 'Name and describe supporting cast...' },
  ],
  5: [
    { id: 1, q: 'What are the key relationships?', desc: 'Map the connections between characters — alliances, rivalries, dependencies, secrets.', placeholder: 'Describe the relationship web...' },
    { id: 2, q: 'What is the central relationship?', desc: 'The one relationship that, if removed, would collapse the story.', placeholder: 'Describe the core relationship...' },
  ],
  6: [
    { id: 1, q: 'What is the story\'s core premise?', desc: 'One sentence: who wants what, why can\'t they have it, and what happens if they fail?', placeholder: 'Write your logline...' },
    { id: 2, q: 'What is the narrative arc?', desc: 'Three-act structure, five-act, nonlinear? Where are the major turns?', placeholder: 'Outline the story structure...' },
    { id: 3, q: 'What is the story death?', desc: 'The specific way this story could fail to live — the pattern that would kill it.', placeholder: 'What would make this story hollow...' },
  ],
  7: [
    { id: 1, q: 'Story Structure Audit', desc: 'Review all your decisions across Author, Narrator, World, Characters, Relationships, and Story Foundation for internal consistency and completeness.', hint: 'This is where the system checks that your world rules don\'t contradict your character motivations, your narrator voice fits your genre, and your story death is properly guarded against.', placeholder: 'Notes on quality control findings...' },
    { id: 2, q: 'Story Deaths Check', desc: 'Does your story avoid each of the seven story deaths? Review each death pattern against your current structure.', hint: 'The seven deaths are specific ways a story can fail at the structural level. If your foundation triggers any of them, now is the time to fix it.', placeholder: 'Which story deaths are you at risk for...' },
    { id: 3, q: 'Consistency Review', desc: 'Are there any contradictions between your world rules, character motivations, and narrative voice?', hint: 'Example: If your world forbids electricity but your character texts someone, that\'s a contradiction to resolve.', placeholder: 'List any inconsistencies found...' },
  ],
  '⟡': [
    { id: 1, q: 'Bridge Review', desc: 'Before generating content, review all phases and confirm your story foundation is solid. This is your last chance to make structural changes before content generation.', placeholder: 'Final notes before generation...' },
  ],
  8: [
    { id: 1, q: 'Chapter outline and execution begins here.', desc: 'Generate chapter-by-chapter content based on your completed story foundation.', placeholder: 'Chapter generation notes...' },
  ],
  9: [
    { id: 1, q: 'Editor review and refinement.', desc: 'Review generated content, run quality checks, and refine.', placeholder: 'Editor notes...' },
  ],
};

// Map decomposed phases to their source files for "Edit in Editor" links
const DECOMPOSED_FILE_MAP = {
  1: 'author.md',
  2: 'narrator.md',
  3: 'world/world-building.md',
  4: null, // characters — multiple files
  5: 'relationships/questions-answered.md',
  6: 'outline.md',
  7: 'dry-run-audit.md',
};

function GuidedFlow({ phase, answers, onAnswer, onNextPhase, onPrevPhase, isDecomposed, onOpenFile }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const questions = phaseQuestions[phase] || [];
  const phaseAnswerMap = answers[phase] || {};
  const phaseName = { 1: 'Author', 2: 'Narrator', 3: 'World', 4: 'Characters', 5: 'Relationships', 6: 'Story Foundation', 7: 'Quality Control', '⟡': 'Bridge', 8: 'Chapter Execution', 9: 'Editor' }[phase] || '';
  const sendMessage = useLlmStore.getState().sendMessage;
  const activeProviders = useLlmStore(s => s.activeProviders);

  // Count how many questions are answered
  const answeredCount = Object.keys(phaseAnswerMap).filter(k => {
    const v = phaseAnswerMap[k];
    return typeof v === 'string' ? v.trim() : v != null && v !== '';
  }).length;
  const isComplete = answeredCount === questions.length && questions.length > 0;

  // Clear AI response when switching questions
  useEffect(() => { setAiResponse(''); setAiError(null); }, [currentQ, phase]);

  const handleAskAI = async () => {
    if (activeProviders.length === 0) {
      setAiError('No AI model connected. Go to Settings to add one.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiResponse('');

    const q = questions[currentQ] || questions[0];
    const existingAnswers = Object.entries(phaseAnswerMap)
      .filter(([_, v]) => typeof v === 'string' ? v.trim() : v != null)
      .map(([id, v]) => {
        const qDef = questions.find(qq => qq.id === parseInt(id));
        return qDef ? `Q: ${qDef.q}\nA: ${v}` : '';
      })
      .filter(Boolean)
      .join('\n\n');

    const result = await sendMessage({
      messages: [
        { role: 'system', content: PROMPTS.PHASE_GUIDE.build({ phaseNum: phase, phaseName, question: q.q, description: q.desc || '', hint: q.hint || '', previousAnswers: existingAnswers || null }) },
        ...(existingAnswers ? [{ role: 'user', content: `Here are the author's answers so far in this phase:\n\n${existingAnswers}` }, { role: 'assistant', content: 'Got it. I have context from your previous answers. How can I help with the current question?' }] : []),
        { role: 'user', content: `Help me answer this question: "${q.q}"\n\n${q.desc || ''}\n\n${q.hint ? `Hint: ${q.hint}` : ''}\n\nGenerate a thoughtful, detailed answer I can use as a starting point. Be specific and creative.` },
      ],
      role: 'generator',
      maxTokens: 1024,
    });

    setAiLoading(false);
    if (result.success) {
      const cleaned = removeEmdashes(result.content);
      setAiResponse(cleaned);
    } else {
      setAiError(result.error || 'Failed to get AI response.');
    }
  };

  const handleUseAiResponse = () => {
    const q = questions[currentQ] || questions[0];
    onAnswer(phase, q.id, aiResponse);
    setAiResponse('');
  };

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.3s ease', textAlign: 'center' }}>
        <Badge variant="muted" style={{ marginBottom: 12 }}>Phase {phase} — {phaseName}</Badge>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>Coming soon</h2>
        <p style={{ color: 'var(--text-secondary)' }}>This phase is being developed.</p>
      </div>
    );
  }

  const q = questions[currentQ] || questions[0];
  const currentAnswer = phaseAnswerMap[q.id] || '';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px', animation: 'fadeIn 0.3s ease' }}>
      {/* Phase header with completion indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Badge variant="muted">Phase {phase} — {phaseName} / Question {currentQ + 1} of {questions.length}</Badge>
        {isComplete && <Badge variant="accent" style={{ fontSize: '0.6rem' }}>✓ Complete</Badge>}
        {answeredCount > 0 && !isComplete && (
          <Badge style={{ background: 'rgba(240,160,80,0.1)', color: 'var(--accent)', fontSize: '0.6rem' }}>{answeredCount}/{questions.length} answered</Badge>
        )}
      </div>

      {/* Question navigation dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {questions.map((qItem, i) => {
          const isAnswered = (() => { const v = phaseAnswerMap[qItem.id]; return typeof v === 'string' ? !!v.trim() : v != null && v !== ''; })();
          const isCurrent = i === currentQ;
          return (
            <div
              key={i}
              onClick={() => setCurrentQ(i)}
              style={{
                width: isCurrent ? 24 : 8, height: 8, borderRadius: 100, cursor: 'pointer',
                background: isCurrent ? 'var(--accent)' : isAnswered ? 'var(--health-exceptional)' : 'var(--bg-tertiary)',
                transition: 'all 0.2s ease',
              }}
            />
          );
        })}
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>
        {q.q}
      </h2>
      {q.desc && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.7 }}>
          {q.desc}
        </p>
      )}
      {q.hint && (
        <div style={{
          background: 'var(--accent-subtle)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 24,
          fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic',
        }}>
          <Lightbulb size={14} color="var(--accent)" style={{ marginRight: 6 }} />
          {q.hint}
        </div>
      )}

      {/* Answer field — WYSIWYG markdown editor */}
      <MarkdownEditor
        value={currentAnswer}
        onChange={(val) => onAnswer(phase, q.id, val)}
        placeholder={q.placeholder || 'Your answer...'}
        minHeight={140}
      />
      {currentAnswer && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--health-exceptional)' }}>
            ✓ Previously answered — edit above to update
          </div>
          {isDecomposed && DECOMPOSED_FILE_MAP[phase] && onOpenFile && (
            <div
              onClick={() => onOpenFile(DECOMPOSED_FILE_MAP[phase])}
              style={{ fontSize: '0.7rem', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Open in Editor →
            </div>
          )}
        </div>
      )}

      {/* AI Response panel */}
      {aiLoading && (
        <div style={{
          marginTop: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Sparkles size={14} style={{ animation: 'spin 1.5s linear infinite' }} /> Thinking...
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {aiError && (
        <div style={{
          marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#f87171',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={14} /> {aiError}
        </div>
      )}
      {aiResponse && (
        <div style={{
          marginTop: 16, padding: 16, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Suggestion</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiResponse}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button variant="primary" onClick={handleUseAiResponse} style={{ fontSize: '0.78rem' }}>Use This Answer</Button>
            <Button variant="ghost" onClick={handleAskAI} style={{ fontSize: '0.78rem' }}>Regenerate</Button>
            <Button variant="ghost" onClick={() => setAiResponse('')} style={{ fontSize: '0.78rem' }}>Dismiss</Button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <Button variant="ghost" onClick={() => {
          if (currentQ > 0) setCurrentQ(currentQ - 1);
          else if (onPrevPhase) onPrevPhase();
        }}>← Previous</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <RollButton label={aiLoading ? 'Thinking...' : 'Ask AI'} onClick={handleAskAI} />
          <Button variant="primary" onClick={() => {
            if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
            else if (onNextPhase) onNextPhase();
          }}>
            {currentQ < questions.length - 1 ? 'Continue →' : 'Next Phase →'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Chapter Execution Mode (Phase 8) ─── */
function ChapterExecutionMode() {
  const [chapterNum, setChapterNum] = useState(1);
  const [stage, setStage] = useState('idle'); // idle | preflight | generating | postflight | complete | error
  const [preflight, setPreflight] = useState(null);
  const [postflight, setPostflight] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [emotionalBeats, setEmotionalBeats] = useState([]);
  const [progressDetail, setProgressDetail] = useState('');
  const [duration, setDuration] = useState(null);

  const files = useProjectStore(s => s.files);
  const updateFile = useProjectStore(s => s.updateFile);
  const logSession = useProjectStore(s => s.logSession);
  const sendMessage = useLlmStore.getState().sendMessage;
  const providers = useLlmStore(s => s.providers);
  const activeProviders = useLlmStore(s => s.activeProviders);
  const emotionWheelDefault = useSettingsStore(s => s.emotionWheelDefault);
  const activeProject = useProjectStore(s => s.activeProject);

  // Detect next chapter number from existing files
  useEffect(() => {
    const existingChapters = Object.keys(files || {})
      .filter(f => f.match(/^story\/chapter-\d+\.md$/))
      .map(f => parseInt(f.match(/chapter-(\d+)/)[1]))
      .sort((a, b) => a - b);
    setChapterNum(existingChapters.length > 0 ? existingChapters[existingChapters.length - 1] + 1 : 1);
  }, [files]);

  const handleGenerate = async () => {
    setStage('preflight');
    setError(null);
    setPreflight(null);
    setPostflight(null);
    setGeneratedContent('');

    try {
      const { runChapterPipeline } = await import('../services/chapterPipeline.js');
      const result = await runChapterPipeline({
        sendMessage,
        files,
        chapterNum,
        updateFile,
        logSession,
        userNotes,
        emotionalBeats,
        onProgress: ({ stage: s, detail }) => {
          setStage(s === 'complete' ? 'complete' : s === 'error' ? 'error' : s);
          setProgressDetail(detail);
        },
      });

      if (result.success) {
        setPreflight(result.preflight);
        setPostflight(result.postflight);
        setGeneratedContent(result.chapter);
        setDuration(result.duration);
        setStage('complete');
      } else {
        setError(result.error);
        setPreflight(result.preflight);
        setStage('error');
      }
    } catch (err) {
      setError(err.message);
      setStage('error');
    }
  };

  const existingChapters = Object.keys(files || {})
    .filter(f => f.match(/^story\/chapter-\d+\.md$/))
    .map(f => parseInt(f.match(/chapter-(\d+)/)[1]))
    .sort((a, b) => a - b);

  const checklistIcon = (status) => {
    if (status === 'pass') return <span style={{ color: '#4ade80' }}>&#10003;</span>;
    if (status === 'warning') return <span style={{ color: '#fbbf24' }}>&#9888;</span>;
    return <span style={{ color: '#ef4444' }}>&#10007;</span>;
  };

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Chapter Execution</h2>
        <Badge variant="accent">Phase 8</Badge>
      </div>

      {/* Existing chapters */}
      {existingChapters.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Written Chapters
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {existingChapters.map(n => (
              <Badge key={n} variant="accent" style={{ fontSize: '0.75rem' }}>Ch. {n}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Chapter selector */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Generate Chapter</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setChapterNum(Math.max(1, chapterNum - 1))} style={{
              width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>-</button>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, minWidth: 40, textAlign: 'center', color: 'var(--accent)' }}>{chapterNum}</span>
            <button onClick={() => setChapterNum(chapterNum + 1)} style={{
              width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          </div>
          {(typeof files[`story/chapter-${chapterNum}.md`] === 'string' && files[`story/chapter-${chapterNum}.md`].trim()) && (
            <Badge style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem' }}>
              Already exists (will overwrite)
            </Badge>
          )}
        </div>

        {/* Author notes */}
        <textarea
          value={userNotes}
          onChange={e => setUserNotes(e.target.value)}
          placeholder="Optional notes for this chapter (e.g., 'Focus on the confrontation scene', 'Keep it under 3000 words', 'Start with Elena at the bridge')..."
          style={{
            width: '100%', minHeight: 80, padding: 12, boxSizing: 'border-box',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem', resize: 'vertical',
          }}
        />

        {/* Scene Metadata for this chapter */}
        <div style={{ marginTop: 16 }}>
          <SceneMetadataEditor chapterNum={chapterNum} />
        </div>

        {/* Scene Dynamics Forecast */}
        <div style={{ marginTop: 16 }}>
          <SceneDynamicsForecast chapterNum={chapterNum} />
        </div>

        {/* Emotion Wheel for emotional beats */}
        <div style={{ marginTop: 16 }}>
          <EmotionWheel
            selectedEmotions={emotionalBeats}
            onSelect={setEmotionalBeats}
            defaultMode={emotionWheelDefault}
            storyContext={activeProject?.description || ''}
            chapterNotes={userNotes}
          />
        </div>
      </div>

      {/* Generate button with token estimate */}
      {stage === 'idle' && (
        <div>
          <TokenEstimate files={files} chapterNum={chapterNum} model={providers[activeProviders?.[0]]?.model || 'claude-sonnet-4-5-20250514'} showDetails={true} />
          <Button variant="primary" onClick={handleGenerate} style={{ width: '100%', padding: '12px 0', fontSize: '0.9rem' }}>
            <Sparkles size={16} style={{ marginRight: 8 }} />
            Generate Chapter {chapterNum}
          </Button>
        </div>
      )}

      {/* Progress states */}
      {(stage === 'preflight' || stage === 'generating' || stage === 'postflight') && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 24, textAlign: 'center',
        }}>
          <div style={{ animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 12 }}>
            {stage === 'preflight' && <Search size={32} style={{ color: 'var(--accent)' }} />}
            {stage === 'generating' && <Sparkles size={32} style={{ color: 'var(--accent)' }} />}
            {stage === 'postflight' && <FileText size={32} style={{ color: '#4ade80' }} />}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>
            {stage === 'preflight' && 'Running Pre-Flight Checklist...'}
            {stage === 'generating' && `Generating Chapter ${chapterNum}...`}
            {stage === 'postflight' && 'Running Post-Flight Analysis...'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{progressDetail}</div>

          {/* Stop generation button */}
          <button
            onClick={() => {
              useLlmStore.getState().stopGeneration();
              setStage('error');
              setError('Generation stopped by user.');
            }}
            style={{
              marginTop: 12, padding: '6px 16px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <X size={13} /> Stop Generation
          </button>

          {/* Pipeline steps indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
            {['Pre-flight', 'Generate', 'Post-flight'].map((step, i) => {
              const stepStages = ['preflight', 'generating', 'postflight'];
              const isActive = stepStages[i] === stage;
              const isDone = stepStages.indexOf(stage) > i;
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', fontSize: '0.6rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? '#4ade80' : isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: isDone || isActive ? '#000' : 'var(--text-muted)',
                    fontWeight: 700,
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: isActive ? 'var(--accent)' : isDone ? '#4ade80' : 'var(--text-muted)' }}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error state */}
      {stage === 'error' && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ef4444' }}>Generation Failed</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: 12 }}>{error}</div>
          <Button variant="ghost" onClick={() => { setStage('idle'); setError(null); }}>Try Again</Button>
        </div>
      )}

      {/* Pre-flight results */}
      {preflight && (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 16, marginTop: 16,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
            Pre-Flight Checklist
          </div>
          {preflight.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6, fontSize: '0.82rem' }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{checklistIcon(item.status)}</span>
              <div>
                <span style={{ fontWeight: 600, marginRight: 6 }}>{item.label}:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion state */}
      {stage === 'complete' && generatedContent && (
        <div style={{ marginTop: 16 }}>
          {/* Post-flight summary */}
          {postflight?.notes && (
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                Post-Flight Notes
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {postflight.notes.slice(0, 800)}{postflight.notes.length > 800 ? '...' : ''}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Badge style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
              {generatedContent.split(/\s+/).length} words
            </Badge>
            {duration && (
              <Badge style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                {Math.round(duration / 1000)}s
              </Badge>
            )}
            <Badge variant="accent">Chapter {chapterNum} saved</Badge>
          </div>

          {/* Preview */}
          <div style={{
            background: 'var(--editor-bg, #0d0f14)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: 20, maxHeight: 400, overflowY: 'auto',
          }}>
            <div style={{
              fontSize: '0.85rem', color: 'var(--editor-text, #c9d1d9)',
              lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)',
            }}>
              {generatedContent.slice(0, 3000)}{generatedContent.length > 3000 ? '\n\n[Preview truncated. Open in Editor to see full chapter.]' : ''}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" onClick={() => { setChapterNum(chapterNum + 1); setStage('idle'); setGeneratedContent(''); setUserNotes(''); }}>
              Next Chapter ({chapterNum + 1}) →
            </Button>
            <Button variant="ghost" onClick={() => { setStage('idle'); setGeneratedContent(''); }}>
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorMode({ file }) {
  const [editorFilter, setEditorFilter] = useState('all'); // 'all' | 'issues' | 'suggestions' | 'strengths'
  const [editorItems, setEditorItems] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState(null);
  const [passNumber, setPassNumber] = useState(1);

  const files = useProjectStore(s => s.files);
  const project = useProjectStore(s => s.activeProject);
  const updateFile = useProjectStore(s => s.updateFile);

  // Determine which chapter we're editing
  const chapterMatch = file?.match(/chapter-(\d+)\.md$/);
  const chapterNum = chapterMatch ? parseInt(chapterMatch[1]) : null;
  const fileTitle = chapterNum ? `Chapter ${chapterNum}` : (file || 'Current File');

  const runEditorReview = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const fileContent = files?.[file] || '';
      if (!fileContent.trim()) {
        setError('No content to review. Write or generate content first.');
        setIsRunning(false);
        return;
      }

      const systemPrompt = PROMPTS.EDITOR_REVIEW.build({ fileName: file });

      // Build messages with previous feedback context for multi-pass
      const userContent = `## File: ${file}\n\n${fileContent}`;
      const msgs = [
        { role: 'system', content: systemPrompt },
      ];

      // If this is a subsequent pass, include previous feedback
      if (passNumber > 1 && editorItems.length > 0) {
        const previousFeedback = editorItems.map(item =>
          `[${item.type.toUpperCase()}] ${item.text}`
        ).join('\n');
        msgs.push(
          { role: 'user', content: userContent },
          { role: 'assistant', content: `Previous review (Pass ${passNumber - 1}):\n${previousFeedback}` },
          { role: 'user', content: `This is Pass ${passNumber}. The author has reviewed your previous feedback. Please re-analyze the content, noting which previous issues have been addressed and identifying any new or remaining issues. Focus on what has changed or persisted.` }
        );
      } else {
        msgs.push({ role: 'user', content: userContent });
      }

      const result = await useLlmStore.getState().sendMessage({
        messages: msgs,
        role: 'editor',
        maxTokens: 3000,
      });

      if (!result.success) {
        setError(result.error || 'Editor review failed');
        setIsRunning(false);
        return;
      }

      const cleaned = removeEmdashes(result.content);

      // Parse JSON from response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const items = JSON.parse(jsonMatch[0]);
        const colorMap = { issue: '#f97316', suggestion: '#fbbf24', strength: '#4ade80' };
        const labelMap = { issue: 'Issue', suggestion: 'Suggestion', strength: 'Strength' };
        setEditorItems(items.map(item => ({
          type: item.type,
          color: colorMap[item.type] || '#fbbf24',
          label: labelMap[item.type] || 'Note',
          text: item.text,
        })));
        setHasRun(true);
        setPassNumber(p => p + 1);

        // Persist editor feedback file
        const feedbackContent = [
          `# Editor Review — ${fileTitle || file}`,
          `## Pass ${passNumber}`,
          `*Generated: ${new Date().toLocaleString()}*\n`,
          ...items.map(item => `### ${item.type === 'issue' ? '⚠️ Issue' : item.type === 'suggestion' ? '💡 Suggestion' : '✅ Strength'}\n${item.text}\n`),
        ].join('\n');
        const feedbackPath = `feedback/editor-v${passNumber}.md`;
        try {
          updateFile(feedbackPath, feedbackContent);
        } catch (e) {
          console.warn('Failed to save editor feedback file:', e);
        }
      } else {
        // Fallback: treat as plain text feedback
        setEditorItems([{ type: 'suggestion', color: '#fbbf24', label: 'Feedback', text: cleaned }]);
        setHasRun(true);
      }
    } catch (err) {
      setError(err.message || 'Editor review failed');
    } finally {
      setIsRunning(false);
    }
  };

  const counts = {
    issues: editorItems.filter(i => i.type === 'issue').length,
    suggestions: editorItems.filter(i => i.type === 'suggestion').length,
    strengths: editorItems.filter(i => i.type === 'strength').length,
  };

  const filtered = editorFilter === 'all' ? editorItems : editorItems.filter(i => i.type === editorFilter.replace(/s$/, ''));

  const badgeStyle = (filterKey, bg, fg) => ({
    background: editorFilter === filterKey ? fg + '33' : bg,
    color: fg,
    cursor: 'pointer',
    border: editorFilter === filterKey ? `1px solid ${fg}` : '1px solid transparent',
    transition: 'var(--transition)',
  });

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editor Review {chapterNum ? `\u2014 ${fileTitle}` : ''}</h2>
        {hasRun && <Badge variant="accent">Pass {passNumber - 1}</Badge>}
      </div>

      {/* Not yet run state */}
      {!hasRun && !isRunning && !error && (
        <div style={{
          background: '#1a1410', border: '1px solid #3d2e1a',
          borderRadius: 'var(--radius-md)', padding: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          textAlign: 'center',
        }}>
          <Edit3 size={36} style={{ color: '#f97316', opacity: 0.5 }} />
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#d4a574' }}>
            Ready to review {fileTitle}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 400 }}>
            The editor will analyze your prose for issues, offer suggestions for improvement, and highlight strengths worth preserving.
          </div>
          <Button variant="primary" onClick={runEditorReview} style={{ marginTop: 8 }}>
            <Search size={13} style={{ marginRight: 6 }} /> Run Editor Review
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isRunning && (
        <div style={{
          background: '#1a1410', border: '1px solid #3d2e1a',
          borderRadius: 'var(--radius-md)', padding: 40,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          textAlign: 'center',
        }}>
          <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
            <Edit3 size={36} style={{ color: '#f97316' }} />
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#d4a574' }}>
            Reviewing your prose...
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Analyzing dialogue, pacing, transitions, and emotional beats
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--radius-md)', padding: 20,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        }}>
          <AlertTriangle size={18} color="#ef4444" />
          <div style={{ flex: 1, fontSize: '0.85rem', color: '#ef4444' }}>{error}</div>
          <button onClick={() => setError(null)} style={{
            background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem',
          }}>Dismiss</button>
        </div>
      )}

      {/* Results */}
      {hasRun && !isRunning && (
        <>
          <div style={{
            background: '#1a1410', border: '1px solid #3d2e1a',
            borderRadius: 'var(--radius-md)', padding: 24, minHeight: 300,
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <Badge
                onClick={() => setEditorFilter(editorFilter === 'issues' ? 'all' : 'issues')}
                style={badgeStyle('issues', '#f9731622', '#f97316')}
              >{counts.issues} Issues</Badge>
              <Badge
                onClick={() => setEditorFilter(editorFilter === 'suggestions' ? 'all' : 'suggestions')}
                style={badgeStyle('suggestions', '#fbbf2422', '#fbbf24')}
              >{counts.suggestions} Suggestions</Badge>
              <Badge
                onClick={() => setEditorFilter(editorFilter === 'strengths' ? 'all' : 'strengths')}
                style={badgeStyle('strengths', '#4ade8022', '#4ade80')}
              >{counts.strengths} Strengths</Badge>
              {editorFilter !== 'all' && (
                <span onClick={() => setEditorFilter('all')} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', alignSelf: 'center', marginLeft: 4 }}>
                  Clear filter ×
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#d4a574', lineHeight: 1.8 }}>
              {filtered.map((item, i) => (
                <p key={i} style={{ marginBottom: 12 }}>
                  <strong style={{ color: item.color }}>{item.label}:</strong> {item.text}
                </p>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No items match this filter.</p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" onClick={runEditorReview}>
              Run Again (Pass {passNumber})
            </Button>
            <Button variant="ghost" onClick={() => { setEditorItems([]); setHasRun(false); }}>Clear</Button>
          </div>
          {/* Reader Experience Report integrated below editor review */}
          {file && <ReaderExperienceReport chapterPath={file} />}
        </>
      )}
    </div>
  );
}

// fileContents is imported from ../data/fileData.js

// fileContents imported from ../data/fileData.js


// Fallback content for files without specific content
const defaultFileContent = (fileName) => ({
  title: fileName.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  content: [`# ${fileName}\n\nThis file is part of the project structure. Content will be developed as the story progresses.`],
  chapter: false,
});

/**
 * Bridge: convert raw markdown from Zustand store into the { title, content, chapter }
 * format expected by ReaderMode / FileEditorMode.
 * Returns null if the store has no content for this path.
 */
function storeFileToFc(storeFiles, filePath) {
  const raw = storeFiles?.[filePath];
  if (typeof raw !== 'string' || !raw.trim()) return null;

  // Extract title from first heading or filename
  const headingMatch = raw.match(/^#+ (.+)/m);
  const fallbackTitle = filePath
    .split('/').pop()
    .replace('.md', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  const title = headingMatch ? headingMatch[1].trim() : fallbackTitle;

  // Split into paragraphs (double-newline separated)
  const paragraphs = raw.split(/\n\n+/).filter(Boolean);

  const isChapter = /^story\/chapter-\d+\.md$/.test(filePath);

  return { title, content: paragraphs, chapter: isChapter, rawText: raw };
}

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
    { regex: /!\[([^\]]*)\]\(([^)]+)\)/, render: (m, k) => <img key={k} src={m[2]} alt={m[1]} style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)', margin: '8px 0' }} /> },
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

    // Table: collect consecutive lines starting with |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      const tableLines = [line];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].trim().endsWith('|')) {
        i++;
        tableLines.push(lines[i]);
      }
      // Parse: first line = header, second line = separator (skip), rest = body rows
      const parseRow = (row) => row.split('|').slice(1, -1).map(c => c.trim());
      const headerCells = parseRow(tableLines[0]);
      // Detect alignment from separator row
      const sepRow = tableLines.length > 1 ? parseRow(tableLines[1]) : [];
      const isSeparator = sepRow.every(c => /^[-:]+$/.test(c));
      const aligns = isSeparator ? sepRow.map(c => {
        if (c.startsWith(':') && c.endsWith(':')) return 'center';
        if (c.endsWith(':')) return 'right';
        return 'left';
      }) : headerCells.map(() => 'left');
      const bodyStart = isSeparator ? 2 : 1;
      const bodyRows = tableLines.slice(bodyStart).map(parseRow);

      const cellStyle = {
        padding: '8px 12px', borderBottom: '1px solid var(--border)',
        fontSize: '0.85rem', lineHeight: 1.5,
      };
      elements.push(
        <div key={`tbl-${elements.length}`} style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                {headerCells.map((c, ci) => (
                  <th key={ci} style={{ ...cellStyle, fontWeight: 600, color: 'var(--text-primary)', textAlign: aligns[ci] || 'left' }}>
                    {renderInlineMarkdown(c, `th-${elements.length}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  {row.map((c, ci) => (
                    <td key={ci} style={{ ...cellStyle, color: 'var(--text-secondary)', textAlign: aligns[ci] || 'left' }}>
                      {renderInlineMarkdown(c, `td-${elements.length}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
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
  // Welcome screen when no file is selected
  if (!file) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', minHeight: 400, animation: 'fadeIn 0.3s ease', padding: '40px 24px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16,
          background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <BookOpen size={32} color="var(--accent)" />
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, margin: '0 0 8px' }}>
          Reader
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 320, margin: 0, lineHeight: 1.5 }}>
          Select a file from the sidebar to start reading. Chapters, notes, and world-building docs all render here.
        </p>
      </div>
    );
  }

  const tts = useTTS();
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(1.05);
  const [readerLineHeight, setReaderLineHeight] = useState(2);
  const [readerFont, setReaderFont] = useState('Georgia, serif');
  // Prefer live project data from Zustand store; fall back to static demo data
  const storeFiles = useProjectStore(s => s.files);
  const fc = storeFileToFc(storeFiles, file) || fileContents[file] || defaultFileContent(file || 'chapter-1.md');
  const isMarkdown = file && file.endsWith('.md');
  // If there's edited content, parse it into paragraphs for display
  const displayContent = editedContent !== undefined
    ? { ...fc, content: editedContent.split('\n\n').filter(Boolean), rawText: editedContent }
    : { ...fc, rawText: fc.rawText || fc.content.join('\n\n') };

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
          <button
            onClick={() => {
              if (tts.isSpeaking && !tts.isPaused) {
                tts.pause();
              } else if (tts.isPaused) {
                tts.resume();
              } else {
                const text = displayContent.rawText || displayContent.content.join('\n\n');
                tts.speak(text);
              }
            }}
            style={{
              background: tts.isSpeaking ? 'var(--accent-glow)' : 'none',
              border: tts.isSpeaking ? '1px solid var(--accent)' : 'none',
              color: tts.isSpeaking ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.7rem',
            }}
            title={tts.isSpeaking ? (tts.isPaused ? 'Resume reading' : 'Pause reading') : 'Read aloud'}
          >
            <Volume2 size={16} />
            {tts.isSpeaking && (
              <span>{tts.isPaused ? 'Paused' : 'Reading...'}</span>
            )}
          </button>
          {tts.isSpeaking && (
            <button
              onClick={() => tts.stop()}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem' }}
              title="Stop reading"
            >
              ■ Stop
            </button>
          )}
          <button
            onClick={() => setShowReaderSettings(!showReaderSettings)}
            style={{
              background: showReaderSettings ? 'var(--accent-glow)' : 'none',
              border: showReaderSettings ? '1px solid var(--accent)' : 'none',
              color: showReaderSettings ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
            }}
            title="Reader settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Reader settings popover */}
        {showReaderSettings && (
          <div style={{
            position: 'absolute',
            right: 16,
            top: 48,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: 16,
            zIndex: 20,
            minWidth: 220,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              Reader Settings
            </div>

            {/* Font family */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Font</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { label: 'Serif', value: 'Georgia, serif' },
                  { label: 'Sans', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
                  { label: 'Mono', value: '"Fira Code", "Cascadia Code", monospace' },
                ].map(f => (
                  <button
                    key={f.label}
                    onClick={() => setReaderFont(f.value)}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      fontSize: '0.7rem',
                      fontFamily: f.value,
                      background: readerFont === f.value ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                      border: readerFont === f.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                      color: readerFont === f.value ? 'var(--accent)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Size: {readerFontSize.toFixed(2)}rem
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setReaderFontSize(s => Math.max(0.75, s - 0.05))}
                  style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >−</button>
                <div style={{
                  flex: 1, height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, height: '100%',
                    width: `${((readerFontSize - 0.75) / (1.6 - 0.75)) * 100}%`,
                    background: 'var(--accent)', borderRadius: 2,
                  }} />
                </div>
                <button
                  onClick={() => setReaderFontSize(s => Math.min(1.6, s + 0.05))}
                  style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >+</button>
              </div>
            </div>

            {/* Line height */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Line Height: {readerLineHeight.toFixed(1)}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1.4, 1.6, 1.8, 2.0, 2.2].map(lh => (
                  <button
                    key={lh}
                    onClick={() => setReaderLineHeight(lh)}
                    style={{
                      flex: 1,
                      padding: '4px 2px',
                      fontSize: '0.65rem',
                      background: readerLineHeight === lh ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                      border: readerLineHeight === lh ? '1px solid var(--accent)' : '1px solid var(--border)',
                      color: readerLineHeight === lh ? 'var(--accent)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    {lh.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* TTS Settings */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                Text-to-Speech
              </div>

              {/* TTS Speed */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>Speed</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {['0.5x', '0.75x', '1x', '1.25x', '1.5x', '2x'].map(speed => (
                    <button
                      key={speed}
                      onClick={() => tts.setRate(speed)}
                      style={{
                        flex: 1,
                        padding: '4px 2px',
                        fontSize: '0.6rem',
                        background: useSettingsStore(s => s.ttsSpeed) === speed ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                        border: useSettingsStore(s => s.ttsSpeed) === speed ? '1px solid var(--accent)' : '1px solid var(--border)',
                        color: useSettingsStore(s => s.ttsSpeed) === speed ? 'var(--accent)' : 'var(--text-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* TTS Voice */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>Voice</div>
                <select
                  value={useSettingsStore(s => s.ttsVoice) || 'system'}
                  onChange={(e) => tts.setVoice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.7rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="system">System Default</option>
                  {tts.voices.map(voice => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} {voice.lang && `(${voice.lang})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* TTS Highlighting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={useSettingsStore(s => s.ttsHighlight)}
                  onChange={(e) => useSettingsStore.setState({ ttsHighlight: e.target.checked })}
                  style={{ cursor: 'pointer', width: 14, height: 14 }}
                />
                <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Highlight while reading
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prose content */}
      <div style={{
        fontFamily: readerFont,
        fontSize: `${readerFontSize}rem`,
        lineHeight: readerLineHeight,
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
  // Prefer live project data from Zustand store; fall back to static demo data
  const storeFiles = useProjectStore(s => s.files);
  const fc = storeFileToFc(storeFiles, file) || fileContents[file] || defaultFileContent(file || 'untitled.md');
  const fallbackText = fc.rawText || fc.content.join('\n\n');
  const content = editedContent !== undefined ? editedContent : fallbackText;
  const [saved, setSaved] = useState(editedContent === undefined);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showDeconstruction, setShowDeconstruction] = useState(false);

  // Undo/redo for editor content
  const undoRedo = useUndoRedo(content, { debounceMs: 500 });

  useEffect(() => {
    const handler = (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      if (e.key === 'z' && !e.shiftKey && undoRedo.canUndo) {
        e.preventDefault();
        const prev = undoRedo.undo();
        onContentChange(prev);
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        if (undoRedo.canRedo) {
          e.preventDefault();
          const next = undoRedo.redo();
          onContentChange(next);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undoRedo.canUndo, undoRedo.canRedo]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <button
            onClick={() => { const prev = undoRedo.undo(); if (prev !== undefined) onContentChange(prev); }}
            disabled={!undoRedo.canUndo}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: undoRedo.canUndo ? 'var(--text-secondary)' : 'var(--text-muted)',
              cursor: undoRedo.canUndo ? 'pointer' : 'not-allowed', fontSize: '0.75rem',
              opacity: undoRedo.canUndo ? 1 : 0.5,
            }}
            title="Undo (Ctrl+Z)"
          >
            ↩ Undo
          </button>
          <button
            onClick={() => { const next = undoRedo.redo(); if (next !== undefined) onContentChange(next); }}
            disabled={!undoRedo.canRedo}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: undoRedo.canRedo ? 'var(--text-secondary)' : 'var(--text-muted)',
              cursor: undoRedo.canRedo ? 'pointer' : 'not-allowed', fontSize: '0.75rem',
              opacity: undoRedo.canRedo ? 1 : 0.5,
            }}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo ↪
          </button>
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
          <button onClick={() => setShowDeconstruction(!showDeconstruction)} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: showDeconstruction ? 'rgba(139,92,246,0.2)' : 'var(--bg-card)',
            color: showDeconstruction ? '#8b5cf6' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.72rem',
            transition: 'var(--transition)',
          }}>
            <Sparkles size={11} /> Deconstruct
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

      {/* Deconstruction overlay */}
      {showDeconstruction && (
        <div style={{ padding: '0 12px', paddingTop: 12, background: 'var(--bg-secondary)', overflow: 'auto', borderBottom: '1px solid var(--border)' }}>
          <DeconstructionOverlay content={content} onClose={() => setShowDeconstruction(false)} />
        </div>
      )}

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
function FullCastMode({ onCharacterClick, onBack, onAddCharacter }) {
  const fcFiles = useProjectStore(s => s.files);
  const fcProject = useProjectStore(s => s.activeProject);
  const characterProfiles = buildCharacterProfiles(fcFiles);
  const allChars = Object.entries(characterProfiles);
  const mainChars = allChars.filter(([, c]) => c.tier === 'main');
  const minorChars = allChars.filter(([, c]) => c.tier === 'minor');
  const societalChars = allChars.filter(([, c]) => c.tier === 'societal');
  const collectiveChars = allChars.filter(([, c]) => c.tier === 'collective');

  // Tier change handler — updates the character's markdown file
  const updateCharacterTier = async (charSlug, newTier) => {
    const filePath = `characters/${charSlug}.md`;
    const content = fcFiles[filePath];
    if (!content) return;

    // Map tier to display label
    const tierLabels = { main: 'protagonist', minor: 'minor', societal: 'societal', collective: 'collective' };
    const newTierLabel = tierLabels[newTier] || newTier;

    // Update the Tier field in the markdown content
    let updated = content;
    // Try replacing existing Tier field
    if (updated.match(/\*\*Tier\*\*\s*:/i)) {
      updated = updated.replace(/(\*\*Tier\*\*\s*:\s*).+/i, `$1${newTierLabel}`);
    } else {
      // If no Tier field, add one after the first heading
      const firstHeadingEnd = updated.indexOf('\n');
      if (firstHeadingEnd > -1) {
        updated = updated.slice(0, firstHeadingEnd + 1) + `- **Tier**: ${newTierLabel}\n` + updated.slice(firstHeadingEnd + 1);
      }
    }

    // Also update any parenthetical tier in the heading (e.g. "## Dorothy (protagonist)")
    updated = updated.replace(
      /^(#{1,3}\s+.+?)\s*\((protagonist|deuteragonist|antagonist|supporting|minor|catalyst|collective|societal|extra|mentioned)\)/im,
      `$1 (${newTierLabel})`
    );

    try {
      const { updateFile, loadProjectFiles } = useProjectStore.getState();
      const projectId = useProjectStore.getState().activeProjectId;
      await updateFile(projectId, filePath, updated);
      await loadProjectFiles(projectId);
    } catch (err) {
      console.error('Failed to update character tier:', err);
    }
  };

  const TIER_OPTIONS = [
    { value: 'main', label: 'Main', color: 'var(--accent)' },
    { value: 'minor', label: 'Minor', color: 'var(--text-muted)' },
    { value: 'societal', label: 'Society', color: '#f97316' },
    { value: 'collective', label: 'Collective', color: '#60a5fa' },
  ];

  const CharCard = ({ name, char }) => {
    const isMinor = char.tier === 'minor';
    const [showTierMenu, setShowTierMenu] = useState(false);
    const charSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMinor ? '0.9rem' : '1rem', fontWeight: 700 }}>{char.name}</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
              <Badge variant="accent" style={{ fontSize: '0.65rem' }}>{char.role}</Badge>
              {char.type && <Badge variant="muted" style={{ fontSize: '0.65rem' }}>{char.type}</Badge>}
            </div>
          </div>
          {/* Tier recategorization button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowTierMenu(!showTierMenu); }}
              title="Change character tier"
              style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '3px 8px', cursor: 'pointer',
                fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.03em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {char.tier === 'societal' ? 'Society' : char.tier === 'collective' ? 'Collective' : char.tier === 'main' ? 'Main' : 'Minor'}
              <ChevronDown size={10} />
            </button>
            {showTierMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', overflow: 'hidden', minWidth: 120,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {TIER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (opt.value !== char.tier) updateCharacterTier(charSlug, opt.value);
                      setShowTierMenu(false);
                    }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
                      background: opt.value === char.tier ? 'var(--accent-glow)' : 'transparent',
                      border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                      color: opt.value === char.tier ? opt.color : 'var(--text-secondary)',
                      fontWeight: opt.value === char.tier ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Full Cast/Characters{fcProject?.title ? ` — ${fcProject.title}` : ''}</h2>
        <Badge variant="muted">{allChars.length} characters</Badge>
        <button
          onClick={() => onAddCharacter?.()}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'var(--accent)', border: 'none',
            borderRadius: 'var(--radius-sm)', color: '#000',
            cursor: 'pointer', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600,
            marginLeft: 'auto',
          }}
        >
          <Plus size={14} /> Add Character
        </button>
      </div>

      {/* Societal Characters */}
      {societalChars.length > 0 && (<>
        <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f97316', marginBottom: 12 }}>
          Society / Structural Characters ({societalChars.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 28 }}>
          {societalChars.map(([name, char]) => <CharCard key={name} name={name} char={char} />)}
        </div>
      </>)}

      {/* Main Characters */}
      <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Main Characters ({mainChars.length})
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 28 }}>
        {mainChars.map(([name, char]) => <CharCard key={name} name={name} char={char} />)}
      </div>

      {/* Collective Characters */}
      {collectiveChars.length > 0 && (<>
        <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60a5fa', marginBottom: 12 }}>
          Collective Characters ({collectiveChars.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
          {collectiveChars.map(([name, char]) => <CharCard key={name} name={name} char={char} />)}
        </div>
      </>)}

      {/* Minor Characters */}
      <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Minor Characters ({minorChars.length})
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {minorChars.map(([name, char]) => <CharCard key={name} name={name} char={char} />)}
      </div>
    </div>
  );
}

function ChatMode({ phasePcts = {} }) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [persona, setPersona] = useState('assistant'); // 'assistant' | 'editor' | 'character'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const pillsRef = useRef(null);

  const files = useProjectStore(s => s.files);
  const project = useProjectStore(s => s.activeProject);

  const gatedUnlocked = allPrereqsComplete(phasePcts);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persona labels and colors
  const personaConfig = {
    assistant: { label: 'Story Assistant', icon: Sparkles, color: 'var(--accent)' },
    editor: { label: 'Editor', icon: Edit3, color: '#f97316' },
    character: { label: selectedCharacter ? `Talk to ${selectedCharacter}` : 'Talk to Character', icon: Users, color: '#a78bfa' },
  };

  // Get character names from project files for Talk to Character
  const characterNames = Object.keys(files || {})
    .filter(p => p.startsWith('characters/') && p.endsWith('.md') && p !== 'characters/questions-answered.md')
    .map(p => p.replace('characters/', '').replace('.md', ''));

  // ── LLM-powered context-aware suggestions ──
  const [dynamicSuggestions, setDynamicSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fallbackSuggestions = [
    'Brainstorm plot ideas', 'Fix a plot hole', 'Develop a backstory',
    'Explore a what-if', 'Strengthen a scene', 'Work on dialogue',
    'Review pacing', 'Deepen a relationship', 'Build tension',
  ];

  // Derive current phase from phasePcts (first incomplete phase)
  const derivedPhase = currentActivePhase(phasePcts);

  // Fetch context-aware suggestions when chat opens or persona changes
  useEffect(() => {
    let cancelled = false;
    const fetchSuggestions = async () => {
      const send = useLlmStore.getState().sendMessage;
      if (!send) return;
      setLoadingSuggestions(true);
      try {
        const currentPhaseObj = phases.find(p => p.num === derivedPhase);
        const fileKeys = Object.keys(files || {}).filter(f => f.endsWith('.md')).slice(0, 10).join(', ');
        const prompt = PROMPTS.CHAT_SUGGESTIONS.build({
          persona: persona,
          phaseName: currentPhaseObj?.name || 'Unknown',
          projectTitle: project?.title || 'Untitled',
          filesSummary: fileKeys,
        });
        const resp = await send([
          { role: 'system', content: prompt },
          { role: 'user', content: 'Generate contextual conversation starters. Respond with JSON array only.' },
        ], 'chat');
        if (cancelled) return;
        const respStr = typeof resp === 'string' ? resp : (resp?.content || resp?.text || JSON.stringify(resp || ''));
        const match = respStr.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDynamicSuggestions(parsed);
          }
        }
      } catch (err) {
        // Silently fall back to defaults
        console.warn('Chat suggestions fetch failed:', err);
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
    return () => { cancelled = true; };
  }, [persona, derivedPhase]); // Re-fetch when persona or phase changes

  const suggestions = [
    ...(characterNames.length > 0 ? ['Talk to a character'] : []),
    ...(gatedUnlocked ? ['Talk to the editor'] : []),
    ...(dynamicSuggestions || fallbackSuggestions),
  ];

  const scrollPills = (dir) => {
    const el = pillsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -180 : 180, behavior: 'smooth' });
  };

  const handleSuggestionClick = (s) => {
    if (s === 'Talk to a character') {
      setShowPersonaMenu(true);
      return;
    }
    if (s === 'Talk to the editor') {
      setPersona('editor');
      setMessages([]);
      return;
    }
    setChatInput(s);
  };

  const switchPersona = (newPersona, charName = null) => {
    setPersona(newPersona);
    setSelectedCharacter(charName);
    setMessages([]);
    setError(null);
    setShowPersonaMenu(false);
  };

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { buildChatContext } = await import('../services/contextBuilder.js');

      // Build chat history in the format the context builder expects
      const chatHistory = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const ctx = buildChatContext(files || {}, chatHistory, {
        persona,
        characterName: selectedCharacter,
        scope: 'full-project',
      });

      // Check if characterGuideMode is enabled and a character is selected
      const characterGuideModeEnabled = useSettingsStore.getState().characterGuideMode;
      if (characterGuideModeEnabled && selectedCharacter) {
        // Find the selected character's file content
        const charSlug = selectedCharacter.toLowerCase().replace(/\s+/g, '-');
        const characterPath = `characters/${charSlug}.md`;
        let characterContent = files[characterPath];

        // Try alternate path if first doesn't exist
        if (!characterContent) {
          const altPath = Object.keys(files || {}).find(
            p => p.startsWith('characters/') && p.endsWith('.md') &&
            p.replace('characters/', '').replace('.md', '').toLowerCase() === charSlug.toLowerCase()
          );
          if (altPath) characterContent = files[altPath];
        }

        if (characterContent) {
          // Inject character instruction into the system message
          const charInstruction = `You are ${selectedCharacter}, a character in a story. Respond in character, using their voice and perspective. Here is your character sheet:\n\n${characterContent}\n\nProvide guidance and responses as this character would, drawing from their personality, motivations, and knowledge. Keep responses focused and in-character.`;

          // Insert character instruction as first system message if not already present
          if (ctx.messages[0]?.role !== 'system' || !ctx.messages[0]?.content?.includes(selectedCharacter)) {
            ctx.messages.unshift({ role: 'system', content: charInstruction });
          }
        }
      }

      // Add empty assistant message for streaming
      const assistantMsgId = Math.random();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: assistantMsgId, isStreaming: true }]);

      let accumulatedContent = '';

      try {
        // Use streaming if available
        const generator = useLlmStore.getState().sendMessageStreaming({
          messages: ctx.messages,
          role: persona === 'editor' ? 'editor' : (persona === 'character' ? 'creative' : 'assistant'),
          maxTokens: 2048,
        });

        for await (const chunk of generator) {
          accumulatedContent += chunk;
          // Update the streaming message with accumulated content
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: accumulatedContent }
                : m
            )
          );
        }

        // Finalize the message (remove streaming indicator, clean content)
        const cleaned = removeEmdashes(accumulatedContent);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, content: cleaned, isStreaming: false }
              : m
          )
        );
      } catch (streamErr) {
        // Fallback to non-streaming if streaming fails
        if (streamErr.name === 'AbortError') {
          setError('Response cancelled');
          setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
        } else {
          // Fall back to regular sendMessage
          const result = await useLlmStore.getState().sendMessage({
            messages: ctx.messages,
            role: persona === 'editor' ? 'editor' : (persona === 'character' ? 'creative' : 'assistant'),
            maxTokens: 2048,
          });

          if (result.success) {
            const cleaned = removeEmdashes(result.content);
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: cleaned, isStreaming: false }
                  : m
              )
            );
          } else {
            setError(result.error || 'Failed to get response');
            setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ActiveIcon = personaConfig[persona].icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, animation: 'fadeIn 0.3s ease' }}>
      {/* Title bar with persona switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <ActiveIcon size={20} style={{ color: personaConfig[persona].color }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          {personaConfig[persona].label}
        </h1>

        {/* Persona pills */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {['assistant', 'editor'].map(p => (
            <button
              key={p}
              onClick={() => switchPersona(p)}
              style={{
                padding: '4px 12px', fontSize: '0.72rem', borderRadius: 100,
                border: `1px solid ${persona === p ? personaConfig[p].color : 'var(--border)'}`,
                background: persona === p ? `${personaConfig[p].color}18` : 'transparent',
                color: persona === p ? personaConfig[p].color : 'var(--text-muted)',
                cursor: 'pointer', transition: 'var(--transition)',
              }}
            >
              {p === 'assistant' ? 'Assistant' : 'Editor'}
            </button>
          ))}

          {/* Character dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              style={{
                padding: '4px 12px', fontSize: '0.72rem', borderRadius: 100,
                border: `1px solid ${selectedCharacter ? personaConfig.character.color : 'var(--border)'}`,
                background: selectedCharacter ? `${personaConfig.character.color}18` : 'transparent',
                color: selectedCharacter ? personaConfig.character.color : 'var(--text-muted)',
                cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {selectedCharacter || 'Character'} <ChevronDown size={10} />
            </button>

            {showPersonaMenu && characterNames.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: 4, zIndex: 100,
                minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                {characterNames.map(name => (
                  <button
                    key={name}
                    onClick={() => {
                      if (persona === 'character') {
                        switchPersona('character', name);
                      } else {
                        // In assistant mode, just set the character
                        setSelectedCharacter(name);
                        setShowPersonaMenu(false);
                      }
                    }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', fontSize: '0.8rem', border: 'none',
                      background: selectedCharacter === name ? 'var(--accent-glow)' : 'transparent',
                      color: selectedCharacter === name ? 'var(--accent)' : 'var(--text-secondary)',
                      cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedCharacter === name ? 'var(--accent-glow)' : 'transparent'; }}
                  >
                    {name}
                  </button>
                ))}
                {characterNames.length === 0 && (
                  <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No characters yet
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {messages.length === 0 && !isLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flex: 1, gap: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 40,
          }}>
            <ActiveIcon size={40} style={{ opacity: 0.3, color: personaConfig[persona].color }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              {persona === 'assistant' && 'Ask me anything about your story'}
              {persona === 'editor' && 'I\'ll review your prose with a critical but supportive eye'}
              {persona === 'character' && selectedCharacter && `You\'re now talking to ${selectedCharacter}. Ask them anything.`}
              {persona === 'character' && !selectedCharacter && 'Select a character to talk to'}
            </div>
            <div style={{ fontSize: '0.78rem', maxWidth: 400 }}>
              {persona === 'assistant' && 'Brainstorm ideas, explore what-ifs, fix plot holes, or develop backstories. I have full context of your project.'}
              {persona === 'editor' && 'Paste a chapter or scene and I\'ll give you constructive feedback on prose quality, pacing, and structure.'}
              {persona === 'character' && 'Characters respond in their voice and know only what they would know. They can reflect on their role in the story.'}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '75%',
            background: msg.role === 'user' ? 'var(--accent-glow)' : 'var(--bg-card)',
            border: `1px solid ${msg.role === 'user' ? 'var(--accent)' + '30' : 'var(--border)'}`,
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            padding: '10px 16px', fontSize: '0.85rem',
            color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
            lineHeight: 1.6, whiteSpace: 'pre-wrap',
          }}>
            {msg.content}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start', maxWidth: '75%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px 16px 16px 4px', padding: '10px 16px',
            fontSize: '0.85rem', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>Thinking</span>
            <span style={{ display: 'inline-flex', gap: 3 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: personaConfig[persona].color, animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '0s' }} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: personaConfig[persona].color, animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '0.2s' }} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: personaConfig[persona].color, animation: 'pulse 1.2s ease-in-out infinite', animationDelay: '0.4s' }} />
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            alignSelf: 'center', padding: '8px 16px', fontSize: '0.8rem',
            color: '#ef4444', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertTriangle size={14} /> {error}
            <button onClick={() => setError(null)} style={{
              background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem',
            }}>Dismiss</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion pills — horizontally scrollable with arrow buttons */}
      {messages.length === 0 && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <button onClick={() => scrollPills('left')} style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            zIndex: 2, width: 28, height: 28, borderRadius: '50%',
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
          }}>‹</button>

          <div
            ref={pillsRef}
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

          <button onClick={() => scrollPills('right')} style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            zIndex: 2, width: 28, height: 28, borderRadius: '50%',
            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
          }}>›</button>
        </div>
      )}

      {/* Chat input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            persona === 'assistant' ? 'Ask about your story, brainstorm ideas, or request changes...' :
            persona === 'editor' ? 'Paste a scene or ask for feedback on your prose...' :
            selectedCharacter ? `Say something to ${selectedCharacter}...` : 'Select a character first...'
          }
          disabled={persona === 'character' && !selectedCharacter}
          style={{
            flex: 1, padding: '10px 16px',
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)', fontSize: '0.85rem',
            opacity: (persona === 'character' && !selectedCharacter) ? 0.5 : 1,
          }}
        />
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={isLoading || !chatInput.trim() || (persona === 'character' && !selectedCharacter)}
          style={{ opacity: (isLoading || !chatInput.trim()) ? 0.5 : 1 }}
        >
          {isLoading ? '...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Timeline Data Builder ─── */
// Derives character arcs, plot spine, and act structure from actual project data.
// Falls back to placeholder values when chapters haven't been written yet.

const characterColors = ['#2dd4bf', '#818cf8', '#a78bfa', '#f472b6', '#6ee7b7', '#f9a8d4', '#94a3b8', '#fbbf24', '#fb7185', '#e879f9'];
const characterGradients = [
  'linear-gradient(135deg, #2dd4bf, #f472b6)', 'linear-gradient(135deg, #818cf8, #f97316)',
  'linear-gradient(135deg, #fbbf24, #a78bfa)', 'linear-gradient(135deg, #6ee7b7, #60a5fa)',
  'linear-gradient(135deg, #f9a8d4, #818cf8)', 'linear-gradient(135deg, #94a3b8, #475569)',
];

// Simple deterministic hash function for stable pseudo-random values
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Generate stable value between 0 and 1 based on seed and index
const stableVariance = (seed, index, range = 1) => {
  const h = hashCode(`${seed}-${index}`);
  return ((h % 100) / 100) * range;
};

function buildTimelineData(files = {}, phaseAnswers = {}) {
  // 1. Extract characters from character files
  const charFiles = Object.entries(files).filter(([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions'));
  const characters = charFiles.map(([path, content], idx) => {
    const name = path.replace('characters/', '').replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const isMain = (content || '').toLowerCase().includes('protagonist') || (content || '').toLowerCase().includes('main character') || idx < 3;

    // Count mentions per chapter to build an arc
    const chapterFiles = Object.entries(files)
      .filter(([p]) => p.match(/^story\/chapter-\d+\.md$/))
      .sort(([a], [b]) => {
        const na = parseInt(a.match(/\d+/)?.[0] || 0);
        const nb = parseInt(b.match(/\d+/)?.[0] || 0);
        return na - nb;
      });

    const arc = chapterFiles.map(([, chContent], chIdx) => {
      const mentions = ((chContent || '').match(new RegExp(name.split(' ')[0], 'gi')) || []).length;
      // Use deterministic hash-based value when mentions are 0, instead of Math.random()
      return Math.min(Math.round(mentions * 1.5), 10) || Math.round(stableVariance(name, chIdx, 3) + 1);
    });

    // If no chapters, use empty arc (no fake data)
    const finalArc = arc.length > 0 ? arc : [];

    return {
      name,
      color: characterColors[idx % characterColors.length],
      gradient: characterGradients[idx % characterGradients.length],
      tier: isMain ? 'main' : 'minor',
      arc: finalArc,
      // Generate stable realityArc by adding deterministic variance to arc values
      realityArc: finalArc.length > 0 ? finalArc.map((v, i) => {
        const variance = stableVariance(`${name}-reality`, i, 2) - 1;
        return Math.max(0, Math.min(10, v + Math.round(variance)));
      }) : [],
      beats: finalArc.map((_, i) => `Chapter ${i + 1}`),
      interactions: {},
    };
  });

  // Build interaction matrices
  characters.forEach((c, ci) => {
    characters.forEach((other, oi) => {
      if (ci !== oi) {
        c.interactions[other.name] = c.arc.map((v, i) => (v > 3 && other.arc[i] > 3 ? 1 : 0));
      }
    });
  });

  // 2. Build plot spine from chapter content lengths / intensity
  const chapterFiles = Object.entries(files)
    .filter(([p]) => p.match(/^story\/chapter-\d+\.md$/))
    .sort(([a], [b]) => parseInt(a.match(/\d+/)?.[0] || 0) - parseInt(b.match(/\d+/)?.[0] || 0));

  const numPoints = Math.max(chapterFiles.length, characters[0]?.arc.length || 0);
  const plotSpine = chapterFiles.length > 0
    ? chapterFiles.map(([, content]) => {
        const len = (content || '').length;
        // Normalize to 1-10 scale based on content density
        return Math.min(Math.round((len / 500) + 2), 10);
      })
    : []; // No fake placeholder data — empty until chapters are written

  // 3. Build act structure
  const totalChapters = numPoints;
  const act1End = Math.round(totalChapters * 0.25);
  const act2End = Math.round(totalChapters * 0.75);
  const acts = [
    { label: 'Act 1 — Setup', start: 0, end: act1End, color: 'rgba(96, 165, 250, 0.05)', borderColor: 'rgba(96, 165, 250, 0.15)', labelColor: '#60a5fa' },
    { label: 'Act 2 — Confrontation', start: act1End, end: act2End, color: 'rgba(249, 115, 22, 0.05)', borderColor: 'rgba(249, 115, 22, 0.12)', labelColor: '#f97316' },
    { label: 'Act 3 — Resolution', start: act2End, end: totalChapters, color: 'rgba(74, 222, 128, 0.05)', borderColor: 'rgba(74, 222, 128, 0.15)', labelColor: '#4ade80' },
  ];

  return { characters, plotSpine, acts };
}

// SVG helper: build a smooth curve path through points
function buildPath(points, width, height, maxVal = 10, smooth = true) {
  if (!points || points.length < 2) return '';
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
function ThreadsOverview({ onSelectChar, journeyMode, visibleChars, dataView, acts = [], plotSpine = [] }) {
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
function CharacterArcDetail({ charName, onBack, onSelectChar, journeyMode, dataView, timelineCharacters = [] }) {
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

  const timelineFiles = useProjectStore(s => s.files);
  const { characters: timelineCharacters, plotSpine, acts } = buildTimelineData(timelineFiles);

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
        <ThreadsOverview onSelectChar={handleSelectChar} journeyMode={journeyMode} visibleChars={visibleChars} dataView={dataView} acts={acts} plotSpine={plotSpine} />
      )}
      {view === 'character' && selectedChar && (
        <CharacterArcDetail
          charName={selectedChar}
          onBack={() => setView('overview')}
          onSelectChar={handleSelectChar}
          journeyMode={journeyMode}
          dataView={dataView}
          timelineCharacters={timelineCharacters}
        />
      )}

      {/* Narrative Threads / Subproblem Tracker */}
      <div style={{ marginTop: 24 }}>
        <SubproblemTracker />
      </div>

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

function DrawingBoard({ onOpenFile, boardItems, setBoardItems }) {
  const [viewMode, setViewMode] = useState('list'); // board | list | gallery | unlinked
  const [expandedItem, setExpandedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('note');
  const [addTitle, setAddTitle] = useState('');
  const [addContent, setAddContent] = useState('');
  const [addGroup, setAddGroup] = useState('');
  const [addImages, setAddImages] = useState([]); // data URLs for image uploads
  const [addDocs, setAddDocs] = useState([]); // { name, size, content (text if readable), type }
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => setAddImages(prev => [...prev, { name: file.name, dataUrl: ev.target.result }]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const isTextReadable = ['txt', 'md', 'markdown', 'csv', 'json', 'html'].includes(ext);
      if (isTextReadable) {
        const reader = new FileReader();
        reader.onload = (ev) => setAddDocs(prev => [...prev, { name: file.name, size: file.size, content: ev.target.result, ext }]);
        reader.readAsText(file);
      } else {
        // For binary files (docx, pdf) — store name/size, read as dataURL for potential future use
        const reader = new FileReader();
        reader.onload = (ev) => setAddDocs(prev => [...prev, { name: file.name, size: file.size, content: null, dataUrl: ev.target.result, ext }]);
        reader.readAsDataURL(file);
      }
    });
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const removeUploadedImage = (idx) => setAddImages(prev => prev.filter((_, i) => i !== idx));
  const removeUploadedDoc = (idx) => setAddDocs(prev => prev.filter((_, i) => i !== idx));

  const formatFileSize = (bytes) => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';

  const addItem = () => {
    if (!addTitle.trim() && !addContent.trim() && addImages.length === 0 && addDocs.length === 0) return;
    // For doc type, auto-populate fullText from uploaded text files if content field is empty
    let finalContent = addContent.trim();
    if (addType === 'doc' && !finalContent && addDocs.length > 0) {
      const textDocs = addDocs.filter(d => d.content);
      if (textDocs.length > 0) finalContent = textDocs.map(d => `--- ${d.name} ---\n${d.content}`).join('\n\n');
    }
    const newItem = {
      id: Date.now(),
      type: addType,
      ...(addType === 'image' ? { label: addTitle.trim() || 'Untitled image' } : { text: addTitle.trim() || (addType === 'doc' && addDocs.length > 0 ? addDocs[0].name : 'Untitled') }),
      fullText: finalContent || addTitle.trim() || '',
      used: false,
      group: addGroup.trim() || 'Unsorted',
      ...(addType === 'image' && addImages.length > 0 ? { images: addImages.map(i => i.dataUrl) } : {}),
      ...(addType === 'doc' && addDocs.length > 0 ? { docs: addDocs.map(d => ({ name: d.name, size: d.size, ext: d.ext, hasContent: !!d.content })) } : {}),
    };
    setBoardItems(prev => [...prev, newItem]);
    setAddTitle(''); setAddContent(''); setAddGroup(''); setAddType('note'); setAddImages([]); setAddDocs([]);
    setShowAddModal(false);
  };

  const deleteItem = (id) => {
    setBoardItems(prev => prev.filter(item => item.id !== id));
    if (expandedItem?.id === id) setExpandedItem(null);
  };

  /* ─── Image Slider Component ─── */
  const ImageSlider = ({ images, height = 140 }) => {
    const [idx, setIdx] = useState(0);
    if (!images || images.length === 0) {
      return (
        <div style={{ height, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          No photos uploaded
        </div>
      );
    }
    const multi = images.length > 1;
    return (
      <div style={{ position: 'relative', height, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-tertiary)' }}>
        <img src={images[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        {multi && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
              style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
              <ChevronRight size={14} />
            </button>
            <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
              {images.map((_, i) => (
                <span key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'background 0.2s' }} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleUsedInClick = (usedPath) => {
    if (!usedPath || !onOpenFile) return;
    // Parse the used path into fileName and parentFolder for openFile
    const lastSlash = usedPath.lastIndexOf('/');
    if (lastSlash >= 0) {
      const parent = usedPath.substring(0, lastSlash + 1);
      const file = usedPath.substring(lastSlash + 1);
      // If it doesn't end in .md, it's a folder reference; still navigate
      onOpenFile(file.endsWith('.md') ? file : usedPath, file.endsWith('.md') ? parent : null);
    } else {
      onOpenFile(usedPath, null);
    }
  };

  const typeIcon = (type) => type === 'note' ? '📝 Note' : type === 'image' ? '🖼 Image' : type === 'doc' ? '📎 Document' : '📄 Draft';
  const typeColor = (type) => type === 'note' ? 'var(--text-muted)' : type === 'image' ? '#60a5fa' : type === 'doc' ? '#a78bfa' : '#fbbf24';

  const filteredItems = viewMode === 'unlinked' ? boardItems.filter(i => !i.used) : boardItems;

  const renderUsedIn = (item) => (
    <div style={{ fontSize: '0.7rem' }}>
      {item.used ? (
        <span
          onClick={(e) => { e.stopPropagation(); handleUsedInClick(item.used); }}
          style={{ color: 'var(--health-exceptional)', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px dotted var(--health-exceptional)' }}
          onMouseEnter={(e) => e.target.style.opacity = 0.8}
          onMouseLeave={(e) => e.target.style.opacity = 1}
        >
          Used in: → {item.used}
        </span>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>Not yet used</span>
      )}
    </div>
  );

  const renderDeleteBtn = (item) => (
    <button
      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
      style={{
        position: 'absolute', top: 8, right: 8, background: 'none', border: 'none',
        color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px 5px',
        borderRadius: 'var(--radius-sm)', opacity: 0.5, transition: 'var(--transition)',
      }}
      onMouseEnter={(e) => { e.target.style.opacity = 1; e.target.style.color = '#ef4444'; }}
      onMouseLeave={(e) => { e.target.style.opacity = 0.5; e.target.style.color = 'var(--text-muted)'; }}
      title="Delete item"
    >✕</button>
  );

  /* ─── Board View (grid cards) ─── */
  const renderBoardView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {filteredItems.map((item) => (
        <Card key={item.id} style={{ padding: 14, cursor: 'pointer', position: 'relative', transition: 'var(--transition)' }}
          onClick={() => setExpandedItem(item)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {renderDeleteBtn(item)}
          <div style={{ fontSize: '0.7rem', color: typeColor(item.type), marginBottom: 6 }}>{typeIcon(item.type)}</div>
          <div style={{ fontSize: '0.8rem', marginBottom: 8, lineHeight: 1.5 }}>{item.text || item.label}</div>
          {item.type === 'image' && (
            <div style={{ marginBottom: 8 }}>
              <ImageSlider images={item.images} height={60} />
            </div>
          )}
          {renderUsedIn(item)}
        </Card>
      ))}
    </div>
  );

  /* ─── List View (compact rows) ─── */
  const renderListView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 160px 100px 30px', gap: 12, padding: '8px 12px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border)' }}>
        <span>Type</span><span>Content</span><span>Linked to</span><span>Group</span><span></span>
      </div>
      {filteredItems.map((item) => (
        <div key={item.id}
          onClick={() => setExpandedItem(item)}
          style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 160px 100px 30px', gap: 12, padding: '10px 12px',
            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            alignItems: 'center', border: '1px solid transparent', transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-border)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <span style={{ fontSize: '0.7rem', color: typeColor(item.type) }}>{typeIcon(item.type)}</span>
          <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text || item.label}</span>
          <span style={{ fontSize: '0.7rem' }}>
            {item.used ? (
              <span onClick={(e) => { e.stopPropagation(); handleUsedInClick(item.used); }} style={{ color: 'var(--health-exceptional)', cursor: 'pointer', borderBottom: '1px dotted var(--health-exceptional)' }}>→ {item.used}</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>unlinked</span>
            )}
          </span>
          <Badge variant="muted" style={{ fontSize: '0.65rem' }}>{item.group || 'Unsorted'}</Badge>
          <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.5 }} onMouseEnter={(e) => { e.target.style.opacity = 1; e.target.style.color = '#ef4444'; }} onMouseLeave={(e) => { e.target.style.opacity = 0.5; e.target.style.color = 'var(--text-muted)'; }}>✕</button>
        </div>
      ))}
    </div>
  );

  /* ─── Gallery View (large image cards, notes compact) ─── */
  const renderGalleryView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {filteredItems.map((item) => (
        <Card key={item.id} style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'var(--transition)' }}
          onClick={() => setExpandedItem(item)}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          {renderDeleteBtn(item)}
          {item.type === 'image' ? (
            <ImageSlider images={item.images} height={140} />
          ) : (
            <div style={{
              height: 140, padding: 16, background: item.type === 'draft' ? 'rgba(251,191,36,0.04)' : 'var(--bg-primary)',
              overflow: 'hidden', fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-secondary)',
            }}>
              {(item.fullText || item.text || '').substring(0, 300)}{(item.fullText || '').length > 300 ? '...' : ''}
            </div>
          )}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: typeColor(item.type), marginBottom: 4 }}>{typeIcon(item.type)}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: 4 }}>{item.text || item.label}</div>
            {renderUsedIn(item)}
          </div>
        </Card>
      ))}
    </div>
  );

  /* ─── Expanded Item Modal ─── */
  const renderExpandedModal = () => {
    if (!expandedItem) return null;
    return (
      <div onClick={() => setExpandedItem(null)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.15s ease',
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          padding: 0, width: '90%', maxWidth: 640, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}>
          {/* Modal header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.75rem', color: typeColor(expandedItem.type) }}>{typeIcon(expandedItem.type)}</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{expandedItem.text || expandedItem.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {expandedItem.group && <Badge variant="muted" style={{ fontSize: '0.65rem' }}>{expandedItem.group}</Badge>}
              <button onClick={() => { deleteItem(expandedItem.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }} onMouseEnter={(e) => e.target.style.color = '#ef4444'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'} title="Delete">🗑</button>
              <button onClick={() => setExpandedItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px' }}>✕</button>
            </div>
          </div>
          {/* Modal body - scrollable */}
          <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
            {expandedItem.type === 'image' && (
              <div style={{ marginBottom: 16 }}>
                <ImageSlider images={expandedItem.images} height={280} />
              </div>
            )}
            {expandedItem.type === 'doc' && expandedItem.docs && (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {expandedItem.docs.map((doc, i) => {
                  const extColors = { txt: '#9aa0b0', md: '#9aa0b0', pdf: '#ef4444', doc: '#3b82f6', docx: '#3b82f6', csv: '#22c55e', json: '#f0a050', html: '#f472b6' };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-tertiary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: extColors[doc.ext] || 'var(--text-muted)', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 4 }}>{doc.ext}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1 }}>{doc.name}</span>
                      {doc.hasContent && <span style={{ fontSize: '0.6rem', color: 'var(--health-exceptional)' }}>content extracted</span>}
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {expandedItem.fullText || expandedItem.text || expandedItem.label}
            </div>
          </div>
          {/* Modal footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <div>{renderUsedIn(expandedItem)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => setExpandedItem(null)}>Close</Button>
              {expandedItem.used && <Button variant="primary" onClick={() => { handleUsedInClick(expandedItem.used); setExpandedItem(null); }}>Open in Editor</Button>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const viewTabs = [
    { key: 'board', label: 'Board' },
    { key: 'list', label: 'List' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'unlinked', label: 'Unlinked' },
  ];

  return (
    <div style={{ padding: 20, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>The Drawing Board</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {viewTabs.map(t => (
            <Badge key={t.key} variant={viewMode === t.key ? 'accent' : 'muted'} style={{ cursor: 'pointer' }} onClick={() => setViewMode(t.key)}>{t.label}</Badge>
          ))}
          <Button size="sm" variant="secondary" onClick={() => setShowAddModal(true)}>+ Add</Button>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, width: 480, maxHeight: '80vh', overflow: 'auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Add to Drawing Board</h3>
              <span onClick={() => setShowAddModal(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</span>
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>Type</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ key: 'note', label: '📝 Note' }, { key: 'draft', label: '📄 Draft' }, { key: 'image', label: '🖼 Image Ref' }, { key: 'doc', label: '📎 Document' }].map(t => (
                  <Badge key={t.key} variant={addType === t.key ? 'accent' : 'muted'} style={{ cursor: 'pointer', padding: '4px 10px' }} onClick={() => setAddType(t.key)}>{t.label}</Badge>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>Title</div>
              <input
                value={addTitle} onChange={(e) => setAddTitle(e.target.value)}
                placeholder={addType === 'image' ? 'e.g. Fog bridge reference photo' : 'e.g. What if the detective is lying?'}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--editor-bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Photo Upload — only for image type */}
            {addType === 'image' && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>Photos</div>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                {/* Upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  onDrop={(e) => {
                    e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)';
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (ev) => setAddImages(prev => [...prev, { name: file.name, dataUrl: ev.target.result }]);
                      reader.readAsDataURL(file);
                    });
                  }}
                  style={{
                    border: '2px dashed var(--border)', borderRadius: 8, padding: addImages.length ? '10px' : '24px 16px',
                    textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                    background: 'var(--editor-bg)',
                  }}
                >
                  {addImages.length === 0 ? (
                    <div>
                      <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Click or drag photos here</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Supports multiple images — JPG, PNG, GIF, WebP</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {addImages.map((img, i) => (
                          <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={img.dataUrl} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeUploadedImage(i); }}
                              style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >✕</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent)', marginTop: 8 }}>+ Click to add more</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Upload — only for doc type */}
            {addType === 'doc' && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>Upload Files</div>
                <input type="file" accept=".txt,.md,.markdown,.pdf,.doc,.docx,.csv,.json,.html" multiple ref={docInputRef} onChange={handleDocUpload} style={{ display: 'none' }} />
                <div
                  onClick={() => docInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  onDrop={(e) => {
                    e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)';
                    const allowed = ['txt','md','markdown','pdf','doc','docx','csv','json','html'];
                    const files = Array.from(e.dataTransfer.files).filter(f => allowed.includes(f.name.split('.').pop().toLowerCase()));
                    files.forEach(file => {
                      const ext = file.name.split('.').pop().toLowerCase();
                      const isText = ['txt','md','markdown','csv','json','html'].includes(ext);
                      if (isText) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setAddDocs(prev => [...prev, { name: file.name, size: file.size, content: ev.target.result, ext }]);
                        reader.readAsText(file);
                      } else {
                        const reader = new FileReader();
                        reader.onload = (ev) => setAddDocs(prev => [...prev, { name: file.name, size: file.size, content: null, dataUrl: ev.target.result, ext }]);
                        reader.readAsDataURL(file);
                      }
                    });
                  }}
                  style={{
                    border: '2px dashed var(--border)', borderRadius: 8, padding: addDocs.length ? '10px' : '24px 16px',
                    textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                    background: 'var(--editor-bg)',
                  }}
                >
                  {addDocs.length === 0 ? (
                    <div>
                      <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Click or drag documents here</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Supports TXT, MD, PDF, DOC/DOCX, CSV, JSON, HTML</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                        {addDocs.map((doc, i) => {
                          const extColors = { txt: '#9aa0b0', md: '#9aa0b0', pdf: '#ef4444', doc: '#3b82f6', docx: '#3b82f6', csv: '#22c55e', json: '#f0a050', html: '#f472b6' };
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--bg-hover)', borderRadius: 6, border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: extColors[doc.ext] || 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>{doc.ext}</span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{doc.name}</span>
                              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>{formatFileSize(doc.size)}</span>
                              {doc.content && <span style={{ fontSize: '0.55rem', color: 'var(--health-exceptional)', flexShrink: 0 }}>readable</span>}
                              <button onClick={(e) => { e.stopPropagation(); removeUploadedDoc(i); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', padding: '0 4px', flexShrink: 0 }}
                                onMouseEnter={(e) => e.target.style.color = '#ef4444'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                              >✕</button>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent)', marginTop: 8 }}>+ Click to add more</div>
                    </div>
                  )}
                </div>
                {addDocs.some(d => !d.content) && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                    PDF and DOC/DOCX files are stored as references. TXT and MD file contents are extracted and readable in the board.
                  </div>
                )}
              </div>
            )}

            {/* Content / Notes */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
                {addType === 'image' ? 'Description / Notes' : addType === 'doc' ? 'Notes (optional)' : 'Content'}
              </div>
              <textarea
                value={addContent} onChange={(e) => setAddContent(e.target.value)}
                placeholder={addType === 'image' ? 'Describe what this reference is for, where it applies in the story...' : addType === 'doc' ? 'Add any notes about these documents...' : 'Write your notes, draft text, or description here...'}
                rows={addType === 'image' || addType === 'doc' ? 3 : 6}
                style={{ width: '100%', padding: '8px 10px', background: 'var(--editor-bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Group */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>Group (optional)</div>
              <input
                value={addGroup} onChange={(e) => setAddGroup(e.target.value)}
                placeholder="e.g. Characters, World Research, Alternate Ideas"
                style={{ width: '100%', padding: '8px 10px', background: 'var(--editor-bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
              {/* Quick group chips from existing groups */}
              {(() => {
                const existingGroups = [...new Set(boardItems.map(i => i.group).filter(Boolean))];
                return existingGroups.length > 0 ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {existingGroups.map(g => (
                      <span key={g} onClick={() => setAddGroup(g)} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10, background: addGroup === g ? 'var(--accent-subtle)' : 'var(--bg-hover)', color: addGroup === g ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', border: `1px solid ${addGroup === g ? 'var(--accent-border)' : 'var(--border)'}` }}>{g}</span>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="accent" onClick={addItem}>Add Item</Button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'board' && renderBoardView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'gallery' && renderGalleryView()}
      {viewMode === 'unlinked' && renderBoardView()}

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Groups: </span>
          {['Characters', 'World Research', 'Alternate Ideas', 'Unsorted'].map((g) => (
            <Badge key={g} variant="muted" style={{ marginRight: 4, cursor: 'pointer' }}>{g}</Badge>
          ))}
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}{viewMode === 'unlinked' ? ' unlinked' : ''}
        </span>
      </div>

      {renderExpandedModal()}
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

// Works library is built dynamically from user's projects
function useWorksLibrary() {
  const projects = useProjectStore(s => s.projects);
  return projects.map(p => ({
    id: p.id,
    title: p.title,
    type: p.medium || 'novel',
    wordCount: p.wordCount || 0,
    status: p.lastAction || 'In Progress',
  }));
}

/**
 * Load all .md files from a specific project (by ID) from IndexedDB.
 * Returns a flat object { 'path': 'content', ... }.
 */
async function loadProjectFilesById(projectId) {
  const { default: db } = await import('../lib/db');
  const records = await db.projectFiles.where('projectId').equals(projectId).toArray();
  const files = {};
  for (const f of records) {
    files[f.path] = f.content;
  }
  return files;
}

// Comparison data is now generated dynamically via LLM calls — see runDeepComparison() below

function ComparisonMode() {
  const [phase, setPhase] = useState('select'); // 'select' | 'picking' | 'results'
  const [comparisonType, setComparisonType] = useState(null);
  const [workA, setWorkA] = useState(null);
  const [workB, setWorkB] = useState(null);
  const [comparisonValidation, setComparisonValidation] = useState(null);
  const [pickingSide, setPickingSide] = useState(null); // 'A' | 'B'
  const [activeDimensions, setActiveDimensions] = useState(comparisonDimensions.map(d => d.key));
  const [expandedDimension, setExpandedDimension] = useState(null);
  const [showRadar, setShowRadar] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonProgress, setComparisonProgress] = useState('');
  const [resultsTab, setResultsTab] = useState('dimensions'); // 'dimensions' | 'characters'
  const [charsA, setCharsA] = useState([]);
  const [charsB, setCharsB] = useState([]);
  const [selectedCharA, setSelectedCharA] = useState(null);
  const [selectedCharB, setSelectedCharB] = useState(null);
  const [charComparisonData, setCharComparisonData] = useState(null);
  const [isComparingChars, setIsComparingChars] = useState(false);
  const [charComparisonProgress, setCharComparisonProgress] = useState('');
  // Series Evolution state
  const [seriesEvolutionData, setSeriesEvolutionData] = useState(null);
  const [isEvolvingSeries, setIsEvolvingSeries] = useState(false);
  const [evolutionProgress, setEvolutionProgress] = useState('');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [availableSeries, setAvailableSeries] = useState([]);
  const [evolutionTab, setEvolutionTab] = useState('timeline'); // 'timeline' | 'dimensions' | 'synthesis'
  const worksLibrary = useWorksLibrary();
  const projectFiles = useProjectStore(s => s.files);
  const sendMessage = useLlmStore(s => s.sendMessage);

  /**
   * Extract character names and file content from a project's files.
   * Characters are stored as characters/<name>.md (excluding questions-answered.md).
   */
  const extractCharactersFromProject = async (projectId) => {
    if (!projectId) return [];
    const files = await loadProjectFilesById(projectId);
    const charFiles = Object.entries(files).filter(
      ([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions-answered')
    );
    return charFiles.map(([path, content]) => {
      const name = path.replace('characters/', '').replace('.md', '').replace(/-/g, ' ');
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        path,
        content: content || '',
      };
    });
  };

  /**
   * Load all series with 2+ books from the database.
   */
  const loadAvailableSeries = async () => {
    try {
      const { default: db } = await import('../lib/db');
      const allProjects = await db.projects.toArray();
      const seriesMap = {};
      allProjects.forEach(p => {
        if (p.series) {
          if (!seriesMap[p.series]) seriesMap[p.series] = [];
          seriesMap[p.series].push(p);
        }
      });
      // Only show series with 2+ books
      const seriesList = Object.entries(seriesMap)
        .filter(([, projects]) => projects.length >= 2)
        .map(([name, projects]) => ({
          name,
          count: projects.length,
          projects: projects.sort((a, b) => (a.seriesOrder || 999) - (b.seriesOrder || 999)),
        }));
      setAvailableSeries(seriesList);
    } catch (err) {
      console.error('Failed to load series:', err);
    }
  };

  useEffect(() => {
    if (comparisonType === 'series') loadAvailableSeries();
  }, [comparisonType]);

  /**
   * Run character comparison via LLM
   */
  const runCharacterComparison = async () => {
    if (!selectedCharA || !selectedCharB || !workA || !workB) return;
    setIsComparingChars(true);
    setCharComparisonData(null);
    setCharComparisonProgress('Loading character data...');

    try {
      // Get additional context from each work (narrator, world, relationships)
      const filesA = workA.id ? await loadProjectFilesById(workA.id) : {};
      const filesB = workB.id ? await loadProjectFilesById(workB.id) : {};

      const contextA = [filesA['narrator.md'], filesA['world/world-building.md'], filesA['relationships/questions-answered.md']]
        .filter(Boolean).join('\n\n').slice(0, 3000);
      const contextB = [filesB['narrator.md'], filesB['world/world-building.md'], filesB['relationships/questions-answered.md']]
        .filter(Boolean).join('\n\n').slice(0, 3000);

      setCharComparisonProgress(`Comparing ${selectedCharA.name} vs ${selectedCharB.name}...`);

      const prompt = PROMPTS.CHARACTER_COMPARISON.build({
        charAName: selectedCharA.name,
        charBName: selectedCharB.name,
        workATitle: workA.title,
        workBTitle: workB.title,
        charAContent: selectedCharA.content.slice(0, 4000),
        charBContent: selectedCharB.content.slice(0, 4000),
        workAContext: contextA,
        workBContext: contextB,
      });

      const response = await sendMessage({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Compare ${selectedCharA.name} from "${workA.title}" with ${selectedCharB.name} from "${workB.title}". Respond with JSON only.` },
        ],
        role: 'analyst',
        maxTokens: 3000,
      });

      if (!response.success) throw new Error(response.error || 'Character comparison LLM call failed');

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setCharComparisonData(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error('Could not parse character comparison response');
      }
    } catch (err) {
      console.error('Character comparison failed:', err);
      setCharComparisonProgress('Character comparison failed. Check your LLM connection.');
    } finally {
      setIsComparingChars(false);
      setCharComparisonProgress('');
    }
  };

  // Load characters when entering character tab with comparison data
  useEffect(() => {
    if (resultsTab === 'characters' && workA?.id && workB?.id && charsA.length === 0) {
      extractCharactersFromProject(workA.id).then(setCharsA);
      extractCharactersFromProject(workB.id).then(setCharsB);
    }
  }, [resultsTab, workA?.id, workB?.id]);

  // Run deep comparison across all dimensions via LLM
  const runDeepComparison = async () => {
    if (!workA || !workB) return;
    setIsComparing(true);
    setPhase('results');
    setResultsTab('dimensions');
    setComparisonData(null);
    setCharComparisonData(null);
    setCharsA([]);
    setCharsB([]);
    setSelectedCharA(null);
    setSelectedCharB(null);

    try {
      // Gather text for each work — loads files from IndexedDB per project
      const getWorkText = async (work) => {
        if (work.id) {
          const files = await loadProjectFilesById(work.id);
          const allContent = Object.entries(files)
            .filter(([p]) => p.endsWith('.md'))
            .map(([p, c]) => `--- ${p} ---\n${c}`)
            .join('\n\n');
          return allContent.slice(0, 8000); // Cap at ~8k chars per work
        }
        return work.excerpt || `Title: ${work.title}\nType: ${work.type}`;
      };

      setComparisonProgress('Loading project data...');
      const workAText = await getWorkText(workA);
      const workBText = await getWorkText(workB);

      // Run per-dimension comparisons
      const dimensionResults = {};
      for (let i = 0; i < comparisonDimensions.length; i++) {
        const dim = comparisonDimensions[i];
        setComparisonProgress(`Analyzing ${dim.label}... (${i + 1}/${comparisonDimensions.length})`);

        const prompt = PROMPTS.DEEP_COMPARISON.build({
          dimension: dim.key,
          dimensionLabel: dim.label,
          workATitle: workA.title,
          workBTitle: workB.title,
          workAExcerpt: workAText,
          workBExcerpt: workBText,
          workAType: workA.type,
          workBType: workB.type,
        });

        try {
          const response = await sendMessage({
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: `Compare these two works on the dimension of ${dim.label}. Respond with JSON only.` },
            ],
            role: 'analyst',
            maxTokens: 2000,
          });

          if (!response.success) throw new Error(response.error || 'LLM call failed');

          // Parse JSON from response content
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            dimensionResults[dim.key] = JSON.parse(jsonMatch[0]);
          }
        } catch (dimErr) {
          console.warn(`Failed to compare dimension ${dim.key}:`, dimErr);
          dimensionResults[dim.key] = {
            dimension: dim.key, divergence: 50, scoreA: 5, scoreB: 5,
            summaryA: 'Analysis unavailable', summaryB: 'Analysis unavailable',
            keyDiff: 'Could not complete this dimension analysis.',
          };
        }
      }

      // Run summary synthesis
      setComparisonProgress('Synthesizing overall comparison...');
      const summaryPrompt = PROMPTS.DEEP_COMPARISON_SUMMARY.build({
        workATitle: workA.title,
        workBTitle: workB.title,
        dimensionResults: JSON.stringify(dimensionResults, null, 2),
      });

      let overallDivergence = 50;
      let topChanges = [];
      let oneSentenceSummary = '';
      try {
        const summaryResponse = await sendMessage({
          messages: [
            { role: 'system', content: summaryPrompt },
            { role: 'user', content: 'Synthesize the per-dimension results into an overall comparison. Respond with JSON only.' },
          ],
          role: 'analyst',
          maxTokens: 2000,
        });

        if (!summaryResponse.success) throw new Error(summaryResponse.error || 'Summary LLM call failed');

        const summaryJson = summaryResponse.content.match(/\{[\s\S]*\}/);
        if (summaryJson) {
          const parsed = JSON.parse(summaryJson[0]);
          overallDivergence = parsed.overallDivergence || 50;
          topChanges = parsed.topChanges || [];
          oneSentenceSummary = parsed.oneSentenceSummary || '';
        }
      } catch (sumErr) {
        console.warn('Failed to generate summary:', sumErr);
        topChanges = ['Summary generation failed. See individual dimension results below.'];
      }

      setComparisonData({
        workA: { title: workA.title, type: workA.type || 'Project' },
        workB: { title: workB.title, type: workB.type || 'Project' },
        overallDivergence,
        topChanges,
        oneSentenceSummary,
        dimensions: dimensionResults,
      });
    } catch (err) {
      console.error('Deep comparison failed:', err);
      setComparisonProgress('Comparison failed. Please check your LLM connection.');
    } finally {
      setIsComparing(false);
      setComparisonProgress('');
    }
  };

  // Run series evolution analysis
  const runSeriesEvolution = async () => {
    if (!selectedSeries) return;
    setIsEvolvingSeries(true);
    setSeriesEvolutionData(null);
    setEvolutionProgress('Loading series data...');
    setPhase('results');
    setResultsTab('evolution');

    try {
      const { loadSeriesData } = await import('../services/seriesContext');
      const seriesData = await loadSeriesData(selectedSeries.name);
      if (!seriesData || seriesData.length < 2) throw new Error('Need at least 2 books');

      // Evolution dimensions to analyze
      const evolutionDimensions = [
        { key: 'characters', label: 'Character Depth & Complexity' },
        { key: 'world', label: 'World Building & Expansion' },
        { key: 'tone', label: 'Tone & Atmosphere' },
        { key: 'craft', label: 'Writing Quality & Craft' },
        { key: 'themes', label: 'Thematic Depth' },
        { key: 'structure', label: 'Structural Innovation' },
        { key: 'tropes', label: 'Trope Usage & Subversion' },
        { key: 'arcs', label: 'Narrative Arcs' },
      ];

      // Build books data string
      const booksDataStr = seriesData.map((entry, i) => {
        const { project, files } = entry;
        const allContent = Object.entries(files)
          .filter(([p]) => p.endsWith('.md'))
          .map(([p, c]) => `--- ${p} ---\n${c}`)
          .join('\n\n');
        return `### Book ${i + 1}: "${project.title}" [${project.seriesRole || 'mainline'}]\nGenre: ${project.genre} | Medium: ${project.medium} | Words: ${project.wordCount || 0}\n\n${allContent.slice(0, 5000)}`;
      }).join('\n\n---\n\n');

      // Run per-dimension evolution analysis
      const dimensionResults = {};
      for (let i = 0; i < evolutionDimensions.length; i++) {
        const dim = evolutionDimensions[i];
        setEvolutionProgress(`Analyzing ${dim.label}... (${i + 1}/${evolutionDimensions.length})`);

        try {
          const { PROMPTS } = await import('../lib/promptRegistry');
          const prompt = PROMPTS.SERIES_EVOLUTION.build({
            seriesName: selectedSeries.name,
            totalBooks: seriesData.length,
            evolutionDimension: dim.label,
            booksData: booksDataStr,
          });

          const response = await sendMessage({
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: `Analyze the evolution of ${dim.label} across the "${selectedSeries.name}" series. Respond with JSON only.` },
            ],
            role: 'analyst',
            maxTokens: 3000,
          });

          if (!response.success) throw new Error(response.error);
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) dimensionResults[dim.key] = JSON.parse(jsonMatch[0]);
        } catch (dimErr) {
          console.warn(`Evolution analysis failed for ${dim.key}:`, dimErr);
          dimensionResults[dim.key] = {
            dimension: dim.label,
            trajectory: 'unknown',
            perBook: seriesData.map((d, idx) => ({ title: d.project.title, order: idx + 1, score: 5, summary: 'Analysis unavailable', keyDevelopments: [], comparedToPrevious: null })),
            overallArc: 'Analysis could not be completed.',
            hallmarks: [],
            subversions: [],
            peakMoment: 'Unknown',
          };
        }
      }

      // Run synthesis
      setEvolutionProgress('Synthesizing series evolution...');
      let synthesis = null;
      try {
        const { PROMPTS } = await import('../lib/promptRegistry');
        const synthPrompt = PROMPTS.SERIES_EVOLUTION_SYNTHESIS.build({
          seriesName: selectedSeries.name,
          totalBooks: seriesData.length,
          dimensionResults: JSON.stringify(dimensionResults, null, 2),
        });

        const synthResponse = await sendMessage({
          messages: [
            { role: 'system', content: synthPrompt },
            { role: 'user', content: 'Synthesize the evolution of this series across all dimensions. Respond with JSON only.' },
          ],
          role: 'analyst',
          maxTokens: 3000,
        });

        if (synthResponse.success) {
          const jsonMatch = synthResponse.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) synthesis = JSON.parse(jsonMatch[0]);
        }
      } catch (synthErr) {
        console.warn('Synthesis failed:', synthErr);
      }

      setSeriesEvolutionData({
        seriesName: selectedSeries.name,
        books: seriesData.map(d => d.project),
        dimensions: dimensionResults,
        synthesis,
        evolutionDimensions,
      });
    } catch (err) {
      console.error('Series evolution failed:', err);
      setEvolutionProgress('Analysis failed. Check your LLM connection.');
    } finally {
      setIsEvolvingSeries(false);
      setEvolutionProgress('');
    }
  };

  const toggleDimension = (key) => {
    setActiveDimensions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Radar chart SVG helper
  const renderRadarChart = () => {
    if (!comparisonData?.dimensions) return null;
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
      const val = comparisonData.dimensions[d.key]?.scoreA || 5;
      const p = getPoint(i, val);
      return `${p.x},${p.y}`;
    }).join(' ');

    // Work B polygon
    const ptsB = dims.map((d, i) => {
      const val = comparisonData.dimensions[d.key]?.scoreB || 5;
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
          const valA = comparisonData.dimensions[d.key]?.scoreA || 5;
          const valB = comparisonData.dimensions[d.key]?.scoreB || 5;
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

  // Evolution rendering helpers
  const renderEvolutionTimeline = () => {
    if (!seriesEvolutionData?.dimensions || !seriesEvolutionData?.books) return null;

    const evolutionColors = {
      characters: '#f472b6', world: '#34d399', tone: '#c084fc', craft: '#fbbf24',
      themes: '#60a5fa', structure: '#fb923c', tropes: '#a78bfa', arcs: '#2dd4bf',
    };

    return (
      <Card style={{ padding: 20, overflow: 'auto' }}>
        <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 16 }}>
          Evolution Timeline
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(seriesEvolutionData.dimensions).map(([dimKey, dimData]) => {
            if (!dimData.perBook) return null;
            return (
              <div key={dimKey} style={{ borderLeft: `3px solid ${evolutionColors[dimKey]}`, paddingLeft: 12 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: evolutionColors[dimKey] }}>
                  {dimData.dimension}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {dimData.perBook.map((book, i) => (
                    <div key={i} style={{
                      fontSize: '0.75rem', padding: '4px 8px', background: evolutionColors[dimKey] + '20',
                      color: evolutionColors[dimKey], borderRadius: 'var(--radius-xs)', fontWeight: 600,
                      border: `1px solid ${evolutionColors[dimKey]}40`,
                    }}>
                      B{book.order}: {book.score}/10
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderEvolutionDimensions = () => {
    if (!seriesEvolutionData?.dimensions) return null;

    const trajectoryColors = {
      ascending: '#34d399', descending: '#ef4444', wave: '#60a5fa',
      plateau: '#fbbf24', volatile: '#e879f9', unknown: '#94a3b8',
    };
    const trajectoryIcons = {
      ascending: '📈', descending: '📉', wave: '🌊', plateau: '➡️', volatile: '⚡', unknown: '❓',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(seriesEvolutionData.dimensions).map(([dimKey, dimData]) => {
          const trajColor = trajectoryColors[dimData.trajectory] || '#94a3b8';
          const trajIcon = trajectoryIcons[dimData.trajectory] || '❓';
          return (
            <Card key={dimKey} style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: trajColor + '10', borderLeft: `4px solid ${trajColor}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.1rem' }}>{trajIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {dimData.dimension}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Trajectory: <span style={{ color: trajColor, fontWeight: 600 }}>{dimData.trajectory}</span>
                  </div>
                </div>
                <Badge style={{ background: trajColor + '20', color: trajColor, fontSize: '0.7rem', padding: '3px 8px' }}>
                  {dimData.trajectory}
                </Badge>
              </div>

              {dimData.perBook && (
                <div style={{ padding: '12px 16px' }}>
                  {dimData.perBook.map((book, i) => (
                    <div key={i} style={{ marginBottom: i < dimData.perBook.length - 1 ? 12 : 0, paddingBottom: i < dimData.perBook.length - 1 ? 12 : 0, borderBottom: i < dimData.perBook.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <Badge variant="secondary" style={{ fontSize: '0.7rem' }}>Book {book.order}</Badge>
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', flex: 1 }}>{book.title}</span>
                        <Badge style={{ fontSize: '0.75rem', fontWeight: 700, background: trajColor + '20', color: trajColor }}>
                          {book.score}/10
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                        {book.summary}
                      </div>
                      {book.keyDevelopments && book.keyDevelopments.length > 0 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 600 }}>Key developments:</span> {book.keyDevelopments.join('; ')}
                        </div>
                      )}
                      {book.comparedToPrevious && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                          {book.comparedToPrevious}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(dimData.hallmarks?.length > 0 || dimData.subversions?.length > 0) && (
                <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                  {dimData.hallmarks && dimData.hallmarks.length > 0 && (
                    <div style={{ marginBottom: dimData.subversions?.length > 0 ? 8 : 0 }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>HALLMARKS</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {dimData.hallmarks.join('; ')}
                      </div>
                    </div>
                  )}
                  {dimData.subversions && dimData.subversions.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>SUBVERSIONS</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {dimData.subversions.join('; ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {dimData.overallArc && (
                <div style={{ padding: '12px 16px', background: 'var(--accent-glow)', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>OVERALL ARC</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {dimData.overallArc}
                  </div>
                </div>
              )}

              {dimData.peakMoment && (
                <div style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600 }}>Peak Moment:</span> {dimData.peakMoment}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderEvolutionSynthesis = () => {
    if (!seriesEvolutionData?.synthesis) {
      return (
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Synthesis data not available.</p>
        </Card>
      );
    }

    const syn = seriesEvolutionData.synthesis;
    const qualityColors = { ascending: '#34d399', descending: '#ef4444', 'peak-middle': '#fbbf24', consistent: '#60a5fa' };
    const qualityArc = syn.qualityArc || 'unknown';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card style={{ padding: 16 }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Overall Evolution Trajectory
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {syn.overallTrajectory}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {syn.authorGrowth && (
            <Card style={{ padding: 12, background: 'var(--accent-glow)', border: '1px solid var(--accent)20' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Author Growth
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {syn.authorGrowth}
              </div>
            </Card>
          )}
          {syn.worldExpansion && (
            <Card style={{ padding: 12, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#34d399', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                World Expansion
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {syn.worldExpansion}
              </div>
            </Card>
          )}
          {syn.characterEvolution && (
            <Card style={{ padding: 12, background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f472b6', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Character Evolution
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {syn.characterEvolution}
              </div>
            </Card>
          )}
          {syn.toneShift && (
            <Card style={{ padding: 12, background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#c084fc', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tone Shift
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {syn.toneShift}
              </div>
            </Card>
          )}
        </div>

        <Card style={{ padding: 16, background: qualityColors[qualityArc] + '10', border: `1px solid ${qualityColors[qualityArc]}30` }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: qualityColors[qualityArc], marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quality Arc
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge style={{ background: qualityColors[qualityArc] + '30', color: qualityColors[qualityArc], fontSize: '0.75rem', padding: '4px 10px', fontWeight: 600 }}>
              {qualityArc}
            </Badge>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              The series showed a <span style={{ color: qualityColors[qualityArc], fontWeight: 600 }}>{qualityArc}</span> quality trajectory.
            </span>
          </div>
        </Card>

        {syn.hallmarkSignatures && syn.hallmarkSignatures.length > 0 && (
          <Card style={{ padding: 16, background: 'var(--bg-secondary)' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10, margin: 0 }}>
              Hallmark Signatures
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {syn.hallmarkSignatures.map((sig, i) => (
                <Badge key={i} variant="secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  {sig}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {syn.biggestSubversions && syn.biggestSubversions.length > 0 && (
          <Card style={{ padding: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', marginBottom: 10, margin: 0 }}>
              Biggest Subversions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {syn.biggestSubversions.map((sub, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>• </span>{sub}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {syn.strongestEntry && (
            <Card style={{ padding: 14, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#34d399', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Strongest Entry
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {syn.strongestEntry.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {syn.strongestEntry.why}
              </div>
            </Card>
          )}
          {syn.weakestEntry && (
            <Card style={{ padding: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Weakest Entry
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {syn.weakestEntry.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {syn.weakestEntry.why}
              </div>
            </Card>
          )}
        </div>

        {syn.recommendations && syn.recommendations.length > 0 && (
          <Card style={{ padding: 16, background: 'var(--accent-glow)', border: '1px solid var(--accent)20' }}>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 10, margin: 0 }}>
              Recommendations for Next Entry
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {syn.recommendations.map((rec, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>• </span>{rec}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
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

          {/* Series picker OR Work selection slots */}
          {comparisonType === 'series' ? (
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Select Series to Analyze</h3>
              {availableSeries.length === 0 ? (
                <Card style={{ padding: 32, textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No multi-book series found in your library.</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>Create at least 2 books in a series to use Series Evolution analysis.</div>
                </Card>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 24 }}>
                    {availableSeries.map(series => (
                      <Card
                        key={series.name}
                        onClick={() => setSelectedSeries(series)}
                        style={{
                          padding: 16, cursor: 'pointer', transition: 'all 0.2s',
                          border: selectedSeries?.name === series.name ? '1px solid var(--accent)' : '1px solid var(--border)',
                          background: selectedSeries?.name === series.name ? 'var(--accent-glow)' : undefined,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: selectedSeries?.name === series.name ? 'var(--accent)' : 'var(--text-primary)' }}>{series.name}</span>
                          <Badge variant={selectedSeries?.name === series.name ? 'accent' : 'secondary'}>{series.count} books</Badge>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {series.projects.map((proj, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '3px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)' }}>
                              {i + 1}. {proj.title}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Run series evolution button */}
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      variant={selectedSeries ? 'primary' : 'secondary'}
                      onClick={() => {
                        if (selectedSeries) {
                          runSeriesEvolution();
                          setComparisonValidation(null);
                        } else {
                          setComparisonValidation('Select a series to analyze.');
                        }
                      }}
                      style={{ opacity: selectedSeries ? 1 : 0.5, padding: '10px 32px' }}
                    >
                      <TrendingUp size={14} style={{ marginRight: 6 }} />
                      Run Series Evolution
                    </Button>
                    {comparisonValidation && (
                      <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, animation: 'fadeIn 0.3s ease' }}>
                        <AlertTriangle size={13} />
                        {comparisonValidation}
                      </div>
                    )}
                  </div>
                </>
              )}
              <ScrollIntoView />
            </div>
          ) : (
            comparisonType && (
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
                    onClick={() => {
                      if (workA && workB) {
                        runDeepComparison();
                        setComparisonValidation(null);
                      } else {
                        setComparisonValidation(!workA && !workB ? 'Select both works before running the comparison.' : !workA ? 'Select Work A to continue.' : 'Select Work B to continue.');
                      }
                    }}
                    style={{ opacity: workA && workB ? 1 : 0.5, padding: '10px 32px' }}
                  >
                    <Sparkles size={14} style={{ marginRight: 6 }} />
                    Run Deep Comparison
                  </Button>
                  {comparisonValidation && (
                    <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, animation: 'fadeIn 0.3s ease' }}>
                      <AlertTriangle size={13} />
                      {comparisonValidation}
                    </div>
                  )}
                </div>
                <ScrollIntoView />
              </div>
            )
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
            {worksLibrary.map(w => (
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
  const data = comparisonData;
  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
      {/* Loading state */}
      {isComparing && (
        <Card style={{ padding: 20, textAlign: 'center', marginBottom: 16, animation: 'fadeIn 0.3s ease' }}>
          <Sparkles size={20} color="var(--accent)" style={{ marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Running Deep Comparison</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{comparisonProgress}</div>
        </Card>
      )}
      {!comparisonData && !isComparing && (
        <Card style={{ padding: 20, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No comparison data available. Run a comparison first.</p>
        </Card>
      )}

      {data && (
      <>
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
        {data.oneSentenceSummary && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
            {data.oneSentenceSummary}
          </div>
        )}
      </Card>

      {/* Results Tab Switcher */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 3, width: 'fit-content' }}>
        {[
          { key: 'dimensions', label: 'Dimension Analysis', icon: BarChart3 },
          { key: 'characters', label: 'Character Matchups', icon: Users },
          ...(seriesEvolutionData ? [{ key: 'evolution', label: 'Series Evolution', icon: TrendingUp }] : []),
        ].map(tab => {
          const TabIcon = tab.icon;
          const active = resultsTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setResultsTab(tab.key)} style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: active ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6,
              background: active ? 'var(--bg-primary)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>
              <TabIcon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── Dimensions Tab ─── */}
      {resultsTab === 'dimensions' && (<>
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
      </>)}

      {/* ─── Characters Tab ─── */}
      {resultsTab === 'characters' && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          {/* Character selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, marginBottom: 20, alignItems: 'start' }}>
            {/* Work A characters */}
            <div>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 10 }}>
                {data.workA.title} — Characters
              </h3>
              {charsA.length === 0 ? (
                <Card style={{ padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No character files found in this project.</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {charsA.map(ch => {
                    const selected = selectedCharA?.name === ch.name;
                    return (
                      <Card key={ch.path} onClick={() => setSelectedCharA(ch)} style={{
                        padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s',
                        border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: selected ? 'var(--accent-glow)' : undefined,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <Users size={14} color={selected ? 'var(--accent)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.85rem', fontWeight: selected ? 600 : 400, color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {ch.name}
                        </span>
                        {ch.content && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{ch.content.split(/\s+/).length}w</span>}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30, color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 700 }}>vs</div>

            {/* Work B characters */}
            <div>
              <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f472b6', marginBottom: 10 }}>
                {data.workB.title} — Characters
              </h3>
              {charsB.length === 0 ? (
                <Card style={{ padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No character files found in this project.</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {charsB.map(ch => {
                    const selected = selectedCharB?.name === ch.name;
                    return (
                      <Card key={ch.path} onClick={() => setSelectedCharB(ch)} style={{
                        padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s',
                        border: selected ? '1px solid #f472b6' : '1px solid var(--border)',
                        background: selected ? 'rgba(244,114,182,0.08)' : undefined,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <Users size={14} color={selected ? '#f472b6' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.85rem', fontWeight: selected ? 600 : 400, color: selected ? '#f472b6' : 'var(--text-primary)' }}>
                          {ch.name}
                        </span>
                        {ch.content && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{ch.content.split(/\s+/).length}w</span>}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Run character comparison button */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Button
              variant={selectedCharA && selectedCharB ? 'primary' : 'secondary'}
              onClick={runCharacterComparison}
              disabled={!selectedCharA || !selectedCharB || isComparingChars}
              style={{ opacity: selectedCharA && selectedCharB ? 1 : 0.5, padding: '10px 28px' }}
            >
              <Sparkles size={14} style={{ marginRight: 6 }} />
              {isComparingChars ? 'Comparing...' : 'Compare Characters'}
            </Button>
            {charComparisonProgress && (
              <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Sparkles size={12} color="var(--accent)" style={{ animation: 'pulse 1.5s infinite' }} /> {charComparisonProgress}
              </div>
            )}
          </div>

          {/* Character comparison results */}
          {charComparisonData && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {/* Header */}
              <Card style={{ padding: 16, marginBottom: 16, background: 'linear-gradient(135deg, var(--accent-glow) 0%, rgba(244,114,182,0.06) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                    <span style={{ color: 'var(--accent)' }}>{charComparisonData.charA}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 8px', fontWeight: 400, fontSize: '0.85rem' }}>vs</span>
                    <span style={{ color: '#f472b6' }}>{charComparisonData.charB}</span>
                  </h3>
                  <Badge variant="accent" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                    {charComparisonData.overallSimilarity}% similar
                  </Badge>
                </div>
                {charComparisonData.oneSentence && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    {charComparisonData.oneSentence}
                  </div>
                )}
              </Card>

              {/* Dimension cards */}
              {charComparisonData.dimensions && Object.entries(charComparisonData.dimensions).map(([dimKey, dim]) => {
                const dimLabels = { motivation: 'Motivation', arc: 'Character Arc', voice: 'Voice & Dialogue', psychology: 'Psychology', role: 'Narrative Role', relationships: 'Relationships' };
                const dimColors = { motivation: '#a78bfa', arc: '#fbbf24', voice: '#60a5fa', psychology: '#e879f9', role: '#34d399', relationships: '#fb7185' };
                const similarity = dim.similarity || 50;

                return (
                  <Card key={dimKey} style={{ marginBottom: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', flex: 1, color: dimColors[dimKey] || 'var(--text-primary)' }}>
                        {dimLabels[dimKey] || dimKey}
                      </span>
                      {/* Similarity bar */}
                      <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden', marginRight: 8 }}>
                        <div style={{
                          width: `${similarity}%`, height: '100%', borderRadius: 3,
                          background: similarity > 70 ? '#34d399' : similarity > 40 ? '#fbbf24' : '#ef4444',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: similarity > 70 ? '#34d399' : similarity > 40 ? '#fbbf24' : '#ef4444', minWidth: 28 }}>
                        {similarity}%
                      </span>
                    </div>
                    {/* Side by side summaries */}
                    <div style={{ padding: '0 16px 14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                        <div style={{ padding: 10, borderRadius: 'var(--radius-sm)', background: 'var(--accent-glow)', border: '1px solid var(--accent)20' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {charComparisonData.charA}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dim.charASummary}</div>
                        </div>
                        <div style={{ padding: 10, borderRadius: 'var(--radius-sm)', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f472b6', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {charComparisonData.charB}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{dim.charBSummary}</div>
                        </div>
                      </div>
                      {dim.insight && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                          {dim.insight}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}

              {/* What each could learn */}
              {charComparisonData.whatEachCouldLearn && (
                <Card style={{ padding: 16, marginTop: 6, background: 'var(--bg-secondary)' }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: 8 }}>
                    <Sparkles size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Cross-Pollination Insight
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {charComparisonData.whatEachCouldLearn}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Series Evolution Tab ─── */}
      {resultsTab === 'evolution' && seriesEvolutionData && (
        <div style={{ animation: 'fadeIn 0.25s ease' }}>
          {/* Evolution sub-tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 3, width: 'fit-content' }}>
            {['timeline', 'dimensions', 'synthesis'].map(tab => (
              <button key={tab} onClick={() => setEvolutionTab(tab)} style={{
                padding: '7px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: evolutionTab === tab ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6,
                background: evolutionTab === tab ? 'var(--bg-primary)' : 'transparent',
                color: evolutionTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: evolutionTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}>
                {tab === 'timeline' ? 'Timeline View' : tab === 'dimensions' ? 'By Dimension' : 'Synthesis'}
              </button>
            ))}
          </div>

          {/* Timeline View */}
          {evolutionTab === 'timeline' && renderEvolutionTimeline?.()}

          {/* Dimensions View */}
          {evolutionTab === 'dimensions' && renderEvolutionDimensions?.()}

          {/* Synthesis View */}
          {evolutionTab === 'synthesis' && renderEvolutionSynthesis?.()}

          {isEvolvingSeries && evolutionProgress && (
            <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Sparkles size={12} color="var(--accent)" style={{ animation: 'pulse 1.5s infinite' }} /> {evolutionProgress}
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

/* ─── Relationship Graph ─── */
function RelationshipGraph() {
  const rgFiles = useProjectStore(s => s.files);
  const [centerCharacterOverride, setCenterCharacter] = useState(null);
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

  // Build characters dynamically from project files
  const rgCharColors = ['#e85d2a', '#818cf8', '#64748b', '#f472b6', '#f97316', '#fbbf24', '#2dd4bf', '#a78bfa', '#f87171', '#34d399'];
  const characters = {};
  const charEntries = Object.entries(rgFiles)
    .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions'));
  charEntries.forEach(([path, content], idx) => {
    const slug = path.replace('characters/', '').replace('.md', '');
    const key = slug.replace(/-/g, '');
    const h1Raw = (content || '').split('\n').find(l => l.startsWith('# '));
    // Strip trailing " — Character Decomposition" and similar suffixes before parsing
    const h1 = h1Raw ? h1Raw.replace(/\s*[—–]+\s*(Character Decomposition|Literary Analy\w+|Deep Character Extraction|Character Extraction|Character Census).*$/i, '') : null;
    const nameMatch = h1 ? h1.match(/^#{1,3}\s+(.+?)(?:\s*\([^)]*\))?\s*$/) : null;
    const fullName = nameMatch ? nameMatch[1].trim() : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    characters[key] = { name: fullName, initials, color: rgCharColors[idx % rgCharColors.length] };
  });

  // Build relationships from relationships/ files
  const relationships = [];
  const relContent = rgFiles['relationships/questions-answered.md'] || '';
  const charKeys = Object.keys(characters);

  // Helper: match a display name to a character key using fuzzy slug matching
  const matchCharKey = (displayName) => {
    const slug = displayName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    // Try exact key match first
    if (characters[slug]) return slug;
    // Try prefix match (e.g. "dorothy" matches "dorothygale")
    const prefixMatch = charKeys.find(k => k.startsWith(slug) || slug.startsWith(k));
    if (prefixMatch) return prefixMatch;
    // Try matching by character name
    const nameMatch = charKeys.find(k => {
      const charName = characters[k].name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      return charName.startsWith(slug) || slug.startsWith(charName) || charName.includes(slug) || slug.includes(charName);
    });
    return nameMatch || null;
  };

  // Parse "### X ↔ Y" or "## X ↔ Y" sections for relationship pairs
  const relSections = relContent.split(/^#{2,3}\s+/m).filter(s => s.includes('↔'));
  relSections.forEach(section => {
    const headerLine = section.split('\n')[0];
    const pairMatch = headerLine.match(/(.+?)\s*↔\s*(.+)/);
    if (!pairMatch) return;
    const fromKey = matchCharKey(pairMatch[1]);
    const toKey = matchCharKey(pairMatch[2]);
    if (!fromKey || !toKey || !characters[fromKey] || !characters[toKey]) return;
    // Avoid duplicate pairs
    if (relationships.some(r => (r.from === fromKey && r.to === toKey) || (r.from === toKey && r.to === fromKey))) return;
    const lower = section.toLowerCase();
    const type = lower.includes('betray') || lower.includes('opposition') || lower.includes('enemy') || lower.includes('wicked') ? 'rival'
      : lower.includes('friend') || lower.includes('warmth') || lower.includes('alliance') || lower.includes('companion') || lower.includes('protective') ? 'friend'
      : lower.includes('family') || lower.includes('father') || lower.includes('mother') || lower.includes('sister') || lower.includes('aunt') || lower.includes('uncle') ? 'family'
      : lower.includes('mentor') || lower.includes('guide') || lower.includes('teach') ? 'mentor'
      : lower.includes('authority') || lower.includes('ruler') || lower.includes('power') ? 'authority'
      : 'ally';
    relationships.push({ from: fromKey, to: toKey, type, label: `${characters[fromKey].name} ↔ ${characters[toKey].name}`, strength: 3 });
  });

  // Also try parsing from relationship-graph.csv if available
  const csvContent = rgFiles['relationships/relationship-graph.csv'] || '';
  if (csvContent && relationships.length === 0) {
    const csvLines = csvContent.split('\n').filter(l => l.trim());
    if (csvLines.length > 1) {
      const headers = csvLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      for (let i = 1; i < csvLines.length; i++) {
        const cols = csvLines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        if (cols.length < 2) continue;
        const fromName = cols[0];
        const toName = cols[1];
        const fromKey = matchCharKey(fromName);
        const toKey = matchCharKey(toName);
        if (!fromKey || !toKey || !characters[fromKey] || !characters[toKey]) continue;
        if (relationships.some(r => (r.from === fromKey && r.to === toKey) || (r.from === toKey && r.to === fromKey))) continue;
        const cellText = cols.slice(2).join(' ').toLowerCase();
        const type = cellText.includes('rival') || cellText.includes('enemy') ? 'rival'
          : cellText.includes('friend') || cellText.includes('companion') ? 'friend'
          : cellText.includes('family') ? 'family'
          : cellText.includes('mentor') ? 'mentor'
          : cellText.includes('authority') ? 'authority'
          : 'ally';
        relationships.push({ from: fromKey, to: toKey, type, label: `${characters[fromKey].name} ↔ ${characters[toKey].name}`, strength: 3 });
      }
    }
  }

  // Center character defaults to first character
  const centerCharacter = centerCharacterOverride && characters[centerCharacterOverride] ? centerCharacterOverride : (Object.keys(characters)[0] || '');

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
    connectionCounts[k] = relationships.filter(r => r && (r.from === k || r.to === k)).length;
  });
  const mostConnected = Object.entries(connectionCounts).sort((a, b) => b[1] - a[1])[0];
  const strongestBond = relationships.filter(Boolean).sort((a, b) => (b?.strength || 0) - (a?.strength || 0))[0];

  // Filter relationships by type if filter is active
  const visibleRels = filterType ? relationships.filter(r => r && r.type === filterType) : relationships.filter(Boolean);

  if (Object.keys(characters).length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>No Characters Yet</h3>
        <p style={{ fontSize: '0.85rem' }}>Add characters to your project to see their relationship web here.</p>
      </div>
    );
  }

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
            {visibleRels.filter(Boolean).map(rel => {
              if (!rel || !rel.from || !rel.to) return null;
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
              {relationships.filter(r => r && r.from && r.to && (r.from === centerCharacter || r.to === centerCharacter)).map(rel => {
                const otherKey = rel.from === centerCharacter ? rel.to : rel.from;
                const other = characters[otherKey];
                if (!other) return null;
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
              {strongestBond && characters[strongestBond.from] && characters[strongestBond.to] && (
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Strongest</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {characters[strongestBond.from].name.split(' ')[0]} ↔ {characters[strongestBond.to].name.split(' ')[0]}
                </div>
              </div>
              )}
              {mostConnected && characters[mostConnected[0]] && (
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Most Connected</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {characters[mostConnected[0]].name.split(' ')[0]} ({mostConnected[1]})
                </div>
              </div>
              )}
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
  const projectFiles = useProjectStore(s => s.files);
  const activeProject = useProjectStore(s => s.activeProject);
  const worldContent = projectFiles['world/world-building.md'] || '';

  // Parse world-building.md into structured sections
  const parseWorldData = (content) => {
    if (!content.trim()) return { overview: {}, locations: [], cultureRules: [], hallmarks: [], history: [] };

    const sections = {};
    let currentSection = 'raw';
    const lines = content.split('\n');
    lines.forEach(line => {
      const h2 = line.match(/^##\s+(.+)/);
      if (h2) {
        currentSection = h2[1].trim().toLowerCase();
        sections[currentSection] = [];
        return;
      }
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(line);
    });

    // Parse locations from markdown list items or subsections
    const parseListItems = (lines = []) => {
      const items = [];
      let current = null;
      for (const line of lines) {
        const h3 = line.match(/^###\s+(.+)/);
        const bullet = line.match(/^\s*[-*]\s+\*\*(.+?)\*\*[:\s]*(.*)/);
        const simpleBullet = line.match(/^\s*[-*]\s+(.+)/);
        if (h3) {
          if (current) items.push(current);
          current = { name: h3[1].trim(), desc: '', type: 'Location', importance: 'Primary', connections: [] };
        } else if (bullet && !current) {
          items.push({ name: bullet[1].trim(), desc: bullet[2]?.trim() || '', type: 'Location', importance: 'Primary', connections: [] });
        } else if (current && line.trim()) {
          current.desc += (current.desc ? ' ' : '') + line.trim();
        }
      }
      if (current) items.push(current);
      return items;
    };

    // Parse culture rules
    const parseCultureRules = (lines = []) => {
      const rules = [];
      let current = null;
      for (const line of lines) {
        const h3 = line.match(/^###\s+(.+)/);
        const bullet = line.match(/^\s*[-*]\s+\*\*(.+?)\*\*[:\s]*(.*)/);
        if (h3) {
          if (current) rules.push(current);
          current = { rule: h3[1].trim(), category: 'General', desc: '', tension: 'medium' };
        } else if (bullet) {
          rules.push({ rule: bullet[1].trim(), category: 'General', desc: bullet[2]?.trim() || '', tension: 'medium' });
        } else if (current && line.trim()) {
          current.desc += (current.desc ? ' ' : '') + line.trim();
        }
      }
      if (current) rules.push(current);
      return rules;
    };

    // Parse history timeline
    const parseHistory = (lines = []) => {
      const events = [];
      for (const line of lines) {
        const match = line.match(/^\s*[-*]\s+\*?\*?(\d{4}s?|[\d-]+)\*?\*?[:\s—-]+(.+)/);
        if (match) {
          events.push({ year: match[1].trim(), event: match[2].trim(), relevance: '' });
        }
      }
      return events;
    };

    // Parse hallmarks/symbols
    const parseHallmarks = (lines = []) => {
      const items = [];
      for (const line of lines) {
        const bullet = line.match(/^\s*[-*]\s+\*\*(.+?)\*\*[:\s]*(.*)/);
        if (bullet) {
          items.push({ name: bullet[1].trim(), type: 'Symbol', significance: bullet[2]?.trim() || '', chapters: [] });
        }
      }
      return items;
    };

    // Find overview text (before first H2 or in "overview"/"setting" section)
    const overviewLines = sections['overview'] || sections['setting'] || sections['raw'] || [];
    const overview = overviewLines.join('\n').trim();

    return {
      overview: { text: overview },
      locations: parseListItems(sections['locations'] || sections['places'] || sections['geography'] || []),
      cultureRules: parseCultureRules(sections['culture'] || sections['rules'] || sections['culture & rules'] || sections['society'] || []),
      history: parseHistory(sections['history'] || sections['timeline'] || []),
      hallmarks: parseHallmarks(sections['hallmarks'] || sections['symbols'] || sections['motifs'] || []),
    };
  };

  const worldData = parseWorldData(worldContent);
  const locations = worldData.locations.length > 0 ? worldData.locations : [];
  const cultureRules = worldData.cultureRules.length > 0 ? worldData.cultureRules : [];
  const hallmarks = worldData.hallmarks.length > 0 ? worldData.hallmarks : [];
  const history = worldData.history.length > 0 ? worldData.history : [];

  const worldTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'locations', label: `Locations${locations.length ? ` (${locations.length})` : ''}` },
    { key: 'culture', label: `Culture & Rules${cultureRules.length ? ` (${cultureRules.length})` : ''}` },
    { key: 'history', label: `History${history.length ? ` (${history.length})` : ''}` },
    { key: 'hallmarks', label: `Hallmarks${hallmarks.length ? ` (${hallmarks.length})` : ''}` },
    { key: 'tonal', label: 'Tonal Arc' },
  ];

  const tensionColor = (t) => t === 'critical' ? '#ef4444' : t === 'high' ? '#f97316' : t === 'medium' ? '#fbbf24' : '#4ade80';

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 2 }}>World Building</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activeProject?.title || 'Untitled Project'}</p>
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
          <div>
            {worldData.overview?.text ? (
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>World Overview</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {worldData.overview.text}
                </div>
              </Card>
            ) : (
              <Card style={{ padding: 20, textAlign: 'center' }}>
                <Globe2 size={24} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  No world-building data yet. Complete Phase 3 (World) in the Guide to populate this view.
                </p>
              </Card>
            )}
            {/* Quick stats */}
            <Card style={{ padding: 16, display: 'flex', gap: 24 }}>
              {[
                { label: 'Locations', value: locations.length, color: '#2dd4bf' },
                { label: 'Cultural Rules', value: cultureRules.length, color: '#a78bfa' },
                { label: 'Hallmarks', value: hallmarks.length, color: '#fbbf24' },
                { label: 'Historical Events', value: history.length, color: '#818cf8' },
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

        {/* Tonal Arc */}
        {activeTab === 'tonal' && (
          <div>
            <TonalArcDesigner />
            <Card style={{ padding: 16, marginTop: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>About Tonal Arc</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <p style={{ marginBottom: 8 }}>The tonal arc is the sequence of dominant authorial tones across your story's acts. It is not the story's emotional events — it is the frame the author places around those events.</p>
                <p style={{ marginBottom: 8 }}><strong>Tone</strong> is the author's consistent attitude toward the material, expressed through every sentence-level decision: word choice, syntax, what is named and what is withheld, how violence or tenderness or absurdity is framed.</p>
                <p>Design your arc by choosing a tone for each major story point. The visual curve shows the intensity progression — higher positions indicate more intense, volatile, or incandescent tones, while lower positions represent quieter, more restrained tones.</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Character Profile ─── */
/* ─── Dynamic Character Profile Builder ─── */
const profileGradients = [
  'linear-gradient(135deg, #2dd4bf, #f472b6)',
  'linear-gradient(135deg, #818cf8, #f97316)',
  'linear-gradient(135deg, #fbbf24, #a78bfa)',
  'linear-gradient(135deg, #6ee7b7, #60a5fa)',
  'linear-gradient(135deg, #f9a8d4, #818cf8)',
  'linear-gradient(135deg, #94a3b8, #475569)',
  'linear-gradient(135deg, #f87171, #fbbf24)',
  'linear-gradient(135deg, #34d399, #818cf8)',
];
const profileColors = ['#2dd4bf', '#818cf8', '#a78bfa', '#60a5fa', '#f9a8d4', '#94a3b8', '#f87171', '#34d399'];

function buildCharacterProfiles(files) {
  const entries = Object.entries(files)
    .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions'));

  const profiles = {};
  entries.forEach(([path, content], idx) => {
    if (!content) return;
    const slug = path.replace('characters/', '').replace('.md', '');
    const lines = content.split('\n');

    // Parse name + role from first heading: "# Elena Yoder (Protagonist)"
    const h1 = lines.find(l => l.startsWith('# '));
    let fullName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    let role = 'Supporting';
    let type = '';
    if (h1) {
      // Strip trailing dash-separated suffixes like " — Character Decomposition" before parsing
      const h1Clean = h1.replace(/\s*[—–]+\s*(Character Decomposition|Literary Analy\w+|Deep Character Extraction|Character Extraction|Character Census).*$/i, '');
      const hMatch = h1Clean.match(/^#{1,3}\s+(.+?)(?:\s*\(([^)]+)\))?\s*$/);
      if (hMatch) {
        fullName = hMatch[1].trim();
        const roleStr = (hMatch[2] || '').trim();
        if (roleStr) {
          type = roleStr;
          const rl = roleStr.toLowerCase();
          if (rl.includes('protagonist') && !rl.includes('antagonist')) role = 'Protagonist';
          else if (rl.includes('deuteragonist') || rl.includes('antihero')) role = 'Deuteragonist';
          else if (rl.includes('antagonist')) role = 'Antagonist';
          else if (rl.includes('confidante') || rl.includes('foil')) role = 'Supporting';
          else if (rl.includes('supporting')) role = 'Supporting';
          else if (rl.includes('minor') || rl.includes('authority')) role = 'Minor';
          else role = roleStr;
        }
      }
    }

    // Parse sections by heading (## and ###)
    const sections = {};
    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('### ') || line.startsWith('## ')) {
        currentSection = line.replace(/^#{2,3}\s+/, '').trim().toLowerCase();
        sections[currentSection] = '';
      } else if (currentSection) {
        sections[currentSection] += (sections[currentSection] ? '\n' : '') + line;
      }
    }

    // Helper: extract a bold field value from section content "- **Field**: value"
    const extractField = (sectionContent, fieldName) => {
      if (!sectionContent) return null;
      const regex = new RegExp(`\\*\\*${fieldName}\\*\\*\\s*:\\s*(.+)`, 'i');
      const match = sectionContent.match(regex);
      return match ? match[1].trim() : null;
    };

    // Helper: extract bold field from ANY section
    const extractFieldFromAll = (fieldName) => {
      for (const sectionContent of Object.values(sections)) {
        const val = extractField(sectionContent, fieldName);
        if (val) return val;
      }
      return null;
    };

    // Clean section text — strip markdown bold/italic markers
    const clean = (s) => (s || '').trim().replace(/^\n+|\n+$/g, '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1').replace(/\*([^*]+)\*/g, '$1');

    // Determine tier from content fields or keywords
    const tierField = extractFieldFromAll('Tier');
    const lower = content.toLowerCase();
    let tier;
    if (tierField) {
      const tf = tierField.toLowerCase();
      if (tf.includes('societal') || tf.includes('society')) tier = 'societal';
      else if (tf.includes('collective')) tier = 'collective';
      else if (tf.includes('minor') || tf.includes('extra') || tf.includes('mentioned')) tier = 'minor';
      else tier = 'main';
    } else {
      const isSocietalOrCollective = lower.includes('(society)') || lower.includes('(collective)') || lower.includes('tier: societal') || lower.includes('tier: collective');
      const isMinor = (lower.includes('minor') && !lower.includes('minor antagonist')) || lower.includes('extra') || lower.includes('mentioned');
      const isMain = ['protagonist', 'deuteragonist', 'main character', 'supporting', 'confidante', 'foil', 'antihero', 'antagonist']
        .some(k => lower.includes(k)) || ['Protagonist', 'Deuteragonist', 'Supporting', 'Antagonist'].includes(role);
      tier = isSocietalOrCollective ? (lower.includes('society') || lower.includes('societal') ? 'societal' : 'collective') : (isMinor ? 'minor' : (isMain ? 'main' : 'minor'));
    }

    // Extract MBTI from content — check field format first, then loose match
    const mbtiField = extractFieldFromAll('MBTI Type') || extractFieldFromAll('MBTI');
    const mbtiMatch = mbtiField ? mbtiField.match(/([A-Z]{4})/i) : content.match(/MBTI[:\s]*([A-Z]{4}(?:-[A-Z])?)/i);
    const mbti = mbtiMatch ? mbtiMatch[1].toUpperCase() : null;

    // Extract Enneagram
    const enneagramField = extractFieldFromAll('Enneagram');
    const enneaMatch = enneagramField ? enneagramField.match(/(\d)w(\d)/i) : content.match(/(\d)w(\d)/i);
    const enneagramWing = enneaMatch ? `${enneaMatch[1]}w${enneaMatch[2]}` : null;
    const enneagram = enneagramField ? clean(enneagramField) : null;

    // Extract Moral Alignment
    const alignmentField = extractFieldFromAll('Moral Alignment');
    const alignment = alignmentField ? alignmentField.replace(/\[.*?\]/g, '').trim() : null;

    // Extract Emotional Register
    const emotionalRegister = extractFieldFromAll('Emotional Register') || clean(sections['emotional register']) || null;

    // Extract Age
    const ageField = extractFieldFromAll('Age Range') || extractFieldFromAll('Age');
    const ageMatch = ageField ? ageField.match(/(\d+)/) : (sections['profile'] || '').match(/Age\s+(\d+)/i);
    const age = ageField ? ageField.replace(/\[.*?\]/g, '').trim() : (ageMatch ? ageMatch[1] : null);

    // Extract Physical Description fields
    const physSection = sections['physical description'] || sections['profile'] || '';
    const build = extractField(physSection, 'Build.*?(?:\\/.*?)?Type') || extractFieldFromAll('Build');
    const height = extractField(physSection, 'Height');
    const hairColor = extractField(physSection, 'Hair');
    const eyeColor = extractField(physSection, 'Eyes');
    const skinTone = extractField(physSection, 'Skin');
    const distinguishingFeatures = extractField(physSection, 'Distinguishing Features');
    const posture = extractField(physSection, 'Posture.*?Movement') || extractFieldFromAll('Posture');
    const style = extractField(physSection, 'Style.*?Presentation') || extractFieldFromAll('Style');

    // Extract Wound / Flaw / Virtue — try field format first, then legacy section format
    const wfvSection = sections['wound, flaw & virtue'] || sections['wound flaw & virtue'] || '';
    const wound = extractFieldFromAll('Core Wound') || extractField(wfvSection, 'Wound') || clean(sections['wound']) || null;
    const flaw = extractFieldFromAll('Core Flaw') || extractField(wfvSection, 'Flaw') || clean(sections['flaw']) || null;
    const virtue = extractFieldFromAll('Core Virtue') || extractField(wfvSection, 'Virtue') || clean(sections['virtue']) || null;

    // Extract Want / Need / Arc
    const want = extractFieldFromAll('Want');
    const need = extractFieldFromAll('Need');
    const arcField = extractFieldFromAll('Arc') || clean(sections['arc']) || clean(sections['motivations & arc']) || null;

    // Extract Attachment Style
    const attachmentStyle = extractFieldFromAll('Attachment Style');

    // Extract Values & Code
    const coreValues = extractFieldFromAll('Core Values');
    const personalCode = extractFieldFromAll('Personal Code');
    const selfCare = extractFieldFromAll('Self-Care Mechanism') || extractFieldFromAll('Self-Care');

    // Extract Life Philosophy
    const lifePhilosophy = extractFieldFromAll('Life Philosophy');

    // Extract Voice Fingerprint fields
    const voiceSection = sections['voice fingerprint'] || sections['voice'] || '';
    const voiceData = {
      speechRhythm: extractField(voiceSection, 'Speech Rhythm') || null,
      vocabularyRegister: extractField(voiceSection, 'Vocabulary Register') || null,
      volumePacing: extractField(voiceSection, 'Volume.*?Pacing') || extractField(voiceSection, 'Volume') || null,
      dialogueTic: extractField(voiceSection, 'Dialogue Tic') || null,
      metaphorFamily: extractField(voiceSection, 'Metaphor Family') || null,
      defensiveSpeech: extractField(voiceSection, 'Defensive Speech.*?Pattern') || extractField(voiceSection, 'Defensive Speech') || null,
      subtextDefault: extractField(voiceSection, 'Subtext Default') || extractFieldFromAll('Subtext Default') || null,
      summary: clean(voiceSection) || null,
    };
    const hasVoiceData = Object.values(voiceData).some(v => v);

    // Extract Society-specific fields (for societal characters)
    const societyCost = extractFieldFromAll('Cost');
    const societyEnforcement = extractFieldFromAll('Enforcement');
    const societyBlindSpot = extractFieldFromAll('What It Cannot See');

    // Extract Collective-specific fields
    const collectiveVoice = extractFieldFromAll('Collective Voice');
    const composition = extractFieldFromAll('Composition');
    const powerDynamic = extractFieldFromAll('Power Dynamic');

    // Get physical description summary
    const profileText = clean(sections['profile'] || sections['physical description'] || physSection || '');
    const profileLines = profileText.split('\n').filter(l => !l.match(/^(Role|Tier|Type):/i) && l.trim());
    const profileNarrative = profileLines.join(' ').trim();
    const profileSummary = profileNarrative ? profileNarrative.split('.').slice(0, 2).join('.').trim() : '';

    // Build the key name — use slug-derived name to match CastRoster
    const shortName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    profiles[shortName] = {
      name: fullName,
      role,
      type: type || role,
      tier,
      color: profileColors[idx % profileColors.length],
      gradient: profileGradients[idx % profileGradients.length],
      // Identity
      age: age || null,
      // Physical Description
      physicalDescription: profileSummary || null,
      backstory: profileNarrative || null,
      build: build || null,
      height: height || null,
      hairColor: hairColor || null,
      eyeColor: eyeColor || null,
      skinTone: skinTone || null,
      distinguishingFeatures: distinguishingFeatures || null,
      posture: posture || null,
      style: style || null,
      // Personality
      mbti: mbti || null,
      enneagramWing: enneagramWing || null,
      enneagram: enneagram || null,
      alignment: alignment || null,
      emotionalRegister: emotionalRegister || null,
      lifePhilosophy: lifePhilosophy || null,
      // Wound / Flaw / Virtue
      wound: wound || null,
      flaw: flaw || null,
      virtue: virtue || null,
      // Motivations
      want: want || null,
      need: need || null,
      arc: arcField || null,
      attachmentStyle: attachmentStyle || null,
      // Values & Code
      coreValues: coreValues || null,
      personalCode: personalCode || null,
      selfCare: selfCare || null,
      // Voice
      voice: hasVoiceData ? voiceData : (sections['voice'] ? { summary: clean(sections['voice']) } : null),
      // Society / Collective fields
      societyCost: societyCost || null,
      societyEnforcement: societyEnforcement || null,
      societyBlindSpot: societyBlindSpot || null,
      collectiveVoice: collectiveVoice || null,
      composition: composition || null,
      powerDynamic: powerDynamic || null,
      // Legacy fields
      somaticSignature: clean(sections['somatic signature']) || null,
      complexity: clean(sections['complexity']) || null,
      roleInStory: clean(sections['role in story']) || null,
      relationshipToNarrator: clean(sections['relationship to narrator']) || null,
    };
  });

  return profiles;
}

// NOTE: Legacy hardcoded characterProfiles removed — all character data now built dynamically
// via buildCharacterProfiles(files) from the Zustand store's character markdown files.

function CharacterProfile({ characterName, onBack, onViewArc, onViewRelationships }) {
  // Build dynamic profiles from store files, merge with legacy for any extra fields
  const cpProfileFiles = useProjectStore(s => s.files);
  const characterProfiles = buildCharacterProfiles(cpProfileFiles);
  const [activeTab, setActiveTab] = useState('overview');
  const [zoomedChart, setZoomedChart] = useState(null); // { data, labels, colors, title }

  // Build timeline data for arc intensity lookup
  const cpFiles = useProjectStore(s => s.files);
  const { characters: cpTimelineCharacters } = buildTimelineData(cpFiles);

  // ESC key to close zoom modal
  useEffect(() => {
    if (!zoomedChart) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setZoomedChart(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [zoomedChart]);

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

  // Radar chart SVG renderer (reusable for inline + zoom modal)
  const renderRadarSvg = (data, labels, colors, size) => {
    const margin = size >= 400 ? 50 : size >= 300 ? 42 : 30;
    const cx = size / 2, cy = size / 2, r = size / 2 - margin;
    const keys = Object.keys(data);
    const n = keys.length;
    if (n < 3) return null;
    const angleStep = (Math.PI * 2) / n;
    const getPoint = (i, val, maxVal = 10) => {
      const angle = (i * angleStep) - Math.PI / 2;
      return { x: cx + (val / maxVal) * r * Math.cos(angle), y: cy + (val / maxVal) * r * Math.sin(angle) };
    };
    const rings = [0.25, 0.5, 0.75, 1];
    const fontSize = size >= 400 ? 14 : size >= 300 ? 10 : 8;
    const labelOffset = size >= 400 ? 28 : size >= 300 ? 22 : 18;
    const dotR = size >= 400 ? 5 : size >= 300 ? 4 : 3;
    const strokeW = size >= 400 ? 2 : 1.5;
    const scoreFontSize = size >= 400 ? 13 : 0;
    return (
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
          const labelX = cx + (r + labelOffset) * Math.cos(angle);
          const labelY = cy + (r + labelOffset) * Math.sin(angle);
          return (
            <g key={k}>
              <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle"
                fill={colors || char.color} fontSize={fontSize} fontWeight={500}>{labels?.[k] || k}</text>
            </g>
          );
        })}
        <polygon
          points={keys.map((k, i) => { const p = getPoint(i, data[k]); return `${p.x},${p.y}`; }).join(' ')}
          fill={char.color} fillOpacity={0.2} stroke={char.color} strokeWidth={strokeW}
        />
        {keys.map((k, i) => {
          const p = getPoint(i, data[k]);
          return <circle key={k} cx={p.x} cy={p.y} r={dotR} fill={char.color} />;
        })}
        {/* Score labels on dots (zoomed only) */}
        {size >= 400 && keys.map((k, i) => {
          const p = getPoint(i, data[k]);
          return <text key={`v-${k}`} x={p.x} y={p.y - 12} textAnchor="middle" fill={char.color} fontSize={scoreFontSize} fontWeight={700}>{data[k]}</text>;
        })}
      </svg>
    );
  };

  // Inline radar with zoom button
  const renderRadar = (data, labels, colors, title, size = 220) => {
    const keys = Object.keys(data);
    if (keys.length < 3) return null;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h4>
          <button
            onClick={() => setZoomedChart({ data, labels, colors, title })}
            title="Expand chart"
            style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
              cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 3,
              fontSize: '0.65rem', transition: 'var(--transition)', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <Eye size={12} /> Zoom
          </button>
        </div>
        <div style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }} onClick={() => setZoomedChart({ data, labels, colors, title })}>
          {renderRadarSvg(data, labels, colors, size)}
        </div>
      </div>
    );
  };

  const sectionStyle = { marginBottom: 20 };
  const labelStyle = { fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 };
  const valueStyle = { fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 };
  const gridRowStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 };
  const attrCard = (label, value, accent) => (
    <div style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ ...valueStyle, color: accent || 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ padding: 24, animation: 'fadeIn 0.3s ease', height: '100%', overflowY: 'auto' }}>
      {/* ── Zoom Modal Overlay ── */}
      {zoomedChart && (
        <div
          onClick={() => setZoomedChart(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            overflowY: 'auto',
            padding: '24px 16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 32,
              width: '90vw', maxWidth: 520, animation: 'fadeIn 0.25s ease',
              position: 'relative',
              margin: '0 auto',
            }}
          >
            {/* Top bar: Title + Close X */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--text-muted)', flex: 1, textAlign: 'center',
              }}>
                {zoomedChart.title}
              </h3>
              <button
                onClick={() => setZoomedChart(null)}
                title="Close"
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: '50%', color: 'var(--text-muted)',
                  cursor: 'pointer', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'var(--transition)', flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Zoomed chart — responsive size */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {renderRadarSvg(zoomedChart.data, zoomedChart.labels, zoomedChart.colors, 420)}
            </div>

            {/* Score breakdown */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
              marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)',
            }}>
              {Object.entries(zoomedChart.data).map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 100,
                  background: 'var(--bg-tertiary)', fontSize: '0.75rem',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{zoomedChart.labels?.[k] || k}</span>
                  <span style={{ fontWeight: 700, color: char.color }}>{v}/10</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

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
            {char.swot && (
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
                    {(char.swot[s.key] || []).map((item, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 3, paddingLeft: 8, borderLeft: `2px solid ${s.color}30` }}>
                        {item}
                      </div>
                    ))}
                  </Card>
                ))}
              </div>
            </div>
            )}
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
        <div style={{ width: '100%' }}>
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

          {char.storyDeath && (
            <Card style={{ padding: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ ...labelStyle, color: '#ef4444' }}>Story Death</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{char.storyDeath}</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* MBTI Card */}
          {char.mbti ? (
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
          ) : (
          <Card style={{ padding: 20, textAlign: 'center' }}>
            <Brain size={22} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>MBTI not defined for this character.</p>
          </Card>
          )}

          {/* Enneagram Card */}
          {char.enneagramWing ? (
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
          ) : (
          <Card style={{ padding: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Enneagram not defined for this character.</p>
          </Card>
          )}

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
        <div style={{ width: '100%' }}>
          <Card style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, var(--accent-glow) 0%, var(--bg-secondary) 100%)' }}>
            <h3 style={{ ...labelStyle, color: 'var(--accent)' }}>Voice Fingerprint</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Derived from {char.mbti} + {char.enneagramWing} + wound ({char.wound?.split(' — ')[0] || char.wound})
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
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
        <div style={{ width: '100%' }}>
          <div style={gridRowStyle}>
            {attrCard('Arc Type', char.arcType, char.color)}
            {attrCard('Story Role', `${char.role} — ${char.type}`)}
          </div>

          {(char.arcStart || char.arcEnd) && (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={labelStyle}>Arc Journey</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '6px 10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{char.arcStart || '—'}</div>
              <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, var(--text-muted) 0%, ${char.color} 100%)` }} />
              <div style={{ padding: '6px 10px', background: `${char.color}15`, borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: char.color, fontWeight: 600 }}>{char.arcEnd || '—'}</div>
            </div>
          </Card>
          )}

          {/* Beat-by-beat timeline */}
          {char.beats && char.beats.length > 0 && (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={labelStyle}>Chapter Beats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {char.beats.map((beat, i) => {
                const tc = cpTimelineCharacters.find(c => c.name === characterName);
                const intensity = tc ? tc.arc[i] : 5;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 40, flexShrink: 0 }}>Ch {i + 1}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${intensity * 10}%`, height: '100%', borderRadius: 3, background: char.color, opacity: 0.4 + (intensity / 10) * 0.6, transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: '1 1 100px', minWidth: 0 }}>{beat}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 20, textAlign: 'right' }}>{intensity}</span>
                  </div>
                );
              })}
            </div>
          </Card>
          )}

          {/* Relationships quick list */}
          {char.relationships && char.relationships.length > 0 && (
          <Card style={{ padding: 16 }}>
            <h3 style={labelStyle}>Key Relationships</h3>
            {char.relationships.map((rel, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < char.relationships.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: (characterProfiles[rel.name]?.gradient || 'var(--bg-tertiary)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#000', flexShrink: 0 }}>
                  {rel.name[0]}
                </div>
                <div style={{ flex: '1 1 120px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{rel.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>{rel.type}</span>
                </div>
                <div style={{ textAlign: 'right', flex: '0 1 auto' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rel.dynamic}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Attachment: {rel.attachment}</div>
                </div>
              </div>
            ))}
          </Card>
          )}
        </div>
      )}

      {/* ── Analysis Tab (Radar Charts) ── */}
      {activeTab === 'radar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Attribute Scores — top */}
          {char.strengths && (
            <Card style={{ padding: 20 }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Attribute Scores</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {Object.entries(char.strengths).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 70, flexShrink: 0, textTransform: 'capitalize' }}>{k}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${v * 10}%`, height: '100%', borderRadius: 4, background: char.color, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: char.color, width: 20 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Radar charts — side by side, each 50% */}
          <div style={{ display: 'grid', gridTemplateColumns: char.temperament ? '1fr 1fr' : '1fr', gap: 16 }}>
            {char.strengths && (
              <Card style={{ padding: 20 }}>
                {renderRadar(char.strengths, {
                  emotional: 'Emotional', analytical: 'Analytical', social: 'Social', physical: 'Physical',
                  creative: 'Creative', resilience: 'Resilience', intuition: 'Intuition', leadership: 'Leadership',
                }, null, 'Strengths & Capabilities', 340)}
              </Card>
            )}
            {char.temperament && (
              <Card style={{ padding: 20 }}>
                {renderRadar(char.temperament, {
                  openness: 'Openness', conscientiousness: 'Conscientiousness', extraversion: 'Extraversion',
                  agreeableness: 'Agreeableness', neuroticism: 'Neuroticism',
                }, '#a78bfa', 'Big Five Temperament', 340)}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Import Mode ─── */
function ImportMode({ updateFile, activeProject }) {
  const [importedFiles, setImportedFiles] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState('select');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const acceptedFormats = ['.md', '.txt', '.docx', '.fountain', '.pdf'];

  const handleFiles = async (fileList) => {
    const results = [];
    for (const file of fileList) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!acceptedFormats.includes('.' + ext)) continue;
      try {
        let text = '';
        if (ext === 'pdf') text = `[PDF file detected: ${file.name} - import not yet fully implemented]`;
        else if (ext === 'docx') text = `[DOCX file detected: ${file.name} - import not yet fully implemented]`;
        else text = await file.text();
        results.push({ name: file.name, content: text, size: file.size, ext });
      } catch (error) { console.error('Error reading file:', error); }
    }
    if (results.length > 0) { setImportedFiles(results); setImportMode('confirm'); }
  };

  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleFileInputChange = (e) => { if (e.target.files) handleFiles(e.target.files); };

  const handleImport = async () => {
    setImporting(true);
    setImportMode('importing');
    try {
      for (const f of importedFiles) {
        const baseName = f.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').toLowerCase();
        const path = `imported/${baseName}.md`;
        await updateFile(path, f.content);
      }
      setImporting(false);
      setImportMode('select');
      setImportedFiles([]);
    } catch (error) {
      console.error('Import error:', error);
      setImporting(false);
      setImportMode('confirm');
    }
  };

  const handleReset = () => { setImportedFiles([]); setImportMode('select'); };

  if (importMode === 'select') {
    return (
      <div style={{ padding: 40, textAlign: 'center', animation: 'fadeIn 0.3s ease', maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Upload size={48} color="var(--accent)" style={{ marginBottom: 24, opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Import Manuscript</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6, fontSize: '0.95rem' }}>Upload an existing manuscript to add it to your project. Supported formats: Markdown, Text, Word, Fountain, PDF.</p>
        <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: 48, border: '2px dashed var(--border)', borderRadius: 8, backgroundColor: 'var(--bg-card)', cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: 24 }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}>
          <FileText size={32} color="var(--text-muted)" style={{ marginBottom: 12, opacity: 0.6 }} />
          <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 4 }}>Drag files here to import</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>or click to browse</p>
        </div>
        <input ref={fileInputRef} type="file" multiple accept={acceptedFormats.join(',')} onChange={handleFileInputChange} style={{ display: 'none' }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>Supported: {acceptedFormats.join(', ')}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => navigate('/workspace')}>Cancel</Button>
        </div>
      </div>
    );
  }

  if (importMode === 'confirm') {
    return (
      <div style={{ padding: 40, animation: 'fadeIn 0.3s ease', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 24 }}>Review Files to Import</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {importedFiles.map((f, idx) => (
            <div key={idx} style={{ padding: 16, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={20} color="var(--accent)" />
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontWeight: 500, marginBottom: 4 }}>{f.name}</p><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{(f.size / 1024).toFixed(1)} KB</p></div>
              <div style={{ fontSize: '0.8rem', padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 4 }}>{f.ext.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: 16, backgroundColor: 'rgba(var(--accent-rgb), 0.05)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 32, fontSize: '0.9rem', lineHeight: 1.6 }}>
          <p style={{ marginBottom: 8 }}>Files will be imported to your project's <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 3 }}>imported/</code> folder.</p>
          <p>You can review, edit, and organize them within the project after import.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button variant="secondary" onClick={handleReset} disabled={importing}>Back</Button>
          <Button variant="primary" onClick={handleImport} disabled={importing}>{importing ? 'Importing...' : 'Import Files'}</Button>
        </div>
      </div>
    );
  }

  if (importMode === 'importing') {
    return (
      <div style={{ padding: 40, textAlign: 'center', animation: 'fadeIn 0.3s ease', maxWidth: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 48, height: 48, marginBottom: 24, animation: 'spin 1s linear infinite' }}><Upload size={48} color="var(--accent)" /></div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12 }}>Importing Files</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Please wait while your files are imported...</p>
      </div>
    );
  }

  return null;
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
  3: '#2dd4bf', // World — teal
  4: '#f472b6', // Characters — pink
  5: '#f9a8d4', // Relationships — rose
  6: '#fbbf24', // Story Foundation — amber
  7: '#60a5fa', // Quality Control — blue
  8: '#f97316', // Chapter Execution — orange
  9: '#4ade80', // Editor — green
};

const phaseNames = {
  1: 'Phase 1 — Author',
  2: 'Phase 2 — Narrator',
  3: 'Phase 3 — World',
  4: 'Phase 4 — Characters',
  5: 'Phase 5 — Relationships',
  6: 'Phase 6 — Story Foundation',
  7: 'Phase 7 — Quality Control',
  8: 'Phase 8 — Chapter Execution',
  9: 'Phase 9 — Editor',
};

function BottomStatusBar({ currentPhase, wordCount, wordLimit, onPhaseClick, onOverLimitClick, isDecomposed, healthRevealed, projectMeta }) {
  const pColor = phaseColors[currentPhase] || 'var(--text-muted)';
  const pName = phaseNames[currentPhase] || `Phase ${currentPhase}`;
  const fmtCount = wordCount.toLocaleString();

  // For decomposed projects: only show limit/color when user has opted in to health scores
  const showLimit = !isDecomposed || healthRevealed;
  const isOver = showLimit && wordCount > wordLimit;
  const fmtLimit = wordLimit.toLocaleString();

  // Build dynamic project descriptor from metadata
  const mediumDef = (STORY_MEDIUMS || []).find(m => m.key === projectMeta?.medium);
  const mediumLabel = mediumDef?.label || projectMeta?.medium || '';
  const ratingLabel = projectMeta?.contentRating || '';
  const genreLabel = [projectMeta?.genre, projectMeta?.secondaryGenre].filter(Boolean).join(' + ');
  const descriptorParts = [
    mediumLabel + (ratingLabel ? ` (${ratingLabel})` : ''),
    genreLabel,
  ].filter(Boolean);
  const descriptor = descriptorParts.join(' · ');

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

      {/* Word Count — shows limit only when appropriate */}
      {isOver ? (
        <span
          onClick={onOverLimitClick}
          style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          title="Over word limit — click for help trimming"
        >
          <AlertTriangle size={11} />
          {fmtCount} / {fmtLimit} words (+{(wordCount - wordLimit).toLocaleString()} over)
        </span>
      ) : showLimit ? (
        <span>{fmtCount} / {fmtLimit} words</span>
      ) : (
        <span>{fmtCount} words</span>
      )}

      <span style={{ color: 'var(--border)' }}>|</span>
      <span>Auto-saved</span>
      <div style={{ flex: 1 }} />
      {descriptor && <span>{descriptor}</span>}
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
  amber: {
    name: 'Amber', preview: '#0f1117',
    vars: { '--bg-primary': '#0f1117', '--bg-secondary': '#1a1d27', '--bg-tertiary': '#242836', '--bg-card': '#1e2230', '--bg-hover': '#2a2f3f', '--bg-active': '#323850', '--text-primary': '#e8eaed', '--text-secondary': '#9aa0b0', '--text-muted': '#6b7280', '--accent': '#f0a050', '--accent-hover': '#e08840', '--accent-subtle': 'rgba(240,160,80,0.08)', '--accent-glow': 'rgba(240,160,80,0.15)', '--accent-muted': 'rgba(240,160,80,0.7)', '--accent-border': 'rgba(240,160,80,0.25)', '--accent-focus': 'rgba(240,160,80,0.45)', '--accent-tint': 'rgba(240,160,80,0.1)', '--accent-btn-text': '#000', '--border': '#2a2f3f', '--editor-bg': '#0d0f14', '--editor-gutter': '#0a0c10', '--editor-text': '#c9d1d9', '--editor-minimap': 'rgba(201,209,217,0.15)' },
  },
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
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [selectedScope, setSelectedScope] = useState(0);
  const [exporting, setExporting] = useState(false);
  const projectFiles = useProjectStore(s => s.files);
  const activeProject = useProjectStore(s => s.activeProject);

  const formats = [
    { label: 'Markdown (.md)', desc: 'Plain text with formatting — works everywhere', icon: FileText, key: 'markdown' },
    { label: 'Word Document (.docx)', desc: 'Microsoft Word format with styles', icon: FileText, key: 'docx' },
    { label: 'PDF (.pdf)', desc: 'Print-ready document with layout', icon: FileText, key: 'pdf' },
    { label: 'EPUB (.epub)', desc: 'E-reader format for Kindle, Apple Books, etc.', icon: BookOpen, key: 'epub' },
    { label: 'Fountain (.fountain)', desc: 'Screenplay format for Final Draft, Highland', icon: FileText, key: 'fountain' },
    { label: 'JSON Bundle', desc: 'Full project data for backup or migration', icon: Download, key: 'json' },
    { label: 'ZIP Archive', desc: 'All project files in a compressed folder', icon: Download, key: 'zip' },
  ];
  const scopes = ['Full Project', 'Current Chapter', 'Characters Only', 'World Building Only'];

  const handleExport = async () => {
    if (!activeProject || !projectFiles) return;
    setExporting(true);
    try {
      const title = activeProject.title || 'Untitled';
      const fmt = formats[selectedFormat].key;
      const { downloadFile } = await import('../services/exportEngine.js');

      if (fmt === 'markdown') {
        const { exportAsMarkdown } = await import('../services/exportEngine.js');
        const md = exportAsMarkdown(projectFiles, title);
        downloadFile(md, `${title}.md`, 'text/markdown');
      } else if (fmt === 'docx') {
        const { exportAsDocx } = await import('../services/exportEngine.js');
        const blob = await exportAsDocx(projectFiles, title);
        downloadFile(blob, `${title}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } else if (fmt === 'pdf') {
        const { exportAsPdf } = await import('../services/exportEngine.js');
        const blob = await exportAsPdf(projectFiles, title);
        downloadFile(blob, `${title}.pdf`, 'application/pdf');
      } else if (fmt === 'epub') {
        const { exportAsEpub } = await import('../services/exportEngine.js');
        const blob = await exportAsEpub(projectFiles, title);
        downloadFile(blob, `${title}.epub`, 'application/epub+zip');
      } else if (fmt === 'fountain') {
        const { exportAsFountain } = await import('../services/exportEngine.js');
        const text = exportAsFountain(projectFiles, title);
        downloadFile(text, `${title}.fountain`, 'text/plain');
      } else if (fmt === 'json') {
        const { exportAsJSON } = await import('../services/exportEngine.js');
        const json = exportAsJSON(activeProject, projectFiles);
        downloadFile(json, `${title}.json`, 'application/json');
      } else if (fmt === 'zip') {
        const { exportAsZip } = await import('../services/exportEngine.js');
        const blob = await exportAsZip(projectFiles, title);
        downloadFile(blob, `${title}.zip`, 'application/zip');
      }
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Export Project</h3>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Format</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, maxHeight: 280, overflowY: 'auto' }}>
        {formats.map((f, i) => (
          <div key={i} onClick={() => setSelectedFormat(i)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: selectedFormat === i ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
            border: selectedFormat === i ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            transition: 'var(--transition)',
          }}>
            <f.icon size={16} color={selectedFormat === i ? 'var(--accent)' : 'var(--text-muted)'} />
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
          <Badge key={s} variant={selectedScope === i ? 'accent' : 'muted'} style={{ cursor: 'pointer', padding: '4px 10px' }} onClick={() => setSelectedScope(i)}>{s}</Badge>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleExport} disabled={exporting}>
          <Download size={14} style={{ marginRight: 4 }} /> {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </ModalOverlay>
  );
}

/* ─── Redecompose Modal ─── */
const REDECOMPOSE_GROUPS = [
  {
    label: 'Author & Narrator',
    description: 'Writing voice, style, and narrative perspective',
    steps: ['author', 'narrator'],
    files: ['author.md', 'narrator.md'],
    icon: '✍️',
  },
  {
    label: 'World Building',
    description: 'Setting, world rules, hallmarks, and world questions',
    steps: ['world', 'world-detail'],
    files: ['world/world-building.md', 'world/hallmarks.md', 'world/questions-answered.md'],
    icon: '🌍',
  },
  {
    label: 'Characters',
    description: 'All character profiles and cast-level questions',
    steps: ['characters', 'characters-detail'],
    files: ['characters/*.md', 'characters/questions-answered.md'],
    icon: '👥',
  },
  {
    label: 'Relationships',
    description: 'Character relationships and the relationship graph',
    steps: ['relationships', 'relationships-detail'],
    files: ['relationships/questions-answered.md', 'relationships/relationship-graph.csv'],
    icon: '🔗',
  },
  {
    label: 'Story Structure',
    description: 'Plot outline, story arc, abstract, and story questions',
    steps: ['structure', 'story-detail'],
    files: ['outline.md', 'story/story-structure.md', 'story/questions-answered.md', 'abstract.md'],
    icon: '📐',
  },
  {
    label: 'Structural Review',
    description: 'Full structural audit of the manuscript',
    steps: ['review'],
    files: ['dry-run-audit.md'],
    icon: '🔍',
  },
  {
    label: 'Chapter Split',
    description: 'Re-split the manuscript into chapters/sections',
    steps: ['chapters'],
    files: ['story/chapter-*.md'],
    icon: '📖',
  },
];

/* ─── Enrich Project Groups ─── */
const ENRICH_GROUPS = [
  {
    key: 'characters',
    label: 'Enrich Characters',
    description: 'Fill missing fields on existing characters (tier, voice notes, stream A/B, network role, etc.). Preserves everything you wrote.',
    icon: '🎭',
    outputs: ['characters/*.md (updated in-place)'],
  },
  {
    key: 'hallmarks',
    label: 'World Hallmarks',
    description: 'Generate 5-15 signature details that make your world feel real and lived-in (recurring sensory details, cultural rituals, etc.).',
    icon: '🌍',
    outputs: ['world/hallmarks.md'],
  },
  {
    key: 'relationships',
    label: 'Relationship Map (CSV)',
    description: 'Build an asymmetric perception matrix: how each character sees every other character, in one sentence each.',
    icon: '🔗',
    outputs: ['relationships/relationship-graph.csv'],
  },
  {
    key: 'storyDna',
    label: 'Story DNA Analysis',
    description: 'Theme-as-Question, planted/paid-off threads, author voice fingerprint, and deep narrator analysis.',
    icon: '🧬',
    outputs: ['story/questions-answered.md', 'author.md (appended)', 'narrator.md (appended)'],
  },
];

/* ─── Enrich Project Modal ─── */
function EnrichProjectModal({ onClose, projectFiles, projectMeta }) {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const sendMessage = useLlmStore(s => s.sendMessage);
  const updateFile = useProjectStore(s => s.updateFile);
  const loadProjectFiles = useProjectStore(s => s.loadProjectFiles);
  const activeProjectId = useProjectStore(s => s.activeProjectId);

  const toggleGroup = (idx) => {
    setSelectedGroups(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const selectAll = () => {
    if (selectedGroups.length === ENRICH_GROUPS.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(ENRICH_GROUPS.map((_, i) => i));
    }
  };

  // ── Gather common story context from project files ──
  const gatherStoryContext = () => {
    const parts = [];
    if (projectFiles['author.md']) parts.push(`## Author Profile\n${projectFiles['author.md']}`);
    if (projectFiles['narrator.md']) parts.push(`## Narrator\n${projectFiles['narrator.md']}`);
    if (projectFiles['world-building.md']) parts.push(`## World Building\n${projectFiles['world-building.md']}`);
    if (projectFiles['outline.md']) parts.push(`## Outline\n${projectFiles['outline.md']}`);
    if (projectFiles['story/questions-answered.md']) parts.push(`## Story Analysis\n${projectFiles['story/questions-answered.md']}`);
    // Gather existing characters
    const charFiles = Object.entries(projectFiles)
      .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md'))
      .sort(([a], [b]) => a.localeCompare(b));
    if (charFiles.length > 0) {
      parts.push(`## Existing Characters\n${charFiles.map(([, c]) => c).join('\n\n---\n\n')}`);
    }
    // Gather relationship files
    const relFiles = Object.entries(projectFiles)
      .filter(([p]) => p.startsWith('relationships/') && p.endsWith('.md'))
      .sort(([a], [b]) => a.localeCompare(b));
    if (relFiles.length > 0) {
      parts.push(`## Relationships\n${relFiles.map(([, c]) => c).join('\n\n')}`);
    }
    return parts.join('\n\n');
  };

  // ── Run selected enrichments ──
  const runEnrich = async () => {
    setIsRunning(true);
    setResult(null);
    const selectedKeys = selectedGroups.map(idx => ENRICH_GROUPS[idx].key);
    const totalSteps = selectedKeys.length;
    let completedSteps = 0;
    let savedCount = 0;
    let errorMessages = [];
    const storyContext = gatherStoryContext();

    try {
      // ── 1. Enrich Characters ──
      if (selectedKeys.includes('characters')) {
        setProgress({ label: 'Enriching characters', completed: completedSteps, total: totalSteps });
        const charFiles = Object.entries(projectFiles)
          .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md'))
          .sort(([a], [b]) => a.localeCompare(b));

        if (charFiles.length === 0) {
          errorMessages.push('No character files found to enrich.');
        } else {
          const existingCharacters = charFiles.map(([, c]) => c).join('\n\n---\n\n');
          const prompt = PROMPTS.PROJECT_ENRICH_CHARACTERS.build({ existingCharacters, storyContext });
          const resp = await sendMessage({
            messages: [{ role: 'user', content: prompt }],
            role: 'system',
            maxTokens: 6000,
          });
          if (resp.success && resp.content) {
            // The prompt returns individual character blocks separated by ## headings.
            // Parse them back into individual files using the same heading-based approach.
            const sections = resp.content.replace(/^```(?:markdown|md)?\s*\n/gm, '').replace(/^```\s*$/gm, '').trim()
              .split(/^## /m).slice(1);
            for (const section of sections) {
              const lines = section.split('\n');
              const charName = lines[0].trim();
              if (!charName) continue;
              const nameForSlug = charName.replace(/\s*\(.*?\)\s*/g, '').trim();
              const safeName = (nameForSlug || charName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
              if (!safeName) continue;
              const filePath = `characters/${safeName}.md`;
              await updateFile(filePath, `## ${section}`.trim());
              savedCount++;
            }
          } else {
            errorMessages.push(`Character enrichment failed: ${resp.error || 'No response'}`);
          }
        }
        completedSteps++;
      }

      // ── 2. World Hallmarks ──
      if (selectedKeys.includes('hallmarks')) {
        setProgress({ label: 'Generating world hallmarks', completed: completedSteps, total: totalSteps });
        const worldBuilding = projectFiles['world-building.md'] || '';
        const prompt = PROMPTS.PROJECT_ENRICH_WORLD_HALLMARKS.build({ worldBuilding, storyContext });
        const resp = await sendMessage({
          messages: [{ role: 'user', content: prompt }],
          role: 'system',
          maxTokens: 4000,
        });
        if (resp.success && resp.content) {
          await updateFile('world/hallmarks.md', resp.content.replace(/^```(?:markdown|md)?\s*\n/gm, '').replace(/^```\s*$/gm, '').trim());
          savedCount++;
        } else {
          errorMessages.push(`World hallmarks failed: ${resp.error || 'No response'}`);
        }
        completedSteps++;
      }

      // ── 3. Relationship CSV ──
      if (selectedKeys.includes('relationships')) {
        setProgress({ label: 'Building relationship map', completed: completedSteps, total: totalSteps });
        const charFiles = Object.entries(projectFiles)
          .filter(([p]) => p.startsWith('characters/') && p.endsWith('.md'));
        const characters = charFiles.map(([, c]) => c).join('\n\n---\n\n');
        const relFiles = Object.entries(projectFiles)
          .filter(([p]) => p.startsWith('relationships/') && p.endsWith('.md'));
        const relationships = relFiles.map(([, c]) => c).join('\n\n');
        const prompt = PROMPTS.PROJECT_ENRICH_RELATIONSHIP_CSV.build({ characters, relationships });
        const resp = await sendMessage({
          messages: [{ role: 'user', content: prompt }],
          role: 'system',
          maxTokens: 4000,
        });
        if (resp.success && resp.content) {
          // Strip markdown fences if present
          let csv = resp.content.replace(/^```(?:csv)?\s*\n/gm, '').replace(/^```\s*$/gm, '').trim();
          await updateFile('relationships/relationship-graph.csv', csv);
          savedCount++;
        } else {
          errorMessages.push(`Relationship map failed: ${resp.error || 'No response'}`);
        }
        completedSteps++;
      }

      // ── 4. Story DNA Analysis ──
      if (selectedKeys.includes('storyDna')) {
        setProgress({ label: 'Analyzing story DNA', completed: completedSteps, total: totalSteps });
        // Gather phase answers for context
        const store = useProjectStore.getState();
        const phaseAnswers = store.phaseAnswers || {};
        const phaseAnswerStr = Object.entries(phaseAnswers)
          .filter(([, v]) => v && typeof v === 'object')
          .map(([phase, answers]) => {
            const fields = Object.entries(answers)
              .filter(([k]) => !k.startsWith('_'))
              .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
              .join('\n');
            return fields ? `### Phase ${phase}\n${fields}` : '';
          })
          .filter(Boolean)
          .join('\n\n');

        const prompt = PROMPTS.PROJECT_ENRICH_STORY_ANALYSIS.build({
          storyContext,
          phaseAnswers: phaseAnswerStr || '(No phase answers available)',
        });
        const resp = await sendMessage({
          messages: [{ role: 'user', content: prompt }],
          role: 'system',
          maxTokens: 6000,
        });
        if (resp.success && resp.content) {
          const cleaned = resp.content.replace(/^```(?:markdown|md)?\s*\n/gm, '').replace(/^```\s*$/gm, '').trim();
          const sections = cleaned.split(/---SECTION_BREAK---/);
          // Section 1: Story Questions Answered
          if (sections[0]?.trim()) {
            await updateFile('story/questions-answered.md', sections[0].trim());
            savedCount++;
          }
          // Section 2: Author Voice Fingerprint — append to author.md
          if (sections[1]?.trim()) {
            const existing = projectFiles['author.md'] || '';
            const divider = '\n\n---\n\n## Author Voice Fingerprint\n\n';
            // Replace existing fingerprint section if present, otherwise append
            const fpRegex = /\n*---\n*\n*## Author Voice Fingerprint[\s\S]*/;
            const updated = fpRegex.test(existing)
              ? existing.replace(fpRegex, divider + sections[1].trim())
              : existing + divider + sections[1].trim();
            await updateFile('author.md', updated);
            savedCount++;
          }
          // Section 3: Narrator Deep Analysis — append to narrator.md
          if (sections[2]?.trim()) {
            const existing = projectFiles['narrator.md'] || '';
            const divider = '\n\n---\n\n## Narrator Deep Analysis\n\n';
            const naRegex = /\n*---\n*\n*## Narrator Deep Analysis[\s\S]*/;
            const updated = naRegex.test(existing)
              ? existing.replace(naRegex, divider + sections[2].trim())
              : existing + divider + sections[2].trim();
            await updateFile('narrator.md', updated);
            savedCount++;
          }
        } else {
          errorMessages.push(`Story DNA analysis failed: ${resp.error || 'No response'}`);
        }
        completedSteps++;
      }

      // Reload project files
      await loadProjectFiles(activeProjectId);

      const msg = `Enriched ${savedCount} file${savedCount !== 1 ? 's' : ''}.`
        + (errorMessages.length > 0 ? ` Warnings: ${errorMessages.join('; ')}` : '');
      setResult({ success: errorMessages.length === 0, message: msg });

    } catch (err) {
      console.error('Enrich project failed:', err);
      setResult({ success: false, message: `Enrichment failed: ${err.message}` });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isRunning) onClose(); }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg, 12px)', padding: 0,
        width: 540, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Enrich Project
            </h2>
            {!isRunning && (
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.5 }}>
            Let the AI fill gaps in your project. It will <strong style={{ color: '#22c55e' }}>add</strong> missing details without overwriting anything you've already written.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={selectAll} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--accent)', padding: 0,
            }}>
              {selectedGroups.length === ENRICH_GROUPS.length ? 'Deselect All' : 'Select All'}
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {selectedGroups.length} of {ENRICH_GROUPS.length} selected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ENRICH_GROUPS.map((group, idx) => {
              const checked = selectedGroups.includes(idx);
              return (
                <div key={idx} onClick={() => !isRunning && toggleGroup(idx)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', cursor: isRunning ? 'default' : 'pointer',
                  border: checked ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: checked ? 'var(--accent-glow)' : 'transparent',
                  transition: 'all 0.15s', opacity: isRunning ? 0.6 : 1,
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: checked ? '2px solid var(--accent)' : '2px solid var(--border)',
                    background: checked ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {checked && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>&#10003;</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.75rem' }}>{group.icon}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {group.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                      {group.description}
                    </div>
                    {checked && (
                      <div style={{ fontSize: '0.65rem', color: '#22c55e', marginTop: 4, lineHeight: 1.3, fontStyle: 'italic' }}>
                        Output: {group.outputs.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          {isRunning && progress && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{progress.label}...</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Step {progress.completed + 1} of {progress.total}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{
                  width: `${((progress.completed) / progress.total) * 100}%`,
                  height: '100%', borderRadius: 2, background: 'var(--accent)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          )}

          {result && (
            <div style={{
              padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12,
              fontSize: '0.78rem', lineHeight: 1.5,
              background: result.success ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              color: result.success ? '#34d399' : '#ef4444',
              border: `1px solid ${result.success ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {result.message}
            </div>
          )}

          {selectedGroups.length > 0 && !isRunning && !result?.success && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
              marginBottom: 12, fontSize: '0.75rem', color: '#34d399', lineHeight: 1.5,
            }}>
              <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                Enrichment <strong>adds</strong> missing details to your project files. Your existing content is preserved.
                {selectedGroups.some(idx => ENRICH_GROUPS[idx].key === 'storyDna') &&
                  ' Story DNA sections will be appended to author.md and narrator.md.'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {!isRunning && (
              <Button variant="secondary" onClick={onClose} style={{ padding: '8px 20px' }}>
                {result?.success ? 'Done' : 'Cancel'}
              </Button>
            )}
            {!result?.success && (
              <Button
                variant="primary"
                onClick={runEnrich}
                disabled={selectedGroups.length === 0 || isRunning}
                style={{ padding: '8px 24px', opacity: selectedGroups.length === 0 ? 0.5 : 1 }}
              >
                {isRunning ? (
                  <><Brain size={13} style={{ marginRight: 6, animation: 'pulse 1.5s infinite' }} /> Enriching...</>
                ) : (
                  <><Brain size={13} style={{ marginRight: 6 }} /> Enrich{selectedGroups.length > 0 ? ` (${selectedGroups.length} tasks)` : ''}</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RedecomposeModal({ onClose, projectFiles, projectMeta }) {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const activeProjectId = useProjectStore(s => s.activeProjectId);

  // Elapsed time ticker
  useEffect(() => {
    if (!isRunning || !startTime) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isRunning, startTime]);

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const toggleGroup = (idx) => {
    setSelectedGroups(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const selectAll = () => {
    if (selectedGroups.length === REDECOMPOSE_GROUPS.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(REDECOMPOSE_GROUPS.map((_, i) => i));
    }
  };

  const selectedStepKeys = selectedGroups
    .flatMap(idx => REDECOMPOSE_GROUPS[idx].steps);

  const affectedFiles = selectedGroups
    .flatMap(idx => REDECOMPOSE_GROUPS[idx].files);

  const runRedecompose = async () => {
    setIsRunning(true);
    setResult(null);
    setStartTime(Date.now());
    setElapsed(0);

    try {
      // Get source text from project files
      const sourceText = projectFiles['story/full-draft.md']
        || Object.entries(projectFiles)
          .filter(([p]) => p.startsWith('story/chapter') && p.endsWith('.md'))
          .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
          .map(([, c]) => c)
          .join('\n\n');

      if (!sourceText?.trim()) {
        setResult({ success: false, message: 'Could not find the original manuscript text. Make sure story/full-draft.md or chapter files exist.' });
        setIsRunning(false);
        return;
      }

      const { redecomposeSteps } = await import('../services/decomposition');
      const { sendMessage } = useLlmStore.getState();
      const { updateFile, loadProjectFiles: loadFiles } = useProjectStore.getState();

      const { files: newFiles, metadata } = await redecomposeSteps(
        sendMessage,
        sourceText,
        selectedStepKeys,
        projectFiles,
        {
          onProgress: setProgress,
          title: projectMeta?.title,
          medium: projectMeta?.medium,
        }
      );

      // Save each new file to the project
      let savedCount = 0;
      let errorCount = 0;

      // Verify we actually got new files before touching old ones
      const newCharFiles = Object.keys(newFiles).filter(
        p => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions-answered')
      );

      // Write all new files FIRST
      for (const [filePath, content] of Object.entries(newFiles)) {
        try {
          await updateFile(filePath, content);
          savedCount++;
        } catch (e) {
          console.warn(`Failed to save ${filePath}:`, e);
          errorCount++;
        }
      }

      // THEN clean up old character files that no longer exist in the new set.
      // Only if 'characters' step was selected AND we got at least 1 new character file.
      if (selectedStepKeys.includes('characters') && newCharFiles.length > 0) {
        const oldCharFiles = Object.keys(projectFiles).filter(
          p => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions-answered')
        );
        // Only remove old files that are NOT in the new set (avoids deleting just-written files)
        const toRemove = oldCharFiles.filter(p => !newFiles[p]);
        if (toRemove.length > 0) {
          const db = (await import('../lib/db')).default;
          for (const oldPath of toRemove) {
            try {
              const record = await db.projectFiles
                .where('[projectId+path]')
                .equals([activeProjectId, oldPath])
                .first();
              if (record) await db.projectFiles.delete(record.id);
            } catch (e) {
              console.warn('Failed to remove old character file:', oldPath, e);
            }
          }
        }
      }

      // Reload project files to update UI
      await loadFiles(activeProjectId);

      const failedSteps = metadata.steps.filter(s => !s.success);
      setResult({
        success: true,
        message: `Regenerated ${savedCount} file${savedCount !== 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed to save)` : ''}.${failedSteps.length > 0 ? ` ${failedSteps.length} step(s) had errors: ${failedSteps.map(s => s.label).join(', ')}.` : ''}`,
      });
    } catch (err) {
      console.error('Redecompose failed:', err);
      setResult({ success: false, message: `Re-decomposition failed: ${err.message}` });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', animation: 'fadeIn 0.2s ease' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isRunning) onClose(); }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg, 12px)', padding: 0,
        width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Regenerate Analysis
            </h2>
            {!isRunning && (
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.5 }}>
            Select which parts of the decomposition to re-run. The AI will re-analyze your manuscript and <strong style={{ color: '#f97316' }}>overwrite</strong> the existing files for each selected category.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '12px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Select all toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button onClick={selectAll} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--accent)', padding: 0,
            }}>
              {selectedGroups.length === REDECOMPOSE_GROUPS.length ? 'Deselect All' : 'Select All'}
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {selectedGroups.length} of {REDECOMPOSE_GROUPS.length} selected
            </span>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REDECOMPOSE_GROUPS.map((group, idx) => {
              const checked = selectedGroups.includes(idx);
              return (
                <div key={idx} onClick={() => !isRunning && toggleGroup(idx)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', cursor: isRunning ? 'default' : 'pointer',
                  border: checked ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: checked ? 'var(--accent-glow)' : 'transparent',
                  transition: 'all 0.15s', opacity: isRunning ? 0.6 : 1,
                }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                    border: checked ? '2px solid var(--accent)' : '2px solid var(--border)',
                    background: checked ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {checked && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>}
                  </div>

                  {/* Label + description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.75rem' }}>{group.icon}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {group.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                      {group.description}
                    </div>
                    {checked && (
                      <div style={{ fontSize: '0.65rem', color: '#f97316', marginTop: 4, lineHeight: 1.3, fontStyle: 'italic' }}>
                        Will overwrite: {group.files.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
          {/* Progress bar with animation */}
          {isRunning && (
            <div style={{ marginBottom: 12 }}>
              {progress ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                      }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{progress.label}...</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Step {progress.completed + 1} of {progress.total}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatElapsed(elapsed)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${((progress.completed) / progress.total) * 100}%`,
                      height: '100%', borderRadius: 2, background: 'var(--accent)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting analysis...</span>
                </div>
              )}
              {selectedStepKeys.includes('characters') && elapsed > 5 && (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '8px 0 0', fontStyle: 'italic' }}>
                  Character extraction uses multiple passes to catch every character. This may take a few minutes for longer works.
                </p>
              )}
            </div>
          )}

          {/* Result message */}
          {result && (
            <div style={{
              padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12,
              fontSize: '0.78rem', lineHeight: 1.5,
              background: result.success ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)',
              color: result.success ? '#34d399' : '#ef4444',
              border: `1px solid ${result.success ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {result.message}{result.success && startTime ? ` (${formatElapsed(Math.floor((Date.now() - startTime) / 1000))})` : ''}
            </div>
          )}

          {/* Warning */}
          {selectedGroups.length > 0 && !isRunning && !result?.success && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
              marginBottom: 12, fontSize: '0.75rem', color: '#f97316', lineHeight: 1.5,
            }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                This will <strong>permanently overwrite</strong> the existing analysis for the selected categories.
                {selectedGroups.some(idx => REDECOMPOSE_GROUPS[idx].steps.includes('characters')) &&
                  ' All current character files will be replaced with freshly generated ones.'}
                {' '}Any manual edits you{"'"}ve made to these files will be lost.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {!isRunning && (
              <Button variant="secondary" onClick={onClose} style={{ padding: '8px 20px' }}>
                {result?.success ? 'Done' : 'Cancel'}
              </Button>
            )}
            {!result?.success && (
              <Button
                variant="primary"
                onClick={runRedecompose}
                disabled={selectedGroups.length === 0 || isRunning}
                style={{ padding: '8px 24px', opacity: selectedGroups.length === 0 ? 0.5 : 1 }}
              >
                {isRunning ? (
                  <><Sparkles size={13} style={{ marginRight: 6, animation: 'pulse 1.5s infinite' }} /> Regenerating...</>
                ) : (
                  <><Sparkles size={13} style={{ marginRight: 6 }} /> Regenerate {selectedGroups.length > 0 ? `(${selectedStepKeys.length} steps)` : ''}</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Keyboard Shortcuts Modal ─── */
function KeyboardShortcutsModal({ onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: 'Ctrl+,', desc: 'Settings' },
        { keys: 'Ctrl+K', desc: 'Command Palette' },
        { keys: 'Ctrl+/', desc: 'Keyboard Shortcuts' },
      ]
    },
    {
      category: 'Editor',
      items: [
        { keys: 'Ctrl+S', desc: 'Save' },
        { keys: 'Ctrl+Z', desc: 'Undo' },
        { keys: 'Ctrl+Shift+Z', desc: 'Redo' },
        { keys: 'Ctrl+B', desc: 'Bold' },
        { keys: 'Ctrl+I', desc: 'Italic' },
      ]
    },
    {
      category: 'Workspace',
      items: [
        { keys: 'Ctrl+1-9', desc: 'Switch to phase' },
        { keys: 'Ctrl+Shift+E', desc: 'Toggle file tree' },
        { keys: 'Ctrl+Shift+P', desc: 'Phase progress' },
      ]
    },
    {
      category: 'Writing',
      items: [
        { keys: 'Ctrl+Enter', desc: 'Generate / Send' },
        { keys: 'Escape', desc: 'Close modal / Cancel' },
      ]
    },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Keyboard Shortcuts</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, fontSize: '1.1rem' }}>&times;</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>
        {shortcuts.map((group) => (
          <div key={group.category}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
              {group.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.items.map((item) => (
                <div key={item.keys} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</span>
                  <span style={{
                    fontSize: '0.7rem', color: 'var(--text-muted)',
                    padding: '3px 8px', border: '1px solid var(--border)',
                    borderRadius: 4, fontFamily: 'monospace', background: 'var(--bg-tertiary)',
                  }}>{item.keys}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ModalOverlay>
  );
}

/* ─── Settings Modal ─── */
function SettingsModal({ onClose, currentTheme, onThemeChange, onGoToFullSettings }) {
  const settings = [
    { label: 'Auto-save interval', value: '30 seconds', type: 'select' },
    { label: 'Word count goal', value: '70,000', type: 'input' },
    { label: 'Show writing tips', value: true, type: 'toggle' },
    { label: 'Spell check', value: true, type: 'toggle' },
    { label: 'Dark mode', value: currentTheme !== 'daylight', type: 'toggle' },
  ];
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quick Settings</h3>
        <button
          onClick={onGoToFullSettings}
          style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-glow)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          All Settings →
        </button>
      </div>
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
      {/* LLM Provider section */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>LLM Provider</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>Anthropic (Claude)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>claude-sonnet-4</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>API Key</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>sk-...configured</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5, padding: '4px 0' }}>
          Supported: Anthropic (Claude), DeepSeek, OpenAI, Google Gemini, Ollama (local).
        </div>
      </div>
      {/* TTS section */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Text-to-Speech</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TTS Engine</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>Piper TTS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Voice</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>Amy (US English)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Speed</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>1.0x</span>
        </div>
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
  const initialAction = searchParams.get('action'); // e.g. 'add-character'
  const initialPanel = searchParams.get('panel');   // e.g. 'cast'
  const [activeMode, setActiveMode] = useState(initialMode);
  const [activeFile, setActiveFile] = useState(null); // tracks which file is open
  const [selectedCharacter, setSelectedCharacter] = useState(null); // for character profile view
  // Shared editable file contents — persists across editor/reader mode switches
  const [editedFiles, setEditedFiles] = useState({});
  const [activePhase, setActivePhase] = useState(null); // set dynamically after project loads
  const phaseInitRef = useRef(false); // tracks whether we've set initial phase for this project
  const [showGateWarning, setShowGateWarning] = useState(false); // modal for locked phases
  const [decomposedHealthRevealed, setDecomposedHealthRevealed] = useState(false); // guard for decomposed health scores
  const [showQualityWarning, setShowQualityWarning] = useState(null); // phase num that triggered quality warning
  const [showAddCharModal, setShowAddCharModal] = useState(initialAction === 'add-character');
  const [newChar, setNewChar] = useState({ name: '', role: 'Supporting', tier: 'supporting', type: '', bio: '', voiceNotes: '', avatar: null, isGenerating: false });
  // ── Project switching dirty-state detection ──
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingSwitchId, setPendingSwitchId] = useState(null);

  // Sync activeMode when URL search params change (e.g., navigating from Hub with ?mode=reader)
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam && modeParam !== activeMode) {
      setActiveMode(modeParam);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasDirtyState = () => {
    // Check local component dirty state
    if (Object.keys(editedFiles).length > 0) return true;
    if (newChar.name || newChar.bio) return true;
    // Check store dirty state (tracks unsaved file changes)
    if (storeIsDirty) return true;
    return false;
  };

  const handleProjectSwitch = async (projectId) => {
    if (hasDirtyState()) {
      setPendingSwitchId(projectId);
      setShowSwitchConfirm(true);
      return;
    }
    await performProjectSwitch(projectId);
  };

  const performProjectSwitch = async (projectId) => {
    // Reset local workspace state
    setEditedFiles({});
    setActiveFile(null);
    setActiveMode('guided');
    setActivePhase(null);
    setNewChar({ name: '', role: 'Supporting', tier: 'supporting', type: '', bio: '', voiceNotes: '', avatar: null, isGenerating: false });
    phaseInitRef.current = false; // allow re-initialization for new project
    setShowSwitchConfirm(false);
    setPendingSwitchId(null);
    // Switch to new project (automatically marks clean in setActiveProject)
    await setActiveProject(projectId);
  };

  const handleSaveAndSwitch = async () => {
    // Save any edited files before switching
    const { updateFile } = useProjectStore.getState();
    for (const [path, content] of Object.entries(editedFiles)) {
      await updateFile(path, content);
    }
    // Mark store as clean after saving all files
    markClean();
    await performProjectSwitch(pendingSwitchId);
  };
  // Phase answers — tracks user input per phase per question (hydrated from store below)
  const [phaseAnswers, setPhaseAnswers] = useState({
    1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, '⟡': {}, 8: {}, 9: {},
  });

  // Hydrate phaseAnswers from active project in the store (if available)
  const activeProject = useProjectStore(s => s.activeProject);
  const projects = useProjectStore(s => s.projects);
  const setActiveProject = useProjectStore(s => s.setActiveProject);
  const storeIsDirty = useProjectStore(s => s.isDirty);
  const markClean = useProjectStore(s => s.markClean);
  const tourCompleted = useSettingsStore(s => s.tourCompleted);

  // Redirect to hub if no active project is loaded
  useEffect(() => {
    if (!activeProject) {
      navigate('/hub', { replace: true });
    }
  }, [activeProject, navigate]);

  // Track changes in editedFiles as dirty state (for unsaved editor changes)
  useEffect(() => {
    const { setDirty } = useProjectStore.getState();
    if (Object.keys(editedFiles).length > 0) {
      setDirty(true);
    }
  }, [editedFiles]);

  // Sanitize title — strip markdown heading markers (e.g. "##### Title" → "Title")
  useEffect(() => {
    if (activeProject?.title && /^#{1,6}\s+/.test(activeProject.title)) {
      const cleanTitle = activeProject.title.replace(/^#{1,6}\s+/, '').trim();
      if (cleanTitle !== activeProject.title) {
        const updateProject = useProjectStore.getState().updateProject;
        if (updateProject) updateProject({ title: cleanTitle });
      }
    }
  }, [activeProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeProject?.phaseAnswers && Object.keys(activeProject.phaseAnswers).length > 0) {
      setPhaseAnswers(prev => {
        const merged = { ...prev };
        for (const [key, answers] of Object.entries(activeProject.phaseAnswers)) {
          merged[key] = { ...(merged[key] || {}), ...answers };
        }
        return merged;
      });
    }
  }, [activeProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hydrate decomposed phase answers from actual file content
  useEffect(() => {
    const files = useProjectStore.getState().files || {};
    const pa = activeProject?.phaseAnswers;
    if (!pa) return;
    const anyDecomposed = Object.values(pa).some(a => a?._decomposed);
    if (!anyDecomposed) return;

    // Check if already hydrated (answers are not "(Decomposed)" placeholders)
    const needsHydration = Object.values(pa).some(a =>
      a?._decomposed && Object.values(a).some(v =>
        typeof v === 'string' && (v.startsWith('(Decomposed') || v.includes('(truncated)') || v.startsWith('(Extracted from'))
      )
    );
    if (!needsHydration) return;

    // Helper to get file content by partial path match
    const getFile = (pattern) => {
      for (const [p, c] of Object.entries(files)) {
        if (typeof pattern === 'string' ? p.endsWith(pattern) || p === pattern : pattern.test(p)) {
          return c || '';
        }
      }
      return '';
    };

    // Helper to collect all files matching a pattern
    const getFiles = (pattern) => {
      const results = [];
      for (const [p, c] of Object.entries(files)) {
        if (pattern.test(p)) results.push({ path: p, content: c || '' });
      }
      return results;
    };

    const hydrated = {
      1: { _decomposed: true }, // Author
      2: { _decomposed: true }, // Narrator
      3: { _decomposed: true }, // World
      4: { _decomposed: true }, // Characters
      5: { _decomposed: true }, // Relationships
      6: { _decomposed: true }, // Story Foundation
      7: { _decomposed: true }, // Review
    };

    // Phase 1 — Author: from author.md
    const authorContent = getFile('author.md');
    if (authorContent) {
      hydrated[1][1] = authorContent;
      hydrated[1][2] = '(Extracted from manuscript — see author.md)';
      hydrated[1][3] = '(Extracted from manuscript — see author.md)';
      hydrated[1][4] = '(Extracted from manuscript — see author.md)';
    }

    // Phase 2 — Narrator: from narrator.md
    const narratorContent = getFile('narrator.md');
    if (narratorContent) {
      hydrated[2][1] = narratorContent;
      hydrated[2][2] = '(Extracted from manuscript — see narrator.md)';
      hydrated[2][3] = '(Extracted from manuscript — see narrator.md)';
    }

    // Phase 3 — World: from world/world-building.md
    const worldContent = getFile('world/world-building.md') || getFile('world-building.md');
    if (worldContent) {
      hydrated[3][1] = worldContent;
      for (let i = 2; i <= 8; i++) hydrated[3][i] = '(Extracted from manuscript — see world-building.md)';
    }

    // Phase 4 — Characters: from characters/*.md
    const charFiles = getFiles(/characters\/[^/]+\.md$/i);
    if (charFiles.length > 0) {
      const charSummary = charFiles.map(f => {
        const name = f.path.split('/').pop().replace('.md', '').replace(/-/g, ' ');
        return `### ${name}\n${f.content}`;
      }).join('\n\n---\n\n');
      hydrated[4][1] = charSummary;
      hydrated[4][2] = '(Extracted from manuscript — see character files)';
      hydrated[4][3] = '(Extracted from manuscript — see character files)';
      hydrated[4][4] = `${charFiles.length} characters extracted: ${charFiles.map(f => f.path.split('/').pop().replace('.md', '').replace(/-/g, ' ')).join(', ')}`;
    }

    // Phase 5 — Relationships: from relationships/questions-answered.md
    const relContent = getFile('relationships/questions-answered.md');
    if (relContent) {
      hydrated[5][1] = relContent;
      hydrated[5][2] = '(Extracted from manuscript — see relationships)';
    }

    // Phase 6 — Story Foundation: from outline.md and story/arc.md
    const outlineContent = getFile('outline.md');
    const arcContent = getFile('story/arc.md') || getFile('arc.md');
    if (outlineContent) hydrated[6][1] = outlineContent;
    if (arcContent) hydrated[6][2] = arcContent;
    hydrated[6][3] = '(Extracted from manuscript — see outline and arc files)';

    // Phase 7 — Review: from dry-run-audit.md
    const auditContent = getFile('dry-run-audit.md');
    if (auditContent) {
      hydrated[7][1] = auditContent;
      hydrated[7][2] = '(Extracted from manuscript — see dry-run-audit.md)';
      hydrated[7][3] = '(Extracted from manuscript — see dry-run-audit.md)';
    }

    // Update both local state and persisted store
    setPhaseAnswers(prev => {
      const merged = { ...prev };
      for (const [key, answers] of Object.entries(hydrated)) {
        merged[key] = { ...(merged[key] || {}), ...answers };
      }
      return merged;
    });

    // Persist hydrated answers to the store so they survive reloads
    const updateProject = useProjectStore.getState().updateProject;
    if (updateProject) {
      updateProject({ phaseAnswers: hydrated });
    }
  }, [activeProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute phase percentages dynamically from answers vs questions
  // Decomposed projects have all phases pre-marked as complete
  const isDecomposed = activeProject?.mode === 'decompose' ||
    activeProject?.metadata?.mode === 'decompose' ||
    Object.values(phaseAnswers).some(a => a?._decomposed);
  const phasePcts = {};
  phases.forEach(p => {
    if (isDecomposed && (phaseAnswers[p.num]?._decomposed || p.num === 8 || p.num === 9 || p.num === '⟡')) {
      phasePcts[p.num] = 100;
    } else {
      const qs = phaseQuestions[p.num] || [];
      const answered = Object.keys(phaseAnswers[p.num] || {}).filter(k => !k.startsWith('_')).length;
      phasePcts[p.num] = qs.length > 0 ? Math.round((answered / qs.length) * 100) : 0;
    }
  });
  // Derive current active phase = first incomplete non-gated phase
  const derivedCurrentPhase = currentActivePhase(phasePcts);

  // ── Set initial activePhase & activeMode on first load / project switch ──
  // For decomposed projects: highlight the last completed phase (usually 8) and open StoryAssistant.
  // For normal projects: highlight the first incomplete phase and open Guide.
  useEffect(() => {
    if (phaseInitRef.current === activeProject?.id) return; // already initialized for this project
    if (!activeProject?.id) return;

    // Find the best starting phase
    if (isDecomposed) {
      // Last completed phase — walk backwards to find the last one at 100%
      const completed = phases.filter(p => (phasePcts[p.num] || 0) === 100);
      const lastDone = completed.length > 0 ? completed[completed.length - 1].num : 8;
      setActivePhase(lastDone);
      // Default to StoryAssistant for decomposed projects (unless URL param overrides)
      if (!searchParams.get('mode')) {
        setActiveMode('chat');
      }
    } else {
      // First incomplete phase
      setActivePhase(derivedCurrentPhase);
    }

    phaseInitRef.current = activeProject.id;
  }, [activeProject?.id, isDecomposed, derivedCurrentPhase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute health dimensions from real project data
  const projectFiles = useProjectStore(s => s.files);
  const [healthDimensions, setHealthDimensions] = useState(defaultHealthDimensions.map(d => ({ ...d, rating: 0 })));
  const [overallHealthRating, setOverallHealthRating] = useState(0);

  useEffect(() => {
    // Lazy import to avoid loading the scoring engine upfront
    import('../services/healthScoring.js').then(({ computeHealthDimensions, computeOverallHealth, getHealthLabel }) => {
      const dims = computeHealthDimensions(projectFiles || {}, phaseAnswers, activeProject);
      const overall = computeOverallHealth(dims);

      const mapped = defaultHealthDimensions.map(d => {
        const score = dims[d.key] ?? 0;
        const rating = Math.round(score);
        return {
          ...d,
          rating,
          flag: score < 2 ? `${d.name} needs attention` : null,
          tip: `${d.tip} Current score: ${score.toFixed(1)}/5 (${getHealthLabel(score)}).`,
        };
      });
      setHealthDimensions(mapped);
      setOverallHealthRating(Math.round(overall));
    }).catch(() => {
      // Fallback: keep defaults
    });
  }, [projectFiles, phaseAnswers, activeProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-show product tour for first-time users
  useEffect(() => {
    if (tourCompleted === false) {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [leftTab, setLeftTab] = useState(initialPanel === 'cast' ? 'cast' : 'phases');
  const [expandedDim, setExpandedDim] = useState(null);
  const [projectFilesOpen, setProjectFilesOpen] = useState(true);
  const [engineRefOpen, setEngineRefOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  // Drawing Board / Scratchpad items — lifted to workspace level so sidebar can access
  const [boardItems, setBoardItems] = useState([]);
  const [quickChatOpen, setQuickChatOpen] = useState(false);
  const [threadExpanded, setThreadExpanded] = useState(false);
  const [overLimitPrompt, setOverLimitPrompt] = useState(false);

  // Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('amber');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showRedecomposeModal, setShowRedecomposeModal] = useState(false);
  const [showEnrichModal, setShowEnrichModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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

  // Keyboard shortcuts: Ctrl+F (search), Ctrl+/ (shortcuts modal), Ctrl+, (settings), Ctrl+Shift+E (toggle sidebar)
  useEffect(() => {
    const handler = (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if (isMod && e.key === 'f') {
        e.preventDefault();
        if (activeMode === 'search') {
          setActiveMode('guided');
        } else {
          setActiveMode('search');
        }
      } else if (isMod && e.key === ',') {
        e.preventDefault();
        setShowSettingsModal(true);
      } else if (isMod && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setLeftCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeMode]);

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

  // Word count — computed from actual project files
  const wordCount = Object.entries(projectFiles || {})
    .filter(([path]) => path.startsWith('story/') && path.endsWith('.md'))
    .reduce((total, [, content]) => total + countWords(content), 0);
  // Word limit: prefer explicit wordGoal (from wizard), then metadata.wordGoal,
  // then derive from medium's upper range, then fall back to 80k
  const mediumDef = STORY_MEDIUMS.find(m => m.key === activeProject?.medium);
  const wordLimit = activeProject?.wordGoal
    || activeProject?.metadata?.wordGoal
    || (mediumDef ? mediumDef.wordRange[1] : 80000);

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
      case 'guided':
        // Phase 8 gets a dedicated chapter execution UI
        if (activePhase === 8) return <ChapterExecutionMode />;
        return <GuidedFlow
            phase={activePhase || derivedCurrentPhase}
            answers={phaseAnswers}
            onAnswer={(phase, qId, value) => {
              setPhaseAnswers(prev => ({ ...prev, [phase]: { ...prev[phase], [qId]: value } }));
              // Persist to project store (debounced by nature of user typing)
              useProjectStore.getState().updatePhaseAnswers(phase, { [qId]: value });
            }}
            onNextPhase={() => {
              // Compile current phase answers into the corresponding project file
              const phaseFileMap = {
                1: 'author.md', 2: 'narrator.md', 3: 'world/world-building.md',
                6: 'outline.md', 7: 'story/arc.md',
              };
              const targetFile = phaseFileMap[activePhase];
              if (targetFile) {
                const pQuestions = phaseQuestions[activePhase] || [];
                const pAnswers = phaseAnswers[activePhase] || {};
                const phaseName = { 1: 'Author Profile', 2: 'Narrator', 3: 'World Building', 6: 'Story Foundation', 7: 'Quality Control' }[activePhase] || '';
                let md = `# ${phaseName}\n\n`;
                for (const q of pQuestions) {
                  const answer = pAnswers[q.id];
                  const answerStr = typeof answer === 'string' ? answer : answer != null ? String(answer) : '';
                  if (answerStr.trim()) {
                    md += `## ${q.q}\n\n${answerStr.trim()}\n\n`;
                  }
                }
                if (md.trim().split('\n').length > 2) {
                  useProjectStore.getState().updateFile(targetFile, md);
                }
              }

              const phaseOrder = phases.map(p => p.num);
              const idx = phaseOrder.indexOf(activePhase);
              if (idx < phaseOrder.length - 1) {
                const nextNum = phaseOrder[idx + 1];
                const nextPhase = phases[idx + 1];
                if (nextPhase.gated && !allPrereqsComplete(phasePcts)) {
                  setShowGateWarning(true);
                } else {
                  setActivePhase(nextNum);
                }
              }
            }}
            onPrevPhase={() => {
              const phaseOrder = phases.map(p => p.num);
              const idx = phaseOrder.indexOf(activePhase);
              if (idx > 0) setActivePhase(phaseOrder[idx - 1]);
            }}
            isDecomposed={isDecomposed}
            onOpenFile={(filePath) => {
              setActiveFile(filePath);
              setActiveMode('file-editor');
            }}
          />;
      case 'editor': return <EditorMode file={activeFile} />;
      case 'reader': return <ReaderMode file={activeFile} onEdit={() => { setActiveMode('file-editor'); }} editedContent={editedFiles[activeFile]} />;
      case 'file-editor': return <FileEditorMode
        file={activeFile}
        onPreview={() => setActiveMode('reader')}
        onEditorReview={() => setActiveMode('editor')}
        editedContent={editedFiles[activeFile]}
        onContentChange={(text) => setEditedFiles(prev => ({ ...prev, [activeFile]: text }))}
        onSave={(text) => {
          setEditedFiles(prev => ({ ...prev, [activeFile]: text }));
          // Persist to project store (IndexedDB)
          if (activeFile) useProjectStore.getState().updateFile(activeFile, text);
        }}
      />;
      case 'full-cast': return <FullCastMode
        onAddCharacter={() => setShowAddCharModal(true)}
        onCharacterClick={(name) => { setSelectedCharacter(name); setActiveMode('character-profile'); }}
        onBack={() => setActiveMode('guided')}
      />;
      case 'comparison': return <ComparisonMode />;
      case 'graph': return <RelationshipGraph />;
      case 'chat': return <ChatMode phasePcts={phasePcts} />;
      case 'timeline': return <TimelineMode />;
      case 'board': return <DrawingBoard onOpenFile={openFile} boardItems={boardItems} setBoardItems={setBoardItems} />;
      case 'world': return <WorldBuildingMode />;
      case 'voice-casting': return <VoiceCasting />;
      case 'feedback': return <FeedbackManager />;
      case 'genre-shift': return <GenreShiftDashboard />;
      case 'sandbox': return <SandboxMode />;
      case 'character-profile': return <CharacterProfile
        characterName={selectedCharacter}
        onBack={() => setActiveMode('full-cast')}
        onViewArc={() => { setActiveMode('timeline'); }}
        onViewRelationships={() => { setActiveMode('graph'); }}
      />;
      case 'search': return <SearchPanel onOpenFile={(path) => { setActiveFile(path); setActiveMode('reader'); }} onClose={() => setActiveMode('guided')} />;
      case 'import': return <ImportMode updateFile={useProjectStore.getState().updateFile} activeProject={activeProject} />;
      default: return <PlaceholderMode name={centerStageModes.find(m => m.key === activeMode)?.label || activeMode} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        projectName={activeProject?.title || 'Untitled Story'}
        healthRating={overallHealthRating}
        projectMode={activeProject?.metadata?.mode || (isDecomposed ? 'decompose' : null)}
        onHealthClick={() => {
          setRightCollapsed(false);
          setTimeout(() => {
            const el = document.getElementById('project-health-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        onSettingsClick={() => setShowSettingsModal(true)}
        onThemeClick={() => setShowThemeModal(true)}
        onTourClick={() => setShowTour(true)}
        onShowShortcuts={() => setShowShortcutsModal(true)}
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
          {/* Project items
           *
           * TODO: Project Switching — Save & Restore Flow
           * =============================================
           * When a user clicks on a different project in this sidebar, we need to:
           *
           * 1. DIRTY STATE DETECTION
           *    Before switching, check for unsaved work across all stateful areas:
           *    - editedFiles: any file with unsaved edits in the file editor
           *    - phaseAnswers: any new/changed answers since last save
           *    - boardItems: any new scratchpad notes or drafts
           *    - newChar: if the Add Character modal is open with partially filled data
           *    - chatInput: if there's unstyped text in the Story Assistant
           *    Build a `hasDirtyState()` helper that checks all of these.
           *
           * 2. SAVE CONFIRMATION MODAL
           *    If dirty state exists, show a modal BEFORE navigating away:
           *      "You have unsaved changes in [The Shunning Season]"
           *      - List what's unsaved: "2 edited files, 3 new phase answers"
           *      - Three buttons: [Save & Switch] [Discard & Switch] [Cancel]
           *    If no dirty state, switch immediately without prompting.
           *
           * 3. PROJECT SERIALIZATION (Save)
           *    Serialize the current project state to a project data object:
           *    {
           *      id, name, abbr, gradient,
           *      phaseAnswers,          // all guide answers
           *      editedFiles,           // modified file contents
           *      boardItems,            // scratchpad/drawing board
           *      characters,            // cast roster data
           *      activePhase,           // last viewed phase
           *      activeMode,            // last active mode (guide/reader/chat/etc)
           *      activeFile,            // last opened file
           *      leftTab,               // last sidebar tab
           *      wordCount,             // manuscript word count
           *      isDecomposed,          // whether this was an imported manuscript
           *    }
           *    Store in localStorage or a project store (context/zustand).
           *    Key: `serendipity-project-${projectId}`
           *
           * 4. PROJECT DESERIALIZATION (Load)
           *    When switching TO a project:
           *    - Load its saved state from storage
           *    - Hydrate all useState hooks with saved values
           *    - Recompute phasePcts from loaded phaseAnswers
           *    - If no saved state exists (new project), use fresh defaults
           *    - Restore the user's last position (activePhase, activeMode, activeFile)
           *
           * 5. STATE MANAGEMENT REFACTOR
           *    Current approach: all state lives in useState hooks inside WorkspaceScreen.
           *    For multi-project support, consider:
           *    - Option A: useReducer with a single project state object (simpler serialize/deserialize)
           *    - Option B: React Context + localStorage persistence layer
           *    - Option C: Zustand store with project-scoped slices
           *    Recommendation: Option A (useReducer) is lightest and keeps everything in this component.
           *    Define a `projectReducer` and a single `dispatch` that handles all state mutations.
           *
           * 6. PROJECT LIST
           *    Move from hardcoded array to state-driven:
           *    - const [projects, setProjects] = useState(loadProjectList());
           *    - "New Project" creates a fresh entry with default state
           *    - Each project card shows: name, last modified, word count, overall progress %
           *    - Active project has the accent border (current behavior)
           *
           * 7. EDGE CASES
           *    - User closes browser with unsaved changes → use beforeunload event
           *    - Auto-save on interval (e.g., every 60s) to minimize data loss
           *    - Project deletion should require confirmation
           *    - "New Project" while current project has unsaved changes → same save prompt
           */}
          {projects.map((p, idx) => {
            const abbr = p.title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'P';
            const isActive = activeProject?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={async () => {
                  if (!isActive) {
                    await handleProjectSwitch(p.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: threadExpanded ? '4px 10px' : '4px 8px',
                  cursor: 'pointer',
                  borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  opacity: isActive ? 1 : 0.5,
                  minHeight: 36,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                  background: getGradient(idx),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                  border: isActive ? '2px solid var(--accent)' : 'none',
                }}>
                  {abbr}
                </div>
                {threadExpanded && (
                  <span style={{
                    fontSize: '0.78rem', fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {p.title}
                  </span>
                )}
              </div>
            );
          })}

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

              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }} data-tour="phase-sidebar">
                {/* Regenerate button — shown at top of every sidebar tab for decomposed projects */}
                {isDecomposed && (
                  <button
                    onClick={() => setShowRedecomposeModal(true)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', padding: '7px 12px', marginBottom: 10,
                      background: 'none', border: '1px dashed var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      fontSize: '0.73rem', color: 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Sparkles size={12} /> Regenerate Analysis
                  </button>
                )}
                {/* Enrich Project button — available for all projects that have some content */}
                <button
                  onClick={() => setShowEnrichModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '7px 12px', marginBottom: 10,
                    background: 'none', border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontSize: '0.73rem', color: 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Brain size={12} /> Enrich Project
                </button>
                {leftTab === 'phases' && (
                  <PhaseProgress currentPhase={activePhase} phasePcts={phasePcts} isDecomposed={isDecomposed} onPhaseClick={(num, name, isLocked) => {
                    if (isLocked) {
                      setShowGateWarning(true);
                      return;
                    }
                    // Quality warning for phases 8/9 if health is low (≤2 in any dimension)
                    if ((num === 8 || num === 9)) {
                      // Check health scores — using demo values; in production these come from state
                      const lowHealth = true; // demo: World Integrity is 3, Character Depth is 2
                      if (lowHealth) {
                        setShowQualityWarning(num);
                        return;
                      }
                    }
                    setActivePhase(num);
                    setActiveMode('guided');
                  }} />
                )}
                {leftTab === 'cast' && (
                  <CastRoster
                    onAddCharacter={() => setShowAddCharModal(true)}
                    onCharacterClick={(name) => { setSelectedCharacter(name); setActiveMode('character-profile'); }}
                    onViewFullCast={() => setActiveMode('full-cast')}
                    onCharacterChat={(name) => { setSelectedCharacter(name); setActiveMode('chat'); }}
                    onCharacterDelete={async (name) => {
                      // CastRoster already shows inline Delete/Cancel confirmation UI
                      const path = `characters/${name.toLowerCase().replace(/\s+/g, '-')}.md`;
                      const { updateFile, loadProjectFiles, activeProjectId } = useProjectStore.getState();
                      // Remove from IndexedDB via projectFiles table
                      try {
                        const record = await import('../lib/db').then(m => m.default.projectFiles
                          .where('[projectId+path]')
                          .equals([activeProjectId, path])
                          .first());
                        if (record) {
                          await import('../lib/db').then(m => m.default.projectFiles.delete(record.id));
                        }
                        // Reload files to update local state and phase progress
                        await loadProjectFiles(activeProjectId);
                      } catch (err) {
                        console.warn('Failed to delete character file:', err);
                      }
                    }}
                  />
                )}
                {leftTab === 'files' && (
                  <div style={{ fontSize: '0.8rem' }} data-tour="file-tree">
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
                    {projectFilesOpen && buildProjectFileTree(projectFiles).map((f) => (
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
                    {engineRefOpen && engineFileTree.map((f) => (
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
                    {/* Drawing Board / Scratchpad — Collapsible */}
                    <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                    <div
                      onClick={() => setScratchpadOpen(prev => !prev)}
                      style={{
                        fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--text-muted)', padding: '4px 4px 6px', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      {scratchpadOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      <Palette size={11} style={{ opacity: 0.7 }} />
                      Drawing Board
                      <span style={{ marginLeft: 'auto', fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.6 }}>{boardItems.length}</span>
                    </div>
                    {scratchpadOpen && boardItems.map((item) => {
                      const itemLabel = item.label || item.text || 'Untitled';
                      const typeEmoji = item.type === 'note' ? '📝' : item.type === 'image' ? '🖼' : item.type === 'doc' ? '📎' : '📄';
                      return (
                        <div
                          key={item.id}
                          onClick={() => { setActiveMode('board'); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '3px 4px 3px 12px',
                            cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem',
                            borderRadius: 'var(--radius-sm)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          title={itemLabel}
                        >
                          <span style={{ fontSize: '0.65rem', flexShrink: 0 }}>{typeEmoji}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{itemLabel.length > 35 ? itemLabel.slice(0, 35) + '…' : itemLabel}</span>
                          {item.used && <span style={{ marginLeft: 'auto', fontSize: '0.5rem', color: 'var(--health-exceptional)', flexShrink: 0 }}>linked</span>}
                        </div>
                      );
                    })}
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
            {(() => {
              const userMode = useSettingsStore(s => s.mode) || 'advanced';
              const visibleModes = userMode === 'simple'
                ? centerStageModes.filter(m => ['guided', 'chat', 'reader', 'editor', 'board'].includes(m.key))
                : centerStageModes;
              return visibleModes.map((m) => {
                const Icon = m.icon;
                const isActive = activeMode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => {
                      setActiveMode(m.key);
                      if (m.key === 'reader' || m.key === 'file-editor') setLeftTab('files');
                    }}
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
              });
            })()}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }} data-tour="guide-area">
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px 0', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => { setShowVersionHistory(true); setShowSearchPanel(false); }}
                    style={{
                      border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                      gap: 2, fontSize: '0.65rem', padding: '3px 6px', borderRadius: 'var(--radius-sm)',
                    }}
                    title="Version History"
                  >
                    <Clock size={11} /> History
                  </button>
                  <button
                    onClick={() => { setShowSearchPanel(true); setShowVersionHistory(false); }}
                    style={{
                      border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                      gap: 2, fontSize: '0.65rem', padding: '3px 6px', borderRadius: 'var(--radius-sm)',
                    }}
                    title="Search"
                  >
                    <Search size={11} /> Search
                  </button>
                </div>
                <button onClick={() => setRightCollapsed(true)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  gap: 4, fontSize: '0.65rem',
                }}>
                  Collapse <ChevronsRight size={13} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {/* Version History Panel */}
                {showVersionHistory && (
                  <VersionHistory
                    onClose={() => setShowVersionHistory(false)}
                    onRestore={(filename, content) => {
                      useProjectStore.getState().updateFile(filename, content);
                      setShowVersionHistory(false);
                    }}
                  />
                )}
                {/* Search Panel */}
                {showSearchPanel && (
                  <SearchPanel
                    onOpenFile={(path) => {
                      setActiveFile(path);
                      setActiveMode('reader');
                      setShowSearchPanel(false);
                    }}
                    onClose={() => setShowSearchPanel(false)}
                  />
                )}
                {/* Default Content: Section 1: Next Steps — dynamic based on phase progress */}
                {!showVersionHistory && !showSearchPanel && (
                  <>
                {/* Decomposition guard overlay */}
                {isDecomposed && !decomposedHealthRevealed && (
                  <div style={{
                    position: 'absolute', top: 40, left: 0, right: 0, bottom: 0,
                    zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: 24, textAlign: 'center',
                    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    background: 'rgba(20, 20, 30, 0.75)',
                  }}>
                    <div style={{
                      fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--accent)', fontWeight: 600, marginBottom: 8,
                    }}>
                      Decomposition Mode
                    </div>
                    <div style={{
                      fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600,
                      marginBottom: 12, lineHeight: 1.5,
                    }}>
                      Health scores & suggestions are hidden
                    </div>
                    <div style={{
                      fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                      marginBottom: 20, maxWidth: 240,
                    }}>
                      This is a decomposed work — these AI-generated ratings are subjective heuristics, not a judgment on you, the author, or the book itself. They're useful if you want to build on or remix this story.
                    </div>
                    <button
                      onClick={() => setDecomposedHealthRevealed(true)}
                      style={{
                        background: 'transparent', border: '1px solid var(--accent)',
                        color: 'var(--accent)', padding: '8px 16px', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent)'; }}
                    >
                      Show me anyway — I can handle it
                    </button>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>
                      Scores are heuristic only — not a reflection of quality
                    </div>
                  </div>
                )}
                <h4 style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Next Steps
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
                  {(() => {
                    const steps = [];
                    // Find ALL phases that are partially complete — finish those first
                    const partials = phases.filter(p => {
                      const pct = phasePcts[p.num] || 0;
                      return pct > 0 && pct < 100;
                    });
                    partials.forEach(partial => {
                      const qs = phaseQuestions[partial.num] || [];
                      const answered = Object.keys(phaseAnswers[partial.num] || {}).length;
                      const remaining = qs.length - answered;
                      steps.push({
                        label: `Finish ${partial.name} questions (${remaining} remaining)`,
                        action: () => { setActivePhase(partial.num); setActiveMode('guided'); setLeftTab('phases'); },
                      });
                    });
                    // Find the next phase that has 0% progress
                    const nextEmpty = phases.find(p => (phasePcts[p.num] || 0) === 0 && !p.gated);
                    if (nextEmpty) {
                      const label = typeof nextEmpty.num === 'number'
                        ? `Begin Phase ${nextEmpty.num} — ${nextEmpty.name}`
                        : `Begin ${nextEmpty.name} phase`;
                      steps.push({
                        label,
                        action: () => { setActivePhase(nextEmpty.num); setActiveMode('guided'); setLeftTab('phases'); },
                      });
                    }
                    // Quality check — if any health dimension has a flag
                    const flagged = healthDimensions.filter(d => d.flag);
                    flagged.forEach(d => {
                      steps.push({
                        label: `Resolve: ${d.flag}`,
                        action: () => { setActivePhase(7); setActiveMode('guided'); setLeftTab('phases'); },
                      });
                    });
                    // If all non-gated phases done, suggest content generation
                    if (allPrereqsComplete(phasePcts)) {
                      steps.push({
                        label: 'All structure complete — begin content generation',
                        action: () => { setActivePhase(8); setActiveMode('guided'); setLeftTab('phases'); },
                      });
                    }
                    return steps.slice(0, 4).map((step, i) => (
                      <div key={i} onClick={step.action} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)',
                        cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                      }}>
                        <span style={{ color: 'var(--accent)' }}>→</span>
                        {step.label}
                      </div>
                    ));
                  })()}
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />

                {/* Section 2: Project Health */}
                <h4 id="project-health-section" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Project Health
                </h4>
                <div data-tour="health-bar">
                  <HealthBar rating={overallHealthRating} style={{ marginBottom: 12 }} />
                </div>
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
                        <div
                          onClick={() => { setActivePhase(d.phase); setActiveMode('guided'); setLeftTab('phases'); }}
                          style={{ fontSize: '0.7rem', color: 'var(--health-developing)', paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                        >
                          <AlertTriangle size={10} /> {d.flag}
                        </div>
                      )}
                      {expandedDim === d.name && (
                        <div style={{ padding: '8px 12px', fontSize: '0.7rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', margin: '4px 0' }}>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{d.tip}</div>
                          <div
                            onClick={() => { setActivePhase(d.phase); setActiveMode('guided'); setLeftTab('phases'); }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: '0.68rem', color: 'var(--accent)', cursor: 'pointer',
                              padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--accent)', background: 'transparent',
                            }}
                          >
                            Go to {phases.find(p => p.num === d.phase)?.name || 'phase'} →
                          </div>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div
                      onClick={() => { setActivePhase(4); setActiveMode('guided'); setLeftTab('phases'); }}
                      style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ color: 'var(--accent)' }}>→</span> Character Depth: Developing (2 issues)
                    </div>
                    <div
                      onClick={() => { setActivePhase(7); setActiveMode('guided'); setLeftTab('phases'); }}
                      style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ color: 'var(--accent)' }}>→</span> World Integrity: Story Deaths audit incomplete
                    </div>
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
                  </>
                )}
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
        currentPhase={derivedCurrentPhase}
        wordCount={wordCount}
        wordLimit={wordLimit}
        isDecomposed={isDecomposed}
        healthRevealed={decomposedHealthRevealed}
        projectMeta={{
          medium: activeProject?.medium,
          contentRating: activeProject?.contentRating || activeProject?.metadata?.contentRating,
          genre: activeProject?.genre || activeProject?.metadata?.primaryGenre,
          secondaryGenre: activeProject?.metadata?.secondaryGenre,
        }}
        onPhaseClick={() => { setLeftCollapsed(false); setLeftTab('phases'); setActiveMode('guided'); }}
        onOverLimitClick={() => { setActiveMode('chat'); setOverLimitPrompt(true); }}
      />

      {/* Modals */}
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} currentTheme={currentTheme} onThemeChange={applyTheme} onGoToFullSettings={() => { setShowSettingsModal(false); navigate('/settings'); }} />}
      {showThemeModal && <ThemePickerModal onClose={() => setShowThemeModal(false)} currentTheme={currentTheme} onThemeChange={applyTheme} />}
      {showShortcutsModal && <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />}
      {showTour && <ProductTour onComplete={() => setShowTour(false)} />}
      {showRedecomposeModal && (
        <RedecomposeModal
          onClose={() => setShowRedecomposeModal(false)}
          projectFiles={projectFiles}
          projectMeta={{ title: activeProject?.title, medium: activeProject?.medium }}
        />
      )}
      {showEnrichModal && (
        <EnrichProjectModal
          onClose={() => setShowEnrichModal(false)}
          projectFiles={projectFiles}
          projectMeta={{ title: activeProject?.title, medium: activeProject?.medium }}
        />
      )}

      {/* ── Project Switch Confirmation Modal ── */}
      {showSwitchConfirm && (
        <div onClick={() => setShowSwitchConfirm(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 420, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Unsaved Changes</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>
              You have unsaved work in <strong>{activeProject?.title}</strong>:
            </p>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20, paddingLeft: 20, lineHeight: 1.8 }}>
              {Object.keys(editedFiles).length > 0 && <li>{Object.keys(editedFiles).length} edited file(s)</li>}
              {storeIsDirty && <li>File changes in editor</li>}
              {(newChar.name || newChar.bio) && <li>Partially created character</li>}
            </ul>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowSwitchConfirm(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => performProjectSwitch(pendingSwitchId)}>Discard & Switch</Button>
              <Button variant="primary" onClick={handleSaveAndSwitch}>Save & Switch</Button>
            </div>
          </div>
        </div>
      )}

      {/* Gate Warning Modal — locked phases */}
      {showGateWarning && (
        <ModalOverlay onClose={() => setShowGateWarning(false)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔒</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>Content Generation Locked</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 16 }}>
              Chapter Execution and Editor phases require all prior phases to be completed first. This ensures your story has a solid foundation before generating content.
            </p>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 12, marginBottom: 20, textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Incomplete Phases</div>
              {phases.filter(p => !p.gated && (phasePcts[p.num] || 0) < 100).map((p, i) => {
                const pct = phasePcts[p.num] || 0;
                return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: '0.8rem' }}>
                  <span style={{ color: pct > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {pct > 0 ? `${pct}%` : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {typeof p.num === 'number' ? `Phase ${p.num}` : ''} — {p.name}
                  </span>
                </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => setShowGateWarning(false)}>Got it</Button>
              <Button variant="primary" onClick={() => {
                setShowGateWarning(false);
                // Navigate to first incomplete phase
                const firstIncomplete = phases.find(p => !p.gated && (phasePcts[p.num] || 0) < 100);
                if (firstIncomplete) {
                  setActivePhase(firstIncomplete.num);
                  setActiveMode('guided');
                }
              }}>Go to first incomplete phase</Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Quality Warning Modal — low health scores */}
      {/* Add Character Modal */}
      {showAddCharModal && (() => {
        /* ── Tooltip helper for glossary terms ── */
        const GlossaryTip = ({ termKey, children }) => {
          const [show, setShow] = useState(false);
          const entry = STORY_GLOSSARY[termKey];
          if (!entry) return children;
          return (
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {children}
              <span
                onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
                style={{ cursor: 'help', color: 'var(--accent)', fontSize: '0.65rem', opacity: 0.8 }}
              >?</span>
              {show && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, zIndex: 999,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 14px', width: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent)', marginBottom: 4 }}>{entry.term}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{entry.long}</div>
                </div>
              )}
            </span>
          );
        };

        /* ── Tier options with glossary descriptions ── */
        const tierOptions = [
          { value: 'protagonist', label: 'Protagonist', desc: STORY_GLOSSARY.protagonist?.short },
          { value: 'deuteragonist', label: 'Deuteragonist', desc: STORY_GLOSSARY.deuteragonist?.short },
          { value: 'antagonist', label: 'Antagonist', desc: STORY_GLOSSARY.antagonist?.short },
          { value: 'supporting', label: 'Supporting', desc: STORY_GLOSSARY.supporting?.short },
          { value: 'minor', label: 'Minor', desc: STORY_GLOSSARY.minor?.short },
          { value: 'mentioned', label: 'Mentioned', desc: STORY_GLOSSARY.mentioned?.short },
        ];
        const selectedTierInfo = tierOptions.find(t => t.value === newChar.tier);

        /* ── AI-generate full profile ── */
        const handleAIGenerate = async () => {
          if (!newChar.name.trim()) return;
          setNewChar(prev => ({ ...prev, isGenerating: true }));
          try {
            // Gather story context from existing project files
            const pFiles = projectFiles || {};
            const contextParts = [];
            if (pFiles['author.md']) contextParts.push(`Author: ${pFiles['author.md'].substring(0, 500)}`);
            if (pFiles['world/world-building.md']) contextParts.push(`World: ${pFiles['world/world-building.md'].substring(0, 500)}`);
            if (pFiles['outline.md']) contextParts.push(`Outline: ${pFiles['outline.md'].substring(0, 500)}`);
            const charFiles = Object.entries(pFiles).filter(([p]) => p.startsWith('characters/') && p.endsWith('.md') && !p.includes('questions-answered'));
            if (charFiles.length > 0) contextParts.push(`Existing cast:\n${charFiles.map(([p, c]) => `- ${p}: ${(c || '').substring(0, 150)}`).join('\n')}`);

            const prompt = PROMPTS.CHARACTER_ENRICHMENT.build({
              characterName: newChar.name.trim(),
              role: newChar.role,
              tier: newChar.tier,
              type: newChar.type,
              bio: newChar.bio,
              existingContent: '',
              storyContext: contextParts.join('\n\n') || 'No story context yet — generate a compelling standalone character.',
            });
            const result = await sendMessage({
              messages: [{ role: 'user', content: prompt }],
              role: 'analyst',
              maxTokens: 3000,
            });
            if (result.success && result.content) {
              // Save the AI-generated content directly as the character file
              const slug = newChar.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
              const filePath = `characters/${slug}.md`;
              const { updateFile } = useProjectStore.getState();
              await updateFile(filePath, result.content.trim());
              setShowAddCharModal(false);
              setNewChar({ name: '', role: 'Supporting', tier: 'supporting', type: '', bio: '', voiceNotes: '', avatar: null, isGenerating: false });
              return;
            }
          } catch (err) {
            console.warn('AI character generation failed:', err);
          }
          setNewChar(prev => ({ ...prev, isGenerating: false }));
        };

        const inputStyle = {
          width: '100%', padding: '8px 12px', fontSize: '0.85rem',
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none',
        };
        const labelStyle = {
          fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block',
          marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
        };

        return (
        <ModalOverlay onClose={() => { setShowAddCharModal(false); setNewChar({ name: '', role: 'Supporting', tier: 'supporting', type: '', bio: '', voiceNotes: '', avatar: null, isGenerating: false }); }}>
          <div style={{ maxWidth: 520, maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Add New Character</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Avatar upload area */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
                <div
                  onClick={() => document.getElementById('char-avatar-upload')?.click()}
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: newChar.avatar ? `url(${newChar.avatar}) center/cover` : 'linear-gradient(135deg, var(--accent), #f472b6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', border: '2px dashed var(--border)', flexShrink: 0,
                  }}
                >
                  {!newChar.avatar && <Upload size={20} color="var(--text-muted)" />}
                </div>
                <input id="char-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setNewChar(prev => ({ ...prev, avatar: ev.target.result }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Upload avatar (optional)</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.7 }}>Click the circle or drag an image</div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle}>Character Name *</label>
                <input
                  value={newChar.name}
                  onChange={(e) => setNewChar(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sarah, The Bishop, Dr. Chen..."
                  style={inputStyle}
                />
              </div>

              {/* Tier (replaces old Role + Tier row) */}
              <div>
                <label style={labelStyle}>
                  <GlossaryTip termKey={newChar.tier}>Tier</GlossaryTip>
                </label>
                <select
                  value={newChar.tier}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Auto-set role to match tier for common cases
                    const roleMap = { protagonist: 'Protagonist', deuteragonist: 'Deuteragonist', antagonist: 'Antagonist', supporting: 'Supporting', minor: 'Minor', mentioned: 'Mentioned' };
                    setNewChar(prev => ({ ...prev, tier: val, role: roleMap[val] || prev.role }));
                  }}
                  style={inputStyle}
                >
                  {tierOptions.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {selectedTierInfo && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.5 }}>
                    {selectedTierInfo.desc}
                  </div>
                )}
              </div>

              {/* Role (narrative function) */}
              <div>
                <label style={labelStyle}>Narrative Role</label>
                <input
                  value={newChar.role}
                  onChange={(e) => setNewChar(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Reluctant mentor, Comic relief, Love interest, Foil to [character]..."
                  style={inputStyle}
                />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3, opacity: 0.7 }}>
                  What function do they serve in the story?
                </div>
              </div>

              {/* Type (optional archetype) */}
              <div>
                <label style={labelStyle}>Character Type (optional)</label>
                <input
                  value={newChar.type}
                  onChange={(e) => setNewChar(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g. Antihero, Trickster, Chosen One, Everyman..."
                  style={inputStyle}
                />
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>Brief Description</label>
                <textarea
                  value={newChar.bio}
                  onChange={(e) => setNewChar(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Who they are, what they want, and why they matter..."
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* Voice Notes */}
              <div>
                <label style={labelStyle}>
                  <GlossaryTip termKey="voiceNotes">Voice Notes</GlossaryTip>
                </label>
                <textarea
                  value={newChar.voiceNotes}
                  onChange={(e) => setNewChar(prev => ({ ...prev, voiceNotes: e.target.value }))}
                  placeholder="How do they talk? Speech patterns, vocabulary level, verbal tics, dialect... e.g. 'Uses formal language as armor. Never contracts words. Says &quot;one might consider&quot; instead of &quot;maybe&quot;.'"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3, opacity: 0.7 }}>
                  Used for character chat and dialogue generation. The more specific, the better.
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <button
                onClick={handleAIGenerate}
                disabled={!newChar.name.trim() || newChar.isGenerating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', fontSize: '0.75rem',
                  background: 'none', border: '1px dashed var(--accent)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--accent)',
                  cursor: newChar.name.trim() && !newChar.isGenerating ? 'pointer' : 'not-allowed',
                  opacity: newChar.name.trim() && !newChar.isGenerating ? 1 : 0.4,
                  transition: 'all 0.15s',
                }}
              >
                <Sparkles size={13} />
                {newChar.isGenerating ? 'Generating...' : 'AI: Build Full Profile'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" onClick={() => { setShowAddCharModal(false); setNewChar({ name: '', role: 'Supporting', tier: 'supporting', type: '', bio: '', voiceNotes: '', avatar: null, isGenerating: false }); }}>Cancel</Button>
                <Button variant="primary" onClick={async () => {
                  if (!newChar.name.trim()) return;
                  const slug = newChar.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  const filePath = `characters/${slug}.md`;
                  const tierVal = newChar.tier || 'supporting';
                  const roleVal = newChar.role || 'Supporting';
                  const typeLabel = newChar.type ? `\n- **Type:** ${newChar.type}` : '';
                  const voiceBlock = newChar.voiceNotes ? `\n- **Voice Notes:** ${newChar.voiceNotes}` : '';
                  const bioBlock = newChar.bio ? `\n- **Motivations:** ${newChar.bio}` : '';
                  const content = `## ${newChar.name.trim()}\n- **Tier:** ${tierVal}\n- **Role:** ${roleVal}${typeLabel}${bioBlock}${voiceBlock}\n`;
                  try {
                    const { updateFile } = useProjectStore.getState();
                    await updateFile(filePath, content);
                  } catch (err) {
                    console.warn('Failed to save character:', err);
                  }
                  setShowAddCharModal(false);
                  setNewChar({ name: '', role: 'Supporting', tier: 'supporting', type: '', bio: '', voiceNotes: '', avatar: null, isGenerating: false });
                }} style={{ opacity: newChar.name.trim() ? 1 : 0.5 }}>Add Character</Button>
              </div>
            </div>
          </div>
        </ModalOverlay>
        );
      })()}

      {showQualityWarning && (
        <ModalOverlay onClose={() => setShowQualityWarning(null)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 }}>Story Foundation Needs Work</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 16 }}>
              Some of your story health scores are low. Generating content now may produce chapters that feel hollow, inconsistent, or need significant rework. We recommend strengthening these areas first:
            </p>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: 12, marginBottom: 20, textAlign: 'left' }}>
              {[
                { label: 'World Integrity', score: 3, max: 5, note: 'Story Deaths audit: 2 unresolved' },
                { label: 'Character Depth', score: 2, max: 5, note: 'Key characters need more development' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 60, height: 4, background: 'var(--bg-hover)', borderRadius: 100 }}>
                      <div style={{ width: `${(item.score / item.max) * 100}%`, height: '100%', background: item.score <= 2 ? '#ef4444' : '#f0a050', borderRadius: 100 }} />
                    </div>
                    <span style={{ color: item.score <= 2 ? '#ef4444' : '#f0a050', fontWeight: 600, fontSize: '0.75rem' }}>{item.score}/{item.max}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => {
                setShowQualityWarning(null);
                // Go back to phases that need work
                setActivePhase(5); // Characters
                setActiveMode('guided');
              }}>Revisit weak phases</Button>
              <Button variant="ghost" onClick={() => {
                setShowQualityWarning(null);
                setActivePhase(showQualityWarning);
                setActiveMode('guided');
              }} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>I don't care — proceed anyway</Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Character Guide Mode */}
      {useSettingsStore(s => s.characterGuideMode) && (
        <CharacterGuide currentFile={activeFile} currentContent={editedFiles[activeFile] || useProjectStore(s => s.files)?.[activeFile]} />
      )}

      {/* Conversational Teacher Mode */}
      {useSettingsStore(s => s.conversationalTeacher) && (
        <ConversationalTeacher context={editedFiles[activeFile] || useProjectStore(s => s.files)?.[activeFile]} topic={activeFile?.split('/').pop() || 'your story'} />
      )}
    </div>
  );
}
