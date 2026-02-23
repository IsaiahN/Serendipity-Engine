# Cascading Attributes

*A dependency graph for character attribute rolls. Some attributes sit upstream of others — they constrain or reframe what subsequent rolls mean. Roll upstream attributes first; let them inform everything downstream before you lock in results.*

*Referenced by: `MetaFiles/Master-Story-Checklist.md` · `Characters/Development/physical-description.md` · `Characters/Development/character-voice.md`*

---

## How to Read This Map

```
A → B         A shapes how B reads; roll A first
A ↔ B         bidirectional — A shapes B and B shapes A; note which direction is stronger in context
A ⊕           multi-output node — A simultaneously affects several attributes at once
[A → B → C]   cascade chain — C depends on B, which depends on A
```

A cascade means: roll the upstream attribute, then look at the downstream rolls through that lens before finalizing them. You do not have to re-roll — but do not lock in results in isolation.

---

## Root Nodes — Nothing Upstream; Roll These First

```
WORLD / HISTORICAL PERIOD    (Phase 3 output — exists before any character is built)
AGE RANGE                    (first character roll, always)
GENDER                       (second character roll, always)
```

---

## Primary Cascade: World / Historical Period

World period arrives from Phase 3. By Phase 4, it is already set — but explicitly reading each character roll through the world's context is the work.

```
WORLD / HISTORICAL PERIOD ⊕
 ├── → Age (what this age means — 40 in 1850 ≠ 40 in 2025)
 ├── → Religion / Faith (dominant traditions; what apostasy costs in this time and place)
 ├── → Gender (available roles; enforced restrictions; the cost of resistance)
 ├── → Sexuality (legality, visibility, available vocabulary)
 ├── → Life Status / Financial (class mobility; which economic structures exist)
 ├── → Wound (what historical traumas were in the air during this character's formative years)
 └── → Name (which names existed; what a name signals in this cultural moment)
```

---

## Primary Cascade: Age

```
AGE ⊕
 ├── → Physical Condition
 │    ├── → Build / Body Type (how age is worn on the body)
 │    │    ├── → Posture & Movement (a gaunt frame does not default to commanding)
 │    │    └── → Style / Presentation (what clothes fit; what the body allows or demands)
 │    └── → Distinguishing Features (scars, chronic conditions, marks of time accumulate)
 │         ↔ Style / Presentation (contradiction between how someone looks and how they want to be read)
 ├── → Life Status
 │    ├── → Relationship Status (length of time available for relationship history)
 │    ├── → Parental Status (adult children require 40+; children cannot exist at 14)
 │    └── → Financial Status (career arc, inheritance window, stability vs. precarity trajectory)
 ├── → Religion / Faith (formed in childhood; tested in adulthood; settled or abandoned by old age)
 ├── → Life Philosophy (solidifies with lived experience; shatters under late-stage crisis)
 ├── → Wound
 │    ├── → Flaw (wound origin — must be a plausible cause; re-roll if the logic breaks)
 │    │    └── → Virtue (genuine tension counterpart to the flaw — not its opposite; its shadow)
 │    ├── → Self-Care Mechanism (what they reach for under depletion — reveals what they believe they deserve)
 │    └── ↔ Emotional Register (wound maintains the register; register makes the wound harder to see)
 └── → Emotional Register (accumulated affect reads differently than fresh affect)
```

---

## Primary Cascade: Gender

```
GENDER ⊕
 ├── → Life Status (marriage pressure, parental expectation, financial access — all socially gendered)
 ├── → Religion / Faith (access to religious roles; relationship to doctrine about gender)
 ├── → Life Philosophy (shaped by what the world has allowed or denied this person)
 ├── → Wound (patriarchal trauma, masculinity wound, non-binary erasure — gender-specific vocabulary)
 ├── → Physical Description / Style (how gender is performed on the body, or refused)
 └── → Sexuality (same orientation reads differently in different bodies in different periods)
```

---

## Secondary Cascade: Personality System

MBTI and Enneagram are downstream of wound and age, but they cascade forward strongly into behavior. Roll them together and read them together.

```
MBTI + ENNEAGRAM ↔ (read as a pair — they modify each other)
 ├── → Emotional Register (type shadow = default affective state under stress)
 ├── → Self-Care Mechanism (type-consistent coping; note when self-care perpetuates the wound)
 ├── → Flaw (type shadow as flaw expression)
 ├── → Voice Fingerprint (Speech Rhythm · Vocabulary Register · Dialogue Tic · Defensive Speech Pattern — MBTI type + Enneagram shadow determine the pressure-mode voice; see `Characters/Development/character-voice.md`)
 └── → Moral Alignment (some combinations have strong alignment affinities — note, do not dictate)
```

---

## Secondary Cascade: Wound → Character Core

```
WOUND
 ├── → Flaw (must be a plausible psychological origin)
 │    └── → Virtue (genuine tension counterpart — not the flaw's opposite; its shadow)
 ├── → Self-Care Mechanism (what they reach for; may perpetuate the wound)
 ├── → Life Philosophy (wound shapes what they believe is true about the world)
 ├── → Enneagram type shadow (same wound, different type = different scar tissue)
 ├── → Voice Fingerprint (Dialogue Tic + Defensive Speech Pattern + Subtext Default — wound determines what the character routes around in speech, what they cannot say directly, and how they deflect under pressure; see `Characters/Development/character-voice.md`)
 └── ↔ Emotional Register (see bidirectional loops below)
```

The coherence test: Wound → Flaw → Virtue must form a psychologically traceable line. If a therapist couldn't trace wound to flaw, re-roll the flaw. If the virtue is simply the flaw's negation rather than its tension, re-roll the virtue.

---

## Bidirectional Loops

These pairs affect each other in both directions. Neither is strictly upstream.

```
Wound            ↔  Emotional Register     wound maintains the register; register makes the wound invisible
Religion / Faith ↔  Life Philosophy        faith shapes worldview; worldview decides relationship to faith (lapsed, fervent, converted)
Life Status      ↔  Wound                  life events cause wounds; wound drives choices that determine life status
MBTI             ↔  Enneagram              cognitive type shapes fear structure; fear structure shapes how cognitive preferences are expressed
Age              ↔  World Period           character's age in a specific period creates their formative events; world's pressures define what "being young here" meant
Physical Body    ↔  Emotional Register     chronic pain, exhaustion, and illness affect mood; register is worn on the body and read by others
```

---

## Multi-Output Nodes ⊕

Single attributes that fan out simultaneously into multiple downstream attributes. Lock these early; refer back to them as you finalize subsequent rolls.

| Attribute | Simultaneous Downstream Affects |
|---|---|
| Age Range | Physical condition · Life Status · Wound vocabulary · Historical context · Emotional Register |
| World / Historical Period | All social attributes: gender roles · faith context · class mobility · name culture · wound type |
| Wound | Flaw · Virtue · Self-Care · Life Philosophy · Enneagram shadow |
| Moral Alignment | Response to conflict · Character Type eligibility · Relationship to authority · Dialogue register |
| Religion / Faith | Life Philosophy · Life Status (community obligation) · Wound (religious trauma) · Name (cultural tradition) |

---

## Recommended Roll Order

The Master Story Checklist lists attributes in *file reference order*. Use this sequence instead when building any character in Phases 1 or 4:

```
 1.  World / Historical Period          from Phase 3 — already set when Phase 4 begins
 2.  Age Range                          first roll, always — everything downstream reads through this
 3.  Gender                             second roll, always — social context established
 4.  Religion / Faith                   now informed by age + gender + world
 5.  Life Status                        now constrained by what is possible at this age in this world
 6.  Wound                              now has a plausible origin
 7.  Flaw / Virtue                      coherence-check against wound
 8.  MBTI + Enneagram                   together; read in context of wound
 9.  Moral Alignment
10.  Physical Description               now informed by age, life history, world context
11.  Remaining Identity attributes      sexuality, life philosophy, emotional register, zodiac
12.  Character Type                     now you know enough to know what kind of role this person plays
13.  Voice Fingerprint                  all upstream attributes complete; wound + MBTI + Enneagram + background cohere into speech — see `Characters/Development/character-voice.md`
14.  Name                               last — informed by cultural context, gender, and world period
```

---

## Notes

**Age is not fate.** Age Range constrains the *vocabulary* of what is plausible — it does not dictate the specific result. A 78-year-old can roll Athletic / Toned, Commanding presence, no notable distinguishing features. Age sets the frame; the roll still happens inside it.

**Gender is social context, not physical description.** Gender determines what social structures this character has navigated. Physical description is a separate roll. Do not conflate them.

**World period overrides modern defaults.** Attributes like "currently financially stable" or "openly in a same-sex relationship" require plausibility checks against the world period. The character may have these attributes — they just cost something different in different periods.

**Wounds accumulate across cascades.** A character can have multiple wound sources — age-appropriate loss, gender-specific damage, historical trauma in the world's air. The wound roll selects the *dominant wound*; the others become contextual color.

**Cascades are not constraints — they are coherence tools.** The graph exists so that rolls cohere with each other. A result that contradicts its upstream attribute is not automatically wrong — it is a signal to pause and ask whether the contradiction is the character's most interesting feature, or whether it is accidental noise. Keep the tension; remove the noise.
