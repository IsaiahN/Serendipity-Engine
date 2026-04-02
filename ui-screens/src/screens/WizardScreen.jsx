import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

/* Smooth auto-scroll: drops an invisible anchor that scrolls into view on mount */
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
import { BookOpen, Film, Tv, Mic, Gamepad2, Theater, Pen, Globe, Image, Music, Headphones, Layers, ChevronRight, Upload, Users, Sparkles, Target, BookMarked } from 'lucide-react';

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

  // Step 3 - Story scope
  const [wordCountRange, setWordCountRange] = useState(null);
  const [povCharacters, setPovCharacters] = useState(null);
  const [narrativeStructure, setNarrativeStructure] = useState(null);

  // Step 4 - Connected stories
  const [seriesType, setSeriesType] = useState(null);
  const [seriesName, setSeriesName] = useState('');
  const [seriesPosition, setSeriesPosition] = useState('');

  // Step 5 - Existing material
  const [existingMaterial, setExistingMaterial] = useState([]);

  // Step 6 - Where are you
  const [writingPhase, setWritingPhase] = useState(null);

  // Step 7 - How to work
  const [collaborationStyle, setCollaborationStyle] = useState(null);

  // Step 8 - Author identity
  const [authorName, setAuthorName] = useState('');
  const [authorBio, setAuthorBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState(null);

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
                  <ScrollIntoView />

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
                      <ScrollIntoView />
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

          {/* Step 3: Story scope */}
          {currentStep === 3 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>What's the scope of your story?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                Help us understand the size, complexity, and structure.
              </p>

              {/* Word count range */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                  Estimated word count?
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Flash (<1K)', 'Short Story (1K-7.5K)', 'Novelette (7.5K-17.5K)', 'Novella (17.5K-40K)', 'Short Novel (40K-70K)', 'Novel (70K-100K)', 'Epic (100K+)'].map((range) => (
                    <div
                      key={range}
                      onClick={() => setWordCountRange(range)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        border: `1px solid ${wordCountRange === range ? 'var(--accent)' : 'var(--border)'}`,
                        background: wordCountRange === range ? 'var(--accent-glow)' : 'var(--bg-card)',
                        color: wordCountRange === range ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: wordCountRange === range ? 600 : 400,
                        transition: 'var(--transition)',
                      }}
                    >
                      {range}
                    </div>
                  ))}
                </div>
              </div>

              {/* POV characters */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                  Number of POV characters?
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['1', '2-3', '4+', 'Not sure yet'].map((pov) => (
                    <div
                      key={pov}
                      onClick={() => setPovCharacters(pov)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        border: `1px solid ${povCharacters === pov ? 'var(--accent)' : 'var(--border)'}`,
                        background: povCharacters === pov ? 'var(--accent-glow)' : 'var(--bg-card)',
                        color: povCharacters === pov ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: povCharacters === pov ? 600 : 400,
                        transition: 'var(--transition)',
                      }}
                    >
                      {pov}
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative structure */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                  Narrative structure?
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Linear', 'Non-linear', 'Parallel', 'Epistolary', 'Frame Story', 'Not sure yet'].map((structure) => (
                    <div
                      key={structure}
                      onClick={() => setNarrativeStructure(structure)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 100,
                        border: `1px solid ${narrativeStructure === structure ? 'var(--accent)' : 'var(--border)'}`,
                        background: narrativeStructure === structure ? 'var(--accent-glow)' : 'var(--bg-card)',
                        color: narrativeStructure === structure ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: narrativeStructure === structure ? 600 : 400,
                        transition: 'var(--transition)',
                      }}
                    >
                      {structure}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 4: Connected stories */}
          {currentStep === 4 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Is this part of a series?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                Let us know if this story stands alone or connects to others.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Standalone', 'Duology', 'Trilogy', 'Series (4+)', 'Serial/Episodic', 'Not sure yet'].map((type) => (
                  <Card
                    key={type}
                    active={seriesType === type}
                    onClick={() => setSeriesType(type)}
                    style={{ cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{type}</span>
                    {seriesType === type && <span style={{ color: 'var(--accent)' }}>✓</span>}
                  </Card>
                ))}
              </div>

              {/* Series details if series is selected */}
              {seriesType && seriesType !== 'Standalone' && seriesType !== 'Not sure yet' && (
                <div style={{ marginTop: 24, animation: 'fadeIn 0.3s ease forwards' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                    Series details
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                        Series name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., The Chronicles of..."
                        value={seriesName}
                        onChange={(e) => setSeriesName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                        Position in series
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Book 1, Book 2, etc."
                        value={seriesPosition}
                        onChange={(e) => setSeriesPosition(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                  <ScrollIntoView />
                </div>
              )}
            </>
          )}

          {/* Step 5: Existing material */}
          {currentStep === 5 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>What material do you have?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                Share what you've already created. You can upload files if you have them.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                {['Outline', 'Draft chapters', 'Character profiles', 'World-building notes', 'Research', 'Plot diagrams', 'Previous drafts', 'Nothing yet'].map((material) => (
                  <div
                    key={material}
                    onClick={() => {
                      if (existingMaterial.includes(material)) {
                        setExistingMaterial(existingMaterial.filter(m => m !== material));
                      } else {
                        setExistingMaterial([...existingMaterial, material]);
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 100,
                      border: `1px solid ${existingMaterial.includes(material) ? 'var(--accent)' : 'var(--border)'}`,
                      background: existingMaterial.includes(material) ? 'var(--accent-glow)' : 'var(--bg-card)',
                      color: existingMaterial.includes(material) ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: existingMaterial.includes(material) ? 600 : 400,
                      transition: 'var(--transition)',
                    }}
                  >
                    {material}
                  </div>
                ))}
              </div>

              {/* File upload area */}
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 8,
                padding: 32,
                textAlign: 'center',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Upload size={24} color="var(--text-muted)" style={{ marginBottom: 8, opacity: 0.6 }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 4 }}>Drop files here or click to import</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF, Word, images, or text files</p>
              </div>
            </>
          )}

          {/* Step 6: Where are you */}
          {currentStep === 6 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Where are you in the process?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                This helps us tailor guidance and pacing.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { phase: 'Brainstorming', desc: 'Exploring ideas, not yet committed' },
                  { phase: 'Outlining', desc: 'Planning structure and scenes' },
                  { phase: 'First Draft', desc: 'Writing the initial version' },
                  { phase: 'Revision', desc: 'Major rewrites and restructuring' },
                  { phase: 'Editing', desc: 'Line edits and polishing prose' },
                  { phase: 'Polishing', desc: 'Final tweaks before submission' },
                  { phase: 'Querying/Submitting', desc: 'Sending to agents or publishers' },
                ].map((item) => (
                  <Card
                    key={item.phase}
                    active={writingPhase === item.phase}
                    onClick={() => setWritingPhase(item.phase)}
                    style={{ cursor: 'pointer', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.phase}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    {writingPhase === item.phase && <span style={{ color: 'var(--accent)' }}>✓</span>}
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Step 7: How to work */}
          {currentStep === 7 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>How would you like to work with AI?</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                Choose your preferred collaboration style.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { style: 'Guide me step by step', desc: 'Structured workflow, phase by phase', emoji: '🎯' },
                  { style: 'Be my writing partner', desc: 'Collaborative, suggest and discuss', emoji: '🤝' },
                  { style: 'Just assist when asked', desc: 'Minimal intervention, on-demand help', emoji: '⚙️' },
                  { style: 'Challenge me', desc: 'Push back, ask hard questions, raise the bar', emoji: '⚡' },
                ].map((item) => (
                  <Card
                    key={item.style}
                    active={collaborationStyle === item.style}
                    onClick={() => setCollaborationStyle(item.style)}
                    style={{ cursor: 'pointer', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{item.emoji}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.style}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    {collaborationStyle === item.style && (
                      <div style={{ marginTop: 8, color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}>✓ Selected</div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Step 8: Author identity */}
          {currentStep === 8 && (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Tell us about yourself</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                This helps personalize the experience. You can skip this for now.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Author name */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Pen name (or real name)
                  </label>
                  <input
                    type="text"
                    placeholder="Your writing identity..."
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Author bio */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Brief bio (optional)
                  </label>
                  <textarea
                    placeholder="A sentence or two about you as a writer..."
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      minHeight: 80,
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Experience level */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>
                    Writing experience
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
                      <Card
                        key={level}
                        active={experienceLevel === level}
                        onClick={() => setExperienceLevel(level)}
                        style={{ cursor: 'pointer', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <span style={{ fontSize: '0.9rem' }}>{level}</span>
                        {experienceLevel === level && <span style={{ color: 'var(--accent)' }}>✓</span>}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Skip option */}
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => {
                      setAuthorName('');
                      setAuthorBio('');
                      setExperienceLevel(null);
                    }}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
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
