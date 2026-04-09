/**
 * characterOptions.js
 * Static option lists for character attribute editing dropdowns.
 * Sourced from Characters/ markdown reference files.
 */

export const ALIGNMENT_VALUES = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const GENDER_OPTIONS = [
  'Female', 'Male',
  'Cis female', 'Cis male', 'Cis man', 'Cis woman', 'Cisgender',
  'Woman', 'Man',
  'Non-binary', 'Agender', 'Bigender', 'Genderfluid', 'Genderqueer',
  'Transgender', 'Trans female', 'Trans male', 'Trans man', 'Trans woman',
  'Two spirit', 'Intersex', 'Androgynous', 'Demi-boy', 'Demi-girl',
  'Gender nonconforming', 'Pangender', 'Third gender', 'Neutrois',
  'Genderflux', 'Maverique', 'Queer', 'Gender questioning',
  'Faʻafafine', 'Hijra', 'Kathoey', 'Māhū', 'Muxe', 'Bakla',
];

export const RELIGION_OPTIONS = [
  'agnosticism', 'Amish', 'ancestor worship', 'animism', 'Asatrú', 'atheism',
  'Bahá\'í Faith', 'Buddhism', 'Celtic Paganism', 'Christianity', 'Confucianism',
  'deism', 'Druidism', 'Druze', 'dualism', 'Gnosticism', 'Hare Krishna',
  'Heathenism', 'Hinduism', 'Humanism', 'Islam', 'Jainism', 'Jehovah\'s Witnesses',
  'Judaism', 'Mennonite', 'monotheism', 'Mormonism', 'Mysticism',
  'Native American Church', 'New Age', 'no religion', 'occultism', 'Paganism',
  'pantheism', 'polytheism', 'Rastafarian', 'Santería', 'Satanism',
  'Scientology', 'Shamanism', 'Shinto', 'Sikhism', 'Spiritualism',
  'Taoism', 'theism', 'Thelema', 'Theosophy', 'Unitarianism',
  'universalism', 'Voodoo', 'Wicca', 'Witchcraft', 'Zen Buddhism', 'Zoroastrianism',
];

export const SEXUALITY_OPTIONS = [
  'Heterosexual / Straight', 'Homosexual', 'Bisexual', 'Pansexual', 'Asexual',
  'Demisexual', 'Gay', 'Lesbian', 'Queer', 'Questioning', 'Fluid',
  'Aromantic', 'Biromantic', 'Demiromantic', 'Panromantic',
  'Androsexual', 'Gynesexual', 'Omnisexual', 'Polysexual', 'Sapiosexual',
  'Skoliosexual', 'Graysexual', 'Bicurious', 'Closeted', 'Spectrasexual',
];

export const LIFE_PHILOSOPHY_OPTIONS = [
  'Stoicism', 'Epicureanism', 'Existentialism', 'Absurdism', 'Nihilism',
  'Pragmatism', 'Utilitarianism', 'Hedonism', 'Kantianism / Deontology',
  'Virtue Ethics', 'Rationalism', 'Empiricism',
  'Buddhism', 'Taoism', 'Confucianism', 'Hinduism (Advaita / Dharmic)',
  'Zen', 'Shinto', 'Sufism', 'Ubuntu',
  'Humanism', 'Secular spirituality', 'Optimism', 'Pessimism', 'Cynicism',
  'Fatalism', 'Determinism', 'Moral relativism', 'Tribalism', 'Romanticism',
  'Minimalism', 'Individualism', 'Collectivism', 'Intersectionality',
];

export const EMOTIONAL_REGISTER_OPTIONS = [
  // ── Primary Registers (from emotional-register.md) ──
  'Euphoric', 'Joyful', 'Hopeful', 'Tender', 'Nostalgic', 'Melancholic',
  'Somber', 'Wistful', 'Pensive', 'Anxious', 'Tense', 'Restless',
  'Desperate', 'Angry', 'Bitter', 'Numb', 'Despairing',
  'Darkly Humorous', 'Sardonic', 'Playful',
  // ── Extended Registers (from emotions.md) ──
  // Warm / Positive
  'Serene', 'Content', 'Compassionate', 'Devoted', 'Grateful',
  'Radiant', 'Buoyant', 'Carefree', 'Spirited', 'Resolute',
  // Cool / Withdrawn
  'Detached', 'Aloof', 'Resigned', 'Stoic', 'Withdrawn',
  'Guarded', 'Indifferent', 'Contemplative', 'Meditative', 'Subdued',
  // Dark / Intense
  'Brooding', 'Haunted', 'Anguished', 'Seething', 'Volatile',
  'Tormented', 'Grieving', 'Desolate', 'Vindictive', 'Wrathful',
  // Complex / Layered
  'Bittersweet', 'Conflicted', 'Defiant', 'Emboldened', 'World-weary',
  'Suspicious', 'Reverent', 'Vulnerable', 'Yearning', 'Manic',
  // Social / Relational
  'Envious', 'Territorial', 'Protective', 'Deferential', 'Haughty',
  'Insecure', 'Needy', 'Nurturing', 'Distrustful', 'Possessive',
];

export const RELATIONSHIP_STATUS_OPTIONS = [
  'Single — never seriously involved', 'Single — recently out of a long-term relationship',
  'Single — burned; has closed themselves off', 'Single — by choice',
  'Single — wants partnership but hasn\'t found it',
  'Casually dating', 'Dating — short-term', 'Dating — long-term', 'Dating — long-distance',
  'In a committed relationship — unmarried', 'Engaged',
  'Married — early years', 'Married — established', 'Married — strained', 'Married — unhappy',
  'Separated — recently', 'Separated — long-term',
  'Divorced — recently', 'Divorced — healed', 'Divorced — bitter',
  'Widowed — recently', 'Widowed — years ago',
  'Open relationship / Ethical non-monogamy', 'Polyamorous', 'Complicated / Undefined',
];

export const PARENTAL_STATUS_OPTIONS = [
  'No children', 'Pregnant / expecting', 'Parent of 1 child', 'Parent of 2 children',
  'Parent of 3 children', 'Parent of 4+ children', 'Raising children alone',
  'Co-parenting — cooperative', 'Co-parenting — contentious',
  'Estranged from one or more children', 'Stepparent', 'Adoptive parent', 'Foster parent',
  'Lost a child — grief still present', 'Lost a child — years ago',
  'Childless by choice (Child-Free)', 'Childless — wanted children, didn\'t happen',
];

export const LIVING_SITUATION_OPTIONS = [
  'Lives alone', 'Lives with a romantic partner', 'Lives with family',
  'Lives with children', 'Lives with roommates', 'Lives communally',
  'Homeless or transitionally housed', 'Recently moved', 'Long-term home',
];

export const FINANCIAL_UPBRINGING_OPTIONS = [
  'Generational wealth', 'Upper class', 'Upper-middle class', 'Middle class',
  'Lower-middle class', 'Working class', 'Working poor', 'Poverty',
  'Scrappy / hustle-born', 'Boom-and-bust', 'Immigrant household',
  'Farm / rural', 'Financially chaotic',
];

export const CURRENT_FINANCIAL_OPTIONS = [
  'Generational wealth — inherited', 'Wealthy — self-made or married into it',
  'Upper-middle class', 'Solidly middle class', 'Getting by — paycheck to paycheck',
  'Financially stretched', 'In debt', 'Deeply in debt',
  'Recovering from financial collapse', 'Recently came into money',
  'Downwardly mobile', 'Upwardly mobile', 'Financially dependent',
  'Financially supporting others', 'Entrepreneur / self-employed',
];

export const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export const ENNEAGRAM_OPTIONS = [
  '1w9', '1w2', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5',
  '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1',
];

export const HAIR_COLOR_OPTIONS = [
  // ── Common / Natural ──
  'Black', 'Dark Brown', 'Medium Brown', 'Light Brown', 'Chestnut',
  'Dirty Blonde', 'Blonde', 'Golden Blonde', 'Platinum Blonde',
  'Strawberry Blonde', 'Auburn', 'Copper', 'Ginger', 'Red', 'Dark Red',
  // ── Aging / Gray ──
  'Gray', 'Salt-and-Pepper', 'White', 'Silver',
  // ── Special ──
  'Bald / No Hair',
  'Dyed — Unnatural Color',
  // ── Texture (combine with color) ──
  'Straight', 'Wavy', 'Loose Curly', 'Tight Curly', 'Coily / Kinky', 'Frizzy',
  // ── Length (combine with color) ──
  'Bald / Shaved', 'Buzzed', 'Very Short', 'Short', 'Ear-Length',
  'Jaw-Length / Bob', 'Shoulder-Length', 'Mid-Back', 'Long', 'Very Long',
];

export const EYE_COLOR_OPTIONS = [
  // ── Basic / Common ──
  'Brown', 'Dark Brown', 'Light Brown',
  'Blue', 'Light Blue', 'Bright Blue',
  'Green', 'Gray', 'Black',
  // ── Descriptive / Blended ──
  'Hazel', 'Amber', 'Golden Brown',
  'Gray-Green', 'Blue-Gray', 'Blue with flecks',
  // ── Literary / Evocative ──
  'Azure', 'Cerulean', 'Sapphire', 'Ice Blue',
  'Emerald', 'Jade', 'Moss Green', 'Sea Green',
  'Chestnut', 'Mahogany', 'Tawny', 'Honey',
  'Slate', 'Steel Gray', 'Pewter', 'Charcoal',
  'Violet', 'Lavender',
  'Obsidian', 'Onyx',
  // ── Rare / Special ──
  'Heterochromia (two different colors)',
  'Albino / Pale Pink-Red',
  'Very Dark Brown', 'Medium Brown',
];

export const BUILD_OPTIONS = [
  // ── From physical-description.md ──
  'Petite', 'Slim / Slender', 'Lean / Wiry', 'Athletic / Toned',
  'Average / Medium', 'Stocky / Compact', 'Muscular / Broad',
  'Heavyset', 'Curvy / Full-figured', 'Large / Stout',
  'Gaunt / Bony', 'Lanky / Willowy',
  // ── Feminine-coded ──
  'Dainty', 'Waif-like', 'Lithe', 'Svelte', 'Statuesque',
  'Voluptuous', 'Hourglass', 'Willowy', 'Delicate', 'Elfin',
  'Pixie-like', 'Soft', 'Rounded',
  // ── Masculine-coded ──
  'Burly', 'Brawny', 'Barrel-chested', 'Strapping', 'Hulking',
  'Rugged', 'Thick-necked', 'Square-shouldered', 'Bull-like',
  'Imposing', 'Towering', 'Ox-like',
  // ── Unisex / Neutral ──
  'Lean', 'Wiry', 'Compact', 'Sturdy', 'Solid', 'Rangy',
  'Sinewy', 'Nimble', 'Gangly', 'Angular', 'Rawboned',
  'Broad-shouldered', 'Narrow-framed', 'Long-limbed',
  // ── Flattering / Literary ──
  'Sculpted', 'Chiseled', 'Graceful', 'Elegant', 'Powerful',
  'Striking', 'Commanding', 'Regal', 'Well-proportioned',
  // ── Unflattering / Realistic ──
  'Scrawny', 'Squat', 'Flabby', 'Pudgy', 'Dumpy', 'Paunchy',
  'Spindly', 'Frail', 'Sunken', 'Withered', 'Bloated',
  'Soft-bellied', 'Hunched', 'Stooped',
];

// Generate heights from 3'0" to 7'11" for dropdown
export const HEIGHT_OPTIONS = (() => {
  const heights = [];
  for (let ft = 3; ft <= 7; ft++) {
    for (let inch = 0; inch <= 11; inch++) {
      heights.push(`${ft}'${inch}"`);
    }
  }
  return heights;
})();

export const CHARACTER_TYPE_OPTIONS = [
  'Hero / Heroine', 'Antihero / Antiheroine', 'Tragic hero', 'Main protagonist', 'Villain protagonist',
  'Villain (foiling protagonist)', 'Villain (unrelated to protagonist)',
  'Antagonist who is not evil', 'Antihero as antagonist', 'Non-personal antagonist',
  'Supporting protagonist', 'Mentor', 'Sidekick / Companion', 'Foil', 'Love interest',
  'Threshold guardian', 'Herald', 'Shapeshifter', 'Trickster',
];

// ── Group Character Options (with descriptions) ──

export const COMPOSITION_OPTIONS = [
  // ── Demographic Makeup ──
  { value: 'Homogeneous community', desc: 'Members share ethnicity, religion, class, or culture — sameness is the glue' },
  { value: 'Multi-ethnic enclave', desc: 'Diverse ethnic backgrounds united by geography or shared circumstance' },
  { value: 'Multi-generational family', desc: 'Three or more generations living, working, or operating as a unit' },
  { value: 'Nuclear family unit', desc: 'Parents and children; the smallest family structure' },
  { value: 'Extended kinship network', desc: 'Cousins, in-laws, elders — family defined broadly, not just by blood' },
  { value: 'Chosen family / Found family', desc: 'Non-biological bonds that function as family — forged by loyalty, not lineage' },
  // ── Organizational Structure ──
  { value: 'Religious order / Congregation', desc: 'Bound by shared faith, ritual, and doctrine' },
  { value: 'Monastic community', desc: 'Cloistered or semi-cloistered; daily life organized around spiritual discipline' },
  { value: 'Cult or high-control group', desc: 'Tightly controlled by charismatic leadership; exit is punished or forbidden' },
  { value: 'Military unit / Regiment', desc: 'Rank-structured, mission-driven; identity defined by service' },
  { value: 'Paramilitary or militia', desc: 'Armed group outside official military — ideological, territorial, or defensive' },
  { value: 'Criminal organization / Gang', desc: 'Hierarchy built on loyalty, fear, territory, and illegal enterprise' },
  { value: 'Secret society', desc: 'Hidden membership, ritualized entry, shared forbidden knowledge' },
  { value: 'Corporate entity / Company', desc: 'Bound by employment; power follows org chart, money, and politics' },
  { value: 'Labor union / Workers\' collective', desc: 'Organized around shared labor interests and collective bargaining' },
  { value: 'Political faction / Party', desc: 'United by ideology, platform, or pursuit of political power' },
  { value: 'Activist cell / Resistance movement', desc: 'Small, mission-driven group working toward systemic change or revolution' },
  // ── Community Types ──
  { value: 'Neighborhood / Block', desc: 'Geographic proximity is the bond — shared streets, noise, and gossip' },
  { value: 'Small town / Village', desc: 'Everyone knows everyone; reputation travels fast' },
  { value: 'Nomadic tribe / Traveling group', desc: 'Movement defines them — caravan, migration, or rootless wandering' },
  { value: 'Diaspora community', desc: 'Scattered from homeland; identity preserved through memory, language, food' },
  { value: 'Refugee population', desc: 'Displaced by force — survival and impermanence shape every decision' },
  { value: 'Commune / Intentional community', desc: 'Voluntarily formed around shared values; may share resources, labor, land' },
  { value: 'Online community / Digital collective', desc: 'Connected by platform and interest, not geography' },
  // ── Social Groups ──
  { value: 'Friend group / Social circle', desc: 'Informal bond — shared history, inside jokes, unspoken rules' },
  { value: 'School / University cohort', desc: 'Same institution, same pressures — grades, cliques, coming-of-age' },
  { value: 'Professional guild / Trade group', desc: 'United by craft or profession — shared skills, standards, rivalries' },
  { value: 'Athletic team / Sports club', desc: 'Bonded by competition, training, and collective performance' },
  { value: 'Artistic collective / Band', desc: 'Creative collaboration as identity — shared aesthetic or mission' },
  // ── Mixed / Complex ──
  { value: 'Mixed demographics — unified by cause', desc: 'Diverse members, single shared mission that overrides differences' },
  { value: 'Mixed demographics — fractured', desc: 'Diverse members with internal fault lines — class, race, belief, or power' },
  { value: 'Stratified society', desc: 'Rigid internal hierarchy — caste, class, rank, or birthright' },
  { value: 'Loose confederation', desc: 'Autonomous subgroups cooperating loosely — fragile unity' },
  { value: 'Symbiotic pair / Dyad', desc: 'Two entities or factions that depend on each other, willingly or not' },
];

export const POWER_DYNAMIC_OPTIONS = [
  // ── Hierarchical ──
  { value: 'Patriarchal hierarchy', desc: 'Men hold formal authority; women\'s power is informal or suppressed' },
  { value: 'Matriarchal hierarchy', desc: 'Women hold formal authority; lineage and property pass through mothers' },
  { value: 'Elder-led council', desc: 'Authority rests with the oldest members — wisdom over strength' },
  { value: 'Theocratic rule', desc: 'Religious leaders hold temporal power; God\'s will is law' },
  { value: 'Autocratic / Single leader', desc: 'One person holds absolute or near-absolute power' },
  { value: 'Oligarchy / Inner circle', desc: 'A small elite makes decisions for everyone' },
  { value: 'Feudal / Lord-vassal', desc: 'Layered loyalty — protection exchanged for service and obedience' },
  { value: 'Military chain of command', desc: 'Strict rank structure; orders flow down, obedience flows up' },
  { value: 'Caste-based', desc: 'Birth determines rank permanently; mobility is forbidden or nearly impossible' },
  { value: 'Meritocratic hierarchy', desc: 'Power earned through achievement — but "merit" is defined by those on top' },
  // ── Distributed / Shared ──
  { value: 'Egalitarian / Flat', desc: 'No formal hierarchy; decisions made collectively or by consensus' },
  { value: 'Democratic — majority rule', desc: 'Members vote; the majority decides; minorities may be overridden' },
  { value: 'Consensus-based', desc: 'No action without agreement from all — slow but deeply cohesive' },
  { value: 'Rotating leadership', desc: 'Authority passes between members on a schedule or by situation' },
  { value: 'Council of equals', desc: 'Multiple leaders share power formally — balance maintained by negotiation' },
  { value: 'Anarchic / Self-governing', desc: 'No centralized authority; individuals or small units govern themselves' },
  // ── Informal / Hidden ──
  { value: 'Shadow power / Puppet master', desc: 'Formal leaders are figureheads; real power is held behind the scenes' },
  { value: 'Charismatic authority', desc: 'Power flows from one person\'s personality, vision, or magnetism — not title' },
  { value: 'Wealth-based influence', desc: 'Money talks — the richest members steer decisions regardless of title' },
  { value: 'Knowledge-gatekeeper', desc: 'Power belongs to whoever controls information, secrets, or expertise' },
  { value: 'Fear-based control', desc: 'Compliance through intimidation, punishment, or threat of violence' },
  { value: 'Shame / Honor-based', desc: 'Social pressure and reputation enforce behavior — exile is the ultimate weapon' },
  // ── Contested / Unstable ──
  { value: 'Power vacuum', desc: 'No clear leader — factions jockeying, alliances shifting, instability rising' },
  { value: 'Succession crisis', desc: 'Old leader gone or dying; multiple claimants, no smooth transition' },
  { value: 'Dual authority / Power split', desc: 'Two leaders or factions share power uneasily — collision is inevitable' },
  { value: 'Occupied / Externally controlled', desc: 'True authority is held by an outside force; internal leaders have limited agency' },
  { value: 'Revolution in progress', desc: 'The old order is being actively overthrown — nothing is settled' },
  { value: 'Collapsing hierarchy', desc: 'The structure still exists on paper but nobody obeys it anymore' },
];

export const COLLECTIVE_VOICE_OPTIONS = [
  // ── Unified / Harmonious ──
  { value: 'Unified — monolithic', desc: 'One voice, one message; dissent is invisible or nonexistent' },
  { value: 'Unified — genuine consensus', desc: 'Agreement is real, earned through dialogue; members feel heard' },
  { value: 'Harmonized — rehearsed', desc: 'Unity is performed; everyone knows the script even if they don\'t believe it' },
  { value: 'Ritualized / Liturgical', desc: 'The group speaks through ceremony, chant, prayer, or tradition' },
  { value: 'Proudly defiant', desc: 'The group speaks with collective fury or resistance — "we will not be silenced"' },
  // ── Polyphonic / Many Voices ──
  { value: 'Polyphonic — productive', desc: 'Multiple voices in constructive tension; debate strengthens the group' },
  { value: 'Polyphonic — chaotic', desc: 'Everyone talks, nobody listens; the group can\'t agree on what it stands for' },
  { value: 'Chorus of dissent', desc: 'The dominant voice is complaint, grievance, or opposition' },
  { value: 'Whisper network', desc: 'The real communication happens in private — gossip, warnings, back-channels' },
  { value: 'Generational split', desc: 'Elders and youth speak different languages (literally or figuratively)' },
  // ── Controlled / Suppressed ──
  { value: 'Spokesperson-filtered', desc: 'One person or small group speaks for everyone; individual voices are hidden' },
  { value: 'Propaganda / Party line', desc: 'Official messaging is curated, repeated, enforced — deviation is punished' },
  { value: 'Silent compliance', desc: 'The group goes along but says nothing; obedience without belief' },
  { value: 'Silenced — externally', desc: 'The group\'s voice has been suppressed by outside force — censored, banned, erased' },
  { value: 'Silenced — internally', desc: 'Members self-censor out of fear, shame, or learned helplessness' },
  { value: 'Code-switching', desc: 'The group has a public voice and a private one — what outsiders hear isn\'t the truth' },
  // ── Emerging / Shifting ──
  { value: 'Finding its voice', desc: 'The group is newly formed or recently empowered — still figuring out what it believes' },
  { value: 'Fracturing', desc: 'Once unified, now splintering — competing narratives pulling the group apart' },
  { value: 'Mourning / Elegiac', desc: 'The group voice is defined by collective grief, loss, or remembrance' },
  { value: 'Mythologizing', desc: 'The group narrates its own legend — origin stories, heroes, founding myths' },
  { value: 'Radicalized', desc: 'The voice has hardened — moderate positions abandoned, extremes amplified' },
  // ── Absent / Ambiguous ──
  { value: 'No collective voice', desc: 'Members don\'t identify as a group or refuse to speak as one' },
  { value: 'Contradictory', desc: 'The group says one thing and does another; its voice undermines its actions' },
  { value: 'Evolving / In flux', desc: 'The voice changes depending on circumstances — adaptive but unpredictable' },
];

/** Descriptions shown under field labels on group character cards to explain what each attribute means */
export const FIELD_DESCRIPTIONS = {
  'Composition': 'What is this group made of? Its demographic makeup, organizational structure, and who belongs.',
  'Power Dynamic': 'How power is distributed and exercised within the group — who leads, who obeys, and how.',
  'Collective Voice': 'How the group communicates as a unit — its shared tone, messaging style, and who gets to speak.',
  'Emotional Register': 'The dominant emotional wavelength the group radiates — its collective mood and temperament.',
  'Cost': 'What does belonging to this group cost its members — what they give up, sacrifice, or endure.',
  'Enforcement': 'How the group keeps its members in line — the mechanisms of compliance and punishment.',
  'Blind Spot': 'What this group cannot or refuses to see about itself — its collective denial or ignorance.',
  'Culture Rules': 'The unwritten (or written) rules that govern daily behavior and social expectations.',
  'Group Identity': 'How the group defines itself — its shared symbols, stories, boundaries, and sense of "us."',
  'Internal Tensions': 'The fault lines within the group — suppressed conflicts, rivalries, and contradictions.',
  'External Pressures': 'Forces from outside the group that threaten, shape, or constrain it.',
};

export const ZODIAC_OPTIONS = [
  // ── Western Zodiac ──
  'Aries (Mar 21 – Apr 19)', 'Taurus (Apr 20 – May 20)', 'Gemini (May 21 – Jun 20)',
  'Cancer (Jun 21 – Jul 22)', 'Leo (Jul 23 – Aug 22)', 'Virgo (Aug 23 – Sep 22)',
  'Libra (Sep 23 – Oct 22)', 'Scorpio (Oct 23 – Nov 21)', 'Sagittarius (Nov 22 – Dec 21)',
  'Capricorn (Dec 22 – Jan 19)', 'Aquarius (Jan 20 – Feb 18)', 'Pisces (Feb 19 – Mar 20)',
  // ── Chinese Zodiac ──
  'Rat (Lunar Calendar)', 'Ox (Lunar Calendar)', 'Tiger (Lunar Calendar)', 'Rabbit (Lunar Calendar)',
  'Dragon (Lunar Calendar)', 'Snake (Lunar Calendar)', 'Horse (Lunar Calendar)', 'Goat (Lunar Calendar)',
  'Monkey (Lunar Calendar)', 'Rooster (Lunar Calendar)', 'Dog (Lunar Calendar)', 'Pig (Lunar Calendar)',
];

// Map field labels to their option arrays for dropdown resolution
export const FIELD_OPTIONS_MAP = {
  'Gender': GENDER_OPTIONS,
  'Sexuality': SEXUALITY_OPTIONS,
  'Religion / Faith': RELIGION_OPTIONS,
  'Life Philosophy': LIFE_PHILOSOPHY_OPTIONS,
  'Emotional Register': EMOTIONAL_REGISTER_OPTIONS,
  'Moral Alignment': ALIGNMENT_VALUES,
  'Relationship Status': RELATIONSHIP_STATUS_OPTIONS,
  'Parental Status': PARENTAL_STATUS_OPTIONS,
  'Living Situation': LIVING_SITUATION_OPTIONS,
  'Financial Upbringing': FINANCIAL_UPBRINGING_OPTIONS,
  'Current Financial': CURRENT_FINANCIAL_OPTIONS,
  'MBTI': MBTI_OPTIONS,
  'Enneagram': ENNEAGRAM_OPTIONS,
  'Character Type': CHARACTER_TYPE_OPTIONS,
  'Build': BUILD_OPTIONS,
  'Height': HEIGHT_OPTIONS,
  'Hair': HAIR_COLOR_OPTIONS,
  'Eyes': EYE_COLOR_OPTIONS,
  'Zodiac': ZODIAC_OPTIONS,
  'Composition': COMPOSITION_OPTIONS,
  'Power Dynamic': POWER_DYNAMIC_OPTIONS,
  'Collective Voice': COLLECTIVE_VOICE_OPTIONS,
};

// Map UI label to the markdown field name for updating files
export const LABEL_TO_FIELD_MAP = {
  'Gender': 'Gender',
  'Sexuality': 'Sexuality',
  'Religion / Faith': 'Religion',
  'Life Philosophy': 'Life Philosophy',
  'Emotional Register': 'Emotional Register',
  'Moral Alignment': 'Moral Alignment',
  'Relationship Status': 'Relationship Status',
  'Parental Status': 'Parental Status',
  'Living Situation': 'Living Situation',
  'Financial Upbringing': 'Financial Upbringing',
  'Current Financial': 'Current Financial Status',
  'Age': 'Age Range',
  'Build': 'Build',
  'Height': 'Height',
  'Hair': 'Hair',
  'Eyes': 'Eyes',
  'Zodiac': 'Zodiac',
  'Tier': 'Tier',
  'MBTI': 'MBTI Type',
  'Enneagram': 'Enneagram',
  'Wound': 'Core Wound',
  'Flaw': 'Core Flaw',
  'Virtue': 'Core Virtue',
  'Want': 'Want',
  'Need': 'Need',
  'Arc': 'Arc',
  'Attachment Style': 'Attachment Style',
  'Core Values': 'Core Values',
  'Personal Code': 'Personal Code',
  'Social Positioning': 'Social Positioning',
  'Network Archetype': 'Network Archetype',
  'Story Death': 'Story Death',
  'Physical Description': 'Physical Description',
  'Arc Type': 'Arc',
  'Story Role': 'Role',
  'Self-Care (Healthy)': 'Healthy Self-Care',
  'Self-Care (Destructive)': 'Destructive Self-Care',
  'Speech Rhythm': 'Speech Rhythm',
  'Vocabulary Register': 'Vocabulary Register',
  'Volume & Pacing': 'Volume & Pacing',
  'Dialogue Tic': 'Dialogue Tic',
  'Metaphor Family': 'Metaphor Family',
  'Defensive Speech': 'Defensive Speech',
  'Subtext Default': 'Subtext Default',
  'Skin': 'Skin',
  'Distinguishing Features': 'Distinguishing Features',
  'Posture & Movement': 'Posture & Movement',
  'Style / Presentation': 'Style / Presentation',
  'Composition': 'Composition',
  'Power Dynamic': 'Power Dynamic',
  'Collective Voice': 'Collective Voice',
  'Cost': 'Cost',
  'Enforcement': 'Enforcement',
  'Blind Spot': 'What It Cannot See',
  'Culture Rules': 'Culture',
  'Group Identity': 'Group Identity',
  'Internal Tensions': 'Internal Tensions',
  'External Pressures': 'External Pressures',
};