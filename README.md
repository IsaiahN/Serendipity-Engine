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

The system is medium-agnostic. Novels, screenplays, stage plays, graphic novels, short stories, narrative podcasts, video game scripts. If it has characters, a world, and something at stake, StoryWeaver can build it.

---

## Features

### How It Works

StoryWeaver guides your story through eight phases, each building on the last:

**Phase 1 - Author.** Define who you are as a writer. Your wound, your voice, your blind spots, your Big Picture Statement. Everything downstream filters through this lens.

**Phase 2 - Narrator.** Choose the mask the author puts on. POV, tense, reliability, narrative distance. The gap between author and narrator is where irony lives.

**Phase 3 - World.** Genre, themes, setting, rules, hallmarks. Build the world your characters will inhabit, complete with the objects, places, and forces that define it.

**Phase 4 - Characters.** Build a full cast with identity, psychology, wounds, arcs, and per-character voice fingerprints. Each character is constructed with the same rigor as the author.

**Phase 5 - Relationships.** Map every significant pairing: dynamics, attachment styles, power structures, and how they evolve under pressure.

**Phase 6 - Story Foundation.** Outline, arc, tonal arc, subplot threading. Know the ending before writing the beginning.

**Phase 7 - Quality Control.** A structural audit against the theoretical framework before any prose is written. Health scores, gap detection, and editorial suggestions.

**Phase 8 - Execution.** Chapter-by-chapter writing with full context awareness. The AI knows the author's voice, the narrator's style, every character's speech patterns, and the outline.

### Decomposition Mode

Already have a manuscript? Upload it and StoryWeaver reverse-engineers it through the same 8-phase framework, extracting the author profile, narrator analysis, world-building, character sheets, relationship graph, and structural outline. Use this to understand why a story works, find gaps in your draft, or build the foundation for a sequel, prequel, or POV shift.


### Paradigm Shift

<img width="758" height="315" alt="image" src="https://github.com/user-attachments/assets/a0b75cf7-c935-4188-94b6-3f4f134b2162" />
<img width="758" height="390" alt="image" src="https://github.com/user-attachments/assets/753e6616-051c-4743-bf82-2cc12bb23b57" />

Take any project and transform it. Blend genres, transpose mediums (novel to screenplay), shift the POV to a different character, change the narrator's tone. StoryWeaver forks the project, filters the cast to only characters relevant to the new perspective, and regenerates the structural files while preserving your original.

### Story Assistant

A chat-based collaborator that knows your entire project. Brainstorm plot twists, flesh out character backstories, workshop dialogue, or ask structural questions. The assistant has full context of your author profile, world, cast, and outline.

### Editor Mode
<img width="757" height="284" alt="image" src="https://github.com/user-attachments/assets/07f42cf2-4efb-4bd5-91ad-a67f969a8cdf" />

Developmental editing powered by AI. Get craft-level feedback on prose, pacing, voice consistency, and structural coherence. The editor reads your work against the same framework that built it.

### World Building, Relationships, and Timeline Views
<img width="776" height="414" alt="image" src="https://github.com/user-attachments/assets/8b723711-2540-47ad-a4be-0ba58e65af5c" />

Dedicated workspaces for exploring your world's rules and hallmarks, visualizing character relationship webs, and tracking your story's timeline and chapter progression.

### Version History

Every file change is tracked automatically with a word-level diff engine. Browse a chronological timeline of edits, preview what changed between any two versions with color-coded additions and deletions, and restore any previous version with one click. Integrated with the undo/redo system for in-session editing and the session changelog for cross-session tracking.

### File Integrity Auditing

After any major operation (decomposition, paradigm shift, generation), StoryWeaver automatically scans all project files and surfaces anything missing, empty, or incomplete. Color-coded severity levels (critical, high, medium, low) with one-click recovery actions: re-analyze, add missing details, or regenerate specific files.

### Health Scoring

Heuristic scores for narrative arc, character depth, world building, dialogue quality, and overall story structure. These are subjective ratings meant as guideposts, not judgments.

<img width="757" height="411" alt="image" src="https://github.com/user-attachments/assets/124372f5-8fc5-402d-ad56-a1d0325d1332" />

### Deep Comparison

Compare any two works across ten analytical dimensions: author psychology, narrator, world building, characters, relationships, story structure, tone, theme, audience, and author inferences. Four comparison modes let you compare two of your own projects, two uploaded books, your work against a published piece, or track evolution across a series. Each dimension gets an LLM-powered analysis with a divergence score, and results are displayed with expandable dimension cards, a radar chart visualization, and side-by-side character comparisons. Series mode adds timeline and evolution tracking across multiple installments.

### The Drawing Board

A creative scratchpad for collecting ideas that haven't found a home in the project structure yet. Add notes, upload images (with a multi-image slider for visual references), attach documents (.txt, .md, .docx, .pdf), or write rough drafts. Organize items into custom groups, switch between board view (visual grid), list view (compact table), gallery view (image-focused), or filter to show only unlinked items. Every item tracks whether it's been used in the project, so you can see which ideas made it into the story and which are still waiting.

### Voice Casting Briefs

AI-generated voice direction documents for audiobook narration or TTS production. StoryWeaver reads every character profile in your project and produces a casting brief for each: name, age range, accent, pitch, pace, vocal quality, emotional range, a one-line direction for the voice actor, and a "similar to" reference (e.g., "Think: Morgan Freeman"). Useful for audiobook producers, podcast creators, or anyone who wants to hear their characters before writing dialogue.

### Export

Export your project as DOCX, PDF, plain text, or a zipped project archive. All formats preserve chapter structure and metadata.

### Progressive Web App

Install StoryWeaver on any device. Works offline after first load. Responsive design for desktop, tablet, and mobile.

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
git clone https://github.com/yourusername/Serendipity-Engine.git
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

**What Makes a Character Feel Real** -- A character is dynamic when they are caught between two conflicting knowledge streams: what they've personally lived and what their world tells them is true. The story is the weighted integration of those streams under pressure.

**World Building Theory** -- A story world is a whole ecosystem. No single character carries the full intelligence of a theme. Four archetype functions must be distributed across the cast for the story to function.

**The Seven Story Deaths** -- Seven structural failure modes that kill intelligence in narrative networks: The Monolith, Amnesia, Hierarchy, Isolation, Monoculture, Stasis, and Closure. These operate invisibly until the draft is dead.

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

The author finds the story. The characters find themselves in the plot. The reader finds themselves in the story. All of them chose what to do once they arrived.

---

<p align="center">
  <strong>Serendipity | StoryWeaver</strong><br>
  Built by Isaiah Nwukor
</p>
