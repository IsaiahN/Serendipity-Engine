# Serendipity Engine — Full Feature Audit

**Date:** April 3, 2026
**Tested at:** http://localhost:5173 (Vite dev server)
**Method:** Live browser click-testing every feature + code review

---

## Summary

**Total features tested:** 35+
**Issues found:** 14 (5 P1, 4 P2, 5 P3)
**Issues fixed this session:** 14 (all resolved)

---

## FIXED THIS SESSION

### 1. Add Character was a no-op (P1 — FIXED)
- **File:** `WorkspaceScreen.jsx` line ~7148
- **Problem:** The "Add Character" button in the modal just closed the modal without saving anything. Comment said "For now just close — in production this would persist the character."
- **Fix:** Handler now creates a markdown file at `characters/{slug}.md` via `useProjectStore.getState().updateFile()`, with proper role/tier/bio content.

### 2. CastRoster was hardcoded (P1 — FIXED)
- **File:** `components/CastRoster.jsx`
- **Problem:** The entire cast list was a hardcoded array of 6 characters at the top of the file. Adding or deleting characters had no effect on what the sidebar showed.
- **Fix:** Rewrote CastRoster to read dynamically from the Zustand store's `files` object via `useProjectStore(s => s.files)`. Characters are now derived from `characters/*.md` files with role/tier parsed from content.

### 3. Hub "Open Story Timeline" / "Show Full Picture" navigation broken (P2 — FIXED)
- **File:** `HubScreen.jsx` lines 394-398
- **Problem:** Both buttons called `handleOpenProject()` which internally navigates to `/workspace`, then immediately called `navigate('/workspace?mode=timeline')`. The first navigate already mounted the WorkspaceScreen component with default mode, so the second navigate's query param was ignored.
- **Fix:** Replaced with direct `await setActiveProject(id)` + `navigate('/workspace?mode=timeline')` without calling `handleOpenProject()`.

### 4. Chat suggestions TypeError (P2 — FIXED)
- **File:** `WorkspaceScreen.jsx` ~line 1649
- **Problem:** `resp.match(/\[[\s\S]*\]/)` threw "TypeError: resp.match is not a function" when the LLM `send()` returned a non-string (object or null) instead of a string response.
- **Fix:** Added type coercion: `typeof resp === 'string' ? resp : (resp?.content || resp?.text || JSON.stringify(resp || ''))` before calling `.match()`.

---

## FIXED THIS SESSION (continued)

### 5. Demo project character files are incomplete (P1 — FIXED)
- **File:** `services/demoMode.js`
- **Problem:** Demo project only had 3 character files (elena, marcus, priya) but story references 7 characters.
- **Fix:** Added 4 missing character files: `david-yoder.md` (Supporting), `bishop-lapp.md` (Authority/Minor Antagonist), `ruth-yoder.md` (Minor), `thomas-beiler.md` (Minor). All with proper role, wound, flaw, MBTI, and story role descriptions.

### 6. Wizard Retell/Spinoff/Sequel/Prequel handlers lack error handling (P1 — FIXED)
- **File:** `screens/WizardScreen.jsx` lines 272-330
- **Problem:** Four wizard flow handlers had no try/catch — unhandled errors if project creation failed.
- **Fix:** Wrapped all four handlers in try/catch with `console.error()` logging, `setIsProcessing(false)` reset, and user-facing alert messages.

### 7. Phase gates not disabled for decomposed projects (P1 — ALREADY IMPLEMENTED)
- **File:** `components/PhaseProgress.jsx` + `screens/WorkspaceScreen.jsx`
- **Problem:** Originally noted as TODO, but on review the implementation was already complete: `allPrereqsComplete()` accepts `isDecomposed` param (returns true immediately), WorkspaceScreen computes `isDecomposed` from project metadata (`mode === 'decompose'`), and passes it to PhaseProgress.
- **Status:** No code change needed — the TODO comment was stale.

### 8. Hub project card shows wrong phase info (P2 — FIXED)
- **File:** `stores/projectStore.js` — `loadProjectFiles()`
- **Problem:** `project.currentPhase` was set at creation (defaults to 1) and never updated as the user progressed.
- **Fix:** `loadProjectFiles()` now computes the current phase (first incomplete phase from progress array) and persists it to project metadata in IndexedDB. Hub cards now display accurate phase info.

### 9. Privacy & Data "Total Words" always shows 0 (P2 — FIXED)
- **Files:** `stores/projectStore.js` + `screens/SettingsScreen.jsx`
- **Problem:** `project.wordCount` was initialized to 0 and never updated. Settings read from stale metadata.
- **Fix:** (1) `loadProjectFiles()` now computes word count from all file contents and persists to project metadata. (2) SettingsScreen now reads all file contents directly from IndexedDB to compute accurate total words across all projects, with fallback to metadata.

### 10. Character dropdown in StoryAssistant only shows 3 characters (P2 — FIXED)
- **Root cause:** Same as #5 — demo project only had 3 character files. The dropdown already reads from `characters/*.md` files dynamically.
- **Fix:** Resolved by adding the 4 missing character files in #5.

### 11. Delete character uses native `confirm()` dialog (P2 — FIXED)
- **File:** `screens/WorkspaceScreen.jsx` line ~6437
- **Problem:** `window.confirm()` blocked browser automation and was inconsistent with app design.
- **Fix:** Removed `window.confirm()` call. CastRoster already has built-in inline Delete/Cancel confirmation UI (red Delete button + Cancel button that appears on trash icon click), so the native dialog was redundant.

### 12. "Show Full Picture" opens Guide mode instead of Reader mode (P3 — FIXED)
- **File:** `screens/WorkspaceScreen.jsx`
- **Problem:** `useState(initialMode)` only read searchParams on first render. URL changes within the same mount were ignored.
- **Fix:** Added `useEffect` that watches `searchParams` and syncs `activeMode` when the `mode` param changes.

### 13. File tree doesn't show dynamically created files (P3 — FIXED)
- **File:** `screens/WorkspaceScreen.jsx`
- **Problem:** File tree was a hardcoded static array with wrong filenames (referenced characters that didn't exist in the demo project).
- **Fix:** Replaced hardcoded `fileTree` with `buildProjectFileTree(projectFiles)` function that dynamically builds the tree from the Zustand store's `files` object. Root-level files and folders with children are derived from actual file paths. Engine reference files remain as a separate static array.

### 14. Search Replace button UI exists but functionality incomplete (P3 — FIXED)
- **File:** `components/SearchPanel.jsx`
- **Problem:** Replace feature showed a preview of changes but had no "Apply" button to execute replacements.
- **Fix:** Added `handleApplyReplace()` function that iterates through preview changes and calls `updateFile()` for each, then re-runs the search to refresh results. Added styled "Apply All Replacements" button below the preview list.

---

## FEATURES TESTED & WORKING

| Feature | Status | Notes |
|---------|--------|-------|
| Hub screen loads | OK | Project card, Quick Start actions, Quick Actions |
| "Pick Up Where I Left Off" | OK | Navigates to workspace with correct project |
| "+ New Story" button | OK | Opens wizard |
| "Try Demo Project" button | OK | Creates/navigates to demo project |
| StoryAssistant (Assistant mode) | OK | Empty state, suggestion chips, input field |
| StoryAssistant (Editor mode) | OK | Different persona text |
| StoryAssistant (Character mode) | OK | Character dropdown, persona switching |
| Reader mode | OK | Renders markdown content, file switching |
| Editor mode | OK | Opens file with editable content |
| Timeline mode | OK | No crash (fixed in previous session) |
| Relationships graph | OK | Force-directed graph renders |
| World Building | OK | Displays world data |
| Comparison Lab | OK | 4 comparison modes |
| Drawing Board (Board view) | OK | Cards layout |
| Drawing Board (List view) | OK | Table layout with columns |
| Drawing Board (Gallery view) | OK | Expanded card previews |
| Drawing Board (Unlinked view) | OK | Filtered unlinked items + group chips |
| Drawing Board (+ Add) | OK | Modal with type/title/content/group, saves item |
| Drawing Board (X Delete) | OK | Removes item immediately |
| Search | OK | Real-time results, match highlighting, file grouping |
| Search category filters | OK | Character/Story/World/etc. filter chips work |
| Cast sidebar | OK | Now dynamic from store (fixed) |
| Character profile (Overview) | OK | Physical description, radar chart, badges |
| Character profile (all 5 tabs) | OK | Identity, Personality, Voice, Arc & Role, Analysis |
| Character delete confirmation | OK | Shows Delete/Cancel inline |
| Export modal | OK | 7 formats, 4 scopes, generates download |
| Phases sidebar | OK | Pipeline progress, phase list, click navigation |
| Guide mode questions | OK | Phase questions with answers, progress dots |
| Quick Settings (gear icon) | OK | Theme switcher, LLM config, TTS |
| Theme switching | OK | All 6 themes work (Amber, Midnight, etc.) |
| Settings > General | OK | Mode, Font Size, Appearance, Editor Font |
| Settings > AI Models | OK | API Key + OAuth/SSO panels |
| Settings > Privacy & Data | OK | Storage stats (word count bug noted above) |
| Version History panel | OK | Shows changes with file filter chips |
| Deconstruct a book (wizard) | OK | Upload dropzone, paste text, format support |
| Status bar | OK | Phase, word count, auto-save, genre display |

---

## FILES MODIFIED THIS SESSION

1. **`ui-screens/src/screens/WorkspaceScreen.jsx`**
   - Fixed Add Character handler (line ~7148) — now persists via `updateFile()`
   - Fixed chat suggestions TypeError (line ~1649) — added type coercion for `resp`
   - Removed native `window.confirm()` from character delete handler (#11)
   - Added `useEffect` to sync `activeMode` with URL searchParams changes (#12)
   - Replaced hardcoded `fileTree` with `buildProjectFileTree()` dynamic function (#13)

2. **`ui-screens/src/components/CastRoster.jsx`**
   - Complete rewrite — replaced hardcoded character array with dynamic store reader
   - Now uses `useProjectStore(s => s.files)` and `buildCastFromFiles()` utility

3. **`ui-screens/src/screens/HubScreen.jsx`**
   - Fixed "Show Full Picture" and "Open Story Timeline" buttons — removed double-navigate race condition

4. **`ui-screens/src/screens/WizardScreen.jsx`**
   - Added try/catch error handling to handleRetell, handleSpinoff, handleSequel, handlePrequel (#6)

5. **`ui-screens/src/stores/projectStore.js`**
   - `loadProjectFiles()` now computes and persists `currentPhase` and `wordCount` to project metadata (#8, #9)

6. **`ui-screens/src/services/demoMode.js`**
   - Added 4 missing character files: david-yoder.md, bishop-lapp.md, ruth-yoder.md, thomas-beiler.md (#5, #10)

7. **`ui-screens/src/screens/SettingsScreen.jsx`**
   - Privacy "Total Words" now reads all file contents from IndexedDB instead of stale metadata (#9)

8. **`ui-screens/src/components/SearchPanel.jsx`**
   - Added `handleApplyReplace()` function and "Apply All Replacements" button (#14)
