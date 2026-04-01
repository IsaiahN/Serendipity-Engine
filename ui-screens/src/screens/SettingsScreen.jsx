import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  Settings, Cpu, FolderOpen, Pencil, Edit3, Shield, User, Info,
  ChevronRight, Sun, Moon, Monitor, ExternalLink, Trash2, Download, Heart,
} from 'lucide-react';

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

function GeneralSettings() {
  const [darkMode, setDarkMode] = useState(true);
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>General</h2>
      <SettingRow label="Mode" desc="Controls complexity of the interface">
        <Select options={['Advanced', 'Simple']} defaultValue="Advanced" />
      </SettingRow>
      <SettingRow label="Appearance" desc="Color theme for the workspace">
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { icon: Moon, label: 'Dark', active: true },
            { icon: Sun, label: 'Light', active: false },
            { icon: Monitor, label: 'System', active: false },
          ].map((t) => (
            <button key={t.label} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', cursor: 'pointer',
              background: t.active ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: t.active ? '#000' : 'var(--text-muted)',
            }}>
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>
      </SettingRow>
      <SettingRow label="Font" desc="Primary typeface for the workspace">
        <Select options={['Inter', 'System Default', 'JetBrains Mono']} defaultValue="Inter" />
      </SettingRow>
      <SettingRow label="Language" desc="Interface language">
        <Select options={['English']} defaultValue="English" />
      </SettingRow>
    </>
  );
}

function AISettings() {
  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>AI Models</h2>
      <SettingRow label="Connected Providers" desc="Manage API keys and SSO connections">
        <Button size="sm" variant="secondary">Manage →</Button>
      </SettingRow>
      <SettingRow label="Role Assignment Mode" desc="How models are assigned to tasks">
        <Select options={['Simple', 'Standard', 'Granular']} defaultValue="Standard" />
      </SettingRow>
      <SettingRow label="Model Audit Trail" desc="Track which model generated each piece of content">
        <Toggle checked={true} />
      </SettingRow>
      <SettingRow label="Cost Tracking" desc="Show estimated token costs per operation">
        <Toggle checked={true} />
      </SettingRow>
    </>
  );
}

function WorkspaceSettings() {
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
        <Toggle checked={true} />
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

function PrivacySettings() {
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
      <SettingRow label="Delete All Data" desc="Permanently remove everything">
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

  const renderContent = () => {
    switch (activeCategory) {
      case 'general': return <GeneralSettings />;
      case 'ai': return <AISettings />;
      case 'workspace': return <WorkspaceSettings />;
      case 'editor': return <EditorSettings />;
      case 'writing': return <WritingSettings />;
      case 'privacy': return <PrivacySettings />;
      case 'profile': return <WritingProfileSettings />;
      case 'about': return <AboutSettings />;
      default: return <GeneralSettings />;
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
