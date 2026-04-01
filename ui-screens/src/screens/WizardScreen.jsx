import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { BookOpen, Film, Tv, Mic, Gamepad2, Theater, Pen, Globe, Image, Music, Headphones, Layers, ChevronRight } from 'lucide-react';

const categories = [
  { icon: BookOpen, name: 'Novel / Long-Form Prose', subs: ['Novel (Adult)', 'Novel (YA)', 'Novel (Middle Grade)', 'Novella', 'Novelette', 'Serial / Episodic'] },
  { icon: Pen, name: 'Short-Form Prose', subs: ['Short Story', 'Flash Fiction', 'Flash Nonfiction', 'Epistolary'] },
  { icon: Music, name: 'Poetry', subs: ['Poetry Collection', 'Prose Poetry', 'Song / Album'] },
  { icon: Image, name: 'Graphic / Visual', subs: ['Graphic Novel', 'Comic Book / Manga', 'Webcomic'] },
  { icon: Theater, name: 'Stage / Performance', subs: ['Stage Play', 'One-Act Play', 'Musical', 'Opera / Libretto', 'Monologue'] },
  { icon: Film, name: 'Film', subs: ['Feature Film', 'Short Film', 'Animated Film'] },
  { icon: Tv, name: 'Television', subs: ['TV Series (1hr Drama)', 'TV Series (30min)', 'Miniseries', 'Web Series'] },
  { icon: Globe, name: 'Web / Online Video', subs: ['Video Essay', 'Web Series', 'Podcast Script'] },
  { icon: Headphones, name: 'Audio', subs: ['Podcast Fiction', 'Audio Drama', 'Audiobook Script'] },
  { icon: Gamepad2, name: 'Games / Interactive', subs: ['Interactive Fiction', 'Visual Novel', 'Game Narrative', 'TTRPG Module'] },
  { icon: Layers, name: 'Immersive / Emerging', subs: ['VR/AR Narrative', 'Experiential'] },
  { icon: Mic, name: 'Transmedia', subs: ['Cross-Platform Story', 'ARG'] },
];

const steps = [
  { num: 1, label: 'What are you making?' },
  { num: 2, label: 'Genre world' },
  { num: 3, label: 'Story scope' },
  { num: 4, label: 'Connected stories?' },
  { num: 5, label: 'Existing material?' },
  { num: 6, label: 'Where are you?' },
  { num: 7, label: 'How to work?' },
  { num: 8, label: 'Author identity' },
];

export default function WizardScreen() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [submissionTarget, setSubmissionTarget] = useState(null);

  const genres = ['Literary Fiction', 'Thriller', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Horror', 'Historical', 'Magical Realism', 'Dystopian', 'Gothic', 'Noir', 'Comedy', 'Satire', 'Drama', 'Coming of Age'];

  const submissionOptions = [
    { value: 'traditional', label: 'Publisher / Agent', desc: 'Shunn standard manuscript formatting' },
    { value: 'self', label: 'Self-Publishing', desc: 'Flexible formatting, ISBN & back matter' },
    { value: 'contest', label: 'Contest / Workshop', desc: 'Anonymization, word count constraints' },
    { value: 'studio', label: 'Studio / Production', desc: 'Spec script vs. shooting script' },
    { value: null, label: 'Personal / Not Sure', desc: 'No formatting constraints' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Progress Bar */}
      <div style={{
        height: 4,
        background: 'var(--bg-tertiary)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          height: '100%',
          width: `${(currentStep / steps.length) * 100}%`,
          background: 'var(--accent)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Step Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        {steps.map((s) => (
          <div
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 100,
              fontSize: '0.75rem',
              cursor: 'pointer',
              background: currentStep === s.num ? 'var(--accent-glow)' : 'transparent',
              color: currentStep === s.num ? 'var(--accent)' : s.num < currentStep ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontWeight: currentStep === s.num ? 600 : 400,
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 600,
              background: s.num < currentStep ? 'var(--health-exceptional)' : currentStep === s.num ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: s.num <= currentStep ? '#000' : 'var(--text-muted)',
            }}>
              {s.num < currentStep ? '✓' : s.num}
            </span>
            <span style={{ display: currentStep === s.num ? 'inline' : 'none' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 40px 80px',
      }}>
        <div style={{ maxWidth: 640, width: '100%', animation: 'fadeIn 0.3s ease forwards' }}>

          {/* Step 1: What are you making? */}
          {currentStep === 1 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>What type of story are you creating?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.9rem' }}>
                Choose a category, then pick a specific format.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedCategory?.name === c.name;
                  return (
                    <Card
                      key={c.name}
                      active={isSelected}
                      onClick={() => { setSelectedCategory(c); setSelectedSub(null); }}
                      style={{ cursor: 'pointer', textAlign: 'center', padding: 16 }}
                    >
                      <Icon size={24} color={isSelected ? 'var(--accent)' : 'var(--text-muted)'} style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{c.name}</div>
                    </Card>
                  );
                })}
              </div>

              {/* Sub-category expansion */}
              {selectedCategory && (
                <div style={{
                  marginTop: 16,
                  animation: 'fadeIn 0.3s ease forwards',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                    {selectedCategory.name} — Choose format:
                  </h3>
                  {selectedCategory.subs.map((sub) => (
                    <Card
                      key={sub}
                      active={selectedSub === sub}
                      onClick={() => setSelectedSub(sub)}
                      style={{ cursor: 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{sub}</span>
                      {selectedSub === sub && <span style={{ color: 'var(--accent)' }}>✓</span>}
                    </Card>
                  ))}

                  {/* Submission Target */}
                  {selectedSub && (
                    <div style={{ marginTop: 20, animation: 'fadeIn 0.3s ease forwards' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Where is this story going?</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Optional — helps calibrate formatting from the start</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {submissionOptions.map((o) => (
                          <Card
                            key={o.label}
                            active={submissionTarget === o.value}
                            onClick={() => setSubmissionTarget(o.value)}
                            style={{ cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{o.label}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.desc}</div>
                            </div>
                            {submissionTarget === o.value && <span style={{ color: 'var(--accent)' }}>✓</span>}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 2: Genre */}
          {currentStep === 2 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>What genre world does it live in?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem' }}>
                Choose up to 3 genres. The first is primary, the rest are blended.
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.8rem' }}>
                {selectedGenres.length}/3 selected
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {genres.map((g) => {
                  const isSelected = selectedGenres.includes(g);
                  return (
                    <div
                      key={g}
                      onClick={() => {
                        if (isSelected) setSelectedGenres(selectedGenres.filter(x => x !== g));
                        else if (selectedGenres.length < 3) setSelectedGenres([...selectedGenres, g]);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 400,
                        transition: 'var(--transition)',
                      }}
                    >
                      {isSelected && selectedGenres.indexOf(g) === 0 ? '① ' : isSelected ? `${selectedGenres.indexOf(g) + 1} ` : ''}{g}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Steps 3-8: Placeholder */}
          {currentStep >= 3 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>{steps[currentStep - 1].label}</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.9rem' }}>
                This step will contain the full {steps[currentStep - 1].label.toLowerCase()} configuration.
              </p>
              <Card style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Step {currentStep} content — to be built out
                </p>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        padding: '12px 40px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'sticky',
        bottom: 0,
      }}>
        <Button
          variant="ghost"
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/hub')}
        >
          ← {currentStep > 1 ? 'Back' : 'Project Hub'}
        </Button>
        <Button
          variant="primary"
          onClick={() => currentStep < steps.length ? setCurrentStep(currentStep + 1) : navigate('/workspace')}
        >
          {currentStep < steps.length ? 'Continue →' : 'Start Building →'}
        </Button>
      </div>
    </div>
  );
}
