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
};