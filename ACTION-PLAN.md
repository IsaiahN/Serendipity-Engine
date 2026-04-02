# Serendipity Engine: Prototype to Production Action Plan

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Architecture Overview](#2-architecture-overview)
3. [Golden Rules](#3-golden-rules)
4. [View-to-File Mapping](#4-view-to-file-mapping)
5. [Phase-by-Phase Coverage](#5-phase-by-phase-coverage)
6. [LLM Integration Architecture](#6-llm-integration-architecture)
7. [Chapter Building and Context Management](#7-chapter-building-and-context-management)
8. [Editor Feedback Workflow](#8-editor-feedback-workflow)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Data Layer and Persistence](#10-data-layer-and-persistence)
11. [Platform Roadmap](#11-platform-roadmap)
12. [Migration Path: Prototype to v1.0](#12-migration-path-prototype-to-v10)
13. [Open Questions](#13-open-questions)

---

## 1. Current State Assessment

### What the Prototype (ui-screens) Has

The current Vite + React prototype is a UI shell that demonstrates layout, navigation, and visual design. It proves the concept but contains no real logic.

**Implemented (UI only, no backend):**
- Onboarding Wizard (8 steps, format/genre/scope/series/materials/phase/collaboration/author)
- Project Hub with project cards and quick actions
- Workspace with 8 center-stage modes (Guide, StoryAssistant, Reader, Editor, Timeline, Relationships, World Building, Comparison)
- File tree with Project Files and Engine Reference sections (collapsible accordion)
- FileEditorMode with line numbers, minimap, save/preview
- ReaderMode with custom markdown renderer (headings, bold, italic, lists, blockquotes, code, HR)
- QuickChat (collapsed/expanded) with three persona modes
- Health bar with 10 scoring dimensions
- Theme system with 5 presets (Midnight, Ember, Forest, Twilight, Daylight)
- Settings modal (theme picker, auto-save interval, word count goal, writing tips toggle, spell check, dark mode)
- Export modal (format and scope selection)
- Phase progress sidebar
- Teaching tips panel
- Cast roster in sidebar
- Drawing Board mode placeholder

**Not Implemented (needed for production):**
- No LLM calls of any kind
- No real file I/O (all content is hardcoded in fileContents objects)
- No randomization engine logic
- No project persistence (state resets on reload)
- No authentication or API key management
- No real export/import
- No real-time health scoring
- No chapter generation pipeline
- No editor feedback loop
- No decomposition mode logic
- No relationship graph computation
- No timeline data structure
- No drawing board persistence
- No undo/redo
- No version history
- No error handling
- No offline support
- No real search

### What the MD Files Provide

The markdown corpus is the complete intellectual framework: 100+ files containing theory (consciousness, network, seven deaths), reference lists (genres, names, character traits, narrative techniques), templates (author profile, character sheets), operational checklists (Master Story Checklist), and two complete example projects (The Shunning Season creation + Wizard of Oz decomposition). This corpus IS the product. The UI is just a window into it.

---

## 2. Architecture Overview

### Target Stack

```
User Interface Layer
  PWA (React + Vite + Service Worker)
  Chrome Extension (thin wrapper around PWA, adds context menu + side panel)
  VS Code Extension (editor integration, uses workspace filesystem + built-in LLM APIs)

Application Logic Layer
  State Manager (Zustand or similar, handles all UI state + project data)
  Pipeline Orchestrator (manages 8-phase workflow, tracks progress, validates transitions)
  Context Builder (assembles LLM prompts from project files + engine references)
  Randomization Engine (datetime seed math, weighted rolls, window calculations)
  Health Scorer (runs Seven Deaths audit, consciousness check, network check, story elements check)

LLM Adapter Layer
  Provider Router (dispatches to correct provider based on role assignment)
  Token Manager (tracks usage, estimates costs, handles context window limits)
  Retry/Fallback Handler (rate limits, timeouts, model swaps)
  Response Validator (enforces golden rules, checks format compliance)
  Streaming Handler (progressive rendering for long generations)

Data Layer
  Project Store (IndexedDB for PWA, filesystem for VS Code)
  File Serializer (reads/writes the MD file structure)
  Export Engine (MD, DOCX, PDF, JSON bundle)
  Import Engine (parses uploads, runs reverse scaffolding)
  Backup Manager (auto-save, crash recovery, version snapshots)
```

### File System as Source of Truth

Every project is a folder of markdown files. The app reads and writes these files. There is no database. The folder structure defined in Master-Story-Checklist.md IS the data model:

```
project-name/
  author.md
  narrator.md
  abstract.md
  outline.md
  dry-run-audit.md
  characters/
    character-name.md (one per character)
    questions-answered.md
  relationships/
    questions-answered.md
  world/
    world-building.md
    questions-answered.md
  story/
    arc.md
    chapter-1.md
    chapter-1-notes.md
    chapter-2.md
    chapter-2-notes.md
    ...
    chapter-checklist.md
    metafiles-review.md
    questions-answered.md
  feedback/
    editor-v1.md
    editor-v2.md (if multi-pass)
    editor-final.md
  drawing-board/
    notes.md
```

---

## 3. Golden Rules

These are enforced at every layer: prompt construction, response validation, and UI rendering.

### Rule 1: No Emdashes (Unbreakable)

LLMs are banned from using emdashes (the long dash character) in any generated or returned content. This applies everywhere: chapter prose, character descriptions, feedback, chat responses, summaries, outlines. The system must:

- Include the no-emdash instruction in every prompt sent to any LLM
- Run a post-processing validation on every LLM response that scans for emdash characters (U+2014, U+2013) and replaces or flags them before displaying to the user
- If the user explicitly requests emdashes in a specific context, that request overrides the rule for that single generation only, and the override is logged

The replacement strategy: emdashes become either commas, periods, semicolons, or parentheses depending on grammatical context. The validator should attempt smart replacement. If context is ambiguous, use a comma followed by a space.

### Rule 2: Context Completeness for Chapter Generation

Every chapter generation request must include the full relevant context (see Section 7 for details). No chapter is ever generated in isolation. The system must refuse to generate a chapter if required context files are missing.

### Rule 3: Editor Passes are Bounded

LLMs are never satisfied with their own output. The system defaults to one editor pass per arc during drafting, with the user able to accept or request additional passes. The only exception is the final full-book review, which may take 2-4 passes. The system must warn the user when the editor requests more than 2 passes on any single chapter and recommend accepting the current state.

### Rule 4: Seed Reproducibility

Given the same seed, the same rolls must produce the same results. The randomization engine is deterministic. All roll results are logged in the project files so they can be audited.

### Rule 5: User Sovereignty

The user can override any LLM suggestion, skip any phase, and edit any generated content. The system tracks what was AI-generated versus human-written (using a simple metadata tag) but never restricts editing.

---

## 4. View-to-File Mapping

This table shows which UI views read from and write to which project/engine files. This is critical for knowing what data each view needs.

### Wizard Screen (Onboarding)

| Wizard Step | Reads From (Engine Reference) | Writes To (Project) |
|---|---|---|
| Step 1: Story Type | (hardcoded format list from pwa-ui-experience.md) | project metadata (format, sub-format, submission target) |
| Step 2: Genre | Story/genres.md | project metadata (up to 3 genres) |
| Step 3: Scope | (hardcoded ranges) | project metadata (word count, POV count, structure) |
| Step 4: Series | (none) | project metadata (series type, name, position) |
| Step 5: Materials | (none) | uploaded files into project folder |
| Step 6: Phase | (none) | project metadata (starting phase) |
| Step 7: Collaboration | (none) | project metadata (collaboration style) |
| Step 8: Author | Characters/Identity/*, Characters/Personality/*, Characters/Development/* | author.md (if generating) or author profile |

### Workspace: Guide Mode (Phase-by-Phase)

| Phase | Reads From | Writes To | LLM Role |
|---|---|---|---|
| Phase 1: Author | All Characters/ reference files, MetaFiles/randomization-engine.md | author.md | Rolls + interview |
| Phase 2: Narrator | Story/narrator.md, author.md | narrator.md | Rolls + derivation |
| Phase 3: World | Story/genres.md, Story/world-hallmarks.md, Story/themes-and-tropes.md, Story/World Building/*, MetaFiles/seven-story-deaths.md | world/world-building.md, world/questions-answered.md | Generation + audit |
| Phase 4: Cast | All Characters/ refs, author.md, narrator.md, world/ | characters/*.md, characters/questions-answered.md | Per-character generation |
| Phase 5: Relationships | Relationships/*.md, all characters/*.md | relationships/questions-answered.md | Graph building |
| Phase 6: Story | Story/plot-structure.md, Story/narrative-techniques.md, Story/plot-twist-types.md, Story/story-elements.md, MetaFiles/tonal-control.md, all project files | abstract.md, outline.md, story/arc.md | Architecture |
| Phase 7: Review | MetaFiles/story-consciousness-theory.md, MetaFiles/story-network-theory.md, MetaFiles/seven-story-deaths.md, Story/story-elements.md, ALL project files | story/metafiles-review.md, dry-run-audit.md | Full audit |
| Bridge | ALL project files | (user reflection, no file) | Interview |
| Phase 8: Execution | ALL project files + ALL previous chapters | story/chapter-N.md, story/chapter-N-notes.md | Generation |

### Workspace: StoryAssistant Chat

Reads: All project files (for context), all engine reference files (for answering questions). Writes: Nothing directly; suggests edits that the user applies.

Three personas:
- **Story Assistant**: General help, brainstorming, questions about craft. Context = full project + relevant engine refs.
- **Editor**: Structural and line-level feedback. Context = full project + MetaFiles/seven-story-deaths.md + story-consciousness-theory.md + story-network-theory.md.
- **Talk to Character**: In-character dialogue. Context = that character's .md file + relationships + world + story arc.

### Workspace: Reader Mode

Reads: story/chapter-N.md (rendered with markdown). Also reads author.md, narrator.md for voice/style context display. Writes: Nothing (read-only view).

### Workspace: Editor Mode (FileEditorMode)

Reads: Any project file selected from the file tree. Writes: That same file on save. The "Run Editor" button triggers LLM-powered structural feedback (reads the file + context, writes to feedback/editor-vN.md).

### Workspace: Timeline Mode

Reads: outline.md, story/arc.md, all chapter files (extracts scene metadata, character appearances, timeline markers). Writes: Nothing directly (visual only), but changes made via the timeline UI would update outline.md.

### Workspace: Relationships Mode

Reads: All characters/*.md, relationships/questions-answered.md, Relationships/*.md (reference). Writes: Updates to relationships/questions-answered.md when edges are added/modified.

### Workspace: World Building Mode

Reads: world/world-building.md, world/questions-answered.md, Story/World Building/*.md (reference). Writes: world/world-building.md.

### Workspace: Comparison Mode

Reads: Two selected files side-by-side (any combination of project files). Writes: Nothing.

### Workspace: Drawing Board

Reads/writes: drawing-board/notes.md (freeform content).

---

## 5. Phase-by-Phase Coverage

### Phase 1: Create the Author

**What happens:** The randomization engine generates a complete author persona using the datetime seed. Each attribute (age, gender, religion, sexuality, MBTI, enneagram, alignment, character type, wound, values, etc.) is rolled against the corresponding reference file. Alternatively, the user fills out the author-profile-template.md as themselves.

**LLM involvement:** After rolls are complete, the LLM conducts an interactive interview with the user to refine the author profile. It asks about the Big Picture Statement, checks for internal contradictions, and writes the final author.md.

**Guided mode UI:** One attribute at a time, card-reveal style. Each roll is shown with the reference context (what does this MBTI type mean for writing?). User can re-roll any attribute or manually override.

**Files touched:**
- Reads: Characters/Identity/*.md, Characters/Personality/*.md, Characters/Development/*.md, Characters/Names/*.md, MetaFiles/randomization-engine.md, MetaFiles/writing-prose-styles.md, MetaFiles/language-content.md
- Writes: author.md

### Phase 2: Create the Narrator

**What happens:** The narrator is derived from the author. Rolls determine POV type, reliability, narrative position, voice type. The gap between author worldview and narrator perspective is explicitly defined.

**LLM involvement:** Given the author.md, the LLM helps determine what kind of narrator this author would create. Suggests reliability type based on author wound/personality. Writes narrator.md.

**Files touched:**
- Reads: Story/narrator.md, author.md
- Writes: narrator.md

### Phase 3: World Building

**What happens:** Genre blend (3 genres from distinct sublists), theme-as-question, plot structure, conflict types, narrative techniques, plot twist architecture, world hallmarks (5-15 tangible elements), time/calendar, scenery, society-as-character. Then runs the first Seven Deaths audit against the world design.

**LLM involvement:** Heavy. Generates the world from rolled attributes, then runs the structural audit. Asks targeted questions from Story/World Building/questions.md.

**Files touched:**
- Reads: Story/genres.md, Story/themes-and-tropes.md, Story/plot-structure.md, Story/narrative-techniques.md, Story/plot-twist-types.md, Story/world-hallmarks.md, Story/story-elements.md, Story/World Building/*.md, MetaFiles/seven-story-deaths.md, author.md, narrator.md
- Writes: world/world-building.md, world/questions-answered.md

### Phase 4: Build the Cast

**What happens:** Cast architecture first (how many characters, what roles, what gaps to fill). Then per-character generation: full attribute rolls (same categories as author but for fictional characters), plus network archetype assignment, foil pairings, collision check (no two characters too similar).

**LLM involvement:** Generates each character sheet, runs collision checks, suggests cast adjustments. Asks questions from Characters/Questions.md.

**Files touched:**
- Reads: All Characters/ reference files, author.md, narrator.md, world/world-building.md
- Writes: characters/character-name.md (one per character), characters/questions-answered.md

### Phase 5: Map Relationships

**What happens:** Build the relationship graph. Three tiers: major bonds (deep, story-driving), minor bonds (functional, scene-level), society-level (cultural norms, group dynamics). Each relationship gets type, dynamic, attachment style, power balance, emotional valence.

**LLM involvement:** Given all character files and the world, generates the relationship map. Checks for relationship deserts (isolated characters) and monocultures (all relationships the same type).

**Files touched:**
- Reads: Relationships/*.md, all characters/*.md, world/world-building.md
- Writes: relationships/questions-answered.md

### Phase 6: Story Foundation

**What happens:** Know the ending first. Then: title, abstract, short description, story arc (3-act structure with chapter breakdown), tonal arc (opening/mid/climax/closing tones), subplot map, chapter-by-chapter outline with per-chapter goals, tone targets, thread states, scene metadata.

**LLM involvement:** This is where the LLM synthesizes everything into a coherent story architecture. It must read every project file created so far. Writes the outline, arc, and abstract.

**Files touched:**
- Reads: ALL project files created in Phases 1-5, Story/story-elements.md, MetaFiles/tonal-control.md, Story/plot-structure.md
- Writes: abstract.md, outline.md, story/arc.md, story/questions-answered.md

### Phase 7: Full Review

**What happens:** The most intellectually demanding phase. Runs four checks against the three theoretical pillars plus the story elements framework:
1. Consciousness Theory check (Stream A/B presence, I-Thread, developmental stages, scene loop)
2. Network Theory check (world-as-organism, archetype coverage, resonance pathways)
3. Seven Deaths check (all 7 seals evaluated, intentional vs accidental, fractal application)
4. Story Elements check (all 7 active and balanced)
Plus a relativism check and final resonance assessment.

**LLM involvement:** Reads ALL project files plus ALL three theory documents. Produces a structured review with specific findings and recommendations. Writes the metafiles-review.md.

**Files touched:**
- Reads: EVERYTHING (all project files + MetaFiles/story-consciousness-theory.md + MetaFiles/story-network-theory.md + MetaFiles/seven-story-deaths.md + Story/story-elements.md)
- Writes: story/metafiles-review.md, dry-run-audit.md

### The Bridge (Phase 7 to 8)

**What happens:** Five threshold questions posed to the user (not the LLM):
1. What is the first thing that happens?
2. Whose voice tells it?
3. What does the reader not know?
4. What are you afraid to write?
5. What scene excites you most?

**LLM involvement:** None. This is a human reflection moment. The answers are stored but do not generate a file.

### Phase 8: Chapter Execution

**What happens:** Chapter-by-chapter drafting with pre-flight checks, generation, and post-flight checks. See Section 7 for full context management details.

**LLM involvement:** Maximum. Every chapter is a major generation event with full context loading. See Section 7.

**Files touched:**
- Reads: ALL project files + ALL previous chapters + feedback files if present
- Writes: story/chapter-N.md, story/chapter-N-notes.md, story/chapter-checklist.md (updated)

---

## 6. LLM Integration Architecture

### Provider Support

The system must support multiple LLM providers. Initial targets:
- Anthropic (Claude) via API
- OpenAI (GPT-4, GPT-4o) via API
- Google (Gemini) via API
- Local models via Ollama or similar (for privacy-conscious users)
- VS Code extension: leverage the built-in Copilot/LLM APIs

Users bring their own API keys. The system never stores keys on any server. Keys are stored locally (encrypted in IndexedDB for PWA, in VS Code settings for the extension).

### Role Assignment (Three Tiers)

**Simple mode:** One model handles everything.

**Standard mode:** Four roles mapped to models:
1. Generator (writes prose, builds characters, creates worlds)
2. Analyst (runs audits, health checks, structural reviews)
3. Editor (provides feedback, suggests revisions)
4. Assistant (chat, brainstorming, Q&A)

**Granular mode:** 15+ specific tasks mapped individually (character generation, chapter drafting, Seven Deaths audit, tonal analysis, etc.)

### Prompt Construction

Every LLM call is built by the Context Builder, which assembles:

```
System Prompt (role definition + golden rules + output format)
  + Engine Reference Files (relevant theory/reference docs)
  + Project Context (relevant project files)
  + Conversation History (if in chat mode)
  + Specific Task Instructions
  = Final Prompt
```

The system prompt ALWAYS includes:
- The no-emdash rule (verbatim: "Never use emdashes (the long dash character) in any output. Use commas, semicolons, periods, or parentheses instead.")
- Output format requirements (markdown structure, heading levels, etc.)
- Role-specific behavioral guidelines

### Token Budget Management

Before every LLM call, the system must:
1. Count the tokens in the assembled context (using tiktoken or a provider-specific tokenizer)
2. Compare against the model's context window limit
3. If over limit, apply a priority-based trimming strategy:
   - Never trim: system prompt, golden rules, the current chapter's outline entry, character files for characters in this chapter
   - Trim last: previous chapter (N-1), narrator.md, author.md
   - Trim first: earlier chapters (summarize instead of including full text), world-building details not relevant to current scene
   - Always summarize rather than omit: if a chapter must be trimmed, replace it with a 200-word summary preserving key plot points, character states, and relationship changes

4. Display the token usage to the user (e.g., "Context: 45,000 / 128,000 tokens") so they understand the constraint

### Streaming

All generation calls should use streaming responses where the provider supports it. This means:
- Chapter text appears progressively in the editor
- The user can read the beginning while the end is still generating
- A "Stop Generation" button is always visible during streaming
- If the user stops generation, the partial output is preserved and the user can choose to continue from where it stopped or regenerate

### Cost Estimation

Before any major generation (chapter drafting, full review), display an estimated cost:
- Input tokens x provider's per-token price
- Estimated output tokens x provider's per-token price
- Running total for the session / project

This is informational, not blocking. The user can set a budget cap in settings that triggers a confirmation dialog when approaching the limit.

---

## 7. Chapter Building and Context Management

This is the most critical section for story quality. The LLM must never hallucinate details that contradict established context.

### Context Assembly for Chapter N

Every chapter generation request includes the following files, in this order:

**Always included (never trimmed):**
1. `author.md` - The author's voice, wound, worldview, prose style
2. `narrator.md` - POV type, reliability, voice characteristics
3. `outline.md` - The full chapter-by-chapter outline (so the LLM knows the destination)
4. `story/arc.md` - The story arc structure, tonal arc, subplot map
5. `characters/*.md` - Character files for every character appearing in this chapter (check outline for which characters are in the scene)
6. `world/world-building.md` - World context, hallmarks, setting details
7. `relationships/questions-answered.md` - Relationship states (especially between characters in this chapter)
8. The specific outline entry for chapter N (goals, tone target, thread states, scene metadata)

**Included with progressive summarization:**
9. `story/chapter-1.md` through `story/chapter-(N-1).md` - ALL previous chapters

For chapters 1-3, full text of all previous chapters is included.
For chapters 4+, the system uses this strategy:
  - Chapter N-1 (immediately preceding): full text
  - Chapter N-2: full text
  - Chapters 1 through N-3: condensed summaries (300-500 words each) that preserve:
    - Key plot events and revelations
    - Character emotional states at chapter end
    - Relationship changes
    - Unresolved threads and planted seeds
    - Tonal register
  - These summaries are auto-generated after each chapter is completed and stored alongside the chapter file

**Included if present:**
10. `feedback/editor-v1.md` - If the user accepted editor feedback for previous chapters, include it so the LLM incorporates the notes
11. `story/chapter-N-notes.md` from previous chapters - Chapter-specific notes that may contain continuity flags

### Pre-Flight Checklist (Before Generating Chapter N)

The system runs these checks before allowing generation:
1. Continuity check: Are there any unresolved contradictions flagged in previous chapter notes?
2. Character consistency: Do character states in the outline match where they ended in chapter N-1?
3. Thread tracking: Are all active threads accounted for in this chapter's outline entry?
4. Tone target: Is the intended tone for this chapter consistent with the tonal arc?
5. If any check fails, the system shows a warning but does not block generation.

### Post-Flight Checklist (After Generating Chapter N)

After the chapter is generated and the user has reviewed it:
1. Forward continuity: Flag any new details that future chapters must be consistent with
2. Relationship updates: Note any relationship changes that occurred
3. Thread state updates: Mark threads as advanced, introduced, or resolved
4. Character state snapshot: Brief note on where each character stands emotionally/physically
5. Handoff note: What the next chapter needs to pick up

These post-flight items are stored in `story/chapter-N-notes.md` and become part of the context for chapter N+1.

### The Progressive Summary System

After each chapter is finalized, the system generates a structured summary:

```markdown
## Chapter N Summary (Auto-generated)

**Plot:** [2-3 sentences covering what happened]
**Characters:** [Who appeared, what changed for them]
**Relationships:** [Any shifts, revelations, or tensions]
**World:** [Any new world details introduced]
**Threads:** [Which threads advanced, which were planted, which resolved]
**Tone:** [The emotional register of the chapter]
**Ends with:** [The state of affairs at chapter close]
```

This summary is what gets included in context for distant future chapters instead of the full text.

---

## 8. Editor Feedback Workflow

### During Drafting (Per-Arc or Per-Chapter)

The default recommendation: run editor feedback once per story arc (e.g., after completing Act 1 chapters 1-3, get editor feedback on the batch before starting Act 2).

The user can choose:
- **Per-arc review** (recommended): Editor reviews all chapters in the completed arc as a batch
- **Per-chapter review**: Editor reviews each chapter immediately after drafting
- **Skip entirely**: User drafts all chapters, then does a full-book review at the end
- **Custom**: User triggers editor review whenever they want

### Editor Feedback Generation

When the editor runs, it receives:
- ALL project files (author, narrator, world, characters, relationships, outline, arc)
- ALL chapters written so far
- The three theory documents (consciousness, network, seven deaths)
- Story elements framework

The editor produces `feedback/editor-vN.md` with:
- Structural observations (arc shape, pacing, tension curve)
- Character consistency flags (is this character behaving consistently with their profile?)
- Relationship dynamics (are relationships evolving or static?)
- Seven Deaths check (are any failure modes emerging?)
- Line-level notes (specific passages that could be stronger, with suggestions)
- Tone drift warnings (has the prose wandered from the tonal arc target?)
- Continuity errors (factual contradictions between chapters)

### User Response to Editor Feedback

The user reviews the feedback and can:
1. **Accept all**: Feedback file is included in future chapter context
2. **Accept with modifications**: User edits the feedback file to note which suggestions they agree with
3. **Reject**: Feedback file is archived but not included in future context
4. **Request revision**: The editor makes another pass, but the system warns that one pass is usually sufficient

### The Final Full-Book Review

This is the big one. It happens only after ALL chapters are complete. It is the most token-intensive operation in the entire system.

**Before the review starts:**
- The system prompts the user to save/export a "rough draft" snapshot. This is critical because the editing process may result in significant changes across 2-4 passes. The user needs a rollback point.
- The export creates a timestamped copy of the entire project folder.

**What the final review includes in context:**
- EVERYTHING. Every MD file in the project. Every chapter, every character, every relationship, every world detail, the outline, the arc, the abstract, all previous feedback files.
- All three theory documents in full
- The story elements framework
- The Seven Deaths checklist

**What the final editor scrutinizes:**
- The complete journey from chapter 1 to the ending
- Character arcs: did each character's trajectory make sense from beginning to end?
- Relationship arcs: did relationships evolve believably?
- Story arcs: does the overall structure deliver on its promises?
- Thematic coherence: does the theme-as-question get explored from enough angles?
- Tonal arc: does the emotional journey feel intentional?
- World consistency: are hallmarks and world rules consistent throughout?
- Pacing: are there dead spots, rushes, or imbalances?
- The Seven Deaths at the full-book level: are any seals present?

**Multi-pass process (2-4 passes expected):**

Pass 1: Broad structural review. Identifies major issues (arc problems, character inconsistencies, pacing failures). Produces feedback/editor-v1.md (or editor-final-v1.md to distinguish from during-drafting feedback).

Pass 2: After user applies Pass 1 changes, the editor re-reads the whole book. Focuses on mid-level issues (scene transitions, dialogue quality, tonal consistency). Produces editor-final-v2.md.

Pass 3 (if needed): Fine-grained review. Line-level suggestions, word choice, rhythm. Produces editor-final-v3.md.

Pass 4 (rare): Only if Pass 3 revealed structural issues that Pass 1 missed. The system should actively discourage a 4th pass unless the user specifically requests it.

After each pass, the user reviews feedback, makes changes, and decides whether to continue to the next pass or declare the book done.

### Token Management for Full-Book Review

A full novel (70,000-100,000 words) plus all context files will exceed any current model's context window. Strategy:

**For models with 128K+ context:**
- Include full text for all chapters if the total fits
- If not, use the progressive summary system for early chapters and full text for recent ones

**For models with smaller windows:**
- The review must be done in segments:
  - Arc-by-arc review with full chapter text for that arc, summaries for other arcs
  - Then a synthesis pass that reviews all arc-level feedback together
- The system automates this segmentation

**For the future:**
- As context windows grow (1M+), the full-book review becomes a single call
- The architecture should be designed so that segmented review is a fallback, not the primary path

---

## 9. Error Handling Strategy

### Rate Limiting

**Detection:** HTTP 429 responses, or provider-specific rate limit headers.

**Response:**
1. Display a user-friendly message: "The AI provider is temporarily limiting requests. Waiting [X] seconds before retrying."
2. Implement exponential backoff: 5s, 15s, 45s, then offer to switch to a different model/provider
3. If the user has multiple providers configured, offer automatic failover: "Switching to [alternate model] while [primary model] cools down."
4. Never silently retry. Always show the user what is happening.
5. During chapter generation, if rate limiting interrupts a streaming response, preserve the partial output and offer "Continue from here" when the limit clears.

### Token/Context Limit Exceeded

**Detection:** HTTP 400 with context length error, or pre-send token count exceeding model limit.

**Response:**
1. Never send a request that will fail due to context length. Always count tokens before sending.
2. If the assembled context exceeds the limit, apply the trimming strategy from Section 7.
3. Show the user what was trimmed: "To fit within the model's context window, I summarized chapters 1-5 instead of including full text."
4. If even after maximum trimming the context is too large, suggest the user switch to a model with a larger context window, or break the task into smaller pieces.
5. For chapter generation: if the chapter outline indicates a very long chapter, suggest splitting it into two.

### API Key Issues

**Detection:** HTTP 401/403 responses.

**Response:**
1. "Your API key for [provider] appears to be invalid or expired. Please check your key in Settings."
2. Never display the key itself in error messages.
3. Offer to test the key with a minimal request.
4. If the key has insufficient permissions (e.g., no access to the selected model), explain which model it cannot access and suggest alternatives.

### Provider Outages

**Detection:** Connection timeouts, HTTP 500/502/503 responses.

**Response:**
1. "Unable to reach [provider]. This may be a temporary outage."
2. Retry once after 10 seconds.
3. If still failing, offer to switch providers.
4. The app must remain fully functional for all non-LLM features during outages (editing, reading, file management, randomization engine rolls).

### Upload Limits

**Detection:** File size checks before upload, provider-specific file attachment limits.

**Response:**
1. For user-uploaded materials (Step 5 of wizard): check file size before processing. Display maximum file sizes per format.
2. For chapter text that exceeds API body limits: chunk the text and send in parts.
3. For images (if character visualization is added later): compress before sending, warn if originals are too large.
4. The PWA's IndexedDB has a practical limit (~50-500MB depending on browser). Warn users when approaching storage limits.

### Generation Quality Issues

**Detection:** Post-processing validation checks.

**Response:**
1. Emdash detection: Automatically replace before displaying. Log the replacement for transparency.
2. Format compliance: If the LLM returns content not matching the expected markdown structure, attempt to parse it anyway. If unparseable, show the raw output and ask the user if they want to retry.
3. Hallucination detection: After chapter generation, run a quick check comparing mentioned character names, locations, and facts against the project files. Flag any names or details not found in the project context.
4. Repetition detection: If the LLM starts repeating phrases or paragraphs (a common failure mode), detect the repetition loop and stop generation, then offer to retry with a slightly modified prompt.

### Crash Recovery

The auto-save system writes to IndexedDB every N seconds (configurable, default 30). If the app crashes or the tab is closed:
1. On next launch, detect the unsaved session.
2. Offer to restore: "You have unsaved work from [timestamp]. Restore?"
3. Never overwrite saved data with crash-recovered data without user confirmation.

---

## 10. Data Layer and Persistence

### PWA Storage

**IndexedDB** is the primary storage for the PWA. Structure:

```
Database: serendipity-engine
  Store: projects
    Key: project-id (UUID)
    Value: { metadata, files: { path: content }, settings, history }
  Store: settings
    Key: setting-name
    Value: setting-value
  Store: api-keys
    Key: provider-name
    Value: encrypted-key
  Store: writing-profile
    Key: user-id
    Value: { assessment data, project history }
```

**File Sync:** When the user exports a project, the system writes the folder structure to the filesystem via the File System Access API (where available) or as a ZIP download.

### VS Code Extension Storage

Uses the workspace filesystem directly. Each project is a folder on disk. The extension reads/writes .md files natively. Settings are stored in VS Code's settings.json. API keys use VS Code's secrets API.

### Chrome Extension Storage

Uses chrome.storage.local for settings and small data. For project data, delegates to the PWA's IndexedDB (the extension opens the PWA in a side panel and communicates via postMessage).

### Version History

Every save creates a lightweight diff (not a full copy). The system stores the last 50 diffs per file. The user can view history and restore any previous version. For VS Code, this is handled by Git integration (the extension encourages users to use version control).

---

## 11. Platform Roadmap

### Version 1: PWA (Progressive Web App)

**Target:** A standalone web application installable on any device.

**Technical stack:**
- React + Vite (already prototyped)
- Zustand for state management
- IndexedDB for persistence (via Dexie.js wrapper)
- Service Worker for offline support
- Web Crypto API for API key encryption
- File System Access API for import/export
- Web Speech API for TTS in Reader mode

**PWA-specific features:**
- Install prompt (add to home screen)
- Offline mode: full app functionality without LLM calls (editing, reading, file management, randomization rolls all work offline)
- Background sync: queue LLM requests made offline and execute when connectivity returns
- Push notifications: optional reminders for writing streaks (the Hooked Loop system from the features doc)
- Responsive design: works on desktop, tablet, and mobile

**Build phases:**

Phase A - Core Shell (4-6 weeks):
- Migrate prototype from hardcoded data to real state management
- Implement file serialization (read/write MD files to/from IndexedDB)
- Build the randomization engine in JavaScript
- Implement project CRUD (create, open, delete, export, import)
- Add settings persistence

Phase B - LLM Integration (4-6 weeks):
- Build the Provider Router (Anthropic, OpenAI, Google APIs)
- Build the Context Builder (prompt assembly from project files)
- Build the Token Manager (counting, budgeting, trimming)
- Build the Response Validator (golden rules enforcement, format checking)
- Implement streaming responses
- Wire up the StoryAssistant chat
- Wire up the Guide mode (phase-by-phase with LLM calls)

Phase C - Pipeline (6-8 weeks):
- Implement all 8 phases with real LLM calls
- Build the pre-flight/post-flight checklist system
- Build the progressive summary system
- Build the editor feedback workflow
- Implement the full-book review process
- Build the health scoring system
- Wire up the Seven Deaths audit, consciousness check, network check

Phase D - Polish (4-6 weeks):
- Offline support and service worker
- Export engines (MD, DOCX, PDF, JSON)
- Import and reverse scaffolding
- Drawing board persistence
- Timeline and relationship graph visualization
- Accessibility pass
- Performance optimization
- Testing

### Version 2: Chrome Extension

**Target:** A Chrome extension that wraps the PWA for enhanced browser integration.

**What it adds over the PWA:**
- Side panel mode: open the full workspace in Chrome's side panel while browsing research material
- Context menu integration: right-click any text on a web page to "Send to Serendipity Engine" (adds to drawing board or a research notes file)
- Tab management: dedicated research tabs that auto-save URLs and excerpts to the project
- Omnibox integration: type "se" in the address bar to quick-search project files
- Notification badges: show writing streak status on the extension icon

**Architecture:**
- The extension's popup and side panel load the PWA as an iframe or embedded React app
- Background service worker handles context menu events, omnibox queries, and tab monitoring
- Communication between extension and PWA via chrome.runtime.sendMessage / window.postMessage
- Storage shared via IndexedDB (same database as the PWA)

**Additional Chrome APIs used:**
- chrome.sidePanel for the side panel
- chrome.contextMenus for right-click actions
- chrome.omnibox for address bar integration
- chrome.tabs for research tab management
- chrome.notifications for writing reminders

**Build estimate:** 2-3 weeks on top of the PWA (most logic is shared)

### Version 3: VS Code Extension

**Target:** A VS Code extension that integrates the Serendipity Engine into the developer/writer's primary editor.

**What it adds over the PWA:**
- Native filesystem access: projects are real folders, files are real .md files on disk
- Git integration: every save can be a commit, branches for experimental arcs, diffs for tracking changes
- VS Code's built-in LLM APIs: can use Copilot or other VS Code LLM extensions as providers, reducing the need for separate API keys
- Multi-file editing: use VS Code's native editor for .md files with split panes, search/replace, etc.
- Extension marketplace distribution
- Terminal integration: run the randomization engine from the command line
- Custom file decorations: show phase status, health scores, and chapter metadata in the file explorer
- Webview panels: the Guide mode, Reader mode, Timeline, Relationship Graph, and other visual views render in VS Code webview panels

**Architecture:**
- VS Code extension API for commands, views, file decorations, webviews
- The workspace IS the project folder (no IndexedDB needed)
- Webview panels render React components (shared with PWA)
- Extension host handles LLM calls, file I/O, and pipeline logic
- TreeView provider for the custom file explorer (Project Files + Engine Reference)
- The engine reference files ship with the extension as bundled assets

**VS Code-specific features:**
- Command palette integration: "Serendipity: Generate Chapter", "Serendipity: Run Editor Review", etc.
- Status bar items: current phase, word count, health score
- Gutter decorations: show editor feedback inline next to the relevant lines
- Diff view: compare editor suggestions against current text
- Source control integration: auto-commit after each phase completion (optional)
- Snippets: markdown snippets for character sheets, chapter headers, etc.

**Build estimate:** 4-6 weeks on top of the shared logic layer (significant VS Code API work)

### Shared Logic Layer

To avoid building three separate apps, the core logic must be extracted into a shared package:

```
@serendipity-engine/core
  randomization-engine.ts
  context-builder.ts
  token-manager.ts
  response-validator.ts
  pipeline-orchestrator.ts
  health-scorer.ts
  file-serializer.ts
  progressive-summarizer.ts
  checklist-runner.ts
```

This package is imported by all three platforms. Platform-specific code handles:
- Storage (IndexedDB vs filesystem vs chrome.storage)
- LLM provider communication (fetch vs VS Code LLM API)
- UI rendering (all use React, but VS Code uses webview panels)

---

## 12. Migration Path: Prototype to v1.0

### Step 1: Extract State from UI (Week 1-2)

The current WorkspaceScreen.jsx is a 4,500+ line monolith with all state, content, and logic inline. The first step is extraction:

1. Move all `fileContents` data into a separate data layer
2. Create a Zustand store with slices for:
   - Project state (active project, files, metadata)
   - UI state (active mode, active file, sidebar state, theme)
   - Pipeline state (current phase, completed phases, health scores)
   - Chat state (messages, active persona, conversation history)
3. Replace `useState` calls with store selectors
4. Extract each mode (Guide, Reader, Editor, etc.) into its own component file
5. Extract QuickChat, HealthBar, PhaseProgress, FileTree into proper components

### Step 2: Implement Real File I/O (Week 2-3)

1. Set up Dexie.js (IndexedDB wrapper)
2. Implement the file serializer: save/load project files to/from IndexedDB
3. Wire up the file tree to read real project data instead of hardcoded fileContents
4. Implement auto-save (debounced writes to IndexedDB)
5. Implement project creation, opening, and deletion
6. Implement import (drag-and-drop a project folder or ZIP)
7. Implement export (download as ZIP with correct folder structure)

### Step 3: Build the Randomization Engine (Week 3-4)

1. Port the algorithm from randomization-engine.md to TypeScript
2. Implement seed generation from datetime
3. Implement 3-digit window extraction
4. Implement mod-based list rolling
5. Implement weighted rolls (d10 threshold system)
6. Implement seed extension for >4 rolls (multiply and extract)
7. Build the reference file parser (reads .md files, extracts numbered lists for rolling)
8. Wire up to the Guide mode UI (roll reveals, re-roll buttons)

### Step 4: Build the LLM Adapter (Week 4-6)

1. Implement the Provider Router with adapters for Anthropic, OpenAI, Google
2. Implement the Context Builder
3. Implement the Token Manager with tiktoken
4. Implement the Response Validator (emdash check, format check)
5. Implement streaming response handler
6. Build the Settings UI for API key management and role assignment
7. Wire up StoryAssistant chat to real LLM calls
8. Implement the three chat personas with different system prompts

### Step 5: Implement the Pipeline (Week 6-10)

1. Build Phase 1 (Author generation with rolls + LLM interview)
2. Build Phase 2 (Narrator derivation)
3. Build Phase 3 (World building with Seven Deaths audit)
4. Build Phase 4 (Cast building with collision checks)
5. Build Phase 5 (Relationship mapping)
6. Build Phase 6 (Story foundation, outline generation)
7. Build Phase 7 (Full review against all three theory pillars)
8. Build the Bridge (threshold questions UI)
9. Build Phase 8 (Chapter execution with full context management)
10. Build the pre-flight/post-flight checklist system
11. Build the progressive summary generator
12. Build the editor feedback workflow
13. Build the final full-book review process

### Step 6: Build Supporting Features (Week 10-14)

1. Health scoring system (10 dimensions, computed from project state)
2. Timeline visualization (parse outline + chapter files for chronology)
3. Relationship graph visualization (parse relationship data, render with D3 or similar)
4. Export engines (DOCX via docx.js, PDF via jsPDF or similar)
5. Decomposition mode (reverse scaffolding from uploaded text)
6. Drawing board persistence
7. Teaching tips system (contextual help based on current phase/mode)
8. Search across project files

### Step 7: PWA Features (Week 14-16)

1. Service worker for offline support
2. App manifest for installability
3. Background sync for queued LLM requests
4. Push notifications for writing reminders (optional)
5. Responsive design pass for mobile/tablet

### Step 8: Testing and Polish (Week 16-18)

1. End-to-end test: create a complete story from wizard to final chapter
2. Error handling for all failure modes
3. Accessibility audit (keyboard navigation, screen reader, color contrast)
4. Performance profiling (large projects, many chapters)
5. Cross-browser testing (Chrome, Firefox, Safari, Edge)
6. Documentation

---

## 13. Open Questions

These need answers before or during development:

1. **Token budget defaults:** What should the default maximum token budget per chapter generation be? Should we set a per-project budget cap?

2. **Summary generation model:** Should the progressive chapter summaries be generated by the same model doing chapter writing, or a cheaper/faster model?

3. **Decomposition mode priority:** Is decomposition mode part of v1.0, or can it wait for v1.1?

4. **Real-time collaboration:** Is multi-user editing ever in scope? If so, it fundamentally changes the data layer.

5. **Character visualization:** The features doc mentions spider charts and gradient avatars. Are these v1.0 or later?

6. **The Hooked Loop:** The writing habit/streak system. Is this v1.0 or later?

7. **Talk to Character:** This requires the LLM to roleplay as a fictional character. Any guardrails beyond "stay in character and reference the character sheet"?

8. **Silent Writing Assessment:** The passive analysis of user prose style. Is this v1.0? It requires capturing and analyzing user-written text across sessions.

9. **Medium transposition:** The ability to convert a novel outline into a screenplay outline, etc. Is this v1.0 or later?

10. **Pricing model:** Is this a free tool (users pay for their own API keys), a subscription service (we proxy API calls), or a one-time purchase? This affects architecture significantly (server-side proxy vs pure client-side).

11. **Maximum chapter length:** Should the system enforce a maximum words-per-chapter to stay within token limits, or handle arbitrarily long chapters with chunked generation?

12. **Feedback file format:** Should editor feedback use a structured format (JSON-like with line references) or free-form markdown? Structured is better for programmatic application of suggestions but harder to read.

---

*This document is a living plan. Update it as decisions are made and development progresses.*
