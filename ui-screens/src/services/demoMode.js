/**
 * Serendipity Engine — Demo Mode Service
 *
 * Provides a pre-populated "The Shunning Season" project for exploration
 * without requiring an API key. When activated, injects the complete project
 * into the project store.
 */

export const DEMO_PROJECT_DATA = {
  metadata: {
    title: 'The Shunning Season',
    medium: 'novel',
    genre: 'Literary Fiction + Thriller',
    seed: '20260222143052',
  },

  files: {
    'author.md': `# Author: Isaiah

## Wound
Isaiah carries the weight of watching community orthodoxy silence uncomfortable truths. He grew up in a world where dissent meant exile—and he's internalized that fear even as an adult writer seeking to tell stories that question.

## Flaw
He tends to rationalize away moral ambiguity rather than sit with it. When writing scenes of judgment, he finds himself defending the wrong characters or leaving ethical tensions unresolved.

## Virtue
Isaiah possesses unusual empathy for people caught between worlds. He doesn't write villains; he writes humans trapped in systems that reward conformity.

## Big Picture Statement
A community's survival and a person's integrity cannot coexist when truth-telling is defined as betrayal.
`,

    'narrator.md': `# Narrator

## Point of View
Third-person limited, close to Elena Yoder (protagonist). We move through scenes in her consciousness—her observations, doubts, and small rebellions are the lens through which we see the Amish settlement and its pressures.

## Voice & Reliability
A measured, observant voice that notices small details: the way Marcus's jaw tightens when challenged, how Priya's laugh changes when her mother enters the room. The narrator is reliable but constrained—she can only know what Elena knows, feel what Elena permits herself to feel.

## Tense
Present tense. This immediacy traps the reader alongside Elena, experiencing each confrontation as it unfolds rather than as memory.

## Character Positioning
The narrator is intimate with Elena's interior life but maintains the cool distance of someone documenting a community from within. There's a subtle irony in this voice—a recognition of contradiction without judgment.
`,

    'world/world-building.md': `# World: Lancaster County

## Setting
Rural Lancaster County, Pennsylvania, 1987. A Mennonite settlement of approximately 400 families spread across farmland dotted with buggies, simple white houses, and church buildings. The nearest town (Ephrata) is 12 miles away; the nearest city (Philadelphia) feels like another country.

## Governance & Law
The community follows Ordnung (unwritten but enforced rules) more stringently than state law. Discipline is administered through the bishop and ministers. The formal legal system exists but is viewed as a last resort—seen as worldly and corrupt.

## Economic Life
Subsistence farming dominates, though some families run bakeries, carpentry shops, and quilting operations. The outside world is creeping in: young people are drawn to construction work and trade jobs that pay better than farming. This economic pressure is slowly fracturing the community's cohesion.

## Themes & Values
Humility, obedience, separation from worldly corruption, interdependence. But beneath the surface: gossip operates as currency; family reputation determines social standing; secrets are kept not for discretion but for preservation.

## Sensory Texture
The smell of fresh bread and horse manure. The sound of buggies on gravel roads. The sight of children in hand-sewn clothes, playing games without electricity or machinery. A landscape of order that masks internal turbulence.
`,

    'outline.md': `# Story Outline: The Shunning Season

## Act One: Rupture (Chapters 1–4)
Elena Yoder discovers Marcus Beiler (the bishop's son) is using community funds for personal debts. She confronts him privately. He denies it, then threatens her silence through insinuation. Elena seeks counsel from Priya (childhood friend, now a nurse in the city), who encourages her to speak up. Elena brings evidence to her father, the assistant minister. The bishop learns of the accusation and preemptively frames Elena as a troublemaker spreading lies.

## Act Two: Isolation (Chapters 5–8)
Elena is gradually shunned—not formally, but through omission. She's not invited to quilting circles. Her siblings are discouraged from speaking to her. The church treats her as suspect. Marcus spreads counter-narratives: Elena is jealous of his family's status, emotionally unstable, influenced by her "worldly" friendship with Priya. Elena realizes her father has chosen institutional loyalty over his daughter. She writes a letter detailing Marcus's financial crimes and the bishop's cover-up, intending to send it to the Ephrata police.

## Act Three: Reckoning (Chapters 9–12)
Elena's letter is intercepted. The bishop convenes a formal shunning ceremony. Elena is given a choice: recant, ask forgiveness, accept punishment—or leave forever. She chooses to leave. The final chapter traces her journey: a motel room in Ephrata, phone calls with Priya (who offers shelter), and a letter to her family explaining that some truths demand exile. The ending is ambiguous—liberation and loss interwoven.
`,

    'story/arc.md': `# Character Arc: Elena Yoder

## Status Quo (Act One)
Elena occupies a privileged position: respected minister's daughter, good seamstress, trusted confidante. She operates within the system and is rewarded for compliance.

## Inciting Incident
She witnesses Marcus's financial dishonesty. For the first time, loyalty to truth conflicts with loyalty to community. She chooses truth.

## Escalation
The community systematically isolates her. Each chapter tightens the noose. She moves from confusion ("Why is this happening?") to clarity ("The system requires my silence or my disappearance").

## Crisis
The shunning ceremony forces a final choice. Stay and lie, or leave and live authentically.

## Resolution
Elena leaves. The victory is pyrrhic—she's free but homeless, separated from family, culturally displaced. But she is no longer complicit.

## MBTI: INFJ
Introspective (I), values-driven (F), structured but adaptable (J). Elena sees the system's injustice early and acts according to her principles—at great cost.
`,

    'characters/elena.md': `# Elena Yoder (Protagonist)

## Profile
Age 26. The eldest daughter of David Yoder, assistant minister. Skilled seamstress; known for meticulous quilting patterns. Quiet but thoughtful, often observing before speaking. She moved back to the community after a brief, discouraged attempt at "rumspringa" (exploration in the wider world).

## Wound
She internalized her mother's death (when Elena was 16) as a failure of her own faith. Since then, she's overcompensated by being the "good daughter"—obedient, dutiful, invisible. Her mother's absence created a void that the community filled with expectations.

## Flaw
She struggles to advocate for herself. When confronted, she freezes. She cares too much about being perceived as reasonable, even when reason is being weaponized against her.

## Virtue
Elena has a moral spine forged in quietness. When action becomes unavoidable, she acts with clarity and courage.

## Somatic Signature
She fidgets with seams in her skirt when anxious. She has a small scar on her left hand from a quilting accident as a child—a private reminder of imperfection hidden beneath order.

## Relationship to Narrator
We are closest to Elena's consciousness. Her doubts are our doubts.
`,

    'characters/marcus.md': `# Marcus Beiler (Antagonist)

## Profile
Age 29. The bishop's eldest son. Charismatic and charming in public; calculating in private. He was positioned to inherit authority within the community but is increasingly drawn to worldly wealth and status. He moves between both worlds without committing to either.

## Wound
His father's love is conditional on unquestioning obedience. Marcus learned early that survival meant mastery—of people, systems, narratives. He cannot imagine a life where he's not in control.

## Flaw
He mistakes manipulation for leadership. He assumes everyone operates from self-interest and positions himself accordingly. He cannot conceive of Elena's refusal to be silenced as anything other than personal vendetta.

## Virtue
Marcus is intelligent and resourceful. Under different circumstances, he could be a bridge between tradition and change. Instead, he's a parasite on both systems.

## Somatic Signature
He has his father's heavy jaw but his mother's thin smile. He speaks with deliberate slowness when lying, creating an impression of thoughtfulness.

## MBTI: ENTJ
Strategic, commanding, impatient with inefficiency. He sees Elena as a problem to be solved, not a person to be reckoned with.
`,

    'characters/priya.md': `# Priya Troyer (Confidante)

## Profile
Age 26. Childhood friend of Elena's. She left the community at age 18 and now works as a nurse in Ephrata. She maintains connection to the community through family visits but is no longer bound by its rules. She's Elena's window to the outside world and her emotional anchor during the crisis.

## Role in Story
Priya encourages Elena to speak up, offers her shelter after the shunning, and provides perspective on what's at stake. She's not the hero of the story—Elena is—but she enables Elena's choice to act.

## Complexity
Priya carries guilt about leaving. She sometimes romanticizes the community she rejected and is surprised by its cruelty when it reasserts itself through Elena's exile.

## MBTI: ENFP
Intuitive, emotionally intelligent, adaptable. She reads situations quickly and responds with warmth, though she lacks Elena's patience for nuance.
`,

    'relationships/questions-answered.md': `# Relationship Dynamics

## Elena ↔ Marcus
**Attachment Style:** Elena seeks connection; Marcus seeks control. Initially, Elena trusts Marcus (they're part of the same community hierarchy). Marcus misreads her trust as manipulability.

**Emotional Texture:** Elena experiences this as betrayal—a trusted peer turning against her. Marcus experiences Elena's refusal to be silenced as a personal threat.

**Arc:** From implicit hierarchy to irreconcilable opposition. By the end, they are enemies not because of malice but because their integrity requires it.

## Elena ↔ Priya
**Attachment Style:** Elena depends on Priya emotionally; Priya depends on Elena for connection to her past. There's mutual investment.

**Emotional Texture:** Warmth, understanding, occasional friction when Priya's worldly perspective clashes with Elena's internal doubts.

**Arc:** Strengthened through crisis. Priya's offer of shelter transforms their friendship into true alliance.

## Marcus ↔ Elena's Father (David)
**Unspoken but Critical:** David chooses institutional stability over his daughter. Marcus understands this choice and exploits it.

**Why It Matters:** Elena's isolation is complete when her father aligns with the bishop. She loses not just community but family.

## Community as Character
The settlement itself functions as an antagonist. It's not evil—it's self-preserving. The pressure to maintain harmony and reputation creates conditions where truth becomes expendable.
`,

    'story/chapter-1.md': `# Chapter 1: The Bridge

The creek ran low that September, and Elena could cross it without soaking her skirt—could step stone to stone the way she had since childhood, before her mother died, before faith became a daily negotiation. The morning was cool enough to see her breath. She held the wool of her coat close.

The Beiler property stretched north of the creek: white house with black shutters, barn painted the same muted palette as every other Amish structure. Three generations of efficiency. Marcus would be in the workshop behind the barn. He was always there by dawn, doing what he called "inventory"—taking stock of tools, materials, the infrastructure of his father's empire.

Elena had rehearsed this walk a hundred times. Had written scripts in the margin of her quilting patterns, sentences she wouldn't speak aloud but needed to organize in her mind first. *Marcus, I know what you've done.* No. Too accusatory. *I found the ledger. We need to talk about it.* Better. Neutral. A conversation between reasonable people.

The bridge—what they called the crossing, though it was barely a bridge, just wood planks lashed together by her grandfather fifty years ago—was only twenty paces away. Elena stopped.

She could still turn back. Could fold this knowledge into the same careful compartment where she kept her doubts about the bishop's sermons, the way the community celebrated forgiveness while practicing judgment, the small ways that humility became a tool for erasure. She was good at compartments. Twenty-six years of practice.

But the ledger was still in the hidden pocket of her work apron, tucked inside the linen fold where she kept her quilting scissors. She felt it like a stone in her chest.

Marcus had been careless. Or arrogant. Or—this was the possibility that frightened her most—he had been careless precisely because he believed nobody would check. Believed that the bishop's son was beyond scrutiny.

Elena stepped onto the bridge. The wood groaned beneath her. She thought of her mother, dead ten years, who had taught her that some things broke quietly, from the inside first.
`,

    'story/chapter-1-summary.md': `# Chapter 1 Summary: The Bridge

Elena Yoder crosses the creek between her family's property and the Beiler farm, having discovered financial discrepancies in Marcus Beiler's ledger. She's rehearsed her confrontation but is uncertain of how to proceed. As she crosses, she reflects on her habitual avoidance of community conflict and the knowledge that her family has trained her to ignore—or at least stay silent about—institutional corruption.

The chapter establishes Elena's moral clarity alongside her fear, and introduces the physical world of the settlement: a landscape of visible order hiding internal strain.
`,

    'story/chapter-1-notes.md': `# Chapter 1: Post-Flight Notes

## What Worked
- The opening image of the low creek is a strong entry point. It's specific, sensory, and thematically resonant (things running low, the ability to cross without harm).
- Elena's internal rehearsal of the confrontation reveals character without exposition.
- The connection to her dead mother is earned and deepens the emotional stakes.
- The bridge as metaphor (literal and figurative threshold) is working.

## What Needs Attention
- The pacing is slow; consider tightening the final two paragraphs to increase tension as she approaches the confrontation.
- The phrase "before faith became a daily negotiation" is slightly on-the-nose. Trust the reader to sense the complexity without stating it.

## Next Steps
Chapter 2 should begin with the confrontation itself—don't delay. Elena's arrival at the workshop, Marcus's initial reaction (surprise shifting to something else), the moment of accusation.
`,

    'phaseAnswers': {
      author: {
        '_total': 5,
        'wound': 'Internalized the fear that dissent means exile',
        'flaw': 'Rationalizes moral ambiguity rather than confronting it',
        'virtue': 'Unusual empathy for people caught between worlds',
        'bps': 'A community\'s survival and a person\'s integrity cannot coexist when truth-telling is defined as betrayal',
      },
      narrator: {
        '_total': 4,
        'pov': 'Third-person limited, close to Elena',
        'voice': 'Measured, observant, subtly ironic',
        'tense': 'Present tense',
        'reliability': 'Reliable but constrained to Elena\'s knowledge',
      },
      world: {
        '_total': 5,
        'setting': 'Rural Lancaster County, PA, 1987',
        'governance': 'Ordnung (unwritten rules) enforced by bishop',
        'economy': 'Subsistence farming, trade, small businesses',
        'themes': 'Humility, obedience, but also reputation and secrecy',
        'sensory': 'Bread, horse manure, buggies, hand-sewn order',
      },
      characters: {
        '_total': 3,
        'elena_wound': 'Internalized mother\'s death as failure of faith',
        'marcus_wound': 'Father\'s conditional love based on obedience',
        'priya_role': 'Window to outside world, emotional anchor',
      },
      relationships: {
        '_total': 4,
        'elena_marcus': 'Trust betrayed into irreconcilable opposition',
        'elena_priya': 'Mutual dependency strengthened through crisis',
        'marcus_david': 'David chooses institutional loyalty over daughter',
        'community': 'Settlement is antagonist, self-preserving not evil',
      },
      story: {
        '_total': 3,
        'arc': 'Elena moves from compliance to integrity to exile',
        'three_act': 'Rupture (ch 1–4), Isolation (ch 5–8), Reckoning (ch 9–12)',
        'ending': 'Ambiguous: liberation and loss interwoven',
      },
    },
  },
};

/**
 * Activate demo mode: inject the demo project into the project store
 */
export async function activateDemoMode(projectStore) {
  try {
    // Create the project with metadata
    const project = await projectStore.createProject({
      title: DEMO_PROJECT_DATA.metadata.title,
      medium: DEMO_PROJECT_DATA.metadata.medium,
      genre: DEMO_PROJECT_DATA.metadata.genre,
      seed: DEMO_PROJECT_DATA.metadata.seed,
      metadata: {
        isDemo: true,
        demoActivatedAt: Date.now(),
      },
    });

    // Inject all files
    for (const [path, content] of Object.entries(DEMO_PROJECT_DATA.files)) {
      if (path !== 'phaseAnswers') {
        await projectStore.updateFile(project.id, path, content);
      }
    }

    // Inject phase answers
    await projectStore.setPhaseAnswers(
      project.id,
      DEMO_PROJECT_DATA.files.phaseAnswers
    );

    // Compute phase progress
    await projectStore.computeProjectHealth(project.id);

    // Mark demo as active in settings
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('demoModeActive', 'true');
      localStorage.setItem('demoProjectId', project.id);
    }

    return project;
  } catch (err) {
    console.error('Failed to activate demo mode:', err);
    throw err;
  }
}

/**
 * Check if demo mode is currently active
 */
export async function isDemoActive() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  return localStorage.getItem('demoModeActive') === 'true';
}

/**
 * Get the ID of the active demo project (if any)
 */
export function getDemoProjectId() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  return localStorage.getItem('demoProjectId');
}

/**
 * Deactivate demo mode and optionally delete the demo project
 */
export async function deactivateDemoMode(projectStore, deleteProject = false) {
  try {
    const demoId = getDemoProjectId();

    if (deleteProject && demoId) {
      await projectStore.deleteProject(demoId);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('demoModeActive');
      localStorage.removeItem('demoProjectId');
    }

    return true;
  } catch (err) {
    console.error('Failed to deactivate demo mode:', err);
    throw err;
  }
}
