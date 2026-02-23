# Master Story Checklist

*The complete workflow for generating a story using the Serendipity Engine — from first roll to final chapter.*

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

*The Author is the first character. Everything that follows is filtered through their lens. Some authors let their creations run away from them and allow new perspectives to change their own worldview. Others grip the reins tightly and bend the world to their ideology (see: Ayn Rand). Knowing which kind of author you're writing is as important as any other attribute.*

Roll randomly from each of the following. Where attributes conflict with each other, **do not resolve the conflict** — that dichotomy is a feature. It is a phase tension the author carries into every decision they make about the story.

*Conflict types: (a) **Productive tension** — attributes that coexist in genuine friction without logical contradiction (Lawful Evil + Tragic Hero; INFJ + Enneagram 8w7 — uncomfortable but coherent). These are features — hold both without softening either. (b) **Illogical contradiction** — attributes that cannot simultaneously be true at the same point in time (Lawful Evil + Chaotic Good; devout fundamentalist + fervent atheist). When this occurs, treat them as **past state → current state**: the earlier roll describes who this person was shaped to become; the later roll describes who they actually are now. The gap between them is their wound, their arc, and their most interesting writing blind spot. Keep both rolls. Document the transition in the character file.*

> **⚡ Cascading Attributes — Roll These First (Author)**
> Before working through the Identity list below: establish **(1) Age Range** and **(2) Gender** first, regardless of where they appear in the list. The list is grouped by category for reference — it is not the roll sequence. Age cascades into religion, life status, wound, philosophy, and emotional register. Gender cascades into life status, religion, wound, and sexuality. Both cascade into the author's unconscious writing bias — what they attend to and what they cannot see. For the full dependency graph, bidirectional loops, and recommended 13-step roll sequence, see `Characters/Development/cascading-attributes.md`.

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
- [ ] **Story Time Span & Calendar** — `Story/World Building/time-and-calendar.md` → record in `world/world-building.md`: how long the story stretches, which seasons it passes through, which holidays or calendar markers fall within the span, and whether it follows a real-world or fictional calendar.
- [ ] **Scenery & Setting** — `Story/World Building/scenery.md` → record in `world/world-building.md`: world-level terrain and climate; the primary country/region or world-equivalent; the default scene-level setting vocabulary for this story's world. — `Story/World Building/questions.md` → output goes in `world/questions-answered.md`
- [ ] **Answer all Story questions** — `Story/questions.md` → output goes in `story/questions-answered.md`
- [ ] **Check for Antilife Seals** — `MetaFiles/seven-story-deaths.md` *(which seals are present in the world by design? which are accidental?)*
- [ ] **Resonance check** — `MetaFiles/story-network-theory.md` Part V *(does the same theme question echo in wound, relationship, world structure, genre, and trope?)*
- [ ] Create `Creations/story-{datetime}/world/world-building.md`
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
> Establish **(1) Age Range** and **(2) Gender** before any other attribute. Both are root nodes — Age cascades into physical condition, life status, wound, and emotional register; Gender cascades into life status, religion, philosophy, wound, and sexuality. For the full dependency graph, bidirectional loops, multi-output nodes, and recommended 13-step roll sequence, see `Characters/Development/cascading-attributes.md`.

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
- [ ] **Tonal Arc** — map the story's emotional register across acts/chapters. This is distinct from the Author's default register. Using the emotional register list (`Characters/Identity/emotional-register.md`) as vocabulary, note the dominant tone for each act and where deliberate phase shifts occur (e.g., Act 1: Tense → Act 2 mid: Euphoric false peak → Act 2 end: Desolate → Act 3: Resolute). The tonal arc is the story's signal pattern — its interference design.
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

## Phase 8 — Chapter-by-Chapter Execution

*Now you have all the ingredients. Work through the outline one chapter at a time. These are not vignettes — each chapter is a load-bearing piece of a continuous story. Every chapter must arrive from the previous one and leave the next one changed.*

> **Chapter file output — prose only.** The checklist sections below (Before Drafting · During Drafting · After Drafting) are **process checks** — run them during the drafting session; they are not part of the chapter output file. The chapter file itself (`story/chapter-{n}.md`) contains only the prose: the story as the Author wrote it, in the Narrator's voice, in the story's chosen form. No section headers. No checklists. No continuity notes. The reader sees only the story. If production notes are needed — decisions made mid-draft, continuity flags, things to revisit — create a parallel `story/chapter-{n}-notes.md` for that material. The two files serve different purposes and must never be merged. is the story folder:** `Creations/story-{datetime}/`. Before drafting any chapter, the following files are open and consulted — not recalled from memory:
- `author.md` — the author's lens, wound, prose style, and voice
- `narrator.md` — POV, reliability, tense, distance
- `characters/{name}.md` — for every character who appears: their identity, emotional register, MBTI/Enneagram, flaw/virtue/wound, speech patterns, what they want, what they're hiding
- `relationships/relationship-graph.csv` — the current state of every pair; what has shifted since the last chapter
- `story/arc.md` — where this chapter sits in the tonal arc and subproblem stack
- `outline.md` — the chapter's intended goal, dominant tone, and active threads

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

### After Drafting — Forward Continuity Check

- [ ] What has changed by the end of this chapter that the next chapter must inherit? Write it as one sentence in `story/chapter-checklist.md` — this is the handoff note.
- [ ] Did at least one relationship phase-shift in this chapter? Update `relationship-graph.csv` to reflect the current state of any pair that moved.
- [ ] Did a subproblem thread change state (dormant → active, active → critical, critical → resolved, or a new thread opened)? Update `story/arc.md`.
- [ ] Any new character introduced? Roll them properly and add their file to `characters/` before the next chapter begins.
- [ ] Does the chapter's final image or line set up a question, a pressure, or an incompleteness that pulls the reader into the next chapter? A chapter that resolves cleanly with no forward tension is a stopping point, not a continuation.

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

