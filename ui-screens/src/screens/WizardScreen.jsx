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
import { STORY_MEDIUMS, PRIMARY_GENRES, TONAL_TYPES, CONTENT_RATINGS } from '../lib/constants';
import { generateSeed, roll } from '../lib/randomEngine';

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
  const userMode = useSettingsStore(s => s.mode) || 'advanced';

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

  // Route-specific handlers
  const handleDecompose = async () => {
    setIsProcessing(true);
    const seed = generateSeed();
    await createProject({
      title: 'Decomposed Story',
      medium: 'novel',
      seed,
      metadata: {
        mode: 'decompose',
        material: formData.materialContent,
      },
    });
    navigate('/workspace');
  };

  const handleRetell = async () => {
    setIsProcessing(true);
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
  };

  const handleSpinoff = async () => {
    setIsProcessing(true);
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
  };

  const handleSequel = async () => {
    setIsProcessing(true);
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
  };

  const handlePrequel = async () => {
    setIsProcessing(true);
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
    return <DecomposeMode formData={formData} setFormData={setFormData} onComplete={handleDecompose} />;
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
            {/* Simple Mode */}
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

            {/* Advanced Mode */}
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

function DecomposeMode({ formData, setFormData, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
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
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <Upload size={40} style={{ margin: '0 auto 20px', color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Decompose a Story</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            Paste or upload an existing story to reverse-engineer its narrative structure.
          </p>

          <Card style={{ padding: 24, background: 'var(--bg-tertiary)', marginBottom: 24 }}>
            <textarea
              placeholder="Paste your story here..."
              value={formData.materialContent}
              onChange={(e) => setFormData(prev => ({ ...prev, materialContent: e.target.value }))}
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              {formData.materialContent.length} characters
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => navigate('/hub')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!formData.materialContent.trim() || isProcessing}
            >
              Decompose
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
