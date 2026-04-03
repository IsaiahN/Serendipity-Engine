# Serendipity Engine: Codebase Audit & Next Steps

> Generated: April 2, 2026
> Scope: Full PWA codebase (`ui-screens/src/`)

---

## Security Findings

### CRITICAL: Google Gemini API Key in URL

**File:** `stores/llmStore.js` (testConnection and sendMessage, Google case)

Google's `generateContent` endpoint embeds the API key as a query parameter:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=USER_API_KEY
```

This exposes the key in browser history, dev tools Network tab, referrer headers, and any proxy/CDN logs. All other providers (Anthropic, OpenAI, OpenRouter) correctly use HTTP headers.

**Status:** Fixed. Google calls now pass the key in an `x-goog-api-key` header instead.

### MODERATE: No Root .gitignore

The repository had no `.gitignore` at the project root. A `.gitignore` only existed inside `ui-screens/`. If anyone added a `.env` file at the repo root, or if IndexedDB export files were saved to the repo directory, they could be committed accidentally.

**Status:** Fixed. Root `.gitignore` added covering `.env*`, API key files, OS files, and editor configs.

### LOW: Encryption Key Regenerated Every Session

**File:** `lib/db.js`

The AES-256-GCM encryption key for API keys is generated fresh each browser session. This means previously stored API keys become undecryptable after a page reload. Users must re-enter keys after every browser restart.

**Status:** Fixed. The CryptoKey is now persisted to IndexedDB via the structured clone algorithm (IDB natively supports CryptoKey storage). Keys survive across sessions.

---

## Placeholder & Scaffolding Findings

### BROKEN (Will Error or Silently Fail If Used)

| Location | Issue | What's Needed |
|----------|-------|---------------|
| `WorkspaceScreen.jsx` ~L6165 | ~~**Character deletion is a no-op.**~~ **Fixed.** Full deletion with confirm dialog, IndexedDB removal, and state reload. | ~~Implement: remove character .md file from project store, update relationships references, confirm with user first.~~ |
| `WorkspaceScreen.jsx` ~L5938 | **Project switching has no save/restore.** A detailed TODO spec exists (dirty-state detection, serialization) but nothing is implemented. Switching projects discards unsaved work. | Implement `hasDirtyState()` check, confirmation modal, project serialization to IndexedDB, hydration on load. |
| `WorkspaceScreen.jsx` | ~~**`mode=import` route is unhandled.**~~ **Fixed.** Import case added to mode switch with decomposition wizard launch UI. | ~~Add an `import` case in the mode switch.~~ |
| `PhaseProgress.jsx` ~L42 | ~~**Decomposed project flag not checked for phase unlocking.**~~ **Fixed.** `isDecomposed` prop added and passed through to `allPrereqsComplete()`. | ~~Check `isDecomposed` flag.~~ |

### SCAFFOLDING (UI Exists, Not Wired to Real Data)

| Location | Issue | What's Needed |
|----------|-------|---------------|
| `WorkspaceScreen.jsx` ~L3107-3186 | ~~**Deep Comparison uses hardcoded sample data.**~~ **Fixed.** Now calls `PROMPTS.DEEP_COMPARISON` per dimension + `PROMPTS.DEEP_COMPARISON_SUMMARY` for synthesis via LLM. Loading states and error fallbacks included. | ~~Wire to LLM.~~ |
| `WorkspaceScreen.jsx` ~L1936-1984 | ~~**Timeline Mode uses hardcoded character arcs.**~~ **Fixed.** `buildTimelineData()` reads character files, counts mentions per chapter, and derives act structure dynamically. | ~~Pull from project files.~~ |
| `WorkspaceScreen.jsx` ~L3988-4003 | ~~**World Building Mode has static demo data.**~~ **Fixed.** Parses `world/world-building.md` into structured sections (locations, culture, history, hallmarks) with empty-state fallback. | ~~Parse world-building.md.~~ |
| `SettingsScreen.jsx` (GeneralSettings, etc.) | ~~**Most settings don't persist.**~~ **Fixed.** `handleSettingChange` now calls `useSettingsStore.updateSettings()` for all non-action keys. | ~~Wire to settingsStore.~~ |
| `SettingsScreen.jsx` (PrivacySettings) | ~~**Project stats are hardcoded.**~~ **Fixed.** Stats now load dynamically from projectStore + navigator.storage API. | ~~Compute real stats.~~ |
| `TopBar.jsx` ~L212 | ~~**Keyboard Shortcuts button is a no-op.**~~ **Fixed.** Opens a ShortcutsModal with all keyboard shortcuts. | ~~Wire to modal.~~ |
| `TopBar.jsx` ~L215,218 | ~~**Theme and Product Tour buttons no-ops.**~~ **Fixed.** Theme navigates to settings, Tour navigates to about section. | ~~Wire or remove.~~ |

### COSMETIC (Harmless but Worth Noting)

| Location | Issue |
|----------|-------|
| `WorkspaceScreen.jsx` ~L5094 | `PlaceholderMode()` component renders "This mode will be built out with full interactivity." for unimplemented workspace modes. |
| `exportEngine.js` ~L396,421 | PDF builder uses a `PAGES_PLACEHOLDER` string internally during construction. This is a valid pattern, not actually broken. |
| `sessionLogger.js` ~L323 | Fallback no-op logger (`async () => {}`) when logger isn't initialized. Safe but indicates some code paths don't initialize the logger. |

---

## Recommended Next Steps (Priority Order)

### P0: Must Fix Before User Testing
1. ~~Fix Google API key URL exposure~~ (Done)
2. ~~Add root .gitignore~~ (Done)
3. ~~Fix encryption key persistence~~ (Done)
4. ~~Implement character deletion handler~~ (Done)
5. ~~Handle `mode=import` route in WorkspaceScreen~~ (Done)

### P1: Should Fix Before Beta
6. ~~Implement project switching with dirty-state detection and save/restore~~ (Done — hasDirtyState, confirmation modal, Save & Switch / Discard & Switch)
7. ~~Wire settings persistence to IndexedDB via settingsStore~~ (Done)
8. ~~Fix decomposed project phase unlocking (check `_decomposed` flag in `allPrereqsComplete`)~~ (Done)
9. ~~Wire Deep Comparison to real LLM calls using prompt registry entries~~ (Done — per-dimension LLM analysis + summary synthesis, loading states, error handling)
10. ~~Compute real project stats in Privacy & Data settings~~ (Done — dynamic loading from projectStore + navigator.storage API)

### P2: Should Fix Before Launch
11. ~~Wire World Building mode to actual project `world-building.md` data~~ (Done — parses markdown sections into locations, culture, history, hallmarks)
12. ~~Wire Timeline mode to actual project characters and chapter data~~ (Done — buildTimelineData reads character files, counts mentions, derives act structure)
13. ~~Add keyboard shortcuts modal~~ (Done)
14. ~~Remove or wire remaining no-op button handlers in TopBar~~ (Done — shortcuts modal, theme→settings, tour→settings)
15. ~~Wire chat suggestion pills to `PROMPTS.CHAT_SUGGESTIONS` for context-aware starters~~ (Done — LLM-powered suggestions with fallback, re-fetches on persona/phase change)

### P3: Nice to Have
16. ~~Wire `PROMPTS.WRITING_HEALTH` to the health scoring dashboard for LLM-powered quality assessment~~ (Done — computeLLMHealth() function added to healthScoring.js)
17. ~~Implement TTS integration~~ (Already done — full Web Speech API implementation in useTTS.js)
18. ~~Add export-all-data functionality in Privacy & Data settings~~ (Done — exports all projects + settings as downloadable JSON)
19. ~~Implement product tour / onboarding flow~~ (Already done — full 8-step tour in ProductTour.jsx)
