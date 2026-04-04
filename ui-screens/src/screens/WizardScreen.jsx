import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import {
  ChevronRight, ChevronLeft, Dice6, Upload, Sparkles, Check,
  Wand2, FileText, BookOpen, Settings, ArrowRight, X
} from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useLlmStore } from '../stores/llmStore';
import { STORY_MEDIUMS, PRIMARY_GENRES, TONAL_TYPES, CONTENT_RATINGS } from '../lib/constants';
import { generateSeed, roll } from '../lib/randomEngine';
import { decomposeStory, splitSectionsMechanically, getSectionUnitForMedium } from '../services/decomposition';
import ManualSplitter from '../components/ManualSplitter';

/**
 * Derive a clean project title from a filename.
 * Strips extension, replaces dashes/underscores with spaces,
 * collapses whitespace, and title-cases the result.
 * Preserves date-like patterns (e.g. "2024-01-15") by not
 * replacing dashes between digits.
 */
function cleanFilenameToTitle(filename) {
  if (!filename) return '';
  // Strip extension
  let name = filename.replace(/\.\w+$/, '');
  // Replace dashes that are NOT between two digits (preserve dates like 2024-01-15)
  name = name.replace(/(?<!\d)-(?!\d)/g, ' ');
  // Replace underscores with spaces
  name = name.replace(/_/g, ' ');
  // Collapse multiple spaces
  name = name.replace(/\s+/g, ' ').trim();
  // Title case: capitalize first letter of each word
  name = name.replace(/\b\w/g, c => c.toUpperCase());
  return name;
}

/**
 * Try to extract a title from the first few lines of text content.
 * Looks for markdown headings, short first lines, or "Title:" patterns.
 */
function extractTitleFromText(text) {
  if (!text) return '';
  const lines = text.trim().split('\n').slice(0, 15);
  // Check for markdown heading
  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) return headingMatch[1].trim();
  }
  // Check for "Title: ..." pattern
  for (const line of lines) {
    const titleMatch = line.match(/^title\s*[:=]\s*(.+)/i);
    if (titleMatch) return titleMatch[1].trim();
  }
  // Use first non-empty line if it's short enough to be a title
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && trimmed.length < 120 && !trimmed.includes('.')) {
      return trimmed;
    }
  }
  return '';
}

const WORD_COUNT_PRESETS = {
  'short': { label: 'Short', min: 1000, max: 5000 },
  'medium': { label: 'Medium', min: 5000, max: 20000 },
  'long': { label: 'Long', min: 20000, max: 60000 },
  'epic': { label: 'Epic', min: 60000, max: 150000 },
};

const POV_OPTIONS = [
  { key: 'single', label: 'Single POV', desc: 'One character throughout' },
  { key: 'multiple', label: 'Multiple POV', desc: 'Switch between characters' },
  { key: 'omniscient', label: 'Omniscient', desc: 'All-knowing narrator' },
];

const PACING_OPTIONS = [
  { key: 'fast', label: 'Fast Paced', desc: 'Action-driven, quick cuts' },
  { key: 'balanced', label: 'Balanced', desc: 'Mix of action and introspection' },
  { key: 'deep', label: 'Deep Dive', desc: 'Slow burn, character immersion' },
];

const SERIES_OPTIONS = [
  { key: 'standalone', label: 'Standalone', desc: 'Single complete work' },
  { key: 'duology', label: 'Duology', desc: 'Two-book series' },
  { key: 'trilogy', label: 'Trilogy', desc: 'Three-book series' },
  { key: 'ongoing', label: 'Ongoing', desc: 'Open-ended series' },
];

const WORKSPACE_STYLES = [
  { key: 'guided', label: 'Guide me step by step', desc: 'Linear phase progression with checkpoints' },
  { key: 'explore', label: 'Let me explore', desc: 'Non-linear, open workspace' },
];

export default function WizardScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'new';

  const createProject = useProjectStore(s => s.createProject);
  const updateFile = useProjectStore(s => s.updateFile);
  const setActiveProject = useProjectStore(s => s.setActiveProject);
  const userMode = useSettingsStore(s => s.mode) || 'advanced';
  const sendMessage = useLlmStore(s => s.sendMessage);
  const activeProviders = useLlmStore(s => s.activeProviders);

  // Wizard state
  const [wizardMode, setWizardMode] = useState(null); // 'simple' | 'advanced'
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: 'Untitled Story',
    medium: 'novel',
    primaryGenre: '',
    secondaryGenre: '',
    toralType: '',
    contentRating: 'PG-13',
    wordCountTarget: 'medium',
    pov: 'single',
    pacing: 'balanced',
    seriesType: 'standalone',
    seriesPosition: 1,
    hasMaterial: 'none',
    materialContent: '',
    startingPhase: 1,
    workspaceStyle: 'guided',
    authorName: 'Me',
    seed: null,
  });

  const [diceAnimation, setDiceAnimation] = useState(false);
  const fileInputRef = useRef(null);

  // Decompose progress state — lifted here so DecomposeMode can display it
  const [decomposeProgress, setDecomposeProgress] = useState(null); // { label, completed, total }
  const [decomposeError, setDecomposeError] = useState(null); // string or null
  const [showManualSplitter, setShowManualSplitter] = useState(false);
  // Temporarily store partial decomposition results while manual splitting
  const [partialDecomposeProject, setPartialDecomposeProject] = useState(null);

  // Route-specific handlers
  const handleDecompose = async (intent) => {
    setIsProcessing(true);
    setDecomposeError(null);
    setDecomposeProgress(null);

    // Check if LLM providers are configured
    const hasProviders = activeProviders && activeProviders.length > 0;
    if (!hasProviders) {
      setDecomposeError('no-llm');
      setIsProcessing(false);
      return;
    }

    try {
      const seed = generateSeed();
      const sourceText = formData.materialContent.trim();
      const rawTitle = formData.title?.trim();
      const title = (rawTitle && rawTitle !== 'Untitled Story')
        ? rawTitle
        : extractTitleFromText(sourceText) || 'Decomposed Story';

      setDecomposeProgress({ label: 'Creating project...', completed: 0, total: 13 });

      // Create the project first
      const project = await createProject({
        title,
        medium: 'novel',
        seed,
        metadata: {
          mode: 'decompose',
          decomposeIntent: intent || 'research',
          importedAt: new Date().toISOString(),
        },
      });

      // Run decomposition service to extract story structure via LLM
      const medium = formData.medium || 'novel';
      const { files: decomposedFiles, metadata: decompositionMeta } = await decomposeStory(
        sendMessage,
        sourceText,
        {
          title,
          medium,
          onProgress: (progress) => {
            setDecomposeProgress({
              label: progress.label,
              completed: progress.completed + 1, // +1 for the "creating project" step
              total: progress.total + 1,
            });
          },
        }
      );

      setDecomposeProgress({ label: 'Saving files...', completed: 13, total: 13 });

      // Populate project with decomposed files
      for (const [filePath, content] of Object.entries(decomposedFiles)) {
        await updateFile(filePath, content);
      }

      // Also store the original full text
      await updateFile('story/full-draft.md', sourceText);

      // If the section split failed, offer manual splitting before finishing
      if (decompositionMeta.splitFailed) {
        await setActiveProject(project.id);
        setPartialDecomposeProject(project);
        setIsProcessing(false);
        setShowManualSplitter(true);
        return;
      }

      // Mark all phases 1-7 as complete since we decomposed a finished work
      const updateProject = useProjectStore.getState().updateProject;
      await setActiveProject(project.id);
      await updateProject({
        currentPhase: 8,
        phaseAnswers: {
          1: { 1: '(Decomposed from manuscript)', 2: '(Decomposed)', 3: '(Decomposed)', 4: '(Decomposed)', _decomposed: true },
          2: { 1: '(Decomposed from manuscript)', 2: '(Decomposed)', 3: '(Decomposed)', _decomposed: true },
          3: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', 4: '(Decomposed)', 5: '(Decomposed)', 6: '(Decomposed)', 7: '(Decomposed)', 8: '(Decomposed)', _decomposed: true },
          4: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', 4: '(Decomposed)', _decomposed: true },
          5: { 1: '(Decomposed)', 2: '(Decomposed)', _decomposed: true },
          6: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', _decomposed: true },
          7: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', _decomposed: true },
        },
      });

      navigate('/workspace');
    } catch (err) {
      console.error('Decomposition failed:', err);
      // If the chapter/section split specifically failed, offer manual splitting
      if (err.message === 'auto-split-failed') {
        setDecomposeError(null);
        setIsProcessing(false);
        setShowManualSplitter(true);
        return;
      }
      setDecomposeError(err.message || 'Unknown error');
      setIsProcessing(false);
    }
  };

  // Handle manual split results — user finished manually splitting sections
  const handleManualSplitComplete = async ({ files: sectionFiles, unitLabel, unitSlug }) => {
    try {
      setShowManualSplitter(false);
      setIsProcessing(true);
      setDecomposeProgress({ label: 'Saving manual sections...', completed: 12, total: 13 });

      // Write the manual section files to the project
      for (const [filePath, content] of Object.entries(sectionFiles)) {
        await updateFile(filePath, content);
      }

      // Finalize the project: mark all phases as complete
      const updateProject = useProjectStore.getState().updateProject;
      await updateProject({
        currentPhase: 8,
        phaseAnswers: {
          1: { 1: '(Decomposed from manuscript)', 2: '(Decomposed)', 3: '(Decomposed)', 4: '(Decomposed)', _decomposed: true },
          2: { 1: '(Decomposed from manuscript)', 2: '(Decomposed)', 3: '(Decomposed)', _decomposed: true },
          3: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', 4: '(Decomposed)', 5: '(Decomposed)', 6: '(Decomposed)', 7: '(Decomposed)', 8: '(Decomposed)', _decomposed: true },
          4: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', 4: '(Decomposed)', _decomposed: true },
          5: { 1: '(Decomposed)', 2: '(Decomposed)', _decomposed: true },
          6: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', _decomposed: true },
          7: { 1: '(Decomposed)', 2: '(Decomposed)', 3: '(Decomposed)', _decomposed: true },
        },
      });

      setDecomposeProgress({ label: 'Complete', completed: 13, total: 13 });
      navigate('/workspace');
    } catch (err) {
      console.error('Failed to save manual sections:', err);
      setDecomposeError(err.message || 'Failed to save sections');
      setIsProcessing(false);
    }
  };

  const handleRoughDraft = async () => {
    setIsProcessing(true);
    try {
      const seed = generateSeed();
      const sourceText = formData.materialContent.trim();
      const rawDraftTitle = formData.title?.trim();
      const title = (rawDraftTitle && rawDraftTitle !== 'Untitled Story')
        ? rawDraftTitle
        : extractTitleFromText(sourceText) || 'Imported Draft';
      const medium = formData.medium || 'novel';

      // Create project
      const project = await createProject({
        title,
        medium,
        seed,
        genre: formData.genre || '',
        metadata: {
          mode: 'roughdraft',
          importedAt: new Date().toISOString(),
        },
      });

      // Split the draft into chapters if possible, or store as one file
      const chapterRegex = /^#{1,3}\s*chapter\s*\d+|^chapter\s*\d+/gim;
      const chapterSplits = sourceText.split(chapterRegex).filter(s => s.trim());

      if (chapterSplits.length > 1) {
        // Multiple chapters detected
        for (let i = 0; i < chapterSplits.length; i++) {
          await updateFile(`story/chapter-${String(i + 1).padStart(2, '0')}.md`, chapterSplits[i].trim());
        }
      } else {
        // Single body — store as full draft
        await updateFile('story/full-draft.md', sourceText);
      }

      // Set active and navigate
      await setActiveProject(project.id);
      navigate('/workspace');
    } catch (err) {
      console.error('Rough draft import failed:', err);
      setIsProcessing(false);
      alert('Import failed. Please check the console for details.');
    }
  };

  const handleRetell = async () => {
    setIsProcessing(true);
    try {
      const seed = generateSeed();
      await createProject({
        title: formData.title || 'Retold Story',
        medium: formData.medium || 'novel',
        seed,
        metadata: {
          mode: 'retell',
          originalMaterial: formData.materialContent,
        },
      });
      navigate('/workspace');
    } catch (err) {
      console.error('Retell project creation failed:', err);
      setIsProcessing(false);
      alert('Failed to create retold story. Please try again.');
    }
  };

  const handleSpinoff = async () => {
    setIsProcessing(true);
    try {
      const seed = generateSeed();
      await createProject({
        title: formData.title || 'Spinoff',
        medium: formData.medium || 'novel',
        seed,
        metadata: {
          mode: 'spinoff',
          baseMaterial: formData.materialContent,
        },
      });
      navigate('/workspace');
    } catch (err) {
      console.error('Spinoff project creation failed:', err);
      setIsProcessing(false);
      alert('Failed to create spinoff. Please try again.');
    }
  };

  const handleSequel = async () => {
    setIsProcessing(true);
    try {
      const seed = generateSeed();
      await createProject({
        title: formData.title || 'Sequel',
        medium: formData.medium || 'novel',
        seed,
        metadata: {
          mode: 'sequel',
          baseMaterial: formData.materialContent,
        },
      });
      navigate('/workspace');
    } catch (err) {
      console.error('Sequel project creation failed:', err);
      setIsProcessing(false);
      alert('Failed to create sequel. Please try again.');
    }
  };

  const handlePrequel = async () => {
    setIsProcessing(true);
    try {
      const seed = generateSeed();
      await createProject({
        title: formData.title || 'Prequel',
        medium: formData.medium || 'novel',
        seed,
        metadata: {
          mode: 'prequel',
          baseMaterial: formData.materialContent,
        },
      });
      navigate('/workspace');
    } catch (err) {
      console.error('Prequel project creation failed:', err);
      setIsProcessing(false);
      alert('Failed to create prequel. Please try again.');
    }
  };

  // New story flow
  const handleCompleteWizard = async () => {
    setIsProcessing(true);
    try {
      const seed = formData.seed || generateSeed();

      const medium = STORY_MEDIUMS.find(m => m.key === formData.medium);
      const wordRange = medium?.wordRange || [50000, 120000];
      const wordCountPreset = WORD_COUNT_PRESETS[formData.wordCountTarget] || WORD_COUNT_PRESETS.medium;
      const wordGoal = (wordCountPreset.min + wordCountPreset.max) / 2;

      await createProject({
        title: formData.title,
        medium: formData.medium,
        genre: formData.primaryGenre,
        seed,
        metadata: {
          secondaryGenre: formData.secondaryGenre,
          toralType: formData.toralType,
          contentRating: formData.contentRating,
          pov: formData.pov,
          pacing: formData.pacing,
          seriesType: formData.seriesType,
          seriesPosition: formData.seriesPosition,
          wordGoal,
          workspaceStyle: formData.workspaceStyle,
          authorName: formData.authorName,
          hasMaterial: formData.hasMaterial,
          startingPhase: formData.startingPhase,
        },
      });

      navigate('/workspace');
    } catch (err) {
      console.error('Failed to create project:', err);
      setIsProcessing(false);
    }
  };

  // Handle special modes that bypass wizard
  useEffect(() => {
    if (mode === 'import') {
      navigate('/workspace?mode=import');
    }
  }, [mode, navigate]);

  // Roll for genre
  const handleRollGenre = () => {
    setDiceAnimation(true);
    setTimeout(() => {
      const seed = formData.seed || generateSeed();
      const rolled = roll(seed, 1, PRIMARY_GENRES.length);
      setFormData(prev => ({
        ...prev,
        primaryGenre: PRIMARY_GENRES[rolled.value - 1],
      }));
      setDiceAnimation(false);
    }, 400);
  };

  const handleRollTone = () => {
    setDiceAnimation(true);
    setTimeout(() => {
      const seed = formData.seed || generateSeed();
      const rolled = roll(seed, 2, TONAL_TYPES.length);
      setFormData(prev => ({
        ...prev,
        toralType: TONAL_TYPES[rolled.value - 1],
      }));
      setDiceAnimation(false);
    }, 400);
  };

  // Navigation
  const nextStep = () => {
    if (wizardMode === 'advanced') {
      setCurrentStep(prev => prev + 1);
    } else {
      // Simple mode: fewer steps
      if (currentStep === 0) setCurrentStep(1);
      else if (currentStep === 1) setCurrentStep(2);
      else if (currentStep === 2) handleCompleteWizard();
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Special route handlers
  if (mode === 'decompose') {
    // Show manual splitter if auto-split failed
    if (showManualSplitter) {
      return (
        <ManualSplitter
          sourceText={formData.materialContent}
          medium={formData.medium || 'novel'}
          onComplete={handleManualSplitComplete}
          onCancel={() => { setShowManualSplitter(false); }}
        />
      );
    }
    return <DecomposeMode formData={formData} setFormData={setFormData} onComplete={handleDecompose} progress={decomposeProgress} error={decomposeError} onClearError={() => setDecomposeError(null)} />;
  }
  if (mode === 'retell') {
    return <RetellMode formData={formData} setFormData={setFormData} onComplete={handleRetell} />;
  }
  if (mode === 'spinoff') {
    return <SpinoffMode formData={formData} setFormData={setFormData} onComplete={handleSpinoff} />;
  }
  if (mode === 'sequel') {
    return <SequelMode formData={formData} setFormData={setFormData} onComplete={handleSequel} />;
  }
  if (mode === 'prequel') {
    return <PrequelMode formData={formData} setFormData={setFormData} onComplete={handlePrequel} />;
  }
  if (mode === 'roughdraft') {
    return <RoughDraftMode formData={formData} setFormData={setFormData} onComplete={handleRoughDraft} />;
  }

  // Mode selector (if not yet chosen)
  if (wizardMode === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 20,
        animation: 'fadeIn 0.4s ease forwards',
      }}>
        <div style={{ maxWidth: 600, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.9 }}>✦</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Create Your Story</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Choose how much guidance you'd like as you set up your project.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {/* Quick Start */}
            <Card
              onClick={() => setWizardMode('simple')}
              hoverable
              style={{ cursor: 'pointer', padding: 28, textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>⚡</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Quick Start</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                Skip the details. Just give it a title and medium.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3 questions</div>
            </Card>

            {/* Full Wizard */}
            <Card
              onClick={() => setWizardMode('advanced')}
              hoverable
              style={{ cursor: 'pointer', padding: 28, textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🧭</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Full Wizard</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                Deep dive. Genre, tone, format, series, and more.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>8 questions</div>
            </Card>

            {/* Decompose a Story */}
            <Card
              onClick={() => navigate('/wizard?mode=decompose')}
              hoverable
              style={{ cursor: 'pointer', padding: 28, textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🔬</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Decompose a Story</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                Upload a finished work and reverse-engineer its structure.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>upload a file</div>
            </Card>

            {/* Upload Rough Draft */}
            <Card
              onClick={() => navigate('/wizard?mode=roughdraft')}
              hoverable
              style={{ cursor: 'pointer', padding: 28, textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>📝</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Upload Rough Draft</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                Import your existing draft and build the project around it.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>upload a file</div>
            </Card>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button variant="ghost" onClick={() => navigate('/hub')}>
              ← Back to Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine steps and current step content
  const isAdvanced = wizardMode === 'advanced';
  const maxSteps = isAdvanced ? 8 : 3;

  // Calculate progress
  const progressPct = Math.round(((currentStep + 1) / maxSteps) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
      animation: 'fadeIn 0.4s ease forwards',
    }}>
      <div style={{ width: '100%', maxWidth: 700 }}>

        {/* Progress Indicator */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            height: 3,
            background: 'var(--bg-tertiary)',
            borderRadius: 100,
            overflow: 'hidden',
            marginBottom: 12,
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--accent)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Step {currentStep + 1} of {maxSteps}
          </div>
        </div>

        {/* Step Content */}
        <Card style={{
          padding: 40,
          marginBottom: 20,
          animation: 'fadeIn 0.3s ease forwards',
        }}>

          {isAdvanced ? (
            // ADVANCED MODE STEPS
            <>
              {currentStep === 0 && <StepMedium formData={formData} setFormData={setFormData} />}
              {currentStep === 1 && <StepGenre formData={formData} setFormData={setFormData} onRoll={handleRollGenre} onRollTone={handleRollTone} diceAnim={diceAnimation} />}
              {currentStep === 2 && <StepFormat formData={formData} setFormData={setFormData} />}
              {currentStep === 3 && <StepSeries formData={formData} setFormData={setFormData} />}
              {currentStep === 4 && <StepMaterials formData={formData} setFormData={setFormData} fileInputRef={fileInputRef} />}
              {currentStep === 5 && <StepStartingPhase formData={formData} setFormData={setFormData} />}
              {currentStep === 6 && <StepWorkspaceStyle formData={formData} setFormData={setFormData} />}
              {currentStep === 7 && <StepTitleAuthor formData={formData} setFormData={setFormData} />}
            </>
          ) : (
            // SIMPLE MODE STEPS
            <>
              {currentStep === 0 && <StepMedium formData={formData} setFormData={setFormData} />}
              {currentStep === 1 && <StepSimpleGenre formData={formData} setFormData={setFormData} onRoll={handleRollGenre} diceAnim={diceAnimation} />}
              {currentStep === 2 && <StepSimpleTitleAuthor formData={formData} setFormData={setFormData} />}
            </>
          )}
        </Card>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} /> Back
          </Button>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={currentStep === maxSteps - 1 ? handleCompleteWizard : nextStep}
              disabled={isProcessing}
            >
              {currentStep === maxSteps - 1 ? (
                <> Create Project <Check size={16} /> </>
              ) : (
                <> Next <ChevronRight size={16} /> </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// STEP COMPONENTS
// ──────────────────────────────────────────────────────────────────────

function StepMedium({ formData, setFormData }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>What type of story?</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Choose the medium or format of your work.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {STORY_MEDIUMS.map(medium => (
          <Card
            key={medium.key}
            active={formData.medium === medium.key}
            onClick={() => setFormData(prev => ({ ...prev, medium: medium.key }))}
            hoverable
            style={{
              cursor: 'pointer',
              padding: 20,
              transition: 'var(--transition)',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              {medium.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {medium.wordRange[0].toLocaleString()} – {medium.wordRange[1].toLocaleString()} words
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function StepGenre({ formData, setFormData, onRoll, onRollTone, diceAnim }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Genre & Tone</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Pick your primary genre and optional tone.
      </p>

      {/* Primary Genre */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Primary Genre</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRoll}
            style={{
              fontSize: '0.75rem',
              gap: 4,
              animation: diceAnim ? 'spin 0.4s ease' : 'none',
            }}
          >
            <Dice6 size={12} /> Roll
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PRIMARY_GENRES.map(genre => (
            <Card
              key={genre}
              active={formData.primaryGenre === genre}
              onClick={() => setFormData(prev => ({ ...prev, primaryGenre: genre }))}
              hoverable
              style={{
                cursor: 'pointer',
                padding: 12,
                fontSize: '0.85rem',
                transition: 'var(--transition)',
              }}
            >
              {genre}
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary Genre */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 12 }}>
          Secondary Genre (optional)
        </label>
        <input
          type="text"
          placeholder="e.g., Noir, Steampunk, Cozy Mystery"
          value={formData.secondaryGenre}
          onChange={(e) => setFormData(prev => ({ ...prev, secondaryGenre: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Tonal Type */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tonal Type (optional)</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRollTone}
            style={{
              fontSize: '0.75rem',
              gap: 4,
              animation: diceAnim ? 'spin 0.4s ease' : 'none',
            }}
          >
            <Dice6 size={12} /> Roll
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {TONAL_TYPES.map(tone => (
            <Card
              key={tone}
              active={formData.toralType === tone}
              onClick={() => setFormData(prev => ({ ...prev, toralType: tone }))}
              hoverable
              style={{
                cursor: 'pointer',
                padding: 10,
                fontSize: '0.8rem',
                textAlign: 'center',
                transition: 'var(--transition)',
              }}
            >
              {tone}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function StepSimpleGenre({ formData, setFormData, onRoll, diceAnim }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Pick a Genre</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Choose a genre, or roll for a surprise.
      </p>

      <div style={{ marginBottom: 20 }}>
        <Button
          variant="primary"
          onClick={onRoll}
          style={{
            width: '100%',
            justifyContent: 'center',
            marginBottom: 16,
            fontSize: '0.95rem',
            animation: diceAnim ? 'spin 0.4s ease' : 'none',
          }}
        >
          <Dice6 size={18} /> Roll for me
        </Button>
      </div>

      {formData.primaryGenre && (
        <Card style={{ padding: 16, textAlign: 'center', marginBottom: 20, background: 'var(--accent-glow)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>You selected:</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formData.primaryGenre}</div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {PRIMARY_GENRES.map(genre => (
          <Card
            key={genre}
            active={formData.primaryGenre === genre}
            onClick={() => setFormData(prev => ({ ...prev, primaryGenre: genre }))}
            hoverable
            style={{
              cursor: 'pointer',
              padding: 12,
              fontSize: '0.85rem',
              transition: 'var(--transition)',
            }}
          >
            {genre}
          </Card>
        ))}
      </div>
    </>
  );
}

function StepFormat({ formData, setFormData }) {
  const medium = STORY_MEDIUMS.find(m => m.key === formData.medium);

  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Story Format</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Choose your narrative style and target length.
      </p>

      {/* Word Count Target */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 12 }}>
          Target Word Count
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(WORD_COUNT_PRESETS).map(([key, preset]) => (
            <Card
              key={key}
              active={formData.wordCountTarget === key}
              onClick={() => setFormData(prev => ({ ...prev, wordCountTarget: key }))}
              hoverable
              style={{ cursor: 'pointer', padding: 16, textAlign: 'center' }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{preset.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {preset.min.toLocaleString()} – {preset.max.toLocaleString()}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Point of View */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 12 }}>
          Point of View
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {POV_OPTIONS.map(opt => (
            <Card
              key={opt.key}
              active={formData.pov === opt.key}
              onClick={() => setFormData(prev => ({ ...prev, pov: opt.key }))}
              hoverable
              style={{ cursor: 'pointer', padding: 16 }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pacing */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 12 }}>
          Pacing
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {PACING_OPTIONS.map(opt => (
            <Card
              key={opt.key}
              active={formData.pacing === opt.key}
              onClick={() => setFormData(prev => ({ ...prev, pacing: opt.key }))}
              hoverable
              style={{ cursor: 'pointer', padding: 16 }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function StepSeries({ formData, setFormData }) {
  const isSeriesType = formData.seriesType !== 'standalone';

  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Series Info</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Is this a standalone work or part of a series?
      </p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SERIES_OPTIONS.map(opt => (
            <Card
              key={opt.key}
              active={formData.seriesType === opt.key}
              onClick={() => setFormData(prev => ({ ...prev, seriesType: opt.key }))}
              hoverable
              style={{ cursor: 'pointer', padding: 16 }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {isSeriesType && (
        <Card style={{ padding: 16, background: 'var(--bg-tertiary)' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Position in series
          </label>
          <input
            type="number"
            min="1"
            value={formData.seriesPosition}
            onChange={(e) => setFormData(prev => ({ ...prev, seriesPosition: parseInt(e.target.value) || 1 }))}
            style={{
              width: '100%',
              padding: '8px 10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />
        </Card>
      )}
    </>
  );
}

function StepMaterials({ formData, setFormData, fileInputRef }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Existing Material</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Do you have existing work to base this on?
      </p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { key: 'none', label: 'None', desc: 'Starting fresh' },
            { key: 'paste', label: 'Paste Text', desc: 'Existing work' },
          ].map(opt => (
            <Card
              key={opt.key}
              active={formData.hasMaterial === opt.key}
              onClick={() => setFormData(prev => ({ ...prev, hasMaterial: opt.key, materialContent: opt.key === 'none' ? '' : prev.materialContent }))}
              hoverable
              style={{ cursor: 'pointer', padding: 16, textAlign: 'center' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{opt.label}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{opt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {formData.hasMaterial === 'paste' && (
        <Card style={{ padding: 16, background: 'var(--bg-tertiary)' }}>
          <textarea
            placeholder="Paste your existing work here..."
            value={formData.materialContent}
            onChange={(e) => setFormData(prev => ({ ...prev, materialContent: e.target.value }))}
            style={{
              width: '100%',
              height: 150,
              padding: '10px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            {formData.materialContent.length} characters
          </div>
        </Card>
      )}
    </>
  );
}

function StepStartingPhase({ formData, setFormData }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Starting Point</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Where should we begin building your story?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { id: 1, label: 'Phase 1: Author', desc: 'From your vision' },
          { id: 6, label: 'Phase 6: Story', desc: 'From the ending' },
          { id: 8, label: 'Phase 8: Execution', desc: 'Start drafting' },
          { id: 0, label: 'Custom', desc: 'Pick later' },
        ].map(opt => (
          <Card
            key={opt.id}
            active={formData.startingPhase === opt.id}
            onClick={() => setFormData(prev => ({ ...prev, startingPhase: opt.id }))}
            hoverable
            style={{ cursor: 'pointer', padding: 16 }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
          </Card>
        ))}
      </div>
    </>
  );
}

function StepWorkspaceStyle({ formData, setFormData }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Workspace Style</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        How would you like to work?
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {WORKSPACE_STYLES.map(opt => (
          <Card
            key={opt.key}
            active={formData.workspaceStyle === opt.key}
            onClick={() => setFormData(prev => ({ ...prev, workspaceStyle: opt.key }))}
            hoverable
            style={{ cursor: 'pointer', padding: 20 }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>{opt.label}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
          </Card>
        ))}
      </div>
    </>
  );
}

function StepTitleAuthor({ formData, setFormData }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Final Details</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        Give your story a title and author name.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Story Title
        </label>
        <input
          type="text"
          placeholder="e.g., The Midnight Garden"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Author Name
        </label>
        <input
          type="text"
          placeholder="Your name"
          value={formData.authorName}
          onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      <Card style={{ padding: 16, background: 'var(--bg-tertiary)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          <strong>Your Seed:</strong>
        </div>
        <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {formData.seed?.toString() || 'Will generate on project creation'}
        </div>
      </Card>
    </>
  );
}

function StepSimpleTitleAuthor({ formData, setFormData }) {
  return (
    <>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Your Story Details</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
        That's it! Just give it a name.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Story Title
        </label>
        <input
          type="text"
          placeholder="e.g., The Midnight Garden"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            marginBottom: 16,
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Author Name (optional)
        </label>
        <input
          type="text"
          placeholder="Your name"
          value={formData.authorName}
          onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      <Card style={{ padding: 16, background: 'var(--accent-glow)', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Ready to start? Click Create Project below!
        </div>
      </Card>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SPECIAL MODE COMPONENTS
// ──────────────────────────────────────────────────────────────────────

const DECOMPOSE_INTENTS = [
  { key: 'research', label: 'Research / Fun', icon: '🔍', desc: 'Just exploring — I want to study how this story works structurally.' },
  { key: 'build', label: 'Build On Top', icon: '🏗️', desc: 'I want to extend, remix, or create a sequel/prequel from this foundation.' },
  { key: 'adapt', label: 'Remix / Adapt', icon: '✨', desc: 'I want to reimagine this — new genre, medium (play, musical), or POV (like turning Wizard of Oz into Wicked).' },
];

function DecomposeMode({ formData, setFormData, onComplete, progress, error, onClearError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [multiFileMode, setMultiFileMode] = useState(false);
  const [additionalFiles, setAdditionalFiles] = useState([]); // for series support

  const handleComplete = async () => {
    setIsProcessing(true);
    // Store intent in formData metadata
    setFormData(prev => ({ ...prev, decomposeIntent: selectedIntent }));
    await onComplete(selectedIntent);
    // If we're still mounted (error case), reset processing
    setIsProcessing(false);
  };

  const handleShowIntent = () => {
    setShowIntentModal(true);
  };

  const readFile = (file) => {
    setFileName(file.name);
    const titleFromFile = cleanFilenameToTitle(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const titleFromText = extractTitleFromText(content);
      const title = titleFromText || titleFromFile || '';
      setFormData(prev => ({ ...prev, materialContent: content, title }));
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const hasContent = formData.materialContent.trim().length > 0;

  // ── No-LLM error screen ──────────────────────────────────
  if (error === 'no-llm') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 20,
      }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <Settings size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>AI Provider Required</h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Decomposition uses AI to reverse-engineer narrative structure from your manuscript. You need to connect at least one AI provider first.
            </p>
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '16px 20px',
              marginBottom: 24,
              textAlign: 'left',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>How to connect:</div>
              <div>1. Open <strong>Settings</strong> from the menu</div>
              <div>2. Add an AI provider (Anthropic, OpenAI, Google, etc.)</div>
              <div>3. Paste your API key and test the connection</div>
              <div>4. Come back here and retry</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => { onClearError(); }}>
                Back
              </Button>
              <Button variant="primary" onClick={() => navigate('/settings')}>
                <Settings size={16} style={{ marginRight: 6 }} />
                Open Settings
              </Button>
              <Button variant="secondary" onClick={() => { onClearError(); handleComplete(); }}>
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Processing / progress screen ──────────────────────────
  if (isProcessing && progress) {
    const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 20,
      }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <Sparkles size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Decomposing Story</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
              {formData.title || 'Your manuscript'}
            </p>

            {/* Progress bar */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md, 8px)',
              overflow: 'hidden',
              height: 8,
              marginBottom: 16,
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: 'var(--accent)',
                borderRadius: 'var(--radius-md, 8px)',
                transition: 'width 0.5s ease',
              }} />
            </div>

            {/* Step label */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              {progress.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Step {progress.completed} of {progress.total}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Error screen (non-LLM errors) ────────────────────────
  if (error && error !== 'no-llm') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 20,
      }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <X size={40} style={{ margin: '0 auto 20px', color: 'var(--health-just-started, #ef4444)' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>Decomposition Failed</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
              Something went wrong during decomposition.
            </p>
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              marginBottom: 24,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
              textAlign: 'left',
              wordBreak: 'break-word',
            }}>
              {error}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => { onClearError(); }}>
                Back
              </Button>
              <Button variant="primary" onClick={() => { onClearError(); handleComplete(); }}>
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main upload screen ────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <Upload size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Decompose a Story</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            Upload a text file or paste content to reverse-engineer its narrative structure.
          </p>

          {/* File upload zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.rtf,.html,.htm,.fountain"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div
            onClick={() => !hasContent && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : hasContent ? 'var(--border-success, #4ade80)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: hasContent ? '16px' : '32px 24px',
              marginBottom: 24,
              cursor: hasContent ? 'default' : 'pointer',
              background: dragOver ? 'rgba(var(--accent-rgb, 255,170,50), 0.05)' : 'var(--bg-tertiary)',
              transition: 'all 0.2s ease',
            }}
          >
            {hasContent ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <FileText size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {fileName || 'Pasted content'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, materialContent: '', title: '' }));
                      setFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 4, display: 'flex',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formData.materialContent.length.toLocaleString()} characters
                  {' · '}
                  ~{Math.round(formData.materialContent.split(/\s+/).filter(Boolean).length).toLocaleString()} words
                </div>
                {/* Show derived title (only when it's been auto-detected, not the default) */}
                {formData.title && formData.title !== 'Untitled Story' && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 6 }}>
                    Title: {formData.title}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Upload size={24} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>
                  Drop a file here or click to browse
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  .txt, .md, .rtf, .html, .fountain
                </div>
              </div>
            )}
          </div>

          {/* Or paste manually (collapsible) */}
          {!hasContent && (
            <details style={{ marginBottom: 24, textAlign: 'left' }}>
              <summary style={{
                fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer',
                marginBottom: 12, textAlign: 'center',
              }}>
                Or paste text directly
              </summary>
              <textarea
                placeholder="Paste your story here..."
                value={formData.materialContent}
                onChange={(e) => {
                  const val = e.target.value;
                  const title = extractTitleFromText(val);
                  setFormData(prev => ({ ...prev, materialContent: val, ...(title ? { title } : {}) }));
                }}
                style={{
                  width: '100%',
                  height: 200,
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </details>
          )}

          {/* Multi-file series toggle */}
          {hasContent && (
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={multiFileMode}
                  onChange={(e) => setMultiFileMode(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                This is part of a series (add more books)
              </label>
            </div>
          )}

          {/* Series file list */}
          {multiFileMode && hasContent && (
            <div style={{
              marginBottom: 20, padding: 16, background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                Series Books ({1 + additionalFiles.length} total)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--accent)' }}>
                  <span style={{ fontWeight: 600 }}>1.</span> {formData.title || fileName || 'Book 1'} (primary)
                </div>
                {additionalFiles.map((af, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600 }}>{i + 2}.</span>
                    {af.name}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      (~{Math.round(af.content.split(/\s+/).length).toLocaleString()} words)
                    </span>
                    <button
                      onClick={() => setAdditionalFiles(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept=".txt,.md,.rtf,.html,.htm,.fountain"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setAdditionalFiles(prev => [...prev, { name: file.name, content: ev.target.result }]);
                    };
                    reader.readAsText(file);
                  });
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
                id="series-file-input"
              />
              <Button variant="secondary" onClick={() => document.getElementById('series-file-input')?.click()} style={{ fontSize: '0.75rem' }}>
                + Add Next Book
              </Button>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Each book will be decomposed separately with shared world/character data carried forward.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleShowIntent}
              disabled={!hasContent || isProcessing}
            >
              {isProcessing ? 'Decomposing...' : 'Continue →'}
            </Button>
          </div>
        </Card>
      </div>

      {/* ── Intent Modal ── */}
      {showIntentModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, animation: 'fadeIn 0.2s ease',
        }}
          onClick={() => setShowIntentModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-md, 12px)',
              padding: 32, maxWidth: 520, width: '90%',
              border: '1px solid var(--border)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
              What's your goal?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>
              This helps us tailor the decomposition and workspace experience.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {DECOMPOSE_INTENTS.map(intent => (
                <div
                  key={intent.key}
                  onClick={() => setSelectedIntent(intent.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                    border: selectedIntent === intent.key
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)',
                    background: selectedIntent === intent.key
                      ? 'rgba(240,160,80,0.06)'
                      : 'var(--bg-tertiary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{intent.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{intent.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{intent.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setShowIntentModal(false)}>
                Back
              </Button>
              <Button
                variant="primary"
                disabled={!selectedIntent}
                onClick={() => {
                  setShowIntentModal(false);
                  handleComplete();
                }}
              >
                Decompose Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoughDraftMode({ formData, setFormData, onComplete }) {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);
    await onComplete();
  };

  const readFile = (file) => {
    setFileName(file.name);
    const titleFromFile = cleanFilenameToTitle(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const titleFromText = extractTitleFromText(content);
      const title = titleFromText || titleFromFile || '';
      setFormData(prev => ({ ...prev, materialContent: content, title }));
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const hasContent = formData.materialContent.trim().length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <FileText size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Upload Rough Draft</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            Import your existing draft and the engine will build a project scaffold around it.
          </p>

          {/* File upload zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.rtf,.html,.htm,.fountain,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div
            onClick={() => !hasContent && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : hasContent ? 'var(--border-success, #4ade80)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md, 8px)',
              padding: hasContent ? '16px' : '32px 24px',
              marginBottom: 24,
              cursor: hasContent ? 'default' : 'pointer',
              background: dragOver ? 'rgba(var(--accent-rgb, 255,170,50), 0.05)' : 'var(--bg-tertiary)',
              transition: 'all 0.2s ease',
            }}
          >
            {hasContent ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <FileText size={18} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fileName || 'Pasted content'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, materialContent: '', title: '' }));
                      setFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: 4, display: 'flex',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {formData.materialContent.length.toLocaleString()} characters
                  {' · '}
                  ~{Math.round(formData.materialContent.split(/\s+/).filter(Boolean).length).toLocaleString()} words
                </div>
              </div>
            ) : (
              <div>
                <Upload size={24} style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>
                  Drop your draft here or click to browse
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  .txt, .md, .rtf, .html, .fountain
                </div>
              </div>
            )}
          </div>

          {/* Title input */}
          {hasContent && (
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Story Title
              </label>
              <input
                type="text"
                placeholder="Title for your project"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!hasContent || isProcessing}
            >
              {isProcessing ? 'Importing...' : 'Import Draft'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function RetellMode({ formData, setFormData, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsProcessing(true);
    await onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Card style={{ padding: 40 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Retell from Another POV</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
            Tell the same story from a different character's perspective.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Story Title
            </label>
            <input
              type="text"
              placeholder="Original story title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Medium
            </label>
            <select
              value={formData.medium}
              onChange={(e) => setFormData(prev => ({ ...prev, medium: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            >
              {STORY_MEDIUMS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>

          <Card style={{ padding: 16, background: 'var(--bg-tertiary)', marginBottom: 24 }}>
            <textarea
              placeholder="Paste the original story..."
              value={formData.materialContent}
              onChange={(e) => setFormData(prev => ({ ...prev, materialContent: e.target.value }))}
              style={{
                width: '100%',
                height: 150,
                padding: '10px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </Card>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!formData.title.trim() || !formData.materialContent.trim() || isProcessing}
            >
              Create
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SpinoffMode({ formData, setFormData, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsProcessing(true);
    await onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Card style={{ padding: 40 }}>
          <Sparkles size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Write a Spinoff</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
            Create a new story in the same world or with related characters.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Spinoff Title
            </label>
            <input
              type="text"
              placeholder="New story title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Base Story Notes
            </label>
            <textarea
              placeholder="Notes about the original story..."
              value={formData.materialContent}
              onChange={(e) => setFormData(prev => ({ ...prev, materialContent: e.target.value }))}
              style={{
                width: '100%',
                height: 120,
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!formData.title.trim() || isProcessing}
            >
              Create Spinoff
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SequelMode({ formData, setFormData, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsProcessing(true);
    await onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Card style={{ padding: 40 }}>
          <BookOpen size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Write a Sequel</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
            Continue the story with what happens next.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Sequel Title
            </label>
            <input
              type="text"
              placeholder="Sequel title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Previous Story Summary
            </label>
            <textarea
              placeholder="How did the first story end?"
              value={formData.materialContent}
              onChange={(e) => setFormData(prev => ({ ...prev, materialContent: e.target.value }))}
              style={{
                width: '100%',
                height: 120,
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!formData.title.trim() || isProcessing}
            >
              Create Sequel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PrequelMode({ formData, setFormData, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setIsProcessing(true);
    await onComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <Card style={{ padding: 40 }}>
          <Wand2 size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Write a Prequel</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
            Tell the story of what came before.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Prequel Title
            </label>
            <input
              type="text"
              placeholder="Prequel title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8 }}>
              Original Story Context
            </label>
            <textarea
              placeholder="What happens in the original story?"
              value={formData.materialContent}
              onChange={(e) => setFormData(prev => ({ ...prev, materialContent: e.target.value }))}
              style={{
                width: '100%',
                height: 120,
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!formData.title.trim() || isProcessing}
            >
              Create Prequel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
