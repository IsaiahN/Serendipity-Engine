import { Routes, Route } from 'react-router-dom'
import ScreenIndex from './screens/ScreenIndex'
import TermsScreen from './screens/TermsScreen'
import SetupScreen from './screens/SetupScreen'
import HubScreen from './screens/HubScreen'
import WizardScreen from './screens/WizardScreen'
import WorkspaceScreen from './screens/WorkspaceScreen'
import SettingsScreen from './screens/SettingsScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScreenIndex />} />
      <Route path="/terms" element={<TermsScreen />} />
      <Route path="/setup" element={<SetupScreen />} />
      <Route path="/hub" element={<HubScreen />} />
      <Route path="/wizard" element={<WizardScreen />} />
      <Route path="/workspace" element={<WorkspaceScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
    </Routes>
  )
}
