# Serendipity Engine PWA — Features & Use Cases

*A comprehensive inventory of every feature, workflow, and capability the application must support, derived from the full Serendipity Engine codebase.*

---

## Use Cases (What Users Do)

### UC-1: Generate a New Story from Scratch

The core workflow. The user runs the full 8-phase pipeline to produce a complete story architecture and then draft prose chapter by chapter.

**Phases:**
1. Seed the engine (datetime-based randomization seed)
2. Create the Author (randomized or self-authored via template)
3. Create the Narrator (type, POV, reliability, voice)
4. Build the World (genre, themes, plot structure, hallmarks, society-as-character)
5. Build the Cast (each character rolled with full attribute suite)
6. Map the Relationships (dynamics, attachment, structures, relationship graph)
7. Build the Story Foundation (ending-first, arc, tonal arc, subplot map, outline)
8. Review against MetaFiles (consciousness theory, network theory, seven deaths, story elements)
9. Cross the Bridge (5 threshold orientation questions)
10. Execute chapter by chapter (per-chapter pre-flight, drafting, post-flight)

**Output:** A complete `Creations/story-{date}/` folder with author.md, narrator.md, abstract.md, outline.md, character files, relationship graph, world-building, arc, and chapter prose.

---

### UC-2: Decompose an Existing Story

Reverse-engineer an existing work (novel, play, screenplay, short story) through the engine's vocabulary. The user provides source text, and the system runs the same phase structure in reverse — inferring attributes rather than generating them.

**Key capabilities:**
- Import/paste source text (full or partial — partial texts get more [INFERRED] tags and speculative arc analysis)
- Run Phases 1–6 as analytical lenses
- Every attribute assignment tagged as [CONFIRMED] or [INFERRED] with reasoning
- Voice fingerprinting from actual dialogue
- Seven Story Deaths audit (more informative in decomposition than generation)
- Big Picture Finding (what was the author trying to say?)
- Phase 7 diagnostic reveals structural gaps, missing threads, and failure modes

**Output:** A complete `Decomposition/story-{title}/` folder mirroring the Creations structure.

---

### UC-3: Create Sequels, Prequels, or Spinoffs

Start from a decomposed work and extend it. This is decomposition + a new/modified author file + expanded characters + new story/POV/narrator.

**Key capabilities:**
- Use a decomposition as the structural floor for a new story
- Create a new or modified author profile (different wound, different Enneagram, different lens)
- Expand the cast — promote catalyst characters to full characters, introduce new ones
- Shift POV to a different character (the same events from a new perspective)
- Sequel: push through the established ceiling — deeper world, further arcs, territory the first story left dark
- Prequel: answer questions the original raised but couldn't answer from inside its own frame
- Spinoff: explore a minor character or unexplored corner of the world
- Revelatory update test: does the new installment make prior installments *more true*, not *differently true*?
- Prequel existence test: can the Big Picture Statement be stated independently of nostalgia?

**Output:** A new `Creations/story-{date}/` folder that references the decomposition as its structural foundation.

---

### UC-4: Compare and Contrast Stories

Decompose two or more works and compare their structural choices side by side.

**Key capabilities:**
- Run decomposition on multiple works
- Compare: author psychology, narrator type, world rules, character archetypes, relationship structures, tonal arcs, plot structures, theme questions
- Surface what levers differ between related works (e.g., *Wizard of Oz* vs. *Wicked*)
- Identify which engine levers produce the transformation between works
- Compare Seven Story Deaths profiles
- Compare network archetype distributions across casts

**Output:** Side-by-side comparison document highlighting structural differences and which engine levers account for each.

---

### UC-5: Change a Story's Genre

Take an existing story (decomposed or generated) and transpose it to a different genre, tonal register, or medium.

**Key capabilities:**
- Preserve the core architecture (characters, wounds, relationships, theme)
- Re-roll or reassign: genre blend, tonal arc, prose style, content rating
- Adjust world-building for the new genre's conventions
- Transpose medium (novel → screenplay → graphic novel → audio drama)
- Narrator adjustments for new medium
- Hallmark adaptation (which survive the genre shift, which need replacement)

**Output:** A new story folder with the transposed architecture.

---

### UC-6: Create / Edit an Author Profile

Build the author as the first character — either through randomization or through honest self-reflection.

**Two modes:**
- **Generated Author (Option A):** Full random roll across identity, personality, development, voice, and craft attributes
- **Real Author / Persona (Option B):** Fill out the author-profile-template.md interactively — answer every field through reflection rather than randomization

**Key capabilities:**
- Interactive questionnaire mode (LLM asks each question, pushes back on vague answers)
- Cascading attribute system (age and gender are root nodes — roll first, everything downstream follows)
- Wound identification (the thing the story will unconsciously be written toward or away from)
- Voice fingerprint generation (speech rhythm, vocabulary register, dialogue tic, metaphor family, defensive pattern)
- Prose style assignment (literary era + cultural tradition + prose voice tendency)
- Big Picture Statement synthesis (written last, governs everything)
- Blind spot identification (what this author cannot see, and how it shapes the story)

**Output:** `author.md` — the complete author profile.

**Silent Writing Assessment:** As the user writes throughout the project (chat messages, manual entries, uploaded drafts, decomposed own work), the system passively analyzes their writing to build a multi-dimensional profile: vocabulary sophistication, sentence complexity, reading level estimate (translated to audience band, not raw score), tonal register, narrative instincts (plot-first vs character-first vs theme-first), confidence markers, and genre fluency. This profile quietly enriches `author.md`, calibrates the Editor's feedback level, and sets complexity defaults. Never surfaced as a grade — presented only as neutral description ("your vocabulary register is conversational to literary") when the user opts to view it. Every dimension is overridable. A global profile accumulates across projects enabling long-term growth tracking.

---

### UC-7: Build a Character

Roll or design a single character with the full attribute suite, independent of a story context. Useful for character exploration, writing exercises, or pre-building cast members.

**Attribute categories:**
- Identity: age, gender, religion/faith, life status, sexuality, life philosophy, emotional register, zodiac
- Personality: MBTI type (with Assertive/Turbulent), Enneagram (with wing), moral alignment
- Development: character type, physical description, core flaw/virtue/wound, values/code/self-care
- Voice: speech rhythm, vocabulary register, dialogue tic, metaphor family, defensive speech pattern, subtext default
- Name: from multicultural name lists (feminine, masculine, neutral)
- Network archetype: Pioneer, Optimizer, Generalist, or Exploiter
- Antilife Seals carried unconsciously
- Stream A (private self) vs. Stream B (social self) conflict

**Output:** A complete character file.

---

### UC-8: Build a Relationship Graph

Map every significant relationship in a story — dynamics, attachment styles, power structures, and perception.

**Key capabilities:**
- Three-tiered graph: major characters (full), minor characters (sparse, load-bearing cells only), societies/groups (collective voice)
- Per-pair: relationship type, dynamic, structure, attachment style pairing
- Each cell written in that character's voice — how they perceive the other at the story's close
- Blank cells as structural data (characters who never interact)
- Automatic conflict detection from attachment pairings (e.g., Anxious + Avoidant = push-pull)
- Society entries: governing bodies, oppressed peoples, institutions as pressure systems
- Update tracking across chapters (relationship phase-shifts logged per chapter)

**Output:** `relationship-graph.csv` + `relationships/questions-answered.md`

---

### UC-9: Build a World

Design a complete story world — genre, rules, society, themes, hallmarks, scenery, and calendar.

**Key capabilities:**
- Genre blending: roll 3 distinct sublists for primary + secondary + tonal blend
- Theme as a question (not a statement)
- Plot structure selection (Three-Act, Hero's Journey, Save the Cat, Story Circle, etc.)
- Narrative technique selection (78 techniques across 8 groups)
- Plot twist architecture (47 types across 7 categories)
- Society as Character (role, want, wound, flaw, cost, enforcement)
- World hallmarks (5-15 elements that escape the text: objects, places, forces, mechanics, symbols, events)
- Poster test, recurrence test, theme test for hallmark qualification
- Scenery at three scales: world-level terrain/climate, climate as pressure, scene-level detail
- Time span, seasons, holidays, calendar markers
- Antilife Seal audit (which seals are present by design vs. accident)

**Output:** `world/world-building.md` + `world/hallmarks.md` + `world/questions-answered.md`

---

### UC-10: Design a Story Arc and Outline

Build the story's structural backbone — ending-first, then work backward.

**Key capabilities:**
- Know the ending first (final image, protagonist's final state)
- Title, abstract, short description (pitch-facing)
- Story arc mapped against chosen plot structure
- Tonal arc across acts/chapters (opening tone → designed departures → closing tone)
- Subplot map (opening event, theme echo, resolution/decay point)
- Chapter-by-chapter outline with: goal, dominant tone, active/critical/resolved threads, scene metadata
- Subproblem stack management (threads that converge, threads that resolve, threads that remain open)
- Per-chapter scene metadata: location, interior/exterior, time of day, season, setting's active function

**Output:** `abstract.md` + `story/arc.md` + `outline.md`

---

### UC-11: Draft and Execute Chapters

Write prose chapter by chapter with full structural support.

**Key capabilities:**
- Pre-flight continuity check (what changed last chapter, what this chapter inherits)
- Character consistency check per character per chapter (voice, want vs. need, flaw in action, personal code, self-care under stress, continuity of knowledge)
- Scene-level checks during drafting (correlation test, scene loop, voice, narrator reliability)
- Tonal drift check (after any gap between sessions)
- Voice differentiation spot-check (can you tell speakers apart without tags?)
- Post-flight forward continuity check (handoff note, relationship graph updates, thread state updates)
- Chapter notes file (separate from prose — production metadata, not reader-facing)

**Output:** `story/chapter-{n}.md` (prose only) + `story/chapter-{n}-notes.md` (production notes)

---

### UC-12: Run the Full MetaFiles Review (Phase 7 Diagnostic)

Audit a story against all three theoretical pillars and the story elements framework before drafting.

**Checks:**
- Consciousness Theory: Stream A/B tension per character, I-Thread coherence, weighting shifts, developmental stages, scene loop verification
- Network Theory: world-as-organism, four archetype functions distributed, theme resonance across 6 domains, subproblem convergence
- Seven Story Deaths: per-seal status (accidental vs. deliberate), fractal check (same seals at individual/relationship/community/institutional/societal scale), antagonist seal emergence
- Story Elements: all 7 elements active (theme, characters, setting, plot, conflict, POV, style), conflict at multiple levels, POV wound shaping perception, style-theme relationship
- Relativism check: could the antagonist be read as protagonist from a different configuration?
- Resonance final check: theme question present in at least 4 of 6 domains

**Output:** `story/metafiles-review.md`

---

### UC-13: Dry Run Audit (Post-Generation System Review)

After completing a full generation run, audit how the engine itself performed.

**Key capabilities:**
- Flag critical issues, design issues, improvements, and observations
- Track which "strange results" the system produced and whether keeping them was generative
- Identify missing protocols, mid-process gaps, and calibration needs
- Document what the "keep strange results" rule produced
- Recommendations for engine refinement

**Output:** `dry-run-audit.md`

---

### UC-14: Editor Review (QA and Craft Improvement)

A separate LLM session that acts as a professional story editor — checking consistency, catching drift, and deepening the craft across chapters and the full manuscript.

**Key capabilities:**
- Separate LLM session (fresh context, no Author bias)
- Reads all architecture files as source of truth before every review
- 4-pass review system: consistency → structural integrity → quality/craft → deepening
- Cross-chapter consistency checking (voice drift, timeline, knowledge continuity, relationship accuracy)
- Multi-pass Author ↔ Editor revision loops (configurable 1-6 passes)
- 4 approval modes: auto-approve, per-chapter, per-story-arc batch, multi-pass deep edit
- Structured review reports with severity levels (critical / warning / suggestion / deepening)
- Diff view showing proposed changes
- Issue tracker across all chapters

**Output:** Per-chapter review reports, revised chapter files, issue tracker log

---

### UC-15: Audience-Based Editor Personas

Generate fictional reader personas based on the target audience, then review the story through each persona's eyes.

**Key capabilities:**
- Auto-generate 3-5 reader personas from: intended audience, genre, theme, content rating, Big Picture Statement
- Each persona has: name/age, life situation, why they picked up this book, what resonates, what won't make sense, what will lose them, what they're reading for
- Multi-persona review: each persona reviews independently, produces their own report
- Pick-and-choose: accept individual suggestions from any persona
- YOLO Mode: accept all suggestions from all personas at once
- Custom personas: create your own (beta reader, agent, sensitivity reader, etc.)
- Persona-informed generation: Author LLM reads audience file during chapter generation
- Dismiss or add personas at any time

**Output:** `audience.md` + per-persona review reports

---

## Feature Categories (What the App Provides)

### F-1: Randomization Engine

- Datetime-based seed generation (YYYYMMDDHHM → 12-digit integer)
- 3-digit window extraction with mod N + 1 for any list size
- Seed multiplication for >4 rolls (seed × roll_number, last 12 digits)
- Weighted rolls (d10 threshold → pool selection → roll within pool)
- Seed recording and reproducibility (same seed = same story)
- Roll logging (every roll recorded with source file, window used, result)
- "Keep strange results" encouragement — anti-regression nudge for structural attributes (wound, flaw, virtue, personality), frictionless re-roll for aesthetic attributes (names, zodiac)
- **Roll/Choose/Import Pattern** — universal 5-mode input for every generated attribute: Random, Guided (filtered by genre/culture/era/cascade), Re-Roll (with scrollable history strip), Write In (manual entry with autocomplete), Import (from decomposed data with CONFIRMED/INFERRED tags)
- Batch cast generation with per-attribute-type mode defaults
- Decomposition preload — start character creation from a decomposed cast

---

### F-2: Cascading Attribute System

- Dependency graph visualization (which attributes influence which)
- Root nodes identified (age, gender, world period)
- Primary cascades (upstream → downstream)
- Secondary cascades (personality systems)
- Bidirectional loops (attributes that influence each other)
- Multi-output nodes (single attribute affecting many downstream)
- Recommended 14-step roll sequence
- Conflict detection: productive tension vs. illogical contradiction
- Past-state → current-state resolution for contradictions

---

### F-3: Reference Library

All reference files accessible, searchable, and linkable within the app:

**Character references:**
- Gender identities (141 options)
- Sexuality/orientation (43 options)
- Religion/faith (90 traditions)
- Life philosophy (Western, Eastern, Modern categories)
- Life status (relationship, parental, living, financial)
- Emotional register (21 primary registers)
- MBTI types (16 types with A/T variants)
- Enneagram types (9 types with wings)
- Moral alignment (9 alignments + Unaligned)
- Character types (protagonist, antagonist, supporting, catalyst, extras)
- Physical description (age, build, height, hair, eyes, skin, face, features, posture, style)
- Flaws, virtues, and wounds (categorized lists)
- Values, personal code, self-care mechanisms
- Character voice components (speech rhythm, vocabulary, tics, metaphors, defensive patterns, subtext)
- Names (feminine, masculine, neutral — multicultural lists)
- Zodiac signs and birthstones

**Story references:**
- Genres (12 sublists, categorized)
- Narrative techniques (78 techniques, 8 groups)
- Plot structures (7 core structures + scene-level framework)
- Plot twist types (47 types, 7 categories)
- Themes and tropes (8 core theme clusters + 4 trope categories)
- Narrator types (reliability, perspective, position, voice/tone)
- Story elements (7 interdependent dimensions)
- World hallmarks (6 categories, 3 qualification tests, 9-field entry format)
- Scenery (3 scales: world, climate, scene-level)
- Time and calendar (time span, seasons, holidays, drift management)
- Prose styles (11 literary eras + regional traditions + voice tendencies)
- Tonal control (14 tone types, arc design, drift check, failure modes)
- Language and content (5 content ratings, profanity tiers, banter patterns)

**Theory references:**
- Story Consciousness Theory (Stream A/B, I-Thread, ensemble, scene loop, developmental stages)
- Story Network Theory (world-as-organism, impossibility theorem, 4 archetypes, resonance structure)
- Seven Story Deaths (7 seals as diagnostic, conflict engine, and antagonist architecture)

---

### F-4: Interactive Questionnaire System

Every `questions.md` file in the system represents a structured interview. The app should present these as interactive question flows:

- MetaFiles/questions.md — Author questions (identity, life stage, relationships, worldview, writing identity)
- Characters/Questions.md — Cast-level questions (protagonist ID, load-bearing check, power hierarchy, reader response prediction)
- Characters/Identity/questions.md — Per-character identity questions
- Characters/Personality/questions.md — Per-character personality questions
- Characters/Development/questions.md — Per-character development questions
- Characters/Names/questions.md — Per-character naming questions
- Relationships/questions.md — Per-pair relationship questions
- Story/questions.md — Story-level questions (core, genre, conflict, structure, narrator, subplots)
- Story/World Building/questions.md — World-building questions (rules, power, environment, technology, culture, history, composition)

---

### F-5: Project Management

- Multiple projects (stories) managed simultaneously
- Each project is a complete folder structure (Creations/ or Decomposition/)
- Phase progress tracking (which phases are complete, which are in progress)
- Checklist state persistence (checkbox status saved across sessions)
- File creation automation (create the right files in the right locations as each phase completes)
- Session history and seed tracking

---

### F-6: Relationship Graph Builder

- Visual relationship matrix (CSV-based, expandable)
- Three tiers: major, minor (sparse), society/group
- Per-cell editing in character voice
- Automatic conflict detection from attachment style pairings
- Update tracking across chapters (which cells changed, when)
- Export to CSV
- Visual graph/network diagram view (optional enhancement)

---

### F-7: Structural Diagnostic Tools

- Seven Story Deaths audit (per-seal scoring, fractal check)
- Story Consciousness Theory check (Stream A/B per character, I-Thread, scene loop)
- Network Theory check (archetype distribution, theme resonance, subproblem convergence)
- Story Elements check (7 dimensions active)
- Cast collision check (no duplicate MBTI + wound + flaw combinations)
- Voice differentiation check (can speakers be distinguished?)
- Tonal drift check (after gaps between sessions)
- Resonance check (theme question across 6 domains)

---

### F-8: Chapter Execution Support

- Pre-flight checklist per chapter (continuity, character consistency)
- During-drafting checks (scene correlation, scene loop, voice, narrator, drift)
- Post-flight checklist per chapter (forward continuity, relationship updates, thread states)
- Chapter notes file management (separate from prose)
- Handoff notes between chapters
- Running chapter checklist log
- Subproblem thread state tracker (dormant → active → critical → resolved)

---

### F-9: Export and Output

- Complete story folder export (all files as a package)
- Individual file export (any single output file)
- Relationship graph export (CSV)
- Chapter prose export (clean, no production metadata)
- Full project archive (for reproducibility — includes seed, all rolls, all files)

---

### F-10: LLM Integration

The system is designed to work with an LLM collaboratively. The app should support:

- Phase-by-phase guided execution (LLM rolls, selects, synthesizes, produces output files)
- Interactive author interview mode (LLM asks questions from the template, pushes back on vague answers, compiles into author profile)
- Structural editing mode (paste draft, run decomposition, surface gaps)
- Voice coaching (given a character's voice fingerprint, evaluate whether dialogue matches)
- Diagnostic mode (run Phase 7 checks and report findings)
- Draft generation (given complete architecture, produce first-pass chapter prose)

---

### F-11: Template and Blank State Management

- Author profile template (for Option B — real author)
- Relationship graph template (blank CSV with instructions)
- Character file template (full attribute structure)
- Chapter notes template (before/during/after sections)
- New project wizard (creates folder structure, seeds engine, begins Phase 1)
- Decomposition wizard (imports text, creates folder structure, begins Step 0)

---

### F-12: Content Rating and Safety

- Story-level content ceiling (G / PG / PG-13 / R / 18+)
- Per-character language register (at or below ceiling)
- Profanity tier tracking (mild / moderate / strong)
- Content boundary enforcement (no character crosses the story ceiling)
- Banter pattern assignment per character (1-2 patterns as conversational default)

---

## Workflow Modes (How Users Enter the App)

| Mode | Entry Point | Pipeline |
|---|---|---|
| **New Story** | "Start from scratch" | Seed → Phase 1–8 |
| **Decompose** | "Analyze an existing story" | Import text → Phases 1–6 in reverse |
| **Sequel / Prequel / Spinoff** | "Extend a decomposed story" | Select decomposition → modify author → expand cast → new Phases 3–8 |
| **Compare** | "Compare two stories" | Select 2+ decompositions → side-by-side structural comparison |
| **Genre Shift** | "Change a story's genre" | Select existing story → Shift Dashboard → Preview Impact → fork + guided revision of affected architecture |
| **Medium Transposition** | "Adapt to a different medium" | Select existing story → choose new medium from format catalog → Transposition Report with translation options → fork + restructure |
| **Combined Shift + Transposition** | "Reimagine in a new genre and medium" | Both analyses merged into compound impact report |
| **Author Only** | "Build an author profile" | Phase 1 only (random or self-authored) |
| **Character Only** | "Build a character" | Phase 4 per-character block only |
| **World Only** | "Build a world" | Phase 3 only |
| **Relationship Map** | "Map relationships" | Phase 5 only |
| **Outline Only** | "Build a story outline" | Phase 6 only (requires existing author + world + cast) |
| **Diagnostic** | "Audit my story" | Phase 7 checks against existing architecture |
| **Draft** | "Write chapters" | Phase 8 against existing architecture |
| **Edit** | "Review and improve my chapters" | Phase 9 Editor (separate LLM) against architecture files |
| **Workshop** | "Interactive writing session" | LLM-guided interview + generation across any phase |
| **Reverse Scaffold** | "I have a rough draft" | Upload chapters → reverse-decompose into architecture → review [INFERRED] → fill gaps → assess health → Editor |
| **Analyze / Learn** | "Teach me about this story" | Decompose → Structural Tour (8-stop teaching walkthrough, read-only) |
| **Chat** | "Talk about my story" | Open conversation with Story Assistant, Editor, or a Character |
| **Sandbox** | "What if I changed...?" | Per-file what-if copy or full project fork for experimentation |

---

## Use Cases Added Since Initial Inventory

### UC-16: Reverse Scaffolding (Architecture from Rough Draft)

Upload an existing rough draft and have the system reverse-engineer the architecture files from the prose. Every attribute is tagged [INFERRED]. The user reviews, corrects, and fills gaps before proceeding to Editor review.

### UC-17: Chat with Characters

Talk to any character from the project in a freeform conversation. The AI loads the character's full profile and speaks as them. Discoveries that emerge during conversation (backstory, world details, relationship insights) can be captured into architecture files with user approval.

### UC-18: Structural Tour / Teaching Mode

Decompose a story and walk through an 8-stop guided analysis (Author's Wound → Narrator's Lens → World → Characters → Relationships → Seven Deaths → Arc/Theme → Open Questions). Read-only teaching experience for students, book clubs, and curious readers.

### UC-19: Character Visualization

Spider/radar chart per character showing 8 psychological axes (Stream A/B, Self-Awareness, Emotional Expression, Wound Integration, Theory-Gating, Good/Evil, Vulnerability, Order/Chaos). Arc overlay shows start vs. end state. Cast overview grid, compare mode, SWOT breakdown.

### UC-20: Sandbox / Fork Mode

Experiment without risking the main project. Per-file what-if copies for small experiments; full project forks for major direction changes. Compare, promote, discard, or merge back.

---

## Feature Categories Added Since Initial Inventory

### F-13: Chat / Conversation System

Three chat personas: Story Assistant (general helper with project context), Editor Chat (distinct dark/orange UI, direct and unsparing), Talk to a Character (character speaks in-voice, suggests architecture additions). Four context scopes: full project, this file, this phase, freeform.

**Talk to a Character — Workshop Mode:** Scene interrogation ("what were you thinking when…"), arc reflection (character speaks about own growth), motivation mining ("why did you lie to…"), what-if exploration (hypothetical branching), out-of-story commentary (character steps outside the narrative frame like a DVD commentary). Scene-anchored conversations let the user pin a character to a specific chapter/scene so they only know what's happened up to that point — talking to the same character at Chapter 1 vs Chapter 8 reveals arc progression from the inside.

**Character Guide Mode:** Toggle that activates a persistent protagonist (or chosen character) companion voice throughout the building process. The guide comments in-character on world-building decisions, new cast members, plot structure, and editing — non-blocking speech bubbles that add flavor and deepen the user's relationship with their protagonist. One-click enable/disable. Requires at least one character with sufficient profile depth.

**Cast Roster — IMDB Panel:** Always-accessible tab in the Left Nav showing all characters grouped by tier (Main Cast / Supporting / Minor). Each character displays an avatar badge (initials or uploaded image), role, wound, arc progress bar, and quick-action buttons (Talk, File). Optional relationship lines overlay. Dragging characters between tiers triggers development prompts. Entry point for Talk to a Character conversations.

### F-14: LLM Connection / Model Selection

First-time setup: API key entry or SSO/OAuth. Multi-provider support (Anthropic, OpenAI, Google, local/self-hosted). Multiple simultaneous connections. Three assignment tiers: Simple (one model), Standard (4 roles), Granular (every task independently assignable). Mid-project switching with audit trail. Context/compaction delegated to each model. See also F-25: Multi-LLM Plug and Play.

### F-15: Terms of Use / License

First-launch acceptance screen. License terms (free for creative use, commercial license for products, users own their stories). Acceptable Use Policy (anti-academic-dishonesty, not a homework tool).

### F-16: Storage / Data Persistence

No server-side database. All data in browser local storage (IndexedDB / File System Access API). Projects as plain markdown folders. Download/upload .zip for portability. Optional Git-based version history for self-hosted installations.

### F-17: Character Visualization System

8-axis spider chart per character. Arc overlay (start → end state). Cast overview grid. Compare mode (overlay multiple characters). SWOT breakdown. Network archetype badges. Accessible alternatives (tables, screen reader text).

**Axis Color Theory:** Each axis has a color-psychology-informed hue (Violet for Stream A/B, Gold for Self-Awareness, Rose for Emotional Expression, Teal for Wound Integration, Sky Blue for Theory-Gating, Emerald for Good/Evil, Amber for Vulnerability, Slate Blue for Order/Chaos). Colors spaced around the color wheel for harmonic blending.

**Gradient Avatars:** Character's top 2-3 dominant axes generate a gradient avatar used everywhere in the UI (Cast Roster, file tree, relationship graph, chapter headers, guide mode, chat). Two dominant axes → two-color diagonal gradient. Three dominant → two-color gradient with third-color border ring. Arc-aware hover animation shifts gradient from start-state to end-state. Manual override available.

### F-18: Silent Writing Assessment

Passive analysis of user writing from all input channels (chat, manual entries, uploaded drafts, decomposed own work). Multi-dimensional profile: vocabulary sophistication, sentence complexity, reading level (audience band), tonal register, narrative instincts, confidence markers, genre fluency. Feeds into author.md enrichment, Editor calibration, and complexity defaults. Never displayed as a grade. Optional user-initiated reveal with neutral language. Per-project profiles with global accumulation. Every dimension overridable. Long-term growth tracking via Writing Journey in settings.

### F-19: Emotional & Somatic Vocabulary System

Two reference lexicons: `Characters/Development/emotions.md` (1,100+ emotions in 5 categories: core, complex/cognitive, social/interpersonal, states of being, virtues/vices) and `Characters/Development/sensations.md` (120+ physical sensations in 8 categories: pain, fatigue, thermal/tactile, hunger/thirst, kinesthetic, respiratory, sexual, somatic).

**Character Emotional Palette:** 3-tier system per character — Home (8-12 default emotions), Stretch (6-10 arc-accessible emotions), Blocked (4-8 wound-sealed emotions). Auto-generated from wound, emotional register, MBTI, enneagram. Fully editable. Author LLM enforces palette constraints; Editor flags violations.

**Somatic Signature:** Per-character mapping of emotions to physical sensations (e.g., fear → coldness + numbness + held breath). Includes wound echo (recurring physical sensation when wound activates). Grounds prose in the body ("show don't tell"). Editor checks for somatic drift and consistency.

**Relationship Emotional Dynamics:** Per-pair emotional texture — dominant emotions when together, each character's physical tell pattern, conflict triggers, arc trajectory for how the dynamic evolves.

**Scene Emotion Layer:** Per-scene metadata — dominant emotional atmosphere, emotional shift across the scene, which character carries the shift, somatic anchor for the scene.

**Arc Emotion Tracking:** Timeline visualization of each character's emotional range expansion/contraction across chapters. Editor uses this to flag stalled arcs or implausibly rapid emotional growth.

**Emotion Wheel Picker:** Hierarchical drill-down UI for selecting emotions at any EQ level. Level 1 = 6 core emotions (Joy, Sadness, Anger, Fear, Disgust, Love, Surprise) as color-coded wedges. Level 2 = 6-12 intensity/flavor variants per core emotion with hover descriptions. Level 3 = full lexicon granularity (1,100 entries). Supports compound emotion blends (primary + secondary with natural-language interpretation), upward/sideways traversal, neighbor exploration, and search-bar fallback for power users. Default is always "let the engine decide" — the picker is for overrides and guidance, never mandatory. Appears everywhere emotions are selected: palette editor, scene metadata, relationship dynamics, chapter review overrides, Talk to a Character, tonal arc designer.

**Sensation Picker:** Same drill-down pattern for physical sensations — Level 1 = 8 body systems, Level 2 = specific sensations within each. Used in somatic signature editor and emotion-to-body mappings.

**Integration:** Feeds into spider chart (Emotional Expression axis), voice fingerprint (somatic style), tonal arc (emotional vocabulary per beat), Talk to a Character (physical feelings during conversation), decomposition (extracting palettes from existing prose), and Silent Writing Assessment (user's emotional vocabulary range).

### F-20: Genre Shift & Medium Transposition

**Genre Shift:** Changes genre/tonal register while keeping the medium. Shift Dashboard shows current vs. target with adjustable levers (primary genre, secondary genre, tonal blend, content rating, themes). Preview Impact produces file-by-file impact report showing what changes in every architecture file. Creates a fork, then walks user through guided revision of affected files. LLM proposes specific changes; user accepts/modifies/rejects each.

**Medium Transposition:** Changes the delivery medium while preserving narrative content. Transposition Dashboard shows structural differences between mediums. Transposition Report identifies what translates directly, what needs creative translation (with multiple solution options per problem — narrator handling, internal monologue strategy, structural unit mapping), and format metadata updates. Creates a fork, restructures outline to new structural units, regenerates scene metadata.

**Combined:** Both operations can run simultaneously for compound transformations. Merged impact report.

**Transposition Catalog:** Internal knowledge base mapping how storytelling elements (internal monologue, prose description, POVs, time jumps, subtext, world-building, character voice, emotional palette) translate between mediums (novel ↔ screenplay ↔ stage play ↔ podcast ↔ etc.).

### F-21: Format-Aware Export

Export system reads project format metadata (medium, formatType, outputTemplate, structuralUnit) and automatically applies the correct industry template. Prose mediums get manuscript formatting; screenplays export as .fountain + .pdf with proper scene headings and dialogue blocks; stage plays get Samuel French standard; podcasts get audio script format with SFX cues; interactive fiction exports to Twine/Ink. Medium-specific formatting options in export dialog (e.g., scene numbers and revision color pages for scripts, SFX lists for audio, choice maps for interactive). New export formats: .fountain, .ink, playable HTML.

---

## Edge Cases and Special Behaviors

- **Graphic & Visual sublist roll:** If rolled during genre selection, assign as FORMAT (graphic novel, manga, etc.) and re-roll the genre slot from a different sublist
- **Conflict resolution:** Productive tension (hold both attributes) vs. illogical contradiction (treat as past → present transition)
- **Catalyst characters:** Thumbnail format only — no full attribute suite. Promote to full if they become load-bearing during drafting.
- **Extras / NPCs:** Minimal format. Promote if they gain narrative weight.
- **Re-rolls:** Only permitted when a coherence check in a list file forces it. Use next available seed window. Log the rejected result — the reason it was rejected is characterization.
- **The forbidden name:** "Claude" must never be used as any named entity in the system.
- **Societies as characters:** Not individuals — collective entities with role, want, wound, flaw, cost, enforcement. Appear in relationship graph with `(society)` suffix.
- **Dead or departed characters in relationship graph:** Write cells in the voice of their final known state.
- **Tonal drift after session gaps:** Run the 5-step drift check before resuming any chapter.

### F-22: Feedback File System

Versioned `.md` files in a `feedback/` project folder. Three source types: **Editor (Simulated)** — auto-generated by Editor LLM during review passes, saved as `editor-v{N}.md`; **External** — uploaded by user from beta readers, writing groups, agents, workshops, reformatted into standard template, saved as `external-v{N}.md`; **Author (Self)** — user's own revision notes with quick-capture (highlight + shortcut), saved as `author-notes-v{N}.md`.

All feedback files share a standard format: source label, version, date, scope, summary, chapter-level notes, cross-cutting issues, strongest moments, recommended priorities. Version progression tracks improvement across rounds. Recurring flags auto-surface issues that persist across multiple sources and versions. Editor LLM reads all prior feedback files before generating new reviews; Author LLM can optionally read feedback to preemptively address known issues.

### F-23: Scene Dynamics Forecast

Pre-chapter analysis of all character states (emotional palette positions, somatic states, relationship dynamics, active subproblem threads, arc positions) to predict probable emotional collisions and collaborative moments. Identifies highest-tension pairings, maps 2-4 probable paths (like relationship simulation branching), flags arc opportunities (Stretch emotion unlocks, relationship shifts), and highlights wound triggers. Intelligence, not instruction — the Author LLM uses the forecast as context but the user/LLM chooses the path. Overridable.

### F-24: Reader Experience Report

Post-chapter analysis of what the audience will experience. Measures pacing shape (sprint/slow burn/choppy with visual waveform), estimated read time, emotional trajectory (sequence of dominant reader emotions), dialogue-to-narration-to-internal ratio, information density (revelations per chapter), character presence (screen time distribution), and audience persona-specific notes. Uses natural language descriptions ("this is a fast read," "choppy because the characters are dealing with X"). Not a craft review (that's the Editor) — a reading experience simulation.

### F-25: Multi-LLM Plug and Play

Multiple simultaneous LLM provider connections. Three assignment modes: Simple (one model does everything), Standard (4 core roles: Content Generation, Editing & Review, Chat & Conversation, Analysis), Granular (every distinct task assignable independently — chapter drafting, world-building, consistency check, character chat, decomposition, etc.). Mid-project model switching with audit trail (`<!-- Generated by: model-name | date -->`). Context/compaction delegated to each model's native capabilities. Architecture files are the persistent memory layer.

### F-26: Active Deconstruction (Grammarly Layer)

Real-time analysis of user writing across multiple layers: grammatical/syntactical (surface underlines), voice consistency (tense shifts, voice fingerprint violations, vocabulary register drift), story-structural (scenes without emotional shift, tension peak placement, stalled subproblem threads), thematic incongruence (Big Picture Statement vs. chapter content, dropped hallmarks), and character behavioral (wound-inconsistent actions, voice differentiation failures). Non-blocking, context-sensitive annotations. Surfaces in text underlines (grammar), Teaching Tips sidebar (voice/structure), and Reader Experience Report (deeper issues).

### F-27: Conversational Teacher Persona

Optional toggle that transforms Teaching Tips from static cards to a conversational mentor voice. Asks open questions to draw out depth ("You said Marcus is 'angry.' But at who?"). Every answer feeds directly into architecture files — conversation as data-gathering. Active at any point (guided flow, chapter review, file editing). Never gives answers, only draws them out.

### F-28: Voice Casting System

Generates detailed voice casting briefs for narrator and every character, derived from narrator.md, author.md, character voice fingerprints, emotional registers, and cultural backgrounds. Briefs describe gender/presentation, tone, pacing, register, emotional range, accent, verbal tics, and reference comparisons. "Copy as Prompt" formats for TTS services (ElevenLabs, OpenAI TTS). Exportable cast voice sheet (.md or .pdf) for audiobook producers and podcast teams.

### F-29: Simple vs Advanced Mode

Mode selector before onboarding wizard. Simple Mode: 3-step wizard (pick format from simplified list, describe story in freeform text, choose guided or freeform workspace). Engine infers genre/tone/themes/cast from description, fills architecture with smart defaults. Advanced Mode: full 8-step wizard with all 43+ formats, cast size planning, series options, scope, etc. Mode affects workspace too: Simple shows friendlier labels, more teaching, fewer raw scores, granular controls behind "Show more" toggles. Switch anytime in Settings. No data loss when switching.

### F-30: Story Timeline (Unified View)

A synchronized horizontal timeline that compiles story beats, character arcs, relationship dynamics, emotional weather, subproblem threads, tonal arc, Reader Experience Reports, and Scene Dynamics Forecasts into one view. Each data dimension is a toggleable swim lane. Shows plan (from architecture) vs. reality (from drafted chapters) with divergence highlighting. Convergence detection highlights chapters where multiple critical moments align. Includes relationship strength graphs, arc comparison overlays, and zoom/minimap for long stories. Populates progressively as the project grows.

### F-31: Visual Reference System (Photos & Mood Boards)

Character photo upload replaces gradient avatar fill while preserving gradient as border ring — maintaining psychological color identity with user's chosen visual. Mood board images can be pinned to hallmark entries in `world/hallmarks.md` (objects, places, symbols) and to location entries in scene metadata. All images stored locally in a `media/` project subfolder, included in .zip exports. Not an image generation system — users bring their own reference images.

### F-32: Unified Settings Page

All user-configurable options consolidated into a single settings page (see `pwa-settings-wireframe.md`). Eight categories: General (mode, appearance, theme), AI Models (providers, role assignment, audit trail), Workspace (auto-save, file management, backup reminders), Writing (teaching, tools, TTS, content rating), Editor (approval modes, passes, personas, feedback files), Privacy & Data (storage, API key security, data export/delete), Writing Profile (silent assessment, writing journey), About (version, terms, shortcuts). Accessible via gear icon, `Ctrl/Cmd + ,`, or command palette.

### F-33: Writing Habit System — Hooked Loop (Future State, Opt-In)

Deferred to post-v1. Applies Nir Eyal's Hooked model to creative writing retention. Four phases: Trigger (gentle notifications with in-character protagonist voice), Action (one-click resume, daily micro-prompts, session goals), Variable Reward (character reactions, health rating movement, Reader Experience snippets, milestone celebrations), Investment (architecture depth as stored value, writing profile growth, character relationship investment). Entirely opt-in, off by default, no streak guilt, no gamification, no dark patterns. Duolingo-inspired but adapted for long-form creative work.

### F-34: Project Health System (Replacing Letter Grades)

Professional assessment scale replacing school-style letter grades. Six-level rating system: Just Started → Needs Work → Developing → Good → Strong → Exceptional. Each rating paired with a colored fill bar (amber-to-green gradient, no red). Overall project health plus 10 scoring dimensions (Author Depth, Narrator Clarity, World Integrity, Character Depth, Relationship Architecture, Story Structure, Theoretical Alignment, Voice Consistency, Conflict Depth, Theme Resonance). Expandable drill-down on each dimension reveals sub-factors pulling the rating up or down with specific actionable suggestions and jump-to links. "Needs Your Attention" queue highlights 2-3 lowest areas. Ratings always presented in context: "Work so far: Good" not bare labels. Accessible from right sidebar, top bar badge, Project Hub cards, and `Ctrl/Cmd + G`. Replaces all former letter grade (A+ through F) references throughout the system.

### F-35: The Drawing Board (Freeform Workspace)

A spatial canvas for unstructured ideas that don't yet fit into the architecture — text notes, uploaded images, rough drafts, research snippets, mood board items, web clippings. Items can be grouped, rearranged, and viewed as Board (spatial), List (chronological), Gallery (images), or Unlinked (items not yet connected to architecture). The key feature is "Used In" connection tracking: every item shows where it ended up in the architecture (e.g., "Used in: → characters/marcus.md (wound, flaw)") or "Not yet used" as a gentle nudge. Items can be dragged directly into architecture files. The system suggests connections. Quick-add shortcut (`Ctrl/Cmd + Shift + N`) works from anywhere. Stored in a `drawing-board/` project subfolder, included in .zip exports but never in manuscript exports.

### F-36: Submission Target (Planning-Stage Formatting)

An optional question during the Onboarding Wizard (after medium selection) that captures where the story is going: Publisher/Agent (traditional manuscript formatting, Shunn standard), Self-Publishing (flexible formatting, ISBN/copyright/back matter prompts), Contest/Workshop (anonymization, word count constraints), Studio/Production (spec vs. shooting script), or Personal/No Target. Set once, changeable in Settings. The key benefit: by knowing the target before chapters are generated, the Author LLM calibrates prose to match industry expectations from the start — not just reformatting at export time.

### F-37: Session Changelog

Automatic capture of what changed during each working session. When the user returns, the Welcome Back card includes a structured summary: what they did (phases completed, characters created, decisions made), how the story changed (health rating delta with per-dimension breakdown), files modified (created/changed/deleted), and what still needs attention (unresolved flags, incomplete phases). Rolling history of last 30 sessions per project. Generated automatically at session end with no user action required.

### F-38: External Feedback → Health Mapping

Extension of the existing feedback file system to map external reader notes to Project Health dimensions. When external feedback is uploaded (beta readers, agents, writing groups), the system can optionally map flagged issues to health dimensions (e.g., "three readers flagged Marcus as flat" → Character Depth). External feedback doesn't change ratings automatically — it adds a "flagged by external reader" indicator alongside the system's own assessment. Date-based file naming supported (`external-2026-04-01.md`) alongside sequential versioning.

### F-39: Word Count Guardian

Live word count displayed in the workspace status bar, calibrated against the word limit derived from the Submission Target (e.g., 70,000 for a standard novel). When the manuscript is under the limit, the counter displays normally. When the count exceeds the limit, the counter turns red with a warning icon and shows the overage (e.g., "72,450 / 70,000 words (+2,450 over)"). Clicking the red counter opens the Story Assistant with a pre-loaded prompt to help the author identify passages to trim — analyzing scene-by-scene word distribution, flagging overwritten passages, suggesting condensable dialogue, and highlighting sections that could be cut without structural damage. The word count is always accurate against the actual manuscript files, not estimated.

### F-40: Platform Ladder — VS Code Extension → PWA → Mobile

Three-stage delivery strategy. **Stage 1: VS Code Extension** — ships first, leveraging VS Code's native file tree, search, Git version history, diff viewer, settings infrastructure, themes, and Live Share collaboration. Custom webview panels built in React + TypeScript handle the Serendipity-specific UI (Guided Flow wizard, Cast Roster, Relationship Graph, Story Timeline, Emotion Wheel, Editor review, Story Assistant chat). A shared TypeScript engine library encapsulates all story generation logic, phase pipeline orchestration, and data transformations — importable by both the extension and the future PWA. **Stage 2: PWA** — adds Simple Mode onboarding, full Reader Mode with paginated layout and ambient audio, mobile-responsive design, offline-first via IndexedDB, and the Writing Habit System. Wrappable with Tauri for native desktop distribution. **Stage 3: Mobile Apps** — Capacitor wrapping of the PWA, focused on reading/reviewing, light editing, Talk to a Character, and push notifications for the Hooked Loop triggers.

### F-41: Story Universe — Series, Sagas, and Connected Works

A hierarchical container system that lets stories exist within larger narrative structures. Three levels of organization:

**Level 1: Universe** — The highest container. A shared reality that all connected works inhabit. Has its own world-building bible, master timeline, universal rules, and a canonical character registry. Example: "Middle-earth", "The Westeros Universe", "The Shunning Season Universe." A Universe owns a `universe.md` manifest defining the shared reality, a `universe-timeline.md` spanning all works, and a `universe-cast/` directory where every character has one canonical identity file that tracks them across all appearances.

**Level 2: Series** — An ordered collection of works within a Universe. Has its own arc, theme question, and scope. Example: "A Song of Ice and Fire" is a Series within the Westeros Universe. A Series owns a `series.md` manifest (series arc, overarching theme question, planned installment count, reading order), `series-timeline.md` (how the Series contributes to the Universe timeline), and a `series-cast.md` that maps which Universe characters appear in which installments and how they change between them.

**Level 3: Work** — A single story (the current project unit). Belongs to zero or one Series, and zero or one Universe. The existing project structure (`author.md`, `narrator.md`, `characters/`, `story/`, etc.) remains unchanged. A new `work-manifest.md` file links it to its Series and Universe, declares its position (Book 3 of 5), and tracks character state deltas (who changed between the previous work and this one, who is new, who is absent).

**Key capabilities:**

*Character continuity across works:* A character like "Tyrion Lannister" has one canonical identity in `universe-cast/tyrion.md`. Each Work that features him gets a `character-state.md` snapshot: his wounds, relationships, arc position, and growth at the start and end of that Work. The system tracks how a character's relationship map, emotional state, and unresolved wounds carry forward or diverge between installments. A character as a child in a prequel has a fundamentally different relationship graph, wound set, and voice fingerprint than the same character as an adult — both are valid states of the same canonical identity.

*Timeline that spans works:* The Story Timeline view gains a "Universe Timeline" mode that shows all Works on a single axis, with character arcs threaded across installment boundaries. You can zoom from "all of Westeros history" down to "Chapter 3 of Book 4." Act structures nest: each Work has its own three-act structure, but the Series also has one, and so does the Universe.

*Relationship evolution tracking:* The Relationship Graph gains a time slider. Slide to "Book 1" and see the relationship web as it existed then. Slide to "Book 4" and see how alliances shifted, who died, who betrayed whom. Relationship lines gain history: "Allies (Books 1-3) → Rivals (Book 4) → Reconciled (Book 5)."

*Importing existing works into a Universe:* Upload/decompose a published book (UC-2), then "Add to Universe" — the system creates the canonical character entries, maps the timeline, and identifies connection points. Upload all five Game of Thrones books, and the system builds the Universe container, infers the Series structure, and creates canonical character files for every named character with cross-references to which books they appear in and how they change.

*Series-aware creation:* When starting a new Work in a Series, the wizard pre-populates from the Series context — the world is inherited, the cast carries forward (with state deltas from the previous installment), unresolved plot threads are surfaced as starting conditions. The system asks: "What has changed since the last installment?"

*Prequel/Sequel/Spinoff awareness:* When creating a prequel, the system knows the "future" and can flag consistency issues ("In Book 3, Miriam says she never left Lancaster County — but in this prequel, she's in Philadelphia"). When creating a spinoff, the system identifies which Universe elements are shared vs. new, and which canonical characters appear in altered roles.

**Upload flow for book series:** The user creates a Universe, then uses UC-2 (Decompose) to import each book in order. Each decomposition automatically: creates canonical character entries in `universe-cast/`, maps events to the `universe-timeline.md`, builds the Series container if one doesn't exist, and links the Work to its position. The user can decompose books in any order — the system reconciles timeline and character state afterward. Bulk import mode accepts multiple files and processes them sequentially, asking the user to confirm reading order.

**Folder structure:**

```
Universes/
  westeros/
    universe.md              # Shared reality bible
    universe-timeline.md     # Master timeline
    universe-cast/           # Canonical character files
      tyrion.md
      daenerys.md
      ...
    series/
      a-song-of-ice-and-fire/
        series.md            # Series arc, installment plan
        series-cast.md       # Character appearances across books
    works/
      game-of-thrones/       # Standard project structure
        work-manifest.md     # Links to Series + Universe
        character-states/    # Snapshots per character at start/end
        ...
      clash-of-kings/
        ...
```

### F-42: Deep Comparison Lab

A dedicated workspace for structural side-by-side analysis of any two works, series, or universes — whether they're your own projects or uploaded external books. Evolves the existing Comparison mode (which currently compares draft versions of a single file) into a full analytical tool.

**Comparison types:**

*Your Projects:* Select any two Works from your library. The system auto-generates a structural comparison across every engine dimension: author psychology, narrator type, world rules, character archetypes, relationship architectures, tonal arcs, plot structures, theme questions, hallmarks, audience assumptions.

*Uploaded vs. Uploaded:* Decompose two external books (e.g., Wizard of Oz vs. the Wicked screenplay) and compare them. The system identifies: shared characters in different roles, shared world with different rules, different narrators revealing different truths, different audience assumptions shaping different content, tonal register shifts, and which "engine levers" account for the transformation between works.

*Your Work vs. External:* Compare your story against a published work you admire. See where your structural choices align and diverge. "Your narrator uses third limited like Ishiguro, but your tonal arc follows a romance structure while his follows literary compression." Not plagiarism detection — structural DNA analysis.

*Series Progression:* Compare Book 1 against Book 3 of the same series. Track how the author's psychology shifted, how the world expanded, how character archetypes evolved, how the narrative ambition changed. "The author's wound shifted from abandonment in Book 1 to control in Book 3 — the series is actually about the author's own growth."

**Comparison dimensions (each a toggleable panel):**

- Author Psychology: wound, Enneagram, biases, prose tendencies
- Narrator: type, reliability, distance, knowledge constraints
- World: genre, rules, hallmarks, society-as-character, technology/magic systems
- Characters: archetype distribution, wound patterns, growth trajectories, foil mappings
- Relationships: network structure, attachment styles, power dynamics, alliance patterns
- Story Structure: plot type, act proportions, pacing, subplot density, ending type
- Tone: emotional register, humor, darkness, content rating, prose style
- Theme: central question, supporting arguments, ambiguity level, didacticism
- Audience: assumed reader, reading level, genre expectations exploited/subverted
- Inferences about the Author: what the structural choices reveal about the person who made them

**Visualization:** Split-screen with a shared axis. Each dimension gets a card showing Work A on the left and Work B on the right, with a "divergence score" and natural-language summary of the key difference. A radar chart overlay shows the structural fingerprint of each work. A "What Changed" summary at the top highlights the 3-5 most significant structural differences.

**Output:** Exportable comparison document (.md or .pdf) suitable for academic analysis, writing workshops, or personal study.

---

## Summary Statistics

| Category | Count |
|---|---|
| Use cases | 20 |
| Feature categories | 42 |
| Workflow modes | 20 |
| Reference file categories | 34 (16 character + 13 story + 3 theory + 2 emotional/somatic lexicons) |
| Rollable attribute types | 28 categories per character (40+ with sub-attributes like physical description) |
| Question files | 9 (producing 10 output destinations) |
| Theory documents | 3 |
| Diagnostic checks | 8+ |
| Phase pipeline steps | 9 (+ bridge + decomposition mode) |
