import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  Settings, Cpu, FolderOpen, Pencil, Edit3, Shield, User, Info,
  ChevronRight, Sun, Moon, Monitor,
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

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('general');

  const renderContent = () => {
    switch (activeCategory) {
      case 'general': return <GeneralSettings />;
      case 'ai': return <AISettings />;
      case 'workspace': return <WorkspaceSettings />;
      case 'editor': return <EditorSettings />;
      default: return (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>
            {categories.find(c => c.key === activeCategory)?.label}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Settings for this category will be built out.</p>
        </>
      );
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
