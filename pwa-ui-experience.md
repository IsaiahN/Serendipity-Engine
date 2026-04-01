# Serendipity Engine PWA — UI & Experience Design

*How the app looks, feels, and guides users from first visit to finished story.*

---

## Related Documents

- `pwa-features-and-use-cases.md` — Feature inventory and use case definitions
- `pwa-user-paths.md` — User path walkthroughs and design hole resolution log
- `pwa-settings-wireframe.md` — Unified settings page wireframe (all user-configurable options)

---

## Design Philosophy

The app is three things at once:

1. **A guided story builder** — holds your hand through every phase, asks you the right questions at the right time, and won't let you skip structural work that matters
2. **A teaching tool** — explains *why* each step exists, surfaces the theory behind each decision, and grades your story's structural health so you learn what makes fiction work
3. **A professional workspace** — lets experienced users skip the hand-holding, directly edit any file, and work at their own pace

The interface should feel like working with a patient, brilliant writing partner who knows when to lead and when to get out of the way.

---

## Screen 0A: Terms of Use & License Agreement

The very first screen a new user sees. Must be accepted before proceeding to any part of the app.

### What It Shows

A clean, readable presentation of two documents:

**1. License — The Serendipity Engine**
A summary of Isaiah Nwukor's license terms, covering:
- The engine is free for personal creative use
- Commercial use of the engine itself (building products on top of it) requires a commercial license
- Stories created using the engine belong to the user — the engine makes no ownership claims on creative output
- Attribution is appreciated but not required for stories produced

**2. Terms of Use — Acceptable Use Policy**

The terms make clear what this tool is and is not for:

**This tool is designed for:**
- Writers who want to improve their prose craft
- Authors working on novels, screenplays, short stories, and other creative works
- Storytellers who want to finally finish that project they've been sitting on
- Students of narrative who want to understand *why* great stories work
- Anyone who wants to learn the structural principles behind compelling fiction

**This tool is NOT for:**
- Academic dishonesty — generating essays, homework, or assignments to submit as your own schoolwork
- Use in classroom settings for the purpose of generating student assignments or circumventing academic integrity policies
- Plagiarism — passing off generated content as entirely human-written in contexts where that distinction matters (publishing, contests, etc.) without disclosure
- Any use that violates the content rating system's intent — the engine has content ratings for a reason

**The principle:** The Serendipity Engine is a creative partner, not a cheating tool. It's the difference between hiring an editor to improve your novel and hiring someone to write your term paper. If you're using this to learn, to create, to build something you care about — welcome. If you're using it to avoid doing your own work in an academic context — this isn't the tool for you.

### Acceptance Flow

- The full terms are scrollable with clear section headers
- A "I agree to the Terms of Use and License Agreement" checkbox at the bottom
- An "Accept and Continue" button (disabled until checkbox is checked)
- A link to the full legal text (downloadable as PDF)
- The terms acceptance is stored locally and doesn't need to be re-accepted unless the terms are updated

---

## Screen 0B: First-Time Setup — LLM Connection

Before anything else works, the app needs access to a large language model. This screen appears after accepting the Terms of Use on first launch and is accessible anytime from Settings.

### Connection Methods

The user sees a clean, simple screen:

**"Connect to an AI model to get started"**

Two options:

#### Option A: API Key (Direct)

For users who have their own API key from a provider. The flow:

1. **Select provider** — visual cards for supported providers:
   - Anthropic (Claude)
   - OpenAI (GPT)
   - Google (Gemini)
   - Local / Self-Hosted (Ollama, LM Studio, etc. — enter a custom endpoint URL)
   - Other (enter provider name + API base URL)

2. **Enter API key** — a secure input field (masked, paste-friendly). For local/self-hosted, this may be optional.

3. **Select model** — a dropdown populated based on the provider. The system recommends models based on capability:
   - "Recommended for story generation: Claude Opus, GPT-4o" (strongest creative output)
   - "Budget-friendly: Claude Sonnet, GPT-4o-mini" (good enough for Editor passes and chat)
   - For local models: auto-detect available models from the endpoint

4. **Test connection** — a "Test Connection" button sends a minimal request and confirms:
   - ✅ "Connected successfully. Model: Claude Opus 4. Response time: 1.2s"
   - ❌ "Connection failed: Invalid API key" / "Connection failed: Model not available" / "Connection failed: Endpoint unreachable"

5. **Save** — the key is stored locally (never sent to any server other than the LLM provider). The app is now ready to use.

#### Option B: Sign In with Provider (SSO / OAuth)

For providers that support OAuth login (where available):

1. **"Sign in with Anthropic"** / **"Sign in with OpenAI"** — opens the provider's OAuth flow in a popup
2. User authenticates with their existing provider account
3. The app receives an access token — no API key entry needed
4. Model selection and test connection proceed as above

*Note: Not all providers support OAuth for API access. This option appears only for providers that do.*

### Multi-Model Configuration — Plug and Play

Users can connect **multiple LLM providers simultaneously** and assign different models to different roles. The system is provider-agnostic — any combination works. Gemini could write the first half, Claude could edit it, and Qwen could handle the final chapters. The user is in control.

**Adding multiple providers:** The user can add as many API keys / connections as they want. Each becomes a named entry in their provider list:

```
┌──────────────────────────────────────────────────────────┐
│  Connected Models                                        │
│                                                          │
│  ┌────────────────────────────────────────────┐          │
│  │ ✅ Anthropic — Claude Opus 4    [Default]  │          │
│  │    Connected · Avg response: 2.1s          │          │
│  └────────────────────────────────────────────┘          │
│  ┌────────────────────────────────────────────┐          │
│  │ ✅ Google — Gemini 2.5 Pro                 │          │
│  │    Connected · Avg response: 1.8s          │          │
│  └────────────────────────────────────────────┘          │
│  ┌────────────────────────────────────────────┐          │
│  │ ✅ Local — Qwen 3 (Ollama)                 │          │
│  │    Connected · Avg response: 4.2s          │          │
│  └────────────────────────────────────────────┘          │
│                                                          │
│  [+ Add Another Model]                                   │
└──────────────────────────────────────────────────────────┘
```

**Role assignment:** In Settings → AI Configuration, the user assigns models to roles. The interface starts simple and gets granular if the user wants it:

**Simple mode (default):** One model does everything.

```
┌──────────────────────────────────────────────────────────┐
│  AI Role Assignment                  [Simple ▾]          │
│                                                          │
│  Everything: [Claude Opus 4 ▾]                           │
└──────────────────────────────────────────────────────────┘
```

**Standard mode:** Four core roles, each assignable to any connected model.

```
┌──────────────────────────────────────────────────────────┐
│  AI Role Assignment                  [Standard ▾]        │
│                                                          │
│  Content Generation  [Claude Opus 4 ▾]                   │
│  (chapters, architecture, character profiles, world)     │
│                                                          │
│  Editing & Review    [Gemini 2.5 Pro ▾]                  │
│  (Editor passes, consistency checks, critique)           │
│                                                          │
│  Chat & Conversation [Claude Opus 4 ▾]                   │
│  (Story Assistant, Editor chat, Talk to a Character)     │
│                                                          │
│  Analysis            [Qwen 3 ▾]                          │
│  (Decomposition, Silent Writing Assessment, grading)     │
└──────────────────────────────────────────────────────────┘
```

**Granular mode:** For users who want maximum control — every distinct task in the pipeline can use a different model. This is where someone might say "Claude writes the best prose but Gemini catches more consistency issues, and the local model is free so I'll use it for chat."

```
┌──────────────────────────────────────────────────────────┐
│  AI Role Assignment                  [Granular ▾]        │
│                                                          │
│  CONTENT GENERATION                                      │
│  Chapter drafting       [Claude Opus 4 ▾]                │
│  Architecture files     [Claude Opus 4 ▾]                │
│  Character generation   [Claude Opus 4 ▾]                │
│  World-building         [Gemini 2.5 Pro ▾]               │
│  Guided flow questions  [Gemini 2.5 Pro ▾]               │
│                                                          │
│  EDITING & REVIEW                                        │
│  Consistency check      [Gemini 2.5 Pro ▾]               │
│  Craft & prose review   [Claude Opus 4 ▾]                │
│  Seven Deaths audit     [Gemini 2.5 Pro ▾]               │
│  Story grading          [Gemini 2.5 Pro ▾]               │
│                                                          │
│  CHAT                                                    │
│  Story Assistant        [Qwen 3 (local) ▾]               │
│  Editor persona chat    [Gemini 2.5 Pro ▾]               │
│  Talk to a Character    [Claude Opus 4 ▾]                │
│  Character Guide Mode   [Qwen 3 (local) ▾]              │
│                                                          │
│  ANALYSIS                                                │
│  Decomposition          [Claude Opus 4 ▾]                │
│  Writing assessment     [Gemini 2.5 Pro ▾]               │
│  Format transposition   [Claude Opus 4 ▾]                │
│  Genre shift analysis   [Gemini 2.5 Pro ▾]               │
│                                                          │
│  [Reset to Default] [Save Configuration]                 │
└──────────────────────────────────────────────────────────┘
```

**Mid-project model switching:** The user can change role assignments at any time, even mid-project. If Claude wrote chapters 1-6, Gemini can pick up chapter 7. The architecture files are the source of truth, not the LLM's memory — so any model can step in at any point as long as it reads the same files. A small metadata note is saved in each generated file's header indicating which model produced it: `<!-- Generated by: claude-opus-4 | 2026-03-31 -->`. This creates an audit trail of which model touched what.

**Why this matters for quality:** Different models have different strengths. One might write more lyrical prose, another might catch more structural issues, a third might be better at maintaining character voice consistency. By letting users mix and match, the system lets each model do what it's best at. The feedback file system captures which model produced what, so the user can see patterns ("Claude's chapters get fewer Editor notes than Gemini's, but Gemini's editing catches things Claude's editing misses").

**Context and compaction:** Each LLM provider handles context windows and compaction according to its own capabilities. The system doesn't manage this — it sends the architecture files and relevant context for each task, and the model handles the rest. As models improve and context windows grow, the system automatically benefits. The architecture files are the persistent memory layer; the LLM's context window is just the working session.

### API Key Security

- Keys are stored in the browser's local storage (encrypted if the browser supports it)
- Keys are never transmitted anywhere except directly to the LLM provider's API
- The app has no server — there is no backend that sees the key
- Users can delete their stored key at any time from Settings
- A "Test Connection" button is always available in Settings to verify the key still works

### No Key = No AI Features

If no LLM is connected, the app still functions as a file editor and project organizer — users can read, write, and edit architecture files manually. But all AI features (generation, grading, editor review, chat, decomposition, TTS-powered summarization) are disabled with a clear message: "Connect an AI model in Settings to enable this feature."

---

## Screen 1: Home / Project Hub

The first thing users see. Two paths:

### New Project Button
Large, prominent. Launches the Onboarding Wizard (Screen 2).

### Recent Projects (Thread List)
A scrollable list of previous projects on the **left side**, styled like conversation threads in Claude Desktop or ChatGPT. This list is **persistent** — it doesn't disappear when you enter a project. Users can always see their full project list and switch between projects without navigating back to a home screen.

Each thread entry shows:

- Project title (or "Untitled Story" if not yet named)
- Story type badge (Book, Screenplay, TV Show, etc.)
- Genre tags (e.g., "Literary Fiction + Horror")
- Current phase indicator (e.g., "Phase 4 — Characters" or "Chapter 3 of 12")
- Story Grade (letter grade: A through F — see Scoring System below)
- Completion percentage (progress bar)
- Last modified date
- Thumbnail/cover if one exists

Users can click into any project to resume where they left off. The active project is highlighted in the thread list. Clicking a different project switches the workspace to that project — the right panel, center stage, and progress tracker all update to reflect the selected project's state.

### Re-Entry Experience

When a user returns to an in-progress project, the system doesn't just dump them at the file tree. It greets them with a **"Welcome Back" card** in the Center Stage that shows:

- Where they left off (last active phase + step)
- What's changed since they were away (if using cloud sync or multi-device)
- A summary of the project's current state (overall grade, chapters completed, open editor issues)
- A "Pick up where I left off" button that jumps directly to the next incomplete step
- A "Show me the full picture" button that opens the progress tracker overview

This card is dismissible and can be turned off in settings for power users.

### Quick Actions (Secondary)
- "Import a story to decompose"
- "Build a character" (standalone)
- "Build a world" (standalone)
- "Compare two stories"
- "Open from folder" — Select a project folder from the local file system to load an existing project

---

## Screen 2: Onboarding Wizard (Typeform-Style)

A full-screen, one-question-at-a-time guided flow. Each step is a single card with a clear question, visual options, and a progress indicator at the top. Users can go back at any step.

### Simple vs. Advanced Mode

Before the wizard begins, a mode selector appears:

```
┌──────────────────────────────────────────────────────────┐
│  How do you want to set up your story?                   │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │                     │  │                     │       │
│  │    ✨ Simple         │  │    🔧 Advanced       │       │
│  │                     │  │                     │       │
│  │  Pick a genre, set  │  │  Full control over  │       │
│  │  a length, and let  │  │  every lever —      │       │
│  │  the engine handle  │  │  format, cast size, │       │
│  │  the rest. Great    │  │  tonal arcs, prose  │       │
│  │  for getting        │  │  style, and more.   │       │
│  │  started quickly.   │  │  For writers who     │       │
│  │                     │  │  want precision.     │       │
│  └─────────────────────┘  └─────────────────────┘       │
│                                                          │
│  You can switch to Advanced at any time from Settings.   │
└──────────────────────────────────────────────────────────┘
```

**Simple Mode** condenses the 8-step wizard into 3 steps:
1. **What are you making?** — Pick from a simplified list: Novel, Short Story, Screenplay, Stage Play, Podcast, or "Not sure" (no subcategories, no format metadata deep-dive — the engine picks sensible defaults)
2. **What's it about?** — A freeform text box: "Describe your story in a few sentences." The engine infers genre, tone, themes, and cast size from the description
3. **How do you want to build it?** — "Guide me step by step" (full guided flow) or "Let me explore" (drops into workspace with a basic project scaffold)

Simple Mode generates all the same architecture files as Advanced Mode — it just fills in defaults from the user's description rather than asking for every detail. The user can open any file and refine it later. The Teaching Tips panel is more active in Simple Mode, explaining concepts as they're encountered rather than assuming the user already knows them.

**Advanced Mode** is the full 8-step wizard as described below — format selection with 43+ options, cast size planning, series vs. standalone, scope, etc.

**Switching:** The user can switch from Simple to Advanced at any time in Settings. Going the other direction (Advanced → Simple) doesn't remove any data — it just hides the granular controls and shows the streamlined view.

**The mode also affects the workspace:** In Simple Mode, the right sidebar shows more Teaching Tips and fewer raw scores. The Phase Navigator uses friendlier labels ("Build your characters" instead of "Phase 4: Character Generation"). The Emotion Wheel Picker defaults to Level 1 (core emotions). The Cast Roster shows fewer stats per character. All the power is still there — it's just layered behind "Show more" toggles instead of being visible by default.

### Step 1 — What are you making?

**Question:** "What type of story are you creating?"

The selection uses a **two-tier pick** — the user first clicks a main category card (12 total), which expands accordion-style to reveal its subcategories. Each subcategory card shows the format name, a brief description explaining what makes it distinct from neighboring formats, and the **word/page count range** displayed as a subtle badge. This count data is saved as structured metadata the moment the user selects a format.

**How it works in the UI:**

1. The user sees 12 large visual cards with icons — one per main category
2. Clicking a card expands it to show subcategory cards, each showing: **name**, **word/page count badge**, and **1-2 line description** explaining what distinguishes this format from others in its category
3. The user clicks the specific format
4. A "Not sure?" option at the bottom opens a short questionnaire: "Is your story primarily read, watched, listened to, played, or experienced live?" — this narrows the categories

#### What Each Selection Stores

Every format selection saves structured metadata to the project file. This data drives all downstream behavior — word count targets, progress tracker labels, export formatting, and the Phase 8 output template:

```
{
  medium:          "novella",
  category:        "written_prose",
  wordRange:       { min: 20000, max: 50000 },
  perUnitRange:    { min: null, max: null, unit: "chapter" },
  structuralUnit:  "chapter",
  formatType:      "prose",        // prose | script | visual | audio | interactive | hybrid
  outputTemplate:  "manuscript",   // manuscript | screenplay | stageplay | audio_script | visual_script | game_script | post_series
  branchingFormat: false,
  episodic:        false
}
```

This metadata is referenced by the progress tracker, the word count bar, the export formatter, and the Editor LLM (which adjusts its expectations based on the medium).

---

#### Category 1: Novel / Long-Form Prose

*For stories told primarily through extended prose narrative. The differences here are mostly about length and structural expectations — a novel has chapters, a novella might not; a serial has installments that each need their own arc.*

| Format | Count | Description |
|---|---|---|
| **Novel (Adult)** | 70,000–100,000 words | Full-length prose fiction. The standard commercial and literary form. Structured in chapters (typically 3,000–5,000 words each). Agents and publishers expect manuscripts in this range — under 70k feels thin, over 100k needs to justify its length. |
| **Novel (YA)** | 55,000–80,000 words | Prose fiction for ages 14–18. Slightly shorter than adult novels, faster-paced, with a protagonist typically 15–18 years old. Chapters tend shorter (2,500–4,000 words). The voice and emotional register skew toward immediacy and first-experience intensity. |
| **Novel (Middle Grade)** | 25,000–50,000 words | Prose fiction for ages 8–12. Shorter chapters (1,500–3,000 words), cleaner narrative lines, fewer subplots. The protagonist is typically 10–13. Content rating is implicitly G–PG. |
| **Novella** | 20,000–50,000 words | Longer than a short story, shorter than a novel. Often a single sustained narrative arc without the subplot density of a novel. May or may not have chapters. The novella earns its length through depth of a single idea rather than breadth of plot. Think *The Old Man and the Sea*, *Of Mice and Men*, *Coraline*. |
| **Novelette** | 7,500–20,000 words | The space between short story and novella. Long enough for character development and a turn, short enough to sustain a single sitting. Common in sci-fi and literary magazines. Often a single POV, a single timeline, and one central conflict explored deeply. |
| **Serial / Episodic Fiction** | Variable total; 2,000–5,000 per installment | Released in installments — like web novels (Royal Road, Wattpad), serialized magazine fiction, or Substack serials. Each installment needs its own micro-arc (hook, development, cliffhanger or resolution) while advancing the larger story. Total length is open-ended. |
| **Epistolary** | Matches novel/novella targets | Story told entirely through documents: letters, emails, diary entries, text messages, medical records, news articles. No traditional narration — the reader assembles the story from the artifacts. Word counts match the underlying form (epistolary novel = novel-length, epistolary novella = novella-length). The structural unit is the "entry" or "document." |

---

#### Category 2: Short-Form Prose

*For stories that live in a single sitting. The differences are about compression — how much story can you fit in how few words? Each step down in length demands more precision and less explanation.*

| Format | Count | Description |
|---|---|---|
| **Short Story** | 1,000–7,500 words | A complete narrative in a single unit. No chapters. One central conflict, one arc, often one POV. The short story earns its ending through economy — every sentence does work. The upper range (5,000–7,500) allows for more scene work; the lower range (1,000–2,000) requires extreme precision. |
| **Flash Fiction** | Under 1,000 words (often under 500) | Story told in a page or less. Often a single scene, a single moment, a single image that expands in the reader's mind. No room for backstory, exposition, or setup — the reader lands in the middle and the ending reframes everything. Some publications cap at 250 words ("sudden fiction"). |
| **Flash Nonfiction / Essay** | 500–5,000 words | Non-fiction storytelling — memoir, personal essay, cultural criticism told through narrative. The "I" is the protagonist. The structure borrows from fiction (scene, arc, revelation) but the events are real. Common in literary magazines, op-eds, and personal blogs. |
| **Prose Poetry** | 500–15,000 words total | Blends poetic language (rhythm, image density, compression) with prose structure (paragraphs, not line breaks). No chapters, no traditional plot. The organizing principle is often thematic or emotional rather than narrative. Think Claudia Rankine's *Citizen* or Anne Carson's *Plainwater*. |

---

#### Category 3: Poetry

*For works where language itself — rhythm, sound, image, line break — is the primary structural unit, not plot or scene.*

| Format | Count | Description |
|---|---|---|
| **Poetry Collection** | 48–100 pages (30–80 poems) | A series of poems forming a cohesive arc, theme, or narrative. The collection has a shape — an opening poem, a closing poem, and sections that build on each other. Individual poems range from a few lines to several pages. The architecture files (author.md, themes, arc) still apply but the "chapter" is the individual poem. |
| **Prose Poetry** | 500–15,000 words | *(Also listed under Short-Form Prose — appears in both categories since it bridges them.)* Paragraphs, not stanzas. Poetic density in prose form. |

---

#### Category 4: Graphic / Visual

*For stories told through sequential art. The writer produces the script and panel descriptions — the art comes later. Word counts refer to the script, not the final visual product.*

| Format | Count | Description |
|---|---|---|
| **Graphic Novel** | 80–200 pages; 4–6 panels/page | A complete, self-contained story in sequential art. Full script includes panel descriptions, dialogue, and pacing notes. Longer than a comic issue, with the narrative density of a novella or short novel. The structural unit is the "page spread" — each double-page turn is a beat. |
| **Comic Book / Manga** | 22–32 pages per issue; 4–6 panels/page | Periodical or chapter-based visual storytelling. Each issue has its own micro-arc within a larger series arc. Manga chapters tend slightly longer (15–45 pages) with more panels per page and right-to-left reading direction. The script specifies panel layout, shot type, and dialogue placement. |

---

#### Category 5: Stage / Performance

*For stories performed live in front of an audience. The writer produces the script — actors, directors, and designers bring it to life. Page counts follow the "one page per minute" rule (roughly).*

| Format | Count | Description |
|---|---|---|
| **Stage Play (Full-Length)** | 80–120 pages | Script for a 2-3 act theatrical performance with intermission. Dialogue-driven — no internal monologue unless delivered as soliloquy. The writer controls words and stage directions; everything else (set, lighting, blocking) is described minimally. Standard format: character name centered, dialogue beneath, stage directions in italics/parentheses. |
| **One-Act Play** | 10–40 pages | A short play without intermission, performed in a single unbroken block. Often a single setting, small cast (2–5 characters), and a compressed conflict that resolves (or doesn't) in real time. Common in festivals and showcases. |
| **Musical** | 90–130 pages (incl. lyrics) | A play with integrated songs and choreography. The script ("book") includes dialogue scenes, song placement cues, and lyrics. Songs typically occur at emotional peaks — when speech isn't enough. The writer needs to specify where songs fall in the arc, what emotional function each serves, and whether it's solo, duet, ensemble, or reprised. |
| **Opera / Libretto** | 60–90 pages | The text of a dramatic work set entirely (or primarily) to music. Every word is sung. The librettist writes with musical rhythm in mind — syllable count, vowel openness, and line length all matter because they affect the composer's setting. More compressed than a play because music stretches time. |
| **Ballet / Dance Narrative** | 5–20 pages (synopsis + scene descriptions) | A story told through dance and music, with a written synopsis and per-scene emotional/narrative descriptions. The writer doesn't write dialogue — they write what each movement sequence conveys: character, conflict, arc. Think of it as a screenplay for bodies instead of voices. |
| **Performance Art / Monologue** | 5–30 pages | Solo spoken-word performance. One voice, one perspective, one sustained piece. Can be theatrical (Mike Daisey, Spalding Gray), poetic (spoken word slam), confessional (stand-up adjacent), or experimental. The structural unit is the "beat" — shifts in tone, subject, or energy. |

---

#### Category 6: Film

*For stories told through moving images and sound. The writer produces the screenplay — measured in pages (1 page ≈ 1 minute of screen time). Screenplay format is rigid: Courier 12pt, specific margin rules, scene headings (sluglines), action lines, dialogue blocks.*

| Format | Count | Description |
|---|---|---|
| **Feature Film** | 90–120 pages (~90–120 minutes) | Standard screenplay for a full-length theatrical movie. Three-act structure is the industry default (though not mandatory). Scene headings (INT./EXT., location, time), action lines (present tense, visual), dialogue (character name, parenthetical, lines). Exported in .fountain or standard screenplay PDF. |
| **Short Film** | 5–40 pages (~5–40 minutes) | Screenplay for a film under 40 minutes. Often a single sustained idea — one conflict, one location, one revelation. The short film can't afford setup; it drops the audience into the middle. Festival submissions typically run 10–20 minutes (10–20 pages). |
| **Animated Film** | 90–120 pages + visual direction notes | Same screenplay structure as live-action, but with additional notes for visual style, character design cues, and sequences that only work in animation (impossible camera moves, metamorphosis, abstract sequences). The script may include storyboard-level shot descriptions. |

---

#### Category 7: Television

*For stories told in episodic form on screen. Each episode has its own arc within a season arc within a series arc. Page counts are per-episode. The pilot (first episode) does extra structural work — it establishes the world, cast, tone, and central question.*

| Format | Count | Description |
|---|---|---|
| **TV Series (1hr Drama)** | 55–65 pages per episode | Hour-long dramatic television. Typically structured in 5 acts (for commercial breaks) or 3 acts (streaming). Each episode advances the season arc while resolving its own A-plot. The pilot is the most important script — it's a proof of concept for the entire series. |
| **TV Series (30min Comedy)** | 25–35 pages per episode | Half-hour format. Comedies use a distinct script format — multi-camera sitcoms are double-spaced (50–55 pages that play as 22 minutes); single-camera comedies look like standard screenplays (25–35 pages). The comedic structure relies on A/B/C story interweaving. |
| **Miniseries / Limited Series** | 45–65 pages per episode; 4–12 episodes total | A self-contained story told across a finite number of episodes — no second season planned. Each episode is a chapter in a single novel-length narrative. The miniseries has the structural density of a feature film stretched across 4–12 hours, allowing deeper character work and slower revelation. |
| **Animated Series** | 11–22 pages per episode (11min or 22min formats) | Animation-specific episodic script. Shorter episodes (11 min) for children's animation, 22 min for standard, up to 30+ for adult animation. Includes visual direction notes, action descriptions written for animators, and often more precise timing cues than live-action. |

---

#### Category 8: Web / Online Video

*For stories distributed digitally outside traditional TV/film pipelines. Shorter, more varied in format, often lower budget and higher creative freedom.*

| Format | Count | Description |
|---|---|---|
| **Web Series** | 5–15 pages per episode | Episodic content distributed online (YouTube, Vimeo, platform-specific). Episodes are typically shorter than TV (3–15 minutes). Lower production overhead means faster iteration — web series can be more experimental. Each episode still needs its own hook and arc. |
| **Video Essay** | 1,500–5,000 words (narration script) | Narrative or argument presented through video with voiceover, B-roll, and graphics. Not fiction (usually) but still storytelling — the writer crafts a narrative arc around an idea. The script is the voiceover narration with cues for visual accompaniment. Think Nerdwriter, Every Frame a Painting, Contrapoints. |
| **Social Media Story** | 50–500 words per post; 500–10,000 total | Narrative told through a series of social media posts — Twitter/X threads, TikTok series, Instagram stories, Tumblr posts. Each post is self-contained enough to work alone but contributes to a larger arc. The format constraints (character limits, video length, swipe-through) are part of the creative challenge. |

---

#### Category 9: Audio

*For stories experienced through sound alone — no visuals. The writer controls dialogue, narration, sound effects cues, and music cues. The listener's imagination does the rest.*

| Format | Count | Description |
|---|---|---|
| **Audio Drama / Radio Play** | 20–30 pages per episode | Scripted fiction produced for audio, with voice actors, sound effects, and music. The script looks like a screenplay but with no visual action lines — everything must be communicated through what characters say, how they say it, and what the listener hears around them. Scene transitions are handled through sound design (door closing, ambient shift, music sting). |
| **Podcast (Narrative)** | 3,000–8,000 words per episode | Episodic audio storytelling. Can be scripted fiction (like audio drama) or structured non-fiction (like *Serial* or *S-Town*). The script includes host narration, interview segments, transitions, and pacing cues. Non-fiction narrative podcasts are built around investigation, revelation, and cliffhangers — the same dramatic structure as fiction. |
| **Audiobook** | Matches source text length | A recorded reading of a written work. The "script" is the source text itself — but audiobook adaptation sometimes involves rewriting passages that don't work in audio (visual descriptions that lose impact, complex formatting that can't be heard). Multi-narrator audiobooks assign voices to characters and need clear POV handoff cues. |
| **Soundscape / Ambient Story** | 2–10 pages (direction + minimal dialogue) | Story conveyed primarily through sound design — environmental audio, music, minimal or no dialogue. The script is more like a director's score: what the listener hears at each moment, what emotional state each sound layer creates, how the soundscape shifts to convey narrative progression. Experimental and emerging form. |

---

#### Category 10: Games / Interactive

*For stories where the audience makes choices that affect the narrative. The writer creates branching paths, player agency, and systems that respond to decisions. Word counts represent total content across all paths — the "critical path" (shortest complete playthrough) is typically 30–50% of total.*

| Format | Count | Description |
|---|---|---|
| **Video Game (Narrative)** | 50,000–100,000+ words total | Story designed for a video game, with dialogue trees, cutscenes, quest descriptions, item descriptions, environmental storytelling, and bark (ambient NPC lines). The writer works within game design constraints — player agency means the story must accommodate multiple approaches. Branching dialogue is the core unit. |
| **Interactive Fiction / Text Adventure** | 10,000–100,000+ words (all paths) | Branching narrative where reader choices affect the story. Built in tools like Twine, Ink, or ChoiceScript. Each "passage" or "node" is 200–1,000 words. The writer maps a branching tree of possibilities — some paths converge, some lead to unique endings. The architecture files help maintain consistency across branches. |
| **Visual Novel** | 30,000–200,000+ words (all routes) | Text-based storytelling with static character art, backgrounds, and music. Often features branching routes based on player choices (especially relationship choices). Common in Japanese game design. Each "scene" combines narration, dialogue, and choice points. Multiple endings are standard. |
| **TTRPG Campaign** | 20,000–80,000 words (module/sourcebook) | Story framework for tabletop role-playing games (Dungeons & Dragons, Pathfinder, Call of Cthulhu, etc.). The writer creates: world setting, NPCs with motivations, encounter descriptions, branching plot hooks, maps, and contingency plans for player choices. The structural unit is the "session" (2,000–5,000 words of prepared material per 3–4 hour session). |
| **LARP** | 5,000–30,000 words total | Interactive story for live participants, with pre-written character sheets, plot documents, game rules, and scene triggers. Each player gets a character packet (backstory, goals, secrets, relationships). The writer designs a narrative that works when real humans improvise within it. |
| **Hypertext Fiction** | 5,000–50,000+ words (all paths) | Nonlinear narrative using hyperlinks to navigate between text fragments ("lexia"). The reader constructs their own path through the text. Unlike interactive fiction, there may be no "correct" order — the meaning emerges from the reader's navigation choices. Each lexia is 100–500 words. Think *Afternoon, a story* by Michael Joyce. |
| **ARG (Alternate Reality Game)** | Variable | Story that blends real-world clues, digital puzzles, websites, social media accounts, and immersive narrative. The writer creates: in-world documents, fake websites, puzzle chains, narrative reveals triggered by player actions, and contingency scripts. No fixed word count — the "text" is distributed across media. |

---

#### Category 11: Immersive / Emerging

*For stories that use emerging technology or non-traditional delivery to create experiences beyond reading, watching, or playing. These formats are evolving rapidly — the engine supports them but the conventions are still being established.*

| Format | Count | Description |
|---|---|---|
| **Immersive Theatre** | 10,000–40,000 words (script + character docs) | Audience moves through physical space, interacting with performers. The writer creates: room-by-room scene descriptions, character scripts that adapt to audience behavior, branching encounter logic, and environmental narrative (what the space itself tells you). Think *Sleep No More*, *Then She Fell*. Each "room" or "scene" is a self-contained narrative that can be experienced in any order. |
| **VR / AR Narrative** | 5,000–50,000 words (script + spatial notes) | Story designed for virtual or augmented reality headsets. The writer specifies: what the viewer sees in 360 degrees, spatial audio placement, gaze-triggered events, and interaction points. The script includes traditional dialogue plus "environment scripts" describing what happens in every direction. Pacing is different — the viewer controls where they look. |
| **Generative / AI-Driven Story** | Variable (system prompts + content libraries) | Story that adapts in real time based on user input or data. The writer creates: narrative frameworks, character systems, response libraries, tone guidelines, and boundary rules rather than fixed text. The output is emergent — the system generates specific text from the writer's structural and tonal specifications. The Serendipity Engine itself is a form of this. |

---

#### Category 12: Transmedia

| Format | Count | Description |
|---|---|---|
| **Transmedia Project** | Sum of component format targets | A unified story spanning multiple formats — e.g., a film + comic series + game + ARG that each contribute unique narrative content to a shared world. The writer designs: the overarching narrative, which story elements live in which format, how the formats reference each other, and what a reader/viewer/player gains from experiencing multiple formats vs. just one. After selecting this, a follow-up asks: "Which formats does this project span?" (multi-select from the other categories). Each component then gets its own format metadata. |

---

#### "Not Sure?" Helper

A bottom card opens a 3-question mini-flow:

1. "Is your story primarily **read**, **watched**, **listened to**, **played**, or **experienced live**?" → Narrows to 2-3 categories
2. "How long is it?" → Rough length selection (short / medium / long / open-ended) → Narrows to specific formats
3. "Is the audience making choices that affect the story?" → Yes filters to interactive formats; No filters them out

---

#### Format-Specific Wizard Branches

Some formats trigger additional questions after selection:

- **Serial / Episodic Fiction** → "How long is each installment?" + "How will you release them?" (weekly, bi-weekly, completed then posted)
- **Musical** → "Are songs integrated into the dialogue or standalone numbers?" + "How many songs per act?"
- **TTRPG Campaign** → "What system?" (D&D 5e, Pathfinder, CoC, system-agnostic, custom) + "How many sessions?" + "How many players?"
- **Transmedia Project** → "Which formats?" (multi-select) → each selected format gets its own metadata entry
- **Interactive / Branching formats** → "How many endings?" + "How much do paths diverge?" (mostly linear with choices / moderate branching / fully open)
- **TV Series** → "How many seasons planned?" + "How many episodes per season?"

---

#### For Non-Standard Structures

The engine adapts its vocabulary based on the stored metadata. "Chapters" become whatever `structuralUnit` the format specifies. The architecture files remain the same — author.md, narrator.md, characters, relationships, world, arc all still apply — but Phase 8 (execution) adjusts its output template, the progress tracker labels change, and the Editor LLM calibrates its expectations to the format's conventions.

---

### Step 2 — What genre world does it live in?

**Question:** "What genre feels closest to your story?"

**Primary genre selection** — visual cards organized by the 12 genre sublists from `genres.md`:

- Literary & Contemporary Fiction
- Fantasy
- Science Fiction
- Horror
- Thriller & Suspense
- Mystery & Crime
- Romance
- Action & Adventure
- Historical Fiction
- Comedy & Satire
- LGBTQ+ Fiction
- Non-Fiction

After selecting a primary, a follow-up appears:

**"Want to blend in a second genre?"** (optional)
Shows the remaining sublists. The blend creates the tonal complexity the engine is built for.

**"And a third for texture?"** (optional)
Same mechanic. Three-genre blends are the engine's sweet spot.

---

### Step 3 — How big is this story?

Three questions that help the engine calibrate scope, cast complexity, and series planning. These directly affect downstream defaults — chapter count, character slot recommendations, relationship graph complexity, and word count targets.

**Question 3a:** "Is this a standalone story or part of a series?"

**Options:**
- **Standalone** — One complete story, beginning to end. No sequels planned.
- **Book 1 of a planned series** — This is the first installment. The engine will help you plant seeds for future books while making this one satisfying on its own.
- **Part of an existing series** — You've already written previous installments. Upload or describe them so the engine can maintain continuity.
- **I'm not sure yet** — That's fine. The engine treats it as standalone by default and you can expand later.

For series projects, a follow-up: **"How many books/installments do you envision?"** (2-3, 4-6, 7+, open-ended). This affects how many unresolved threads the engine allows at the end of this installment and how much world-building it front-loads.

**Question 3b:** "How big is your cast of characters?"

**Options (visual scale with descriptions):**
- **Intimate (2-4 characters)** — A tight, focused story. Every character gets deep development. Think: a two-person play, a road trip novel, a bottle episode.
- **Small cast (5-8 characters)** — Room for a core group with distinct dynamics. Think: a heist crew, a family drama, a friend group.
- **Medium cast (9-15 characters)** — Multiple storylines, subplots, and relationship layers. Think: a workplace drama, a mystery with suspects, a fantasy quest party.
- **Large cast (16-30 characters)** — A sprawling narrative with many perspectives. Think: an ensemble war story, a multi-generational saga, a TV series.
- **Epic (30+)** — A world full of people. The engine will help you manage them so they don't blur together. Think: Game of Thrones, The Wire, a Dickens novel.
- **I haven't decided yet** — The engine will suggest a cast size based on your medium, genre, and story length.

This selection adjusts:
- How many character slots the engine creates during Phase 4
- How complex the relationship graph template is
- Whether the engine recommends network archetypes (Pioneer/Optimizer/Generalist/Exploiter) for cast balance
- How aggressively the engine warns about "too many characters for this story length"

**Question 3c:** "How much ground are you trying to cover?"

**Question:** "What's the scope of your story?"

**Options:**
- **Tight and focused** — One main conflict, one timeline, one setting. The story goes deep, not wide. Word count tends shorter.
- **Moderate** — A main plot with 2-3 subplots, maybe a couple of settings or a modest time span. The standard novel or film.
- **Ambitious** — Multiple storylines, settings, or time periods. Several characters with their own arcs. Requires careful management.
- **Epic** — Sweeping scope. Multiple POVs, settings, timelines, and interwoven storylines. The engine will work hard to keep everything connected and nothing forgotten.

This selection adjusts word count targets, outline complexity, the number of subproblem threads the engine tracks, and how frequently the Seven Deaths audit runs (more scope = more places for structural failure to hide).

---

### Step 4 — Is this connected to an existing story?

**Question:** "Is this story related to something that already exists?"

**Options:**

- **No — this is completely original** → Proceeds to Step 5
- **Sequel** — continues after an existing story → Branch A
- **Prequel** — tells what came before → Branch A
- **Spinoff** — explores a different character or corner of the world → Branch A
- **Continuation** — picks up an unfinished story → Branch A
- **Adaptation / Genre Shift** — retells an existing story in a new genre or medium → Branch B
- **POV Shift** — tells the same story from a different character's perspective → Branch B
- **I want to decompose/analyze an existing story** → Branch C

**Branch A (Sequel/Prequel/Spinoff/Continuation):**
"Do you have the original story available?"
- Yes — upload or paste → System runs decomposition on it first, then scaffolds the new project from that foundation
- No — I'll describe it → Guided interview to reconstruct the world, characters, and key events

**Branch B (Adaptation/Genre Shift/POV Shift):**
"Upload or paste the source material"
→ System decomposes, then presents the engine's levers: "Which do you want to change?"
- Author psychology
- POV character
- Genre
- Tonal register
- Medium
- Moral alignment of key characters
- Time period / setting

**Branch C (Decomposition only):**
"Upload or paste the text you want to analyze"
→ Enters Decomposition Mode (separate workflow — see below)

---

### Step 5 — Do you have existing material?

**Question:** "Do you have any existing files, notes, or rough drafts for this story?"

**Options:**

- **No — starting from scratch** → Proceeds to Step 6
- **Yes — I have some material** → Upload zone appears

**Upload zone accepts:**
- Character sheets / notes
- Rough drafts / chapters
- Outlines
- World-building notes
- Reference images / mood boards
- Any text file, document, or PDF

The LLM reads and decomposes uploaded material, categorizes it against the engine's file structure, and tells the user:

> "Based on what you uploaded, here's what I found:
> - 2 characters (partially developed — missing wound, voice fingerprint, and alignment)
> - A rough outline (7 chapters sketched, no scene metadata)
> - World notes (setting described, no society-as-character, no hallmarks)
>
> I'll use this as a starting point and help you fill in the gaps."

The system maps uploaded content to the appropriate phase and marks those sections as partially complete.

---

### Step 6 — Where are you in the process?

**Question:** "How complete is your story right now?"

**Options:**

- **Just an idea** — I know what I want to write about but haven't started → Full guided pipeline from Phase 1
- **Early planning** — I have some characters and a basic plot → System identifies gaps and starts from the earliest incomplete phase
- **Outlined but not written** — the structure exists but no prose yet → Starts at Phase 7 review, then Phase 8 drafting
- **Rough draft exists** — I have chapters written but they need work → Decomposition of own draft + diagnostic + revision guidance
- **Nearly complete** — I need editing, grading, and polish → Phase 7 diagnostic + chapter-by-chapter review

---

### Step 7 — How do you want to work?

**Question:** "How much help do you want?"

**Options:**

- **Guide me through everything** — Ask me questions, explain why each step matters, and help me build the story piece by piece (recommended for first-time users)
- **Co-create with me** — I'll make decisions, you fill in the details and generate what I approve
- **Generate for me** — Build the full architecture using the randomization engine, then present it for my review and approval
- **I know what I'm doing** — Give me the workspace and checklist, I'll work at my own pace

This sets the **interaction mode** for the entire project — but can be changed at any time from settings.

---

### Step 8 — Author Identity

**Question:** "Who is writing this story?"

**Options:**

- **Generate a random author** — The engine creates an author with a unique psychology, wound, and voice. You'll write through their lens, not your own. (This is the system's default — it produces the most surprising results.)
- **I am the author** — Use your own psychology, wound, and worldview as the story's foundation. (Launches the interactive author interview from `author-profile-template.md`.)
- **Create a specific persona** — Design a deliberate alter ego or authorial identity to write through.

---

### Wizard Complete

After Step 8, the system creates the project folder, generates the seed, and drops the user into the **Main Workspace** with Phase 1 already in progress (or the appropriate starting phase based on their answers).

---

## Screen 3: Main Workspace

The primary working environment. Four-panel layout — the thread list persists from the Home screen:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Top Bar: Project Title | Story Type Badge | Genre Tags | Grade             │
├────────────┬──────────────┬──────────────────────────────┬───────────────────┤
│            │              │                              │                   │
│  Thread    │   Left Nav   │        Center Stage          │   Right Sidebar   │
│  List      │              │                              │                   │
│            │  File Tree   │   Active content area        │   Progress        │
│  Recent    │  + Phase     │   (guided flow, editor,      │   Tracker         │
│  Projects  │    Navigator │    reader, or chat)           │                   │
│            │  + Cast      │                              │   Story Grade     │
│            │    Roster    │                              │                   │
│  + New     │              │                              │                   │
│  Project   │              │                              │   Teaching Tips   │
│            │              │                              │                   │
├────────────┴──────────────┴──────────────────────────────┴───────────────────┤
│  Bottom Bar: TTS Controls | Word Count | Session Timer                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

The **Thread List** (far left) is a slim, collapsible panel showing all projects as a vertical list — identical in behavior to the Claude Desktop sidebar. Users can switch projects at any time without navigating away. The "+ New Project" button at the top launches the Onboarding Wizard.

---

### Left Panel: Navigation

**Phase Navigator** — Visual progress through the 8 phases (+ Bridge + Decomposition). Each phase is a collapsible section showing:
- Phase name and number
- Status icon (not started / in progress / complete / needs review)
- Sub-steps within each phase
- Click any step to jump directly to it

**Cast Roster** — An IMDB-style cast panel with character avatars, role tiers (Main / Supporting / Minor), quick-access Talk and File buttons, and optional relationship lines. Full details in the "Cast Roster — The IMDB Panel" section below.

**File Tree** — Direct access to every file in the project folder. Users can click any file to open it in the Center Stage as an editable document. Files are organized exactly as the engine specifies:
```
author.md
narrator.md
abstract.md
outline.md
characters/
  character-name.md
  questions-answered.md
relationships/
  relationship-graph.csv
  questions-answered.md
world/
  world-building.md
  hallmarks.md
  questions-answered.md
story/
  arc.md
  chapter-1.md
  chapter-1-notes.md
  chapter-checklist.md
  questions-answered.md
  metafiles-review.md
feedback/
  editor-v1.md
  external-v1.md
  author-notes-v1.md
media/
  characters/
  hallmarks/
  locations/
```

Files that don't exist yet are shown greyed out with a "+" icon — clicking them creates the file and opens it.

**Download button** — Export the entire project folder (or individual files) at any time, in any state.

---

### Center Stage: The Main Working Area

This is where the action happens. It has multiple modes:

#### Mode 1: Guided Flow (Typeform-style, continued)

When working in guided mode, the center stage presents one question or task at a time — the same full-screen card style as the onboarding wizard. Each card includes:

- The question or task
- Input fields, selection cards, or text areas as appropriate
- A **"Why does this matter?"** expandable section explaining the theory behind this step (teaching mode)
- A **"Show me an example"** link that pulls from the Wizard of Oz decomposition or The Shunning Season creation as reference
- Navigation: Back / Skip (with warning) / Next

The guided flow walks through every step of every phase in order, asking the user each question from the relevant `questions.md` file, presenting roll results for approval (in generate mode), or collecting their answers (in interview mode).

#### Mode 2: Editor

A clean markdown/rich-text editor for directly writing and editing any file. Supports:

- Markdown rendering (headers, bold, italic, lists, tables)
- Split view (markdown source on left, rendered preview on right)
- Auto-save
- Version history (undo/redo across sessions)
- Character count and word count
- Inline comments and annotations

#### Mode 3: Reader

For reviewing chapters and content. Features:

- Clean reading view (no toolbars, no distractions)
- **Text-to-Speech** integration (see TTS section below)
- Chapter navigation (previous / next)
- Inline feedback mode (highlight text → add comment → approve or request changes)
- Summary view (LLM-generated chapter summary for fast review)

#### Mode 4: Comparison View

For UC-4 (Compare & Contrast). Side-by-side panels showing two decomposed stories with structural differences highlighted.

#### Mode 5: Relationship Graph View

Visual matrix editor for the relationship graph. Interactive table where each cell is clickable and editable. Color-coded by emotional charge (warm/cool/neutral/hostile). Hover to read the full cell content. Supports the three tiers (major, minor, society).

Optional: network diagram visualization showing characters as nodes and relationships as edges, with thickness/color representing strength and type.

#### Mode 6: Chat / Story Assistant

Freeform conversation with one of three personas: Story Assistant (default collaborator), The Editor (direct critique), or Talk to a Character (in-character workshopping). See the full Chat / Conversation Interface section below.

#### Mode 7: Story Timeline

A unified horizontal timeline compiling story beats, character arcs, relationship dynamics, emotional weather, subproblem threads, tonal arc, Reader Experience Reports, and Scene Dynamics Forecasts into one synchronized view. Each data lane is independently toggleable. Shows both the *plan* (from architecture) and the *reality* (from drafted chapters) with divergence highlighting. See the full Story Timeline section below.

---

### Right Sidebar: Progress, Grade, and Teaching

Always visible. Three collapsible sections:

#### Section 1: Progress Tracker

A step-by-step progress view that shows exactly where the user is and what comes next. Two layers:

**Overall Pipeline Progress:**
A vertical stepper showing all 9 phases (+ Bridge + Decomposition if applicable) with completion percentages:

```
Phase 1 — Author          ████████████████████ 100%
Phase 2 — Narrator         ████████████████████ 100%
Phase 3 — World            ██████████████░░░░░░  72%  ← YOU ARE HERE
Phase 4 — Characters       ░░░░░░░░░░░░░░░░░░░░   0%
Phase 5 — Relationships    ░░░░░░░░░░░░░░░░░░░░   0%
Phase 6 — Story Foundation ░░░░░░░░░░░░░░░░░░░░   0%
   Bridge                  ░░░░░░░░░░░░░░░░░░░░   0%
Phase 7 — MetaFiles Review ░░░░░░░░░░░░░░░░░░░░   0%
Phase 8 — Chapter Execution░░░░░░░░░░░░░░░░░░░░   0%
Phase 9 — Editor           ░░░░░░░░░░░░░░░░░░░░   0%

Overall: 28% complete
```

**Current Phase Detail:**
Expands the active phase into its sub-steps as a checklist. Items auto-check when completed through the guided flow, or can be manually checked. Each sub-step shows:
- Step name
- Status icon (not started / in progress / complete / needs review)
- Estimated time remaining (based on average completion times)

**Next Steps Queue:**
Below the current phase detail, a "What's Next" section shows the immediate next 3-5 actions the user needs to take, in order. This updates dynamically as the user works:

```
NEXT STEPS:
→ Answer hallmarks questions (3 remaining)
→ Run Seven Deaths audit
→ Review world diagnostic
→ Begin Phase 4 — Characters
```

Clicking any item jumps the Center Stage to that step.

**Completion milestones:** At 25%, 50%, 75%, and 100% overall completion, a brief celebration card appears (non-blocking, dismissible) acknowledging progress and previewing what's ahead.

#### Section 2: Story Grade

A live-updating letter grade (A+ through F) with a breakdown across the scoring dimensions (see Scoring System below). The grade updates whenever the user completes a phase, edits a file, or runs a diagnostic.

Each dimension shows:
- Dimension name (e.g., "Character Depth")
- Current score (letter grade)
- One-line diagnosis (e.g., "Two characters share the same wound — consider differentiating")
- Click to expand: full diagnostic detail and suggestions

The grade is prominently displayed in the top bar as well.

#### Section 3: Teaching Tips (Contextual)

Changes based on what the user is currently working on. Shows:

- A brief explanation of why this step matters
- The relevant theory (pulled from Story Consciousness Theory, Network Theory, or Seven Story Deaths as appropriate)
- Common mistakes at this stage
- Examples from the reference decomposition (Wizard of Oz)
- Links to the relevant reference files

This section is collapsible for experienced users who don't need it.

---

### Bottom Bar: Utilities

- **TTS Controls** — Play / Pause / Stop / Speed (1x, 1.25x, 1.5x, 2x) / Voice selection
- **Word Count** — Current file word count + total project word count + target word count (based on medium)
- **Session Timer** — How long the current session has been active
- **Auto-save indicator**

---

## Text-to-Speech (TTS) System

Built-in browser-based TTS using the Web Speech API (free, no backend required).

**Features:**
- Read any file or chapter aloud
- Speed control: 0.75x, 1x, 1.25x, 1.5x, 2x
- Highlight-as-you-go: the current sentence being read is highlighted in the text
- Pause/resume at any point
- Voice selection (browser-provided voices — varies by OS)
- Read selection: highlight a passage and click "Read this aloud"

**Where it appears:**
- Bottom bar (persistent controls)
- Reader mode (prominent play button)
- Chapter review (listen while following along)

**Future enhancement:** Premium voice integration (ElevenLabs, OpenAI TTS, etc.) for higher quality narration — but the free Web Speech API is the baseline.

### Voice Casting — Narrator & Character Voice Profiles

When the user wants to find the right voice for narration (for audiobook production, podcast recording, or just for read-back during editing), the system generates **voice casting briefs** derived from the architecture files. These aren't audio files — they're detailed descriptions/prompts that can be used with any voice synthesis service (ElevenLabs, OpenAI TTS, etc.) or given to a human voice actor.

**Narrator voice brief** — generated from `narrator.md` + `author.md` + the story's genre and tonal register:

```
┌──────────────────────────────────────────────────────────┐
│  Voice Casting Brief: Narrator                           │
│                                                          │
│  Source: narrator.md + author.md + genre                 │
│                                                          │
│  Gender/presentation: Female, mid-30s                    │
│  Tone: Warm but measured — someone who knows more than   │
│        she's telling. Not cold, but careful.             │
│  Pacing: Moderate with deliberate pauses before          │
│          revelations. Slightly slower than conversational.│
│  Register: Literary but accessible — no showing off.     │
│           Vocabulary of someone well-read who chooses     │
│           not to perform it.                             │
│  Emotional range: Controlled. Sadness comes through as   │
│           a tightening, not a break. The voice cracks    │
│           once, maybe twice, in the whole book.          │
│  Accent/dialect: Neutral American with occasional        │
│           Southern softening on vowels (author's         │
│           background).                                   │
│  Reference voices: "Think Meryl Streep reading a letter  │
│           she wrote but never sent."                     │
│                                                          │
│  [Copy as Prompt] [Edit] [Generate for ElevenLabs]       │
│  [Generate for OpenAI TTS]                               │
└──────────────────────────────────────────────────────────┘
```

**Per-character voice briefs** — generated from each character's voice fingerprint, emotional register, wound, and cultural background:

```
┌──────────────────────────────────────────────────────────┐
│  Voice Casting Brief: Elara Voss                         │
│                                                          │
│  Source: characters/elara.md                             │
│                                                          │
│  Gender/presentation: Female, late 30s                   │
│  Tone: Direct, slightly clipped when guarded. Warmer     │
│        than she intends when caught off-guard.           │
│  Speech rhythm: Short declarative sentences under        │
│        stress. Longer, more subordinate when relaxed     │
│        (which is rare).                                  │
│  Vocabulary: Professional-register default. Drops to     │
│        colloquial when emotional (the slip IS the tell). │
│  Verbal tic: Starts sentences with "Look—" when         │
│        cornered. Uses "fine" to end conversations she    │
│        doesn't want to have.                             │
│  Distinguishing quality: There's a held-back quality —   │
│        the listener should always feel she's saying 60%  │
│        of what she's thinking.                           │
│                                                          │
│  [Copy as Prompt] [Edit]                                 │
└──────────────────────────────────────────────────────────┘
```

**"Copy as Prompt"** formats the brief as a text prompt optimized for whichever TTS service the user targets. "Generate for ElevenLabs" produces an ElevenLabs-specific voice description prompt. "Generate for OpenAI TTS" formats it for that API's voice parameters.

**Cast voice sheet** — a single exportable document with all character voice briefs, useful for audiobook producers or podcast teams casting voice actors:

```
The Shunning Season — Voice Cast Sheet
Narrator: [brief]
Elara Voss (protagonist): [brief]
Marcus Laine (deuteragonist): [brief]
Priya Desai (antagonist): [brief]
Jean-Luc Morel (mentor): [brief]
...
```

This exports as .md or .pdf from the Print and Export system.

---

## Scoring System: Story Grade

The story receives a continuously updating letter grade based on structural health. This is not subjective quality — it measures whether the architecture is complete and coherent.

### Scoring Dimensions

| Dimension | What It Measures | Source |
|---|---|---|
| **Author Depth** | Is the author profile complete? Does the Big Picture Statement exist? Are blind spots identified? | Phase 1 completeness |
| **Narrator Clarity** | Is the narrator type defined? Is the gap between author and narrator documented? Is reliability established? | Phase 2 completeness |
| **World Integrity** | Are genre, themes, plot structure, hallmarks, and society-as-character all defined? Are the Seven Story Deaths audited? | Phase 3 completeness + diagnostic |
| **Character Depth** | Does every character have Stream A/B conflict? Are wounds, flaws, and virtues coherent? Is the cast unique (no duplicate profiles)? Are all four network archetypes distributed? | Phase 4 completeness + collision check |
| **Relationship Architecture** | Is the relationship graph complete? Are dynamics, attachment styles, and structures assigned? Are society entries included? | Phase 5 completeness |
| **Story Structure** | Does the ending exist? Is the arc mapped? Is the tonal arc designed? Is the outline complete with scene metadata? | Phase 6 completeness |
| **Theoretical Alignment** | Does the story pass all Phase 7 checks? Consciousness Theory, Network Theory, Seven Deaths, Story Elements, resonance? | Phase 7 diagnostic results |
| **Voice Consistency** | Are character voices differentiated? Is the author's prose style consistent? Is tonal drift managed? | Voice fingerprint checks |
| **Conflict Depth** | Is conflict operating at multiple levels (macro, intragroup, intimate, internal, self-vs-world)? | Story Elements check |
| **Theme Resonance** | Does the theme question echo across at least 4 of 6 domains (wound, philosophy, relationship, world, genre, trope)? | Resonance check |

### Grading Scale

| Grade | Meaning |
|---|---|
| **A+ / A** | Architecture is complete, coherent, and resonant. All diagnostics pass. Ready to draft or publish. |
| **A- / B+** | Architecture is strong with minor gaps. One or two diagnostics have suggestions but no structural failures. |
| **B / B-** | Solid foundation but notable gaps. Some characters may lack depth, or theme resonance is partial. |
| **C+ / C** | Functional but thin. Multiple phases incomplete or diagnostics flagging structural issues. |
| **C- / D+** | Significant structural problems. Missing phases, duplicate characters, absent theme, or unaudited story deaths. |
| **D / D-** | Skeletal. Most phases incomplete. The story has material but not yet architecture. |
| **F** | Just started. Only a seed or a concept exists. |

### How the Grade Updates

- Completing a phase step raises relevant dimension scores
- Running a diagnostic and passing raises theoretical alignment
- Editing a character file and resolving a flagged issue raises character depth
- The grade is always visible in the top bar and the right sidebar
- Clicking the grade opens the full breakdown with actionable suggestions

### Arc Scoring (Separate)

Character arcs and the overall story arc receive their own sub-grades within the Character Depth and Story Structure dimensions:

**Per-character arc score** — based on:
- Is the Stream A/B conflict clear and specific?
- Is the wound producing visible behavioral distortion?
- Is the want/need distinction active?
- Is the arc direction defined (transformation, recognition, flat, corruption)?
- Does the character's voice shift across the arc?

**Overall story arc score** — based on:
- Does the ending exist and is it earned?
- Is the subproblem stack managed (threads converging, not dangling)?
- Is the tonal arc designed (not flat)?
- Does the climax resolve the theme question?
- Do the subplots echo the theme differently?

The LLM critiques arcs specifically, ranks them, and explains why the structural work at this stage is crucial — because arc problems compound through every chapter.

---

## Word Count Guidance by Medium

Based on the medium selected in Step 1, the system provides industry-standard word count targets:

**Written / Prose Formats:**

| Medium | Total Target | Per-Unit Target |
|---|---|---|
| Novel (Adult) | 70,000–100,000 words | 3,000–5,000 per chapter |
| Novel (YA) | 55,000–80,000 words | 2,500–4,000 per chapter |
| Novel (Middle Grade) | 25,000–50,000 words | 1,500–3,000 per chapter |
| Novella | 20,000–50,000 words | Variable |
| Novelette | 7,500–20,000 words | Variable |
| Short Story | 1,000–7,500 words | Single unit |
| Flash Fiction | Under 1,000 words | Single unit |
| Serial / Episodic Fiction | Variable (total); 2,000–5,000 per installment | Per installment |
| Graphic Novel | 80–200 pages (panels) | 4–6 panels per page |
| Comic Book / Manga (issue) | 22–32 pages | 4–6 panels per page |
| Poetry Collection | 48–100 pages | Variable per poem |
| Prose Poetry | 1,000–15,000 words | Variable |
| Flash Nonfiction / Essay | 500–5,000 words | Single unit |
| Epistolary | Variable (matches novel/novella targets) | Per letter/entry |

**Stage / Performance Formats:**

| Medium | Total Target | Per-Unit Target |
|---|---|---|
| Stage Play (Full-length) | 80–120 pages | 10–15 pages per act |
| One-Act Play | 10–40 pages | Single act |
| Musical | 90–130 pages (incl. lyrics) | 10–15 pages per act + songs |
| Opera / Libretto | 60–90 pages | Per act/scene |
| Ballet / Dance Narrative | 5–20 pages (synopsis + scene descriptions) | Per movement/act |
| Performance Art / Monologue | 5–30 pages | Single unit |

**Screen / Audiovisual Formats:**

| Medium | Total Target | Per-Unit Target |
|---|---|---|
| Feature Film | 90–120 pages (~1 page/minute) | 2–3 pages per scene |
| Short Film | 5–40 pages | 1–2 pages per scene |
| TV Series — 1hr Drama | 55–65 pages per episode | 5–7 pages per act |
| TV Series — 30min Comedy | 25–35 pages per episode | 3–5 pages per act |
| Miniseries (4–12 episodes) | 45–65 pages per episode | 5–7 pages per act |
| Web Series (episode) | 5–15 pages per episode | 2–3 pages per segment |
| Animated Series / Film | Same as live-action equivalent | + visual direction notes |
| Documentary | 20–40 pages (narration script) | Per segment/act |
| Video Essay | 1,500–5,000 words (narration) | Per section |

**Audio / Spoken Formats:**

| Medium | Total Target | Per-Unit Target |
|---|---|---|
| Audio Drama / Radio Play (episode) | 20–30 pages script | 5 pages per act |
| Podcast — Narrative (episode) | 3,000–8,000 words | Per segment |
| Audiobook | Matches source text length | Per chapter |
| Soundscape / Ambient Story | 2–10 pages (direction + minimal dialogue) | Per scene/movement |

**Interactive / Digital Formats:**

| Medium | Total Target | Per-Unit Target |
|---|---|---|
| Interactive Fiction / Text Adventure | 10,000–100,000+ words (all paths) | 200–1,000 per node/passage |
| Visual Novel | 30,000–200,000+ words (all routes) | Variable per scene |
| Video Game (Narrative) | 50,000–100,000+ words total | Variable by quest/chapter |
| TTRPG Campaign | 20,000–80,000 words (module) | 2,000–5,000 per session/chapter |
| LARP | 5,000–30,000 words (character sheets + plot docs) | Per character + scene |
| Hypertext Fiction | 5,000–50,000+ words (all paths) | 100–500 per lexia |
| ARG | Variable (puzzles + narrative docs + multimedia) | Per beat/phase |

**Emerging / Hybrid Formats:**

| Medium | Total Target | Per-Unit Target |
|---|---|---|
| Immersive Theatre | 10,000–40,000 words (script + character docs) | Per room/scene |
| VR / AR Narrative | 5,000–50,000 words (script + spatial notes) | Per environment/chapter |
| Social Media Story | 500–10,000 words total (across posts) | 50–500 per post |
| Transmedia Project | Sum of component format targets | Per component |

*Note: For branching formats (Interactive Fiction, Visual Novel, Hypertext, ARG), the word count represents total content across all paths. The "critical path" (shortest complete playthrough) is typically 30-50% of total content.*

The word count tracker in the bottom bar shows: current count / target count / percentage.

Per-chapter targets adjust based on outline length (total target ÷ number of chapters).

---

## Architecture Files — The Source of Truth

Before covering the drafting and editing workflows, it's important to name the files that govern everything downstream. These files are the **source of truth** for both the Author LLM (who generates chapters) and the Editor LLM (who reviews and improves them). Every generation, every review, and every revision must be grounded in these documents — not in memory, not in summary, not in vibes.

| File | Role | What It Governs |
|---|---|---|
| `author.md` | **The bible.** | The author's wound, psychology, blind spots, prose style, voice fingerprint, Big Picture Statement. Every sentence in the story is filtered through this lens. The Editor checks every chapter against it. |
| `narrator.md` | The mask. | POV, reliability, tense, distance, the gap between author and narrator. Determines what the reader can know, what is withheld, and how the telling frames what happens. |
| `arc.md` | The shape. | Protagonist's arc, tonal arc, subplot arcs, subproblem thread states. Every chapter must advance, complicate, or pay off something mapped here. |
| `outline.md` | The plan. | Chapter-by-chapter goals, dominant tones, active threads, scene metadata. The Editor checks whether each chapter delivered what the outline promised. |
| `characters/{name}.md` | The people. | Every character's wound, flaw, virtue, want, need, voice fingerprint, Stream A/B conflict, network archetype. The Editor checks whether characters sound like themselves and behave consistently with their psychology. |
| `relationships/relationship-graph.csv` | The web. | How every character perceives every other character — updated after each chapter. The Editor checks whether relationship shifts are earned and whether the graph reflects what just happened. |
| `world/world-building.md` | The ground. | Genre, themes, society-as-character, plot structure, hallmarks, rules. The Editor checks for world-consistency — does the story's world behave according to its own rules? |
| `world/hallmarks.md` | The icons. | The story's signature elements. The Editor tracks whether hallmarks recur appropriately and carry their symbolic weight. Can include mood board images (see Visual Reference System below). |
| `editor.md` | The reviewer. | A full author profile generated for the editor — their own wound, psychology, voice, and blind spots. The default editorial voice when no audience personas exist. The mismatch between author and editor psychology is what catches blind spots. |
| `audience.md` | The readers. | 3-5 fictional reader personas representing the target audience. Built from intended audience, genre, theme, content rating, and Big Picture Statement. The Editor reviews through their eyes. Optional — `editor.md` serves as default audience if this doesn't exist. |
| `story/metafiles-review.md` | The diagnostic. | Phase 7 audit results. The Editor references this to ensure known gaps have been addressed. |
| `feedback/editor-v{N}.md` | The critique. | Versioned Editor LLM review output. Each pass is saved as a file. The Editor reads all prior versions before generating a new review — catches persistent issues and tracks what's been addressed. |
| `feedback/external-v{N}.md` | The outside eye. | Versioned feedback from beta readers, writing groups, agents, workshops. Uploaded by user, reformatted into standard template. The Editor reads these to calibrate against real human reactions. |
| `feedback/author-notes-v{N}.md` | The self-check. | User's own revision notes captured during read-throughs. Quick-capture via highlight + shortcut while reading any chapter. |

**Rule: No chapter is generated or reviewed without these files open and consulted.** The Author LLM reads them before writing. The Editor LLM reads them before critiquing. This is what prevents drift, inconsistency, and the slow death of a story that forgets what it is.

---

## Silent Writing Assessment — Calibrating the Engine to the Author

Whenever the user provides writing — through any channel — the system quietly analyzes it to build a writing profile that feeds into `author.md`. This isn't a test and it's never surfaced as a grade or judgment. It's calibration data. The engine needs to know who it's working with so it can match their voice, calibrate the Editor's expectations, and set appropriate complexity defaults.

### What Gets Analyzed

The system collects writing samples passively from every natural touchpoint:

- **Chat messages** — how the user writes when they're thinking out loud, asking questions, describing ideas. Even casual chat reveals vocabulary range, sentence complexity, and natural register.
- **Manual entries** — Write In mode for character names, world details, Big Picture Statement, answers to template questions. These are the user writing with intention.
- **Uploaded drafts** — rough drafts, existing chapters, previous work brought in through Wizard Step 5 or Reverse Scaffolding. This is the richest signal.
- **Decomposition of their own work** — if the user decomposes something they wrote (not a published work), that's a direct sample of their output at its most polished.
- **Freeform chat** — conversations in Story Assistant mode where the user is brainstorming, journaling, or working through ideas.

The system does **not** analyze published works the user decomposed (those reflect someone else's writing), LLM-generated content (that reflects the model, not the user), or content the user explicitly pastes as reference/example from other writers.

### What Gets Measured

The analysis produces a multi-dimensional writing profile, not a single "grade level" number. The dimensions:

| Dimension | What It Captures | Example Range |
|---|---|---|
| **Vocabulary Sophistication** | Word choice complexity, frequency of uncommon words, register consistency | Everyday → Literary → Academic |
| **Sentence Complexity** | Average sentence length, subordination depth, syntactic variety | Simple/direct → Compound → Complex/nested |
| **Reading Level Estimate** | Flesch-Kincaid, Gunning Fog, or similar readability metric — translated to an audience band rather than a raw number | Middle Grade → YA → Adult General → Adult Literary |
| **Tonal Register** | The emotional and intellectual register the writer defaults to | Casual → Conversational → Formal → Elevated |
| **Narrative Instincts** | When the user describes story ideas, do they lead with plot, character, theme, world, or voice? | Plot-first → Character-first → Theme-first → Voice-first |
| **Confidence Markers** | Hedging frequency, qualifier usage, assertiveness of claims — indicates how the user relates to their own authority as a writer | Tentative → Developing → Assured → Commanding |
| **Genre Fluency** | How naturally the user uses genre conventions, tropes, and vocabulary in their descriptions | Newcomer → Familiar → Fluent → Expert |

### How It's Used (Not Displayed)

The writing profile feeds into three systems silently:

**1. Author.md enrichment.** The profile populates or adjusts fields in the author file that the user might not self-report accurately. Most writers overestimate or underestimate their own reading level. The system's assessment becomes a quiet second opinion that the Author LLM and Editor LLM can reference. It appears in `author.md` under a `## Writing Profile (System-Assessed)` section with soft language:

```
### Writing Profile (System-Assessed) — Output Format in author.md

Based on your writing across this project, the engine has observed:

- Natural vocabulary register: Conversational to literary,
  comfortable shifting between registers
- Sentence rhythm: Varied — mixes short declarative with
  longer subordinate constructions
- Estimated audience match: Adult general fiction
  (accessible literary)
- Narrative instinct: Character-first — you tend to describe
  story ideas through who the people are before what happens
- Voice confidence: Assured — your writing voice is consistent
  and distinctive
```

**2. Editor calibration.** The Editor LLM uses the profile to pitch its feedback at the right level. If the user writes at a YA level, the Editor doesn't critique them for not using Faulknerian subordinate clauses. If the user writes at a literary level, the Editor doesn't dumb down its vocabulary. The feedback matches the writer.

**3. Complexity defaults.** When the system sets defaults for things like word count targets, sentence length recommendations, and vocabulary parameters in the output template, it uses the writing profile as a starting point. A writer whose natural register is middle grade gets different defaults than one whose register is adult literary — not because one is better, but because the engine should amplify the writer's natural voice, not impose a foreign one.

### The Reveal (Optional, User-Initiated)

The system never volunteers the assessment. But the user can ask for it. In the author.md file view, a small expandable section labeled "Writing Profile (System-Assessed)" appears once enough samples have been collected (minimum ~500 words across at least 3 touchpoints). The section is collapsed by default with a subtle label:

```
┌─────────────────────────────────────────────────────┐
│  📊 Writing Profile (System-Assessed)     [Expand ▸]│
│                                                     │
│  Based on your writing across this project.         │
│  This helps the engine match your voice.            │
└─────────────────────────────────────────────────────┘
```

When expanded, the profile is presented in **neutral, descriptive language** — never evaluative. "Your vocabulary register is conversational to literary" not "Your vocabulary is at a 10th grade level." "Your estimated audience match is adult general fiction" not "You write at an adult level." The framing is always "here's what the engine observed so it can serve you better" — never "here's how good you are."

**Override:** Every assessed dimension has an override toggle. If the user disagrees ("I write YA but I want this project to be adult literary"), they can manually set the target and the system adjusts. The assessed profile becomes "where you naturally write" and the override becomes "where you want this project to land" — and the gap between them is useful data for the Editor, who can flag when the prose drifts back toward the natural register.

### Accumulation Across Projects

The writing profile is per-project by default (since a user might write differently for different projects), but there's also a **global author profile** that accumulates across all projects. This lives in the app's settings, not in any project folder. It represents the system's overall understanding of the writer. When starting a new project, the global profile seeds the initial defaults, which the project-specific samples then refine.

The global profile also enables a quiet, long-term feature: **growth tracking.** Over months or years of use, the system can observe whether the writer's vocabulary is expanding, whether their sentence complexity is increasing, whether their confidence markers are shifting. This is never surfaced as a "you've improved!" notification (patronizing), but it's available in the settings under "Writing Journey" as an optional, private reflection tool — a timeline showing how the writer's profile has evolved across projects.

---

## Chapter-by-Chapter Review Workflow

Once the architecture is complete (Grade B+ or higher recommended), the system enters **Drafting Mode**.

### Step 1: Pre-Flight

Before each chapter, the system runs the Before Drafting checks automatically:
- Continuity check (what changed last chapter)
- Character consistency check (for every character appearing)
- Tonal arc position check
- Chapter goal reminder from outline

These are presented as a brief summary card the user can review and approve before writing begins.

### Step 2: Draft or Generate

Two paths:
- **User writes** — Center Stage switches to Editor mode. The system provides the pre-flight context in a collapsible panel above the editor.
- **System generates** — The LLM produces a first-pass chapter draft based on the complete architecture. Presented in Reader mode for review.

### Step 3: Review

After each chapter is written or generated:

- **Read it** — Reader mode with TTS available
- **Summary** — For long chapters or slow readers, the LLM provides a 2-3 paragraph summary of what happens in the chapter
- **Grade it** — The system runs During Drafting checks:
  - Scene correlation test (are all domains active?)
  - Voice consistency (does it sound like this author?)
  - Narrator reliability (is the gap maintained?)
  - Tonal drift check
  - Voice differentiation (can you tell speakers apart?)
- **Critique it** — The LLM provides specific, constructive feedback:
  - What's working well
  - What's structurally weak
  - Specific line-level suggestions
  - Arc progression check (is the character moving?)
  - Pacing assessment

### Step 4: Feedback Loop

The user can:
- **Approve and send to Editor** — Chapter moves to the Editor Phase (Phase 9). The Author LLM is done with this chapter; the Editor LLM takes over.
- **Request changes** — Provide specific feedback. The Author LLM revises and presents again.
- **Edit directly** — Switch to Editor mode and make changes manually.
- **Regenerate** — Discard and generate a new draft of this chapter.

### Step 5: Post-Flight

After the Author approves a chapter (before or after Editor review, depending on workflow setting), the system automatically:
- Updates the relationship graph if any relationships shifted
- Updates the subproblem thread tracker
- Writes the handoff note for the next chapter
- Updates the overall story grade
- Advances the progress checklist

---

## Phase 9 — The Editor

*A separate LLM session that acts as a professional story editor. The Editor is not the Author. They are a different mind with a different job: find what's broken, inconsistent, thin, or drifting — and either fix it or flag it.*

### Why a Separate Session

The Author LLM generates chapters while holding the full creative context — the wound, the voice, the emotional momentum. That's its strength, but it's also its blind spot. The Author is *inside* the story. They have the same inability to see their own patterns that a real author does.

The Editor LLM starts a fresh session with no memory of the creative decisions that produced the draft. It reads the architecture files and the prose with cold eyes. It catches the things the Author can't see because the Author was the one who wrote them:

- A character who spoke in clipped, staccato rhythm in Chapter 2 suddenly using long flowing sentences in Chapter 7 with no in-story reason
- A plot thread opened in Chapter 3 that the Author forgot about by Chapter 9
- A relationship that shifted off-page — the graph says hostile, but the dialogue reads friendly
- A tonal drift from the arc spec that leaked in because the Author's "mood" shifted between sessions
- A scene where the narrator reveals information they shouldn't know at this point (reliability breach)
- World-rule violations — magic, technology, or social norms behaving inconsistently
- A character making a decision that contradicts their wound, flaw, or personal code without the narrative acknowledging the contradiction

### What the Editor Reads (Every Time)

The Editor's context is loaded with the architecture files before it sees any prose. This is non-negotiable — every review session begins by reading:

1. `editor.md` — the editor's own psychology, wound, and blind spots (defines *how* they read)
2. `author.md` — the bible. Voice fingerprint, wound, prose style, Big Picture Statement (defines what the story *should* sound like)
3. `narrator.md` — POV, reliability, tense, distance
4. `arc.md` — tonal arc, protagonist arc, subplot arcs, current thread states
5. `outline.md` — what this chapter was supposed to accomplish
6. `characters/{name}.md` — for every character who appears in the chapter under review
7. `relationships/relationship-graph.csv` — the current state of every relevant pair
8. `world/world-building.md` — genre, rules, society, hallmarks
9. `audience.md` — reader personas (if they exist) — who is this story for?
10. `story/chapter-checklist.md` — handoff notes from prior chapters
11. The previous chapter's prose (for continuity)
12. The chapter under review

The Editor does not improvise. It measures the prose against the architecture.

### What the Editor Checks

#### Pass 1: Consistency

- **Voice consistency** — Does each character's dialogue match their voice fingerprint (speech rhythm, vocabulary register, dialogue tic, metaphor family, defensive pattern, subtext default)? Does the narrator's voice match `narrator.md`?
- **Character behavior** — Is each character acting in accordance with (or in intentional, acknowledged violation of) their wound, flaw, values, and personal code?
- **Continuity of knowledge** — Does each character remember what they know? Are they acting on information they learned in prior chapters? Have they forgotten anything without an in-story reason?
- **Relationship accuracy** — Does the way characters interact match the relationship graph? If a relationship shifted in this chapter, is the shift earned and visible?
- **World-rule consistency** — Does the world behave according to its own established rules? If a rule is broken, is it acknowledged as exceptional?
- **Timeline consistency** — Do time references, seasons, ages, and durations remain accurate across chapters?

#### Pass 2: Structural Integrity

- **Thread tracking** — Are the subproblem threads in the correct state? Does this chapter advance, complicate, or resolve what the outline says it should?
- **Tonal arc adherence** — Does the chapter's dominant tone match the tonal arc spec in `arc.md`? If it deviates, is the deviation designed or accidental?
- **Arc progression** — Is the protagonist (and each character with an arc) moving along their arc at the right pace? Too fast (unearned growth)? Too slow (stalling)? Static when they should be shifting?
- **Planted evidence** — If the outline specifies foreshadowing or Chekhov's guns for this chapter, are they present? Are they subtle enough?
- **Pacing** — Is the chapter the right length for its function? Is it front-loaded, back-loaded, or balanced? Does it earn its page count?

#### Pass 3: Quality and Craft

- **Prose style** — Does the writing match the author's rolled literary era, cultural tradition, and voice tendency?
- **Show vs. tell** — Are emotions and states demonstrated through behavior, or announced through exposition?
- **Dialogue quality** — Does dialogue do double duty (advance plot AND reveal character)? Are there exchanges that are just information delivery?
- **Scene correlation** — Are plot, character, theme, relationship, and world domains all active in this chapter, or are some siloed?
- **Sensory and scenic craft** — Is the setting doing active work (externalizing state, exerting pressure, carrying history, creating contrast)?
- **Grammar, spelling, and mechanics** — Catch errors, typos, and awkward constructions

#### Pass 4: Deepening (Optional — Multi-Pass Mode)

This is where the Editor goes beyond QA and into craft improvement:

- **Character motivation** — Can motivation be made more specific, more conflicted, more human?
- **Tension** — Where can tension be added? Where are characters too comfortable, too agreeable, or too clean?
- **Messiness** — Real people are messy. Are these characters making contradictory choices, holding inconsistent beliefs, being petty or irrational in ways that are psychologically coherent with their profile?
- **Subtext** — Is there enough unsaid? Are characters saying exactly what they mean too often?
- **The thing the author is avoiding** — Based on the author's wound and blind spots in `author.md`, is there a moment in this chapter where the author pulled a punch? Where they softened a consequence, resolved a tension too quickly, or protected a character who should have been hurt?

### Editor Output: The Review Report

For each chapter, the Editor produces a structured report:

```
## Editor Review — Chapter {N}

### Pass: {number} | Date: {timestamp}

### Consistency Issues
- [CRITICAL] Character X uses vocabulary register "literary/elevated" in lines 45-52,
  but their voice fingerprint specifies "plain/working." No arc-based reason for the shift.
- [MINOR] Timeline: Chapter 4 established it was late November. This chapter references
  autumn leaves still on trees — inconsistent for the geography.

### Structural Issues
- [WARNING] Subplot thread "Jean-Paul echo" was marked ACTIVE in arc.md but does not
  appear in this chapter. The outline specifies it should surface here.
- [NOTE] Tonal arc spec calls for "controlled cool" but the chapter reads as "warm."
  The warmth may be intentional (pre-crack contrast) — author should confirm.

### Quality Suggestions
- Lines 78-84: This exchange between Maren and Ruth is information delivery disguised
  as dialogue. Consider: what does each character WANT from this conversation that they
  aren't saying?
- The setting (county records office) is described but not doing work. What pressure
  does this specific room put on Maren? What memory does it trigger?

### Deepening Opportunities
- Maren accepts Ruth's explanation at line 102 too quickly given her wound
  (identity erasure) and flaw (rigidity). A character with this profile would
  push harder or shut down — not nod.
- Jean-Luc's humor in this chapter is landing but not costing him anything.
  Per his character file, the humor is grief-avoidance. Where is the grief
  leaking through?

### Summary
- Critical issues: 1
- Warnings: 2
- Quality suggestions: 4
- Deepening opportunities: 3
- Recommended: Revision before approval
```

### Author Approval Modes

The user chooses how they want to work with the Editor. This is set per-project but can be changed at any time:

#### Mode 1: Auto-Approve (Hands-Off)

The Editor's changes are applied automatically. The user sees a diff (before/after) for each chapter and can undo any change they disagree with. Best for users who trust the system and want speed.

- Editor makes changes directly to the chapter file
- User is notified with a summary of what changed
- User can review the diff and revert specific changes
- Critical issues are still flagged for user review (never auto-resolved)

#### Mode 2: Approve Per Chapter (Default)

The Editor produces the review report. The user reads it, then decides for each item:

- **Accept** — Apply this change
- **Reject** — Keep the original
- **Discuss** — Open a conversation with the Editor about this specific issue (the Editor explains its reasoning; the user can provide context the Editor doesn't have)
- **Send back to Author** — Flag this issue for the Author LLM to revise in the next pass

This is the recommended mode. It teaches the user what strong editing looks like while keeping them in control.

#### Mode 3: Approve Per Story Arc (Batch)

The Editor reviews all completed chapters at once, focusing on cross-chapter consistency rather than per-chapter issues. Produces a single consolidated report covering:

- Consistency issues across the full manuscript
- Arc pacing across all chapters (is the protagonist moving fast enough? too fast?)
- Relationship evolution tracking (does the graph's trajectory make sense chapter over chapter?)
- Tonal arc adherence across the full draft
- Thread tracking (which threads are dangling? which resolved too early?)
- Voice drift (has a character's voice subtly changed across chapters?)

The user reviews the full report and approves or rejects items in bulk.

#### Mode 4: Multi-Pass Deep Edit

For users who want the story to go through several rounds of improvement — like the back-and-forth between two LLMs that you described. The workflow:

1. **Pass 1 — Author generates** the chapter
2. **Pass 2 — Editor reviews** (consistency + structural integrity)
3. **Pass 3 — Author revises** based on Editor notes, with full architecture context reloaded
4. **Pass 4 — Editor reviews again** (quality + craft + deepening)
5. **Pass 5 — Author revises** — adding more motivation, more tension, more mess, more subtext
6. **Pass 6 — Editor final review** — checks that revisions didn't introduce new inconsistencies
7. **Repeat** until the chapter meets the quality bar or the user calls it done

Each pass is a fresh LLM session. The Editor always re-reads the architecture files. The Author always re-reads the architecture files plus the Editor's notes. Neither operates from memory of prior passes — they operate from the files.

The user can configure:
- Maximum number of passes (default: 3, max: 6)
- What each pass focuses on (consistency only → structural → quality → deepening)
- Whether to auto-advance or pause for approval between passes
- A quality threshold (Story Grade of B+ or higher) that auto-stops the loop

### Editor Personas — Reading Through Your Audience's Eyes

The Editor isn't one person. It's a panel of readers.

Every story has a target audience — defined by the author's intended audience (Children / Teens / New Adult / Adults), genre expectations, and the specific human experiences the story's theme speaks to. The Editor persona system generates reader profiles based on these parameters, then reviews the story through each persona's lens.

#### How Personas Are Built

When the project is created, the system generates an `audience.md` file based on:

- The **intended audience** from `author.md` (age group, maturity level)
- The **genre** from `world/world-building.md` (genre readers have specific expectations)
- The **theme question** (what life experience does this theme speak to?)
- The **content rating** (what intensity level is this reader comfortable with?)
- The **Big Picture Statement** (what emotional truth is the author trying to deliver?)

From these, the system constructs 3-5 **Editor Personas** — fictional readers who represent different segments of the target audience. **These personas are unique to every project.** A YA sci-fi thriller generates different personas than a literary novel about a Mennonite community, which generates different personas than a romantic comedy screenplay. The personas reflect the actual audience for *this specific story* — its genre, its themes, its cultural context, its content rating, and the kind of reader who would pick it up.

**Default behavior — when no editor personas have been specified by the user:**

The system generates a full `editor.md` file using the same engine docs and randomization process as `author.md`. This generated editor is a complete author profile — with their own wound, psychology, MBTI, Enneagram, moral alignment, prose style, voice fingerprint, and blind spots — but their role is reviewer, not creator. They become the default editor voice and audience perspective for the project.

This works because the engine already knows how to build a person with a specific psychology. An editor with a different wound than the story's author will catch different things. An editor who is an INTJ-A with a Stoic philosophy and a wound of betrayal will read a chapter very differently than one who is an ENFP-T with an Absurdist philosophy and a wound of abandonment. The mismatch between author and editor psychology is the feature — it's what produces the friction that finds blind spots.

The generated `editor.md` is stored alongside `author.md` in the project folder. The user can:
- Keep the generated editor as-is
- Re-roll to get a different editorial perspective
- Fill out the editor profile themselves (to create a specific editorial voice)
- Replace the single editor with the multi-persona system (audience personas) at any time
- Use both — the generated editor for structural/craft QA, and audience personas for reader-perspective feedback

The editor profile also serves as the default **audience** when audience personas haven't been created yet. The editor reads as a proxy for the reader: their psychology determines what they notice, what bothers them, and what they think the story needs.

Each persona has:

| Attribute | What It Captures |
|---|---|
| **Name and age** | A specific person, not a demographic. "Keiko, 34" not "millennial women." |
| **Life situation** | What they're dealing with right now — career pressure, new parenthood, grief, identity questions, financial stress, loneliness, a relationship ending |
| **Why they picked up this book** | What drew them to this genre and premise. What they're hoping to feel. |
| **What resonates with them** | Which themes, character types, and emotional registers will land because of their lived experience |
| **What won't make sense to them** | Assumptions the author makes that this reader doesn't share — cultural references, relationship dynamics, emotional responses that feel foreign to this specific life |
| **What will lose them** | Pacing problems, tonal missteps, or character behaviors that break their trust or patience |
| **What they're reading for** | Escape? Recognition? Challenge? Catharsis? Education? Entertainment? |

#### Example Personas (Project-Specific — These Change for Every Story)

The following are examples of what the system *would generate* for a specific project — a literary thriller set in a Mennonite community. A different project would produce entirely different personas. A YA fantasy might generate "Marcus, 16 — reads Sanderson and Leigh Bardugo, will lose patience if the magic system has inconsistent rules" and "Priya, 14 — new to fantasy, needs clear worldbuilding, will be confused by unexplained jargon." A horror screenplay might generate "Carmen, 38 — horror veteran, will spot every telegraphed jump scare, wants atmospheric dread not gore" and "Tyler, 25 — casual horror fan, needs the stakes established early or he'll check his phone."

**Example for a literary thriller set in a Mennonite community:**

**Persona 1 — "David, 42"**
High school history teacher. Raised loosely Protestant, now agnostic. Reads literary fiction and true crime. Picked this up because the Mennonite setting felt unfamiliar and the PI premise promised structure. Will resonate with themes of returning to a place you outgrew. Will lose patience if the mystery stalls for too long in emotional territory without advancing the case. Reads for: intellectual engagement + emotional surprise.

**Persona 2 — "Amara, 28"**
Grad student in sociology. Queer, first-generation American. Reads across genres but gravitates toward stories about outsiders in closed communities. Will resonate deeply with Maren's bisexuality and her relationship to a community that can't hold her full identity. Will notice if the queer experience is treated as subplot rather than structural. Reads for: recognition + representation that doesn't simplify.

**Persona 3 — "Ruth Ann, 61"**
Retired librarian. Mennonite background (left the church at 30). Reads everything. She's the reader who will catch every cultural inaccuracy — the wrong hymnal, the wrong term for church discipline, the wrong social dynamic between bishop and congregation. Will resonate with Ruth Yoder's position (the one who stayed). Will be frustrated if the community is flattened into a monolith. Reads for: seeing her own history rendered with precision and dignity.

#### Multi-Persona Review Mode

When activated, each Editor Persona reviews the chapter independently and produces their own review report — written in their voice, from their perspective. The reports are presented side by side:

```
┌─────────────────┬─────────────────┬─────────────────┐
│  David (42)     │  Amara (28)     │  Ruth Ann (61)  │
│                 │                 │                 │
│  "The pacing    │  "Maren's      │  "The Ordnung   │
│  in this        │  reaction to    │  reference in   │
│  chapter drags  │  Clara's letter │  paragraph 3 is │
│  after the      │  feels muted —  │  wrong — that   │
│  records scene. │  a bisexual     │  discipline     │
│  The mystery    │  woman finding  │  process would  │
│  needs to       │  a love letter  │  take months,   │
│  advance."      │  from 1933      │  not weeks."    │
│                 │  would feel     │                 │
│  ☐ Accept       │  more."         │  ☑ Accept       │
│  ☐ Reject       │                 │  ☐ Reject       │
│  ☐ Discuss      │  ☑ Accept       │  ☐ Discuss      │
│                 │  ☐ Reject       │                 │
│                 │  ☐ Discuss      │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

The user can:

- **Pick and choose** — Check individual suggestions from any persona. Mix and match across all of them.
- **Accept all from one persona** — If one persona's feedback consistently matches the author's vision, accept their full report.
- **YOLO Mode** — Accept all suggestions from all personas at once. The Author LLM integrates them all in the next pass. Maximum chaos, maximum improvement, maximum speed. Named because you're trusting the audience more than yourself — which is sometimes exactly right.
- **Dismiss a persona** — If a persona's perspective isn't useful for this story, remove them from future reviews. Add a new one if needed.

#### Persona-Informed Generation

The personas don't just edit — they also inform generation. When the Author LLM writes a chapter, the audience file is part of its context. It knows:

- What will land with David (structure, pacing, intellectual hooks)
- What Amara will look for (authentic identity representation, structural not tokenistic)
- What Ruth Ann will scrutinize (cultural accuracy, emotional truth about leaving)

This means the first draft is already audience-aware. The Editor personas then verify whether the Author successfully delivered.

#### Custom Personas

Users can also create their own Editor personas — a specific beta reader, a publishing agent, a genre expert, a sensitivity reader, or even "my mom who reads two books a year and will tell me if she's confused." Each custom persona follows the same attribute template.

---

### Editor in the UI

The Editor appears as a **new tab or panel** within the Center Stage, distinct from the Author's writing space:

- **Editor Panel** — shows the review report alongside the chapter text, with issues linked to specific line numbers
- **Diff View** — before/after comparison showing exactly what the Editor proposes to change
- **Issue Tracker** — a running list of all Editor findings across all chapters, filterable by severity (critical / warning / suggestion / deepening), status (open / accepted / rejected / discussed), and type (consistency / structural / quality / deepening)
- **Pass History** — shows how the chapter evolved across passes, with diffs between each version

The right sidebar's Progress Checklist updates to show Editor status per chapter:

```
Chapter 1  ✅ Drafted  ✅ Edited (Pass 2)  ✅ Approved
Chapter 2  ✅ Drafted  🔄 In Editor Review (Pass 1)
Chapter 3  ✅ Drafted  ⏳ Awaiting Editor
Chapter 4  📝 In Progress
```

### Conflict Resolution — Author vs. Editor Disagreements

The Editor and Author are separate LLM sessions with different perspectives. They will sometimes disagree — the Editor flags something the Author wrote intentionally, or the Author's revision introduces something the Editor previously fixed. This is a feature, not a bug. The friction is productive.

**The user is always the tiebreaker.** This works like a merge conflict in version control:

1. The Editor flags an issue or proposes a change
2. The Author revises (or doesn't)
3. If the Editor and Author disagree on the result, both positions are presented side by side
4. The user reads both arguments and decides: **Accept Editor's version**, **Keep Author's version**, or **Write their own resolution**
5. The user's decision is final. The system records it and moves on.

**In YOLO / Auto-Approve mode:** The Author is always right. The Editor's suggestions are applied only when they don't conflict with the Author's intent. If there's a genuine disagreement (the Editor wants to cut a scene, the Author resists), the Author wins automatically and the user is notified of the override in the review summary. The user can always go back and side with the Editor after the fact.

**Conflict log:** All disagreements are logged in the Editor's issue tracker with both positions preserved. This lets the user review patterns — if the Editor keeps flagging the same type of issue and the Author keeps overriding it, that's a signal worth paying attention to.

### The Feedback File System

All feedback — whether from the simulated Editor, external beta readers, a writing group, or the user's own notes — lives in versioned `.md` files inside a `feedback/` folder in the project directory. One pattern, one format, one place to look.

**File structure:**

```
feedback/
  editor-v1.md          ← Editor LLM's first review pass
  editor-v2.md          ← Editor LLM's second review (post-revision)
  editor-v3.md          ← Editor LLM's final pass
  external-v1.md        ← Beta reader / writing group feedback (uploaded)
  external-v2.md        ← Second round of external feedback
  author-notes-v1.md    ← User's own revision notes
```

**The feedback file format:**

Every feedback file — regardless of source — follows the same structure so they're readable, comparable, and useful to both humans and the Editor LLM:

```markdown
# Feedback: [Source Label]
Source: Editor (Simulated) | External (Beta Reader) | External (Writing Group) | Author (Self)
Version: 1
Date: 2026-03-31
Scope: Full manuscript | Chapters 1-4 | Chapter 7

## Summary
[2-3 sentence overall assessment]

## Chapter-Level Notes
### Chapter 1
- [Note with specific reference]
- [Note with specific reference]

### Chapter 3
- [Note]

## Cross-Cutting Issues
- [Pattern that spans multiple chapters]

## Strongest Moments
- [What's working — important for morale and for knowing what NOT to change]

## Recommended Priority
1. [Most important fix]
2. [Second priority]
3. [Third priority]
```

**Source tagging** is the key distinction. Every feedback file is clearly marked:

- **Editor (Simulated)** — generated by the Editor LLM. The system auto-creates these during the review workflow. They follow the same 4-pass structure already defined (consistency, craft, deepening, final check), but now each pass is saved as a versioned file rather than just displayed in the review panel and forgotten.
- **External (Beta Reader)** / **External (Writing Group)** / **External (Agent)** / **External (Workshop)** — uploaded by the user. The user brings in feedback from real humans. They can either paste it into a template the system provides, or upload raw notes and the system reformats them into the standard structure (with the user's approval).
- **Author (Self)** — the user's own revision notes, captured during read-throughs or brainstorming sessions. The system offers a quick-capture option: while reading any chapter, the user can highlight text and press a shortcut to add a note directly to the current author-notes file.

**Version progression** is the second key feature. Each new round of feedback on the same story gets the next version number. The system shows progression over time:

```
┌──────────────────────────────────────────────────────────┐
│  Feedback Timeline                                       │
│                                                          │
│  ──●──────────●──────────●──────────●───────── time      │
│    │          │          │          │                     │
│    editor-v1  external-v1 editor-v2  external-v2         │
│    (42 notes) (18 notes) (23 notes) (7 notes)            │
│    ▓▓▓▓▓▓▓▓  ▓▓▓▓       ▓▓▓▓▓     ▓▓                   │
│                                                          │
│  Issues resolved across versions:                        │
│  v1 → v2: 31 of 42 editor notes addressed               │
│  ext-v1 → ext-v2: 14 of 18 external notes addressed     │
│                                                          │
│  Recurring flags (appeared in 2+ rounds):                │
│  • Pacing in Act II (editor-v1, external-v1, editor-v2)  │
│  • Marcus voice consistency (editor-v1, editor-v2)       │
│                                                          │
│  [View All] [Compare Versions] [Upload New Feedback]     │
└──────────────────────────────────────────────────────────┘
```

The **recurring flags** feature is critical — if the same issue shows up across multiple feedback sources and multiple rounds, it surfaces automatically as a persistent problem. The Editor LLM reads all prior feedback files before generating a new review, so it can explicitly say "I flagged the pacing in Act II in my v1 review. After your revisions, this has improved in chapters 4-5 but the problem persists in chapter 6."

**How external feedback enters the system:**

1. The user clicks "Upload Feedback" in the feedback panel (accessible from the Left Nav under the project, or via Command Palette)
2. They can paste text, upload a .md / .txt / .docx file, or even paste screenshots of handwritten notes (the LLM extracts the text)
3. The system asks: "Who is this from?" with options: Beta Reader, Writing Group, Agent/Editor (professional), Workshop, Other
4. The system reformats the raw feedback into the standard template structure — organizing by chapter, extracting cross-cutting issues, identifying strongest moments. The user reviews and approves the reformatted version before it's saved
5. The file is saved as `external-v{N}.md` with the source label and date

**How the Editor LLM uses feedback files:**

Before every review pass, the Editor reads all existing feedback files in the project. This gives it:

- **History** — what's already been flagged, what's been addressed, what persists
- **External perspective** — real human reactions that the LLM's simulated review might miss
- **Calibration** — if a beta reader loved something the Editor was about to critique, that's useful tension (and the Editor should note the disagreement rather than silently overriding the human's reaction)

The Editor's own output is saved to the same folder in the same format, creating a continuous loop: Editor reviews → user revises → external readers respond → Editor reviews again with all prior context.

**How the Author LLM uses feedback files:**

When generating or revising chapters, the Author LLM can optionally read feedback files (user toggles this in settings). This lets it preemptively address known issues — if feedback-v1 flagged "Marcus sounds too formal in casual scenes," the Author adjusts Marcus's voice in subsequent chapters without the user needing to manually specify it.

### Chapter Generation Rules

**Chapters are generated one at a time, sequentially.** Each chapter builds on every preceding chapter — the LLM reads all prior chapters plus the full architecture before writing the next one. Batch generation (generating chapters 4-8 at once) is not supported because it would break continuity, voice drift tracking, and relationship graph updates.

**The generation loop for each chapter:**

1. Pre-flight checks run (continuity, character consistency, tonal arc, chapter goal)
2. **Scene Dynamics Forecast** (see below) — the system predicts probable emotional collisions and collaborative moments
3. The Author LLM reads: all architecture files + all completed chapters + the outline entry for this chapter + dynamics forecast
4. The Author generates the draft
5. The user reviews and approves (or requests revision)
6. **Reader Experience Report** (see below) — the system analyzes the chapter from the reader's perspective
7. Post-flight runs (relationship graph update, thread tracker, handoff note)
8. Only then can the next chapter begin

### Scene Dynamics Forecast — What's About to Collide

Before each chapter is generated, the system reads the current state of every character who will appear in the scene — their emotional palette position (which emotions are in Home, which have been unlocked), their somatic state from the previous chapter, their relationship dynamics with every other character present, their active subproblem threads, and their arc position — and produces a **dynamics forecast**: a prediction of what's likely to happen when these people interact about this subject at this moment in the story.

This is similar to how relationship simulation games narrow the possibility space — at any given point, the combination of character motivations, personal feelings toward themselves, each other, the goals, and the unresolved pain creates a finite set of probable paths. The forecast identifies these paths.

```
┌──────────────────────────────────────────────────────────┐
│  Scene Dynamics Forecast — Chapter 7                     │
│                                                          │
│  CHARACTERS PRESENT: Elara, Marcus, Priya                │
│  SETTING: Marcus's apartment, evening, after the reveal  │
│                                                          │
│  ⚡ HIGH-PROBABILITY COLLISIONS:                         │
│                                                          │
│  Elara ↔ Marcus                                          │
│  Her wound (abandonment) is fully activated after Ch.6   │
│  His pattern (overreach → retreat) will fire when she    │
│  goes cold. If he says anything resembling "trust me"    │
│  → her coldness response triggers → he reads it as       │
│  rejection → withdrawal spiral.                          │
│  Probable emotions: Wariness + buried fury (her),        │
│  desperate tenderness + frustration (him)                │
│                                                          │
│  Elara ↔ Priya                                           │
│  Priya knows the secret Elara just discovered. Elara     │
│  doesn't know Priya knew. When this surfaces → betrayal  │
│  response, but complicated because Priya's motivation    │
│  was protective. This is a "good intention, devastating  │
│  impact" collision.                                      │
│  Probable emotions: Indignation + disbelief (Elara),     │
│  guilt + defensive resolve (Priya)                       │
│                                                          │
│  Marcus ↔ Priya                                          │
│  Alliance under pressure — they both care about Elara    │
│  but handled it differently. Tension between them is     │
│  secondary but present: he blames her for not telling    │
│  Elara sooner.                                           │
│  Probable emotions: Accusatory + helpless (him),         │
│  controlled + impatient (her)                            │
│                                                          │
│  🔀 POSSIBLE PATHS:                                      │
│                                                          │
│  Path A: Elara explodes → confrontation with both →      │
│  Marcus tries to mediate → makes it worse → Elara        │
│  leaves. (Wound regression — high drama, low growth)     │
│                                                          │
│  Path B: Elara goes cold → quiet devastation → Marcus    │
│  and Priya realize the damage together → chapter ends    │
│  with Elara alone, processing. (Wound activation →       │
│  sets up growth in Ch.8)                                 │
│                                                          │
│  Path C: Elara confronts Priya directly, ignoring        │
│  Marcus → fractures the trio's dynamic → forces Marcus   │
│  to choose sides. (Relationship restructuring)           │
│                                                          │
│  💡 ARC OPPORTUNITY:                                     │
│  Elara's "grief (open)" is in her Stretch tier — this    │
│  chapter could be the moment it unlocks. If she grieves  │
│  instead of raging, it's a Stretch → Home promotion      │
│  and a major arc milestone.                              │
│                                                          │
│  [Use as guidance] [Override with my own direction]       │
│  [Generate chapter]                                      │
└──────────────────────────────────────────────────────────┘
```

**What the forecast does:**
- Identifies the **highest-tension pairings** in the scene and predicts their emotional collision based on current state
- Maps **probable paths** — the 2-4 most likely outcomes given all the character dynamics in play
- Flags **arc opportunities** — moments where a Stretch emotion could unlock, a Blocked emotion could crack, or a relationship could shift
- Highlights **wound triggers** — specific words, actions, or situations that would activate a character's wound based on their established patterns

**What the forecast does NOT do:**
- It doesn't choose the path. The Author LLM (or the user) decides which direction to take. The forecast is intelligence, not instruction.
- It doesn't constrain. If the user says "actually, Elara would laugh in this moment — she's dissociating," that's valid. The forecast is a prediction, not a rule.

**How it's generated:** The LLM reads all character files, relationship dynamics, emotional palettes (current state including what's been unlocked this far in the story), somatic signatures, the outline entry for this chapter, and the tonal arc position. It produces the forecast as a structured analysis. The Author LLM then receives this forecast as context when generating the chapter — it knows what's loaded, what's likely, and what the arc needs.

### Reader Experience Report — How the Chapter Feels to Read

After a chapter is drafted (and optionally after each revision), the system generates a **Reader Experience Report** — an analysis of what the audience will actually experience when they read this chapter. This isn't about craft or consistency (that's the Editor's job). It's about pacing, emotional impact, and the felt experience of time.

```
┌──────────────────────────────────────────────────────────┐
│  Reader Experience Report — Chapter 7                    │
│                                                          │
│  PACING                                                  │
│  ████████░░░░░░░░████████████████░░░░░░████████████████  │
│  slow     pause   accelerating        rapid → held beat  │
│                                                          │
│  Read time: ~18 minutes at average reading speed         │
│  Feel: This is a FAST chapter. The confrontation         │
│  creates forward momentum — readers won't put this down  │
│  mid-chapter. The two pauses (Elara alone in the         │
│  hallway, the moment before she opens the door) give     │
│  breathing room but increase tension rather than         │
│  release it.                                             │
│                                                          │
│  EMOTIONAL TRAJECTORY                                    │
│  ┌────┐                                                  │
│  │    │                    ╱╲                             │
│  │Dread ──── Shock ──── Fury ── Grief(quiet) ── Numb    │
│  │    │                                                  │
│  └────┘                                                  │
│  The reader enters anxious (setup from Ch.6 cliffhanger) │
│  and exits hollowed out. The fury is cathartic but       │
│  brief — the grief that replaces it is the real payload. │
│                                                          │
│  DIALOGUE-TO-NARRATION RATIO                             │
│  Dialogue: 62% | Narration: 28% | Internal: 10%         │
│  This chapter is conversation-heavy — it feels like      │
│  being in the room. The low internal monologue % means   │
│  the reader discovers Elara's feelings through her       │
│  words and actions, not her thoughts. This is effective  │
│  for confrontation but consider whether the reader       │
│  needs more interior access in the quiet ending.         │
│                                                          │
│  INFORMATION DENSITY                                     │
│  3 revelations (Priya's secret, Marcus's history,        │
│  Elara's father's letter) in one chapter. This is high   │
│  — readers may feel overloaded. Consider spacing the     │
│  third revelation to Ch.8 to let the first two land.     │
│                                                          │
│  CHARACTER PRESENCE                                      │
│  Elara: ████████████████████ (dominant — 78% of focus)   │
│  Marcus: ████████░░░░░░░░░░░ (reactive — present but    │
│          not driving)                                     │
│  Priya:  ██████░░░░░░░░░░░░░ (catalytic — triggers the  │
│          scene then recedes)                              │
│                                                          │
│  AUDIENCE NOTES                                          │
│  For readers who've been waiting for this confrontation  │
│  since Ch.3, this delivers. But: readers who are more    │
│  invested in Marcus than Elara may feel he's            │
│  underserved — he doesn't get his moment here.           │
│  Consider whether Ch.8 gives him that.                   │
│                                                          │
│  [Acknowledge] [Revise Chapter] [Show to Editor]         │
└──────────────────────────────────────────────────────────┘
```

**What the report measures:**

| Dimension | What It Captures | Why It Matters |
|---|---|---|
| **Pacing shape** | Sentence length variation, scene break frequency, dialogue density, action vs. reflection ratio | Tells you whether the chapter is a sprint, a slow burn, or choppy |
| **Read time** | Estimated minutes at average reading speed (~250 wpm) | "This chapter is 45 minutes — is that intentional for a climax, or is it bloated?" |
| **Emotional trajectory** | The sequence of dominant emotions the reader is likely to feel, based on the events, the character emotional states, and the tonal arc position | Shows you the emotional shape — does it build, oscillate, plateau, or crater? |
| **Dialogue/narration/internal ratio** | How the prose distributes between spoken words, narration, and interior access | A chapter that's 90% dialogue feels like a play; one that's 90% narration feels like memoir. Neither is wrong, but you should know which you're writing. |
| **Information density** | Number of revelations, plot developments, and new information per chapter | Too many reveals in one chapter = reader overload. Too few = filler. |
| **Character presence** | Screen time distribution across characters in the chapter | Shows who's driving, who's reacting, and who's absent — catches the problem of characters who are "in the room" but invisible. |
| **Audience notes** | Based on the audience.md personas (if they exist), how would each target reader respond? | Different readers care about different things — a Marcus fan and an Elara fan have different experiences of the same chapter. |

**The pacing description uses natural language**, not just numbers — "this is a fast read," "this chapter is choppy because the characters are dealing with X so it feels pacing-wise different from the steady rhythm of the last few chapters," "this reads like being held underwater — the tension doesn't let up for 12 pages." The goal is to help the author understand what they've created from outside their own head.

**Editor timing — two modes:**

- **Post-completion editing (default):** The Editor reviews chapters after the full story is drafted. This lets the Editor see the complete arc and catch cross-chapter issues that only emerge at scale. The Editor reads all chapters up to and including the one under review, but focuses its report on the chapter being reviewed.
- **Chapter-by-chapter editing (user's choice):** The user can send any chapter to the Editor immediately after drafting, before moving on to the next chapter. The Editor reads all chapters up to the present and is told which chapter to focus on (always the most recent). This is slower but catches issues early — useful for complex stories where compounding problems are expensive to fix later.

The user can switch between these modes at any time. A project can even use both — draft the first act, send it to the Editor for a batch review, then switch to chapter-by-chapter for the climax where precision matters most.

### Editor and the Story Grade

The Editor's work directly affects the Story Grade. Specifically:

- **Voice Consistency** dimension improves when the Editor catches and fixes voice drift
- **Character Depth** dimension improves when the Editor flags and the Author deepens motivation
- **Conflict Depth** improves when the Editor identifies scenes where characters are too comfortable
- **Theme Resonance** improves when the Editor catches siloed chapters and the Author adds cross-domain echoes

The grade reflects the story's current state — after Editor revisions are applied, the grade re-calculates. Users can see the grade trajectory: what it was after drafting, what it is after editing, and what improved.

---

## Teaching Mode

The app doubles as a writing education tool. Teaching content is woven into every step, not siloed into a separate "learn" section.

### How Teaching Works

**Contextual explanations** — Every step in the guided flow has an expandable "Why does this matter?" section that explains the theory. For example:

> **Why does the author need a wound?**
>
> The wound is not backstory — it's the active distortion lens through which the author (and by extension, the narrator) perceives everything. It determines what they notice, what they avoid, what they write toward without realizing it, and where their blind spots live. A story without an authorial wound has no unconscious gravity — it drifts instead of pulls.
>
> *From: Story Consciousness Theory — Stream A*

**Theory callouts** — When a concept from the three theoretical pillars (Consciousness Theory, Network Theory, Seven Deaths) is relevant, a small callout card appears with a summary and a link to the full theory document.

**Common mistakes** — Each phase includes warnings about typical errors:
- "Most writers skip the wound and go straight to plot. The wound is what makes the plot matter."
- "If two characters share the same MBTI + wound + flaw, one of them is redundant."
- "A tone that never shifts is flat. Design the departures."

**Grading as teaching** — The Story Grade isn't just a number — every score includes an explanation of what's missing and why it matters. Low scores come with specific, actionable guidance:
> "Your Character Depth score is C+ because two characters (Marcus and Reva) share the same wound (abandonment) and the same flaw (emotional withdrawal). This means they'll react identically under pressure, which flattens your cast. Consider: could one of them carry a different wound that produces a similar surface behavior but a different interior? A character abandoned by a parent and a character betrayed by a partner both withdraw — but they withdraw *differently*, and the difference is where the scene lives."

**Reference examples** — The Wizard of Oz decomposition and The Shunning Season creation serve as built-in case studies. At any point, the user can see how a concept plays out in a real story:
- "See how Dorothy's Stream A/B conflict works →"
- "See how The Shunning Season handles an unreliable narrator →"

**Glossary** — A searchable glossary of all engine-specific terms (Stream A, Stream B, I-Thread, Antilife Seals, hallmarks, cascading attributes, network archetypes, etc.) accessible from any screen.

### Active Deconstruction — The Grammarly Layer

When the user has existing content — uploaded drafts, written chapters, decomposed works, or even their chat messages and manual entries — the system doesn't just passively assess it (that's the Silent Writing Assessment). It actively **deconstructs** the writing in real time, like Grammarly but for storytelling craft, not just grammar.

**What it catches (layered from surface to deep):**

**Grammatical & syntactical** — sentence fragments, tense inconsistencies, subject-verb agreement, comma splices, dangling modifiers. Basic surface-level craft. These appear as subtle underlines in the text editor, not blocking — the user can hover to see suggestions.

**Voice consistency** — "This paragraph shifts from past tense to present tense mid-scene." "Elara's dialogue in this chapter uses contractions but her voice fingerprint says she avoids them under stress." "The narrator's vocabulary register drops from literary to conversational here — intentional?"

**Story-structural** — "This scene has no clear emotional shift — the characters enter and exit in the same state. Consider what changes." "The tension peak in this chapter comes at 30% of the way through — the remaining 70% deflates. Consider restructuring so the peak lands later." "This chapter doesn't advance any of the 6 subproblem threads."

**Thematic incongruence** — "Your Big Picture Statement is about the cost of forgiveness, but this chapter's central conflict is about jealousy. The connection between these isn't visible to the reader yet." "The hallmark of 'water imagery' hasn't appeared in 3 chapters — is the motif dropping?"

**Character behavioral** — "Marcus just apologized unprompted. His wound (erasure) and defensive pattern (withdrawal) suggest he would deflect or go silent first. Is this growth or inconsistency?" "Priya's dialogue sounds like Elara's here — check voice differentiation."

**How it surfaces:** Non-blocking, context-sensitive, and graduated. Surface-level issues (grammar, syntax) appear as subtle underlines. Deeper issues (voice drift, thematic gaps) appear in the right sidebar's Teaching Tips section when the user is working on that file. Structural issues (scene dynamics, thread stalling) appear in the Reader Experience Report and the Editor's review. The system never interrupts — it annotates.

### The Teacher as a Character

The Teaching Tips panel in the right sidebar can optionally adopt a **teacher persona** — a conversational voice that explains concepts the way a mentor would, not a textbook. The user can toggle this in settings:

- **Default mode** — Teaching Tips appear as static cards with explanations and theory references. Clean, informational, non-conversational.
- **Conversational mode** — The teacher becomes a character. It has a warm, direct voice. It asks questions instead of just explaining. It responds to what the user is doing, not just what phase they're in.

In conversational mode, the Teaching Tips transform:

**Default:** "The wound is the foundational attribute. It cascades into flaw, virtue, defensive pattern, and blind spots. Complete this field before proceeding."

**Conversational:** "Before we move on — what hurt this character? Not what happened to them, but what it taught them to believe about the world. That belief is running in the background of every scene they're in, whether you write it or not. Take your time with this one."

The conversational teacher uses **open questions** to help the user fill gaps they might not realize they have:

- "You said Marcus is 'angry.' But at who? At himself for not seeing it coming, or at her for not telling him? Those are two different stories."
- "Your world has a council that controls water access, but you haven't said why water is scarce. The reader will ask. What's the answer?"
- "This outline says 'they reconcile in Chapter 10.' How? What happens in their bodies when they see each other? What does Elara's wound do in that moment?"

The teacher never gives answers — it draws them out. Every question is an invitation to deepen the architecture. And every answer the user gives feeds directly into the relevant file, so the conversation is also a data-gathering mechanism.

**The teacher can be activated at any point** — not just during the guided flow. While the user is reading a chapter, the teacher might note: "This scene between Elara and Priya has a lot of subtext. But the reader doesn't have access to what Priya knows. How do you want to handle that gap — dramatic irony, or does the reader find out when Elara does?"

---

## Responsive Design

### Desktop (primary)
Full three-panel layout as described above.

### Tablet
Left nav collapses to an icon bar. Right sidebar becomes a slide-out panel (swipe from right edge or tap the grade badge).

### Mobile (Deferred — Rough Direction Only)

Detailed responsive design is deferred until the UI implementation phase when we can see actual layouts. The rough direction:

Single-panel layout. Bottom tab bar for navigation: Home (project hub), Build (guided flow / editor), Files (file tree), Grade (scoring dashboard), Read (reader mode with TTS). The guided flow (Typeform-style cards) works naturally on mobile — it's the primary interaction pattern. Complex visualizations (Story Timeline, spider charts, relationship graph) will need simplified mobile representations — likely card-based summaries that link to full desktop views.

---

## Accessibility

- Full keyboard navigation
- Screen reader support (ARIA labels on all interactive elements)
- High contrast mode
- Font size adjustment (the app deals in text — readability is paramount)
- TTS as a first-class feature (not an afterthought)
- Color-blind safe palette for relationship graph and grade indicators

---

## Offline Support (PWA)

As a Progressive Web App:
- Installable on any device (Add to Home Screen)
- Works offline — all project files stored locally (IndexedDB or File System Access API)
- Syncs when back online (if cloud sync is enabled)
- Background sync for LLM interactions (queued when offline, executed when connected)

---

## Chat / Conversation Interface

The app needs a genuine conversation mode — not just guided flows and form-filling, but a freeform chat where users can talk to the AI about their story, ask questions, explore ideas, and get feedback without being locked into a phase workflow.

### Where It Lives

Chat is a **sixth mode in the Center Stage** (alongside Guided Flow, Editor, Reader, Comparison, Relationship Graph, and Story Timeline). It can be launched from:

- A persistent **chat icon** in the bottom bar (available from any screen)
- The right-click context menu on any file ("Discuss this file")
- The chapter review workflow ("Discuss this chapter with the AI")
- The Editor review report ("Discuss this issue")
- The Decomposition results ("Let's talk about what I found")
- A character card in the file tree ("Talk to this character")

### Three Chat Personas

The chat isn't one conversation partner — it's three distinct experiences, each with its own visual identity and personality.

#### 1. Story Assistant (Default) — Official Name

The **Story Assistant** is the official name for the LLM chat interface throughout the application. This is the general-purpose creative helper — the AI with full project context loaded. It knows the architecture, the world, the characters, and the arc. It helps with brainstorming, problem-solving, explaining engine concepts, searching across the project ("Where did I mention the red door?"), and navigating the app.

Since `author.md` is usually the user themselves, the Story Assistant doesn't role-play as the author. Instead it acts as a knowledgeable collaborator — like a dramaturg or writing group partner who has read everything you've built so far and can help you think through problems.

**Visual identity:** Standard chat UI. Clean, neutral, the app's default color scheme.

**Example conversations:**
- "I'm stuck on Chapter 6 — the tension dropped. What can I do?"
- "Explain how Stream A/B applies to my protagonist"
- "What if we changed the setting from rural Ohio to Detroit?"
- "Help me figure out why this subplot isn't landing"

#### 2. The Editor

The Editor chat is a direct conversation with the Editor LLM — the same mind that produces review reports. This is for when the user wants to push back on a critique, ask the Editor to explain their reasoning, or get the Editor's unfiltered opinion on something.

**The Editor is not nice.** It's professional, it's precise, and it does not soften its feedback to spare feelings. It reads the architecture files as gospel and measures everything against them. If a character's behavior contradicts their wound, the Editor says so directly. If a chapter's pacing is wrong, it names the exact lines where it loses momentum. It respects the user but it does not flatter them. It's the reader who will put the book down if the story doesn't earn their attention — and it tells you exactly why it would.

**Visual identity:** The entire chat UI shifts to a **distinct dark mode** with **orange accent highlights** — borders, message bubbles, the chat header. This is an unmistakable visual signal that the user is no longer talking to a collaborator. They're talking to a critic. The shift should feel like walking into a different room.

```
┌─────────────────────────────────────────┐
│  🟠 EDITOR MODE                        │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Your Chapter 7 opening is 400   │    │
│  │ words of weather description    │    │
│  │ before anything happens. Your   │    │
│  │ outline says this chapter opens │    │
│  │ with confrontation. Where is    │    │
│  │ the confrontation?              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Type a response...]                   │
└─────────────────────────────────────────┘
```

**Entry points:** Clicking "Discuss" on any item in an Editor review report opens Editor chat with that specific issue loaded. The user can also switch to Editor mode manually from the chat persona selector.

**Example conversations:**
- "Why did you flag Marcus's dialogue in paragraph 3?"
- "I disagree — the tonal shift is intentional. Here's why."
- "Be honest — does this chapter earn its ending?"
- "What's the weakest part of this story right now?"

#### 3. Talk to a Character

This is the most unusual and most powerful chat mode. The user can open a conversation with any character from their project. The AI loads that character's full profile — wound, flaw, virtue, MBTI, voice fingerprint, relationship graph position, arc direction — and speaks as that character.

This isn't just role-play for fun (though it can be). It's a **workshopping and development tool** — the same way an actor might sit down after a performance and talk about their character's motivations, interior state, and arc from outside the story. The user can interview their characters about specific scenes, probe their decision-making, and discover layers of psychology that don't appear on the page.

**Core uses:**

- **Scene interrogation** — "What were you thinking when you hit Jared?" "What was going through your mind in that alley?" The character answers from their psychology (wound, flaw, defensive patterns, Stream A/B conflict), giving the author access to interior logic that might not be in the prose. This is how actors talk about their roles in behind-the-scenes interviews — the character knows things the audience doesn't, and the author can use that knowledge to deepen the scene or plant subtler foreshadowing.
- **Arc reflection** — "How do you feel about who you were at the start of this story?" The character can speak about their own growth (or regression) from a reflective distance. This helps the author verify that the arc feels authentic from the inside, not just structurally correct from the outside.
- **Motivation mining** — "Why did you lie to Priya?" The character's answer draws on their wound, their relationship dynamics, their defensive patterns. The answer might surprise the author — and that surprise is often a signal that the character is becoming real.
- **Relationship probing** — "What do you think of Marcus?" reveals how the character sees that relationship, which can inform the relationship graph
- **World-building through inhabited perspective** — ask them about their neighborhood, their job, their family, their daily rituals. A character who lives in the world knows things the author hasn't invented yet.
- **Voice pressure-testing** — does the AI's portrayal match what the user imagined? If the character sounds wrong, the profile might need refining
- **What-if exploration** — "What would you have done if she hadn't walked in?" The character answers hypotheticals in-character, helping the author explore branching possibilities without committing to them
- **Out-of-story commentary** — "What do you think the audience should understand about you that they probably don't?" This meta-awareness mode lets the character step outside the narrative frame and speak about their own story function — like a DVD commentary track from the character's perspective

**Scene-anchored conversations:** The user can scope a character conversation to a specific chapter or scene. When they do, the character's responses are grounded in exactly what has happened up to that point in the story — they don't know what happens next. This creates a powerful workshopping dynamic: you can talk to a character at the moment of a key decision, before they've made it, and hear them work through their reasoning in real time.

```
┌──────────────────────────────────────────────────┐
│  💬 Talking to: Elara Voss                       │
│  Wound: abandonment | Role: protagonist          │
│  📍 Anchored to: Chapter 4, Scene 2              │
│  ─────────────────────────────────────────────── │
│                                                  │
│  You: You just found the letters. What are you   │
│       feeling right now?                         │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ My hands are shaking and I'm pretending  │    │
│  │ they're not. I think — I think I always  │    │
│  │ knew. That's the worst part. Some part   │    │
│  │ of me knew and I just kept building this │    │
│  │ careful life on top of it like if the    │    │
│  │ foundation was steady enough the crack   │    │
│  │ wouldn't matter.                         │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  💡 Elara's response reveals a self-awareness    │
│  about her avoidance pattern that isn't in her   │
│  character file yet.                             │
│  [Add to character arc notes] [Ignore]           │
│                                                  │
│  [Type a response...]          [📍 Change Anchor]│
└──────────────────────────────────────────────────┘
```

The **Anchor** control (bottom right) lets the user jump the character forward or backward in the timeline. Talking to a character anchored at Chapter 1 vs Chapter 8 produces fundamentally different conversations — and the contrast itself reveals how well the arc is working.

**World-building integration:** As the conversation unfolds, the character might mention details that don't exist yet in the architecture. When this happens, the system surfaces a gentle prompt:

```
💡 Elara just mentioned that her village has a council of elders who
   control water access. This isn't in your world-building file yet.

   [Add to world-building.md]  [Add to Elara's character file]  [Ignore]
```

The same applies to relationships, backstory details, and personality traits that emerge organically through conversation. The chat becomes a way to **discover** the story's world by talking to the people who live in it, and the system captures those discoveries into the architecture files with user approval.

**Visual identity:** The chat UI takes on a subtle tint based on the character — using the character's assigned color from the relationship graph (if one exists) or a neutral warm tone. The character's name and a brief identity line (wound + role) appear in the chat header.

```
┌─────────────────────────────────────────┐
│  💬 Talking to: Elara Voss              │
│  Wound: abandonment | Role: protagonist │
│  ─────────────────────────────────────  │
│                                         │
│  You: What do you think about Marcus?   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Marcus? He means well. I know   │    │
│  │ that. But every time he says    │    │
│  │ "trust me," I hear my mother    │    │
│  │ saying the same thing right     │    │
│  │ before she left. So no. I       │    │
│  │ don't trust him. I just haven't │    │
│  │ figured out if that's about him │    │
│  │ or about me yet.                │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💡 Elara referenced her mother leaving │
│  — this isn't in her backstory yet.     │
│  [Add to character file] [Ignore]       │
│                                         │
│  [Type a response...]                   │
└─────────────────────────────────────────┘
```

**Entry points:** Right-click any character in the file tree → "Talk to this character." Also available from the character card in the guided flow, from the **Cast Roster** (see below), or by typing a character's name in the chat persona selector.

### Character Guide Mode

A global toggle — a small checkbox in the workspace top bar or settings panel — that activates a persistent companion voice from your protagonist (or any chosen character) throughout the story-building process. When enabled, the character chimes in during the guided flow with in-character reactions, encouragement, and commentary as you make decisions about their world.

```
┌────────────────────────────────────────────────────────┐
│  ☑ Character Guide: Elara Voss          [Change] [✕]  │
└────────────────────────────────────────────────────────┘
```

**How it works:** The guide character's voice appears as a small, dismissible speech bubble anchored to the bottom-right of the Center Stage (or inline beneath key decision points in the guided flow). The guide doesn't take over — it's a flavor layer. The bubble uses the character's voice fingerprint and psychological profile to generate context-appropriate reactions.

Examples of what the guide might say during different phases:

- **World-building** (you're defining the setting): *"This city you're describing — the fog, the docks, the way sound carries at night. I grew up somewhere like that. You can hear trouble coming but you can never see it."*
- **Character creation** (you're rolling a new cast member): *"So this is the person who's going to betray me? ...I can already tell. Something about the eyes."*
- **Relationship graph** (you're defining dynamics): *"You're saying Marcus and I are close. Fine. But make sure he earns it. I don't give that away for free."*
- **Plot structure** (you're setting up the arc): *"I can feel where this is going. You're going to put me through something, aren't you. Alright. I trust you. Mostly."*
- **Editing phase**: *"That line in chapter 3 — that's not how I'd say it. But you already know that."*

**Key design rules:**
- The toggle is easy to find and easy to disable — one click. No shame, no "are you sure?" confirmation. Some sessions you want the companion, some you don't.
- The guide can only be activated **after** at least one character exists in the project with a sufficient profile (wound, voice fingerprint, personality). Before that, the toggle is greyed out with a tooltip: "Create your first character to unlock guide mode."
- The guide character defaults to the protagonist but can be changed to any character via the [Change] button — a dropdown of all characters with sufficient profiles.
- Guide comments are **non-blocking**. They appear, they add flavor, and they auto-dismiss after a few seconds if the user doesn't interact. Clicking a guide comment opens a full Talk to a Character conversation anchored to the current context.
- Frequency is light — roughly one comment every 3-5 major decisions, not every click. The system avoids being chatty.
- The guide never contradicts or overrides the Story Assistant or Editor personas. It's commentary, not advice. If the user wants advice, they switch to a full chat.

### Cast Roster — The IMDB Panel

An always-accessible cast panel that gives quick, visual access to every character in the project. This lives as a **tab in the Left Nav** (alongside the File Tree and Phase Navigator), toggled via an icon that looks like a group of people.

```
┌──────────────────────────┐
│  📁 Files  🧭 Phases  👥 Cast │
│  ─────────────────────── │
│                          │
│  ★ MAIN CAST             │
│                          │
│  ┌────┐                  │
│  │ EV │  Elara Voss      │
│  └────┘  Protagonist     │
│          Wound: Abandonment│
│          Arc: ████░░ 62%  │
│          [💬 Talk] [📄 File]│
│                          │
│  ┌────┐                  │
│  │ ML │  Marcus Laine    │
│  └────┘  Deuteragonist   │
│          Wound: Erasure   │
│          Arc: ███░░░ 45%  │
│          [💬 Talk] [📄 File]│
│                          │
│  ─── SUPPORTING ─────── │
│                          │
│  ┌────┐                  │
│  │ JL │  Jean-Luc Morel  │
│  └────┘  Mentor/Trickster│
│          [💬 Talk] [📄 File]│
│                          │
│  ┌────┐                  │
│  │ PD │  Priya Desai     │
│  └────┘  Antagonist      │
│          [💬 Talk] [📄 File]│
│                          │
│  ─── MINOR ──────────── │
│                          │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│  │RH│ │TW│ │AK│ │SB│   │
│  └──┘ └──┘ └──┘ └──┘   │
│                          │
│  [+ New Character]       │
└──────────────────────────┘
```

**Hierarchy tiers:** Characters are grouped by story role — Main Cast (protagonist, deuteragonist, love interest), Supporting (mentors, rivals, close allies), and Minor (walk-ons, background, functional roles). The tier is derived from the character type attribute and relationship graph centrality. Users can drag characters between tiers to reclassify them.

**Avatar badges:** Each character gets an auto-generated gradient avatar — their initials displayed over a two-color gradient derived from their dominant spider chart axes (see "Avatar Gradient — The Character's Visual Fingerprint" in the Character Visualization section). The gradient is the character's psychological fingerprint rendered as color. If the character has three dominant axes, the third becomes a border ring around the avatar. If the user uploads a character photo, the photo fills the avatar circle and the gradient becomes a visible border ring — preserving the color identity while showing the user's chosen visual. On hover, arc-aware avatars shift from start-state to end-state colors.

**At-a-glance info:** Main and Supporting characters show their name, character type, primary wound, and arc progress (a mini progress bar showing how far through their arc the story has reached). Minor characters are shown as a compact row of avatar badges — hover to see name and role, click to expand.

**Quick actions on every character card:**
- **💬 Talk** — opens a Talk to a Character conversation immediately
- **📄 File** — opens the character's .md file in Center Stage
- Clicking the character name itself opens the full character profile view (spider chart, SWOT, arc overlay, all attributes)

**Relationship lines:** An optional toggle at the top of the Cast Roster (a small "show connections" icon) draws faint curved lines between characters who have defined relationships, with line color/style indicating the dynamic type (alliance = solid, conflict = dashed, romance = warm tint, etc.). This is a lightweight version of the full relationship graph — just enough to see the web of connections at a glance.

**Cast changes propagate:** If the user drags a character from Supporting to Main Cast, the system prompts: "Promoting Priya to Main Cast. This will increase her expected depth — she may need additional development (wound, arc direction, voice fingerprint) to match Main Cast standards. Add development prompts to your checklist?" This keeps the Cast Roster from being just a label — tier changes have structural consequences.

### Chat Context Scopes

Regardless of which persona is active, the user can scope the conversation's context:

- **Full project** (default) — the AI has everything loaded
- **This file** — focused conversation about a specific architecture file or chapter
- **This phase** — discussion scoped to the current phase's concerns
- **Freeform** — general writing/storytelling conversation, no project context loaded (for exploring ideas before committing them to the project)

### Chat History

Chat conversations are saved per-project, organized by persona. The user can scroll back through previous conversations, search them, and reference earlier discussions. Chat threads are listed in a sub-section under the project in the Thread List:

```
The Shunning Season
├── Chapter 7 (in progress)
├── Chat: Story Assistant — "stuck on chapter 6 pacing"
├── Chat: Editor — "disagreed about Marcus dialogue"
├── Chat: Elara Voss — "exploring her mother's abandonment"
└── Chat: Jean-Luc — "testing his humor voice"
```

---

## Decomposition Workflow UI

Decomposition mode (reverse-engineering an existing work) is one of the engine's most powerful features, but it needs its own dedicated UI flow — not just a mention in the onboarding wizard.

### Entry Points

Users enter Decomposition mode from:

1. **Onboarding Wizard Step 3** — selecting "I want to decompose/analyze an existing story" (Branch C)
2. **Quick Actions** on the Home screen — "Import a story to decompose"
3. **Chat** — pasting or uploading text and saying "decompose this"

### The Decomposition Flow

**Step 1: Input**
Full-screen upload/paste zone. Accepts:
- Plain text (paste directly)
- .txt, .md, .docx, .pdf files
- Multiple files (for multi-chapter works — the system stitches them in order)
- URLs (fetches and extracts text — with user confirmation)

**Step 2: Identification**
The system asks:
- "What is this?" (novel, screenplay, short story, etc.)
- "Is this the complete work or a partial sample?" → If partial: "How much of the total work is this?" (first few chapters, middle section, ending, scattered excerpts). The system adjusts its analysis: partial texts receive more [INFERRED] tags, arc/ending analysis is explicitly marked as speculative, and the system tells the user which conclusions it can draw confidently vs. which would change with more text.
- "Do you know the author?" (optional — helps calibrate analysis)
- "What are you hoping to learn from this?" (structural analysis, style study, adaptation prep, comparison prep, teaching exercise)

The purpose selection determines which decomposition passes run and how results are presented.

**Step 3: Processing**
A progress screen shows the engine working through its decomposition checklist:

```
Decomposing "The Wonderful Wizard of Oz"...

✅ Identifying author psychology and wound
✅ Extracting narrator type, POV, reliability
✅ Mapping world rules, society-as-character, hallmarks
🔄 Building character profiles (3 of 6)...
⏳ Mapping relationship graph
⏳ Extracting arc structure and tonal arc
⏳ Running Seven Deaths audit
⏳ Running Story Consciousness Theory analysis
⏳ Running Story Network Theory analysis
```

**Step 4: Results Dashboard**
A dedicated results view organized by the engine's architecture files, with each section showing:

- The extracted content
- Confidence tags: **[CONFIRMED]** (directly stated in text) vs **[INFERRED]** (deduced by the LLM)
- An expandable "Evidence" section showing the specific passages that support each finding
- An "Edit" button to correct or refine any finding

The results view mirrors the architecture file structure:
- Author profile (inferred psychology, wound, blind spots, prose style)
- Narrator analysis (POV, reliability, tense, distance, gap)
- World map (genre, themes, society, hallmarks, rules)
- Character profiles (one card per character, expandable)
- Relationship graph (interactive matrix)
- Arc analysis (protagonist arc, tonal arc, subplot arcs)
- Structural audit (Seven Deaths check, Consciousness Theory, Network Theory)

**Step 5: What Now?**
After reviewing the decomposition, the user chooses:

- **Save as reference** — Store the decomposition for comparison with other works or as a teaching reference
- **Use as foundation** — Start a new project (sequel, adaptation, spinoff) using this decomposition as the base architecture
- **Compare with another work** — Enter Comparison View (Center Stage Mode 4)
- **Discuss it** — Open Chat mode with the decomposition loaded for freeform conversation about the work
- **Export** — Download the decomposition as a set of markdown files

---

## Sandbox / Fork Mode

Users need a way to experiment without risking their main project. "What if I changed the protagonist's wound?" or "What if I rewrote Chapter 5 from a different POV?" shouldn't require them to manually back up everything first.

### Two Levels of Experimentation

**Level 1: Per-File What-If**
For small experiments on individual files:

- Right-click any architecture file or chapter → "Create What-If Version"
- The system creates a copy with a `[WHAT-IF]` tag in the filename
- The user edits the what-if version freely
- A split view shows the original alongside the what-if version
- The Story Grade recalculates based on the what-if version, showing the impact of the change
- The user can: **Promote** (replace the original with the what-if), **Discard**, or **Keep Both** (for comparison)

**Level 2: Full Project Fork**
For major direction changes:

- From the project menu → "Fork This Project"
- The system creates a complete copy of the project folder with a new name (e.g., "The Shunning Season — Fork: Different Ending")
- The fork appears as a separate entry in the Thread List, visually linked to the parent project
- The user can work on the fork independently
- A "Compare with Original" option shows a diff of all architecture files and chapters between the parent and the fork
- The user can: **Merge changes back** (selectively, file by file) or **Keep as separate project**

### Sandbox Indicator

When working in a what-if version or a fork, a prominent banner appears at the top of the workspace:

```
⚠ SANDBOX MODE — Editing "What-If: Marcus with betrayal wound instead of abandonment"
[Promote to Main] [Discard] [Compare with Original]
```

This prevents confusion about which version the user is editing.

---

## Error and Failure States

LLM calls fail. Networks drop. Tokens run out. The UI needs to handle all of this gracefully instead of showing a blank screen or a cryptic error.

### LLM Call Failures

When an LLM call fails (timeout, rate limit, server error, context too long):

**Immediate feedback:**
- The loading indicator changes to an error state with a clear, human-readable message:
  - "The AI took too long to respond. This usually means the chapter was very complex."
  - "The AI service is temporarily unavailable. Your work is saved."
  - "The project has too much context for a single call. Try simplifying."

**Recovery options (presented as buttons):**
- **Retry** — Same request, same parameters
- **Retry with less context** — The system automatically trims context (drops older chapters from the window, summarizes instead of including full text)
- **Save and continue later** — All progress is preserved; the user can pick up when the service is available
- **Switch to manual** — Open the Editor and write/edit directly instead of waiting for AI generation

### Offline Behavior

When the user loses network connectivity:
- A persistent banner appears: "You're offline. You can still read and edit files. AI features will resume when you reconnect."
- All file editing continues to work (local storage)
- AI-dependent features (generation, grading, editor review) show a "queued" state
- When connectivity returns, queued operations execute in order and the user is notified of results

### Validation Errors

When user input doesn't make sense (e.g., uploading a spreadsheet as a story, selecting conflicting options):
- Inline error messages next to the relevant field, not modal pop-ups
- Suggestions for how to fix the issue
- Never block the user from continuing — warn, don't wall

### Auto-Save and Recovery

- All work is auto-saved locally every 30 seconds
- If the app crashes or the tab closes, the next session offers: "We recovered unsaved changes from your last session. [Restore] [Discard]"
- The user never loses more than 30 seconds of work

---

## Storage Model and Data Persistence

**There is no server-side database.** The app runs entirely in the browser with all data stored locally. This is a deliberate design choice — no user accounts, no server-side storage, no security surface to maintain.

### Where Data Lives

- **Browser storage:** IndexedDB for project data, file contents, and settings. The File System Access API (where supported) for direct read/write to the user's local filesystem.
- **Project format:** Every project is a folder of plain markdown files and CSVs — the same format the engine already uses. No proprietary database, no binary blobs. If the user opens their project folder in a text editor, everything is readable.

### Portability

Users need to be able to move their projects between devices and back them up. Since there's no cloud sync:

- **Download as .zip** — One-click export of the entire project folder. Available at any time from the left panel or project menu.
- **Upload a project** — Drag and drop a .zip or select a folder to load a previously exported project. The system validates the folder structure and loads it.
- **Google Docs integration (future)** — Users could store their project folder in Google Drive and open it directly from there. The app reads and writes to Drive instead of local storage. This is a future enhancement, not a launch requirement.
- **GitHub integration (if self-hosted)** — For users who self-host the app and have Git available, the project folder can be a Git repository with automatic commits at phase completion milestones. This gives full version history for free. Not available in the hosted web version.

### Version History

**For v1:** Version history is limited to undo/redo within the current session and the what-if/fork system (Sandbox Mode). There is no persistent version history across sessions — if the user wants to preserve a state, they download the project. Full version history (Git-based or otherwise) is a **deferred future feature** — the infrastructure needed to make it work for non-technical users without getting into the data management business isn't worth the v1 complexity. Pinned for later.

**Practical guidance:** The app encourages users to download their project regularly with a gentle reminder: "It's been 3 days since you last downloaded a backup. [Download Now]"

---

## Keyboard Shortcuts

Power users need accelerators. The app supports a full set of keyboard shortcuts, discoverable via a shortcut overlay (`Ctrl+/` or `Cmd+/`).

### Global Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + N` | New project |
| `Ctrl/Cmd + O` | Open/upload project |
| `Ctrl/Cmd + S` | Download project (save) |
| `Ctrl/Cmd + /` | Show keyboard shortcut overlay |
| `Ctrl/Cmd + K` | Open command palette (search for any action) |
| `Ctrl/Cmd + P` | Quick-switch between projects |
| `Ctrl/Cmd + Shift + C` | Open chat |
| `Escape` | Close current panel/modal |

### Workspace Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + 1-9` | Jump to Phase 1-9 |
| `Ctrl/Cmd + E` | Toggle Editor mode |
| `Ctrl/Cmd + R` | Toggle Reader mode |
| `Ctrl/Cmd + G` | Show Story Grade breakdown |
| `Ctrl/Cmd + T` | Toggle Teaching Tips panel |
| `Ctrl/Cmd + B` | Toggle file tree / left nav |
| `Ctrl/Cmd + .` | Toggle right sidebar |
| `Space` | Play/pause TTS (when in Reader mode) |

### Editor Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Enter` | Approve current item |
| `Ctrl/Cmd + Shift + Enter` | Approve all items |
| `Ctrl/Cmd + D` | Toggle diff view |
| `Alt + ↑/↓` | Navigate between editor issues |

### Command Palette

`Ctrl/Cmd + K` opens a searchable command palette (like VS Code) where users can type any action: "run seven deaths audit," "open character Marcus," "start chapter 5," "show relationship graph," etc. This is the fastest way to navigate for power users.

---

## Genre Shift & Medium Transposition

These are two distinct operations that both transform an existing project's architecture, but they change different things and cascade differently through the system.

### Genre Shift — Same Container, Different DNA

A genre shift keeps the medium (it's still a novel, still a screenplay, still a podcast) but changes the genre, tonal register, or thematic framework. "What if this literary drama were a thriller instead?" The container doesn't change — the story's soul does.

**Entry point:** From an existing project's workspace, the user opens the Command Palette (Ctrl/Cmd+K) and types "Genre Shift," or accesses it from the project settings menu. It's also available as Branch B during onboarding (Wizard Step 3) for users who bring in a decomposed work and want to adapt it.

**The Shift Dashboard:**

The system presents the project's current genre DNA alongside the levers the user can pull:

```
┌─────────────────────────────────────────────────────────┐
│  Genre Shift: "The Shunning Season"                     │
│                                                         │
│  CURRENT                     TARGET                     │
│  ─────────────               ─────────────              │
│  Medium: Novel (literary)    Medium: Novel (unchanged)  │
│  Primary: Literary Fiction   Primary: [Choose ▾]        │
│  Secondary: Domestic Drama   Secondary: [Choose ▾]      │
│  Tonal Blend: Intimate →     Tonal Blend: [Redesign ▸]  │
│    Devastating → Quiet       │                          │
│  Content Rating: Adult       Content Rating: [Choose ▾]  │
│  Themes: Abandonment,        Themes: [Rebuild ▸]        │
│    Forgiveness, Family       │                          │
│                                                         │
│  [Preview Impact] [Apply Shift] [Cancel]                │
└─────────────────────────────────────────────────────────┘
```

**Preview Impact** is the key feature. Before committing, the LLM analyzes every architecture file and produces a **shift report** — a file-by-file impact assessment showing what would change:

```
┌─────────────────────────────────────────────────────────┐
│  Genre Shift Impact: Literary Fiction → Psychological   │
│  Thriller                                               │
│                                                         │
│  author.md                                              │
│  ├ Prose style: Intimate/reflective → Taut/precise     │
│  ├ Pacing expectations: Measured → Accelerating         │
│  └ Reader contract: Emotional truth → Mounting dread    │
│                                                         │
│  narrator.md                                            │
│  ├ Reliability: Reliable → Unreliable (suggested)       │
│  ├ Distance: Close → Very close (claustrophobic)        │
│  └ Information control: Open → Strategic withholding    │
│                                                         │
│  characters/elara.md                                    │
│  ├ Wound: Abandonment → Abandonment (unchanged — works  │
│  │   as thriller fuel)                                  │
│  ├ Emotional palette: +Paranoia, +Dread, +Hyper-        │
│  │   vigilance promoted from Stretch to Home            │
│  └ Voice fingerprint: +Shorter sentences under stress   │
│                                                         │
│  world/world-building.md                                │
│  ├ Setting function: Externalizing → Exerting pressure  │
│  ├ Hallmarks: Need thriller-specific additions          │
│  │   (confined space, ticking clock, red herrings)      │
│  └ Rules: Add "information asymmetry" rule              │
│                                                         │
│  story/arc.md                                           │
│  ├ Structure: Character-driven → Tension-driven         │
│  ├ Pacing curve: Slow burn → Escalating reveals         │
│  └ Climax type: Emotional reckoning → Confrontation     │
│     + revelation                                        │
│                                                         │
│  relationships/                                         │
│  ├ Trust dynamics: All relationships gain a suspicion    │
│  │   layer                                              │
│  └ Power dynamics: Shift toward concealment/revelation  │
│                                                         │
│  CHAPTERS (if any exist):                               │
│  ├ Chapters 1-3: Major rewrite needed (pacing, tension) │
│  ├ Chapters 4-6: Moderate revision (add withholding)    │
│  └ Chapter 7+: Not yet written — will generate in new   │
│     genre                                               │
│                                                         │
│  Estimated effort: ████████░░ ~75% of architecture      │
│  needs revision                                         │
│                                                         │
│  [Accept & Apply] [Modify Shift] [Cancel]               │
└─────────────────────────────────────────────────────────┘
```

**Apply Shift** creates a **fork** of the project (preserving the original) and then walks the user through a guided revision of each affected file. The LLM proposes specific changes for each file — the user reviews, accepts, modifies, or rejects each one. This uses the same conflict resolution model as the Editor: the user is the tiebreaker, not the LLM.

Files that aren't affected by the genre shift (e.g., character names, physical descriptions, backstory facts that are genre-agnostic) are left untouched. The system is surgical — it changes what the genre demands and preserves what it doesn't.

### Medium Transposition — Same Story, Different Container

Medium transposition changes *how* the story is delivered while preserving its narrative content. "Turn my novel into a screenplay." "Adapt this podcast script into a stage play." This is a structural transformation — the story's bones stay, but the body changes shape.

**Entry point:** Same as Genre Shift (Command Palette, project settings, or Branch B onboarding). The user selects "Change Medium" and is presented with the full format catalog from Wizard Step 1 — the same 12-category, 43+ format selection UI.

**The Transposition Dashboard:**

```
┌─────────────────────────────────────────────────────────┐
│  Medium Transposition: "The Shunning Season"            │
│                                                         │
│  FROM                        TO                         │
│  ─────                       ──                         │
│  Novel (Literary Fiction)    Feature Film Screenplay     │
│  80,000 words               90-120 pages                │
│  Chapter-based              Scene-based                  │
│  Internal monologue OK      Visual/dialogue only         │
│  Prose format               .fountain format             │
│                                                         │
│  ⚠ Major structural translation required:               │
│  • Internal monologue → must become action/dialogue     │
│  • 80K words → ~110 pages (significant compression)     │
│  • Prose descriptions → visual scene headings           │
│  • Narrator voice → eliminated or becomes V.O.          │
│  • Chapter structure → scene/sequence structure         │
│                                                         │
│  [Preview Translation] [Apply] [Cancel]                 │
└─────────────────────────────────────────────────────────┘
```

**Preview Translation** produces a transposition report that's more structural than the genre shift report — it focuses on what the new medium *can't do* that the old one could, and how to solve each gap:

```
┌─────────────────────────────────────────────────────────┐
│  Transposition Report: Novel → Screenplay               │
│                                                         │
│  WHAT TRANSLATES DIRECTLY:                              │
│  ✓ Plot structure (3-act maps cleanly)                  │
│  ✓ Character relationships (dialogue-driven scenes)     │
│  ✓ World-building (becomes production design)           │
│  ✓ Conflict/stakes (externalizes well)                  │
│                                                         │
│  WHAT NEEDS TRANSLATION:                                │
│                                                         │
│  ⚡ Narrator (close 3rd, reflective)                    │
│  Problem: Screenplays have no narrator by default       │
│  Options:                                               │
│  ○ Eliminate — externalize all internal life through     │
│    action and dialogue (purist approach)                 │
│  ○ Voice-over — preserve key narrator moments as V.O.   │
│    (controversial but effective when sparse)             │
│  ○ Confidant character — add or promote a character     │
│    who draws out internal thoughts through dialogue      │
│  ● Let the engine recommend (based on story analysis)   │
│                                                         │
│  ⚡ Internal monologue (Elara's wound processing)       │
│  Problem: Film is external — you can't show thought     │
│  Options:                                               │
│  ○ Behavioral translation — wound becomes visible       │
│    through action (hands shaking, objects gripped,       │
│    avoidance patterns)                                   │
│  ○ Dialogue subtext — what she says vs. what she        │
│    means carries the psychological weight               │
│  ○ Visual metaphor — recurring images/motifs replace    │
│    internal narration                                    │
│  ● Let the engine recommend                             │
│                                                         │
│  ⚡ Prose rhythm (literary sentence-level craft)        │
│  Problem: Screenplay prose is functional, not literary  │
│  Translation: The literary voice moves into dialogue     │
│  cadence, scene rhythm, and visual poetry instead        │
│                                                         │
│  ⚡ Chapter structure (12 chapters)                     │
│  Translation: Mapped to sequences — the engine          │
│  proposes a scene breakdown:                             │
│  Ch.1-2 → Act I (setup, ~25 pages)                      │
│  Ch.3-8 → Act II (confrontation, ~60 pages)             │
│  Ch.9-12 → Act III (resolution, ~25 pages)              │
│                                                         │
│  FORMAT METADATA UPDATE:                                 │
│  medium:         "novel" → "feature_film"               │
│  structuralUnit: "chapter" → "scene"                    │
│  formatType:     "prose" → "screenplay"                 │
│  outputTemplate: "manuscript" → "fountain"              │
│  wordRange:      {80K-100K} → {90-120 pages}            │
│                                                         │
│  [Apply with Recommendations] [Choose All Options       │
│   Manually] [Cancel]                                    │
└─────────────────────────────────────────────────────────┘
```

The transposition report gives the user **choices at every translation point** — not just "here's what changes" but "here are 3 ways to solve this problem, pick one." The engine recommends but the user decides. This is critical because medium transposition involves creative judgment, not just mechanical conversion.

**After applying**, the system:
1. Creates a fork of the project (original preserved)
2. Updates the format metadata
3. Walks through each translation point, applying the user's chosen strategy
4. Restructures the outline from chapters to the new structural unit
5. Regenerates the Scene Metadata with format-appropriate fields (INT./EXT. for screenplays, stage directions for plays, etc.)
6. Adjusts the Editor's expectations to the new medium's conventions
7. If chapters/scenes already exist as prose, flags them for rewrite and offers to re-draft in the new format

### Combined Shift + Transposition

The user can do both at once — change genre AND medium simultaneously ("turn my literary novel into a horror podcast"). The system runs both analyses and merges the impact reports. This is the most complex transformation, so the preview is especially important — it shows the compound effect of changing both DNA and container.

### Transposition Catalog — What Translates How

The system maintains an internal knowledge base of how storytelling elements translate between mediums. This isn't shown to the user directly, but it drives the translation recommendations:

| Element | Novel → Screenplay | Novel → Stage Play | Novel → Podcast | Screenplay → Novel |
|---|---|---|---|---|
| Internal monologue | Action/dialogue/V.O. | Soliloquy/aside | Narration track | Expand into prose |
| Prose description | Action lines (minimal) | Stage directions (sparse) | Sound design + narration | Full sensory prose |
| Multiple POVs | Intercut scenes | Scene changes | Alternating narrators | Chapter alternation |
| Time jumps | TITLE CARD / SMASH CUT | Lighting change + costume | Music transition + narration | Section breaks |
| Subtext | Performance (actor's job) | Performance + blocking | Vocal tone + pause | Internal access |
| World-building | Production design | Set + lighting | Soundscape + dialogue | Prose description |
| Character voice | Dialogue-only | Dialogue + movement | Full vocal performance | Dialogue + narration |
| Emotional palette | Somatic → visible behavior | Somatic → stage business | Somatic → vocal quality | All channels open |

---

## Print and Export Formatting

The engine produces markdown files, but users need polished output. The export system handles formatting for multiple output types, with **format-aware intelligence** that automatically applies the right conventions based on the project's medium metadata.

### Format-Aware Export Templates

The export system reads the project's format metadata (`medium`, `formatType`, `outputTemplate`, `structuralUnit`) and automatically selects the right template, conventions, and file type. The user doesn't have to know what format a screenplay should be in — the system knows because it knows the project is a screenplay.

| Project Medium | Primary Export | Template Applied | Industry Standard |
|---|---|---|---|
| **Novel / Novella / Short Story** | .docx or .pdf | Manuscript format — title page, chapter headings, double-spaced, 1" margins, Courier 12pt or TNR 12pt, page numbers | Publisher/agent submission standard |
| **Feature Film / Short Film** | .fountain + .pdf | Screenplay format — scene headings (INT./EXT.), action lines, character cues centered, dialogue indented, parentheticals. PDF renders in Courier 12pt at ~1 page/minute | Studio submission standard |
| **TV Episode / Limited Series** | .fountain + .pdf | Teleplay format — same as screenplay but with act breaks, cold open, teaser, tag structure as applicable | Network/streaming submission |
| **Stage Play** | .pdf | Playwriting format — character names centered, dialogue beneath, stage directions in italics, act/scene divisions | Samuel French standard |
| **Musical** | .pdf | Musical book format — same as stage play with lyrics inset (indented, italicized), song cues marked, underscoring notes | MTI standard |
| **Poetry Collection** | .pdf or .epub | Poetry typesetting — generous white space, line breaks preserved exactly, stanza spacing, no justification, collection-level TOC | Chapbook/collection standard |
| **Podcast / Audio Drama** | .pdf + .md | Audio script format — speaker labels, SFX cues in brackets, music cues, pause notation, narration vs. dialogue distinction | Production script standard |
| **Graphic Novel / Manga / Comic** | .pdf | Panel script format — page-by-page layout, panel descriptions, dialogue balloons marked, SFX lettered, art direction notes | Comics script standard |
| **Interactive Fiction / Visual Novel** | .md + .json | Branching structure with choice points marked, passage IDs, variable tracking, link notation. Optionally export to Twine/Ink format | Twine (.html) or Ink (.ink) |
| **Song / Album** | .pdf | Lyric sheet format — verses, choruses, bridges marked, chord notation optional, liner notes | Standard lyric sheet |
| **Essay / Article / Blog Post** | .md or .docx | Clean prose format — no manuscript conventions, web-ready formatting, metadata header | Publication-ready |

### Export Formats (File Types)

| Format | What It Produces | Use Case |
|---|---|---|
| **.docx** (Word) | Formatted manuscript with the medium-appropriate template applied | Submission to publishers/agents, editing in Word |
| **.pdf** | Clean, typeset document with proper pagination, headers/footers, and the correct industry template | Sharing, printing, submission |
| **.epub** | Properly structured e-book with metadata, chapter navigation, and cover image support | Self-publishing, e-reader distribution |
| **.fountain** | Industry-standard screenplay/teleplay format | Screenwriting submission, import into Final Draft/Highland |
| **.ink** | Ink scripting language for interactive fiction | Import into Inky editor, game engines |
| **.md** (raw) | The project's raw markdown files as-is | Archival, technical users, static site generators |
| **.zip** | Complete project folder with all architecture files, chapters, and metadata | Backup, portability, full project archive |

### Formatting Options

Before export, a formatting dialog presents **medium-appropriate options** — the fields change based on what kind of project this is:

**All mediums:**
- **Title page** — Title, author name (real name or pen name), contact info
- **Include/exclude** — Choose which chapters/scenes/episodes to include
- **Architecture files** — Optionally include as an appendix (useful for workshops or teaching)

**Prose mediums (novel, novella, short story, essay):**
- **Header/footer** — Page numbers, title in header, chapter name in footer
- **Font** — Manuscript standard (Courier 12pt) or reading standard (Times/Georgia)
- **Spacing** — Double-spaced (manuscript standard) or single-spaced (reading)

**Script mediums (screenplay, teleplay, stage play):**
- **Act breaks** — Include or omit act/scene break pages
- **Scene numbers** — Include (production draft) or omit (spec script)
- **Character list** — Include cast page with descriptions
- **Revision marks** — Color-coded revision pages (white → blue → pink → yellow → green)

**Audio mediums (podcast, audio drama):**
- **SFX list** — Append a consolidated sound effects list
- **Music cues** — Include timing notes for scoring
- **Cast breakdown** — Voice actor assignment sheet

**Interactive mediums:**
- **Choice map** — Append a visual flowchart of all branching paths
- **Variable list** — Append tracking variables and their effects
- **Playtest version** — Export a playable HTML version

### Print Preview

A dedicated print preview mode shows the formatted output before export, so users can catch layout issues before committing.

---

## Returning User Onboarding

When the app updates with new features, returning users need a way to discover what changed without re-reading documentation.

### "What's New" Modal

After a significant update, the first time a returning user opens the app, a brief "What's New" modal appears:

- 2-3 bullet points describing the most important changes
- A "Show me" link for each that jumps to the relevant feature in-context
- A "Got it" button to dismiss
- A "Don't show these again" checkbox for users who prefer to explore on their own

### Feature Discovery Hints

For features added after the user's first session, subtle hints appear in context:

- A small "New" badge on UI elements that weren't there before
- A one-time tooltip the first time the user hovers over a new feature: "New: You can now fork your project to experiment without risk. [Learn more]"
- Hints are tracked per-user (local storage) and only shown once each

### Changelog

A "What's New" link in the settings menu opens a full changelog — a reverse-chronological list of all updates with descriptions. Available at any time for users who want to catch up.

---

## Accessibility for Scoring Visualizations

The Story Grade radar chart and scoring breakdowns must be accessible to all users, including those using screen readers or who have color vision deficiencies.

### Screen Reader Support

- The radar chart includes a text-only alternative: a structured list of all 10 dimensions with their scores, rendered as an ARIA-described table
- Score changes are announced via ARIA live regions: "Character Depth score improved from C+ to B after resolving duplicate wound issue"
- All grade badges have descriptive alt text: "Story Grade: B-plus. 7 of 10 dimensions passing."

### Color-Blind Safe Design

- The scoring system uses a dual-encoding approach: color **plus** pattern/icon
  - Green + checkmark = passing
  - Yellow + warning triangle = needs attention
  - Red + X = failing
- The relationship graph uses both color and line style (solid, dashed, dotted) to encode relationship types
- A high-contrast mode is available that replaces all color coding with monochrome patterns
- All color choices are tested against the three common forms of color blindness (protanopia, deuteranopia, tritanopia)

### Scoring Text Alternatives

Every visualization has a plain-text equivalent:

- Radar chart → sortable table of dimensions and scores
- Progress bars → "Phase 3: 72% complete (5 of 7 steps done)"
- Grade trajectory → "Grade history: F (project start) → D+ (after Phase 2) → C (after Phase 4) → B- (current)"

---

## Character Visualization System — Spider Charts & Arc Trajectories

Every character in the project gets a **visual profile card** — a spider/radar chart showing their psychological stats at a glance, plus an arc overlay showing how they change across the story.

### The Spider Chart

An 8-axis radar chart displaying the character's core psychological dimensions. The axes are derived from the engine's existing attribute systems (MBTI, Enneagram, moral alignment, Stream A/B, wound, flaw, virtue):

```
                    Stream A/B Balance
                    (Gut ↔ Consensus)
                         ╱╲
                        ╱  ╲
     Self-Awareness    ╱    ╲    Emotional
     (Reactive ↔      ╱      ╲   Expression
      Meta-Aware)     ╱        ╲  (Suppressed ↔ Open)
                     ╱    ██    ╲
                    ╱   ██  ██   ╲
   Order/Chaos ────╱──██──────██──╲──── Wound Integration
   (Lawful ↔       ╲  ██      ██  ╱    (Raw ↔ Processed)
    Chaotic)        ╲  ██    ██  ╱
                     ╲   ████   ╱
                      ╲        ╱
     Vulnerability     ╲      ╱    Theory-Gating
     Tolerance          ╲    ╱     (Flexible ↔
     (Closed ↔ Open)     ╲  ╱      Locked)
                          ╲╱
                    Good/Evil Alignment
                    (Selfish ↔ Selfless)
```

**The 8 axes:**

| Axis | What It Measures | Source |
|---|---|---|
| **Stream A/B Balance** | Gut instinct vs. social consensus — how much the character trusts themselves vs. the world | Story Consciousness Theory |
| **Self-Awareness** | How conscious is the character of their own patterns? (1=Reactive, 5=Meta-Aware) | Consciousness Theory developmental stages |
| **Emotional Expression** | Does the character show or suppress emotion by default? | Emotional register + defensive pattern |
| **Wound Integration** | How processed is the character's core wound? Raw and reactive, or acknowledged and managed? | Core wound + self-care mechanism |
| **Theory-Gating** | How flexible is the character's worldview? Open to new information, or locked into a belief system? | Theory lifecycle position |
| **Good/Evil Alignment** | Where does the character fall on the moral spectrum? | Moral alignment |
| **Vulnerability Tolerance** | Can this character allow themselves to be seen, or do they armor up? | Defensive pattern + attachment style |
| **Order/Chaos Alignment** | Does this character follow systems and codes, or break them? | Moral alignment + personal code |

Each axis runs 0-100. The shape of the chart tells you the character's psychological profile at a glance — a large, balanced octagon is a character with even development across all dimensions; a spiky, uneven shape is a character with dramatic strengths and weaknesses. The spiky characters are usually more interesting.

### Axis Color Theory

Each of the 8 axes has an assigned color rooted in color psychology and emotional association. These colors serve three purposes: they make the spider chart legible, they drive the arc overlay comparison, and — crucially — they generate the character's **avatar gradient** used throughout the entire UI (Cast Roster, file tree, relationship graph, chapter headers, guide mode bubbles).

| Axis | Color | Rationale |
|---|---|---|
| **Stream A/B Balance** | Deep Violet (#7C3AED) | Intuition, inner knowing, the subconscious — the axis is about gut vs. consensus, which lives in the liminal space between self and world |
| **Self-Awareness** | Gold (#F59E0B) | Illumination, clarity, insight — the axis measures how much light a character has turned inward |
| **Emotional Expression** | Warm Rose (#F43F5E) | Passion, feeling, warmth — the axis is about whether the character lets emotion surface |
| **Wound Integration** | Teal (#14B8A6) | Healing, growth, transformation — the axis tracks the wound's journey from raw to processed |
| **Theory-Gating** | Sky Blue (#0EA5E9) | Openness, expansiveness, possibility — the axis measures how flexible the worldview is |
| **Good/Evil Alignment** | Emerald (#10B981) | Morality, nature, conscience — the classic alignment axis |
| **Vulnerability Tolerance** | Amber (#F97316) | Courage, warmth, risk — letting yourself be seen takes fire |
| **Order/Chaos** | Slate Blue (#6366F1) | Structure, systems, architecture — or the breaking of them |

These aren't arbitrary — they're spaced around the color wheel so that any combination of 2-3 dominant axes produces a visually distinct and harmonious blend. No two adjacent axes share a similar hue. The palette is also designed to pass WCAG contrast checks against both light and dark backgrounds.

### Avatar Gradient — The Character's Visual Fingerprint

The spider chart scores directly generate each character's avatar. The system identifies the character's **top 2-3 dominant axes** (highest absolute scores), takes their assigned colors, and produces a gradient:

**Two dominant axes → two-color diagonal gradient.** Example: a character who scores highest on Wound Integration (Teal) and Emotional Expression (Rose) gets a teal-to-rose gradient. This reads as someone who is both healing and feeling — which tells you something about them at a glance.

**Three dominant axes → two-color gradient with a third-color border ring.** The two highest axes form the gradient fill; the third-highest becomes a subtle border/ring around the avatar. This keeps the gradient clean (two-color gradients are always more readable than three-color ones) while still representing the third dimension. Example: high Stream A/B (Violet) + high Order/Chaos (Slate Blue) gradient, with a Self-Awareness (Gold) border ring.

```
Two-color avatar:          Three-color avatar:

  ┌──────────┐              ┌──────────┐
  │ ╲ Teal   │              │╔════════╗│  ← Gold border
  │  ╲       │              │║╲Violet ║│
  │   ╲      │              │║  ╲     ║│
  │ EV ╲     │              │║EV ╲    ║│
  │     ╲    │              │║    ╲   ║│
  │   Rose ╲ │              │║Slate ╲ ║│
  └──────────┘              │╚════════╝│
                            └──────────┘
  Elara Voss                Elara Voss
  (Wound + Emotion)         (Stream + Order / Self-Awareness)
```

**Flat/balanced characters** (no clear dominant axes) get a softer, more muted gradient pulled from their two highest, even if the scores are close. The result is a less saturated, more neutral-toned avatar — which visually communicates "balanced / even."

**Arc-aware avatars (optional toggle):** By default the avatar reflects the character's **end state**. But the user can toggle "Show arc in avatar" in settings, which makes the avatar animate on hover — the gradient shifts from the start-state color blend to the end-state color blend, showing how the character's dominant traits change. A character whose top axes shift from Wound Integration + Order/Chaos to Self-Awareness + Vulnerability shows a gradient that moves from teal/slate to gold/amber on hover. This is a subtle, delightful detail — not essential, but deeply satisfying for users who are invested in their characters.

**Where the avatar appears:** Everywhere the character is referenced — Cast Roster cards, file tree icons, relationship graph nodes, chapter headers (showing which characters appear), guide mode speech bubbles, chat headers in Talk to a Character, editor review notes, cast overview grid. The gradient is the character's visual identity. Seeing "teal-and-rose" across the interface means Elara without reading her name.

**Character Photo Upload:** The user can upload a reference image for any character — a photo, illustration, AI-generated portrait, or any visual that captures their vision of the character. When a photo is uploaded, it replaces the gradient fill inside the avatar circle, but the gradient becomes the **border ring** around the image. This means the character's psychological color identity is always visible even with a custom photo — you see the image *framed* by their dominant axis colors. If the character has a three-color gradient, the two dominant axes form a gradient border ring and the third becomes a subtle outer glow.

```
Gradient-only avatar:       Photo avatar with gradient border:

  ┌──────────┐              ┌──────────────┐
  │ ╲ Teal   │              │ ╔══Teal════╗ │
  │  ╲       │              │ ║ ┌──────┐ ║ │
  │   ╲      │              │ ║ │      │ ║ │
  │ EV ╲     │              │ ║ │ PHOTO│ ║ │
  │     ╲    │              │ ║ │      │ ║ │
  │   Rose ╲ │              │ ║ └──────┘ ║ │
  └──────────┘              │ ╚══Rose═══╝ │
                            └──────────────┘
  Elara Voss                Elara Voss
  (gradient fill)           (photo + gradient border)
```

Photo management: upload from the character's profile page, the Cast Roster (right-click → "Upload photo"), or during character creation in the guided flow. Accepted formats: .jpg, .png, .webp. Images are stored locally with the project. The gradient avatar is always generated and stored as a fallback — deleting the photo restores the gradient fill.

**Manual override:** The user can also override the generated gradient with a custom color selection. The generated gradient is a smart default, not a cage.

### The Arc Overlay

This is the feature that makes the spider chart more than a static profile. The system generates **two overlapping radar charts** on the same axes:

- **Start state** (lighter, dotted line) — the character's profile at the beginning of the story
- **End state** (bold, solid line) — the character's profile at the end

```
                    Stream A/B
                       ╱╲
                      ╱  ╲
                     ╱    ╲
    Self-       ....╱......╲....  Emotional
    Awareness  :   ╱  ████  ╲  :  Expression
               :  ╱ ██    ██ ╲ :
               : ╱██        ██╲:
   Order ──────:╱██  ·····   ██╲:────── Wound
   /Chaos      :██  ·     ·  ██:       Integration
               :╲██·       · ██╱:
               : ╲·         ·╱ :
               :  ╲·       ·╱  :
    Vulnerability  ╲·····╱    Theory-
                    ╲    ╱     Gating
                     ╲  ╱
                      ╲╱
                   Good/Evil

    ████ = End state (bold)
    ···· = Start state (dotted)
```

The visual difference between the two shapes **is** the arc. A character whose wound integration moves from 20 to 75 across the story has a visible growth arc. A character whose good/evil axis shifts from 80 to 30 has a corruption arc. A character whose shape doesn't change at all has a flat arc — which is fine, if it's intentional (some characters exist to be the stable center while the world moves around them).

### Interactive Features

**Hover on any axis:** Shows the specific values (start/end), the source attributes that compose the score, and a one-line interpretation:
> "Wound Integration: 25 → 72. Elara starts the story still living in raw reaction to her mother's abandonment. By the end, she's acknowledged the wound and stopped punishing Marcus for it — though she hasn't fully healed."

**Click on any axis:** Opens the relevant character file section for editing.

**Compare mode:** Overlay two or more characters on the same chart to see how they contrast:
- Where do they overlap? (potential for alliance or mirror conflict)
- Where are they opposite? (natural tension points, foil relationship)
- Do their arc directions cross? (one gets more vulnerable while the other hardens — dramatic)

**Cast overview:** A grid of mini spider charts, one per character, showing the whole cast at a glance. Immediately reveals if two characters have identical shapes (redundancy warning) or if the cast is missing certain psychological profiles (cast gap).

```
┌──────────┬──────────┬──────────┬──────────┐
│  Elara   │  Marcus  │  Jean-Luc│   Ruth   │
│   ╱╲     │   ╱╲     │    ╱╲    │   ╱╲     │
│  ╱██╲    │  ╱  ╲    │  ╱████╲  │  ╱  ╲    │
│ ╱████╲   │ ╱ ██ ╲   │ ╱██████╲ │ ╱████╲   │
│ ╲████╱   │ ╲████╱   │ ╲██████╱ │ ╲  ██╱   │
│  ╲██╱    │  ╲██╱    │  ╲████╱  │  ╲  ╱    │
│   ╲╱     │   ╲╱     │   ╲╱╱    │   ╲╱     │
│ Spiky    │ Balanced │ Maxed    │ Lopsided │
│ (complex)│ (stable) │ (anchor) │ (broken) │
└──────────┴──────────┴──────────┴──────────┘
```

### SWOT-Style Character Breakdown

Alongside the spider chart, each character gets a **Strengths / Weaknesses / Opportunities / Threats** panel derived from their attributes:

- **Strengths:** Highest-scoring axes + virtue + values alignment. "What makes this character effective?"
- **Weaknesses:** Lowest-scoring axes + flaw + wound interference. "Where does this character fail?"
- **Opportunities:** Where the arc has room to grow — axes where the gap between start and end state is largest. "What can this character become?"
- **Threats:** Other characters, world pressures, or seal patterns that directly target this character's weaknesses. "What will test this character the hardest?"

### Network Archetype Badge

Each character's spider chart also displays their network archetype from Story Network Theory:

- **Pioneer** (high Stream A, low consensus) — explores, disrupts, stress-tests
- **Optimizer** (high Stream B, precision) — refines, improves, maintains
- **Generalist** (balanced) — bridges, translates, connects
- **Exploiter** (low Stream B, edge-case) — stress-tests morality, reveals exceptions

The archetype badge sits in the corner of the chart. The cast overview lets you see archetype distribution at a glance — a story with four Pioneers and no Optimizer has a balance problem.

### Where It Appears

- **Character file view** — the spider chart is the header of every character's file when opened in the Center Stage
- **Cast overview** — accessible from the left nav under Phase 4 (Characters) or via keyboard shortcut
- **Relationship graph** — hovering over a character node in the relationship graph shows their mini spider chart
- **Chapter review** — during review, the sidebar shows spider charts for all characters appearing in that chapter
- **Editor review** — the Editor references the charts when flagging character behavior inconsistencies ("Marcus's vulnerability tolerance is 15 but he opened up completely in this scene without any triggering event — is this intentional?")
- **Comparison view** — when comparing two stories, character charts can be compared across projects

---

## Emotional & Somatic Vocabulary System

The engine includes two reference lexicons — `Characters/Development/emotions.md` (1,100+ emotions organized by category) and `Characters/Development/sensations.md` (120+ physical sensations organized by body system). These aren't just word lists. They're the vocabulary layer that connects character psychology to prose — the bridge between "this character has a wound of abandonment" and "when Marcus touched her shoulder she felt a coldness spread from the contact point inward, a numbness that her body remembered before her mind did."

### Character Emotional Palette

During character creation, after the wound, flaw, virtue, and personality attributes are established, the system generates an **emotional palette** for each character — a curated subset of the emotions lexicon that represents this character's accessible emotional range.

The palette has three tiers:

**Home emotions** — the 8-12 emotions this character lives in by default. Derived from their wound, emotional register, MBTI, and enneagram. A character with a wound of erasure and a controlled-warm emotional register might have: vigilance, quiet resolve, tenderness (guarded), resignation, restlessness, wariness, composure, and a buried fury. These are the emotions the Author LLM reaches for first when writing this character.

**Stretch emotions** — the 6-10 emotions this character *can* access but doesn't default to. These require a triggering event, relationship pressure, or arc progression to surface. They're the emotions the character grows into (or is broken into). A character whose arc moves from closed to vulnerable might have tenderness, trust, and grief listed as stretch emotions — things they can feel by the end of the story but not at the beginning.

**Blocked emotions** — the 4-8 emotions this character *cannot access* without fundamental change. These are the feelings the wound has walled off. A character with an abandonment wound might have blocked: trust, belonging, surrender, serenity. These emotions don't appear in this character's scenes unless the arc has specifically opened the door — and if the Author LLM writes a scene where the character expresses a blocked emotion, the Editor flags it as a potential inconsistency.

```
┌──────────────────────────────────────────────────────────┐
│  Emotional Palette: Elara Voss                           │
│                                                          │
│  HOME (default register)                                 │
│  ┌──────────┐┌──────────┐┌───────────┐┌──────────┐     │
│  │ Vigilance││ Wariness ││ Composure ││ Restless ││     │
│  └──────────┘└──────────┘└───────────┘└──────────┘     │
│  ┌───────────┐┌───────────┐┌──────────┐┌─────────┐     │
│  │ Tenderness││ Resigna-  ││ Buried   ││ Resolve │     │
│  │ (guarded) ││ tion      ││ fury     ││ (quiet) │     │
│  └───────────┘└───────────┘└──────────┘└─────────┘     │
│                                                          │
│  STRETCH (arc-accessible)                                │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐      │
│  │ Grief    ││ Joy (un-  ││ Vulner-  ││ Playful- │      │
│  │ (open)   ││ guarded)  ││ ability  ││ ness     │      │
│  └──────────┘└──────────┘└──────────┘└──────────┘      │
│                                                          │
│  BLOCKED (wound-sealed)              🔒                  │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐      │
│  │ Trust    ││ Belonging││ Surrender││ Serenity │      │
│  └──────────┘└──────────┘└──────────┘└──────────┘      │
│                                                          │
│  [Edit Palette] [Suggest from Psychology] [View Lexicon] │
└──────────────────────────────────────────────────────────┘
```

The palette is auto-generated from the character's attributes but fully editable. "Suggest from Psychology" re-runs the generation if the user changes attributes. "View Lexicon" opens the full emotions.md as a browsable, searchable reference — the user can drag emotions from the lexicon into any tier.

### The Emotion Wheel Picker — Drill-Down Selection for Any EQ Level

Not every user has the emotional vocabulary to name the exact feeling they want a character to express. Some people can say "I want forlornness tinged with defiance." Others know it's "sad, but not regular sad — more like... angry-sad?" Both of these users should be able to find the right emotion without feeling lost or inadequate.

Anywhere the system asks the user to choose an emotion — editing a character's palette, setting a scene's emotional weather, describing a relationship dynamic, overriding the LLM's choice during chapter review — the input uses an **Emotion Wheel Picker**: a hierarchical drill-down that starts broad and narrows.

**Level 1 — The Core Ring (6 wedges):**

The outer ring shows the 6 universal emotions as large, color-coded wedges. These are the doors everyone can walk through:

```
            Joy
          ╱     ╲
      Love         Surprise
     │                    │
      Fear         Anger
          ╲     ╱
          Sadness
           +
        Disgust
```

Each wedge has a distinct color (Joy = warm gold, Sadness = deep blue, Anger = crimson, Fear = cool violet, Disgust = olive green, Love = warm rose, Surprise = electric teal). The user clicks the wedge that's closest to what they mean.

**Level 2 — The Intensity/Flavor Ring:**

Clicking a core emotion expands that wedge into a second ring of 6-12 more specific variants. These are drawn from the emotions lexicon's category structure:

```
Sadness → [Grief, Melancholy, Despondency, Woe,
           Forsakenness, Glumness, Sorrow,
           Dispiritedness, Longing, Resignation]

Anger   → [Fury, Resentment, Contempt, Exasperation,
           Indignation, Bitterness, Spite, Vengefulness]

Fear    → [Dread, Anxiety, Apprehension, Panic,
           Foreboding, Trepidation, Paranoia]

Joy     → [Elation, Contentment, Glee, Mirth,
           Rapture, Exhilaration, Serenity]

Love    → [Tenderness, Adoration, Infatuation,
           Devotion, Longing, Intimacy]

Disgust → [Revulsion, Loathing, Distaste,
           Repugnance, Contempt]

Surprise→ [Astonishment, Bewilderment, Shock,
           Awe, Disbelief, Wonder]
```

Each option shows a **one-line description on hover** so the user can learn the distinction: *"Despondency — a heavy, settled sadness with no expectation of change. Not dramatic grief, but the quiet weight of having given up on something."*

**Level 3 — The Nuance Ring (optional):**

For users who want to go deeper, clicking a Level 2 emotion drills into the full granularity of the lexicon — the Complex & Cognitive emotions, the States of Being, and the specific intensities:

```
Melancholy → [Wistfulness, Nostalgia, Poignancy,
              Lugubriousness, World-weariness,
              Bittersweet, Pensive, Brooding]
```

Level 3 is where the 1,100-entry lexicon lives. But most users will never need to go here — Level 2 is specific enough for 90% of decisions.

**Traversal — Moving Up and Sideways:**

The user can always go back up. A breadcrumb trail shows where they are:

```
┌──────────────────────────────────────────────────┐
│  Sadness > Melancholy > Wistfulness              │
│  ← Back to Melancholy  ← Back to Core            │
│                                                   │
│  ┌────────────────────────────────────┐          │
│  │  Wistfulness                       │          │
│  │  A gentle, bittersweet longing for │          │
│  │  something past — not grief, but   │          │
│  │  the quiet ache of remembering     │          │
│  │  what was good and knowing it's    │          │
│  │  gone.                             │          │
│  └────────────────────────────────────┘          │
│                                                   │
│  Also nearby: Nostalgia, Poignancy, Longing      │
│                                                   │
│  [Select This] [Explore Neighbors]                │
└──────────────────────────────────────────────────┘
```

"Explore Neighbors" shows adjacent emotions — related feelings that aren't direct children of the same parent. This is for the "it's *like* wistfulness but more..." moments. The neighbor suggestions are drawn from the emotion lexicon's cross-category relationships (e.g., wistfulness neighbors longing from the Love family and resignation from the States of Being family).

**Compound Emotions:**

Sometimes the right answer isn't one emotion — it's two or three in tension. The picker supports **multi-select with blending**. The user picks a primary emotion and optionally a secondary:

```
┌──────────────────────────────────────────────────┐
│  Primary: Tenderness (guarded)                    │
│  + Secondary: Wariness                            │
│                                                   │
│  Blend reads as: "She cares, but she's watching   │
│  for the trap. The softness is real. So is the    │
│  readiness to withdraw."                          │
│                                                   │
│  [Accept Blend] [Add Third] [Change Primary]      │
└──────────────────────────────────────────────────┘
```

The system generates a natural-language interpretation of the blend so the user can see if it matches what they meant. This is especially powerful for relationship dynamics and scene emotional weather, where the feeling in the room is rarely one thing.

**Search Fallback:**

For users who *do* know the word they want, a search bar at the top of the picker bypasses the wheel entirely. Type "lugubr..." and it autocompletes to "Lugubriousness" with the description and its position in the hierarchy (Sadness > Grief > Lugubriousness). Power users never have to use the wheel at all.

**LLM Best Judgment (Default):**

When the user *doesn't* engage the picker — when they leave an emotion field blank or choose "Let the engine decide" — the Author LLM selects from the character's palette using its own narrative judgment. The picker is never mandatory. The system defaults to LLM judgment for every emotional decision; the picker exists for when the user wants to override or guide that judgment. A small label makes this clear:

```
┌──────────────────────────────────────────────────┐
│  Scene Emotional Weather                          │
│                                                   │
│  Dominant emotion: ○ Let engine decide (default)  │
│                    ● Choose manually → [🎨 Wheel] │
│                                                   │
│  If the engine decides, it draws from the active  │
│  characters' palettes + the tonal arc position    │
│  + the scene's narrative function.                │
└──────────────────────────────────────────────────┘
```

**Where the Picker Appears:**

The Emotion Wheel Picker is used whenever the user needs to select an emotion anywhere in the system:

- **Emotional Palette editor** — dragging emotions between Home/Stretch/Blocked tiers
- **Somatic Signature editor** — choosing which emotions to map to physical sensations
- **Scene Metadata — Emotional Weather** — setting the dominant emotion and shift target
- **Relationship Emotional Dynamics** — defining the emotional texture of a character pair
- **Chapter review overrides** — when the user disagrees with an emotion the LLM chose ("she wouldn't feel anger here, she'd feel betrayal")
- **Talk to a Character** — prompting a character with a specific emotional state ("how would you feel if..." → pick the emotion)
- **Arc Emotion Tracking** — manually marking when a Stretch or Blocked emotion should unlock
- **Tonal Arc Designer** — tagging each tonal beat with emotional vocabulary

### Sensation Picker — The Somatic Equivalent

The same drill-down pattern applies to physical sensations, using the categories from `sensations.md`:

**Level 1 (8 body systems):** Pain & Discomfort, Fatigue & Energy, Thermal & Tactile, Hunger & Thirst, Kinesthetic & Proprioceptive, Respiratory & Internal, Sexual & Reproductive, Somatic & General

**Level 2 (specific sensations within each system):** Pain → Ache, Burning, Throb, Sting, Spasm, etc.

The Sensation Picker appears in the Somatic Signature editor and anywhere the user maps emotions to physical sensations. Like the Emotion Wheel, it has a search fallback for users who already know the word they want.

### Somatic Signature

Each character also gets a **somatic signature** — a curated subset of the sensations lexicon that describes how this character experiences emotion in their body. Different people feel the same emotion differently: one character's anger is a jaw clench and a heat behind the eyes; another's is a stomach drop and cold hands.

The somatic signature maps emotions to physical sensations:

```
┌──────────────────────────────────────────────────────────┐
│  Somatic Signature: Elara Voss                           │
│                                                          │
│  Fear     → Coldness (spreading), numbness, held breath  │
│  Anger    → Jaw tension, heat (chest), tremor (hands)    │
│  Grief    → Heaviness (chest), throat tightness, fatigue │
│  Comfort  → Warmth (hands), loosened shoulders, exhale   │
│  Desire   → Flush, prickling (skin), dizziness           │
│  Shame    → Nausea, heat (face), contraction (core)      │
│                                                          │
│  Default physical state: Tension (shoulders), alertness  │
│  Wound echo: Coldness at point of contact when touched   │
│              unexpectedly                                 │
│                                                          │
│  [Edit Mappings] [Suggest from Wound] [View Sensations]  │
└──────────────────────────────────────────────────────────┘
```

The **wound echo** is a specific physical sensation that recurs whenever the character's wound is activated — the body's memory of the original injury. This gives the Author LLM a consistent physical motif to weave through the prose. When Elara is triggered, there's always coldness. The reader starts to feel it coming before they know why.

### How the Author LLM Uses This

When generating chapter prose, the Author LLM receives each scene's active characters along with their emotional palettes and somatic signatures. The instructions are:

1. **Palette enforcement** — The character should primarily express emotions from their Home tier. Stretch emotions require a scene-level justification (a triggering event, a relationship shift, an arc milestone). Blocked emotions should not appear unless the arc has explicitly opened them.
2. **Show via soma** — When a character feels an emotion, the Author LLM should ground it in that character's somatic signature rather than naming the emotion directly. "Elara felt afraid" becomes the coldness spreading, the held breath, the numbness. The prose *shows* through the body.
3. **Differentiation** — Two characters in the same scene experiencing the same emotion should express it through different somatic channels. If both are afraid, one gets cold hands and the other gets a stomach lurch. This is how the reader feels the difference between characters even in a shared moment.
4. **Wound echo threading** — The wound echo should surface at key moments — not every scene, but reliably enough that the reader begins to associate the physical sensation with the character's deepest vulnerability.

### How the Editor Uses This

The Editor checks prose against the emotional palette and somatic signature:

- **Palette violation** — "Elara expresses open trust in this scene, but trust is in her Blocked tier. Has her arc progressed enough to unlock this? If not, this moment needs to be earned or rewritten."
- **Somatic drift** — "Marcus's anger has been consistently expressed as jaw tension and chest heat, but in Chapter 6 it suddenly manifests as nausea and trembling. Is this intentional (indicating a new kind of anger — perhaps fear-adjacent) or inconsistent?"
- **Show-don't-tell check** — "This paragraph names 3 emotions directly ('she felt angry, then sad, then resigned') without any somatic grounding. Consider showing at least the dominant emotion through the body."
- **Wound echo tracking** — "Elara's coldness motif hasn't appeared in 4 chapters. The wound hasn't been resolved — is the story losing track of it, or is this a deliberate cooling period?"

### Relationship Emotional Dynamics

Each relationship pair gets a characteristic **emotional signature** — the emotions that surface when these two characters are together. This is derived from both characters' palettes, their relationship type, and their dynamic.

```
┌──────────────────────────────────────────────────────────┐
│  Relationship Emotions: Elara ↔ Marcus                   │
│                                                          │
│  When together, the dominant emotional field is:         │
│  Tenderness (guarded) + Wariness + Unspoken longing      │
│                                                          │
│  Elara's pattern: She softens, then catches herself.     │
│  Physical tell: warmth in hands → sudden withdrawal      │
│                                                          │
│  Marcus's pattern: He reaches, overreaches, retreats.    │
│  Physical tell: leaning forward → jaw set → exhale       │
│                                                          │
│  Conflict trigger: When Marcus says "trust me" (echoes   │
│  Elara's wound). Her coldness response activates.        │
│                                                          │
│  Arc trajectory: The guarded tenderness should slowly    │
│  lose its "guarded" qualifier across Acts 2-3            │
│                                                          │
│  [Edit] [Derive from Character Palettes]                 │
└──────────────────────────────────────────────────────────┘
```

This data feeds into the relationship graph — each edge in the graph now carries not just a type (alliance, conflict, romance) but an emotional texture. The Author LLM uses this when writing any scene where these two characters interact, and the Editor checks whether the emotional dynamic is consistent or evolving on pace with the arc.

### Scene Emotion Layer

The Scene Metadata Editor (defined elsewhere) gains an additional field: **Emotional Weather**. For each scene, the user (or the system in guided mode) specifies:

- **Dominant emotion in the room** — the emotional atmosphere before anyone speaks (e.g., tension, false calm, giddiness)
- **Emotional shift** — where the scene's emotional center moves to by the end (e.g., tension → eruption → hollow quiet)
- **Who carries the shift** — which character's emotional movement drives the scene's turn
- **Somatic anchor** — the one physical detail that should recur or build throughout the scene (e.g., "the ticking clock" for anxiety, "sweat on a glass" for discomfort)

This connects the emotion/sensation system to the scene structure — every scene has an emotional shape, not just a plot function.

### Arc Emotion Tracking

The Progress Tracker gains an **Emotional Arc** view — a timeline showing how each character's accessible emotions expand, contract, or shift across the story:

```
        Ch1    Ch2    Ch3    Ch4    Ch5    Ch6    Ch7    Ch8
Elara   ████   ████   ████   █████  █████  ██████ ██████ ████████
        home   home   home   +grief +vuln. +trust +play  full range
        only   only   only   unlocked      unlocked

Marcus  ██████ █████  ████   ████   ███    ████   █████  ██████
        broad  losing closing anger  rock   rebuild-      reopened
               joy    down   only   bottom ing
```

This visualization shows at a glance whether the emotional arcs are progressing — a character stuck in their Home tier for 6 chapters isn't growing. A character who unlocks all their Blocked emotions in a single chapter is moving too fast. The Editor can reference this in its feedback.

### Integration with Existing Systems

**Spider chart:** The Emotional Expression axis (one of the 8) now has deeper data backing it — instead of just a 0-100 score, it can draw on the palette breadth (how many emotions are accessible) and the somatic richness (how physically grounded the character's emotional life is).

**Voice fingerprint:** The character's somatic signature becomes part of their voice — it's the body language of their prose. A character who experiences emotions as temperature shifts writes differently from one who experiences them as muscular tension.

**Tonal Arc Designer:** The 5-point tonal arc now has an emotional vocabulary layer — each tonal beat can specify not just the tone (wry, urgent, intimate) but the dominant emotions and sensations that should color the prose at that point.

**Talk to a Character:** When chatting with a character, the LLM can describe what the character is *physically feeling* as they talk about difficult topics. "You're asking me about Marcus and I can feel my shoulders going up around my ears. That's — that tells you something, doesn't it."

**Decomposition:** When decomposing an existing work, the system can extract the emotional palette and somatic signature from the prose. Which emotions does each character express? Which physical sensations recur? This reverse-engineers the original author's instinctive choices into structured data.

**Silent Writing Assessment:** The emotions and sensations the user naturally reaches for in their own writing reveal their emotional vocabulary range — do they default to the same 5 feelings, or do they draw from a wide palette? This feeds into the writing profile.

---

## The Bridge — Phase 7 to Phase 8 Transition

The Master Checklist includes a "Bridge" — five threshold orientation questions that help the writer cross from architecture to prose. This moment deserves its own screen. It's the last quiet pause before the actual writing begins.

### Visual Design

The Bridge screen is **visually distinct** from the rest of the app. When the user completes Phase 7 and is ready to start drafting:

- The left nav, right sidebar, and bottom bar **fade out**
- The Center Stage expands to fill the entire screen
- The background shifts to a calmer color palette (muted, warm, spacious)
- No progress bar. No grade badge. No checklist. Just the writer and the questions.

This signals: the structural work is done. You're about to write. Take a breath.

### The Cost of Change — Why the Bridge Matters

The Bridge isn't just ceremonial — it represents a real economic boundary in the creative process. The system makes this explicit:

**Before the Bridge (Phases 1-7):** Changes are cheap. Renaming a character costs nothing. Changing a wound rewrites one file and cascades through a few others — the system handles it automatically. Swapping a genre shifts some architecture but no prose exists yet to rewrite. Restructuring the outline is rearranging a plan, not demolishing a building. The framework files are a **blueprint** — redraw as many times as you want. Every question the system asks, every file it generates, every roll it makes is building the spec. The more robust this spec is before the first word of prose is written, the stronger everything downstream will be.

**After the Bridge (Phase 8+):** Changes get expensive. Changing a character's wound in Chapter 5 means every chapter that character has appeared in may need revision. Their dialogue, their somatic responses, their relationship dynamics, their arc — all of it was written against the old wound. The Editor will flag cascading inconsistencies. The Author LLM will need to rewrite with the new psychology loaded. And every subsequent chapter needs to be checked.

The Bridge screen communicates this directly:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Before you cross:                                       │
│                                                          │
│  Everything you've built so far — the author, the cast,  │
│  the world, the outline, the relationships — is your     │
│  blueprint. Right now, changes are free. After this       │
│  point, every change costs prose.                        │
│                                                          │
│  If something doesn't feel right — a character's wound,  │
│  a relationship dynamic, the tonal arc, the outline's    │
│  shape — go back now. It's cheaper to redraw the plan    │
│  than to rebuild the house.                              │
│                                                          │
│  When you're ready, the system will build Chapter 1      │
│  on this foundation. Then Chapter 2 on top of that.      │
│  Each chapter cements the architecture further.          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Post-Bridge change detection:** When the user modifies an architecture file after chapters have been written, the system shows a **change impact warning**:

```
┌──────────────────────────────────────────────────────────┐
│  ⚠ Architecture Change Detected                         │
│                                                          │
│  You changed: Elara's wound (abandonment → betrayal)     │
│  Chapters written: 5                                     │
│                                                          │
│  This change affects:                                    │
│  • Elara's dialogue in Ch. 1, 2, 3, 4, 5 (somatic      │
│    responses, defensive patterns)                        │
│  • Relationship dynamics with Marcus (Ch. 2, 4, 5)      │
│  • Emotional palette (home/stretch/blocked tiers shift)  │
│  • Scene Dynamics Forecasts for Ch. 6+ (recalculate)    │
│                                                          │
│  Options:                                                │
│  ○ Apply to future chapters only (Ch. 6+ use new wound; │
│    Ch. 1-5 keep old wound — treat as character growth)   │
│  ○ Flag all affected chapters for revision (Editor will  │
│    review each for consistency with new wound)           │
│  ○ Rewrite affected chapters (Author LLM regenerates    │
│    with new architecture — most expensive option)        │
│                                                          │
│  [Apply] [Cancel Change]                                 │
└──────────────────────────────────────────────────────────┘
```

The **sequential building model** reinforces this: Chapter 1 is built on the full architecture. Chapter 2 is built on the architecture + Chapter 1. Chapter 3 on architecture + Chapter 1 + Chapter 2. Each chapter is reviewed (by the user and optionally the Editor) before the next begins. The LLM always reads the core architecture files plus all preceding chapters before generating the next one. This means the architecture files function as the project's constitution — they're consulted for every decision — and the chapters are the case law built on top of that constitution. Change the constitution after case law exists and you've got a retroactivity problem.

### The Five Questions

Presented one at a time, Typeform-style, with generous whitespace:

1. **"What is the emotional contract with your reader?"** — What are you promising them in the first chapter? What feeling should they trust will be honored by the end?

2. **"What is the first image?"** — Not the first plot point. The first *image*. What does the reader see? What does it mean that they don't know yet?

3. **"What does the narrator's voice sound like in the opening line?"** — Read the author.md and narrator.md one last time. What's the first sentence? (Not to write it now — just to hear it.)

4. **"What is your protagonist carrying into Chapter 1?"** — Their wound is active. Their want is pulling them. Their need is invisible to them. What does that look like in their body, their choices, their first scene?

5. **"Are you ready to begin?"** — A simple yes. The system creates Chapter 1 and opens the drafting workspace.

After Question 5, the Bridge fades and the full workspace returns — but now in **Drafting Mode** (Phase 8).

---

## Reverse Scaffolding — Architecture from Existing Prose

When a user arrives with a rough draft already written (Wizard Step 6: "Rough draft exists" or "Nearly complete"), the system can't just run the normal pipeline. The story already exists in prose form — it needs to be reverse-engineered into the engine's architecture files.

### The Flow

**Step 1: Upload**
Same upload zone as the Wizard. The user uploads their chapters (one file or many). The system stitches them in order.

**Step 2: Reverse Decomposition**
The LLM reads the entire manuscript and generates architecture files from the prose:

- `author.md` — inferred psychology, wound, voice fingerprint, prose style (all tagged [INFERRED])
- `narrator.md` — inferred POV, reliability, tense, gap
- `characters/{name}.md` — one per character found, with wound, flaw, virtue, MBTI, voice fingerprint, Stream A/B estimate
- `relationships/relationship-graph.csv` — inferred from dialogue and interaction patterns
- `world/world-building.md` — inferred genre, themes, rules, society-as-character
- `world/hallmarks.md` — recurring objects, places, symbols identified
- `arc.md` — inferred protagonist arc, tonal arc, subplot arcs
- `outline.md` — retroactive chapter-by-chapter outline based on what actually happens

Everything is tagged **[INFERRED]** — meaning the system deduced it from the prose, not from the user's explicit input.

**Step 3: Review and Correct**
The inferred architecture is presented to the user in a review flow (similar to decomposition results). For each file:

- The user can **Confirm** (change [INFERRED] to [CONFIRMED])
- The user can **Correct** (edit the inferred value — e.g., "No, Marcus's wound isn't abandonment, it's betrayal")
- The user can **Leave as-is** (keep [INFERRED] for now, revisit later)

**Step 4: Gap Identification**
After the review, the system runs a diagnostic and identifies what's missing:

- Characters without wounds or voice fingerprints
- Relationships without dynamics or attachment styles
- A world with no society-as-character defined
- No hallmarks identified
- Absent theme question
- Tonal arc not designed (prose has tones, but no intentional arc)
- Seven Deaths audit never run

These gaps are presented as a checklist in the progress tracker, and the guided flow picks up from the earliest gap.

**Step 5: Grade and Proceed**
The story receives its first Story Grade based on the combination of existing prose + inferred architecture + identified gaps. The user then chooses:

- **Fill the gaps** — Enter the guided flow to complete the missing architecture
- **Go straight to Editor** — Send the existing chapters to Phase 9 for review against whatever architecture exists
- **Both** — Fill gaps first, then Editor

---

## Comparison Workflow

When a user wants to compare two stories side by side (both must be decomposed or have architecture files), the Comparison View provides a structured analysis.

### Entry Points

- "Compare two stories" Quick Action on the Home screen
- Right-click any project in the Thread List → "Compare with another project"
- After decomposing a second story → "Compare with [existing project]"

### The Comparison Layout

Center Stage splits into two panels with a middle column showing the structural differences:

```
┌─────────────────┬─────────┬─────────────────┐
│   Story A       │  Delta  │   Story B       │
│                 │         │                 │
│  Author:        │ WOUND   │  Author:        │
│  Wound: erasure │ ≠       │  Wound: betrayal│
│  MBTI: INTJ     │ MBTI    │  MBTI: ENFP     │
│  Era: Minimalism│ =       │  Era: Minimalism│
│                 │ ERA     │                 │
│  Narrator:      │         │  Narrator:      │
│  1st person     │ POV     │  3rd limited    │
│  Unreliable     │ ≠       │  Reliable       │
│                 │         │                 │
│  Cast: 8 chars  │ SIZE    │  Cast: 14 chars │
│  2 Pioneers     │ ≠       │  1 Pioneer      │
│  3 Optimizers   │         │  5 Optimizers   │
│                 │         │                 │
└─────────────────┴─────────┴─────────────────┘
```

### Comparison Categories

The comparison walks through every phase of the engine:

1. **Author vs. Author** — Psychology, wound, blind spots, prose style, voice fingerprint
2. **Narrator vs. Narrator** — POV, reliability, tense, distance, gap
3. **World vs. World** — Genre, rules, society, hallmarks, themes
4. **Cast vs. Cast** — Network archetypes, wound distribution, cast size, spider chart overlay
5. **Relationships vs. Relationships** — Graph structure, power dynamics, attachment style distribution
6. **Arc vs. Arc** — Protagonist arc shape, tonal arc shape, subplot count and density
7. **Seven Deaths** — Which seals are operating in each story? Overlapping? Opposing?
8. **Score vs. Score** — Grade comparison across all 10 dimensions

Each category highlights what's the same (=) and what's different (≠), and names which engine lever accounts for the difference.

### Insights

The comparison also generates:

- "What Story A does that Story B doesn't" (and vice versa)
- "Where the same structure produces different effects" (same wound → different manifestation)
- "What a reader who loved Story A would think of Story B"
- "If you combined the best of both, what would you keep from each?"

---

## Analysis Mode — Teaching Without Building

For users who decompose a story but don't want to write anything — students, book club members, curious readers — the app offers a **Structural Tour** experience.

### The Flow

After decomposition completes, the user selects "Learn about this story" (from the "What Now?" options).

### The Structural Tour

A guided, chapter-by-chapter (or section-by-section) walkthrough that teaches storytelling through the lens of the decomposed work:

**Stop 1: The Author's Wound**
"Every story is shaped by the psychology of the person telling it. Here's what we can infer about this author's wound, and here's how it shows up in the prose..."

**Stop 2: The Narrator's Lens**
"This story is told in [POV] by a [reliability type] narrator. Here's what that means — the narrator is filtering everything through [gap description]. Notice how [specific passage example]..."

**Stop 3: The World as Organism**
"The world of this story isn't just a backdrop. It's a character. Here's how [society-as-character] exerts pressure on every person in it..."

**Stop 4: The Characters' Wiring**
"Each character has a wound, a flaw, a virtue, and a Stream A/B balance. Here's the cast, and here's how their wiring drives the plot..." (Spider charts shown here)

**Stop 5: The Relationship Web**
"Stories are made of people in tension with each other. Here's the relationship graph, and here's where the most pressure lives..."

**Stop 6: The Seven Deaths Check**
"Every story risks these seven structural failures. Here's which ones this story avoids, which ones it deliberately invokes, and which ones it falls into accidentally..."

**Stop 7: The Arc and the Theme**
"Here's the shape of the protagonist's arc, and here's the question the story is asking. Notice how the theme echoes across [domains]..."

**Stop 8: The Open Questions**
"Here's what this story leaves unresolved. Here's what you might think about after reading it. Here's where you might disagree with the author's answer..."

Each stop includes:
- The engine's analysis (from the decomposition)
- Specific passage references (with CONFIRMED/INFERRED tags)
- An explanation of the underlying theory (Consciousness Theory, Network Theory, Seven Deaths)
- A "What If?" prompt: "What would change if [the narrator were unreliable] / [the protagonist had a different wound] / [the genre shifted to horror]?"
- A "Discuss" button that opens Chat with this stop's context loaded

### Teaching Mode vs. Workshop Mode

Teaching mode is **read-only**. The user isn't building anything — they're learning. There's no progress tracker, no grade, no checklist. The tone is more like a well-designed course than a productivity tool.

But at any point, the user can switch to Workshop Mode: "Use this as foundation for my own project." The decomposition becomes the starting architecture for a new project (sequel, adaptation, spinoff, or inspired-by).

---

## The Roll/Choose/Import Pattern — Universal Input for Generated Attributes

Every attribute the engine generates — character names, identity traits, personality dimensions, voice fingerprint elements, world details, relationship dynamics — follows a single universal input pattern. The user is never locked into pure randomness and never forced to accept a result they don't connect with.

### The Five Modes

Every generated attribute presents a **mode selector** as a row of pill buttons above the result area:

```
┌─────────────────────────────────────────────────────┐
│  Character Name                                     │
│                                                     │
│  ● Random  ○ Guided  ○ Re-Roll  ○ Write In  ○ Import│
│                                                     │
│  ┌───────────────────────────────────┐              │
│  │  Result: Marisol Vega             │              │
│  │  Origin: Spanish/Latin American   │              │
│  │  Meaning: "Sea and sun"           │              │
│  └───────────────────────────────────┘              │
│                                                     │
│  [Accept]  [Try Another]                            │
└─────────────────────────────────────────────────────┘
```

**1. Random** — Pure engine roll. Uses the datetime seed → 3-digit window → mod N + 1 math. The result is whatever the dice say. The user sees the math (transparency is the engine's principle). This is the default mode for all attributes.

**2. Guided** — Constrained roll. The engine still rolls, but the candidate pool is filtered by existing data: genre, setting, time period, cultural context, previously rolled attributes, decomposed source material, or any combination. The user can toggle which filters apply. Example: rolling a name "guided by" the character's already-established Japanese cultural background and 1980s time period produces a contextually grounded name from a narrower pool.

Guided filters available depend on what data exists in the project:
- **Genre/setting** — always available after Wizard Step 2
- **Cultural context** — available after identity attributes are rolled
- **Time period** — available if world-building has established era
- **Previously rolled attributes** — cascade constraints (age, gender, etc.)
- **Decomposed data** — available if any decomposition has been done
- **Author preferences** — available if author.md specifies naming conventions

**3. Re-Roll** — Keep rolling until you like it. Each press of "Try Another" generates a new result using the next seed position. A history strip shows previous rolls so the user can go back:

```
┌─────────────────────────────────────────────────────┐
│  Character Name — Re-Roll Mode                      │
│                                                     │
│  Current: Marisol Vega                              │
│                                                     │
│  Previous:                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Suki Ota │ │ Ines Dahl│ │ Nneka Obi│  ← scroll │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  [Try Another]  [Accept Current]  [Pick from History]│
└─────────────────────────────────────────────────────┘
```

Re-Roll works with both Random and Guided modes. If in Guided mode, each re-roll respects the same filters. The history strip is scrollable and unlimited — roll as many times as you want.

**4. Write In** — Manual entry. The user types whatever they want. A text input replaces the result card. For names, a "Name Meaning Lookup" link appears below the input to help the user check etymology and cultural context of their chosen name. For other attributes, the input may offer autocomplete from the engine's known option lists, but the user can type anything — the engine accepts freeform entries.

```
┌─────────────────────────────────────────────────────┐
│  Character Name — Write In                          │
│                                                     │
│  ┌───────────────────────────────────┐              │
│  │  Elena Reyes                      │              │
│  └───────────────────────────────────┘              │
│  ↳ Name Meaning Lookup                              │
│                                                     │
│  [Accept]                                           │
└─────────────────────────────────────────────────────┘
```

**5. Import** — Pull from decomposed data. Only available if the project has decomposition results. Shows a searchable list of values extracted from decomposed source material, tagged with their source and confidence level (CONFIRMED / INFERRED). The user picks from the list, or uses it as inspiration and switches to Write In.

```
┌─────────────────────────────────────────────────────┐
│  Character Name — Import from Decomposition         │
│                                                     │
│  Source: "The Left Hand of Darkness"                 │
│  ┌─────────────────────────────────────────┐        │
│  │ ☑ Genly Ai        [CONFIRMED] protagonist│       │
│  │ ○ Estraven        [CONFIRMED] deuterag.  │       │
│  │ ○ Argaven         [CONFIRMED] king       │       │
│  │ ○ Ashe            [INFERRED]  minor      │       │
│  └─────────────────────────────────────────┘        │
│  🔍 Search decomposed names...                      │
│                                                     │
│  [Accept Selected]  [Use as Inspiration → Write In] │
└─────────────────────────────────────────────────────┘
```

### Applying the Pattern to All Attribute Types

The pattern is universal but adapts its presentation to the attribute type:

**Character names** — All five modes. Re-Roll is especially prominent (larger "Try Another" button). Guided mode filters by gender, culture, era, genre. Import shows decomposed character names. Name Meaning Lookup available in Write In mode.

**Identity attributes (age, gender, sexuality, religion, etc.)** — All five modes. Random mode shows the seed math. Guided mode constrains by cascade dependencies (age affects life status, religion weighted by cultural context, etc.). Write In offers autocomplete from the engine's lists but accepts freeform. Import pulls from decomposed character profiles.

**Personality attributes (MBTI, enneagram, moral alignment, wound/flaw/virtue)** — All five modes. Guided mode is especially useful here because these attributes interact heavily with each other. The "Why this combination works" tooltip explains productive tensions. Write In should show the full option list as a selectable grid rather than freeform text, since these are structured taxonomies.

**Voice fingerprint** — All five modes, but Write In is a richer editor (since voice is multi-dimensional: vocabulary level, sentence rhythm, verbal tics, etc.). Guided mode produces voice traits that complement the character's wound and personality.

**World-building details (locations, cultural elements, etc.)** — All five modes. Import is especially valuable for projects that decomposed a source work's world.

**Story elements (themes, tropes, plot structures)** — All five modes. Guided mode filters by genre and format. Import pulls from decomposed narrative structures.

### The Anti-Regression Nuance

The randomization engine's philosophical principle is that strange results produce better fiction — the unexpected combination is the feature, not the bug. But this principle applies to the **structural** attributes (wound, flaw, virtue, personality type, moral alignment) more than to **aesthetic** ones (names, zodiac, specific cultural details).

The UI communicates this distinction:

- **Structural attributes** (wound, flaw, virtue, MBTI, enneagram, moral alignment, character type): When the user re-rolls or writes in, a gentle nudge appears: *"The engine rolled [X] because it creates productive tension with [Y]. Overriding this is fine — but consider sitting with the unexpected choice for a moment."* The nudge is dismissible, not blocking. The user always has final say.

- **Aesthetic attributes** (names, zodiac, specific cultural markers): No nudge. Re-roll freely. These are about resonance and feel — the user should love the name.

- **Cascade-dependent attributes**: When the user overrides a roll that other attributes depend on, the system shows which downstream attributes will need to re-cascade. Example: changing a character's age range from "34-42" to "18-22" triggers a prompt: *"This changes the candidate pools for: life status, life philosophy, emotional register, and wound. Re-cascade these now?"* The user can re-cascade (re-rolling affected downstream attributes) or keep the current downstream values despite the change.

### Batch Mode for Full Cast

When generating multiple characters, the user can set preferences at the cast level before rolling individuals:

```
┌─────────────────────────────────────────────────────┐
│  Cast Generation Preferences                        │
│                                                     │
│  Default mode for names:  ○ Random  ● Guided  ...  │
│  Default mode for identity: ● Random  ○ Guided ...  │
│  Default mode for personality: ● Random  ○ Guided   │
│                                                     │
│  Guided filters (apply to all characters):          │
│  ☑ Genre-appropriate    ☑ Setting-consistent        │
│  ☑ Time-period aware    ☐ Decomposition-sourced     │
│                                                     │
│  [Generate Cast]  [Character-by-Character Instead]  │
└─────────────────────────────────────────────────────┘
```

After batch generation, each character is presented for review. The user can accept, re-roll individual attributes, or switch to Write In for any field — the same five-mode selector appears on every attribute of every character.

### Preloading from Decomposition

When a user has decomposed one or more source works, the Import mode becomes a powerful onboarding path. At the start of character creation, a banner offers:

```
┌─────────────────────────────────────────────────────┐
│  📚 You have decomposed characters available         │
│                                                     │
│  "The Left Hand of Darkness" — 7 characters         │
│  "Parable of the Sower" — 5 characters              │
│                                                     │
│  [Start from Decomposed Cast]  [Start Fresh]        │
└─────────────────────────────────────────────────────┘
```

"Start from Decomposed Cast" preloads all decomposed character data into the character creation flow. Each attribute shows as an Import with the decomposed value pre-selected, but every field is still editable — the user can override any value using any of the five modes. CONFIRMED attributes show with higher confidence styling; INFERRED attributes show with a softer treatment and a note suggesting the user verify or adjust.

This creates three natural workflows for character creation:
1. **Pure generation** — all Random/Guided, building from scratch
2. **Inspired by** — Import a decomposed cast, then modify heavily to create something new
3. **Continuation** — Import a decomposed cast with minimal changes (for sequels, fanfic, adaptation)

---

## Cascading Attribute Roll System — The Randomization UI

When generating a character (or author) using the randomization engine, the system rolls attributes in a specific order. The UI needs to make this process visible, educational, and satisfying. Each individual roll uses the **Roll/Choose/Import Pattern** (see above) — the cascade visualization described here is the structural wrapper that organizes the 14 rolls into their dependency sequence.

### The Roll Sequence

The engine rolls 14 attributes in cascade order, where early rolls constrain later ones:

1. **Age Range** (root node — affects everything downstream)
2. **Gender** (root node — affects everything downstream)
3. **Religion/Faith** (weighted by age and cultural context)
4. **Life Status** (weighted by age)
5. **Sexuality** (independent)
6. **Life Philosophy** (weighted by age, faith, life status)
7. **Emotional Register** (weighted by wound, age, philosophy)
8. **Zodiac** (independent, optional flavor)
9. **MBTI** (independent but creates productive tension with wound)
10. **Enneagram** (independent but constrains flaw/virtue candidates)
11. **Moral Alignment** (weighted by philosophy, faith, wound)
12. **Character Type** (protagonist, antagonist, etc.)
13. **Core Wound / Flaw / Virtue** (constrained by all of the above)
14. **Voice Fingerprint** (derived from everything above)

### Roll Visualization

Each roll is presented as a card in the guided flow:

```
┌─────────────────────────────────────────┐
│  Roll 3 of 14: Religion/Faith           │
│                                         │
│  ● Random ○ Guided ○ Re-Roll            │
│  ○ Write In ○ Import                    │
│                                         │
│  Seed: 20260331142 | Window: 331        │
│  List: 12 options | 331 mod 12 + 1 = 8  │
│                                         │
│  ┌───────────────────────────────┐      │
│  │  Result: Lapsed Catholic      │      │
│  └───────────────────────────────┘      │
│                                         │
│  Cascading from:                        │
│  • Age: 34-42 (mid-career adult)        │
│  • Gender: Female                       │
│                                         │
│  This affects downstream:               │
│  • Life philosophy (guilt, duty,        │
│    moral framework shaped by exit)      │
│  • Emotional register (restraint        │
│    patterns from religious upbringing)  │
│  • Wound candidates (possible faith     │
│    betrayal, community rejection)       │
│                                         │
│  [Accept] [Try Another] [Why this       │
│   matters] [Details]                    │
└─────────────────────────────────────────┘
```

**Key UI rules:**
- The user sees the math (seed → window → mod → result). Transparency is the engine's principle.
- The user sees what cascades from this roll and what it constrains downstream.
- Each roll card includes the full **Roll/Choose/Import Pattern** — the user can accept the random result, switch to Guided, Re-Roll, Write In, or Import from decomposition. For structural attributes (wound, flaw, virtue, personality types), a gentle anti-regression nudge encourages sitting with unexpected results. For aesthetic attributes (names, zodiac), re-rolling is frictionless.
- When the user overrides a roll that has downstream dependencies, the cascade re-calculation prompt appears (see "The Anti-Regression Nuance" above).
- After all 14 rolls complete, the full profile is presented with all cascade connections visible.

### Cascade Visualization

After all rolls are complete, a cascade diagram shows the dependency tree:

```
Age (34-42) ──────┬── Religion (Lapsed Catholic)
                  ├── Life Status (Divorced, one child)
                  ├── Life Philosophy (Pragmatic Stoic)
                  └── Emotional Register (Controlled warm)

Gender (Female) ──┬── Voice tendencies
                  └── Cultural register interactions

Wound (Erasure) ──┬── Core Flaw (Rigidity)
                  ├── Core Virtue (Precision)
                  ├── Self-Care (Overwork — perpetuates wound)
                  └── Defensive Pattern (Withdrawal + overcorrection)
```

### Weighted Rolls

Some rolls use the d10-based weighted system from the randomization engine. When a weighted roll occurs, the UI shows the probability gating:

```
┌─────────────────────────────────────────┐
│  Weighted Roll: Emotional Register      │
│                                         │
│  d10 roll: 7                            │
│  Threshold: ≤6 for common registers     │
│  Result: UNCOMMON tier unlocked         │
│                                         │
│  Rolling within uncommon registers...   │
│  Window: 142 | List: 4 | 142 mod 4 + 1 │
│  = 3                                    │
│                                         │
│  Result: Controlled Warm (unusual for   │
│  this wound type — creates productive   │
│  tension)                               │
│                                         │
│  [Accept] [Why this is interesting]     │
└─────────────────────────────────────────┘
```

---

## Tonal Arc Designer

The tonal arc is a 5-point emotional shape across the story. The UI provides a visual editor for designing it.

### The Visual Editor

A horizontal timeline with draggable tone markers at five positions:

```
    Tone
    ▲
    │   Intimate
    │        ╲
    │         ╲    Urgent
    │   Wry    ╲  ╱       ╲
    │    ╲      ╲╱         ╲
    │     ╲                 ╲   Elegiac
    │      ╲                 ╲ ╱
    │       ╲_____Deadpan     ╲
    │                          ╲
    └───────────────────────────────► Story Timeline
        Opening  Act 1  Act 2   Act 2  Closing
                  End   Mid     End
```

**At each point, the user selects from the 14 tone types** (Earnest, Wry, Deadpan, Ironic, Satirical, Elegiac, Urgent, Gothic/Foreboding, Lyrical, Clinical, Comic, Confrontational, Intimate, Mythic).

**Deliberate departures:** The user can add markers between the five fixed points to indicate scenes where the tone intentionally breaks from the arc. Each departure requires a story justification.

**Three-tone distinction:** The designer shows three parallel tracks — Author tone, Narrator tone, and Character tone — and highlights where they align vs. diverge.

---

## Subproblem Stack Tracker

The engine tracks 6 parallel narrative threads through the story. The UI makes this visible as a living dashboard.

### The Six Threads

| Thread | What It Tracks |
|---|---|
| **Emotional** | Protagonist's internal emotional journey |
| **Thematic** | The story's central question — how it's being asked and complicated |
| **Plot** | External events, obstacles, goals |
| **Character Wound** | The wound's pressure on every decision |
| **Relationship** | The key relationship arc (or arcs) |
| **World's Question** | What the world/society is asking of the protagonist |

### The Visual

A horizontal multi-lane tracker, one row per thread, with state indicators per chapter:

```
              Ch1  Ch2  Ch3  Ch4  Ch5  Ch6  Ch7  Ch8
Emotional:    ○    ●    ●    ◉    ●    ●    ◉    ◉
Thematic:     ○    ○    ●    ●    ●    ●    ◉    ◉
Plot:         ●    ●    ●    ◉    ●    ●    ●    ◉
Wound:        ○    ○    ●    ●    ◉    ●    ●    ◉
Relationship: ○    ●    ●    ●    ●    ◉    ●    ◉
World:        ●    ○    ○    ●    ●    ●    ◉    ◉

○ = Dormant   ● = Active   ◉ = Critical   ◈ = Resolved
```

The tracker updates after each chapter is approved. The Editor references it to catch threads that have been dormant too long or resolved too early.

### Convergent Climax Check

As the story approaches its climax, the tracker highlights whether multiple threads are reaching "Critical" simultaneously — which is the sign of a well-designed convergent climax. If only one thread is critical while others are dormant, the system flags it: "Your climax is resolving the plot but not the theme, the wound, or the relationship. Is that intentional?"

---

## Scene Metadata Editor

Every chapter gets per-scene metadata attached to it, derived from the world-building and scenery files. This metadata helps the Author LLM write more grounded prose and helps the Editor check for continuity.

### Per-Scene Fields

| Field | Options | Source |
|---|---|---|
| **Location** | Country/region → city/community → specific place (hierarchical) | World-building |
| **Interior/Exterior** | Private, semi-private, institutional, commercial, sacred, transit, industrial (interior) / Private, semi-public, wilderness, threshold (exterior) | Scenery file |
| **Time of Day** | Before dawn, dawn, morning, midday, afternoon, golden hour, evening, night | Scenery file |
| **Weather/Light** | Clear, overcast, fog, rain, thunderstorm, snow, wind, heat haze, dark | Scenery file |
| **Season** | Spring, summer, autumn, winter (or custom fictional seasons) | Time and calendar |
| **Setting Function** | Which of the 5 functions: Externalizing interior state, Exerting pressure, Carrying history, Creating contrast, Earning belief | Scenery file |
| **Dominant Tone** | Which of the 14 tone types governs this scene | Tonal arc |
| **Active Threads** | Which subproblem threads are active/critical in this scene | Subproblem stack |
| **Emotional Weather** | Dominant emotion in the room before anyone speaks, emotional shift across the scene, who carries the shift, somatic anchor (recurring physical detail) | Emotional & Somatic Vocabulary System |

### Where It Appears

The scene metadata editor is a **collapsible panel above the chapter editor** in the Center Stage. Before writing each chapter, the user (or system, in guided mode) fills in the metadata. The Author LLM uses this metadata when generating the chapter draft. The Editor checks whether the prose matches the metadata.

---

## Visual Reference System — Photos, Mood Boards, and Image Pins

Many writers think visually. The Serendipity Engine supports image uploads at two levels: **character photos** (replacing the gradient avatar fill) and **mood board images** (pinned to hallmarks, locations, and world-building elements).

### Character Photos

Any character can have a reference image uploaded — a photo, illustration, AI-generated portrait, or any visual that captures the user's vision of the character. The photo replaces the gradient fill in the avatar circle while the gradient becomes a visible border ring, preserving the character's psychological color identity. See the Avatar Gradient section for full details.

Upload from: character profile page, Cast Roster (right-click → "Upload photo"), character creation in guided flow. Accepted formats: .jpg, .png, .webp. Images stored locally with the project. The gradient avatar is always generated as a fallback.

### Mood Board — Hallmarks & World-Building

Hallmarks are the story's signature elements — objects, places, forces, symbols, events that escape the text and live in the audience's memory. Many of these are inherently visual: The Green Light, the Valley of Ashes, the Bonding Chamber. Users can **pin images to any hallmark entry** in `world/hallmarks.md` to capture the look and feel they're imagining.

```
HALLMARKS — The Shunning Season

┌─────────────────────────────────────────────┐
│  🖼 The Council Hall                        │
│  ┌──────────┐                               │
│  │          │  Type: Place                   │
│  │  [image] │  Function: Carries history     │
│  │          │  Theme echo: Power ≠ wisdom    │
│  └──────────┘  Recurrence: Ch1, Ch4, Ch9     │
│  "A cold stone room where every voice        │
│   echoes but no one listens."                │
│                                              │
│  [📷 Add image] [📝 Edit] [🔗 Chapter refs] │
├─────────────────────────────────────────────┤
│  🖼 The Red Thread                          │
│  ┌──────────┐                               │
│  │          │  Type: Symbol                  │
│  │  [image] │  Function: Externalizes state  │
│  │          │  Theme echo: Connection cost   │
│  └──────────┘  Recurrence: Ch2, Ch5, Ch7     │
│                                              │
│  [📷 Add image] [📝 Edit] [🔗 Chapter refs] │
└─────────────────────────────────────────────┘
```

Each hallmark entry can hold **one primary image** that appears as a thumbnail alongside the hallmark's metadata. Clicking the image opens it full-size. The image is purely for the user's reference — it helps them hold a consistent visual in mind while writing. The Author LLM does not see these images (LLMs are text-based), but the hallmark's text description carries the same intent.

### Location Reference Images

Scene metadata entries (from the Scene Metadata Editor) can also have pinned images. When the user fills in a scene's location, they can optionally attach a reference image:

- **World-level:** A landscape or map image pinned to the world-building file
- **Location-level:** A specific place image attached to a scene's location field

These appear as small thumbnails in the Scene Metadata Editor's collapsible panel, providing visual grounding when the user is writing about a place.

### Where Images Are Stored

All uploaded images are stored in a `media/` folder within the project directory:

- `media/characters/{name}.jpg` — character reference photos
- `media/hallmarks/{hallmark-name}.jpg` — hallmark mood images
- `media/locations/{location-name}.jpg` — location reference photos

The `media/` folder is included in project .zip exports and imports. Images are local-only — no server upload, no CDN, no external dependencies.

### What Images Are NOT

This is not an AI image generation system. The engine does not generate images from character descriptions or world-building text. Users bring their own reference images from whatever source they prefer — stock photos, personal photos, AI generators like Midjourney/DALL-E, hand-drawn sketches, screenshots from films. The engine simply stores and displays them in context.

---

## Story Timeline — The Unified View

Everything in the Serendipity Engine generates data across the story's chapters — character arcs, emotional palettes, relationship dynamics, subproblem threads, tonal shifts, story beats. These all exist in separate systems. The Story Timeline compiles them into one synchronized horizontal view so the user can see **what happens when, to whom, and how everything connects**.

This is not a new data source. It is a **read-only visualization layer** that pulls from existing architecture files: `arc.md`, `outline.md`, character files, `relationship-graph.csv`, the subproblem stack, the tonal arc, Scene Emotion Layer metadata, Scene Dynamics Forecasts, and Reader Experience Reports.

### Where It Lives

The Story Timeline is a **seventh mode in Center Stage** (alongside Guided Flow, Editor, Reader, Comparison, Relationship Graph, and Chat). It can also be launched from:

- The **Progress Tracker** in the Right Sidebar (a "View Timeline" link below the pipeline progress)
- The **Phase Navigator** (clicking the Phase 6 Story Foundation section)
- Any **chapter header** (jumps to the timeline with that chapter highlighted)
- The **Command Palette** (`Ctrl/Cmd + K` → "Story Timeline")

### The Layout

A horizontal axis representing the story's chapters (or acts, episodes, scenes — whatever the medium's structural unit is). Above and below this axis, multiple **swim lanes** stack to show different data dimensions simultaneously:

```
STORY TIMELINE — The Shunning Season
═══════════════════════════════════════════════════════════════════

  Lanes: [✓] Story Beats  [✓] Character Arcs  [✓] Relationships
         [✓] Emotional     [✓] Subproblems    [✓] Tonal Arc
         [ ] Reader Report  [ ] Scene Dynamics

         Ch1       Ch2       Ch3       Ch4       Ch5       Ch6
         ─────────┼─────────┼─────────┼─────────┼─────────┼─────────

STORY    Setup     Rising    Rising    Midpoint  Complica- Crisis
BEATS    ░░░░░░░  ▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓  ████████  ▓▓▓▓▓▓▓  ████████
         Introduce  The lie   The cost  Truth     Fallout   Breaking
         the world  works     appears   surfaces              point

ELARA    ────●─── ────●──── ───●───── ──●────── ─●─────── ●────────
ARC      Home      Home      Stretch   Wound     Cracking  Blocked→
         emotions  only      begins    trigger   open      Stretch

MARCUS   ────●─── ───●───── ──●────── ────●──── ───●───── ──●──────
ARC      Broad     Closing   Anger     Anger     Rock      Rebuilding
         range     down      dominant  only      bottom

ELARA ↔  ═══════  ═══════   ══════╗   ╔══════   ═══════   ════════
MARCUS   Trust     Trust     ║Strain║   ║Break ║  Silence   Tentative
         building  building  ╚══════╝   ╚══════╝            repair

ELARA ↔  ───────  ═══════   ═══════   ═══════   ══════╗   ╔═══════
PRIYA    Neutral   Alliance  Alliance  Tension   ║Betray║  ║Cold war║
                                                 ╚══════╝  ╚═══════╝

EMOTIONS ☀ calm   ☀ hope    🌧 dread  ⚡storm   🌧 grief  🌤 resolve
(scene)  warm     warm      cold      cold      cold      shifting

THREADS  ○ ● ● ○  ○ ● ● ○  ● ● ● ●  ● ◉ ● ●  ● ◉ ◉ ●  ◉ ◉ ◉ ◉
E/T/P/W  ○ ○      ● ○      ● ●      ● ◉      ◉ ●      ◉ ◉

TONAL    ░ Quiet  ▒ Wry     ▓ Tense   █ Urgent  ▓ Raw     ▒ Resolve
ARC      measured  deflecting building  cracking  exposed   steady
```

### Swim Lane Details

Each lane is independently toggleable via checkboxes at the top of the timeline. Users can show as few as one lane or all of them simultaneously.

**Story Beats Lane:** The chapter's structural function from the outline (setup, rising action, midpoint, crisis, climax, resolution). Shows a brief label for what happens in each chapter. Color intensity reflects narrative intensity — lighter for setup, darker for climax moments.

**Character Arc Lanes:** One lane per tracked character (user selects which characters to display — defaults to Main Cast). Shows the character's emotional palette position (Home / Stretch / Blocked), arc phase, and key moment summary. The arc line moves vertically to represent growth or regression. Clicking any point opens the character file at that chapter's state.

**Relationship Lanes:** One lane per significant character pair (user selects which pairs to display). Shows the relationship dynamic's current state with visual encoding — solid lines for stable, highlighted boxes for moments of strain/break/shift. The color reflects emotional charge (warm for alliance, cool for tension, red for conflict). Clicking any segment opens the relationship graph entry for that pair at that chapter.

**Emotional Weather Lane:** The scene-level dominant emotion from the Scene Emotion Layer, displayed as weather-like icons plus a one-word label. Shows at a glance the emotional temperature of each chapter.

**Subproblem Threads Lane:** A compact version of the Subproblem Stack Tracker — all 6 threads (Emotional, Thematic, Plot, Wound, Relationship, World) in a single condensed row per chapter using the same ○/●/◉/◈ state indicators.

**Tonal Arc Lane:** The dominant tone per chapter from the Tonal Arc Designer, shown as a labeled gradient bar. The visual intensity matches the tonal weight.

**Reader Experience Lane (optional):** If Reader Experience Reports exist for chapters, shows the pacing shape (sprint/slow burn/choppy) and read time. Only populated after chapters have been drafted and reviewed.

**Scene Dynamics Lane (optional):** If Scene Dynamics Forecasts exist, shows the predicted collision/collaboration moments and which characters were involved. Only populated during the drafting phase.

### Interactive Features

**Hover on any cell:** Expands a tooltip with fuller detail — the chapter's outline entry, the character's specific emotional state, the relationship's exact dynamic, etc.

**Click any cell:** Jumps the Center Stage to that chapter in the relevant view. Clicking a character arc cell opens their character file; clicking a relationship cell opens the relationship graph; clicking a story beat opens the outline.

**Zoom controls:** The timeline defaults to showing all chapters at once. For long stories (20+ chapters), horizontal scroll with zoom in/out. Pinch-to-zoom on trackpad. A minimap at the bottom shows the full timeline with the visible window highlighted.

**Chapter markers:** Vertical dashed lines mark chapter boundaries. Thicker lines mark act breaks (for stories using act structure). The current chapter (the one being drafted or most recently approved) is highlighted with a subtle background tint.

**Convergence highlighting:** When multiple lanes show critical moments at the same chapter — wound trigger + relationship break + subproblem going critical — the timeline highlights that column with a glow effect and a label: "Convergence point." This is the visual equivalent of the Convergent Climax Check but available across the full story, not just at the climax.

**Arc comparison overlay:** Toggling multiple character arc lanes simultaneously shows their arcs stacked, making it easy to see where characters are growing in opposite directions (one opens up while another shuts down) or in parallel (both hitting rock bottom at the same chapter — which might be a problem or a deliberate choice).

**Relationship strength graph (optional view):** Instead of discrete state labels, relationships can be displayed as a continuous line graph showing relationship "temperature" from -10 (hostile) to +10 (bonded). The line's shape tells the story — a steady decline, a sudden drop, a slow recovery. Multiple pairs overlaid reveal patterns.

### When It Updates

The timeline is populated progressively as the project grows:

- **After Phase 6 (Story Foundation):** Story beats, tonal arc, and initial character arc start-states appear. The timeline shows the *plan*.
- **After the Bridge:** No change, but the timeline becomes the dashboard the user works from.
- **After each chapter is approved:** The timeline updates with the *reality* — what actually happened vs. what was planned. If the chapter diverged from the outline, the story beat cell shows both the planned label and the actual label.
- **After Editor review:** If the Editor flagged arc issues, the affected cells get a subtle warning indicator (small orange dot).

### Plan vs. Reality View

A toggle at the top of the timeline switches between:

- **Plan view** (from the outline and architecture) — what *should* happen
- **Reality view** (from drafted chapters) — what *actually* happened
- **Comparison view** — both overlaid, with divergences highlighted in a contrasting color

This is enormously useful for the user and the Editor. A character whose planned arc says "wound trigger at Chapter 4" but whose actual prose shows no wound activation at Chapter 4 creates a visible gap that's immediately actionable.

---

## Coverage Audit — MetaFiles vs. UI Design

After a full audit of the codebase, the following elements are **implicitly covered** by the guided flow (which walks through every question in every phase's `questions.md` file):

- All world-building questions (50+ across 8 categories)
- All character questions (cast composition, mirroring, power hierarchy, redundancy)
- All relationship questions (type, dynamics, power, conflict, change)
- All story questions (core, genre/tone, conflict/stakes, structure, narrator/POV, subplots/themes)
- Genre selection (12 sublists, 242 options)
- Narrative technique selection (83+ techniques across 8 categories)
- Plot structure selection (7 frameworks)
- Plot twist taxonomy (45+ types across 7 categories)
- Theme cluster selection (48+ themes across 8 clusters)
- Trope selection (40+ tropes with straight/subvert/mutate designation)
- Narrator configuration (7 reliability types, 8 perspective types, 7 positions, 10 voice registers)
- Relationship type/structure/dynamic selection (81+ types, 27 structures, 10 dynamics)
- Attachment style assignment (4 types per character)
- Content rating and profanity calibration (G through 18+)
- Banter pattern assignment (9 types)
- Literary era, cultural tradition, and voice tendency selection

The guided flow handles all of these through the Typeform-style question cards. The above sections that were explicitly designed in this doc (spider charts, tonal arc designer, subproblem tracker, scene metadata, cascading rolls) are the elements that needed **bespoke interactive UI** beyond simple question-and-answer cards.

---

## Data & Export

Users can at any time:
- **Download the full project folder** as a .zip
- **Download individual files** (any .md, .csv, or generated document)
- **Export as formatted document** — convert the story to .docx, .pdf, .epub, or .fountain using the Print and Export Formatting options above
- **Export the outline** as a standalone document
- **Export the relationship graph** as CSV or visual diagram (PNG/SVG)
- **Import a project** — upload a previously exported .zip or select a folder to load

---

## Writing Habit System — The Hooked Loop (Future State, Opt-In)

*This feature is deferred to a future version. It is not part of the v1 build. When implemented, it will be entirely opt-in — users must explicitly enable it. It is never forced, never nagging, and never guilt-tripping.*

The problem this solves: writing a novel takes months. Most people who start never finish. The architecture and tools in the Serendipity Engine can be brilliant, but they're worthless if the user opens the app once, builds a cool world, and never comes back. The Writing Habit System applies the principles from Nir Eyal's "Hooked" model to create a positive, non-manipulative engagement loop — the same mechanics that make Duolingo effective, adapted for creative writing.

### The Four Phases (Trigger → Action → Variable Reward → Investment)

**1. Trigger (External → Internal)**

External triggers bring the user back. Internal triggers keep them coming back.

- **External triggers (early):** Gentle opt-in notifications. "Elara is waiting in Chapter 6." "You left Marcus at rock bottom — want to pick him up?" "Your story grade went from B to B+ after last session." Character Guide voice in notifications: the protagonist asking the user to come back (in-character, tied to where the story left off).
- **Internal triggers (develop over time):** Curiosity about what happens next (the system leaves cliffhangers in chapter summaries). Ownership of the characters (the more the user invests in building character profiles, the more they want to see those characters live). Creative momentum (each completed chapter makes the next feel more urgent, not less).
- **Trigger timing:** Never more than one per day. Never in the first hour after the user closes the app. Respect Do Not Disturb. User sets their preferred reminder window (morning, evening, weekend only, etc.).

**2. Action (Minimal Friction to Start)**

The user's next action must be the easiest possible thing:

- **"Pick up where I left off"** button on the Welcome Back card — one click to resume exactly where they stopped.
- **Daily prompt:** A small, low-pressure starting prompt: "Write one sentence about what Elara sees when she opens the door." Not a full chapter — just one sentence to break the blank-page paralysis. The sentence gets folded into the chapter draft automatically.
- **Session goals (user-set):** "I want to write 500 words today" or "I want to finish one scene" or "I want to spend 20 minutes." The progress bar in the bottom bar tracks against the session goal, not the total project.

**3. Variable Reward (Unpredictable Satisfaction)**

The reward must be surprising enough to generate dopamine, not mechanical enough to become boring:

- **Character reactions:** After the user completes a scene, the Character Guide (if enabled) reacts in-character. Sometimes delighted, sometimes worried, sometimes surprised. The reaction is generated by the LLM based on what just happened — so it's different every time. "You actually let me say that? I didn't think you had it in me."
- **Story Grade movement:** The grade updates after meaningful progress. Seeing it tick from B+ to A- is a real hit. The system can highlight which specific dimension improved and why.
- **Reader Experience Report snippets:** After completing a chapter, a one-line Reader Experience preview: "This chapter reads like a sprint — your reader won't be able to put it down." or "The Elara-Marcus scene in this chapter is the most emotionally complex thing you've written."
- **Milestone celebrations:** 25% / 50% / 75% / 100% (already in the Progress Tracker). Future: custom milestones ("first chapter with all 6 subproblem threads active," "first time a character used a Blocked emotion").

**4. Investment (Stored Value That Grows)**

Each session makes the next session more valuable:

- **The architecture itself is investment.** The more files the user has built, the richer the LLM's context, the better the output. The user can see this: "Your Story Assistant now has 47 architecture files to work with. Your next chapter will be the most contextually aware one yet."
- **Writing Profile growth:** The Silent Writing Assessment tracks improvement over time. "Your vocabulary range expanded in this project" is meaningful feedback that only exists because the user kept writing.
- **Relationship investment:** The more the user talks to their characters (via Talk to a Character), the more real those characters feel. That emotional connection is the strongest retention force — stronger than any notification.
- **Community portfolio (future):** If the platform ever supports sharing, the user's completed projects become a portfolio. Each finished story is proof of creative capacity.

### What This Is NOT

- Not a streak counter that guilt-trips you for missing a day (Duolingo's worst feature)
- Not a gamification layer with points, badges, or leaderboards
- Not a mandatory system — completely opt-in, configured in Settings > Writing
- Not a social competition feature
- Not manipulative — no loss aversion tactics ("you'll lose your progress!"), no artificial scarcity, no dark patterns

### Settings (in pwa-settings-wireframe.md, future section)

| Setting | Options | Default | Notes |
|---|---|---|---|
| **Writing Habit System** | On / Off | Off | Master toggle. Off by default. |
| **Reminder Frequency** | Daily / Every other day / Weekly | Daily | How often external triggers fire |
| **Reminder Window** | Morning / Afternoon / Evening / Custom | Evening | When reminders arrive |
| **Session Goal Type** | Word count / Time / Scenes / Off | Off | What the session progress bar tracks |
| **Session Goal Amount** | User-set number | 500 words / 20 min / 1 scene | Target per session |
| **Character Notifications** | On / Off | On (when habit system is on) | Whether the protagonist sends in-character nudges |

---

## Deferred Features — Future Roadmap

The following features have been identified as valuable but are explicitly **not included in v1**. They are documented here to prevent re-discovery and to inform future planning.

| Feature | Status | Why Deferred | When to Revisit |
|---|---|---|---|
| **Multi-User Collaboration** | Deferred | Requires server infrastructure, auth, real-time sync | If the project scales to a hosted product |
| **Version History (Git-based)** | Deferred | Non-technical users can't set up private repos. Undo/redo + sandbox/fork covers the v1 use case | If the project gets a hosted backend |
| **Push Notifications** | Deferred | Requires service worker complexity. The Writing Habit System defines what notifications would say, but PWA push is a separate technical effort | With the Writing Habit System |
| **Mobile / Tablet Responsive Design** | Deferred | The entire UI doc is desktop-first. Mobile adaptation requires deliberate responsive design decisions — which modes are available, what gets simplified, how touch interactions work | During UI implementation when we can see the actual layouts |
| **AI Image Generation** | Deferred | The Visual Reference System supports image upload but not generation. Adding DALL-E/Midjourney/Stable Diffusion integration is a separate feature | If demand exists after launch |
| **Prose-Level Rhythm Analysis** | Deferred | Active Deconstruction covers grammar, voice, structure, theme, and character. Sentence-level cadence/musicality analysis is a deeper layer | After v1 Active Deconstruction proves its value |
| **Writing Habit System (Hooked Loop)** | Deferred | Fully designed above but opt-in and not part of v1 core | After the core app is stable and retention data exists |
| **Localization / i18n** | Deferred | Reference lists are multicultural but UI is English-only for v1 | Based on user demand |

---

## Summary of User Requirements Addressed

| Requirement | Where It Lives |
|---|---|
| Typeform-style guided experience | Onboarding Wizard (Screen 2) + Guided Flow mode in Center Stage |
| Recent project threads | Project Hub (Screen 1) |
| Story type selection (book, movie, TV, etc.) | Wizard Step 1 |
| Genre drill-down | Wizard Step 2 |
| Story scope, cast size, series planning | Wizard Step 3 (3a, 3b, 3c) |
| Sequel/prequel/spinoff/continuation options | Wizard Step 4 |
| Original story option | Wizard Step 4 |
| Import existing files/rough drafts | Wizard Step 5 + LLM decomposition |
| Complete vs. guidance vs. generate options | Wizard Step 6 + Step 7 |
| Hand-holding through all engine phases | Guided Flow mode + Teaching Mode |
| Direct file editing at any time | File Tree + Editor mode |
| Download at any time | Download button in Left Panel |
| Author doc first, then world-building, etc. | Phase Navigator follows engine order |
| Silent writing level assessment from user samples | Silent Writing Assessment (passive analysis → author.md enrichment, editor calibration, complexity defaults) |
| Long-term writing growth tracking | Writing Journey (global profile, cross-project timeline in settings) |
| Word count guidance by medium | Word Count section + Bottom Bar tracker |
| Character arc scoring and critique | Arc Scoring subsystem + LLM critique |
| Story arc overall scoring | Story Grade system |
| Ranking and critical improvement | Grade breakdown with actionable suggestions |
| Explaining importance of structural work | Teaching Mode — contextual explanations |
| Chapter-by-chapter review with feedback | Chapter Review Workflow (8 steps with dynamics forecast + reader experience report) |
| Pre-chapter collision/collaboration prediction | Scene Dynamics Forecast (character state → probable paths, wound triggers, arc opportunities) |
| Post-chapter reader experience analysis | Reader Experience Report (pacing shape, read time, emotional trajectory, dialogue ratio, info density, character presence) |
| Multi-LLM plug-and-play with role assignment | Multi-Model Configuration (Simple/Standard/Granular modes, mid-project switching, model audit trail) |
| Chapter summaries for slow readers | Summary option in Review step |
| Text-to-speech with speed options | TTS system (Web Speech API) |
| Progress checklist on right side | Right Sidebar — Section 1 |
| Story grade visible | Right Sidebar — Section 2 + Top Bar |
| Teaching tool functionality | Teaching Mode woven throughout |
| Grammarly-like active deconstruction of user writing | Active Deconstruction (grammar → voice → structure → theme → character behavioral layers) |
| Conversational teacher persona | Teacher as a Character (toggle in settings, open questions, data-gathering through conversation) |
| Voice casting briefs for narrator and characters | Voice Casting system (narrator + per-character briefs from architecture files, exportable as prompts for ElevenLabs/OpenAI TTS) |
| Cost of change philosophy (cheap before Bridge, expensive after) | The Bridge — Cost of Change section + post-Bridge change impact warnings |
| Simple vs Advanced mode for different experience levels | Mode Selector (Simple: 3-step wizard + active teaching; Advanced: full 8-step wizard + all controls) |
| Editor QA phase (separate LLM session) | Phase 9 — The Editor |
| Consistency checking across chapters | Editor Pass 1 — Consistency |
| Multi-pass revision (Author ↔ Editor) | Editor Mode 4 — Multi-Pass Deep Edit |
| Auto-approve or manual approval of edits | Editor Approval Modes (4 modes) |
| Architecture files as source of truth | Architecture Files section |
| Versioned feedback files (editor + external + author notes) | Feedback File System (feedback/ folder, standard template, source tagging, version progression) |
| Feedback timeline with recurring issue detection | Feedback Timeline visualization + recurring flags |
| External feedback upload and reformatting | Upload Feedback flow (paste/upload → reformat to template → save as external-v{N}.md) |
| Audience-based Editor personas | Editor Personas system |
| Multiple Editor perspectives (pick and choose) | Multi-Persona Review mode |
| YOLO mode (auto-accept all) | Editor Approval Mode 1 (Auto-Approve) |
| Conflict resolution (Author vs Editor) | Conflict Resolution — user as tiebreaker, YOLO = Author wins |
| Chapter-by-chapter sequential generation | Chapter Generation Rules |
| Chat / conversation about the story | Chat / Conversation Interface (Center Stage Mode 6) |
| Decomposition workflow with full UI | Decomposition Workflow UI |
| Sandbox / experimentation mode | Sandbox / Fork Mode (per-file what-if + full project fork) |
| Error handling and offline support | Error and Failure States |
| Persistent project thread list | Thread List (left sidebar, like Claude Desktop) |
| Re-entry for returning users | Re-Entry Experience (Welcome Back card) |
| Storage without database | Storage Model (local-first, download/reupload, optional Git) |
| Keyboard shortcuts for power users | Keyboard Shortcuts + Command Palette |
| Print/export formatting | Print and Export Formatting (.docx, .pdf, .epub, .fountain, .ink) |
| Genre shift (change genre, keep medium) | Genre Shift — Shift Dashboard, Preview Impact report, fork + guided revision |
| Medium transposition (change medium, keep story) | Medium Transposition — Transposition Report with translation options, fork + restructure |
| Format-aware export templates | Format-Aware Export (auto-selects industry template from project metadata) |
| Medium-specific export options | Script: scene numbers, revision colors. Audio: SFX list. Interactive: choice map, playable HTML |
| Returning user onboarding | What's New modal + feature discovery hints |
| Accessible scoring visualizations | Accessibility for Scoring Visualizations |
| LLM connection (API key / SSO) | Screen 0 — First-Time Setup |
| Multi-model configuration | Settings → AI Configuration |
| Chat with characters | Chat Persona 3 — Talk to a Character (scene interrogation, arc reflection, motivation mining, what-if exploration, out-of-story commentary, scene-anchored conversations) |
| Editor as distinct chat persona | Chat Persona 2 — The Editor (dark mode + orange accents) |
| Character-driven worldbuilding via chat | Talk to a Character → architecture file suggestions |
| Character as guide/companion through building process | Character Guide Mode (toggle, protagonist narrates the process) |
| Cast roster with avatars and quick access | Cast Roster — IMDB Panel (Left Nav tab, tiered, relationship lines) |
| Partial text decomposition | Decomposition Step 2 — partial vs. complete detection |
| Terms of Use / License acceptance | Screen 0A — Terms of Use & License Agreement |
| Anti-academic-dishonesty policy | Terms of Use — Acceptable Use Policy |
| Cast size planning | Wizard Step 3b — cast size selection with downstream effects |
| Series vs standalone | Wizard Step 3a — standalone / series planning |
| Story scope / ambition level | Wizard Step 3c — scope selection affecting complexity defaults |
| Character spider chart / radar visualization | Character Visualization System |
| Color theory axis palette + gradient avatars | Axis Color Theory + Avatar Gradient (spider chart → 2-3 color avatar used everywhere) |
| Emotion lexicon (1,100+ emotions by category) | Emotional & Somatic Vocabulary System — emotions.md reference lexicon |
| Sensation lexicon (120+ physical sensations) | Emotional & Somatic Vocabulary System — sensations.md reference lexicon |
| Per-character emotional palette (home/stretch/blocked) | Character Emotional Palette (3-tier system derived from wound/personality) |
| Emotion selection UI for any EQ level | Emotion Wheel Picker (3-level drill-down: core → intensity → nuance, compound blends, search fallback, LLM default) |
| Sensation selection UI | Sensation Picker (8 body systems → specific sensations, same drill-down pattern) |
| Per-character somatic signature (emotion → body mapping) | Somatic Signature (wound echo, physical tells, body-grounded prose) |
| Relationship emotional dynamics | Relationship Emotional Dynamics (per-pair emotional texture + arc trajectory) |
| Scene emotional weather | Scene Emotion Layer (dominant emotion, shift, carrier, somatic anchor) |
| Emotional arc tracking across chapters | Arc Emotion Tracking (palette expansion/contraction timeline) |
| Character arc overlay (start → end state) | Arc Overlay in Character Visualization |
| Cast overview grid (all characters at a glance) | Cast Overview in Character Visualization |
| Character SWOT breakdown | SWOT-Style Character Breakdown |
| Network archetype badges | Network Archetype Badge in Character Visualization |
| Bridge transition (Phase 7 → 8) | The Bridge screen (5 threshold questions) |
| Reverse scaffolding (architecture from rough draft) | Reverse Scaffolding workflow |
| Story comparison side-by-side | Comparison Workflow |
| Teaching / analysis standalone mode | Analysis Mode — Structural Tour |
| Random/guided/manual/import input for all generated attributes | Roll/Choose/Import Pattern (5 modes, anti-regression nuance, batch cast, decomposition preload) |
| Cascading attribute roll visualization | Cascading Attribute Roll System (now references Roll/Choose/Import Pattern) |
| Tonal arc visual designer | Tonal Arc Designer |
| Subproblem stack tracker | Subproblem Stack Tracker (6 threads, 4 states) |
| Per-scene metadata editor | Scene Metadata Editor |
| Full codebase coverage audit | Coverage Audit — MetaFiles vs. UI Design |
| Story Assistant as official LLM chat name | Chat Persona 1 — Story Assistant (official name, also handles project-wide search via conversation) |
| Unified story timeline (arcs + beats + relationships + emotions) | Story Timeline — Center Stage Mode 7 (swim lanes, plan vs reality, convergence detection) |
| Character photo upload with gradient border | Visual Reference System — character photos replace gradient fill, gradient becomes border ring |
| Mood board images for hallmarks and locations | Visual Reference System — image pins on hallmark entries and scene metadata locations |
| Unified settings page | Settings Page wireframe (`pwa-settings-wireframe.md`) — 8 categories, all toggles consolidated |
| Writing habit / retention system (future) | Writing Habit System — Hooked Loop (deferred, opt-in, Nir Eyal model adapted for creative writing) |
| Mobile / tablet responsive design (future) | Mobile section — deferred until UI implementation phase |
