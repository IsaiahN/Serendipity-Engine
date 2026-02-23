# Master Story Checklist

*The complete workflow for generating a story using the Serendipity Engine — from first roll to final chapter.*

---

## ⚠️ DECOMPOSITION MODE — Read This First

> **If you are generating a new story from scratch, skip this entire section and proceed to "Before You Begin — Seed the Engine" below. Nothing here applies.**
>
> **If you have been given an existing work to decompose — a novel, play, screenplay, short story, or any completed narrative text — this section replaces the standard generation pipeline. Phases 1–7 below are still your structural framework, but you are running them in reverse: inferring what the author likely built rather than generating it fresh. Phase 8 (chapter execution) is skipped entirely — the text already exists.**

---

### What Decomposition Is

Decomposition is the process of reverse-engineering an existing work through the Serendipity Engine's vocabulary. Instead of rolling attributes to generate a story, you are reading a finished story and reconstructing the attribute set that produced it. The output is a forensic structural audit: what the author had (consciously or not), what the system would have generated, and where the work deviates from what the engine would have built.

The output folder mirrors the Creations folder exactly — same files, same structure — but every claim is annotated with an epistemic marker:

- **[CONFIRMED]** — directly verifiable from the text or from independently verifiable biographical/historical fact
- **[INFERRED]** — a reasoned inference; state the reasoning explicitly beside it. "The author's Enneagram is likely 7w6 because…" is a valid annotation. A bare assertion is not.

Do not collapse these two categories. The distinction between what the text proves and what it suggests is the decomposition's most important output.

---

### Step 0 — Get the Text Into a Readable Format

Before any structural work begins, the source text must be accessible in full.

- [ ] If the text has been pasted directly into the conversation context: confirm it is complete (check word count or chapter count against a known reference). Proceed.
- [ ] If the text is too long for a single context: load it into a file at `Decomposition/story-{slug-title}/test-{slug-title}.md` — plain text, Markdown format, no reformatting of the prose. The file is source material, not output. Use `test-` as the filename prefix to distinguish it from generated output files.
- [ ] **Read the full text before beginning any structural work.** Do not attempt partial decomposition from a synopsis or summary. Structural decisions (planted evidence, Chekhov's guns, late-chapter reveals) are only visible from the complete text. Decomposing a partial text will produce false attribute assignments.
- [ ] Note: the source text file lives at the root of the story's decomposition folder alongside the output files — not in a subfolder.

---

### Step 1 — Create the Output Folder

Create the following folder structure before writing any output file:

```
Decomposition/
  story-{slug-title}/
    test-{slug-title}.md          ← source text (from Step 0)
    author.md                     ← Phase 1 output
    narrator.md                   ← Phase 2 output
    abstract.md                   ← Phase 6 partial output
    outline.md                    ← Phase 6 output (chapter-by-chapter)
    world/
      world-building.md           ← Phase 3 output
      questions-answered.md
    story/
      arc.md                      ← Phase 6 output
      questions-answered.md
    characters/
      {character-name}.md         ← one file per major character
      questions-answered.md       ← cast-level
    relationships/
      relationship-graph.csv
      questions-answered.md
```

> **Which characters get a full file:** Major and load-bearing characters only — anyone whose removal would collapse a story thread. Supporting characters with no arc of their own use the Catalyst / Extra thumbnail format from `Characters/Development/character-types.md`. Do not build full attribute sheets for scene-functional extras.

---

### Step 2 — Use the Reference Files to Ground the Decomposition

The reference files in `Characters/`, `Story/`, and `MetaFiles/` (everything outside `/Creations` and `/Decomposition`) are the vocabulary of the decomposition. Before assigning any attribute, open the relevant reference file and match the text's evidence against the options listed there — do not invent new categories.

**Minimum reference files to read before starting:**

| Phase | Reference files to consult |
|---|---|
| Author (Phase 1) | `MetaFiles/writing-prose-styles.md`, `Characters/Personality/mbti.md`, `Characters/Personality/enneagram.md`, `Characters/Personality/alignment.md`, `Characters/Development/flaws-virtues-wounds.md`, `Characters/Identity/life-philosophy.md` |
| Narrator (Phase 2) | `Story/narrator.md` |
| World (Phase 3) | `Story/genres.md`, `Story/themes-and-tropes.md`, `Story/plot-structure.md`, `Story/narrative-techniques.md`, `Story/plot-twist-types.md`, `MetaFiles/seven-story-deaths.md`, `MetaFiles/story-network-theory.md`, `MetaFiles/tonal-control.md` |
| Characters (Phase 4) | `Characters/Personality/mbti.md`, `Characters/Personality/enneagram.md`, `Characters/Personality/alignment.md`, `Characters/Development/character-types.md`, `Characters/Development/flaws-virtues-wounds.md`, `Characters/Development/character-voice.md`, `MetaFiles/story-consciousness-theory.md` |
| Relationships (Phase 5) | `Relationships/relationship-dynamics.md`, `Relationships/relationship-types.md`, `Relationships/relationship-structures.md`, `MetaFiles/relationship-graph-template.csv` |
| Story Foundation (Phase 6) | `Story/plot-structure.md`, `MetaFiles/story-consciousness-theory.md`, `MetaFiles/story-network-theory.md` |

Read the relevant reference file *before* assigning its attribute — not after. The goal is to match the text's evidence against the system's vocabulary, not to retrofit a label chosen without context.

---

### Step 3 — Run Phases 1–6 in Order, In Reverse

Work through the standard phase structure, applying each phase's framework as an analytical lens rather than a generative one. The checklist items for each phase are the questions you are answering from the text — not rolls you are executing.

**Phase 1 — Author:** Who wrote this, and what were they? If the author is known, use biographical and historical record for [CONFIRMED] attributes. Use the text's thematic preoccupations, prose style, and structural choices for [INFERRED] attributes. The author's wound is the thing the story keeps writing toward or away from — find the pattern across the whole text. Write the **Big Picture Finding** last (equivalent to the Big Picture Statement): what was this author trying to say that they could not say directly, and how does the architecture of the story serve that need?

**Phase 2 — Narrator:** What type of narrator does this text use? What is the gap between the author's actual worldview and the narrator's performed one? Is the narrator reliable — and if unreliable, what does the text reveal that the narrator suppresses or distorts?

**Phase 3 — World:** What genre blend does this text occupy? What is the theme as a *question* (not a statement)? Which plot structure? Which narrative techniques are demonstrably operating (Chekhov's guns can be confirmed by tracing the plant and the payoff in the text)? How does Society function as a character — what does it demand from the people inside it? Run the Seven Story Deaths audit: for each seal, is it accidental or deliberate? Identify the world hallmarks (`Story/world-hallmarks.md`): scan for objects, places, forces, and mechanics that recur with cultural resonance — things that have outlived their plot function and entered the story's identity. Use frequency, adaptation survival, and the poster test as filters. Output to `world/hallmarks.md`.

**Phase 4 — Characters:** For each major character, assign the full attribute set using text evidence. Voice fingerprinting is more reliable in decomposition than in generation — you have actual dialogue. Map Stream A vs. Stream B for each character (what they privately know vs. what their world tells them) using quoted text as evidence. Assign network archetypes. Note foil pairs.

**Phase 5 — Relationships:** Build the relationship graph from confirmed text events. The graph is three-tiered: **major characters** (full rows and columns, all cells written), **minor characters** (append `(minor)` to name — many blank cells, load-bearing ones filled), and **societies / collective groups** (append `(society)` to name — any group that functions as a pressure system, power structure, or collective identity: a governing body, an oppressed people, a criminal organization, a cultural institution, a school and its student body). Society rows are written in the collective voice of that group; society columns show how individual characters perceive and relate to that force. Societies do not have a SELF cell — use a brief description of the society's self-image in that diagonal position. Each cell should state how that character perceives the other at the story's close. Blank cells are valid for characters who never interact — the pattern of blanks is structural data, especially for minor and society entries.

**Phase 6 — Story Foundation:** Map the protagonist's arc against the plot structure. Map the tonal arc chapter by chapter (or act by act). Write the abstract and outline. The outline is the most rigorous Phase 6 output — every chapter should be decomposed with: goal, dominant tone, active/critical/resolved thread states, scene metadata (location, interior/exterior, time of day, season), and key textual evidence (a direct quote or plot event that confirms the chapter's structural role).

**Phase 7 — Review:** Run the Phase 7 MetaFiles checks as a diagnostic, not a pre-flight. You are not preparing to write — you are auditing what was already written. The gaps you find (seals that are accidental, threads that open and never close, network archetypes that are missing) are the decomposition's most generative output for anyone who wants to extend or adapt the work.

**Phase 8 — Skip.** The text already exists. Do not write prose.

---

### Step 4 — Notes for the System: What Decomposition Reveals That Generation Cannot

These are observations from working decompositions — patterns that appear consistently and are worth knowing before you start:

**The author's wound is in the structural choices, not the content.**
What an author cannot write is as diagnostic as what they do write. A story that eliminates all deserved consequences (for genre reasons or personal ones), resolves all ambiguity, or refuses to let any character who is good suffer — these are structural fingerprints of the author's flaw in action. Note them.

**The Seven Story Deaths audit is more informative in decomposition than in generation.**
In generation, you are guessing whether a seal will become active. In decomposition, you can see the outcome. An active Monolith seal — all narrative flowing through one character — is visible as: every plot event requires the protagonist's presence; the world cannot change without them; secondary characters have no arcs of their own. Confirm with specific chapter evidence.

**Voice fingerprinting from existing dialogue is the most reliable attribute assignment in the whole decomposition.**
Open `Characters/Development/character-voice.md` and work through Speech Rhythm, Vocabulary Register, Dialogue Tic, Metaphor Family, Defensive Speech Pattern, and Subtext Default for each character using direct quotes. This is ground truth — the author made these choices in the text.

**The relationship graph should be built last.**
Build it after all character files exist. Each cell is written from the perspective of the row character — use their voice, their level of awareness, and what they know at the story's close. If a character died or departed mid-story, write the cell in the voice of their final known state.

**When the text contradicts what a standard roll would produce — the text wins.**
Decomposition is not about finding the closest match in the reference files and forcing the text to fit it. If a character's behavior pattern does not cleanly match any single MBTI type, assign the closest match, annotate it [INFERRED — atypical], and describe the deviation. The mismatch may be the most interesting thing about the character.

**The Big Picture Finding (equivalent to the Big Picture Statement) should be written last, after all other output files exist.**
It synthesizes everything. Before it exists, the decomposition is a collection of attributes. After it exists, the decomposition is an argument about what the work was trying to do — and whether it succeeded.

**Decomposition is the foundation for adaptation.**
Once the structural audit exists, every Serendipity Engine lever is available for derivative work: change the author profile, invert the POV, shift the tonal arc, modify the moral alignment of the antagonist, transpose the world to a different medium. The difference between *The Wizard of Oz* and *Wicked* is a decomposition plus a new author Enneagram, a POV inversion, and a tonal register shift from earnest-wonder to political-cynicism. See `README.md` — Decomposition section for the full treatment of this.

---

## Before You Begin — Seed the Engine

Open `MetaFiles/randomization-engine.md`. Generate your session seed from the current datetime:

```
YYYYMMDDHHM → e.g. February 22 2026, 2:47 PM = 202602221447
```

Write it as the first line of your `author.md` before any rolls are made. Every roll in every phase derives from this seed in sequence. Do not pick results manually — derive them. Do not re-roll because a result is strange — keep it.

> **Getting the current date and time:** Run `Get-Date -Format "yyyyMMddHHmm"` in PowerShell (works on Windows, macOS, and Linux with no dependencies or permissions required), or `date +"%Y%m%d%H%M"` in Bash/Zsh. Alternatively, ask the LLM directly in the chat sidebar — the current date is available in its context. No installs, no environment variables, no file system permissions needed.

---

## Folder Structure

Every story lives in its own timestamped folder. Create this before anything else:

```
Creations/
  story-{YYYY-MM-DD}/
    author.md                        ← Phase 1 output; includes MetaFiles/questions.md + Characters/Questions.md (author frame)
    narrator.md                      ← Phase 2 output
    abstract.md                      ← Phase 6 output
    outline.md                       ← Phase 6 output
    world/
      world-building.md              ← Phase 3 output
      questions-answered.md          ← Story/World Building/questions.md answers
    story/
      arc.md                         ← Phase 6 output
      questions-answered.md          ← Story/questions.md answers
      chapter-checklist.md           ← Phase 8 running log
    characters/
      {character-name}.md            ← one file per character; includes that character's Identity + Personality + Development + Names + Questions answers
      questions-answered.md          ← Characters/Questions.md answers at cast level (who is protagonist, who is load-bearing, etc.)
    relationships/
      relationship-graph.csv         ← Phase 5 output
      questions-answered.md          ← Relationships/questions.md answers
```

> **File creation rule:** If any output file listed above does not already exist at the point in the checklist where it is needed, create it immediately in the correct location within `Creations/story-{datetime}/`. Do not wait until the end of the phase. The file structure above is the target state — build toward it incrementally as each phase completes.

---

## Phase 1 — Create the Author

### Author Mode — Choose One Before Proceeding

**Option A — Generate the Author (default)**
Roll all attributes below using the randomization engine. Produces a stranger whose psychology, wound, and worldview will filter the entire story through an unfamiliar lens. Recommended for full system exploration, breaking creative defaults, and generating stories you would not write from your own instincts. Proceed with all Phase 1 rolls below.

**Option B — You Are the Author**
Use this when you want the story to feel like yours — when you are writing as yourself, as a real person, or as a deliberate persona (an alter ego, a named author identity, or a version of yourself you are consciously constructing).

1. Open `MetaFiles/author-profile-template.md`
2. Fill out every field — Identity, Personality, Development, Voice & Craft, Writing Identity, Blind Spots, and the Big Picture Statement (written last)
3. If an LLM is assisting you: paste the template into the session and have the LLM ask you each question in turn, then compile your answers into the final file
4. Save the completed profile as `Creations/story-{datetime}/author.md`
5. Skip all rolls below and proceed directly to Phase 2

*The profile template covers every field a generated author would have — the same data, produced through reflection rather than randomization. The Big Picture Statement is still required and must still be written last. If your answers conflict with each other, do not resolve the conflict — it is a phase tension you carry into the story. Document it.*

---

*The Author is the first character. Everything that follows is filtered through their lens. Some authors let their creations run away from them and allow new perspectives to change their own worldview. Others grip the reins tightly and bend the world to their ideology (see: Ayn Rand). Knowing which kind of author you're writing is as important as any other attribute.*

Roll randomly from each of the following. Where attributes conflict with each other, **do not resolve the conflict** — that dichotomy is a feature. It is a phase tension the author carries into every decision they make about the story.

*Conflict types: (a) **Productive tension** — attributes that coexist in genuine friction without logical contradiction (Lawful Evil + Tragic Hero; INFJ + Enneagram 8w7 — uncomfortable but coherent). These are features — hold both without softening either. (b) **Illogical contradiction** — attributes that cannot simultaneously be true at the same point in time (Lawful Evil + Chaotic Good; devout fundamentalist + fervent atheist). When this occurs, treat them as **past state → current state**: the earlier roll describes who this person was shaped to become; the later roll describes who they actually are now. The gap between them is their wound, their arc, and their most interesting writing blind spot. Keep both rolls. Document the transition in the character file.*

> **⚡ Cascading Attributes — Roll These First (Author)**
> Before working through the Identity list below: establish **(1) Age Range** and **(2) Gender** first, regardless of where they appear in the list. The list is grouped by category for reference — it is not the roll sequence. Age cascades into religion, life status, wound, philosophy, and emotional register. Gender cascades into life status, religion, wound, and sexuality. Both cascade into the author’s unconscious writing bias — what they attend to and what they cannot see. For the full dependency graph, bidirectional loops, and recommended 14-step roll sequence, see `Characters/Development/cascading-attributes.md`.

### Identity
- [ ] **Age Range** — roll: 20s / 30s / 40s / 50s / 60s+ *(root node — roll this first. See `Characters/Development/cascading-attributes.md` for what it unlocks downstream.)*
- [ ] **Gender** — `Characters/Identity/gender.md`
- [ ] **Religion / Faith** — `Characters/Identity/religion-faith.md`
- [ ] **Life Status** — `Characters/Identity/life-status.md` *(relationship status, parental status, living situation, financial upbringing, current financial status)*
- [ ] **Romantic / Sexual Leaning** — `Characters/Identity/sexuality.md`
  - *Weight: heterosexual = ~50% probability; all other orientations share the remaining ~50%*
- [ ] **Life Philosophy / Worldview** — `Characters/Identity/life-philosophy.md`
- [ ] **Emotional Register** — `Characters/Identity/emotional-register.md` *(default tonal state; the mood through which the author sees everything)*
- [ ] **Zodiac / Birthstone** — `Characters/Identity/zodiac-birthstone.md` *(optional — use for symbolic resonance or astrological flavor)*

### Personality
- [ ] **MBTI Type** — `Characters/Personality/mbti.md`
- [ ] **Enneagram** — `Characters/Personality/enneagram.md`
- [ ] **Moral Alignment** — `Characters/Personality/alignment.md`

### Development
- [ ] **Character Type** — `Characters/Development/character-types.md`
- [ ] **Physical Description** — `Characters/Development/physical-description.md`
- [ ] **Core Flaw / Virtue / Wound** — `Characters/Development/flaws-virtues-wounds.md`
  - *This wound becomes the author's unconscious bias — the thing they keep writing toward or away from without knowing it*
- [ ] **Core Values / Personal Code / Self-Care** — `Characters/Development/values-code-selfcare.md`
  - *Roll 1–2 values, 2–3 code items, 1–2 self-care mechanisms. Note where the self-care mechanism conflicts with or perpetuates the wound — that tension is the author's blind spot in action*

### Voice & Craft
- [ ] **Prose Style / Literary Era** — `MetaFiles/writing-prose-styles.md`
- [ ] **Language & Content Register** — `MetaFiles/language-content.md` *(content rating, profanity comfort, tonal register)*
- [ ] **Intended Audience** — roll or decide: Children / Teens / New Adult / Adults *(sets the hard ceiling on content, complexity, and emotional territory)*
- [ ] **Preferred Genre(s) as a reader/writer** — `Story/genres.md` *(what this author gravitates toward; may or may not match the story's genre — the gap is worth noting)*
- [ ] **Author Voice Fingerprint** — `Characters/Development/character-voice.md` *(roll: Speech Rhythm + Vocabulary Register + Dialogue Tic + Metaphor Family + Defensive Speech Pattern. This is the author's voice — the default instrument the narrator and prose are built from. Record in `author.md`.)*

### Name
- [ ] **Author Name** — `Characters/Names/` *(feminine / masculine / neutral as appropriate)*

### Answer the Author Questions
- [ ] `MetaFiles/questions.md` — the full Author Questions file; answer all sections
- [ ] `Characters/Questions.md` — answer all questions in the frame of the Author, not a character

### Big Picture — Author Intent *(answered last, after everything above is complete)*

*Only after all identity, personality, development, voice, and question answers exist — step back and answer this synthesis question:*

- [ ] **What kind of story is this author trying to tell?**

  This is not a plot question. It is a question of intent — the wound they're writing from, the audience they're writing toward, the emotional experience they want to leave the reader with, and the form they instinctively reach for. Answer it in 1–3 sentences.

  Ask:
  - What does this author need to say that they have never been able to say directly?
  - What do they want the reader to feel when they close the book — not think, not learn, *feel*?
  - Is this a story that confirms the world as it is, or one that breaks it open?

  Write the answer as the final line of `author.md`, clearly labelled **Big Picture Statement**. This statement is the bridge to everything that follows. No world, no character, no title, no outline is created until this exists.

### Output
- [ ] Create `Creations/story-{datetime}/author.md` — structured as:
  - Full rolled attribute sheet (all Identity / Personality / Development / Voice & Craft rolls)
  - Answers to `MetaFiles/questions.md` (all sections: Identity & Background, Life Stage, Relationships, Worldview, Writing Identity)
  - Answers to `Characters/Questions.md` framed as: *what kind of author is this? what do they need from their cast?*
  - A short closing paragraph: this author's lens, their known blind spots, and the thing they keep writing toward without realising it

---

## Phase 2 — Create the Narrator

*The Author does not have to be the Narrator. The Author simulates the Narrator — gives them a voice, a position, a set of things they can and cannot know. The Narrator is a mask the Author puts on.*

- [ ] **Narrator Type & POV** — `Story/narrator.md` *(first/second/third, reliability, distance, tense)*
- [ ] **Decide**: Is the narrator the Author speaking directly, a named character, or a constructed persona distinct from both?
- [ ] **Note** the gap between Author worldview and Narrator worldview — this gap is where irony, unreliable narration, and dramatic distance live
- [ ] Create `Creations/story-{datetime}/narrator.md` — narrator type, POV, tense, reliability level, and voice notes

---

## Phase 3 — World Building

*Roll the world the way you rolled the Author. Attribute conflicts in the world are the structural antagonist forces — the seals in `MetaFiles/seven-story-deaths.md` that the story must push against.*

- [ ] **Genre(s)** — `Story/genres.md` *(primary + secondary blend)*
  - Roll 3 **distinct** sublists. If a roll produces the same sublist as a prior selection, re-roll — sublists must differ for the blend to produce contrast and complexity.
  - If the **Graphic & Visual** sublist is rolled: assign the result as the story's **FORMAT** (graphic novel, manga, etc.) and re-roll this genre slot from a different sublist. A format is not a genre. See note in `Story/genres.md`.
- [ ] **Themes & Tropes** — `Story/themes-and-tropes.md` *(name the theme as a question, not a statement; select 2–4 tropes to mutate)*
- [ ] **Plot Structure** — `Story/plot-structure.md` *(select base structure; note conflict types and stakes level)*
- [ ] **Narrative Techniques** — `Story/narrative-techniques.md` *(select 2–4 plot architecture techniques that define how this story is assembled: does it open in medias res? Is there a frame story? Where are the Chekhov's guns planted? What is the ticking clock? Record in `world/world-building.md`)*
- [ ] **Plot Twist Architecture** — `Story/plot-twist-types.md` *(decide now whether this story has a twist and which structural category it belongs to — structural twists such as false protagonist, non-linear narrative, or reverse chronology cannot be retrofitted; commit before drafting begins. Reveal twists are handled in Phase 6.)*
- [ ] **Society as Character** — Define the dominant social structure as a character entity before answering any world-building questions. Record in `world/world-building.md`: its **role** (what it claims to protect vs. what it actually protects), **want** (what it needs to preserve itself), **wound** (its internal contradiction), **flaw** (the pathology it perpetuates), **cost** (what it demands from every character who lives inside it), and **enforcement** (who administers the rules and on what terms). See `Characters/Development/character-types.md` — Society section.
- [ ] **World Hallmarks** — Open `Story/world-hallmarks.md` and use it to build `world/hallmarks.md` for this story.

  A **hallmark** is an element so fused with the story's identity that it is recognizable outside the text — it survives adaptation, appears on merchandise, and evokes the whole world in a single image to someone who has never read the book. A **callback** rewards the prepared reader with mutual recognition (the "I know you know I know" register) but does not escape the text. Callbacks are not hallmarks. Target **5–15 hallmarks**. Fewer means the world is underbuilt. More than 15 means callbacks are creeping in — apply the poster test and cut.

  **Step 1 — Scan all six categories** (see `Story/world-hallmarks.md` — Categories section for full definitions and examples):
  - *Object / Artifact* — a physical item with disproportionate symbolic or plot weight that appears more than once
  - *Place / Path* — a landmark or route that is not a society; characters are shaped by passing through it
  - *Force / Phenomenon* — a non-character force acting on the world: weather, magic system, natural law, recurring threat without speaking roles
  - *Mechanic / Rule* — a distinctive operating rule characters must navigate; often directly encodes the story's theme
  - *Symbol / Visual Motif* — a recurring color, shape, or image that functions as the world's aesthetic signature
  - *Event / Moment* — a recurring ceremony, ritual, or world event that does not require a named character to initiate

  **Step 2 — Apply the three tests** to each candidate:
  1. *Poster test* — Could this element stand alone and immediately evoke the whole world to an outsider who has never read the book? Yes → hallmark. No → callback; do not include.
  2. *Recurrence test* — Does it appear more than once, or carry weight disproportionate to its page count?
  3. *Theme test* — Does it echo the story's central theme question beyond its plot function?

  **Step 3 — Write each entry** using the full format from `Story/world-hallmarks.md` (Format section): **Name · Category · First appearance · Last / peak appearance · Plot function · Symbolic weight · Recurrence pattern · Memorable factor · Theme echo.**

  **Boundaries:** Named characters and societies belong in the relationship graph, not here. Setting descriptions belong in `world/world-building.md`. A hallmark is not "the city is vast" — it is the specific gate, color, or rule that makes this city unlike any other.

- [ ] **Story Time Span & Calendar** — `Story/World Building/time-and-calendar.md` → record in `world/world-building.md`: how long the story stretches, which seasons it passes through, which holidays or calendar markers fall within the span, and whether it follows a real-world or fictional calendar.
- [ ] **Scenery & Setting** — `Story/World Building/scenery.md` → record in `world/world-building.md`: world-level terrain and climate; the primary country/region or world-equivalent; the default scene-level setting vocabulary for this story's world. — `Story/World Building/questions.md` → output goes in `world/questions-answered.md`
- [ ] **Answer all Story questions** — `Story/questions.md` → output goes in `story/questions-answered.md`
- [ ] **Check for Antilife Seals** — `MetaFiles/seven-story-deaths.md` *(which seals are present in the world by design? which are accidental?)*
- [ ] **Resonance check** — `MetaFiles/story-network-theory.md` Part V *(does the same theme question echo in wound, relationship, world structure, genre, and trope?)*
- [ ] Create `Creations/story-{datetime}/world/world-building.md`
- [ ] Create `Creations/story-{datetime}/world/hallmarks.md` *(built using `Story/world-hallmarks.md` — see World Hallmarks step above)*
- [ ] Create `Creations/story-{datetime}/world/questions-answered.md` *(answers to `Story/World Building/questions.md`)*
- [ ] Create `Creations/story-{datetime}/story/questions-answered.md` *(answers to `Story/questions.md`)*

### Phase 3 Micro-Check *(run before moving to Phase 4)*
- [ ] Does the theme question create a visible Stream A/B conflict for the protagonist? Can you state it in one sentence? (`MetaFiles/story-consciousness-theory.md` Part I)
- [ ] Are the four network archetype functions (Pioneer / Optimizer / Generalist / Exploiter) present in the world's structural design — even before individual characters are built?
- [ ] Which Antilife Seals are embedded in the world by deliberate design? Which are accidental defaults?
- [ ] Can you state Society's want and its wound in one sentence? Is Society already acting as a pressure on the protagonist at the story's start — or does it become one?

---

## Phase 4 — Characters

*Each character is rolled the same way the Author was. Note foil/phase relationships between characters as you build — same wound, different phase offset = natural foil pair. Attribute conflicts within a single character = their internal dichotomy.*

### Cast Architecture — Define Before Rolling

Before rolling any individual character, name the cast structure. This prevents over-building minor characters and ensures the network archetype functions are intentionally distributed.

- [ ] **Protagonist(s)** — name them; note their role in the story's central conflict
- [ ] **Antagonist(s)** — person, system, or internal force; note which Antilife Seal(s) they carry
- [ ] **Supporting cast** — named characters with their own arcs and stakes
- [ ] **Catalyst characters** — off-page or minimally present characters who are load-bearing in their *absence* rather than their presence (a missing person, a dead parent, a rumored figure). Use the Catalyst Character thumbnail format in `Characters/Development/character-types.md` — not a full roll suite.
- [ ] **Extras / NPCs** — scene-functional characters with no arc of their own. Use the Extra format in `Characters/Development/character-types.md`. If an Extra becomes load-bearing during drafting, promote them and run the full per-character roll suite.
- [ ] Confirm: Is there a character who exists only to serve the protagonist's arc with no arc of their own? If so — can they be cut, or given stakes?
- [ ] Confirm: Are the four network archetype functions (Pioneer / Optimizer / Generalist / Exploiter) distributed across the named cast?
- [ ] Cross-reference: `Characters/Questions.md` — *Who is the protagonist? Who is the antagonist? Which characters are load-bearing?*

*Repeat this block for each named character:*

> **⚡ Cascading Attributes — Roll These First (per character)**
> Establish **(1) Age Range** and **(2) Gender** before any other attribute. Both are root nodes — Age cascades into physical condition, life status, wound, and emotional register; Gender cascades into life status, religion, philosophy, wound, and sexuality. For the full dependency graph, bidirectional loops, multi-output nodes, and recommended 14-step roll sequence, see `Characters/Development/cascading-attributes.md`.

### Per Character
- [ ] **Age Range** — `Characters/Development/physical-description.md` *(roll this first — cascading attribute)*
- [ ] **Gender** — `Characters/Identity/gender.md`
- [ ] **Romantic / Sexual Leaning** — `Characters/Identity/sexuality.md` *(same 50/50 weight)*
- [ ] **Religion / Faith** — `Characters/Identity/religion-faith.md`
- [ ] **Life Philosophy / Worldview** — `Characters/Identity/life-philosophy.md`
- [ ] **Life Status** — `Characters/Identity/life-status.md`
- [ ] **Emotional Register** — `Characters/Identity/emotional-register.md`
- [ ] **Zodiac / Birthstone** — `Characters/Identity/zodiac-birthstone.md`
- [ ] **MBTI** — `Characters/Personality/mbti.md`
- [ ] **Enneagram** — `Characters/Personality/enneagram.md`
- [ ] **Moral Alignment** — `Characters/Personality/alignment.md`
- [ ] **Character Type** — `Characters/Development/character-types.md`
- [ ] **Physical Description** — `Characters/Development/physical-description.md`
- [ ] **Core Flaw / Virtue / Wound** — `Characters/Development/flaws-virtues-wounds.md`
- [ ] **Core Values / Personal Code / Self-Care** — `Characters/Development/values-code-selfcare.md`
- [ ] **Character Voice Fingerprint** — `Characters/Development/character-voice.md` *(roll after all other attributes are complete — voice is downstream of wound, MBTI, Enneagram, age, and background. Roll: Speech Rhythm + Vocabulary Register + Dialogue Tic + Metaphor Family + Defensive Speech Pattern + Subtext Default. Record in `characters/{name}.md`.)*
- [ ] **Name** — `Characters/Names/` *(as appropriate)*
- [ ] **Answer all Character questions** — `Characters/Questions.md`
- [ ] **Assign network archetype** — Pioneer / Optimizer / Generalist / Exploiter (`MetaFiles/story-network-theory.md` Part III)
- [ ] **Assign Antilife Seal(s)** carried unconsciously — `MetaFiles/seven-story-deaths.md` Carrier Model
- [ ] **Note foil pairings** — which other characters share the same wound frequency? What is the phase offset?
- [ ] **Answer per-character questions** — answer all of the following inside this character's file:
  - `Characters/Identity/questions.md` — gender, sexuality, faith, identity in the world
  - `Characters/Personality/questions.md` — thinking style, emotional interior, behavior under pressure, self-perception
  - `Characters/Development/questions.md` — backstory, want vs. need, flaw & wound, arc, role in the story
  - `Characters/Names/questions.md` — name origin, usage, name as story device
  - Relevant sections of `Characters/Questions.md` — this character's function, whether they're load-bearing, what the story loses without them
- [ ] **Per-character micro-check** — before creating the file, verify: (a) Can you state this character's Stream A vs. Stream B conflict in one sentence? (b) Which network archetype do they serve, and is it distinct from the protagonist's? (c) Which Antilife Seal are they most at risk of carrying?
- [ ] Create `Creations/story-{datetime}/characters/{name}.md`

### After All Characters
- [ ] **Cast Uniqueness — Roll Collision Check** — Compare attributes across all named characters. If two or more characters share the same combination of MBTI + wound + flaw, determine whether this is intentional (a foil pair built from the same emotional material, explicitly noted) or accidental duplication. A cast in which characters consistently agree is a cast without internal conflict. Minimum: no two characters share the same want, need, AND wound simultaneously. If they do, revise one. *(Author–protagonist attribute overlaps are tracked separately in `author.md` as projection risk.)*
- [ ] Answer `Characters/Questions.md` at **cast level** — now that all characters exist, answer the roster questions about the whole cast: who mirrors whom, who is redundant, who is missing, what the power hierarchy is, which characters the reader will love / fear / misread
- [ ] Create `Creations/story-{datetime}/characters/questions-answered.md` *(cast-level answers to `Characters/Questions.md` only — per-character question answers live in each character's own file)*

### Phase 4 Micro-Check *(run after all characters exist, before Phase 5)*
- [ ] Do all four network archetype functions (Pioneer / Optimizer / Generalist / Exploiter) appear across the named cast?
- [ ] For each major character: can you state their Stream A / Stream B conflict in one sentence?
- [ ] Is every Antilife Seal embedded in the world design also carried by at least one character in the cast?
- [ ] Cast Uniqueness Check completed — no duplicate want + need + wound combinations?

---

## Phase 5 — Relationships

- [ ] **Answer all Relationship questions** — `Relationships/questions.md` → answer for each significant relationship pair in the story
- [ ] **Roll / assign relationship types** — `Relationships/relationship-types.md`
- [ ] **Roll / assign relationship dynamics** — `Relationships/relationship-dynamics.md`
- [ ] **Roll / assign relationship structures** — `Relationships/relationship-structures.md`
- [ ] **Build the Relationship Graph** — copy `MetaFiles/relationship-graph-template.csv` into `Creations/story-{datetime}/relationships/relationship-graph.csv`, replace placeholder names with actual character names, fill each cell in that character's voice.
  - *Each cell should capture: current relationship state | emotional charge | any unresolved tension | arc direction (growing / decaying / static / unknown to them)*
  - *Include all named minor characters — append `(minor)` to their name in both the row and column header. A minor character who only interacts meaningfully with one or two people will have many blank cells, and that asymmetry is the point: it shows exactly where their load-bearing weight sits. Do not omit a minor character because they have few relationships — their absence from most cells and presence in a few is itself structural data.*
  - *Include named societies and collective groups that function as characters — append `(society)` to their name in both headers. Any group that acts as a pressure system, power structure, or collective identity in the story qualifies: a school, a nation, a criminal organization, a people defined by their shared oppression, a ruling body, a cultural institution. Society rows are written in the collective voice of that group; society columns show how individual characters perceive and relate to that force. Societies will have many blank cells — only fill where there is genuine relationship. The pattern of blanks and fills for a society entry reveals its reach and weight in the story. Societies do not have a SELF cell — use a brief description of the society's self-image or collective identity in that diagonal position.*
  - *Blank cell = characters have not met or are irrelevant to each other — intentional blanks are data*
- [ ] Create `Creations/story-{datetime}/relationships/questions-answered.md` *(answers to `Relationships/questions.md` for each significant pair)*
- [ ] Create `Creations/story-{datetime}/relationships/relationship-graph.csv`

---

## Phase 6 — Story Foundation

*Before anything in this phase begins: re-read the **Big Picture Statement** at the end of `author.md`. The title, abstract, and short description are the public face of what this author is trying to say. If any of them contradict or drift from the Big Picture Statement, the statement wins — revise the story element, not the intent.*

- [ ] **Know the ending first** — before the outline exists, the story's final image and the protagonist's final state must be decided. Everything else is built backward from this. *("No such thing as happy coincidences" — the ending makes all planted details feel inevitable in retrospect)*
  - If the story uses a reveal twist (identity, allegiance, reality, information — see `Story/plot-twist-types.md`): write the ending first, then go back and plant the evidence. A twist that cannot be foreshadowed is a cheat.
- [ ] **Title** — working title; can be revised
- [ ] **Abstract** — 1 paragraph: what is this story about at the principle level (not plot summary)
- [ ] **Short Description** — 2–3 sentences: the hook, the world, the central question *(this is distinct from the Abstract — the Short Description is pitch-facing text, written as if answering "what's your book about?" in 30 seconds. Keep it short and aimed at a reader who knows nothing. The Abstract is the structural reference document, written for the author.)*
- [ ] **Story Arc** — map the protagonist's arc using the chosen plot structure; note the subproblem stack state at each major beat (`Story/plot-structure.md` — Resolution Architecture)
- [ ] **Tonal Arc** — map the story's emotional register across acts/chapters. This is distinct from the Author's default register. Using the emotional register list (`Characters/Identity/emotional-register.md`) as vocabulary and the tone types in `MetaFiles/tonal-control.md` as the authorial stance layer, note the dominant tone for each act and where deliberate phase shifts occur (e.g., Act 1: Tense → Act 2 mid: Euphoric false peak → Act 2 end: Desolate → Act 3: Resolute). Record the opening tone, Act 2 mid tone, Act 2 end tone, closing tone, and all designed tonal departures in `story/arc.md`. The tonal arc is the story's signal pattern — its interference design. See `MetaFiles/tonal-control.md` for arc design principles and tone failure modes.
- [ ] **Subplot Map** — list each subplot with: its opening event, its theme echo (how it asks the same question as the main plot differently), and its planned resolution or decay point
- [ ] **Outline** — chapter by chapter: chapter number, working title, brief description of what happens, dominant tone for this chapter, which subproblem threads are active/critical/resolved at end of chapter, and per-chapter **scene metadata**: location (country/region → specific place), interior/exterior type, time of day, season and temporal context, and which setting function is active. See `Story/World Building/scenery.md` for the per-chapter scene metadata format. This is structural specification, not flavour.
- [ ] Create `Creations/story-{datetime}/abstract.md` — three clearly separated sections: **Title**, **Short Description** (2–3 sentences, pitch-facing), **Abstract** (1 paragraph, principle-level)
- [ ] Create `Creations/story-{datetime}/story/arc.md`
- [ ] Create `Creations/story-{datetime}/outline.md`

---

## Phase 7 — Full Review Against MetaFiles

*Nothing moves to Phase 8 until this is complete. The MetaFiles are the lens — use them to audit the story before writing begins.*

- [ ] **Consciousness Theory check** — `MetaFiles/story-consciousness-theory.md`
  - Does each major character have a Stream A (private) and Stream B (social) in tension?
  - Is the I-Thread coherent — is there a persistent identity threading through their arc?
  - Does the protagonist's arc represent a genuine weighting shift, not just plot events?
  - **Developmental Stages** (Part IX): Where is each major character on the self-awareness spectrum at the story's start? (Stage 1 Reactive → Stage 5 Meta-Aware) Where do they end? Is the distance between start and end sufficient for an arc?
  - **Scene Loop** (Part V): Is the 7-step scene checklist being used to verify each key scene has a complete PERCEIVE → THINK → MAP → ACT loop with both feedback arrows?
- [ ] **Network Theory check** — `MetaFiles/story-network-theory.md`
  - Is the world-as-organism the primary unit, or is the protagonist accidentally carrying everything?
  - Are four network archetype functions covered across the cast?
  - Does the theme question resonate across all 6 domains (wound / philosophy / relationship / world / genre / trope)?
  - Are the subproblem threads mapped and their convergence point designed?
- [ ] **Seven Story Deaths check** — `MetaFiles/seven-story-deaths.md`
  - Run the Story Health Score: for each seal, is it accidental or deliberate?
  - Run the Fractal Check: do the same seals appear at individual / relationship / community / institutional / societal scale?
  - Are the antagonist's seals emerging from their character files, not assigned from outside?
- [ ] **Story Elements check** — `Story/story-elements.md`
  - Are all 7 elements (Theme, Characters, Setting, Plot, Conflict, POV, Style) present and doing active work — or is any one of them passive, thin, or serving only one other element?
  - **Conflict specifically:** Is conflict operating at more than one level simultaneously? Run all five: macro/societal → intragroup → intimate → internal → self vs. world. A story with conflict at only one level is a pressure problem.
  - **POV specifically:** Is the POV character's wound actively shaping what the reader sees and what the reader can see that the character cannot? Is the validation/need mechanism (Enneagram core motivation) visible in what the POV character attends to and misses?
  - **Style specifically:** Is the author's rolled prose style in productive relationship with the story's theme — or are they pulling in opposite directions?
- [ ] **Relativism check** — Does the story's world configuration assign moral valence coherently? Could a reader in a different real-world configuration read the antagonist as a protagonist — and is that intentional or a gap?
- [ ] **Resonance final check** — Is the same theme question present in at least 4 of 6 domains?
- [ ] If any gaps are found: update outline, character files, or world-building before proceeding
- [ ] All questions from all `questions.md` files are answered in the story folder

---

## The Bridge — Phase 7 → Phase 8

*This section exists because completing the architecture and beginning the draft are two different acts — and the gap between them is where most writers stall. The preparation is done. The world is built. The characters are fully inhabited. The outline is complete. And yet the first sentence does not appear.*

*That gap is not a preparation failure. It is a threshold problem. The system has done everything it can do. What follows is on the writer.*

*Before opening the first chapter file, answer these questions directly — not as checklist items, but as honest statements. Write the answers in a scratch note, say them aloud, or simply hold them. They are not gatekeeping. They are orientation.*

---

**1. What is the first thing that happens in this story?**

Not the first chapter's goal. Not the inciting incident. The first *thing* — the first image, action, line of dialogue, or sensory detail the reader encounters. If you cannot answer this specifically, the outline's opening chapter needs one more pass. The first sentence of a story is not written randomly — it is the door. You need to know what the door looks like before you open it.

**2. Whose voice is this?**

Re-read `author.md` Voice Fingerprint and `narrator.md` side by side. Say one sentence aloud in the narrator's voice before writing anything. Not a perfect sentence. Any sentence. The voice must be physically present before the draft begins — not retrieved from memory, but active. If you cannot hear it, read three pages of the prose style you rolled in `author.md` and come back.

**3. What does the reader not yet know that you do?**

Name the three most important things the reader will not know at the end of Chapter 1 that they will know by the end of the story. These are your withheld facts — the structural gap between the reader's current knowledge and the story's full truth. Knowing what you are withholding is what gives the early chapters their tension. You are not withholding randomly. You are withholding deliberately, and that deliberateness is what makes the first chapter feel like it knows where it is going even when the reader does not.

**4. What are you most afraid to write in this story?**

There is always an answer. It may be a character who is too close to someone real. A scene that requires emotional honesty you have been avoiding. An ending that does not let anyone off the hook. A perspective you are not sure you can inhabit without distortion. Name it. You do not have to write it today. But knowing where it is means you will not accidentally write around it for 200 pages and only notice at the end.

**5. What is the first scene you are genuinely excited to write?**

Not obligated to write. Not architecturally necessary to write. *Excited* to write. If you cannot name one, the story is structurally complete but emotionally cold — and you will feel that coldness in every session. Go back to the author's wound and the Big Picture Statement. Find the scene where those two things meet at full pressure. That scene is usually somewhere in the middle of the outline. Hold it as the destination. Write toward it.

---

*When you can answer all five — not perfectly, but honestly — open the Chapter 1 notes file and begin Step 0.*

*The architecture is load-bearing. The first sentence will be wrong. Write it anyway. The system has done its job. The rest is yours.*

---

## Phase 8 — Chapter-by-Chapter Execution

*Now you have all the ingredients. Work through the outline one chapter at a time. These are not vignettes — each chapter is a load-bearing piece of a continuous story. Every chapter must arrive from the previous one and leave the next one changed.*

> **Chapter file output — prose only.** The checklist sections below (Before Drafting · During Drafting · After Drafting) are **process checks** — run them during the drafting session; they are not part of the chapter output file. The chapter file itself (`story/chapter-{n}.md`) contains only the prose: the story as the Author wrote it, in the Narrator’s voice, in the story’s chosen form. No section headers. No checklists. No continuity notes. The reader sees only the story. Production notes, mid-draft decisions, continuity flags, and things to revisit live in a parallel `story/chapter-{n}-notes.md`. The two files serve different purposes and must never be merged. **The notes file is created before drafting begins — not after.** The Before Drafting sections are pre-flight; the After Drafting sections are handoff. See the step below.
>
> **The story folder is:** `Creations/story-{datetime}/`. Before drafting any chapter, the following files are open and consulted — not recalled from memory:
- `author.md` — the author's lens, wound, prose style, and voice
- `narrator.md` — POV, reliability, tense, distance
- `characters/{name}.md` — for every character who appears: their identity, emotional register, MBTI/Enneagram, flaw/virtue/wound, speech patterns, what they want, what they're hiding
- `relationships/relationship-graph.csv` — the current state of every pair; what has shifted since the last chapter
- `story/arc.md` — where this chapter sits in the tonal arc and subproblem stack
- `outline.md` — the chapter's intended goal, dominant tone, and active threads

---

### Step 0 — Create the Chapter Notes File

- [ ] Create `story/chapter-{n}-notes.md` now, before opening the chapter file.
- [ ] Populate the **Before Drafting — Continuity Check** and **Before Drafting — Character Consistency Check** sections from: the prior chapter’s handoff note in `story/chapter-checklist.md`, the current state of `story/arc.md`, and `outline.md` for this chapter’s goal and scene metadata.
- [ ] Leave the After Drafting sections blank. They will be completed after the chapter is written.

*The notes file is the pre-flight. The chapter file is the flight. Do not open the chapter file until the pre-flight is complete.*

---

### Before Drafting — Continuity Check

- [ ] Read the final paragraph of the previous chapter. This chapter's opening must be causally or emotionally continuous with it — not a fresh start.
- [ ] What changed at the end of the last chapter? Which subproblem thread moved? Which relationship shifted? Which character learned or refused to learn something? This chapter inherits all of it.
- [ ] Check `story/arc.md`: where is the tonal arc right now? Does this chapter maintain, escalate, or deliberately break the pattern — and is the break intentional?
- [ ] Check `outline.md`: what is this chapter's one goal? If it has more than one goal, which is primary?

### Before Drafting — Character Consistency Check

*For every named character appearing in this chapter — open their file in `characters/{name}.md` and verify:*

- [ ] **Name and address:** Is the character referred to by the correct name, nickname, or title — consistent with how other characters in this chapter's relationship dynamic address them? (Check `relationship-graph.csv` for how each other character perceives them.)
- [ ] **Voice:** Does their dialogue and internal voice match their MBTI, Enneagram, emotional register, and wound? A Turbulent Avoidant with a Stoic philosophy does not speak the same way under pressure as an Anxious ENFJ with a Humanist philosophy — even if they're saying the same thing.
- [ ] **Want vs. need:** Is this character still pursuing their want — or have they started unconsciously moving toward their need? Is that shift deliberate at this point in the arc, or a drift?
- [ ] **Flaw in action:** Is the character's flaw present — not announced, but visible in behavior, choice, or reaction? A flaw that doesn't cost anything in this chapter is invisible.
- [ ] **Personal code:** Is the character acting in alignment with or in violation of their code (from `values-code-selfcare.md`)? A violation the narrative doesn't acknowledge is a continuity error. A violation it does acknowledge is a character moment — note it.
- [ ] **Self-care under stress:** If this character has been depleted, threatened, or grieving in or before this chapter — are they reaching for their restoration mechanism? Is it the healthy version or the wound-adjacent one? A character who never shows how they cope is missing a layer of interiority.
- [ ] **Continuity of knowledge:** Does this character remember what they know? Do they act on what they've learned in prior chapters, or have they reset? Characters do not forget unless the story has given them a reason to.

### During Drafting — Scene-Level Checks

- [ ] The scene correlation test: are plot, character, theme, relationship, and world domains all active in this chapter — or are some siloed? Siloed chapters feel like filler.
- [ ] Key scenes: run the 7-step scene loop (`MetaFiles/story-consciousness-theory.md` Part V) — does the POV character perceive → process → update their map → act? Do both feedback loops (fast correction and slow belief revision) have room to operate?
- [ ] The Author's voice and prose style (`author.md` — Voice & Craft section) are the active filter. Does this chapter sound like this author? Does the sentence structure, vocabulary, and emotional distance match their rolled prose style?
- [ ] The Narrator's POV, reliability, and distance are consistent with `narrator.md`. If the narrator is unreliable, is the gap between what they report and what is true still legible to the reader?
- [ ] If a scene isn't working, consult `Story/narrative-techniques.md` — the problem is often a technique question: is the setting passive when it could carry symbolic weight? Is the foreshadowing planted? Is a red herring doing what it should? Is the ticking clock still audible?
- [ ] **Tonal drift check** (after any gap of a day or more between drafting sessions) — run the 5-step drift check in `MetaFiles/tonal-control.md`. Re-read the last paragraph written; compare its tone against the arc spec in `story/arc.md`; identify whether any gap is earned or leaked. See tone failure modes for diagnosis.
- [ ] **Voice differentiation spot-check** — take any two named characters who appear together in this chapter. Read three of their exchanges. Is it clear which speaker is which from voice alone, without dialogue tags? If not, see `Characters/Development/character-voice.md` — Voice Differentiation Check.

### After Drafting — Forward Continuity Check

- [ ] What has changed by the end of this chapter that the next chapter must inherit? Write it as one sentence in `story/chapter-checklist.md` — this is the handoff note.
- [ ] Did at least one relationship phase-shift in this chapter? Update `relationship-graph.csv` to reflect the current state of any pair that moved.
- [ ] Did a subproblem thread change state (dormant → active, active → critical, critical → resolved, or a new thread opened)? Update `story/arc.md`.
- [ ] Any new character introduced? Roll them properly and add their file to `characters/` before the next chapter begins.
- [ ] Does the chapter's final image or line set up a question, a pressure, or an incompleteness that pulls the reader into the next chapter? A chapter that resolves cleanly with no forward tension is a stopping point, not a continuation.- [ ] Return to `story/chapter-{n}-notes.md` and complete the After Drafting sections: thread states, relationship shifts, any new character flags, and the one-sentence handoff to the next chapter. This is the source document for Step 0 of Chapter N+1.
---

## Final Confidence Check

Before calling the story ready to write in full:

- [ ] All files in `Creations/story-{datetime}/` are populated
- [ ] All 9 `questions.md` files have answers in the story folder — `Characters/Questions.md` produces two separate outputs (author frame + cast level); confirm all 10 destinations:
  - `MetaFiles/questions.md` → `author.md`
  - `Characters/Questions.md` *(author frame)* → `author.md`
  - `Characters/Questions.md` *(cast level — answered after all characters exist)* → `characters/questions-answered.md`
  - `Characters/Identity/questions.md` → each `characters/{name}.md`
  - `Characters/Personality/questions.md` → each `characters/{name}.md`
  - `Characters/Development/questions.md` → each `characters/{name}.md`
  - `Characters/Names/questions.md` → each `characters/{name}.md`
  - `Relationships/questions.md` → `relationships/questions-answered.md`
  - `Story/questions.md` → `story/questions-answered.md`
  - `Story/World Building/questions.md` → `world/questions-answered.md`
- [ ] Outline is complete chapter by chapter
- [ ] Relationship graph covers all named characters
- [ ] MetaFiles review (Phase 7) completed with no unresolved gaps
- [ ] Author lens and Narrator voice are distinct and documented
- [ ] The theme question can be stated in one sentence, and it echoes visibly in the world, the protagonist's wound, and the central relationship

