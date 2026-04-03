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
| `WorkspaceScreen.jsx` ~L6165 | **Character deletion is a no-op.** The Cast Roster shows a delete button but `onCharacterDelete` does nothing. | Implement: remove character .md file from project store, update relationships references, confirm with user first. |
| `WorkspaceScreen.jsx` ~L5938 | **Project switching has no save/restore.** A detailed TODO spec exists (dirty-state detection, serialization) but nothing is implemented. Switching projects discards unsaved work. | Implement `hasDirtyState()` check, confirmation modal, project serialization to IndexedDB, hydration on load. |
| `WorkspaceScreen.jsx` | **`mode=import` route is unhandled.** WizardScreen navigates to `/workspace?mode=import` but WorkspaceScreen has no case for it; falls through to PlaceholderMode. | Add an `import` case in the mode switch that shows the appropriate import/upload UI. |
| `PhaseProgress.jsx` ~L42 | **Decomposed project flag not checked for phase unlocking.** `allPrereqsComplete()` only checks phase percentages, doesn't honor the `_decomposed` flag for unlocking Phase 8 & 9. | Check `isDecomposed` flag in the prereq function so decomposed projects can enter Phase 8 directly. |

### SCAFFOLDING (UI Exists, Not Wired to Real Data)

| Location | Issue | What's Needed |
|----------|-------|---------------|
| `WorkspaceScreen.jsx` ~L3107-3186 | **Deep Comparison uses hardcoded sample data.** `sampleWorksLibrary` (4 fake books) and `sampleComparisonData` (full fake analysis) stand in for real LLM-generated comparisons. | Wire the "Run Deep Comparison" button to call `PROMPTS.DEEP_COMPARISON` per dimension, then `PROMPTS.DEEP_COMPARISON_SUMMARY` to synthesize. Parse JSON results into the existing UI. |
| `WorkspaceScreen.jsx` ~L1936-1984 | **Timeline Mode uses hardcoded character arcs.** 5 fake characters with numeric arcs, interaction matrices, and a hardcoded `plotSpine` array. | Pull actual characters from project files, compute arc data from chapter summaries/notes, derive plot spine from phase answers. |
| `WorkspaceScreen.jsx` ~L3988-4003 | **World Building Mode has static demo locations and culture rules.** 6 hardcoded locations and 6 cultural rules. | Parse the project's `world/world-building.md` file to extract locations, rules, and other world data dynamically. |
| `SettingsScreen.jsx` (GeneralSettings, WritingSettings, EditorSettings, etc.) | **Most settings use local useState but don't persist.** `onSettingChange()` fires a toast but doesn't call the settings store to save to IndexedDB. | Wire each `onSettingChange()` callback to `useSettingsStore.updateSettings()` so values persist across sessions. |
| `SettingsScreen.jsx` (PrivacySettings) | **Project stats are hardcoded** (`{ count: 12, totalWords: 245000, storageUsed: '2.3 GB' }`). | Compute real stats from `projectStore` and IndexedDB usage. |
| `TopBar.jsx` ~L212 | **Keyboard Shortcuts button is a no-op** (`onClick={() => {}`). | Wire to a shortcuts modal or the About > Shortcuts section in Settings. |
| `TopBar.jsx` ~L215,218 | **Theme and Product Tour buttons** fall back to no-ops when props aren't passed. | Pass callbacks or remove buttons if features aren't planned. |

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
4. Implement character deletion handler
5. Handle `mode=import` route in WorkspaceScreen

### P1: Should Fix Before Beta
6. Implement project switching with dirty-state detection and save/restore
7. Wire settings persistence to IndexedDB via settingsStore
8. Fix decomposed project phase unlocking (check `_decomposed` flag in `allPrereqsComplete`)
9. Wire Deep Comparison to real LLM calls using prompt registry entries
10. Compute real project stats in Privacy & Data settings

### P2: Should Fix Before Launch
11. Wire World Building mode to actual project `world-building.md` data
12. Wire Timeline mode to actual project characters and chapter data
13. Add keyboard shortcuts modal
14. Remove or wire remaining no-op button handlers in TopBar
15. Wire chat suggestion pills to `PROMPTS.CHAT_SUGGESTIONS` for context-aware starters

### P3: Nice to Have
16. Wire `PROMPTS.WRITING_HEALTH` to the health scoring dashboard for LLM-powered quality assessment
17. Implement TTS integration (currently settings UI only)
18. Add export-all-data functionality in Privacy & Data settings
19. Implement product tour / onboarding flow
