import { Routes, Route, Navigate } from 'react-router-dom'
import TermsScreen from './screens/TermsScreen'
import SetupScreen from './screens/SetupScreen'
import HubScreen from './screens/HubScreen'
import WizardScreen from './screens/WizardScreen'
import WorkspaceScreen from './screens/WorkspaceScreen'
import SettingsScreen from './screens/SettingsScreen'

/*
 * ──────────────────────────────────────────────────────────
 *  ACTION PLAN — Index Route & First-Time vs Returning Flow
 * ──────────────────────────────────────────────────────────
 *
 *  REMOVED: ScreenIndex (developer screen map) is no longer the
 *  index route. The "/" route now redirects based on onboarding state.
 *
 *  FLOW LOGIC:
 *
 *  1. FIRST-TIME USER (no localStorage flag "se_onboarded"):
 *     "/" → Navigate to /terms
 *     /terms → user accepts Terms of Use → navigate to /setup
 *     /setup → user configures LLM provider & API key → navigate to /hub
 *     On completing /setup, set localStorage "se_onboarded" = "true"
 *
 *  2. RETURNING USER (localStorage "se_onboarded" === "true"):
 *     "/" → Navigate directly to /hub (the dashboard)
 *     The user never sees /terms or /setup again unless they
 *     navigate there manually or reset via Settings.
 *
 *  3. SETTINGS RESET:
 *     /settings should include an option to "Re-run Setup" which
 *     clears the "se_onboarded" flag and redirects to /terms.
 *
 *  4. GUARD ROUTES:
 *     /workspace and /wizard should check if the user has at least
 *     one project. If not, redirect to /hub which will show an
 *     empty state prompting them to create their first story.
 *
 *  TODO: Replace the simple Navigate below with a SmartRedirect
 *  component that reads localStorage and routes accordingly.
 *  For now, "/" goes straight to /hub (assuming onboarded).
 * ──────────────────────────────────────────────────────────
 */

function SmartRedirect() {
  // TODO: When persistence layer is ready, check localStorage:
  // const onboarded = localStorage.getItem('se_onboarded') === 'true';
  // return <Navigate to={onboarded ? '/hub' : '/terms'} replace />;
  //
  // For now, default to /hub (the prototype assumes an existing user):
  return <Navigate to="/hub" replace />;
}

export default function App() {
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
