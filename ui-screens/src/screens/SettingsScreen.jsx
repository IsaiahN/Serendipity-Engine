import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Button from '../components/Button';
import {
  Settings, Cpu, FolderOpen, Pencil, Edit3, Shield, User, Info,
  ExternalLink, Trash2, Download, Heart, RefreshCw, Key, ArrowLeft,
} from 'lucide-react';

/* ─── Theme Presets (shared with WorkspaceScreen) ─── */
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

function applyTheme(key) {
  const theme = themePresets[key];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([prop, val]) => root.style.setProperty(prop, val));
}

function detectCurrentTheme() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
  for (const [key, theme] of Object.entries(themePresets)) {
    if (theme.vars['--bg-primary'] === bg) return key;
  }
  return 'amber';
}

const categories = [
  { key: 'general', icon: Settings, label: 'General' },
  { key: 'ai', icon: Cpu, label: 'AI Models' },
  { key: 'workspace', icon: FolderOpen, label: 'Workspace' },
  { key: 'writing', icon: Pencil, label: 'Writing' },
  { key: 'editor', icon: Edit3, label: 'Editor' },
  { key: 'privacy', icon: Shield, label: 'Privacy & Data' },
  { key: 'profile', icon: User, label: 'Writing Profile' },
  { key: 'about', icon: Info, label: 'About' },
];

function SettingRow({ label, desc, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 100, cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        position: 'relative', transition: 'var(--transition)',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff', position: 'absolute', top: 2,
        left: checked ? 20 : 2, transition: 'left 0.2s ease',
      }} />
    </div>
  );
}

function Select({ options, defaultValue }) {
  return (
    <select
      defaultValue={defaultValue}
      style={{
        padding: '4px 8px', fontSize: '0.8rem', minWidth: 140,
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function GeneralSettings({ currentTheme, onThemeChange }) {
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>General</h2>
      <SettingRow label="Mode" desc="Controls complexity of the interface">
        <Select options={['Advanced', 'Simple']} defaultValue="Advanced" />
      </SettingRow>

      {/* Theme swatches */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 2 }}>Appearance</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Choose a color theme for the workspace</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(themePresets).map(([key, theme]) => {
            const isActive = currentTheme === key;
            return (
              <div
                key={key}
                onClick={() => onThemeChange(key)}
                style={{
                  cursor: 'pointer', textAlign: 'center', transition: 'var(--transition)',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-sm)',
                  background: theme.preview,
                  border: isActive ? '2px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', marginBottom: 4,
                  transition: 'var(--transition)',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: theme.vars['--accent'],
                  }} />
                  {isActive && (
                    <div style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  )}
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                }}>{theme.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SettingRow label="Font" desc="Primary typeface for the workspace">
        <Select options={['Inter', 'System Default', 'JetBrains Mono', 'Lora (Serif)', 'Merriweather']} defaultValue="Inter" />
      </SettingRow>
      <SettingRow label="Language" desc="Interface language">
        <Select options={['English']} defaultValue="English" />
      </SettingRow>
      <SettingRow label="Sidebar Position" desc="Which side the navigation panel appears on">
        <Select options={['Left', 'Right']} defaultValue="Left" />
      </SettingRow>
    </>
  );
}

function AISettings() {
  const [auditTrail, setAuditTrail] = useState(true);
  const [costTracking, setCostTracking] = useState(true);
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>AI Models</h2>

      {/* Current provider display */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
        Active Provider
      </div>
      <div style={{
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider</span>
            <Select options={['Anthropic (Claude)', 'DeepSeek', 'OpenAI', 'Google Gemini', 'Ollama (local)']} defaultValue="Anthropic (Claude)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model</span>
            <Select options={['claude-sonnet-4', 'claude-opus-4', 'claude-haiku-3.5']} defaultValue="claude-sonnet-4" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>API Key</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace' }}>sk-...configured</span>
              <Button size="sm" variant="secondary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                <Key size={11} style={{ marginRight: 3 }} /> Change
              </Button>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          Recommended ranking: Claude &gt; DeepSeek &gt; OpenAI &gt; Ollama
        </div>
      </div>

      <SettingRow label="Role Assignment Mode" desc="How models are assigned to tasks">
        <Select options={['Simple', 'Standard', 'Granular']} defaultValue="Standard" />
      </SettingRow>
      <SettingRow label="Model Audit Trail" desc="Track which model generated each piece of content">
        <Toggle checked={auditTrail} onChange={setAuditTrail} />
      </SettingRow>
      <SettingRow label="Cost Tracking" desc="Show estimated token costs per operation">
        <Toggle checked={costTracking} onChange={setCostTracking} />
      </SettingRow>

      {/* TTS section */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: 24, marginBottom: 10, fontWeight: 600 }}>
        Text-to-Speech
      </div>
      <SettingRow label="TTS Engine" desc="Voice synthesis provider">
        <Select options={['Piper TTS (local)', 'ElevenLabs', 'OpenAI TTS', 'Browser Default', 'Off']} defaultValue="Piper TTS (local)" />
      </SettingRow>
      <SettingRow label="Voice" desc="Narrator voice for read-aloud">
        <Select options={['Amy (US English)', 'Brian (UK English)', 'Emma (US English)', 'George (UK English)']} defaultValue="Amy (US English)" />
      </SettingRow>
      <SettingRow label="Speed" desc="Playback rate for read-aloud">
        <Select options={['0.75x', '1.0x', '1.25x', '1.5x', '2.0x']} defaultValue="1.0x" />
      </SettingRow>
      <SettingRow label="Auto-Read New Content" desc="Automatically read aloud AI-generated text">
        <Toggle checked={false} />
      </SettingRow>
    </>
  );
}

function WorkspaceSettings() {
  const [changelog, setChangelog] = useState(true);
  const [showWordCount, setShowWordCount] = useState(true);
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Workspace</h2>
      <SettingRow label="Auto-Save" desc="Save changes automatically">
        <Select options={['Every 30 seconds', 'Every minute', 'Every 5 minutes', 'Manual only']} defaultValue="Every 30 seconds" />
      </SettingRow>
      <SettingRow label="Backup Reminders" desc="Prompt to download project backups">
        <Select options={['Weekly', 'Monthly', 'Never']} defaultValue="Weekly" />
      </SettingRow>
      <SettingRow label="Session Changelog" desc="Track and display what changed each session">
        <Toggle checked={changelog} onChange={setChangelog} />
      </SettingRow>
      <SettingRow label="Show Word Count" desc="Display word count in the bottom status bar">
        <Toggle checked={showWordCount} onChange={setShowWordCount} />
      </SettingRow>
      <SettingRow label="Default Word Goal" desc="Target word count for new projects">
        <Select options={['50,000', '60,000', '70,000', '80,000', '90,000', '100,000', 'Custom']} defaultValue="70,000" />
      </SettingRow>
      <SettingRow label="Submission Target" desc="Default formatting target for new projects">
        <Select options={['Not Set', 'Publisher / Agent', 'Self-Publishing', 'Contest / Workshop', 'Personal']} defaultValue="Not Set" />
      </SettingRow>
    </>
  );
}

function EditorSettings() {
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Editor</h2>
      <SettingRow label="Default Approval Mode" desc="How Editor feedback is presented">
        <Select options={['Auto-Approve', 'Per Chapter', 'Per Arc', 'Multi-Pass']} defaultValue="Per Chapter" />
      </SettingRow>
      <SettingRow label="Max Editor Passes" desc="Maximum rounds for Multi-Pass mode">
        <Select options={['1', '2', '3', '4', '5', '6']} defaultValue="3" />
      </SettingRow>
      <SettingRow label="Quality Threshold" desc="Auto-stops Multi-Pass when this rating is reached">
        <Select options={['Exceptional', 'Strong', 'Good', 'Developing', 'Off']} defaultValue="Strong" />
      </SettingRow>
      <SettingRow label="Editor Persona Count" desc="How many audience-based personas to generate">
        <Select options={['0', '1', '2', '3', '4', '5']} defaultValue="3" />
      </SettingRow>
    </>
  );
}

function WritingSettings() {
  const [readabilityScore, setReadabilityScore] = useState(true);
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Writing</h2>
      <SettingRow label="Default POV" desc="Perspective for new writing">
        <Select options={['First Person', 'Second Person', 'Third Limited', 'Third Omniscient', 'Multiple']} defaultValue="Third Limited" />
      </SettingRow>
      <SettingRow label="Default Tense" desc="Time frame for narrative">
        <Select options={['Past', 'Present']} defaultValue="Past" />
      </SettingRow>
      <SettingRow label="Chapter Naming" desc="How chapters are identified">
        <Select options={['Numbered', 'Named', 'Both']} defaultValue="Numbered" />
      </SettingRow>
      <SettingRow label="Scene Break Style" desc="Visual separator between scenes">
        <Select options={['* * *', '---', 'Blank line', '#']} defaultValue="* * *" />
      </SettingRow>
      <SettingRow label="Show Readability Score" desc="Display reading ease metrics">
        <Toggle checked={readabilityScore} onChange={setReadabilityScore} />
      </SettingRow>
      <SettingRow label="Target Reading Level" desc="Audience comprehension baseline">
        <Select options={['General', 'Literary', 'Academic', 'Young Adult', 'Middle Grade']} defaultValue="General" />
      </SettingRow>
      <SettingRow label="Dialogue Style" desc="Quotation marks and emphasis">
        <Select options={['American "double quotes"', "British 'single quotes'", 'Em-dash style']} defaultValue='American "double quotes"' />
      </SettingRow>
    </>
  );
}

function PrivacySettings({ navigate }) {
  const [storeLocally, setStoreLocally] = useState(true);
  const [shareUsage, setShareUsage] = useState(false);
  const [aiOptOut, setAiOptOut] = useState(true);
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Privacy & Data</h2>
      <SettingRow label="Store Projects Locally" desc="Keep project files on this device">
        <Toggle checked={storeLocally} onChange={setStoreLocally} />
      </SettingRow>
      <SettingRow label="Share Anonymous Usage Data" desc="Help improve the app with usage analytics">
        <Toggle checked={shareUsage} onChange={setShareUsage} />
      </SettingRow>
      <SettingRow label="AI Training Opt-Out" desc="Prevent your writing from being used to train AI models">
        <Toggle checked={aiOptOut} onChange={setAiOptOut} />
      </SettingRow>
      <SettingRow label="Auto-Delete Sessions" desc="Automatically remove old session data">
        <Select options={['Never', 'After 30 days', 'After 90 days', 'After 1 year']} defaultValue="Never" />
      </SettingRow>
      <SettingRow label="Export All Data" desc="Download all your projects and settings">
        <Button size="sm" variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Download size={14} />
          Export →
        </Button>
      </SettingRow>

      {/* Danger zone */}
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: 24, marginBottom: 10, fontWeight: 600 }}>
        Danger Zone
      </div>
      <SettingRow label="Re-run Setup" desc="Go back through Terms of Use and LLM configuration">
        <Button size="sm" variant="secondary" onClick={() => navigate('/terms')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <RefreshCw size={14} />
          Re-run →
        </Button>
      </SettingRow>
      <SettingRow label="Delete All Data" desc="Permanently remove all projects, settings, and session data">
        <Button size="sm" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>
          <Trash2 size={14} style={{ marginRight: 4 }} />
          Delete Everything
        </Button>
      </SettingRow>
    </>
  );
}

function WritingProfileSettings() {
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>Writing Profile</h2>
      <SettingRow label="Pen Name" desc="Your author identity">
        <input
          type="text"
          value={penName}
          onChange={(e) => setPenName(e.target.value)}
          placeholder="Enter pen name"
          style={{
            padding: '4px 8px', fontSize: '0.8rem', minWidth: 140,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
          }}
        />
      </SettingRow>
      <SettingRow label="Bio" desc="Short author biography">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows="3"
          style={{
            padding: '6px 8px', fontSize: '0.8rem', minWidth: 280,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
            fontFamily: 'inherit', resize: 'none',
          }}
        />
      </SettingRow>
      <SettingRow label="Writing Experience" desc="Your skill level">
        <Select options={['Beginner', 'Intermediate', 'Advanced', 'Professional']} defaultValue="Intermediate" />
      </SettingRow>
      <SettingRow label="Favorite Genres" desc="Your preferred categories">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Literary Fiction, Thriller
          </span>
          <Button size="sm" variant="secondary" style={{ fontSize: '0.75rem' }}>Edit</Button>
        </div>
      </SettingRow>
      <SettingRow label="Writing Goals" desc="What you're working towards">
        <Select options={['Finish first draft', 'Get published', 'Improve craft', 'Fun/hobby']} defaultValue="Finish first draft" />
      </SettingRow>
      <SettingRow label="Daily Word Target" desc="Your writing goal">
        <Select options={['250', '500', '1000', '1500', '2000', 'Custom']} defaultValue="1000" />
      </SettingRow>
    </>
  );
}

function AboutSettings() {
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>
        <span>✦ About Serendipity Engine</span>
      </h2>
      <SettingRow label="Version" desc="">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>v0.1.0-alpha</span>
      </SettingRow>
      <SettingRow label="Build Info" desc="">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Development Build</span>
      </SettingRow>
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
          Resources
        </div>
        {[
          { label: 'Documentation', href: '#' },
          { label: 'GitHub', href: '#' },
          { label: 'Report a Bug', href: '#' },
          { label: 'Feature Request', href: '#' },
        ].map((link) => (
          <div key={link.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: '0.85rem' }}>{link.label}</span>
            <ExternalLink size={14} color="var(--text-muted)" />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
          <Heart size={12} style={{ display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />
          Built by Isaiah
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          MIT License
        </p>
      </div>
    </>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('general');
  const [currentTheme, setCurrentTheme] = useState(detectCurrentTheme);

  const handleThemeChange = (key) => {
    applyTheme(key);
    setCurrentTheme(key);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'general': return <GeneralSettings currentTheme={currentTheme} onThemeChange={handleThemeChange} />;
      case 'ai': return <AISettings />;
      case 'workspace': return <WorkspaceSettings />;
      case 'editor': return <EditorSettings />;
      case 'writing': return <WritingSettings />;
      case 'privacy': return <PrivacySettings navigate={navigate} />;
      case 'profile': return <WritingProfileSettings />;
      case 'about': return <AboutSettings />;
      default: return <GeneralSettings currentTheme={currentTheme} onThemeChange={handleThemeChange} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar showHealth={false} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 220,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          padding: '16px 8px',
        }}>
          <button
            onClick={() => navigate('/hub')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, width: '100%',
              padding: '8px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left',
              background: 'none', color: 'var(--text-muted)',
              marginBottom: 12, transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '0 12px 12px' }}>
            Settings
          </div>
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: 2,
                }}
              >
                <Icon size={15} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', maxWidth: 700 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
