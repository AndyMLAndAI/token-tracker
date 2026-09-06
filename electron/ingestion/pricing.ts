/**
 * Local Model Pricing Table (USD per 1,000,000 tokens)
 * Keyed by model family / pattern for accurate real-time turn cost computation.
 */

export interface ModelPricing {
  inputPerMillion: number
  outputPerMillion: number
  cacheReadPerMillion: number
  cacheCreationPerMillion: number
}

const PRICING_TABLE: Array<{ pattern: RegExp; pricing: ModelPricing }> = [
  // Anthropic Claude Family
  {
    pattern: /opus/i,
    pricing: {
      inputPerMillion: 15.0,
      outputPerMillion: 75.0,
      cacheReadPerMillion: 1.5,
      cacheCreationPerMillion: 18.75,
    },
  },
  {
    pattern: /haiku/i,
    pricing: {
      inputPerMillion: 0.80,
      outputPerMillion: 4.0,
      cacheReadPerMillion: 0.08,
      cacheCreationPerMillion: 1.0,
    },
  },
  {
    pattern: /sonnet|claude-3|claude/i,
    pricing: {
      inputPerMillion: 3.0,
      outputPerMillion: 15.0,
      cacheReadPerMillion: 0.30,
      cacheCreationPerMillion: 3.75,
    },
  },

  // OpenAI Family
  {
    pattern: /o3-mini/i,
    pricing: {
      inputPerMillion: 1.10,
      outputPerMillion: 4.40,
      cacheReadPerMillion: 0.55,
      cacheCreationPerMillion: 1.10,
    },
  },
  {
    pattern: /o1/i,
    pricing: {
      inputPerMillion: 15.0,
      outputPerMillion: 60.0,
      cacheReadPerMillion: 7.50,
      cacheCreationPerMillion: 15.0,
    },
  },
  {
    pattern: /gpt-4o-mini/i,
    pricing: {
      inputPerMillion: 0.15,
      outputPerMillion: 0.60,
      cacheReadPerMillion: 0.075,
      cacheCreationPerMillion: 0.15,
    },
  },
  {
    pattern: /gpt-4o|chatgpt-4o/i,
    pricing: {
      inputPerMillion: 2.50,
      outputPerMillion: 10.0,
      cacheReadPerMillion: 1.25,
      cacheCreationPerMillion: 2.50,
    },
  },
  {
    pattern: /gpt-4-turbo|gpt-4/i,
    pricing: {
      inputPerMillion: 10.0,
      outputPerMillion: 30.0,
      cacheReadPerMillion: 5.0,
      cacheCreationPerMillion: 10.0,
    },
  },

  // Google Gemini Family
  {
    pattern: /gemini.*(?:flash|lite)/i,
    pricing: {
      inputPerMillion: 0.075,
      outputPerMillion: 0.30,
      cacheReadPerMillion: 0.01875,
      cacheCreationPerMillion: 0.075,
    },
  },
  {
    pattern: /gemini.*pro/i,
    pricing: {
      inputPerMillion: 1.25,
      outputPerMillion: 5.0,
      cacheReadPerMillion: 0.3125,
      cacheCreationPerMillion: 1.25,
    },
  },
  {
    pattern: /gemini/i,
    pricing: {
      inputPerMillion: 0.10,
      outputPerMillion: 0.40,
      cacheReadPerMillion: 0.025,
      cacheCreationPerMillion: 0.10,
    },
  },

  // DeepSeek Family
  {
    pattern: /deepseek-reasoner|deepseek-r1/i,
    pricing: {
      inputPerMillion: 0.55,
      outputPerMillion: 2.19,
      cacheReadPerMillion: 0.14,
      cacheCreationPerMillion: 0.55,
    },
  },
  {
    pattern: /deepseek/i,
    pricing: {
      inputPerMillion: 0.14,
      outputPerMillion: 0.28,
      cacheReadPerMillion: 0.014,
      cacheCreationPerMillion: 0.14,
    },
  },
]

// Fallback pricing if model is completely unrecognized
const DEFAULT_PRICING: ModelPricing = {
  inputPerMillion: 3.0,
  outputPerMillion: 15.0,
  cacheReadPerMillion: 0.30,
  cacheCreationPerMillion: 3.75,
}

export function getModelPricing(modelName: string): ModelPricing {
  if (!modelName) return DEFAULT_PRICING

  for (const entry of PRICING_TABLE) {
    if (entry.pattern.test(modelName)) {
      return entry.pricing
    }
  }

  return DEFAULT_PRICING
}

export function calculateTurnCost(
  modelName: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number = 0,
  cacheCreationTokens: number = 0
): number {
  const pricing = getModelPricing(modelName)

  const inputCost = (inputTokens * pricing.inputPerMillion) / 1_000_000
  const outputCost = (outputTokens * pricing.outputPerMillion) / 1_000_000
  const cacheReadCost = (cacheReadTokens * pricing.cacheReadPerMillion) / 1_000_000
  const cacheCreationCost = (cacheCreationTokens * pricing.cacheCreationPerMillion) / 1_000_000

  return inputCost + outputCost + cacheReadCost + cacheCreationCost
}
