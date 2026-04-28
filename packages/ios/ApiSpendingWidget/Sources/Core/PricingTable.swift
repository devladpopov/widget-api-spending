import Foundation

/// Per-million-token pricing (USD)
struct ModelPricing {
    let inputPerMillion: Double
    let outputPerMillion: Double
    let cachedInputPerMillion: Double

    func calculateCost(inputTokens: Int, outputTokens: Int, cachedTokens: Int = 0) -> Double {
        let regularInput = max(0, inputTokens - cachedTokens)
        let inputCost = Double(regularInput) / 1_000_000 * inputPerMillion
        let cachedCost = Double(cachedTokens) / 1_000_000 * cachedInputPerMillion
        let outputCost = Double(outputTokens) / 1_000_000 * outputPerMillion
        return inputCost + cachedCost + outputCost
    }
}

/// Pricing table matching core/src/pricing.ts
let pricingTable: [String: ModelPricing] = [
    // Anthropic
    "claude-opus-4": ModelPricing(inputPerMillion: 15, outputPerMillion: 75, cachedInputPerMillion: 1.5),
    "claude-sonnet-4": ModelPricing(inputPerMillion: 3, outputPerMillion: 15, cachedInputPerMillion: 0.3),
    "claude-haiku-3.5": ModelPricing(inputPerMillion: 0.8, outputPerMillion: 4, cachedInputPerMillion: 0.08),

    // OpenAI
    "gpt-4o": ModelPricing(inputPerMillion: 2.5, outputPerMillion: 10, cachedInputPerMillion: 1.25),
    "gpt-4.1": ModelPricing(inputPerMillion: 2, outputPerMillion: 8, cachedInputPerMillion: 0.5),
    "o3": ModelPricing(inputPerMillion: 10, outputPerMillion: 40, cachedInputPerMillion: 2.5),
    "o4-mini": ModelPricing(inputPerMillion: 1.1, outputPerMillion: 4.4, cachedInputPerMillion: 0.275),

    // Gemini
    "gemini-2.5-pro": ModelPricing(inputPerMillion: 1.25, outputPerMillion: 10, cachedInputPerMillion: 0.315),
    "gemini-2.5-flash": ModelPricing(inputPerMillion: 0.15, outputPerMillion: 0.6, cachedInputPerMillion: 0.0375),
    "gemini-2.0-flash": ModelPricing(inputPerMillion: 0.1, outputPerMillion: 0.4, cachedInputPerMillion: 0.025),
]

func getPricing(for model: String) -> ModelPricing? {
    // Exact match first
    if let p = pricingTable[model] { return p }
    // Prefix match (e.g. "claude-sonnet-4-20260514" → "claude-sonnet-4")
    return pricingTable.first { model.hasPrefix($0.key) }?.value
}
