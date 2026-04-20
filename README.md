<p align="center">
  <img src="ui-screens/public/logo-banner.svg" alt="Serendipity | StoryWeaver" width="600" />
</p>

<p align="center">
  <strong>An AI-powered creative writing workbench that guides authors through building complete works of fiction.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-blue" alt="React 19" />
  <img src="https://img.shields.io/badge/vite-8-purple" alt="Vite 8" />
  <img src="https://img.shields.io/badge/PWA-installable-orange" alt="PWA" />
  <img src="https://img.shields.io/badge/license-personal%20use-green" alt="License" />
</p>

---

<img width="1366" height="604" alt="image" src="https://github.com/user-attachments/assets/e639d970-0d8d-483c-ad4e-469770cb00f6" />

## What Is StoryWeaver?

StoryWeaver is a progressive web app that walks you through an 8-phase process to build, write, and refine a complete work of fiction. You bring your own AI model (OpenAI, Anthropic, Google, or any OpenRouter-compatible provider), and StoryWeaver orchestrates it as a collaborative tool at every step: brainstorming, structural analysis, prose generation, continuity checking, and editorial feedback.

You are always the author. The AI never overrides your decisions, never takes creative control, and never produces output you haven't explicitly requested. StoryWeaver is a workbench, not an autopilot.

The system is medium-agnostic and supports 10 story mediums with specialized outline profiles, word count targets, and content hierarchy rules: Novel, Short Story, Novella, Screenplay, TV Show, Stage Play, Podcast/Audio Drama, Graphic Novel/Manga, Interactive Fiction, and Essay/Article. If it has characters, a world, and something at stake, StoryWeaver can build it.

---

## Platforms

StoryWeaver is available in three flavors depending on how you prefer to work.

**Progressive Web App** - The primary experience. Clone the repo, run `npm install && npm run dev`, and open it in your browser. Install it as a standalone app from the browser's address bar for offline use. Everything runs locally - no server, no accounts, no data leaves your machine. See [Getting Started](#getting-started) below.

**Chrome Extension** - The full StoryWeaver experience packaged as a Chrome extension. Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/bkpphanncdhpcbmalnpknoieglmopjib?utm_source=item-share-cb) or build it yourself from the [`chrome-extension`](https://github.com/IsaiahN/Serendipity-Engine/tree/chrome-extension) branch.

**VS Code / Plain Markdown** - If you prefer working with plain text files in your own editor, the [`main`](https://github.com/IsaiahN/Serendipity-Engine/tree/main) branch contains the complete StoryWeaver reference system as markdown files: theory documents, character attribute templates, relationship frameworks, and story structure guides. Bring your own workflow.

---

## Features

### The 8-Phase Story Pipeline

StoryWeaver guides your story through eight phases, each building on the last:

**Phase 1 - Author.** Define who you are as a writer. Your wound, your voice, your blind spots, your Big Picture Statement. Everything downstream filters through this lens, making AI output sound like you, not generic AI.

**Phase 2 - Narrator.** Choose the mask the author puts on. POV, tense, reliability, narrative distance. The gap between author and narrator is where irony lives.

**Phase 3 - World.** Genre, themes, setting, rules, hallmarks. Build the world your characters will inhabit, complete with the objects, places, and forces that define it. Choose from 24 genres and 14 tonal palette options (Lyrical, Noir, Wry, Earnest, Whimsical, Brutal, Minimalist, Gothic, and more). A structured contract the AI honors in every generation. Content ratings (G through 18+) gate what the AI will produce.

**Phase 4 - Characters.** Build a full cast with identity, psychology, wounds, arcs, and per-character **Voice Fingerprints** (speech rhythm, vocabulary register, defensive patterns, subtext defaults, metaphor family). Characters speak differently from each other - always. Full psychological profiles include MBTI, Enneagram, attachment styles, and wants vs. needs.

**Phase 5 - Relationships.** Map every significant pairing: dynamics, attachment styles, power structures, and how they evolve under pressure. Relationships are treated as load-bearing story architecture, not background detail. Exports a full relationship graph as a CSV matrix for external analysis.

**Phase 6 - Story Foundation.** Outline, arc, tonal arc, subplot threading. Know the ending before writing the beginning.

**Phase 7 - Quality Control.** A structural audit across 10 dimensions before a word of prose is written: author depth, narrator integration, world integrity, character depth, relationship architecture, plot structure, tonal coherence, theme resonance, consciousness integration, and network resonance.

**Phase 8 - Execution.** Chapter-by-chapter prose generation with full context: author voice, narrator style, every character's speech fingerprint, outline beats, relationship state, world rules - all active at once.

---

### Decomposition Mode

Already have a manuscript? Upload it and StoryWeaver reverse-engineers it through the same 8-phase framework, extracting the author profile, narrator analysis, world-building, character sheets, relationship graph, and structural outline. Use this to understand why a story works, find gaps in your draft, or build the foundation for a sequel, prequel, or POV shift.

---

### Paradigm Shift

<img width="758" height="315" alt="image" src="https://github.com/user-attachments/assets/a0b75cf7-c935-4188-94b6-3f4f134b2162" />
<img width="758" height="390" alt="image" src="https://github.com/user-attachments/assets/753e6616-051c-4743-bf82-2cc12bb23b57" />
<img width="758" height="389" alt="image" src="https://github.com/user-attachments/assets/d6e90098-30d8-489d-9802-4ac47b20b580" />

Take any project and transform it. Blend genres (choose from 24), transpose mediums (novel to screenplay, screenplay to podcast, novel to graphic novel), shift the POV to a different character, change the narrator's tone. StoryWeaver forks the project, filters the cast to only characters relevant to the new perspective, and regenerates the structural files while preserving your original.

---

### Deep Comparison Engine

Compare any two works across ten analytical dimensions: author psychology, narrator voice, world building, characters, relationships, story structure, tone, theme, audience, and author inferences. Four comparison modes let you compare two of your own projects, two uploaded books, your work against a published piece, or track evolution across a series. Each dimension gets an LLM-powered analysis with a divergence score, and results are displayed with expandable dimension cards, a radar chart visualization, and side-by-side character comparisons. Series mode adds timeline and evolution tracking across multiple installments.

---

### Story Assistant

A chat-based collaborator that knows your entire project. Switch between four personas: a brainstorming assistant, a developmental editor, a character roleplay partner (talk to any character in first-person - the AI stays fully in character, limited to what that character knows, using their voice fingerprint), and a phase guide for single-question help during any wizard step. All personas have full context of your author profile, world, cast, and outline.

---

### Editor Mode

<img width="757" height="284" alt="image" src="https://github.com/user-attachments/assets/07f42cf2-4efb-4bd5-91ad-a67f969a8cdf" />

Developmental editing powered by AI. Get craft-level feedback on prose, pacing, voice consistency, and structural coherence. The editor reads your work against the same framework that built it.

---

### Continuity System

Before each chapter is generated, StoryWeaver runs a pre-flight check against the outline, character states, timeline, world rules, and relationship state. After generation, a post-flight analysis surfaces forward continuity flags, relationship changes, thread state updates, character snapshots, and handoff notes for the next chapter. Nothing falls through the cracks between chapters.

---

### Tonal Arc Designer

A visual editor for chapter-by-chapter emotional pacing. Map the dominant tone and emotional trajectory across the whole book before writing it. Tonal coherence is scored as part of the health audit.

---

### Scene-Level Tools

- **Scene Metadata Editor** - Per-scene POV character, location, time, active characters, emotional arc, key moments, and thread advancement
- **Scene Dynamics Forecast** - AI-predicted tension trajectory, relationship evolution, and character emotional state before you write the scene
- **Reader Experience Report** - AI analysis of how a reader will experience the text: tension trajectory, emotional journey, hook effectiveness, engagement prediction
- **Subproblem Tracker** - Track every active thread and subplot across chapters so nothing gets dropped
- **Emotion Wheel** - Visual emotion selection and tracking integrated with character emotional registers and scene arc visualization

---

### World Building, Relationships, and Timeline Views

<img width="776" height="414" alt="image" src="https://github.com/user-attachments/assets/8b723711-2540-47ad-a4be-0ba58e65af5c" />

Dedicated workspaces for exploring your world's rules and hallmarks, visualizing character relationship webs, and tracking your story's timeline and chapter progression.

---

### Voice Casting Briefs

AI-generated voice direction documents for audiobook narration or TTS production. StoryWeaver reads every character profile in your project and produces a casting brief for each: name, age range, accent, pitch, pace, vocal quality, emotional range, a one-line direction for the voice actor, and a "similar to" reference (e.g., "Think: Morgan Freeman"). Useful for audiobook producers, podcast creators, or anyone who wants to hear their characters before writing dialogue.

---

### The Drawing Board

A creative scratchpad for collecting ideas that haven't found a home in the project structure yet. Add notes, upload images (with a multi-image slider for visual references), attach documents (.txt, .md, .docx, .pdf), or write rough drafts. Organize items into custom groups, switch between board view (visual grid), list view (compact table), gallery view (image-focused), or filter to show only unlinked items. Every item tracks whether it's been used in the project, so you can see which ideas made it into the story and which are still waiting.

---

### Version History

Every file change is tracked automatically with a word-level diff engine. Browse a chronological timeline of edits, preview what changed between any two versions with color-coded additions and deletions, and restore any previous version with one click. Integrated with the undo/redo system for in-session editing and the session changelog for cross-session tracking.

---

### File Integrity Auditing

After any major operation (decomposition, paradigm shift, generation), StoryWeaver automatically scans all project files and surfaces anything missing, empty, or incomplete. Color-coded severity levels (critical, high, medium, low) with one-click recovery actions: re-analyze, add missing details, or regenerate specific files.

---


### Health Scoring

Heuristic scores for narrative arc, character depth, world building, dialogue quality, and overall story structure. These are subjective ratings meant as guideposts, not judgments.

<img width="757" height="411" alt="image" src="https://github.com/user-attachments/assets/124372f5-8fc5-402d-ad56-a1d0325d1332" />

### Deep Comparison

Compare any two works across ten analytical dimensions: author psychology, narrator, world building, characters, relationships, story structure, tone, theme, audience, and author inferences. Four comparison modes let you compare two of your own projects, two uploaded books, your work against a published piece, or track evolution across a series. Each dimension gets an LLM-powered analysis with a divergence score, and results are displayed with expandable dimension cards, a radar chart visualization, and side-by-side character comparisons. Series mode adds timeline and evolution tracking across multiple installments.

### The Drawing Board

A creative scratchpad for collecting ideas that haven't found a home in the project structure yet. Add notes, upload images (with a multi-image slider for visual references), attach documents (.txt, .md, .docx, .pdf), or write rough drafts. Organize items into custom groups, switch between board view (visual grid), list view (compact table), gallery view (image-focused), or filter to show only unlinked items. Every item tracks whether it's been used in the project, so you can see which ideas made it into the story and which are still waiting.

### Voice Casting Briefs

AI-generated voice direction documents for audiobook narration or TTS production. StoryWeaver reads every character profile in your project and produces a casting brief for each: name, age range, accent, pitch, pace, vocal quality, emotional range, a one-line direction for the voice actor, and a "similar to" reference (e.g., "Think: Morgan Freeman"). Useful for audiobook producers, podcast creators, or anyone who wants to hear their characters before writing dialogue.

---

### Series and Multi-Book Management

- **Series Order Manager** - Organize projects chronologically, assign roles (mainline, prequel, sequel, spinoff, companion, interlude), reorder with drag controls
- **Series Continuity Tracking** - Pull context from previous books, track planted-but-unpaid threads, maintain character and world consistency across installments
- **Series Evolution Analysis** - Track theme, character arc, world-building, and tone shifts across a full series in Deep Comparison mode

---

### Sandbox Mode

A safe testing space for experimental writing. Generate test chapters, try alternate takes, or iterate freely without affecting the main project.

---

### Export

Export your project as DOCX, PDF, EPUB, plain Markdown, Fountain (screenplay), a zipped project archive, or full JSON backup. All formats preserve chapter structure and metadata.

---

### Multi-Provider AI Support

Bring your own key. Direct browser-to-provider connection - no proxying, no server middleman.

- **Anthropic** (Claude Sonnet, Opus, Haiku)
- **OpenAI** (GPT-4o, GPT-4-turbo, GPT-3.5)
- **Google** (Gemini 2.0 Flash, 1.5 Pro/Flash)
- **DeepSeek** (deepseek-chat, deepseek-reasoner)
- **Ollama** (local models, fully offline)
- **OpenRouter** (any supported model)
- **Custom** (any OpenAI-compatible endpoint)

Intelligent token budgeting automatically compresses older chapters to summaries while keeping recent chapters in full, optimized per model's context window limits. Session cost estimation and API cost tracking built in.

---

### Progressive Web App

Install StoryWeaver on any device. Works offline after first load. Responsive design for desktop, tablet, and mobile. Full keyboard shortcut system including command palette (Ctrl+K), phase navigation (Ctrl+1-8), center stage toggle (Ctrl+J), and customizable bindings. 13 workspace modes: Guided wizard, Story Assistant, Reader view, Comparison, Paradigm Shift, Timeline, Relationships, World Building, Drawing Board, Voice Casting, Editor feedback, Sandbox, and Search.

### Settings and Customization

- **Theme** - Dark and light modes with custom color schemes
- **Font** - Inter, Georgia, Merriweather, JetBrains Mono, or System Default
- **Auto-save** - Configurable intervals (15s, 30s, 60s) or off
- **LLM Configuration** - Per-role model assignment (simple or advanced 4-role system), API key management, provider switching all from one settings screen
- **Editor thresholds** - Configurable quality thresholds for the health scoring and audit system

---

## Privacy

StoryWeaver is local-first. No account required. No server. No tracking.

- **No data collection** - StoryWeaver does not collect personally identifiable information, health data, financial data, location data, browsing history, user activity (clicks, keystrokes, scroll behavior), or personal communications of any kind
- **Local-only storage** - All project data, settings, and session history are stored in your browser's IndexedDB. Nothing is sent to any server operated by StoryWeaver
- **BYOK with encryption** - API keys are encrypted using AES-256-GCM via the Web Crypto API and stored locally. Keys are sent only to the AI provider you configured, only when you initiate an AI action
- **No analytics or telemetry** - Zero tracking of any kind. No crash reporting, no usage metrics, no third-party analytics scripts
- **Third-party contact limited to six domains** - api.anthropic.com, api.openai.com, generativelanguage.googleapis.com, api.deepseek.com, openrouter.ai, and localhost (Ollama). No other external connections are made

The full privacy policy is in [PRIVACY-POLICY.md](PRIVACY-POLICY.md).

---

## Getting Started

### Prerequisites

You need Node.js 18+ and an API key from at least one supported AI provider:

- OpenAI (GPT-4, GPT-4o, etc.)
- Anthropic (Claude 3.5, Claude 4, etc.)
- Google (Gemini)
- Any provider accessible through OpenRouter

### Installation

```bash
# Clone the repository
git clone https://github.com/IsaiahN/Serendipity-Engine.git
cd Serendipity-Engine/ui-screens

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### First Run

1. **Accept the terms.** StoryWeaver shows a brief license and acceptable use policy on first launch.
2. **Connect an AI model.** The Setup screen asks you to add at least one API key. Your keys are stored locally in your browser and never sent anywhere except directly to the provider's API.
3. **Start a story.** Click "New Story" to begin the guided 8-phase pipeline, or click "Deconstruct a Book" to upload an existing manuscript for decomposition.
4. **Try the demo.** Click "Try Demo Project" on the Hub to explore a pre-built project ("The Shunning Season") and see what a fully developed story looks like inside StoryWeaver.

### Building for Production

```bash
npm run build    # Creates optimized build in dist/
npm run preview  # Preview the production build locally
```

### Running Tests

```bash
npm test         # Run the full test suite (Vitest)
npm run test:watch  # Run in watch mode during development
```

---

## Project Structure

```
Serendipity-Engine/
  MetaFiles/              # Theory documents and reference files
  Characters/             # Character attribute lists and templates
  Relationships/          # Relationship type and dynamic lists
  Story/                  # Genre, theme, plot, and craft references
  Decomposition/          # Example decomposed works (Wizard of Oz)
  ui-screens/             # The StoryWeaver PWA (this is the app)
    src/
      components/         # React components (TopBar, Cast, Audit, etc.)
      screens/            # Page-level screens (Hub, Workspace, Settings)
      stores/             # Zustand state management
      services/           # Business logic (decomposition, export, audit)
      lib/                # Utilities (prompt registry, DB, constants)
      data/               # Static demo data
      utils/              # Shared pure functions
      __tests__/          # Unit tests (Vitest)
    public/               # Static assets, icons, manifest
```

### Key Architecture Decisions

**React 19 + Vite 8** for the UI framework and build tooling.

**Zustand 5** for state management. Three stores: project store (active project, files, dirty state), LLM store (provider configs, active model), and settings store (theme, preferences).

**Dexie.js (IndexedDB)** for all persistent storage. Projects, files, session logs, and version history all live in the browser's IndexedDB. Nothing is sent to a server. Your data stays on your device.

**Prompt Registry** is a single file (`src/lib/promptRegistry.js`) containing every system prompt sent to AI models. Golden Rules (no emdashes, author sovereignty, stay in scope, context completeness, no meta-commentary, markdown output) are prepended to every prompt.

**BYOK (Bring Your Own Key).** StoryWeaver never stores, proxies, or intermediates your API keys. They go directly from your browser to the provider's API endpoint.

---

## Use Cases

**Write your first novel.** StoryWeaver's guided pipeline ensures you have a load-bearing structure before writing the first sentence. No more 30,000-word drafts that collapse because the foundation was never laid.

**Finish the project you've been sitting on.** Upload your half-finished manuscript through Decomposition, let StoryWeaver audit what you have, identify the gaps, and build out the missing structural elements so you can push through to the end.

**Explore "what if" versions of your story.** Use Paradigm Shift to see your literary fiction reimagined as a thriller, your novel restructured as a screenplay, or your story told from the antagonist's perspective.

**Learn story craft.** Even if you never generate a word of prose, the 8-phase pipeline teaches structural thinking: what makes characters conscious, how relationship dynamics create tension, why tonal control matters, and how the seven structural failure modes kill stories silently.

**Reverse-engineer stories you admire.** Run Decomposition on a published work to understand the architecture beneath the prose. What decisions were load-bearing? What was the author's wound? Where did the structure bend?

**Build a series.** Decompose your first book, then use it as the structural floor for sequels. StoryWeaver tracks what threads were planted but not paid off, what characters were sketched but not developed, and what rules were established but never tested to their limits.

---

## The Reference System

StoryWeaver is built on top of a comprehensive story-building reference system grounded in three interlocking theories:

**What Makes a Character Feel Real** - A character is dynamic when they are caught between two conflicting knowledge streams: what they've personally lived and what their world tells them is true. The story is the weighted integration of those streams under pressure.

**World Building Theory** - A story world is a whole ecosystem. No single character carries the full intelligence of a theme. Four archetype functions must be distributed across the cast for the story to function.

**The Seven Story Deaths** - Seven structural failure modes that kill intelligence in narrative networks: The Monolith, Amnesia, Hierarchy, Isolation, Monoculture, Stasis, and Closure. These operate invisibly until the draft is dead.

The full theory documents, attribute lists, and craft references live in the `MetaFiles/`, `Characters/`, `Relationships/`, and `Story/` directories.

---

## License

**Serendipity | StoryWeaver** is free for personal creative use.

Stories created using StoryWeaver belong entirely to you. The engine makes no ownership claims on your creative output. Attribution is appreciated but not required for stories you produce.

Commercial use of the engine itself (building products on top of it, reselling, or redistributing) requires a commercial license. Contact the author for commercial licensing inquiries.

### Acceptable Use

StoryWeaver is designed for writers, authors, storytellers, students of narrative, and anyone who wants to learn the structural principles behind compelling fiction.

StoryWeaver is not for academic dishonesty (generating essays or assignments to submit as schoolwork), plagiarism (passing off generated content as entirely human-written where that distinction matters), or any use that violates the content rating system's intent.

The principle: StoryWeaver is a creative partner, not a cheating tool. It's the difference between hiring an editor to improve your novel and hiring someone to write your term paper.

### Your Data

All project data is stored locally in your browser's IndexedDB. Your API keys are stored in localStorage and sent only to the AI provider you configured. Nothing is sent to any server controlled by StoryWeaver. If you clear your browser data, your projects are gone. Use the Export feature to back up your work.

---

## Why "Serendipity"

The name describes the author's experience: the system surfaces a story you didn't plan, full of specificity you couldn't have arrived at by deciding. You find something you weren't looking for.

But it holds at every level. Every character arrives at their position the way real people arrive at theirs: through conditions they didn't choose. Their agency, what they do once they arrive, is real. The conditions themselves were serendipitous.

The author finds the story. The characters find their fate. The reader finds the meaning. None of them went looking for it.
