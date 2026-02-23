# Master Story Checklist

*The complete workflow for generating a story using the Serendipity Engine — from first roll to final chapter.*

---

## Before You Begin — Seed the Engine

Open `MetaFiles/randomization-engine.md`. Generate your session seed from the current datetime:

```
YYYYMMDDHHM → e.g. February 22 2026, 2:47 PM = 202602221447
```

Write it as the first line of your `author.md` before any rolls are made. Every roll in every phase derives from this seed in sequence. Do not pick results manually — derive them. Do not re-roll because a result is strange — keep it.

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

---

## Phase 1 — Create the Author

*The Author is the first character. Everything that follows is filtered through their lens. Some authors let their creations run away from them and allow new perspectives to change their own worldview. Others grip the reins tightly and bend the world to their ideology (see: Ayn Rand). Knowing which kind of author you're writing is as important as any other attribute.*

Roll randomly from each of the following. Where attributes conflict with each other, **do not resolve the conflict** — that dichotomy is a feature. It is a phase tension the author carries into every decision they make about the story.

### Identity
- [ ] **Gender** — `Characters/Identity/gender.md`
- [ ] **Romantic / Sexual Leaning** — `Characters/Identity/sexuality.md`
  - *Weight: heterosexual = ~50% probability; all other orientations share the remaining ~50%*
- [ ] **Religion / Faith** — `Characters/Identity/religion-faith.md`
- [ ] **Life Philosophy / Worldview** — `Characters/Identity/life-philosophy.md`
- [ ] **Life Status** — `Characters/Identity/life-status.md` *(relationship status, parental status, living situation, financial upbringing, current financial status)*
- [ ] **Current Age Range** — roll: 20s / 30s / 40s / 50s / 60s+ *(shapes what the author has lived through and what they're still inside)*
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

### Voice & Craft
- [ ] **Prose Style / Literary Era** — `MetaFiles/writing-prose-styles.md`
- [ ] **Language & Content Register** — `MetaFiles/language-content.md` *(content rating, profanity comfort, tonal register)*
- [ ] **Intended Audience** — roll or decide: Children / Teens / New Adult / Adults *(sets the hard ceiling on content, complexity, and emotional territory)*
- [ ] **Preferred Genre(s) as a reader/writer** — `Story/genres.md` *(what this author gravitates toward; may or may not match the story's genre — the gap is worth noting)*

### Name
- [ ] **Author Name** — `Characters/Names/` *(feminine / masculine / neutral as appropriate)*

### Answer the Author Questions
- [ ] `MetaFiles/questions.md` — the full Author Questions file; answer all sections
- [ ] `Characters/Questions.md` — answer all questions in the frame of the Author, not a character

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
- [ ] **Themes & Tropes** — `Story/themes-and-tropes.md` *(name the theme as a question, not a statement; select 2–4 tropes to mutate)*
- [ ] **Plot Structure** — `Story/plot-structure.md` *(select base structure; note conflict types and stakes level)*
- [ ] **Answer all World Building questions** — `Story/World Building/questions.md` → output goes in `world/questions-answered.md`
- [ ] **Answer all Story questions** — `Story/questions.md` → output goes in `story/questions-answered.md`
- [ ] **Check for Antilife Seals** — `MetaFiles/seven-story-deaths.md` *(which seals are present in the world by design? which are accidental?)*
- [ ] **Resonance check** — `MetaFiles/story-network-theory.md` Part V *(does the same theme question echo in wound, relationship, world structure, genre, and trope?)*
- [ ] Create `Creations/story-{datetime}/world/world-building.md`
- [ ] Create `Creations/story-{datetime}/world/questions-answered.md` *(answers to `Story/World Building/questions.md`)*
- [ ] Create `Creations/story-{datetime}/story/questions-answered.md` *(answers to `Story/questions.md`)*

---

## Phase 4 — Characters

*Each character is rolled the same way the Author was. Note foil/phase relationships between characters as you build — same wound, different phase offset = natural foil pair. Attribute conflicts within a single character = their internal dichotomy.*

### Cast Architecture — Define Before Rolling

Before rolling any individual character, name the cast structure. This prevents over-building minor characters and ensures the network archetype functions are intentionally distributed.

- [ ] **Protagonist(s)** — name them; note their role in the story's central conflict
- [ ] **Antagonist(s)** — person, system, or internal force; note which Antilife Seal(s) they carry
- [ ] **Supporting cast** — named characters with their own arcs and stakes
- [ ] **Throwaway / functional characters** — named but minimal; exist to move plot or ground the world
- [ ] Confirm: Is there a character who exists only to serve the protagonist's arc with no arc of their own? If so — can they be cut, or given stakes?
- [ ] Confirm: Are the four network archetype functions (Pioneer / Optimizer / Generalist / Exploiter) distributed across the named cast?
- [ ] Cross-reference: `Characters/Questions.md` — *Who is the protagonist? Who is the antagonist? Which characters are load-bearing?*

*Repeat this block for each named character:*

### Per Character
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
- [ ] Create `Creations/story-{datetime}/characters/{name}.md`

### After All Characters
- [ ] Answer `Characters/Questions.md` at **cast level** — now that all characters exist, answer the roster questions about the whole cast: who mirrors whom, who is redundant, who is missing, what the power hierarchy is, which characters the reader will love / fear / misread
- [ ] Create `Creations/story-{datetime}/characters/questions-answered.md` *(cast-level answers to `Characters/Questions.md` only — per-character question answers live in each character's own file)*

---

## Phase 5 — Relationships

- [ ] **Answer all Relationship questions** — `Relationships/questions.md` → answer for each significant relationship pair in the story
- [ ] **Roll / assign relationship types** — `Relationships/relationship-types.md`
- [ ] **Roll / assign relationship dynamics** — `Relationships/relationship-dynamics.md`
- [ ] **Roll / assign relationship structures** — `Relationships/relationship-structures.md`
- [ ] **Build the Relationship Graph** — copy `MetaFiles/relationship-graph-template.csv` into `Creations/story-{datetime}/relationships/relationship-graph.csv`, replace placeholder names with actual character names, fill each cell in that character's voice.
  - *Each cell should capture: current relationship state | emotional charge | any unresolved tension | arc direction (growing / decaying / static / unknown to them)*
  - *Blank cell = characters have not met or are irrelevant to each other — intentional blanks are data*
- [ ] Create `Creations/story-{datetime}/relationships/questions-answered.md` *(answers to `Relationships/questions.md` for each significant pair)*
- [ ] Create `Creations/story-{datetime}/relationships/relationship-graph.csv`

---

## Phase 6 — Story Foundation

- [ ] **Know the ending first** — before the outline exists, the story's final image and the protagonist's final state must be decided. Everything else is built backward from this. *("No such thing as happy coincidences" — the ending makes all planted details feel inevitable in retrospect)*
- [ ] **Title** — working title; can be revised
- [ ] **Abstract** — 1 paragraph: what is this story about at the principle level (not plot summary)
- [ ] **Short Description** — 2–3 sentences: the hook, the world, the central question
- [ ] **Story Arc** — map the protagonist's arc using the chosen plot structure; note the subproblem stack state at each major beat (`Story/plot-structure.md` — Resolution Architecture)
- [ ] **Tonal Arc** — map the story's emotional register across acts/chapters. This is distinct from the Author's default register. Using the emotional register list (`Characters/Identity/emotional-register.md`) as vocabulary, note the dominant tone for each act and where deliberate phase shifts occur (e.g., Act 1: Tense → Act 2 mid: Euphoric false peak → Act 2 end: Desolate → Act 3: Resolute). The tonal arc is the story's signal pattern — its interference design.
- [ ] **Subplot Map** — list each subplot with: its opening event, its theme echo (how it asks the same question as the main plot differently), and its planned resolution or decay point
- [ ] **Outline** — chapter by chapter: chapter number, working title, brief description of what happens, dominant tone for this chapter, which subproblem threads are active/critical/resolved at end of chapter
- [ ] Create `Creations/story-{datetime}/abstract.md`
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
- [ ] **Relativism check** — Does the story's world configuration assign moral valence coherently? Could a reader in a different real-world configuration read the antagonist as a protagonist — and is that intentional or a gap?
- [ ] **Resonance final check** — Is the same theme question present in at least 4 of 6 domains?
- [ ] If any gaps are found: update outline, character files, or world-building before proceeding
- [ ] All questions from all `questions.md` files are answered in the story folder

---

## Phase 8 — Chapter-by-Chapter Execution

*Now you have all the ingredients. Work through the outline one chapter at a time.*

For each chapter, confirm before drafting:

- [ ] The chapter goal is clear from `outline.md`
- [ ] The active subproblem threads for this chapter are identified (dormant / active / critical / resolved)
- [ ] The chapter's intended tonal register matches the tonal arc in `arc.md` — or the deviation is intentional and noted
- [ ] The scene correlation test has been considered — will plot, character, theme, relationship, and world domains be correlated or siloed in this chapter?
- [ ] Key scenes have been checked against the 7-step scene loop (Part V, `MetaFiles/story-consciousness-theory.md`): Does the POV character perceive → process → update their map → act, and do both feedback loops (fast correction and slow belief revision) have room to operate?
- [ ] The Author's voice, wound, and prose style are the active filter — does this chapter sound like this Author?
- [ ] The Narrator's POV, reliability, and distance are consistent with `narrator.md`
- [ ] The chapter advances at least one relationship in the graph — update `relationship-graph.csv` if phase shifts occur
- [ ] Any new character introductions are rolled properly and added to `characters/`
- [ ] After drafting: does the chapter end with a clear subproblem state change (something moved from active → critical, critical → resolved, or opened a new active thread)?

---

## Final Confidence Check

Before calling the story ready to write in full:

- [ ] All files in `Creations/story-{datetime}/` are populated
- [ ] All 9 `questions.md` files have answers in the story folder — confirm each:
  - `MetaFiles/questions.md` → `author.md`
  - `Characters/Questions.md` (author frame) → `author.md`
  - `Characters/Questions.md` (cast level) → `characters/questions-answered.md`
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

