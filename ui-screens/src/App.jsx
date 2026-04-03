import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TermsScreen from './screens/TermsScreen'
import SetupScreen from './screens/SetupScreen'
import HubScreen from './screens/HubScreen'
import WizardScreen from './screens/WizardScreen'
import WorkspaceScreen from './screens/WorkspaceScreen'
import SettingsScreen from './screens/SettingsScreen'
import { useSettingsStore } from './stores/settingsStore'
import { useProjectStore } from './stores/projectStore'
import { useLlmStore } from './stores/llmStore'

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
  }, []);

  return (
    <Routes>
      <Route path="/" element={<SmartRedirect />} />
      <Route path="/terms" element={<TermsScreen />} />
      <Route path="/setup" element={<SetupScreen />} />
      <Route path="/hub" element={<HubScreen />} />
      <Route path="/wizard" element={<WizardScreen />} />
      <Route path="/workspace" element={<WorkspaceScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
    </Routes>
  )
}
