/**
 * Serendipity | StoryWeaver — Settings Store (Zustand)
 *
 * Persists to IndexedDB via Dexie.
 * Changes take effect immediately (no save button).
 */
import { create } from 'zustand';
import { getSetting, setSetting } from '../lib/db';
import { applyTheme, DEFAULT_THEME } from '../lib/themes';

const defaultSettings = {
  // ── General ──────────────────────
  authorName: '',               // user's display name
  mode: 'advanced',             // 'simple' | 'advanced'
  theme: DEFAULT_THEME,         // theme key
  fontSize: 'medium',           // 'small' | 'medium' | 'large'
  editorFont: 'system',         // 'system' | 'serif' | 'monospace'
  language: 'en',
  sidebarPosition: 'left',     // 'left' | 'right'

  // ── AI Models ────────────────────
  roleAssignment: 'simple',     // 'simple' | 'advanced'
  auditTrail: true,
  costTracking: false,
  defaultModel: null,           // provider:model string

  // Role assignments (for standard/granular modes)
  roles: {
    generator: null,
    editor: null,
    chat: null,
    analyst: null,
  },

  // Task-level overrides (for granular mode)
  taskOverrides: {},

  // ── Workspace ────────────────────
  autoSaveInterval: 30000,      // ms (0 = off)
  crashRecovery: true,
  defaultExportFormat: 'docx',
  exportLocation: 'last-used',
  backupReminder: 'weekly',     // 'daily' | 'weekly' | 'monthly' | 'off'
  reminderStyle: 'toast',
  showWordCount: true,
  defaultWordGoal: 80000,

  // ── Writing ──────────────────────
  teachingTips: 'on',           // 'on' | 'collapsed' | 'off'
  conversationalTeacher: false,
  characterGuideMode: false,
  guideCharacter: null,
  activeDeconstruction: true,
  deconstructionLayers: {
    grammar: true, voice: true, structure: true,
    theme: true, character: true,
  },
  emotionWheelDefault: 'engine', // 'engine' | 'picker'
  contentRating: 'PG-13',

  // ── TTS ──────────────────────────
  ttsSpeed: '1x',
  ttsVoice: 'system',
  ttsHighlight: true,
  ttsAutoRead: false,

  // ── Editor (Phase 9) ─────────────
  defaultApprovalMode: 'per-chapter', // 'auto' | 'per-chapter' | 'per-arc' | 'multi-pass'
  maxEditorPasses: 3,
  qualityThreshold: 'strong',
  editorPersonaCount: 3,
  editorSeverityDisplay: 'all', // 'all' | 'warnings' | 'critical'
  autoGenerateFeedback: true,
  recurringFlagDetection: true,

  // ── Privacy & Data ───────────────
  storageLocation: 'browser',   // 'browser' | 'filesystem'
  showKeys: false,

  // ── Writing Profile ──────────────
  silentAssessment: true,
  trackAcrossProjects: true,

  // ── Onboarding ───────────────────
  onboarded: false,
  tourCompleted: false,
  welcomeCardDismissed: false,
};

export const useSettingsStore = create((set, get) => ({
  ...defaultSettings,
  _loaded: false,

  /**
   * Load all settings from IndexedDB on app start
   */
  loadSettings: async () => {
    try {
      const stored = await getSetting('appSettings');
      if (stored) {
        const merged = { ...defaultSettings, ...stored };
        set({ ...merged, _loaded: true });
        applyTheme(merged.theme);
      } else {
        set({ _loaded: true });
        applyTheme(DEFAULT_THEME);
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
      set({ _loaded: true });
    }
  },

  /**
   * Update one or more settings and persist
   */
  updateSettings: async (updates) => {
    set(updates);

    // Apply theme immediately if changed
    if (updates.theme) {
      applyTheme(updates.theme);
    }

    // Persist to IndexedDB
    const current = get();
    const toSave = {};
    for (const key of Object.keys(defaultSettings)) {
      toSave[key] = current[key];
    }
    try {
      await setSetting('appSettings', toSave);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  },

  /**
   * Reset all settings to defaults
   */
  resetSettings: async () => {
    set({ ...defaultSettings });
    applyTheme(DEFAULT_THEME);
    try {
      await setSetting('appSettings', defaultSettings);
    } catch (err) {
      console.warn('Failed to reset settings:', err);
    }
  },
}));
