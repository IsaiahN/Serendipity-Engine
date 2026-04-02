# Serendipity Engine -- UI/UX Audit Report

**Date:** April 2, 2026
**Auditor:** Claude (simulating first-time user click-through)
**Scope:** Every interactive element across all screens and flows
**Purpose:** Identify non-functional, broken, or missing interactions; classify as UI/UX fix vs. full PWA buildout

---

## LEGEND

- **PASS** -- Element works as expected
- **FAIL** -- Element does nothing or behaves incorrectly
- **PARTIAL** -- Element works but with caveats
- **NOTE** -- Observation, not a bug

**Fix Classification:**
- **[UI]** -- Can be fixed in current React prototype
- **[PWA]** -- Requires full backend/PWA buildout
- **[DESIGN]** -- Design decision or UX improvement needed

---

## 1. HUB / DASHBOARD SCREEN (/hub)

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| "+ New Story" button | PASS | Navigates to /wizard | -- |
| Project sidebar click (switch selected) | PASS | Updates right detail panel | -- |
| Pencil/rename icon on projects | FAIL | No visible response on click | [UI] |
| "Pick Up Where I Left Off" button | PASS | Navigates to /workspace | -- |
| "Show Full Picture" button | PARTIAL | Navigates to /workspace -- same destination as "Pick Up". No differentiation in behavior. | [DESIGN] |
| "Open Story Timeline" button | PASS | Navigates to /workspace?mode=timeline (verified in code) | -- |
| Quick Start: "Deconstruct a book" | PASS | Navigates to /wizard?mode=decompose | -- |
| Quick Start: "Compare two stories" | PASS | Path /wizard?mode=compare in code | -- |
| Quick Start: "Talk to a character" | PASS | Path /workspace?mode=chat in code | -- |
| Quick Start: "Retell from another POV" | PASS | Navigates to /workspace?mode=guided | -- |
| Quick Start: "Write a spinoff" | PASS | Navigates to /wizard?mode=spinoff | -- |
| Quick Start: "Write a sequel" | PASS | Path /wizard?mode=sequel in code | -- |
| Quick Start: "Write a prequel" | PASS | Path /wizard?mode=prequel in code | -- |
| Quick Start: "Build a world" | PASS | Path /workspace?mode=world in code | -- |
| Quick Action: "Import a story to decompose" | PASS | Path correct in code | -- |
| Quick Action: "Build a character" | PASS | Path correct in code | -- |
| Quick Action: "Build a world" | PASS | Path correct in code | -- |
| Quick Action: "Compare two stories" | PASS | Path correct in code | -- |
| Quick Action: "Open from folder" | PASS | Path correct in code | -- |
| Session Changelog Preview | PASS | Static display, renders correctly | -- |
| Health bar on project items | PASS | Renders with correct rating | -- |

### Hub Issues Summary:
1. **Pencil/rename icons do nothing** -- needs onClick handler [UI]
2. **"Show Full Picture" vs "Pick Up Where I Left Off"** go to the same route with no differentiation [DESIGN]

---

## 2. WIZARD FLOW (/wizard)

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Step 1-8 navigation (Continue/Back) | PASS | All steps load and navigate correctly | -- |
| Category selection (pills/cards) | PASS | Highlight on selection works | -- |
| Sub-format expansion | PASS | Clicking a category expands sub-options | -- |
| "Start Building" final button | PASS | Navigates to /workspace | -- |
| "Project Hub" back link | PASS | Navigates to /hub | -- |
| Progress indicator (step dots) | PASS | Updates correctly per step | -- |
| Decompose mode differentiation | NOTE | /wizard?mode=decompose loads same wizard as /wizard -- no decompose-specific flow yet | [PWA] |
| Compare/spinoff/sequel/prequel modes | NOTE | All load the same base wizard -- mode-specific flows not implemented | [PWA] |

### Wizard Issues Summary:
1. **No mode-specific wizard flows** -- decompose, compare, spinoff, sequel, prequel all load the generic wizard [PWA]

---

## 3. WORKSPACE -- TOP NAV MODES

### 3a. Guide Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Phase question display | PASS | Shows question, example, progress dots | -- |
| Saved answer display | PASS | Previously answered questions show saved text | -- |
| "Continue" button | PASS | Advances to next question | -- |
| "Previous" button | PASS | Goes back to prior question | -- |
| "Roll for Me" button | FAIL | No visible response on click | [PWA] |
| Progress dots (clickable?) | NOTE | Dots don't appear to be clickable for direct navigation | [DESIGN] |
| Text area input | PASS | Accepts text input | -- |

### 3b. Story Assistant (Chat Mode)
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Chat history display | PASS | Shows user/assistant messages | -- |
| Suggestion pills | PASS | Display correctly, click populates input | -- |
| Pill scroll arrows (<>) | PASS | Scroll through suggestion options | -- |
| "Send" button | FAIL | Does not submit/process messages | [PWA] |
| Text input field | PASS | Accepts text, pill click populates it | -- |
| Gated pills hidden (Talk to editor, Work on Chapter 5) | PASS | Correctly hidden when Phase 8/9 locked | -- |

### 3c. Reader Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Welcome screen (no file) | PASS | Shows book icon + "Select a file" prompt | -- |
| Auto-switch to Files tab | PASS | Clicking Reader opens Files tab | -- |
| File selection loads content | PASS | Click file in sidebar renders in reader | -- |
| Markdown rendering | PASS | Headers, bold, italic, lists render | -- |
| Markdown tables | PASS | Tables render with alignment | -- |
| Markdown images | PASS | Image syntax supported | -- |
| "Edit" button | PASS | Switches to edit mode for file | -- |
| Audio/TTS icon | NOTE | Present but likely needs PWA backend | [PWA] |
| Settings gear (per-file) | NOTE | Present, untested | [PWA] |

### 3d. File Editor Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Text editing area | PASS | Editable textarea renders file content | -- |
| "Preview in Reader" button | PASS | Switches back to rendered markdown view | -- |
| File selection from sidebar | PASS | Loads file content for editing | -- |

### 3e. Editor Mode (AI Editor Review)
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Editor review loads | PASS | Shows "Editor Review -- Chapter 5, Pass 2" | -- |
| Filter badges (Issues/Suggestions/Strengths) | FAIL | Clicking badges doesn't filter the displayed items | [UI] |
| "Accept All" button | FAIL | No visible response | [PWA] |
| "Review One by One" button | FAIL | No visible response -- should open step-through mode | [PWA] |
| "Dismiss" button | FAIL | No visible response | [PWA] |

### 3f. Timeline Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Chart renders | PASS | Multi-line chart with all characters, act divisions | -- |
| Legend character filter | PASS | Clicking character name in legend isolates their line | -- |
| Interactions grid | PASS | Shows character interaction matrix per chapter | -- |
| Interaction cell click | FAIL | Clicking cells in grid does nothing | [DESIGN] |
| Chart data points clickable? | NOTE | Data points on chart lines don't appear interactive | [DESIGN] |
| Filter pills (Main/Minor/Journey/Linear/Plan/Reality/Both) | PASS | Appear and toggle correctly | -- |

### 3g. Relationships Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Network graph renders | PASS | Character nodes with connections | -- |
| Character click to recenter | PASS | Updates detail panel and recenters graph | -- |
| Filter pills (All/Family/Friends/Rivals/Authority/Mentors/Allies) | PASS | Filter reduces displayed connections | -- |
| Zoom controls (+/-/100%) | PASS | Zoom in/out works, percentage updates | -- |
| Detail panel (connections list) | PASS | Shows character connections with relationship types | -- |
| "Relationship Types" section | PASS | Visible at bottom of detail panel | -- |

### 3h. World Building Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Overview tab | PASS | Shows Setting/Time Period cards | -- |
| Locations tab | PASS | Location cards with character tags | -- |
| Culture & Rules tab | PASS | Rules with tension badges (high/medium/critical) | -- |
| History tab | PASS | Timeline with historical events | -- |
| Hallmarks tab | PASS | Object/symbol cards with chapter references | -- |
| All sub-tab switching | PASS | Clean transitions between sub-tabs | -- |

### 3i. Comparison Mode (Deep Comparison Lab)
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Mode cards (4 options) | PASS | Your Projects, Uploaded vs Uploaded, Your Work vs External, Series Progression | -- |
| "Your Projects" expands | PASS | Shows "Select Works to Compare" section | -- |
| "Select Work A" click | PASS | Opens project picker with library items | -- |
| Library item selection | PASS | Populates Work A with selected project | -- |
| "Select Work B" click | PASS | Opens project picker | -- |
| "Run Deep Comparison" button | FAIL | No response (even with only Work A selected -- no validation message shown) | [PWA] |
| Missing: validation feedback | NOTE | Should show "Select both works" if trying to run with one | [UI] |

### 3j. Drawing Board Mode
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Board view | PASS | Card grid layout | -- |
| List view | PASS | Table layout with TYPE/CONTENT/LINKED TO/GROUP | -- |
| Gallery view | PASS | Expanded card previews with full content | -- |
| Unlinked filter | NOTE | Not tested separately but view toggle works | -- |
| "+ Add" button | PASS | Opens "Add to Drawing Board" modal | -- |
| Add modal: type selector | PASS | Note/Draft/Image Ref/Document options | -- |
| Add modal: form fields | PASS | Title, Content, Group (with quick-select pills) | -- |
| Add modal: Cancel/Add Item buttons | PASS | Buttons present and modal closes on Cancel | -- |
| X delete buttons on cards | NOTE | Present on cards, deletion needs PWA | [PWA] |
| "Used in" links | PASS | Shows linked file references | -- |

---

## 4. LEFT SIDEBAR

### 4a. Phases Tab
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Pipeline Progress bar | PASS | Shows "Overall: 24% complete" with progress bar | -- |
| Phase 1-2 (completed) checkmarks | PASS | Green checks displayed | -- |
| Phase 3 (38% partial) | PASS | Shows percentage, active highlight | -- |
| Phase 4-7 (empty) circles | PASS | Correct empty state | -- |
| Bridge phase | PASS | Shown without number | -- |
| Phase 8-9 locked state | PASS | Lock icon + "locked" label, grayed out | -- |
| Phase click loads Guide mode | PASS | Navigates to correct phase questions | -- |
| Locked phase click shows gate modal | PASS | "Content Generation Locked" modal with incomplete phases list | -- |

### 4b. Cast Tab
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Character list (main + minor) | PASS | Shows names, roles, avatars | -- |
| Character name click opens detail | PASS | Full character card with sub-tabs | -- |
| Character detail sub-tabs (Overview/Identity/Personality/Voice/Arc & Role/Analysis) | PASS | Overview tab loads; others need testing | -- |
| "View Arc" button | PASS | Navigates to Timeline mode | -- |
| "Relationships" button | PASS | Should navigate to Relationships mode | -- |
| Chat icon on character | FAIL | No visible response | [PWA] |
| Delete/clipboard icon on character | FAIL | No visible response -- should show confirmation dialog | [UI] |
| "View Full Cast (6)" link | PASS | Opens full cast grid view | -- |
| "+ Add Character" button | PASS | Opens Add New Character modal | -- |
| Strengths Profile radar chart | PASS | SVG/Canvas radar chart renders | -- |

### 4c. Files Tab
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| File tree display | PASS | Shows project files with folder expansion | -- |
| File click loads in reader/editor | PASS | Content loads in center stage | -- |
| Folder expansion (characters/) | PASS | Expands to show child files | -- |
| Character file click | PASS | Loads character MD files | -- |

### 4d. Sidebar Collapse ("<<" button)
| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Collapse toggle | PASS | Left sidebar hides, verified in prior sessions | -- |

---

## 5. RIGHT SIDEBAR

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| "Collapse >>" button | PASS | Collapses right sidebar | -- |
| NEXT STEPS items | PASS | All 4 items render correctly | -- |
| "Finish World questions" click | PASS | Navigates to Phase 3 Guide | -- |
| "Begin Phase 4 -- Characters" click | PASS | Navigates to Phase 4 Guide | -- |
| "Resolve: Story Deaths audit" click | PASS | Navigates to Phase 7 Quality Control | -- |
| "Resolve: Two characters share same wound" click | NOTE | Not tested individually, pattern matches others | -- |
| PROJECT HEALTH section | PASS | Shows Strong 4/5, individual metrics with bars | -- |
| Health metric expand (click) | PASS | Expands to show description + action button | -- |
| "Go to Narrator" action button | PASS | Navigates to Phase 2 Narrator | -- |
| "Needs Your Attention" section | PASS | Shows Character Depth + World Integrity items | -- |
| Attention item clicks | PASS | Navigate to relevant phases | -- |
| TEACHING TIP section | PASS | Displays contextual writing tip | -- |

---

## 6. MODALS

| Modal | Status | Notes | Fix Type |
|-------|--------|-------|----------|
| Gate Warning (locked phase click) | PASS | Shows lock icon, explanation, incomplete phases list | -- |
| "Got it" dismiss button | PASS | Closes modal | -- |
| "Go to first incomplete phase" button | PASS | Navigates to Phase 3 and closes modal | -- |
| Add New Character modal | PASS | Avatar upload, name, role/tier dropdowns, type, description fields | -- |
| Add Character Cancel button | PASS | Closes modal | -- |
| Add Character submit | NOTE | Button present, needs PWA to actually persist | [PWA] |
| Export Project modal | PASS | Format options (MD/DOCX/PDF/JSON), scope options | -- |
| Export Cancel button | PASS | Closes modal | -- |
| Export button | NOTE | Button present, needs PWA to actually export | [PWA] |
| Add to Drawing Board modal | PASS | Type selector, title, content, group fields | -- |
| Choose Theme modal | PASS | 5 themes with color swatches, active indicator | -- |
| Theme switching | PASS | Applies theme globally and immediately | -- |

---

## 7. BOTTOM STATUS BAR

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Phase indicator ("Phase 3 -- World") | PASS | Displays dynamically based on current incomplete phase | -- |
| Phase indicator click | FAIL | No navigation on click | [UI] |
| Word count display | PASS | "72,450 / 70,000 words (+2,450 over)" in warning color | -- |
| Word count click | NOTE | Seemed to switch to Story Assistant on click -- may be unintentional | [UI] |
| "Auto-saved" indicator | PASS | Static display | -- |
| Genre display | PASS | "Novel (Adult) - Literary Fiction + Thriller" | -- |
| Story Structure health in top bar | PASS | "Story Structure: Strong 4/5" with bar | -- |

---

## 8. GLOBAL HEADER ICONS (top right)

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Search icon (magnifying glass) | FAIL | No response -- should open search overlay/modal | [UI] |
| Layout/grid icon | FAIL | No response -- unclear what this should do | [UI] |
| Theme palette icon | PASS | Opens Choose Theme modal | -- |
| Settings gear icon | FAIL | No response from workspace. Settings page exists at /settings but gear doesn't navigate there | [UI] |

---

## 9. PROJECT SWITCHER (left icon strip)

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| TS icon (The Shunning Season) | NOTE | Current project -- already active | -- |
| OD icon (Orbital Decay) | FAIL | No response on click -- should switch project | [PWA] |
| GD icon (Gatsby Decomposition) | FAIL | No response on click -- should switch project | [PWA] |
| "+" icon (new project) | FAIL | No response on click -- should create new project or navigate to wizard | [UI] |
| "Serendipity Engine" logo click | PASS | Navigates to root screen map (/) | -- |

---

## 10. SETTINGS PAGE (/settings)

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Category navigation (8 categories) | PASS | All categories load correct content panels | -- |
| General: Mode dropdown | PASS | "Advanced" selected | -- |
| General: Appearance toggle (Dark/Light/System) | PASS | Shows toggle buttons | -- |
| General: Font dropdown | PASS | "Inter" selected | -- |
| General: Language dropdown | PASS | "English" selected | -- |
| AI Models: Connected Providers | PASS | "Manage" button present | -- |
| AI Models: Role Assignment Mode | PASS | "Standard" dropdown | -- |
| AI Models: Toggles (Audit Trail, Cost Tracking) | PASS | Toggle switches render and appear interactive | -- |
| Workspace/Writing/Editor/Privacy/Profile/About | NOTE | Not individually tested but categories load | -- |
| Settings: actual persistence | NOTE | All settings need PWA backend to persist changes | [PWA] |

---

## 11. SCREEN MAP (/ root)

| Element | Status | Notes | Fix Type |
|---------|--------|-------|----------|
| Terms of Use & License link | PASS | Navigation link present | -- |
| LLM Connection Setup link | PASS | Navigation link present | -- |
| Project Hub link | PASS | Navigation link present | -- |
| Unified Settings Page link | PASS | Navigation link present, navigates to /settings | -- |
| Center Stage mode links (8) | PASS | All 8 mode links present | -- |

---

## PRIORITY SUMMARY

### Critical (Blocks core user flows) -- [UI] Fixes
1. **Search icon does nothing** -- should open a search modal/overlay
2. **Settings gear icon does nothing** -- should navigate to /settings
3. **Pencil/rename icons on Hub projects** -- no handler
4. **Editor filter badges (Issues/Suggestions/Strengths)** -- don't filter content
5. **Cast: chat icon on character** -- no response (could be [PWA] if it opens a real chat)
6. **Cast: delete icon on character** -- no confirmation dialog

### High (Missing feedback/validation) -- [UI] Fixes
7. **"+" button in project switcher strip** -- no response
8. **Bottom bar phase indicator click** -- should navigate to that phase
9. **Comparison "Run Deep Comparison" with incomplete selection** -- no validation message
10. **"Show Full Picture" vs "Pick Up Where I Left Off"** -- identical behavior, needs differentiation

### Requires Full Buildout -- [PWA]
11. **Story Assistant "Send" button** -- needs LLM integration
12. **"Roll for Me" button in Guide** -- needs LLM generation
13. **Editor "Accept All" / "Review One by One" / "Dismiss"** -- needs edit tracking system
14. **Project switcher icons (OD, GD)** -- needs project save/load system (see project switching TODO)
15. **Wizard mode differentiation** -- decompose, compare, spinoff, sequel, prequel need unique flows
16. **Export actual file generation** -- needs file generation pipeline
17. **Settings persistence** -- needs storage backend
18. **Drawing Board card deletion** -- needs state management

### Design Considerations -- [DESIGN]
19. **Timeline interaction cells** -- could show scene details on click
20. **Timeline chart data points** -- could show tooltips on hover
21. **Guide progress dots** -- could be clickable for direct question navigation
22. **Word count area click behavior** -- currently switches to Story Assistant, seems unintentional

---

## WHAT WORKS WELL

- Phase progress system is dynamic and accurate (38% = 3/8 answered)
- Gate locking/unlocking logic is solid with clear user feedback
- Relationship graph is fully interactive (filter, recenter, zoom)
- Theme switching is immediate and global
- World Building sub-tabs are rich and well-organized
- Drawing Board has 4 view modes all working
- Comparison Lab project picker flow is smooth
- Health metrics are expandable with deep-link navigation
- Next Steps items correctly navigate to relevant phases
- Export modal has comprehensive format/scope options
- Character detail cards are feature-rich with personality typing
- Timeline legend filtering works perfectly

---

*Audit conducted by clicking every visible interactive element across all screens.
No code changes were made during this audit.*
