import { useEffect, useState, Suspense, lazy, Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TermsScreen from './screens/TermsScreen'
import SetupScreen from './screens/SetupScreen'
import HubScreen from './screens/HubScreen'
import CommandPalette from './components/CommandPalette'
import { useSettingsStore } from './stores/settingsStore'
import { useProjectStore } from './stores/projectStore'
import { useLlmStore } from './stores/llmStore'
import { requestPersistentStorage } from './lib/serviceWorker'

// Lazy load heavy components for code splitting
const WizardScreen = lazy(() => import('./screens/WizardScreen'))
const WorkspaceScreen = lazy(() => import('./screens/WorkspaceScreen'))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'))

/**
 * ErrorBoundary — catches rendering errors in child components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Rendering error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: 20,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              An error occurred while rendering the application. Try reloading the page.
            </p>
            {this.state.error && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                marginBottom: 24,
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textAlign: 'left',
                fontFamily: 'monospace',
                maxHeight: 150,
                overflow: 'auto',
              }}>
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * LoadingFallback — shown while lazy-loaded routes are loading
 */
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', color: 'var(--text-muted)', fontSize: '0.9rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>✦</div>
        <div>Loading Serendipity | StoryWeaver...</div>
      </div>
    </div>
  );
}

/**
 * SmartRedirect — routes based on onboarding state
 *
 * First-time user: "/" → /terms → /setup → /hub
 * Returning user: "/" → /hub
 */
function SmartRedirect() {
  const onboarded = useSettingsStore(s => s.onboarded);
  const loaded = useSettingsStore(s => s._loaded);

  if (!loaded) {
    return <LoadingFallback />;
  }

  return <Navigate to={onboarded ? '/hub' : '/terms'} replace />;
}

export default function App() {
  const loadSettings = useSettingsStore(s => s.loadSettings);
  const loadProjects = useProjectStore(s => s.loadProjects);
  const loadProviders = useLlmStore(s => s.loadProviders);

  useEffect(() => {
    // Initialize all stores from IndexedDB on app start
    loadSettings();
    loadProjects();
    loadProviders();

    // Request persistent storage so browser won't evict our IndexedDB data
    requestPersistentStorage();
  }, []);

  return (
    <ErrorBoundary>
      {/* Command palette (global) */}
      <CommandPalette />

      {/* Routes with code splitting */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<SmartRedirect />} />
          <Route path="/terms" element={<TermsScreen />} />
          <Route path="/setup" element={<SetupScreen />} />
          <Route path="/hub" element={<HubScreen />} />
          <Route path="/wizard" element={<WizardScreen />} />
          <Route path="/workspace" element={<WorkspaceScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
