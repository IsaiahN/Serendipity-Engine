/**
 * Serendipity | StoryWeaver — Deterministic Randomization Engine
 *
 * Uses datetime-based seeds for reproducible rolls.
 * Seed format: YYYYMMDDHHM (12-digit number)
 * Window extraction: 3-digit sliding window → mod N + 1
 * Seed multiplication: seed × roll_number, last 12 digits
 */

/**
 * Generate a seed from current datetime
 * Format: YYYYMMDDHHMMSS → 14-digit number
 */
export function generateSeed(date = new Date()) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return BigInt(`${y}${mo}${d}${h}${mi}${s}`);
}

/**
 * Parse a seed from string input
 */
export function parseSeed(seedStr) {
  const cleaned = seedStr.replace(/\D/g, '');
  if (cleaned.length < 8) throw new Error('Seed must be at least 8 digits');
  return BigInt(cleaned);
}

/**
 * Core roll function — deterministic random number from seed + roll number
 *
 * @param {BigInt} seed - The base seed
 * @param {number} rollNumber - Which roll this is (1-based)
 * @param {number} max - Maximum value (inclusive, 1-based)
 * @param {number} windowStart - 3-digit window start position (0-based)
 * @returns {{ value: number, derivedSeed: BigInt, window: string }}
 */
export function roll(seed, rollNumber, max, windowStart = 0) {
  // Seed multiplication: seed × rollNumber, take last 12 digits
  const multiplied = seed * BigInt(rollNumber);
  const seedStr = multiplied.toString();
  const last12 = seedStr.slice(-12).padStart(12, '0');

  // Extract 3-digit window
  const start = windowStart % (last12.length - 2);
  const window = last12.substring(start, start + 3);
  const windowNum = parseInt(window, 10);

  // Result: window mod max + 1 (1-based)
  const value = (windowNum % max) + 1;

  return {
    value,
    derivedSeed: BigInt(last12),
    window,
    rawMultiplied: multiplied.toString(),
  };
}

/**
 * Weighted roll — uses d10 threshold system
 * Returns a pool based on rarity tiers
 *
 * @param {BigInt} seed
 * @param {number} rollNumber
 * @param {Array<{ weight: number, pool: any[] }>} tiers - Ordered by weight (high = common)
 * @returns {{ value: any, tier: number, rollResult: object }}
 */
export function weightedRoll(seed, rollNumber, tiers) {
  // First roll determines tier (d10)
  const tierRoll = roll(seed, rollNumber, 10);

  // Accumulate thresholds
  let cumulative = 0;
  let selectedTier = tiers.length - 1; // default to last (rarest)

  for (let i = 0; i < tiers.length; i++) {
    cumulative += tiers[i].weight;
    if (tierRoll.value <= cumulative) {
      selectedTier = i;
      break;
    }
  }

  const pool = tiers[selectedTier].pool;
  // Second roll selects from pool
  const itemRoll = roll(seed, rollNumber * 100 + 1, pool.length);

  return {
    value: pool[itemRoll.value - 1],
    tier: selectedTier,
    tierLabel: tiers[selectedTier].label || `Tier ${selectedTier}`,
    rollResult: tierRoll,
    itemRoll,
  };
}

/**
 * Batch roll — roll multiple attributes in sequence
 *
 * @param {BigInt} seed
 * @param {Array<{ name: string, max: number, options?: string[] }>} attributes
 * @returns {Array<{ name: string, rollResult: object, value: number|string }>}
 */
export function batchRoll(seed, attributes) {
  return attributes.map((attr, index) => {
    const rollNumber = index + 1;
    const max = attr.options ? attr.options.length : attr.max;
    const result = roll(seed, rollNumber, max, index);

    return {
      name: attr.name,
      rollResult: result,
      value: attr.options ? attr.options[result.value - 1] : result.value,
      rawValue: result.value,
    };
  });
}

/**
 * Roll log entry — for audit trail
 */
export function createRollLog(rollResult, context) {
  return {
    timestamp: Date.now(),
    context, // e.g., "character:elena:enneagram"
    ...rollResult,
  };
}

/**
 * Check for emdash characters in text (Golden Rule #1)
 * Returns cleaned text with replacements
 */
export function removeEmdashes(text) {
  return text
    .replace(/\u2014/g, ', ') // em dash
    .replace(/\u2013/g, ', '); // en dash
}
