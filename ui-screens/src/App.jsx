import { useEffect, useState, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TermsScreen from './screens/TermsScreen'
import SetupScreen from './screens/SetupScreen'
import HubScreen from './screens/HubScreen'
import CommandPalette from './components/CommandPalette'
import { useSettingsStore } from './stores/settingsStore'
import { useProjectStore } from './stores/projectStore'
import { useLlmStore } from './stores/llmStore'
import { InstallBanner, OfflineIndicator, UpdateNotification } from './components/PWAPrompts'
import { registerServiceWorker, requestPersistentStorage } from './lib/serviceWorker'

// Lazy load heavy components for code splitting
const WizardScreen = lazy(() => import('./screens/WizardScreen'))
const WorkspaceScreen = lazy(() => import('./screens/WorkspaceScreen'))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'))

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
        <div>Loading Serendipity Engine...</div>
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

    // Register service worker for offline support
    registerServiceWorker();

    // Request persistent storage so browser won't evict our IndexedDB data
    requestPersistentStorage();
  }, []);

  return (
    <>
      {/* PWA overlays */}
      <OfflineIndicator />
      <UpdateNotification />
      <InstallBanner />

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
    </>
  )
}
