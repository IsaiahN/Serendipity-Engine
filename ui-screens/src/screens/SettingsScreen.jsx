import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import TopBar from '../components/TopBar';
import Button from '../components/Button';
import WritingProfile from '../components/WritingProfile';
import { useLlmStore } from '../stores/llmStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useProjectStore } from '../stores/projectStore';
import SessionCostTracker from '../components/SessionCostTracker';
import { LLM_PROVIDERS, STANDARD_ROLES } from '../lib/constants';
import {
  Settings, Cpu, FolderOpen, Pencil, Edit3, Shield, User, Info,
  ExternalLink, Trash2, Download, Heart, RefreshCw, Key, ArrowLeft,
  Volume2, Zap, BarChart3, Eye, EyeOff, LogIn, Loader, Check, AlertTriangle,
} from 'lucide-react';

// ─── Theme Presets (shared with WorkspaceScreen) ───
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

// ─── Toast Notification ───
function Toast({ message, visible }) {
  return (
    <div
      style={{
        position: 'fixed', bottom: 20, right: 20,
        background: 'var(--accent)', color: 'var(--accent-btn-text)',
        padding: '12px 16px', borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem', fontWeight: 500,
        opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  );
}

// ─── Setting Row Component ───
function SettingRow({ label, desc, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: '1px solid var(--border)',
      gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0, minWidth: 'fit-content' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Toggle Switch ───
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 100, cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        position: 'relative', transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff', position: 'absolute', top: 3,
        left: checked ? 21 : 2, transition: 'left 0.2s ease',
      }} />
    </div>
  );
}

// ─── Select Dropdown ───
function Select({ options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      style={{
        padding: '6px 10px', fontSize: '0.8rem', minWidth: 140,
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── General Settings ───
function GeneralSettings({ currentTheme, onThemeChange, onSettingChange }) {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const settings = useSettingsStore(useShallow(s => ({
    mode: s.mode,
    fontSize: s.fontSize,
    editorFont: s.editorFont,
    language: s.language,
    sidebarPosition: s.sidebarPosition,
  })));

  const [mode, setMode] = useState(settings.mode);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [editorFont, setEditorFont] = useState(settings.editorFont);
  const [language, setLanguage] = useState(settings.language);
  const [sidebarPos, setSidebarPos] = useState(settings.sidebarPosition);

  useEffect(() => {
    setMode(settings.mode);
    setFontSize(settings.fontSize);
    setEditorFont(settings.editorFont);
    setLanguage(settings.language);
    setSidebarPos(settings.sidebarPosition);
  }, [settings]);

  const handleModeChange = async (newMode) => {
    setMode(newMode);
    await updateSettings({ mode: newMode });
    onSettingChange('mode', newMode);
  };

  const handleFontSizeChange = async (newSize) => {
    setFontSize(newSize);
    await updateSettings({ fontSize: newSize });
    onSettingChange('fontSize', newSize);
  };

  const handleEditorFontChange = async (newFont) => {
    setEditorFont(newFont);
    await updateSettings({ editorFont: newFont });
    onSettingChange('editorFont', newFont);
  };

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    await updateSettings({ language: newLang });
    onSettingChange('language', newLang);
  };

  const handleSidebarChange = async (newPos) => {
    setSidebarPos(newPos);
    await updateSettings({ sidebarPosition: newPos });
    onSettingChange('sidebarPosition', newPos);
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>General</h2>

      <SettingRow label="Mode" desc="Controls complexity of the interface. Simple mode hides advanced modes (Timeline, Relationships, World Building, Comparison) and focuses on essentials.">
        <Select
          options={['simple', 'advanced']}
          value={mode}
          onChange={handleModeChange}
        />
      </SettingRow>

      <SettingRow label="Font Size" desc="Primary interface text size">
        <Select
          options={['small', 'medium', 'large']}
          value={fontSize}
          onChange={handleFontSizeChange}
        />
      </SettingRow>

      {/* Theme swatches */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 4 }}>Appearance</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>Choose a color theme for the workspace</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(themePresets).map(([key, theme]) => {
            const isActive = currentTheme === key;
            return (
              <div
                key={key}
                onClick={() => onThemeChange(key)}
                style={{
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '6px',
                  background: theme.preview,
                  border: isActive ? '3px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', marginBottom: 6,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 0 2px var(--bg-primary)' : 'none',
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: theme.vars['--accent'],
                  }} />
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  display: 'block',
                }}>{theme.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SettingRow label="Editor Font" desc="Typeface for the text editor">
        <Select
          options={['JetBrains Mono', 'Fira Code', 'Courier New', 'Consolas']}
          value={editorFont}
          onChange={handleEditorFontChange}
        />
      </SettingRow>

      <SettingRow label="Language" desc="Interface language">
        <Select
          options={['English', 'Spanish', 'French', 'German']}
          value={language}
          onChange={handleLanguageChange}
        />
      </SettingRow>

      <SettingRow label="Sidebar Position" desc="Which side the navigation panel appears on">
        <Select
          options={['Left', 'Right']}
          value={sidebarPos}
          onChange={handleSidebarChange}
        />
      </SettingRow>
    </>
  );
}

// ─── AI Models Settings ───
function AISettings({ onSettingChange }) {
  const providers = useLlmStore(s => s.providers);
  const activeProviders = useLlmStore(s => s.activeProviders);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const settings = useSettingsStore(useShallow(s => ({
    auditTrail: s.auditTrail,
    costTracking: s.costTracking,
    ttsAutoRead: s.ttsAutoRead,
    roleAssignment: s.roleAssignment,
    roles: s.roles,
  })));

  const [selectedProvider, setSelectedProvider] = useState('anthropic');
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState('api'); // 'api' | 'oauth'
  const [oauthProvider, setOauthProvider] = useState('google');
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthStatus, setOauthStatus] = useState(null); // null | 'pending' | 'success' | 'error'
  const [roleMode, setRoleMode] = useState(settings.roleAssignment || 'simple');
  const [roles, setRoles] = useState(settings.roles || {});
  const [auditTrail, setAuditTrail] = useState(settings.auditTrail);
  const [costTracking, setCostTracking] = useState(settings.costTracking);
  const [ttsEngine, setTtsEngine] = useState('Piper TTS (local)');
  const [voice, setVoice] = useState('Amy (US English)');
  const [ttsSpeed, setTtsSpeed] = useState('1.0x');
  const [autoRead, setAutoRead] = useState(settings.ttsAutoRead);

  useEffect(() => {
    setRoleMode(settings.roleAssignment || 'simple');
    setRoles(settings.roles || {});
    setAuditTrail(settings.auditTrail);
    setCostTracking(settings.costTracking);
    setAutoRead(settings.ttsAutoRead);
  }, [settings.roleAssignment, settings.roles, settings.auditTrail, settings.costTracking, settings.ttsAutoRead]);

  // Load providers on mount
  useEffect(() => {
    const { loadProviders } = useLlmStore.getState();
    loadProviders();
  }, []);

  // When selected provider changes, update model to match
  useEffect(() => {
    const def = LLM_PROVIDERS.find(p => p.key === selectedProvider);
    const existing = providers[selectedProvider];
    if (existing?.model) {
      setSelectedModel(existing.model);
    } else if (def?.models?.length > 0) {
      setSelectedModel(def.models[0]);
    } else {
      setSelectedModel('');
    }
    setApiKeyInput('');
    setTestResult(null);
    setShowApiKey(false);
  }, [selectedProvider, providers]);

  const OAUTH_PROVIDERS = [
    { key: 'google', label: 'Google (Gemini)', status: 'available', color: '#4285f4',
      description: 'Sign in with Google to use Gemini models via OAuth.',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: 'https://www.googleapis.com/auth/generative-language' },
    { key: 'openai', label: 'OpenAI', status: 'planned', color: '#10a37f',
      description: 'OpenAI does not currently offer OAuth for API access.' },
    { key: 'anthropic', label: 'Anthropic (Claude)', status: 'planned', color: '#d4a574',
      description: 'Anthropic does not currently offer OAuth for API access.' },
  ];

  const handleOAuthSignIn = (providerKey) => {
    const op = OAUTH_PROVIDERS.find(p => p.key === providerKey);
    if (!op || op.status !== 'available' || !oauthClientId.trim()) {
      setOauthStatus('error');
      return;
    }
    setOauthStatus('pending');
    const redirectUri = window.location.origin + '/oauth/callback';
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', providerKey);
    const params = new URLSearchParams({
      client_id: oauthClientId.trim(), redirect_uri: redirectUri,
      response_type: 'code', scope: op.scopes, state, access_type: 'offline', prompt: 'consent',
    });
    const w = 500, h = 600;
    const left = (window.screen.width - w) / 2, top = (window.screen.height - h) / 2;
    window.open(`${op.authUrl}?${params.toString()}`, 'oauth_popup',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`);
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'oauth_callback') {
        window.removeEventListener('message', onMessage);
        setOauthStatus(event.data.code ? 'success' : 'error');
      }
    };
    window.addEventListener('message', onMessage);
    setTimeout(() => { if (oauthStatus === 'pending') setOauthStatus(null); }, 120000);
  };

  const providerDef = LLM_PROVIDERS.find(p => p.key === selectedProvider);
  const isConnected = activeProviders.includes(selectedProvider);
  const providerInfo = providers[selectedProvider];

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) return;
    setSaving(true);
    setTestResult(null);
    try {
      const { connectProvider } = useLlmStore.getState();
      await connectProvider({
        provider: selectedProvider,
        apiKey: apiKeyInput.trim(),
        model: selectedModel || undefined,
      });
      setTestResult({ success: true, message: 'API key saved. Click "Test Connection" to verify.' });
      setApiKeyInput('');
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Failed to save key' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { testConnection } = useLlmStore.getState();
      const result = await testConnection(selectedProvider);
      if (result.success) {
        setTestResult({ success: true, message: `Connected! Response time: ${result.responseTime}ms` });
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    const { disconnectProvider } = useLlmStore.getState();
    await disconnectProvider(selectedProvider);
    setTestResult(null);
    setApiKeyInput('');
  };

  const handleRoleModeChange = async (newMode) => {
    setRoleMode(newMode);
    await updateSettings({ roleAssignment: newMode });
    onSettingChange('roleAssignmentMode', newMode);
  };

  const handleRoleAssignment = async (roleKey, providerKey) => {
    const newRoles = { ...roles, [roleKey]: providerKey || null };
    setRoles(newRoles);
    await updateSettings({ roles: newRoles });
  };

  const handleAuditTrail = async (val) => {
    setAuditTrail(val);
    await updateSettings({ auditTrail: val });
    onSettingChange('auditTrail', val);
  };

  const handleCostTracking = async (val) => {
    setCostTracking(val);
    await updateSettings({ costTracking: val });
    onSettingChange('costTracking', val);
  };

  const handleAutoRead = async (val) => {
    setAutoRead(val);
    await updateSettings({ ttsAutoRead: val });
    onSettingChange('ttsAutoRead', val);
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>AI Models</h2>

      {/* Connected providers overview */}
      {activeProviders.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
            Connected Providers
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {activeProviders.map(key => {
              const def = LLM_PROVIDERS.find(p => p.key === key);
              const info = providers[key];
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {def?.label || key}
                  </span>
                  {info?.model && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {info.model}
                    </span>
                  )}
                  {info?.responseTime && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {info.responseTime}ms
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
        Connection Method
      </div>

      {/* Connection Method Toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          onClick={() => setConnectionMethod('api')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            background: connectionMethod === 'api' ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
            border: `1px solid ${connectionMethod === 'api' ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <Key size={16} color={connectionMethod === 'api' ? 'var(--accent)' : 'var(--text-muted)'} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: connectionMethod === 'api' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>API Key</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Paste your key directly</div>
          </div>
        </button>
        <button
          onClick={() => setConnectionMethod('oauth')}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
            background: connectionMethod === 'oauth' ? 'var(--accent-subtle)' : 'var(--bg-tertiary)',
            border: `1px solid ${connectionMethod === 'oauth' ? 'var(--accent-border)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <LogIn size={16} color={connectionMethod === 'oauth' ? 'var(--accent)' : 'var(--text-muted)'} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: connectionMethod === 'oauth' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>OAuth / SSO</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sign in with provider</div>
          </div>
        </button>
      </div>

      {/* OAuth / SSO Panel */}
      {connectionMethod === 'oauth' && (
        <div style={{
          background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20,
        }}>
          <div style={{
            background: 'var(--accent-subtle)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: 10, marginBottom: 16,
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              OAuth lets you authenticate with your provider account instead of pasting an API key. Your access token stays on-device.
            </span>
          </div>

          {/* OAuth provider cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {OAUTH_PROVIDERS.map((op) => {
              const isAvailable = op.status === 'available';
              const isSelected = oauthProvider === op.key;
              return (
                <div
                  key={op.key}
                  onClick={() => isAvailable && setOauthProvider(op.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    background: isSelected && isAvailable ? `${op.color}10` : 'var(--bg-primary)',
                    border: `1px solid ${isSelected && isAvailable ? op.color + '40' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: isAvailable ? 'pointer' : 'default',
                    opacity: isAvailable ? 1 : 0.55,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: op.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <LogIn size={14} color={op.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {op.label}
                      {isAvailable ? (
                        <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 100, background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 500 }}>Available</span>
                      ) : (
                        <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 100, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontWeight: 500 }}>API Key Only</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{op.description}</div>
                  </div>
                  {isAvailable && isSelected && <Check size={14} color={op.color} />}
                </div>
              );
            })}
          </div>

          {/* Google OAuth config */}
          {oauthProvider === 'google' && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                Google Cloud OAuth Client ID
              </label>
              <input
                type="text"
                value={oauthClientId}
                onChange={(e) => { setOauthClientId(e.target.value); setOauthStatus(null); }}
                placeholder="123456789.apps.googleusercontent.com"
                style={{
                  width: '100%', padding: '8px 10px', fontSize: '0.8rem',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  fontFamily: 'monospace', marginBottom: 6,
                }}
              />
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
                Create at{' '}
                <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                  Google Cloud Console
                </a>
                {' '}&rarr; Credentials &rarr; OAuth 2.0 Client ID. Set redirect URI to{' '}
                <code style={{ background: 'var(--bg-primary)', padding: '1px 4px', borderRadius: 3, fontSize: '0.65rem' }}>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/oauth/callback
                </code>
              </div>

              {oauthStatus === 'error' && !oauthClientId.trim() && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', marginBottom: 10, fontSize: '0.75rem', color: '#ef4444' }}>
                  <AlertTriangle size={12} /> Enter your OAuth Client ID first
                </div>
              )}

              {oauthStatus === 'success' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(34,197,94,0.1)', marginBottom: 10, fontSize: '0.75rem', color: '#22c55e' }}>
                  <Check size={12} /> Authenticated successfully
                </div>
              )}

              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthStatus === 'pending'}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600,
                  background: 'var(--accent)', color: 'var(--accent-btn-text)',
                  border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}
              >
                {oauthStatus === 'pending' ? (
                  <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Waiting for authorization...</>
                ) : (
                  <><ExternalLink size={14} /> Sign In with Google</>
                )}
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Don't have OAuth credentials?{' '}
            <span onClick={() => setConnectionMethod('api')} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>
              Use an API key instead
            </span>
          </div>
        </div>
      )}

      {/* API Key Configuration */}
      {connectionMethod === 'api' && <>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
        Configure Provider
      </div>
      <div style={{
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Provider selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider</span>
            <Select
              options={LLM_PROVIDERS.map(p => p.label)}
              value={providerDef?.label || ''}
              onChange={(label) => {
                const match = LLM_PROVIDERS.find(p => p.label === label);
                if (match) setSelectedProvider(match.key);
              }}
            />
          </div>

          {/* Model selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Model</span>
            {providerDef?.models?.length > 0 ? (
              <Select
                options={providerDef.models}
                value={selectedModel}
                onChange={setSelectedModel}
              />
            ) : (
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="e.g. llama3, mistral, etc."
                style={{
                  padding: '6px 28px 6px 10px', fontSize: '0.8rem',
                  minWidth: 140, maxWidth: '55%', marginLeft: 'auto',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                }}
              />
            )}
          </div>

          {/* Connection status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isConnected ? '#22c55e' : '#6b7280',
              }} />
              <span style={{
                fontSize: '0.8rem',
                color: isConnected ? '#22c55e' : 'var(--text-muted)',
                fontWeight: 500,
              }}>
                {isConnected ? 'Connected' : 'Not connected'}
              </span>
              {providerInfo?.lastTested && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  (tested {new Date(providerInfo.lastTested).toLocaleDateString()})
                </span>
              )}
            </div>
          </div>

          {/* API Key input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isConnected ? 'Update API Key' : 'API Key'}
              </span>
              {providerDef?.apiKeyUrl && (
                <a
                  href={providerDef.apiKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  Get your API key <ExternalLink size={11} />
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={isConnected ? 'Enter new key to update...' : 'Paste your API key here...'}
                  style={{
                    width: '100%', padding: '8px 36px 8px 10px', fontSize: '0.8rem',
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveKey(); }}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'var(--text-muted)',
                  }}
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <Button size="sm" variant="secondary" onClick={handleSaveKey} disabled={!apiKeyInput.trim() || saving}>
                <Key size={12} style={{ marginRight: 3 }} />
                {saving ? 'Saving...' : 'Save Key'}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleTestConnection}
              disabled={testing || (!isConnected && !apiKeyInput.trim() && !providerInfo)}
              style={{ flex: 1 }}
            >
              <Zap size={12} style={{ marginRight: 4 }} />
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            {isConnected && (
              <Button
                size="sm"
                onClick={handleDisconnect}
                style={{
                  background: 'transparent', color: '#dc2626',
                  border: '1px solid #dc2626', padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={12} style={{ marginRight: 4 }} />
                Disconnect
              </Button>
            )}
          </div>

          {/* Test result feedback */}
          {testResult && (
            <div style={{
              padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem',
              background: testResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
              border: `1px solid ${testResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
              color: testResult.success ? '#22c55e' : '#dc2626',
            }}>
              {testResult.message}
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          You can connect multiple providers and assign them to different roles below.
        </div>
      </div>
      </>}

      <SettingRow label="Role Assignment Mode" desc="How models are assigned to tasks">
        <Select
          options={['simple', 'standard', 'granular']}
          value={roleMode}
          onChange={handleRoleModeChange}
        />
      </SettingRow>

      {(roleMode === 'standard' || roleMode === 'granular') && activeProviders.length > 0 && (
        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
            Role → Provider Assignment
          </div>
          {STANDARD_ROLES.map(role => (
            <div key={role.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{role.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{role.description}</div>
              </div>
              <select
                value={roles[role.key] || ''}
                onChange={e => handleRoleAssignment(role.key, e.target.value || null)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  minWidth: '150px',
                }}
              >
                <option value="">Auto (first available)</option>
                {activeProviders.map(p => {
                  const def = LLM_PROVIDERS.find(prov => prov.key === p);
                  return (
                    <option key={p} value={p}>{def?.label || p}</option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
      )}

      <SettingRow label="Model Audit Trail" desc="Track which model generated each piece of content">
        <Toggle checked={auditTrail} onChange={handleAuditTrail} />
      </SettingRow>

      <SettingRow label="Cost Tracking" desc="Show estimated token costs per operation">
        <Toggle checked={costTracking} onChange={handleCostTracking} />
      </SettingRow>

      {costTracking && (
        <div style={{ marginTop: 16 }}>
          <SessionCostTracker variant="full" />
        </div>
      )}

      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: 24, marginBottom: 10, fontWeight: 600 }}>
        Text-to-Speech
      </div>

      <SettingRow label="TTS Engine" desc="Voice synthesis provider">
        <Select
          options={['Piper TTS (local)', 'ElevenLabs', 'OpenAI TTS', 'Browser Default', 'Off']}
          value={ttsEngine}
          onChange={setTtsEngine}
        />
      </SettingRow>

      <SettingRow label="Voice" desc="Narrator voice for read-aloud">
        <Select
          options={['Amy (US English)', 'Brian (UK English)', 'Emma (US English)', 'George (UK English)']}
          value={voice}
          onChange={setVoice}
        />
      </SettingRow>

      <SettingRow label="Speed" desc="Playback rate for read-aloud">
        <Select
          options={['0.75x', '1.0x', '1.25x', '1.5x', '2.0x']}
          value={ttsSpeed}
          onChange={setTtsSpeed}
        />
      </SettingRow>

      <SettingRow label="Auto-Read New Content" desc="Automatically read aloud AI-generated text">
        <Toggle checked={autoRead} onChange={handleAutoRead} />
      </SettingRow>
    </>
  );
}

// ─── Workspace Settings ───
function WorkspaceSettings({ onSettingChange }) {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const settings = useSettingsStore(useShallow(s => ({
    autoSaveInterval: s.autoSaveInterval,
    crashRecovery: s.crashRecovery,
    defaultExportFormat: s.defaultExportFormat,
    backupReminder: s.backupReminder,
    showWordCount: s.showWordCount,
    defaultWordGoal: s.defaultWordGoal,
  })));

  // Map store values to display values
  const autoSaveMap = { 30000: 'Every 30 seconds', 60000: 'Every minute', 300000: 'Every 5 minutes', 0: 'Manual only' };
  const backupMap = { 'daily': 'Daily', 'weekly': 'Weekly', 'monthly': 'Monthly', 'off': 'Never' };
  const goalMap = { 50000: '50,000', 60000: '60,000', 70000: '70,000', 80000: '80,000', 90000: '90,000', 100000: '100,000' };

  const [autoSaveInterval, setAutoSaveInterval] = useState(autoSaveMap[settings.autoSaveInterval] || 'Every 30 seconds');
  const [crashRecovery, setCrashRecovery] = useState(settings.crashRecovery);
  const [exportFormat, setExportFormat] = useState((settings.defaultExportFormat || 'docx').toUpperCase());
  const [backupReminder, setBackupReminder] = useState(backupMap[settings.backupReminder] || 'Weekly');
  const [showWordCount, setShowWordCount] = useState(settings.showWordCount);
  const [defaultWordGoal, setDefaultWordGoal] = useState(goalMap[settings.defaultWordGoal] || '70,000');

  useEffect(() => {
    setAutoSaveInterval(autoSaveMap[settings.autoSaveInterval] || 'Every 30 seconds');
    setCrashRecovery(settings.crashRecovery);
    setExportFormat((settings.defaultExportFormat || 'docx').toUpperCase());
    setBackupReminder(backupMap[settings.backupReminder] || 'Weekly');
    setShowWordCount(settings.showWordCount);
    setDefaultWordGoal(goalMap[settings.defaultWordGoal] || '70,000');
  }, [settings]);

  const handleAutoSaveChange = async (newVal) => {
    setAutoSaveInterval(newVal);
    const msMap = { 'Every 30 seconds': 30000, 'Every minute': 60000, 'Every 5 minutes': 300000, 'Manual only': 0 };
    await updateSettings({ autoSaveInterval: msMap[newVal] || 30000 });
    onSettingChange('autoSaveInterval', newVal);
  };

  const handleCrashRecovery = async (val) => {
    setCrashRecovery(val);
    await updateSettings({ crashRecovery: val });
    onSettingChange('crashRecovery', val);
  };

  const handleExportFormat = async (newVal) => {
    setExportFormat(newVal);
    await updateSettings({ defaultExportFormat: newVal.toLowerCase() });
    onSettingChange('defaultExportFormat', newVal);
  };

  const handleBackupReminder = async (newVal) => {
    setBackupReminder(newVal);
    const keyMap = { 'Daily': 'daily', 'Weekly': 'weekly', 'Monthly': 'monthly', 'Never': 'off' };
    await updateSettings({ backupReminder: keyMap[newVal] || 'weekly' });
    onSettingChange('backupReminder', newVal);
  };

  const handleShowWordCount = async (val) => {
    setShowWordCount(val);
    await updateSettings({ showWordCount: val });
    onSettingChange('showWordCount', val);
  };

  const handleDefaultWordGoal = async (newVal) => {
    setDefaultWordGoal(newVal);
    const numMap = { '50,000': 50000, '60,000': 60000, '70,000': 70000, '80,000': 80000, '90,000': 90000, '100,000': 100000 };
    await updateSettings({ defaultWordGoal: numMap[newVal] || 70000 });
    onSettingChange('defaultWordGoal', newVal);
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Workspace</h2>

      <SettingRow label="Auto-Save Interval" desc="Save changes automatically at regular intervals">
        <Select
          options={['Every 30 seconds', 'Every minute', 'Every 5 minutes', 'Manual only']}
          value={autoSaveInterval}
          onChange={handleAutoSaveChange}
        />
      </SettingRow>

      <SettingRow label="Crash Recovery" desc="Restore unsaved work if the app crashes">
        <Toggle checked={crashRecovery} onChange={handleCrashRecovery} />
      </SettingRow>

      <SettingRow label="Default Export Format" desc="File format when exporting projects">
        <Select
          options={['DOCX', 'PDF', 'EPUB', 'MARKDOWN', 'TXT']}
          value={exportFormat}
          onChange={handleExportFormat}
        />
      </SettingRow>

      <SettingRow label="Backup Reminder" desc="Prompt to download project backups">
        <Select
          options={['Weekly', 'Monthly', 'Never']}
          value={backupReminder}
          onChange={handleBackupReminder}
        />
      </SettingRow>

      <SettingRow label="Show Word Count" desc="Display word count in the bottom status bar">
        <Toggle checked={showWordCount} onChange={handleShowWordCount} />
      </SettingRow>

      <SettingRow label="Default Word Goal" desc="Target word count for new projects">
        <Select
          options={['50,000', '60,000', '70,000', '80,000', '90,000', '100,000', 'Custom']}
          value={defaultWordGoal}
          onChange={handleDefaultWordGoal}
        />
      </SettingRow>
    </>
  );
}

// ─── Writing Settings ───
function WritingSettings({ onSettingChange }) {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const settings = useSettingsStore(useShallow(s => ({
    teachingTips: s.teachingTips,
    conversationalTeacher: s.conversationalTeacher,
    characterGuideMode: s.characterGuideMode,
    activeDeconstruction: s.activeDeconstruction,
    emotionWheelDefault: s.emotionWheelDefault,
    contentRating: s.contentRating,
    ttsHighlight: s.ttsHighlight,
  })));

  // Map store values to display values
  const teachingTipsMap = { 'on': true, 'collapsed': 'partial', 'off': false };
  const contentRatingMap = { 'PG-13': 'All', 'General': 'General', 'Young Adult': 'Young Adult', 'Mature': 'Mature', 'Explicit': 'Explicit', 'All': 'All' };

  const [teachingTips, setTeachingTips] = useState(settings.teachingTips === 'on');
  const [conversationalTeacher, setConversationalTeacher] = useState(settings.conversationalTeacher);
  const [characterGuideMode, setCharacterGuideMode] = useState(settings.characterGuideMode);
  const [activeDeconstruction, setActiveDeconstruction] = useState(settings.activeDeconstruction);
  const [emotionWheelDefault, setEmotionWheelDefault] = useState(settings.emotionWheelDefault);
  const [contentRating, setContentRating] = useState(contentRatingMap[settings.contentRating] || 'All');
  const [ttsHighlight, setTtsHighlight] = useState(settings.ttsHighlight);

  useEffect(() => {
    setTeachingTips(settings.teachingTips === 'on');
    setConversationalTeacher(settings.conversationalTeacher);
    setCharacterGuideMode(settings.characterGuideMode);
    setActiveDeconstruction(settings.activeDeconstruction);
    setEmotionWheelDefault(settings.emotionWheelDefault);
    setContentRating(contentRatingMap[settings.contentRating] || 'All');
    setTtsHighlight(settings.ttsHighlight);
  }, [settings]);

  const handleTeachingTips = async (val) => {
    setTeachingTips(val);
    await updateSettings({ teachingTips: val ? 'on' : 'off' });
    onSettingChange('teachingTips', val);
  };

  const handleConversationalTeacher = async (val) => {
    setConversationalTeacher(val);
    await updateSettings({ conversationalTeacher: val });
    onSettingChange('conversationalTeacher', val);
  };

  const handleCharacterGuideMode = async (newVal) => {
    setCharacterGuideMode(newVal);
    await updateSettings({ characterGuideMode: newVal });
    onSettingChange('characterGuideMode', newVal);
  };

  const handleActiveDeconstruction = async (val) => {
    setActiveDeconstruction(val);
    await updateSettings({ activeDeconstruction: val });
    onSettingChange('activeDeconstruction', val);
  };

  const handleEmotionWheel = async (newVal) => {
    setEmotionWheelDefault(newVal);
    await updateSettings({ emotionWheelDefault: newVal });
    onSettingChange('emotionWheelDefault', newVal);
  };

  const handleContentRating = async (newVal) => {
    setContentRating(newVal);
    const keyMap = { 'All': 'PG-13', 'General': 'General', 'Young Adult': 'Young Adult', 'Mature': 'Mature', 'Explicit': 'Explicit' };
    await updateSettings({ contentRating: keyMap[newVal] || 'PG-13' });
    onSettingChange('contentRating', newVal);
  };

  const handleTtsHighlight = async (val) => {
    setTtsHighlight(val);
    await updateSettings({ ttsHighlight: val });
    onSettingChange('ttsHighlight', val);
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Writing</h2>

      <SettingRow label="Teaching Tips" desc="Show educational guidance while writing">
        <Toggle checked={teachingTips} onChange={handleTeachingTips} />
      </SettingRow>

      <SettingRow label="Conversational Teacher" desc="Receive feedback in a conversational tone">
        <Toggle checked={conversationalTeacher} onChange={handleConversationalTeacher} />
      </SettingRow>

      <SettingRow label="Character Guide Mode" desc="Get guidance from a character's perspective">
        <Toggle checked={characterGuideMode} onChange={handleCharacterGuideMode} />
      </SettingRow>

      <SettingRow label="Active Deconstruction" desc="Break down text analysis into layers">
        <Toggle checked={activeDeconstruction} onChange={handleActiveDeconstruction} />
      </SettingRow>

      <SettingRow label="Emotion Wheel Default" desc="Auto-suggest or manual selection mode">
        <Select
          options={['engine', 'picker']}
          value={emotionWheelDefault}
          onChange={handleEmotionWheel}
        />
      </SettingRow>

      <SettingRow label="Content Rating Filter" desc="Show ratings appropriate for your content">
        <Select
          options={['All', 'General', 'Young Adult', 'Mature', 'Explicit']}
          value={contentRating}
          onChange={handleContentRating}
        />
      </SettingRow>

      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: 24, marginBottom: 10, fontWeight: 600 }}>
        Text-to-Speech
      </div>

      <SettingRow label="Highlight While Reading" desc="Highlight text as it is read aloud">
        <Toggle checked={ttsHighlight} onChange={handleTtsHighlight} />
      </SettingRow>
    </>
  );
}

// ─── Editor Settings ───
function EditorSettings({ onSettingChange }) {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const settings = useSettingsStore(useShallow(s => ({
    defaultApprovalMode: s.defaultApprovalMode,
    maxEditorPasses: s.maxEditorPasses,
    qualityThreshold: s.qualityThreshold,
    editorPersonaCount: s.editorPersonaCount,
    editorSeverityDisplay: s.editorSeverityDisplay,
    autoGenerateFeedback: s.autoGenerateFeedback,
    recurringFlagDetection: s.recurringFlagDetection,
  })));

  // Map store values to display values
  const approvalModeMap = { 'auto': 'Auto-Approve', 'per-chapter': 'Per Chapter', 'per-arc': 'Per Arc', 'multi-pass': 'Multi-Pass' };
  const qualityMap = { 'exceptional': 'Exceptional', 'strong': 'Strong', 'good': 'Good', 'developing': 'Developing', 'off': 'Off' };
  const severityMap = { 'all': 'colored', 'warnings': 'icons', 'critical': 'text', 'off': 'minimal' };

  const [approvalMode, setApprovalMode] = useState(approvalModeMap[settings.defaultApprovalMode] || 'Per Chapter');
  const [maxPasses, setMaxPasses] = useState(String(settings.maxEditorPasses || 3));
  const [qualityThreshold, setQualityThreshold] = useState(qualityMap[settings.qualityThreshold] || 'Strong');
  const [personaCount, setPersonaCount] = useState(String(settings.editorPersonaCount || 3));
  const [severityDisplay, setSeverityDisplay] = useState(severityMap[settings.editorSeverityDisplay] || 'colored');
  const [autoGenerateFeedback, setAutoGenerateFeedback] = useState(settings.autoGenerateFeedback);
  const [recurringFlagDetection, setRecurringFlagDetection] = useState(settings.recurringFlagDetection);

  useEffect(() => {
    setApprovalMode(approvalModeMap[settings.defaultApprovalMode] || 'Per Chapter');
    setMaxPasses(String(settings.maxEditorPasses || 3));
    setQualityThreshold(qualityMap[settings.qualityThreshold] || 'Strong');
    setPersonaCount(String(settings.editorPersonaCount || 3));
    setSeverityDisplay(severityMap[settings.editorSeverityDisplay] || 'colored');
    setAutoGenerateFeedback(settings.autoGenerateFeedback);
    setRecurringFlagDetection(settings.recurringFlagDetection);
  }, [settings]);

  const handleApprovalMode = async (newVal) => {
    setApprovalMode(newVal);
    const keyMap = { 'Auto-Approve': 'auto', 'Per Chapter': 'per-chapter', 'Per Arc': 'per-arc', 'Multi-Pass': 'multi-pass' };
    await updateSettings({ defaultApprovalMode: keyMap[newVal] || 'per-chapter' });
    onSettingChange('defaultApprovalMode', newVal);
  };

  const handleMaxPasses = async (newVal) => {
    setMaxPasses(newVal);
    await updateSettings({ maxEditorPasses: parseInt(newVal) || 3 });
    onSettingChange('maxEditorPasses', newVal);
  };

  const handleQualityThreshold = async (newVal) => {
    setQualityThreshold(newVal);
    const keyMap = { 'Exceptional': 'exceptional', 'Strong': 'strong', 'Good': 'good', 'Developing': 'developing', 'Off': 'off' };
    await updateSettings({ qualityThreshold: keyMap[newVal] || 'strong' });
    onSettingChange('qualityThreshold', newVal);
  };

  const handlePersonaCount = async (newVal) => {
    setPersonaCount(newVal);
    await updateSettings({ editorPersonaCount: parseInt(newVal) || 3 });
    onSettingChange('editorPersonaCount', newVal);
  };

  const handleSeverityDisplay = async (newVal) => {
    setSeverityDisplay(newVal);
    const keyMap = { 'colored': 'all', 'icons': 'warnings', 'text': 'critical', 'minimal': 'off' };
    await updateSettings({ editorSeverityDisplay: keyMap[newVal] || 'all' });
    onSettingChange('severityDisplay', newVal);
  };

  const handleAutoGenerateFeedback = async (val) => {
    setAutoGenerateFeedback(val);
    await updateSettings({ autoGenerateFeedback: val });
    onSettingChange('autoGenerateFeedback', val);
  };

  const handleRecurringFlagDetection = async (val) => {
    setRecurringFlagDetection(val);
    await updateSettings({ recurringFlagDetection: val });
    onSettingChange('recurringFlagDetection', val);
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Editor</h2>

      <SettingRow label="Default Approval Mode" desc="How Editor feedback is presented">
        <Select
          options={['Auto-Approve', 'Per Chapter', 'Per Arc', 'Multi-Pass']}
          value={approvalMode}
          onChange={handleApprovalMode}
        />
      </SettingRow>

      <SettingRow label="Max Editor Passes" desc="Maximum rounds for Multi-Pass mode">
        <Select
          options={['1', '2', '3', '4', '5', '6']}
          value={maxPasses}
          onChange={handleMaxPasses}
        />
      </SettingRow>

      <SettingRow label="Quality Threshold" desc="Auto-stops Multi-Pass when this rating is reached">
        <Select
          options={['Exceptional', 'Strong', 'Good', 'Developing', 'Off']}
          value={qualityThreshold}
          onChange={handleQualityThreshold}
        />
      </SettingRow>

      <SettingRow label="Editor Persona Count" desc="How many audience-based personas to generate">
        <Select
          options={['0', '1', '2', '3', '4', '5']}
          value={personaCount}
          onChange={handlePersonaCount}
        />
      </SettingRow>

      <SettingRow label="Severity Display" desc="How editing severity indicators appear">
        <Select
          options={['colored', 'icons', 'text', 'minimal']}
          value={severityDisplay}
          onChange={handleSeverityDisplay}
        />
      </SettingRow>

      <SettingRow label="Auto-Generate Feedback" desc="Automatically create summaries of edits">
        <Toggle checked={autoGenerateFeedback} onChange={handleAutoGenerateFeedback} />
      </SettingRow>

      <SettingRow label="Recurring Flag Detection" desc="Identify patterns in repeated editor flags">
        <Toggle checked={recurringFlagDetection} onChange={handleRecurringFlagDetection} />
      </SettingRow>
    </>
  );
}

// ─── Privacy & Data Settings ───
function PrivacySettings({ navigate, onSettingChange }) {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const settings = useSettingsStore(useShallow(s => ({
    showKeys: s.showKeys,
  })));

  const [showKeys, setShowKeys] = useState(settings.showKeys);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [storageLocation] = useState('Local (IndexedDB)');
  const projects = useProjectStore(s => s.projects);
  const [projectStats, setProjectStats] = useState({ count: 0, totalWords: 0, storageUsed: 'Calculating...' });

  useEffect(() => {
    setShowKeys(settings.showKeys);
  }, [settings.showKeys]);

  useEffect(() => {
    // Load projects if not already loaded
    const store = useProjectStore.getState();
    const doLoad = async () => {
      let allProjects = store.projects;
      if (!allProjects.length) {
        allProjects = await store.loadProjects();
      }
      // Count total words across all projects by reading actual file contents from IndexedDB
      let totalWords = 0;
      try {
        const db = (await import('../lib/db')).default;
        const allFiles = await db.projectFiles.toArray();
        allFiles.forEach(f => {
          if (typeof f.content === 'string') {
            totalWords += f.content.split(/\s+/).filter(Boolean).length;
          }
        });
      } catch {
        // Fallback to metadata-based word count
        allProjects.forEach(p => { totalWords += p.wordCount || 0; });
      }

      // Estimate IndexedDB storage
      let storageUsed = 'Unknown';
      try {
        if (navigator.storage?.estimate) {
          const est = await navigator.storage.estimate();
          const usedMB = ((est.usage || 0) / (1024 * 1024)).toFixed(1);
          storageUsed = usedMB >= 1024 ? `${(usedMB / 1024).toFixed(1)} GB` : `${usedMB} MB`;
        }
      } catch (e) { console.warn('[Settings] Storage estimate unavailable:', e.message); }

      setProjectStats({ count: allProjects.length, totalWords, storageUsed });
    };
    doLoad();
  }, [projects.length]);

  const handleShowKeys = async (val) => {
    setShowKeys(val);
    await updateSettings({ showKeys: val });
    onSettingChange('showKeys', val);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const store = useProjectStore.getState();
      let allProjects = store.projects;
      if (!allProjects.length) allProjects = await store.loadProjects();

      // Build export payload
      const exportData = { version: '1.0', exportedAt: new Date().toISOString(), projects: [] };
      for (const project of allProjects) {
        const projectExport = await store.exportProject(project.id);
        exportData.projects.push(projectExport);
      }

      // Include settings
      const settings = useSettingsStore.getState();
      const settingsToExport = {};
      for (const key of Object.keys(settings)) {
        if (!key.startsWith('_') && typeof settings[key] !== 'function') {
          settingsToExport[key] = settings[key];
        }
      }
      exportData.settings = settingsToExport;

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serendipity-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSettingChange('exportData', true);
    } catch (err) {
      console.error('Export failed:', err);
      onSettingChange('exportData', 'Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    onSettingChange('deleteAllData', true);
    setDeleteConfirm(false);
  };

  const handleResetSetup = () => {
    navigate('/terms');
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Privacy & Data</h2>

      <SettingRow label="Storage Location" desc="Where your project data is stored">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{storageLocation}</span>
      </SettingRow>

      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: 8 }}>Project Data Statistics</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Projects</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{projectStats.count}</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Words</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{projectStats.totalWords.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--bg-tertiary)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Storage Used</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{projectStats.storageUsed}</div>
          </div>
        </div>
      </div>

      <SettingRow label="Show Keys" desc="Display API keys and sensitive identifiers">
        <Toggle checked={showKeys} onChange={handleShowKeys} />
      </SettingRow>

      <SettingRow label="Export All Data" desc="Download all your projects and settings as JSON">
        <Button size="sm" variant="secondary" onClick={handleExportAllData} disabled={isExporting}>
          <Download size={14} style={{ marginRight: 4 }} />
          {isExporting ? 'Exporting...' : 'Export →'}
        </Button>
      </SettingRow>

      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626', marginTop: 24, marginBottom: 10, fontWeight: 600 }}>
        Danger Zone
      </div>

      <SettingRow label="Re-run Setup" desc="Go back through Terms of Use and LLM configuration">
        <Button size="sm" variant="secondary" onClick={handleResetSetup}>
          <RefreshCw size={14} style={{ marginRight: 4 }} />
          Re-run →
        </Button>
      </SettingRow>

      <SettingRow label="Delete All Data" desc="Permanently remove all projects, settings, and session data">
        <Button
          size="sm"
          onClick={handleDeleteAllData}
          style={{
            background: deleteConfirm ? '#b91c1c' : '#dc2626',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <Trash2 size={14} style={{ marginRight: 4 }} />
          {deleteConfirm ? 'Click again to confirm' : 'Delete Everything'}
        </Button>
      </SettingRow>
    </>
  );
}

// ─── Writing Profile Settings ───
function WritingProfileSettings({ onSettingChange }) {
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const activeProjectId = useProjectStore(s => s.activeProjectId);
  const settings = useSettingsStore(useShallow(s => ({
    silentAssessment: s.silentAssessment,
    trackAcrossProjects: s.trackAcrossProjects,
  })));

  const [silentAssessment, setSilentAssessment] = useState(settings.silentAssessment);
  const [trackAcrossProjects, setTrackAcrossProjects] = useState(settings.trackAcrossProjects);

  useEffect(() => {
    setSilentAssessment(settings.silentAssessment);
    setTrackAcrossProjects(settings.trackAcrossProjects);
  }, [settings.silentAssessment, settings.trackAcrossProjects]);

  const handleSilentAssessment = async (val) => {
    setSilentAssessment(val);
    await updateSettings({ silentAssessment: val });
    onSettingChange('silentAssessment', val);
  };

  const handleTrackAcrossProjects = async (val) => {
    setTrackAcrossProjects(val);
    await updateSettings({ trackAcrossProjects: val });
    onSettingChange('trackAcrossProjects', val);
  };

  const handleResetJourney = async () => {
    if (window.confirm('Clear all writing profile data and start fresh? This cannot be undone.')) {
      try {
        const db = (await import('../lib/db')).default;
        await db.writingProfile.clear();
        onSettingChange('resetJourney', true);
      } catch (err) {
        console.error('Failed to reset journey:', err);
      }
    }
  };

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Writing Profile</h2>

      <div style={{ marginBottom: 24 }}>
        <WritingProfile projectId={trackAcrossProjects ? null : activeProjectId} compact={false} showAnalyzeButton={true} />
      </div>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          Settings
        </h3>

        <SettingRow label="Silent Assessment" desc="Receive feedback without interruptions">
          <Toggle checked={silentAssessment} onChange={handleSilentAssessment} />
        </SettingRow>

        <SettingRow label="Track Across Projects" desc="Maintain writing statistics across all projects">
          <Toggle checked={trackAcrossProjects} onChange={handleTrackAcrossProjects} />
        </SettingRow>

        <SettingRow label="Reset Your Journey" desc="Clear all profile data and start fresh">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleResetJourney}
            style={{ color: '#f97316' }}
          >
            Reset Journey
          </Button>
        </SettingRow>
      </div>
    </>
  );
}

// ─── About Settings ───
function AboutSettings() {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const keyboardShortcuts = [
    { keys: 'Ctrl/Cmd + S', action: 'Save current project' },
    { keys: 'Ctrl/Cmd + N', action: 'Create new project' },
    { keys: 'Ctrl/Cmd + Shift + E', action: 'Open editor' },
    { keys: 'Ctrl/Cmd + Shift + H', action: 'Toggle help panel' },
    { keys: 'Ctrl/Cmd + ,', action: 'Open settings' },
    { keys: 'Cmd + Option + I / Ctrl + Shift + I', action: 'Toggle DevTools' },
    { keys: 'F1', action: 'Show keyboard shortcuts' },
    { keys: 'Escape', action: 'Close modal or panel' },
  ];

  return (
    <>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>
        <span>✦ About Serendipity | StoryWeaver</span>
      </h2>

      <SettingRow label="Version" desc="">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>v0.1.0-alpha</span>
      </SettingRow>

      <SettingRow label="Build Info" desc="">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Development Build</span>
      </SettingRow>

      <SettingRow label="Keyboard Shortcuts" desc="">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
        >
          {showKeyboardShortcuts ? 'Hide' : 'View'} Shortcuts
        </Button>
      </SettingRow>

      {showKeyboardShortcuts && (
        <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginBottom: 20, marginTop: -8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
            {keyboardShortcuts.map((shortcut, idx) => (
              <div key={idx} style={{ display: 'contents' }}>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>
                  {shortcut.keys}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {shortcut.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600 }}>
          Resources
        </div>
        {[
          { label: 'Documentation', href: 'https://docs.serendipity.ai' },
          { label: 'GitHub Repository', href: 'https://github.com/serendipity-engine' },
          { label: 'Report a Bug', href: 'https://github.com/serendipity-engine/issues' },
          { label: 'Feature Request', href: 'https://github.com/serendipity-engine/discussions' },
          { label: 'Terms of Use', href: '/terms' },
        ].map((link) => (
          <div key={link.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
          }}
          onClick={() => window.open(link.href, '_blank')}
          >
            <span style={{ fontSize: '0.85rem' }}>{link.label}</span>
            <ExternalLink size={14} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
          <Heart size={12} style={{ display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />
          Built with passion by the Serendipity team
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          MIT License · Copyright 2024-2025
        </p>
      </div>
    </>
  );
}

// ─── Main Settings Screen Component ───
export default function SettingsScreen() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('general');
  const [currentTheme, setCurrentTheme] = useState(detectCurrentTheme);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const updateSettings = useSettingsStore(s => s.updateSettings);

  const handleThemeChange = (key) => {
    applyTheme(key);
    setCurrentTheme(key);
    updateSettings({ theme: key });
    showToastMessage(`Theme changed to ${themePresets[key].name}`);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleSettingChange = (key, value) => {
    // Persist to IndexedDB via settings store (skip action-only keys)
    const actionKeys = ['exportData', 'deleteAllData', 'viewProfile', 'resetJourney'];
    if (!actionKeys.includes(key)) {
      updateSettings({ [key]: value });
    }

    let message = '';

    switch (key) {
      case 'mode':
        message = `Mode set to ${value}`;
        break;
      case 'fontSize':
        message = `Font size set to ${value}`;
        break;
      case 'editorFont':
        message = `Editor font changed to ${value}`;
        break;
      case 'language':
        message = `Language changed to ${value}`;
        break;
      case 'sidebarPosition':
        message = `Sidebar moved to ${value}`;
        break;
      case 'roleAssignmentMode':
        message = `Role assignment mode set to ${value}`;
        break;
      case 'auditTrail':
        message = `Audit trail ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'costTracking':
        message = `Cost tracking ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'autoSaveInterval':
        message = `Auto-save interval updated`;
        break;
      case 'crashRecovery':
        message = `Crash recovery ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'defaultExportFormat':
        message = `Default export format set to ${value}`;
        break;
      case 'backupReminder':
        message = `Backup reminder set to ${value}`;
        break;
      case 'showWordCount':
        message = `Word count display ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'defaultWordGoal':
        message = `Default word goal set to ${value}`;
        break;
      case 'teachingTips':
        message = `Teaching tips ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'conversationalTeacher':
        message = `Conversational teacher ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'characterGuideMode':
        message = `Character guide mode ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'defaultApprovalMode':
        message = `Default approval mode set to ${value}`;
        break;
      case 'maxEditorPasses':
        message = `Max editor passes set to ${value}`;
        break;
      case 'qualityThreshold':
        message = `Quality threshold set to ${value}`;
        break;
      case 'editorPersonaCount':
        message = `Editor persona count set to ${value}`;
        break;
      case 'exportData':
        message = 'Exporting data...';
        break;
      case 'deleteAllData':
        message = 'All data has been deleted';
        break;
      case 'silentAssessment':
        message = `Silent assessment ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'trackAcrossProjects':
        message = `Project tracking ${value ? 'enabled' : 'disabled'}`;
        break;
      case 'resetJourney':
        message = 'Your journey has been reset';
        break;
      case 'viewProfile':
        message = 'Opening your writing profile...';
        break;
      default:
        message = 'Setting updated';
    }

    if (message) {
      showToastMessage(message);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralSettings currentTheme={currentTheme} onThemeChange={handleThemeChange} onSettingChange={handleSettingChange} />;
      case 'ai':
        return <AISettings onSettingChange={handleSettingChange} />;
      case 'workspace':
        return <WorkspaceSettings onSettingChange={handleSettingChange} />;
      case 'writing':
        return <WritingSettings onSettingChange={handleSettingChange} />;
      case 'editor':
        return <EditorSettings onSettingChange={handleSettingChange} />;
      case 'privacy':
        return <PrivacySettings navigate={navigate} onSettingChange={handleSettingChange} />;
      case 'profile':
        return <WritingProfileSettings onSettingChange={handleSettingChange} />;
      case 'about':
        return <AboutSettings />;
      default:
        return <GeneralSettings currentTheme={currentTheme} onThemeChange={handleThemeChange} onSettingChange={handleSettingChange} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
      <TopBar showHealth={false} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar Navigation */}
        <div style={{
          width: 220,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          padding: '16px 8px',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/hub')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left',
              background: 'transparent', color: 'var(--text-secondary)',
              marginBottom: 14, transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <ArrowLeft size={16} />
            Back to Hub
          </button>

          {/* Settings Label */}
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '8px 12px 12px', fontWeight: 600 }}>
            Settings
          </div>

          {/* Category Buttons */}
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: 4,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 48px',
          maxWidth: 800,
          color: 'var(--text-primary)',
        }}>
          {renderContent()}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
