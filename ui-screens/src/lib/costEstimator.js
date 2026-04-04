/**
 * Cost Estimation Utility for Serendipity Engine
 *
 * Provides accurate token cost estimates for different AI models.
 * Supports Anthropic Claude, OpenAI GPT, DeepSeek, Google Gemini, and local models.
 */

/**
 * Token cost estimates per 1M tokens (input/output) by model
 * Prices as of early 2025
 */
const MODEL_COSTS = {
  // Anthropic Claude models
  'claude-sonnet-4-5-20250514': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-haiku-3-5-20241022': { input: 0.80, output: 4.0 },
  'claude-opus-4-20250514': { input: 15.0, output: 75.0 },

  // OpenAI models
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },

  // DeepSeek models
  'deepseek-chat': { input: 0.14, output: 0.28 },

  // Google Gemini models (typically free tier or per-minute pricing)
  'gemini-2.0-flash': { input: 0.075, output: 0.3 },
  'gemini-1.5-pro': { input: 1.5, output: 6.0 },

  // Default fallback
  'default': { input: 3.0, output: 15.0 },
};

/**
 * Estimate cost for a given token count and model
 *
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @param {string} model - Model name (e.g., 'claude-sonnet-4-5-20250514')
 * @returns {{ inputCost: number, outputCost: number, totalCost: number }}
 */
export function estimateCost(inputTokens, outputTokens, model = 'default') {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['default'];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

/**
 * Format a cost value as a string
 *
 * @param {number} cost - Cost in dollars
 * @returns {string} Formatted cost (e.g., "$0.05", "<$0.01")
 */
export function formatCost(cost) {
  if (cost < 0.001) return '<$0.001';
  if (cost < 0.01) return `<$0.01`;
  return `$${cost.toFixed(2)}`;
}

/**
 * Format a cost value as a string with specified decimal places
 *
 * @param {number} cost - Cost in dollars
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} Formatted cost
 */
export function formatCostPrecise(cost, decimals = 4) {
  if (cost < 0.0001) return '<$0.0001';
  return `$${cost.toFixed(decimals)}`;
}

/**
 * Calculate total session costs from usage history
 *
 * @param {Array} usageHistory - Array of usage entries with inputTokens, outputTokens, model
 * @returns {number} Total cost in dollars
 */
export function getSessionCosts(usageHistory) {
  let totalCost = 0;
  for (const entry of usageHistory) {
    const { totalCost: entryCost } = estimateCost(
      entry.inputTokens || 0,
      entry.outputTokens || 0,
      entry.model || 'default'
    );
    totalCost += entryCost;
  }
  return totalCost;
}

/**
 * Get a breakdown of costs by model from usage history
 *
 * @param {Array} usageHistory - Array of usage entries
 * @returns {Object} Breakdown by model
 */
export function getSessionCostsByModel(usageHistory) {
  const breakdown = {};
  for (const entry of usageHistory) {
    const model = entry.model || 'unknown';
    if (!breakdown[model]) {
      breakdown[model] = {
        model,
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
        callCount: 0,
      };
    }
    const { totalCost: entryCost } = estimateCost(
      entry.inputTokens || 0,
      entry.outputTokens || 0,
      model
    );
    breakdown[model].inputTokens += entry.inputTokens || 0;
    breakdown[model].outputTokens += entry.outputTokens || 0;
    breakdown[model].totalCost += entryCost;
    breakdown[model].callCount += 1;
  }
  return breakdown;
}

/**
 * Get cost for a single entry
 *
 * @param {Object} entry - Usage entry with inputTokens, outputTokens, model
 * @returns {number} Cost in dollars
 */
export function getEntryCost(entry) {
  const { totalCost } = estimateCost(
    entry.inputTokens || 0,
    entry.outputTokens || 0,
    entry.model || 'default'
  );
  return totalCost;
}

/**
 * Get model pricing info
 *
 * @param {string} model - Model name
 * @returns {{ input: number, output: number }} Price per 1M tokens
 */
export function getModelPricing(model = 'default') {
  return MODEL_COSTS[model] || MODEL_COSTS['default'];
}

/**
 * List all supported models with their pricing
 *
 * @returns {Array} Array of {model, pricing}
 */
export function listSupportedModels() {
  return Object.entries(MODEL_COSTS)
    .filter(([key]) => key !== 'default')
    .map(([model, pricing]) => ({ model, pricing }));
}

export { MODEL_COSTS };
