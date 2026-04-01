# Serendipity Engine PWA — User Paths & Holes

*Three complete walkthroughs of the app from first click to finished output, plus every hole found in the current design.*

---

## Holes Found (Across All Paths) — Status Tracker

All 13 holes originally identified have been resolved. Each fix has been added to `pwa-ui-experience.md`. Below is the resolution log.

### Critical Holes — ALL RESOLVED

**HOLE 1: No Conversation / Chat Interface** — ✅ RESOLVED
Added "Chat / Conversation Interface" section to UI doc. Chat is Mode 6 in Center Stage, launchable from bottom bar, right-click context menu, chapter review, editor reports, or decomposition results. Supports four context scopes (full project, this file, this phase, freeform). Chat history is saved per-project and visible in Thread List.

**HOLE 2: No Decomposition Workflow Spelled Out** — ✅ RESOLVED
Added "Decomposition Workflow UI" section to UI doc. Full 5-step flow: Input (upload/paste) → Identification (what is it, who wrote it, what do you want to learn) → Processing (live progress indicator) → Results Dashboard (organized by architecture files, with CONFIRMED/INFERRED tags and evidence) → What Now (save as reference, use as foundation, compare, discuss, export).

**HOLE 3: No "What-If" / Sandbox Mode** — ✅ RESOLVED
Added "Sandbox / Fork Mode" section to UI doc. Two levels: (1) Per-file what-if — right-click any file to create a what-if copy, edit freely, compare side-by-side, promote or discard. (2) Full project fork — complete project copy, appears in Thread List linked to parent, can compare and selectively merge changes back. Sandbox mode indicator banner prevents confusion.

**HOLE 4: No Re-Entry Path for Returning Users** — ✅ RESOLVED
Added "Re-Entry Experience" under Screen 1 (Project Hub). When returning to an in-progress project, a "Welcome Back" card shows: where they left off, what's changed, current state summary, "Pick up where I left off" button, and "Show me the full picture" button. Dismissible for power users. Also: the Thread List is now persistent across the entire workspace (like Claude Desktop), so switching between projects is always one click.

---

### Significant Holes — ALL RESOLVED

**HOLE 5: Author vs. Editor Conflict Resolution** — ✅ RESOLVED
Added "Conflict Resolution" section under Phase 9. The user is always the tiebreaker (like a merge conflict). Both positions are presented side by side; user picks Accept Editor, Keep Author, or Write Own. In YOLO/Auto-Approve mode, the Author always wins automatically, and the user is notified of overrides. All disagreements logged in the Editor's issue tracker.

**HOLE 6: No Progress Persistence Model** — ✅ RESOLVED
Enhanced "Section 1: Progress Tracker" in the right sidebar. Now includes: overall pipeline progress with per-phase percentages, current phase sub-step detail with status icons and estimated time, a dynamic "Next Steps" queue showing the next 3-5 actions, and completion milestone celebrations at 25/50/75/100%.

**HOLE 7: Error and Failure States** — ✅ RESOLVED
Added "Error and Failure States" section to UI doc. Covers: LLM call failures (clear messages + retry/retry-with-less-context/save/switch-to-manual options), offline behavior (persistent banner, local editing continues, AI features queued), validation errors (inline messages, not modals), and auto-save with crash recovery (30-second auto-save, session recovery prompt).

**HOLE 8: Chapter Generation — Sequential Only** — ✅ RESOLVED
Added "Chapter Generation Rules" section under Phase 9. Chapters are generated one at a time, sequentially — no batch generation. Each chapter builds on all prior chapters plus full architecture. Two editor timing modes: post-completion (default, editor reviews after full story drafted) and chapter-by-chapter (user's choice, editor reviews each chapter before next one begins). Users can switch between modes or mix them.

**HOLE 9: Version History / Storage** — ✅ RESOLVED
Added "Storage Model and Data Persistence" section to UI doc. No server-side database. All data stored locally (IndexedDB / File System Access API). Projects are plain markdown folders. Portability via download-as-zip / upload-a-project. Version history: session-level undo/redo + sandbox/fork system for the hosted web app; automatic Git commits at milestones for self-hosted installations with Git available. Gentle backup reminders built in.

---

### Minor Holes — ALL RESOLVED

**HOLE 10: Keyboard Shortcuts** — ✅ RESOLVED
Added "Keyboard Shortcuts" section to UI doc. Full shortcut set including: global shortcuts (new/open/save/command palette/quick-switch), workspace shortcuts (jump to phase, toggle modes, toggle panels), editor shortcuts (approve, diff view, navigate issues). Command palette (`Ctrl/Cmd + K`) provides searchable access to any action. Shortcut overlay via `Ctrl/Cmd + /`.

**HOLE 11: Print / Export Formatting** — ✅ RESOLVED
Added "Print and Export Formatting" section to UI doc. Six export formats: .docx (manuscript standard), .pdf (typeset), .epub (e-book), .fountain (screenplay), .md (raw), .zip (full project). Formatting dialog with title page, header/footer, font, spacing, include/exclude options. Standard manuscript format (Courier 12pt, double-spaced) available for publisher submissions. Print preview mode included.

**HOLE 12: Returning User Onboarding** — ✅ RESOLVED
Added "Returning User Onboarding" section to UI doc. "What's New" modal after significant updates (2-3 bullet points, "Show me" links, dismissible). Feature discovery hints: "New" badges on new UI elements, one-time tooltips on hover. Full changelog accessible from settings menu.

**HOLE 13: Accessibility for Scoring Visualizations** — ✅ RESOLVED
Added "Accessibility for Scoring Visualizations" section to UI doc. Screen reader support: text-only table alternative for radar chart, ARIA live regions for score changes, descriptive alt text for health badges. Color-blind safe: dual-encoding (color + pattern/icon), tested against protanopia/deuteranopia/tritanopia. Every visualization has a plain-text equivalent.

---

### Previously Identified Holes (from earlier analysis)

**AI Model Selection / LLM Connection** — ✅ RESOLVED
Added "Screen 0: First-Time Setup — LLM Connection" to UI doc. Two connection methods: API key (direct entry + test connection) or SSO/OAuth. Supports multiple providers (Anthropic, OpenAI, Google, local/self-hosted). Multi-model configuration allows different models for Author, Editor, Chat, and Decomposition roles. No key = app works as a file editor but all AI features disabled.

**Collaboration / Multi-User Support** — Deferred to future state. Single-user is fine for v1. Users can share feedback via the Feedback File System (upload external feedback from beta readers, writing groups, etc.).

**Version History** — Deferred. Persistent cross-session version history requires Git or similar infrastructure that non-technical users can't reasonably set up. Pinned for future when/if the project scales. For v1: undo/redo within sessions + sandbox/fork for what-if exploration + manual download checkpoints.

**Notification System** — Deferred. PWA push notifications for Editor completion, etc. Roadmap item.

**Writing Habit System (Hooked Loop)** — Deferred. Opt-in retention system based on Nir Eyal's Hooked model (trigger → action → variable reward → investment). Fully designed in `pwa-ui-experience.md` but not part of v1.

**Mobile / Tablet Responsive Design** — Deferred. Rough direction in the UI doc but detailed responsive design happens during UI implementation.

**Unified Settings Page** — Designed in `pwa-settings-wireframe.md`. Consolidates all scattered settings references into one page with 8 categories.

**The Drawing Board** — Freeform workspace (Center Stage Mode 8) for unstructured ideas: notes, photos, rough drafts, research. Items track "Used In" connections to architecture files. Available throughout all three user paths as a place to dump ideas before they're ready for the guided flow.

**Session Changelog** — Automatic capture of what changed per session. Shown in the Welcome Back card when the user returns: what they did, health rating delta, files modified, what still needs attention. Especially useful for Path 1 and Path 2 users who may take breaks between sessions.

**Submission Target** — Optional wizard question during Step 1 (after medium selection): Publisher/Agent, Self-Publishing, Contest/Workshop, Studio/Production, or Personal. Calibrates the Author LLM and export formatting from the start. Relevant to all three paths.

**External Feedback → Health Mapping** — When external feedback is uploaded (beta readers, agents, writing groups), the system can map notes to Project Health dimensions and surface them alongside the system's own assessment.

### Holes Found During Codebase Audit — ALL RESOLVED

**Bridge Screen (Phase 7→8 Transition)** — ✅ RESOLVED
Added "The Bridge" section to UI doc. Full-screen, visually distinct pause between architecture and prose. Five threshold questions presented one at a time, no sidebar/health rating/checklist. Calmer color palette signals different kind of work.

**Reverse Scaffolding (Upload Rough Draft)** — ✅ RESOLVED
Added "Reverse Scaffolding" section to UI doc. 5-step flow: Upload chapters → LLM reverse-decomposes into architecture files (all tagged [INFERRED]) → User reviews and corrects → System identifies gaps → Health assessment + choose path (fill gaps, go to Editor, or both).

**Comparison Workflow** — ✅ RESOLVED
Added "Comparison Workflow" section to UI doc. Split-panel view comparing two decomposed stories across all engine phases (Author, Narrator, World, Cast, Relationships, Arc, Seven Deaths, Score). Delta column shows same/different. Generates insight summaries.

**Analysis/Teaching Standalone Mode** — ✅ RESOLVED
Added "Analysis Mode — Teaching Without Building" section to UI doc. 8-stop Structural Tour (Author's Wound → Narrator's Lens → World → Characters → Relationships → Seven Deaths → Arc/Theme → Open Questions). Read-only teaching experience, no progress tracker. Can switch to Workshop Mode at any point.

**Character Visualization (Spider Charts + Arc Trajectories)** — ✅ RESOLVED
Added "Character Visualization System" section. 8-axis radar chart (Stream A/B, Self-Awareness, Emotional Expression, Wound Integration, Theory-Gating, Good/Evil, Vulnerability, Order/Chaos). Arc overlay shows start vs. end state. Cast overview grid, compare mode, SWOT breakdown, network archetype badges.

**Cascading Attribute Roll UI** — ✅ RESOLVED
Added "Cascading Attribute Roll System" section. 14-step roll sequence with per-roll cards showing seed math, cascade dependencies, and downstream effects. Anti-regression rule enforced (no re-rolls). Cascade diagram after all rolls complete. Weighted roll visualization for uncommon tiers.

**Tonal Arc Designer** — ✅ RESOLVED
Added "Tonal Arc Designer" section. Visual timeline editor with 5 draggable tone markers (14 tone types). Deliberate departure markers between fixed points. Three-tone parallel tracks (Author/Narrator/Character).

**Subproblem Stack Tracker** — ✅ RESOLVED
Added "Subproblem Stack Tracker" section. 6-thread horizontal multi-lane dashboard (Emotional, Thematic, Plot, Wound, Relationship, World). Per-chapter state indicators (Dormant/Active/Critical/Resolved). Convergent climax check.

**Scene Metadata Editor** — ✅ RESOLVED
Added "Scene Metadata Editor" section. Per-scene fields: Location (hierarchical), Interior/Exterior, Time of Day, Weather/Light, Season, Setting Function (5 types), Dominant Tone, Active Threads. Collapsible panel above chapter editor.

**Full Codebase Coverage** — ✅ VERIFIED
Added "Coverage Audit" section confirming all MetaFiles, Characters, Story, Relationships, and World Building content is covered — either explicitly through bespoke UI components or implicitly through the guided flow's question cards.

---

## Path 1: "Help Me Finish My Story"

*The user has a story in progress — some chapters written, some characters sketched, maybe an outline. They need help filling the gaps, strengthening what exists, and completing the draft.*

### What They Click

**Home Screen** → New Project

### Wizard Flow

**Step 1:** "Novel / Book"
**Step 2:** "Thriller & Suspense" (primary) + "Literary & Contemporary Fiction" (blend)
**Step 3:** "No — this is completely original"
**Step 4:** "Yes — I have some material" → Uploads:
- 4 rough chapters (.docx files)
- A character notes document (informal, no engine format)
- A one-page outline

**Step 5:** "Rough draft exists — I have chapters written but they need work"
**Step 6:** "Guide me through everything"
**Step 7:** "I am the author" → Launches interactive author interview

### What Happens Next

**1. Material Intake (Reverse Scaffolding)**

The system reads everything uploaded. The Center Stage shows a processing screen:

> "Reading your material..."
>
> Then:
>
> "Here's what I found in your uploads:
>
> **Chapters:** 4 chapters (~18,000 words). I identified 6 named characters across them.
>
> **Characters from your notes:** 3 characters described (protagonist: Elena, antagonist: Viktor, mentor: Dr. Okafor). Missing: wound, voice fingerprint, MBTI, Enneagram, moral alignment, Stream A/B conflict, network archetype.
>
> **Outline:** 12 chapters planned. 4 written, 8 remaining. No scene metadata, no tonal arc, no subplot tracking.
>
> **What's missing from your architecture:**
> - Author profile (we'll build this now)
> - Narrator type and reliability
> - World-building (genre defined but no society-as-character, no hallmarks, no Seven Deaths audit)
> - 3 characters mentioned in chapters but not in your notes
> - Relationship graph (none exists)
> - Story arc and tonal arc
> - Theme question
>
> I'll use what you gave me as the foundation and help you fill in every gap."

The system creates the project folder and pre-populates files with [INFERRED] attributes from the uploaded material.

**2. Interactive Author Interview**

Since they chose "I am the author," the guided flow launches the author-profile-template interview. One question at a time, Typeform-style:

- "What's your age?" → Answer
- "What's your gender identity?" → Answer
- "What's your relationship to faith — past or present?" → Answer
- ...through all identity, personality, development, voice, and writing identity fields
- The LLM pushes back on vague answers: "You said your life philosophy is 'pragmatic.' Can you be more specific? When you're faced with a situation where doing the right thing costs you personally, what do you actually do?"
- **Big Picture Statement** comes last: "What does this author need to say that they have never been able to say directly?"

Output: `author.md` complete. Health updates: Author Depth moves from Just Started to Strong.

**3. Narrator Setup**

"Based on your chapters, your narrator appears to be third-person limited, anchored to Elena, reliable, past tense. Does that match your intent?"

User confirms or adjusts. Output: `narrator.md`. Health updates.

**4. Gap-Filling: Characters**

The system presents each character it found — both from the notes and from the chapters. For each one:

- "Here's what I inferred about Elena from your prose. She seems to be [INFERRED: INTJ, wound of betrayal, flaw of emotional isolation, virtue of strategic thinking]. Does this feel right?"
- User confirms, adjusts, or lets the system re-roll specific attributes
- For attributes that can't be inferred (Enneagram wing, zodiac, self-care mechanisms), the guided flow walks through the questions
- Voice fingerprinting is done from actual dialogue in the chapters — the system quotes lines and matches them to voice attributes

For the 3 characters mentioned in chapters but not in notes, the system asks: "I found Thomas, Lucia, and 'the Sergeant' in your chapters. Are they major characters who need full profiles, minor characters, or extras?"

Output: Character files for all named characters. Cast collision check runs automatically. Health updates. The **Cast Roster** (Left Nav) now shows all characters with gradient avatars derived from their psychological axes. The user uploads a reference photo for Elena — it replaces the gradient fill, with the teal-and-rose gradient becoming a border ring around the image.

For each character, the system also generates an **Emotional Palette** (Home/Stretch/Blocked tiers) and a **Somatic Signature** (emotion-to-body mappings) inferred from the uploaded prose. The user reviews and adjusts these.

**5. Gap-Filling: World, Relationships, Arc**

Same pattern for each missing phase:

- **World:** "Your story seems to be set in [contemporary Eastern European city]. Let me ask you some questions about how this world works..." → walks through world-building questions, society-as-character, hallmarks. The user pins mood board images to key hallmarks (a photo of a fog-covered bridge for "The Crossing," a sketch of the council building).
- **Relationships:** "Based on your chapters, here's what I see between Elena and Viktor..." → presents inferred relationship dynamics (including **Relationship Emotional Dynamics** — dominant emotions when together, physical tells, conflict triggers), asks user to confirm or adjust, builds the graph
- **Arc:** "Your outline has 12 chapters. Let me help you map the tonal arc and subplot threads..." → walks through arc design, ending-first, subproblem stack

**6. Phase 7 Review**

Once all architecture files exist, the system runs the full diagnostic. The health rating jumps from wherever it was to its true structural score. The user sees exactly what's strong and what needs attention.

**7. Bridge**

The five threshold questions, presented on a calm, spacious screen. "What is the first thing that happens when we return to Chapter 5?"

**8. Drafting the Remaining Chapters**

The system now has everything it needs. The **Story Timeline** (Center Stage Mode 7) shows the full story at a glance — story beats, character arc lanes for Elena and Viktor, their relationship dynamic lane, tonal arc, and subproblem threads. Chapters 1-4 show "reality" data (from uploaded prose); chapters 5-12 show "plan" data (from the outline). The user can see where the story is going.

For each of the 8 remaining chapters:

- **Scene Dynamics Forecast** runs first — analyzing Elena and Viktor's current emotional states, relationship tension, and active subproblem threads to predict probable collisions and arc opportunities for this chapter
- Pre-flight loads the architecture files
- User chooses: "Write it myself" or "Generate a draft for me to review"
- If generated: Author LLM writes with full context (author.md, narrator.md, all character files, relationship graph, arc, outline, audience, emotional palettes, somatic signatures)
- **Active Deconstruction** runs in the background — flagging grammar, voice consistency, structure, thematic incongruence, and character behavioral issues as non-blocking annotations
- **Reader Experience Report** generates after the chapter is complete — pacing shape, read time, emotional trajectory, dialogue ratio
- User reviews, provides feedback, approves
- Editor LLM runs QA (now informed by the character's Emotional Palette constraints and Somatic Signature consistency)
- Post-flight updates all tracking files; **Story Timeline** updates the chapter's column from "plan" to "reality"

**9. Editor Review of Existing Chapters**

The 4 uploaded chapters also go through the Editor — but now the Editor has the full architecture to check them against. It catches inconsistencies between the uploaded chapters and the newly built character files, flags voice drift, and suggests deepening.

**10. Final Assembly**

All 12 chapters approved. Full manuscript health assessment displayed. Export to .docx, .pdf, or .epub.

### Where This Path Has Holes (Now Fixed Above)

- Reverse Scaffolding wasn't described → HOLE 5
- Re-entry experience wasn't described → HOLE 4
- Bridge screen wasn't in the UI → HOLE 9
- No chat to ask "Why does Chapter 5 feel flat?" → HOLE 1

---

## Path 2: "Generate Everything For Me"

*The user wants the system to build a complete story from scratch using the randomization engine. They'll review and approve, but they want the AI to do the heavy lifting.*

### What They Click

**Home Screen** → New Project

### Wizard Flow

**Step 1:** "Screenplay (Film)"
**Step 2:** "Science Fiction" (primary) + "Thriller & Suspense" (blend) + "Romance" (texture)
**Step 3:** "No — this is completely original"
**Step 4:** "No — starting from scratch"
**Step 5:** "Just an idea — I know what I want to write about but haven't started"
**Step 6:** "Generate for me — Build the full architecture using the randomization engine, then present it for my review and approval"
**Step 7:** "Generate a random author"

### What Happens Next

**1. Seed Generation**

The system generates the datetime seed automatically. Displayed briefly:

> "Your story seed: 202603311422. Every roll in this story derives from this number. Same seed = same story."

The user can re-seed if they want a different starting point. Seed is recorded in `author.md`.

**2. Phase 1 — Author Generation (Automatic)**

The system rolls every attribute in sequence — no user input required. Each roll is presented as an animated card that flips to reveal the result:

> **Age Range:** 40s
> **Gender:** Cis woman
> **Religion:** Lapsed Catholic
> **Sexuality:** Bisexual
> **Life Philosophy:** Existentialist
> **Emotional Register:** Wry
> **MBTI:** ENTP-T
> **Enneagram:** 4w5 (The Bohemian)
> **Alignment:** Chaotic Good
> ...

Each card shows the result plus a one-line explanation of what it means for the story. The user can:
- **Keep it** (recommended — the strangeness is the system working)
- **Re-roll** (with a gentle warning: "The engine's best results come from keeping strange combinations. Are you sure?")

After all rolls, the system synthesizes the author's psychology into a coherent profile and presents the Big Picture Statement:

> "This author is a 40-something bisexual existentialist with a wound of public humiliation. She writes to prove that the thing that destroyed her was the thing that set her free. Her blind spot: she'll protect characters who share her wound and punish characters who remind her of the people who humiliated her."

User approves. Output: `author.md`. Health: Author Depth → Strong.

**3. Phase 2 — Narrator (Automatic)**

Same pattern. The system rolls narrator type, POV, reliability, tense. Presents the result:

> "Second-person present tense. Unreliable (self-deluded). The narrator speaks directly to 'you' — but 'you' is not the audience. 'You' is the narrator talking to themselves. The gap between what the narrator claims happened and what actually happened is the story's central tension."

User reviews. That's a bold narrator choice — the system flags it:

> "This is an unusual narrator type for a screenplay. Second-person present works in prose but is rarely used in film. Do you want to keep it (the screenplay will need a distinctive voiceover structure) or re-roll for something more conventional?"

User keeps it. Output: `narrator.md`.

**4. Phase 3 — World Building (Automatic)**

Genre is already set from the wizard (Sci-Fi + Thriller + Romance). The system rolls:
- Theme question
- Plot structure
- Narrative techniques
- Plot twist architecture
- Society-as-character
- World hallmarks (5-15)
- Time span, seasons, scenery

Each is presented for review. The world takes shape:

> **Theme question:** "Can you trust someone who has been designed to love you?"
> **Plot structure:** Story Circle
> **Society:** A corporate-state that manufactures emotional bonds for profit. It claims to protect people from loneliness. It actually protects itself from revolution.
> **Hallmarks:** The Bonding Chamber (place), The Compatibility Score (mechanic), The Severance Protocol (event)...

Seven Story Deaths audit runs automatically. The system reports:

> "Deliberate seals: Monolith (the corporation controls all bonding), Hierarchy (compatibility scores create a caste system). Accidental seal detected: Isolation — your world's domains (emotional, political, economic) are siloed. Consider connecting them."

User reviews, adjusts if needed. Output: `world/world-building.md`, `world/hallmarks.md`. Health updates.

**5. Phase 4 — Characters (Automatic)**

The system designs the cast architecture first:

> "Based on your genre blend, theme, and plot structure, I recommend:
> - 1 protagonist (Pioneer archetype)
> - 1 antagonist (systemic — the corporation)
> - 1 love interest / co-lead (Optimizer)
> - 1 mentor figure (Generalist)
> - 1 catalyst character (off-page, load-bearing in absence)
> - 2-3 supporting cast"

Then rolls each character fully. Same animated card reveal. Each character gets:
- Full identity, personality, development, voice fingerprint
- Stream A/B conflict stated in one sentence
- Network archetype assigned
- Antilife Seals they carry unconsciously
- Foil pairings noted

Cast collision check runs. If duplicates found:

> "Warning: Your protagonist (Kai) and your mentor (Dr. Vasquez) share the same wound (identity erasure) and the same flaw (emotional withdrawal). This will make them react identically under pressure. Want me to re-roll Dr. Vasquez's wound?"

User decides. Output: Character files for all named characters. Health updates. The **Cast Roster** populates with gradient avatars. Each character also gets an auto-generated **Emotional Palette** (Home/Stretch/Blocked) and **Somatic Signature** derived from their wound, MBTI, and emotional register. The user can use the **Emotion Wheel Picker** to adjust specific emotions — drilling down from "Fear" → "Dread" → "existential dread" if they want that level of specificity, or leaving it at the engine's defaults.

**6. Phase 5 — Relationships (Automatic)**

The system rolls dynamics, attachment styles, and structures for every significant pair. Builds the relationship graph with **Relationship Emotional Dynamics** (dominant emotions, physical tells, conflict triggers per pair). Presents it as an interactive matrix:

> "Kai → Dr. Vasquez: Mentorship (eroding) | Anxious-Avoidant dynamic | She knows something about his origin that she hasn't told him."
>
> "Kai → Lena: Romantic (emerging) | Secure-Anxious dynamic | She was designed to love him. Neither of them knows yet."

Each cell is editable. Society entries included. Output: `relationship-graph.csv`.

**7. Phase 6 — Story Foundation (Automatic)**

Ending-first:

> "Here is how this story ends: Kai discovers Lena was manufactured for him. He destroys the evidence rather than telling her. The last scene is them together, and the audience knows what Kai knows, and Lena doesn't. The theme question — 'Can you trust someone designed to love you?' — is answered with: 'You can. But you can never trust yourself again.'"

Title, abstract, short description generated. Tonal arc mapped. Subplot map built. Chapter-by-chapter outline with scene metadata.

For a screenplay, structure adjusts: acts instead of chapters, page counts instead of word counts, scene headings (INT./EXT.) instead of prose metadata.

User reviews the full outline. Can adjust any chapter's goal, tone, or content. Output: `abstract.md`, `story/arc.md`, `outline.md`.

**8. Phase 7 — Full Review (Automatic)**

All three theory checks run. Story Elements check. Resonance check. Relativism check. Results presented as a diagnostic report. Health rating displayed.

If the rating is below Strong:

> "Your story is rated Good. Here's what's holding it back:
> - Theme Resonance: Developing (the theme echoes in wound and relationship, but not in the world's institutional structure — the corporation's rules don't directly test the theme question)
> - Conflict Depth: Developing (conflict is operating at macro and intimate levels, but there's no intragroup conflict — no one in Kai's peer group disagrees with his choices)"
>
> "Want me to address these before we proceed to drafting?"

System fixes the gaps and re-assesses. Repeats until Strong or user overrides.

**9. Bridge**

The five threshold questions. Even in "generate for me" mode, the Bridge pauses and asks the user to engage:

> "What are you most afraid this story will do wrong?"

This is the one moment where the user is asked to be present, even if they've let the system drive everything else.

**10. Phase 8 — Chapter Generation**

The **Story Timeline** now shows the full plan — all story beats, character arc starting positions, relationship dynamics, tonal arc, and subproblem threads laid out across the chapter structure. As chapters are generated, the Timeline fills in with "reality" data alongside the plan.

For each chapter (or scene, for a screenplay):

- **Scene Dynamics Forecast** predicts the probable emotional collisions based on character states, relationship tensions, and active threads — "Kai and Lena are both in their Stretch emotions right now, and the compatibility score revelation will push Kai into Blocked territory"
- Pre-flight runs automatically (architecture files loaded, including emotional palettes and somatic signatures)
- Author LLM generates the full chapter/scene
- **Active Deconstruction** annotates the draft (grammar, voice, structure, theme, character behavioral layers)
- Presented in Reader mode with TTS available (using **Voice Casting** briefs if the user wants character-specific voices)
- **Reader Experience Report** generates: "This scene reads as a sprint — high dialogue ratio, low info density, emotional trajectory peaks at the compatibility reveal"
- User reads or listens, then: approve / request changes / edit / regenerate
- If approved → Editor LLM runs QA (consistency, structure, quality, emotional palette adherence, somatic consistency)
- Editor report presented → user accepts/rejects/discusses findings via **Editor chat** (dark/orange UI)
- Multi-pass if configured (Author revises → Editor reviews → repeat)
- Post-flight updates all tracking files; Story Timeline updates
- User can open **Talk to a Character** to interview Kai about what just happened — anchored to this scene, he only knows what's happened up to this point

This repeats for every chapter. For a screenplay, the output is formatted as a proper screenplay (scene headings, action lines, dialogue with character names, parentheticals).

**11. Final Assembly**

All chapters/scenes approved. Final health assessment displayed. The Story Timeline shows the complete picture — plan vs. reality for every dimension. Export options:

- Screenplay: .fountain + .pdf in standard screenplay format (Final Draft compatible) — **Format-Aware Export** auto-selects the screenplay template with scene numbers and revision color options
- Novel: .docx or .epub
- Full project archive (all architecture files + prose + media images)
- **Voice Casting sheet** (.md or .pdf) with narrator and per-character voice briefs for audiobook/podcast production

### Where This Path Has Holes (Now Fixed Above)

- Screenplay formatting wasn't mentioned → need to add medium-specific output formatting to the export section
- No explicit handling of acts vs. chapters for non-book mediums → partially addressed in word count table but needs more detail
- The Bridge should still appear even in full-generation mode → HOLE 9
- No way to ask "What if I changed the ending?" mid-generation → HOLE 1 (Chat), HOLE 3 (Sandbox)

---

## Path 3: "I Want to Analyze, Discuss, or Learn About a Story"

*The user doesn't want to write anything. They want to understand a story deeply — its structure, its characters, its themes, what makes it work or fail. They might be a student, a book club member, a screenwriter studying craft, or a curious reader. They want to talk to an AI that knows the story as well as they do.*

### What They Click

**Home Screen** → Quick Action: "Import a story to decompose"

OR

**Home Screen** → New Project → Wizard Step 3: "I want to decompose/analyze an existing story"

### Upload Flow

**"Upload or paste the text you want to analyze."**

Upload options:
- Paste text directly (for short stories, poems, essays)
- Upload a file (.txt, .md, .docx, .pdf, .epub)
- Provide a title and author (for public domain works the system may already know)

The system confirms receipt:

> "Received: *The Great Gatsby* by F. Scott Fitzgerald. 47,094 words, 9 chapters. Beginning structural analysis..."

A progress indicator shows the decomposition running through each phase.

### Decomposition Processing

The system runs Phases 1-6 in reverse (as specified in the Master Checklist's Decomposition Mode). Each phase produces an output file with every attribute tagged [CONFIRMED] or [INFERRED].

**Processing time:** This is the longest automated operation in the app. The system should show meaningful progress, not just a spinner:

> "Phase 1 — Analyzing the author... ████████░░ 80%"
> "Fitzgerald's prose style: 1920s Modernism × Lyrical voice. [CONFIRMED]"
> "Author wound: the simultaneous desire for and disgust with wealth. [INFERRED — the text returns to this tension in every chapter]"

### Results Presentation: The Structural Tour

Once decomposition is complete, the user doesn't see a folder of markdown files. They see an **interactive structural tour** — a guided walkthrough of the story's architecture, designed to teach.

**Tour Screen 1: The Author**

> "Who wrote this, and what were they carrying?"
>
> A visual card showing Fitzgerald's inferred author profile: age, wound (the wealth obsession), Enneagram (likely 4w3 — the Aristocrat), prose style (Lyrical Modernism), Big Picture Finding.
>
> Below: an expandable "What this means for the story" section explaining how the author's psychology shaped specific narrative choices.
>
> Below that: quoted evidence from the text supporting each inference.

**Tour Screen 2: The Narrator**

> "Who is telling this story, and what can't they see?"
>
> Nick Carraway's narrator profile: First-person peripheral. Reliability: Self-deluded (he claims moral neutrality while being deeply complicit). The gap between what Nick reports and what the text reveals is the story's central irony.

**Tour Screen 3: The World**

> "What does this world cost the people who live inside it?"
>
> Genre: Literary Fiction. Theme question: "Can you recapture something that only existed in your imagination?" Society-as-character: Old Money vs. New Money — two systems that agree on one thing: Gatsby doesn't belong.
>
> World hallmarks: The Green Light, the Eyes of Doctor T.J. Eckleburg, the Valley of Ashes, Gatsby's Parties, the white dresses.
>
> Seven Story Deaths audit: which seals are operating and where.

**Tour Screen 4: The Characters**

> Individual cards for each major character with their full attribute set, Stream A/B conflict, arc type, and **gradient avatar** (psychological axes rendered as color). Spider charts show the 8-axis profile. The system has inferred each character's **Emotional Palette** (Home/Stretch/Blocked tiers) and **Somatic Signature** from the prose. Visual indicators showing foil pairings (Gatsby ↔ Tom: same want, opposite method). The **Cast Roster** panel shows the full cast at a glance.

**Tour Screen 5: The Relationships**

> Interactive relationship graph with **Relationship Emotional Dynamics** — not just "Gatsby loves Daisy" but the dominant emotions when they're together, their physical tells, their conflict triggers. Click any cell to see the analysis. The pattern of connections and blanks tells its own story.

**Tour Screen 6: The Story**

> Arc diagram. Tonal arc visualization. The **Story Timeline** shows the full decomposed work — story beats, character arcs, relationship dynamics, emotional weather, and subproblem threads all synchronized across chapters. Chapter-by-chapter outline with the structural function of each chapter visible.

### The Conversation (This Is Where Path 3 Lives)

After the tour (or at any point during it), the user can open the **Story Assistant** — the LLM chat interface with the full decomposition loaded as context.

This is the heart of Path 3. The user can now ask anything:

**Understanding questions:**
- "Why does Gatsby throw parties?"
- "What is Nick's wound?"
- "How does the green light function as a hallmark?"
- "Why does the story end with the past, not the future?"

**Structural analysis:**
- "Is Gatsby a Pioneer or an Optimizer in the network model?"
- "Which of the Seven Story Deaths is operating in this novel?"
- "Where does the tonal arc shift, and is it earned?"
- "What's the weakest element in this story?"

**Comparative questions (if multiple decompositions exist):**
- "How does Gatsby compare to Jay-Z's story structurally?"
- "If Fitzgerald had Hemingway's prose style, what changes?"
- "What would this story look like as a horror film?"

**Teaching questions:**
- "Can you explain Stream A/B using Gatsby as an example?"
- "What is a hallmark? Use examples from this story."
- "Why does the story need Nick as narrator instead of Gatsby himself?"
- "What's the difference between a theme and a subject?"

**What-if questions:**
- "What if the story was told from Daisy's POV?"
- "What if Gatsby survived? What would Act 4 look like?"
- "What if this was set in modern-day Silicon Valley instead of 1920s New York?"
- "What breaks if you remove the green light?"

**Creative extension questions:**
- "Could this world support a sequel?"
- "What territory did this story leave unexplored?"
- "If I wanted to write a spinoff about Jordan Baker, what would the engine suggest?"

The AI responds with full structural awareness — not generic literary analysis, but answers grounded in the engine's vocabulary. It can reference Stream A/B, network archetypes, hallmarks, Antilife Seals, tonal arc, and every other concept in the system.

### The Conversation as a Teaching Tool

For students and learners, the conversation doubles as a writing class. If the **Conversational Teacher Persona** is enabled (Settings), the Story Assistant shifts from giving answers to asking open questions — drawing out the user's understanding through dialogue rather than lecture.

- **"Teach me about story structure using this book"** → The AI walks through the plot structure, pointing out each beat in the text
- **"What makes this character feel real?"** → The AI explains wound → flaw → virtue coherence using the character's actual attributes, referencing their Emotional Palette and Somatic Signature
- **"Why does this scene work?"** → The AI runs the scene through the 7-step scene loop from Story Consciousness Theory. If the user has their own writing loaded, **Active Deconstruction** can compare their craft choices to Fitzgerald's
- **"I'm writing my own story — how do I build characters as good as these?"** → The AI transitions from analysis to guidance, using the decomposed story as a teaching example, and can pivot into a new project if the user wants. Characters from the decomposition can be **imported** into a new project via the Roll/Choose/Import Pattern
- **"Talk to Gatsby"** → The user opens a **Talk to a Character** conversation with the decomposed Gatsby. He speaks in his inferred voice, from his wound, with his somatic signature. "Old sport, you want to know about Daisy? Let me tell you something — the green light wasn't about her. It was never about her."

### Re-Entry for Path 3

When the user returns to this project later, they see:

- The decomposition (all files, all visualizations)
- Their conversation history
- Any bookmarked insights or saved observations
- The option to continue the conversation, start a new one, or transition into a creative project based on this decomposition

### Where This Path Has Holes (Now Fixed Above)

- No conversation interface existed → HOLE 1
- No decomposition workflow in the UI → HOLE 2
- No what-if / sandbox mode → HOLE 3
- No explicit teaching/analysis mode → HOLE 6
- No comparison workflow → HOLE 7
- No way to transition from analysis to creation → need to add a "Start a project inspired by this" button in the decomposition view

---

## Summary of All Holes

| # | Hole | Severity | Affects Path |
|---|---|---|---|
| 1 | No conversation/chat interface | Critical | All 3 |
| 2 | No decomposition workflow in UI | Critical | 3, and parts of 1 |
| 3 | No what-if / sandbox mode | Critical | 2, 3 |
| 4 | No re-entry experience for returning users | Critical | All 3 |
| 5 | No reverse scaffolding for uploaded drafts | Significant | 1 |
| 6 | No teaching/analysis-only mode | Significant | 3 |
| 7 | No comparison workflow spelled out | Significant | 3 |
| 8 | No project-level version history | Significant | 1, 2 |
| 9 | No Bridge screen in UI | Significant | 1, 2 |
| 10 | No collaboration / multi-user | Minor | Future |
| 11 | No AI model selection | Minor | All 3 |
| 12 | No notification system | Minor | 2 |
| 13 | No manuscript formatting for export | Minor | 1, 2 |
