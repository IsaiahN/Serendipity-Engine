# Chrome Extension Port Audit

## Overview

The Serendipity-Engine codebase is a well-structured, modern React PWA. The core functionality (storage, LLM API calls, state management) is reusable as-is. The main work is adapting the UI shell, build pipeline, and manifest for the extension environment.

**Estimated reuse: ~85-90% of existing code carries over unchanged.**

---

## Architecture Summary

| Layer | Technology | Extension Compatible? |
|-------|-----------|----------------------|
| UI Framework | React 19 | Yes |
| Build Tool | Vite 8 | Needs extension config |
| State Management | Zustand 5 | Yes |
| Persistence | Dexie.js (IndexedDB) | Yes |
| Routing | React Router v7 (BrowserRouter) | Must switch to HashRouter |
| Editor | Tiptap | Yes |
| Icons | Lucide React | Yes |
| Exports | docx, jszip, file-saver | Yes |
| LLM Calls | Native fetch() | Yes |
| API Key Encryption | Web Crypto (AES-256-GCM) | Yes |

---

## What Needs to Change

### 1. Routing (REQUIRED)

**Problem:** React Router uses `BrowserRouter` which relies on the History API. Chrome extensions don't support HTML5 history navigation.

**Fix:** Switch `BrowserRouter` to `HashRouter` in `src/main.jsx`.

```jsx
// Before
import { BrowserRouter } from 'react-router-dom'
<BrowserRouter><App /></BrowserRouter>

// After
import { HashRouter } from 'react-router-dom'
<HashRouter><App /></HashRouter>
```

**Files affected:** `src/main.jsx`

---

### 2. Service Worker Removal (REQUIRED)

**Problem:** The PWA service worker (`sw.js`) and its registration logic are not compatible with the Chrome extension service worker model. They serve different purposes.

**Fix:** Remove or disable PWA service worker registration. The extension's background script (if needed) follows a completely different pattern.

**Files affected:**
- `src/lib/serviceWorker.js` -- Remove or gut the PWA-specific exports
- `src/App.jsx` -- Remove `registerServiceWorker()` call in useEffect
- `public/sw.js` -- Not bundled with extension

**Exports to remove/stub:**
- `registerServiceWorker()`
- `applyUpdate()`
- `canInstall()`, `isInstalled()`, `promptInstall()` (A2HS)
- `queueSync()`, `processPendingSync()` (background sync)
- `onSWEvent()` (update notifications)

**Exports to keep (still useful):**
- `isOnline()`, `onConnectivityChange()` (uses `navigator.onLine`)
- `getStorageEstimate()` (uses `navigator.storage.estimate()`)
- `requestPersistentStorage()` (uses `navigator.storage.persist()`)

---

### 3. PWA UI Overlays (REQUIRED)

**Problem:** Three components in `App.jsx` are PWA-specific and have no meaning in an extension.

**Fix:** Remove these components from the render tree:
- `OfflineIndicator` -- Could keep if you want offline awareness
- `UpdateNotification` -- No SW update cycle in extensions
- `InstallBanner` -- No A2HS in extensions

**Files affected:** `src/App.jsx`

---

### 4. Extension Manifest (REQUIRED)

**Problem:** PWA uses `manifest.json` for web app metadata. Chrome extensions need a completely different `manifest.json` (Manifest V3).

**Fix:** Create a new `manifest.json` for the extension:

```json
{
  "manifest_version": 3,
  "name": "Serendipity | StoryWeaver",
  "version": "1.0.0",
  "description": "An AI-powered creative writing workbench that guides authors through building complete works of fiction.",
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "https://api.anthropic.com/*",
    "https://api.openai.com/*",
    "https://api.deepseek.com/*",
    "https://generativelanguage.googleapis.com/*",
    "https://openrouter.ai/*",
    "http://localhost:11434/*"
  ],
  "action": {
    "default_popup": "index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-72.png",
      "128": "icons/icon-128.png"
    }
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.anthropic.com https://api.openai.com https://api.deepseek.com https://generativelanguage.googleapis.com https://openrouter.ai http://localhost:11434;"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-72.png",
    "128": "icons/icon-128.png"
  }
}
```

**Decision needed:** Popup vs. Side Panel vs. New Tab for the main UI. The workspace is too large for a popup (max ~600x800px). Recommend opening in a new tab via `chrome.tabs.create()` from a minimal popup.

---

### 5. Vite Build Config (REQUIRED)

**Problem:** Current Vite config outputs a standard web app. Extension needs specific output structure.

**Fix:** Add an extension build mode to `vite.config.js`:
- Output to `dist-extension/` instead of `dist/`
- Copy extension `manifest.json` to output
- Ensure no inline scripts (MV3 CSP forbids them)
- Set `build.rollupOptions.input` to include all entry points

Key config additions:
- `build.target: 'esnext'`
- `build.cssCodeSplit: false` (single CSS file simpler for CSP)
- Plugin to copy manifest.json and icons to dist

---

### 6. Asset Path References (REQUIRED)

**Problem:** Some assets use absolute paths (`/favicon.svg`, `/icons/icon-192.png`) which resolve against the domain root. In an extension, the root is `chrome-extension://<id>/`.

**Fix:** Two options:
- **Option A:** Change all `/path` references to relative `./path` (works if entry HTML is at root of extension)
- **Option B:** Use `chrome.runtime.getURL('path')` for dynamic resolution

Option A is simpler and works because Vite's `base: './'` config makes all built asset references relative.

**Files affected:** `vite.config.js` (add `base: './'`), `index.html` (change `/manifest.json` to `./manifest.json`, etc.)

---

## What Stays the Same (No Changes)

### Storage Layer
- `src/lib/db.js` -- Dexie/IndexedDB works identically in extensions
- All three schema versions and migrations carry over
- API key encryption (Web Crypto AES-256-GCM) works in extension context
- CryptoKey serialization via structured clone works

### LLM Integration
- `src/stores/llmStore.js` -- All fetch() calls to external APIs work
- Extensions are exempt from CORS, so API calls may actually be simpler
- Provider routing, streaming, retry logic all unchanged
- Token usage tracking unchanged

### State Management
- All three Zustand stores (settings, projects, LLM) work as-is
- Store hydration from IndexedDB unchanged

### UI Components
- All 36 components in `src/components/` carry over
- All 6 screens carry over
- Tiptap rich text editor works in extension context
- Command palette (Cmd+K) works

### Services
- `decomposition.js`, `chapterPipeline.js`, `contextBuilder.js` -- All business logic unchanged
- `exportEngine.js` -- docx/PDF/ZIP export works (file-saver downloads work in extensions)
- `healthScoring.js`, `fileAuditService.js` -- Pure logic, no web dependencies

### Hooks
- `useAutoSave`, `useUndoRedo` -- Pure React hooks
- `useTTS` -- Uses Web Speech API (available in extensions)
- `usePWA` -- Remove or stub (PWA-specific)

---

## UI Form Factor Decision

The workspace (WorkspaceScreen.jsx at 305KB) is a full-screen multi-panel layout. It won't fit in a popup.

**Recommended approach:**

1. **Popup** (400x500px) -- Minimal launcher with:
   - Quick access to recent projects
   - "Open StoryWeaver" button that opens a new tab
   - Status indicator (connected providers, active project)

2. **New Tab** -- Full application runs here
   - `chrome.tabs.create({ url: 'index.html' })`
   - Full workspace experience, identical to PWA
   - This is where all real work happens

3. **Side Panel** (optional, future) -- Lightweight assistant view
   - Could host just the Story Assistant chat
   - Useful while browsing for research

---

## Build & Distribution

### Build Script

```bash
# Add to package.json scripts
"build:extension": "vite build --config vite.config.extension.js"
```

### Chrome Web Store
- One-time $5 registration fee
- No ongoing hosting costs
- Updates via CWS dashboard upload
- Review typically 1-3 business days

### Manual Installation (Development)
1. `npm run build:extension`
2. Open `chrome://extensions`
3. Enable Developer Mode
4. "Load unpacked" -> select `dist-extension/`

---

## Migration Checklist

- [ ] Create `vite.config.extension.js` with `base: './'` and extension output
- [ ] Create extension `manifest.json` (Manifest V3)
- [ ] Switch `BrowserRouter` to `HashRouter` in `main.jsx`
- [ ] Remove/stub service worker registration in `App.jsx`
- [ ] Remove PWA overlays (UpdateNotification, InstallBanner)
- [ ] Stub `usePWA` hook or remove usage
- [ ] Update `index.html` to use relative paths
- [ ] Remove `<link rel="manifest">` from `index.html`
- [ ] Create minimal popup.html + popup.js (launcher)
- [ ] Add 16px icon (required for extension toolbar)
- [ ] Test IndexedDB persistence across extension restarts
- [ ] Test all LLM provider connections from extension context
- [ ] Test export/download functionality
- [ ] Test Tiptap editor in extension new-tab page
- [ ] Verify no `eval()` or inline scripts (MV3 CSP violation)
- [ ] Build and load unpacked for testing
- [ ] Package .zip for Chrome Web Store submission

---

## Estimated Effort

| Task | Time |
|------|------|
| Build config + manifest | 2-3 hours |
| Router + SW + PWA removal | 1-2 hours |
| Asset path fixes | 1 hour |
| Popup launcher | 2-3 hours |
| Testing & debugging | 4-6 hours |
| Chrome Web Store prep | 1-2 hours |
| **Total** | **~12-16 hours** |
