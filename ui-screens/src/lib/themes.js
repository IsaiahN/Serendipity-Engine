/**
 * Serendipity Engine — Theme System
 *
 * 6 theme presets applied via CSS custom properties.
 * Each theme defines the full set of variables used in global.css.
 */

export const themePresets = {
  amber: {
    label: 'Amber',
    description: 'Warm dark theme (default)',
    colors: ['#f0a050', '#1a1d27'],
    vars: {
      '--bg-primary': '#0f1117',
      '--bg-secondary': '#1a1d27',
      '--bg-tertiary': '#242836',
      '--bg-card': '#1e2230',
      '--bg-hover': '#2a2f3f',
      '--bg-active': '#323850',
      '--text-primary': '#e8eaed',
      '--text-secondary': '#9aa0b0',
      '--text-muted': '#6b7280',
      '--text-accent': '#f0a050',
      '--accent': '#f0a050',
      '--accent-hover': '#e08840',
      '--accent-glow': 'rgba(240,160,80,0.15)',
      '--accent-subtle': 'rgba(240,160,80,0.08)',
      '--accent-muted': 'rgba(240,160,80,0.7)',
      '--accent-border': 'rgba(240,160,80,0.25)',
      '--accent-focus': 'rgba(240,160,80,0.45)',
      '--accent-tint': 'rgba(240,160,80,0.1)',
      '--accent-btn-text': '#000',
      '--border': '#2a2f3f',
      '--border-active': '#f0a050',
      '--editor-bg': '#0d0f14',
      '--editor-gutter': '#0a0c10',
      '--editor-text': '#c9d1d9',
    },
  },
  midnight: {
    label: 'Midnight',
    description: 'Cool blue dark theme',
    colors: ['#818cf8', '#0f172a'],
    vars: {
      '--bg-primary': '#0f172a',
      '--bg-secondary': '#1e293b',
      '--bg-tertiary': '#334155',
      '--bg-card': '#1e293b',
      '--bg-hover': '#334155',
      '--bg-active': '#475569',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--text-accent': '#818cf8',
      '--accent': '#818cf8',
      '--accent-hover': '#6366f1',
      '--accent-glow': 'rgba(129,140,248,0.15)',
      '--accent-subtle': 'rgba(129,140,248,0.08)',
      '--accent-muted': 'rgba(129,140,248,0.7)',
      '--accent-border': 'rgba(129,140,248,0.25)',
      '--accent-focus': 'rgba(129,140,248,0.45)',
      '--accent-tint': 'rgba(129,140,248,0.1)',
      '--accent-btn-text': '#000',
      '--border': '#334155',
      '--border-active': '#818cf8',
      '--editor-bg': '#0c1222',
      '--editor-gutter': '#0a0f1e',
      '--editor-text': '#e2e8f0',
    },
  },
  ember: {
    label: 'Ember',
    description: 'Warm red dark theme',
    colors: ['#f97316', '#1c1210'],
    vars: {
      '--bg-primary': '#1c1210',
      '--bg-secondary': '#271a16',
      '--bg-tertiary': '#3b2820',
      '--bg-card': '#271a16',
      '--bg-hover': '#3b2820',
      '--bg-active': '#4d3628',
      '--text-primary': '#fde8d8',
      '--text-secondary': '#c9a08a',
      '--text-muted': '#8b6e5e',
      '--text-accent': '#f97316',
      '--accent': '#f97316',
      '--accent-hover': '#ea580c',
      '--accent-glow': 'rgba(249,115,22,0.15)',
      '--accent-subtle': 'rgba(249,115,22,0.08)',
      '--accent-muted': 'rgba(249,115,22,0.7)',
      '--accent-border': 'rgba(249,115,22,0.25)',
      '--accent-focus': 'rgba(249,115,22,0.45)',
      '--accent-tint': 'rgba(249,115,22,0.1)',
      '--accent-btn-text': '#000',
      '--border': '#3b2820',
      '--border-active': '#f97316',
      '--editor-bg': '#18100e',
      '--editor-gutter': '#140d0b',
      '--editor-text': '#f5ddd0',
    },
  },
  forest: {
    label: 'Forest',
    description: 'Deep green dark theme',
    colors: ['#22c55e', '#0f1a14'],
    vars: {
      '--bg-primary': '#0f1a14',
      '--bg-secondary': '#16251c',
      '--bg-tertiary': '#1e3328',
      '--bg-card': '#16251c',
      '--bg-hover': '#1e3328',
      '--bg-active': '#2a4438',
      '--text-primary': '#e0f2e8',
      '--text-secondary': '#8bbfa0',
      '--text-muted': '#5a8a6e',
      '--text-accent': '#22c55e',
      '--accent': '#22c55e',
      '--accent-hover': '#16a34a',
      '--accent-glow': 'rgba(34,197,94,0.15)',
      '--accent-subtle': 'rgba(34,197,94,0.08)',
      '--accent-muted': 'rgba(34,197,94,0.7)',
      '--accent-border': 'rgba(34,197,94,0.25)',
      '--accent-focus': 'rgba(34,197,94,0.45)',
      '--accent-tint': 'rgba(34,197,94,0.1)',
      '--accent-btn-text': '#000',
      '--border': '#1e3328',
      '--border-active': '#22c55e',
      '--editor-bg': '#0c1610',
      '--editor-gutter': '#0a120e',
      '--editor-text': '#d1e8dc',
    },
  },
  twilight: {
    label: 'Twilight',
    description: 'Purple-pink dark theme',
    colors: ['#a78bfa', '#1a1225'],
    vars: {
      '--bg-primary': '#1a1225',
      '--bg-secondary': '#251a35',
      '--bg-tertiary': '#342548',
      '--bg-card': '#251a35',
      '--bg-hover': '#342548',
      '--bg-active': '#443560',
      '--text-primary': '#ede8f5',
      '--text-secondary': '#a898c8',
      '--text-muted': '#7a6a9a',
      '--text-accent': '#a78bfa',
      '--accent': '#a78bfa',
      '--accent-hover': '#8b5cf6',
      '--accent-glow': 'rgba(167,139,250,0.15)',
      '--accent-subtle': 'rgba(167,139,250,0.08)',
      '--accent-muted': 'rgba(167,139,250,0.7)',
      '--accent-border': 'rgba(167,139,250,0.25)',
      '--accent-focus': 'rgba(167,139,250,0.45)',
      '--accent-tint': 'rgba(167,139,250,0.1)',
      '--accent-btn-text': '#000',
      '--border': '#342548',
      '--border-active': '#a78bfa',
      '--editor-bg': '#160f20',
      '--editor-gutter': '#120c1a',
      '--editor-text': '#ddd6f0',
    },
  },
  daylight: {
    label: 'Daylight',
    description: 'Light theme for daytime',
    colors: ['#2563eb', '#ffffff'],
    vars: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f8fafc',
      '--bg-tertiary': '#f1f5f9',
      '--bg-card': '#ffffff',
      '--bg-hover': '#e2e8f0',
      '--bg-active': '#cbd5e1',
      '--text-primary': '#1e293b',
      '--text-secondary': '#475569',
      '--text-muted': '#94a3b8',
      '--text-accent': '#2563eb',
      '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--accent-glow': 'rgba(37,99,235,0.1)',
      '--accent-subtle': 'rgba(37,99,235,0.05)',
      '--accent-muted': 'rgba(37,99,235,0.7)',
      '--accent-border': 'rgba(37,99,235,0.2)',
      '--accent-focus': 'rgba(37,99,235,0.35)',
      '--accent-tint': 'rgba(37,99,235,0.08)',
      '--accent-btn-text': '#fff',
      '--border': '#e2e8f0',
      '--border-active': '#2563eb',
      '--editor-bg': '#fafafa',
      '--editor-gutter': '#f5f5f5',
      '--editor-text': '#334155',
    },
  },
};

/**
 * Apply a theme by setting CSS custom properties on :root
 */
export function applyTheme(themeKey) {
  const theme = themePresets[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

/**
 * Detect the currently active theme by comparing CSS variables
 */
export function detectCurrentTheme() {
  const root = document.documentElement;
  const currentAccent = getComputedStyle(root).getPropertyValue('--accent').trim();
  for (const [key, theme] of Object.entries(themePresets)) {
    if (theme.vars['--accent'] === currentAccent) return key;
  }
  return 'amber';
}

export const DEFAULT_THEME = 'amber';
