import Foundation

/// AI API provider
enum Provider: String, Codable, CaseIterable {
    case anthropic
    case openai
    case gemini

    var displayName: String {
        switch self {
        case .anthropic: return "Anthropic"
        case .openai: return "OpenAI"
        case .gemini: return "Gemini"
        }
    }

    var color: String {
        switch self {
        case .anthropic: return "#C96442"
        case .openai: return "#7d8775"
        case .gemini: return "#b8995c"
        }
    }
}

/// Single usage event from an API call
struct UsageEvent: Codable, Identifiable {
    let id: UUID
    let provider: Provider
    let model: String
    let inputTokens: Int
    let outputTokens: Int
    let cachedTokens: Int
    let costUSD: Double
    let timestamp: Date

    init(provider: Provider, model: String, inputTokens: Int, outputTokens: Int, cachedTokens: Int = 0, costUSD: Double, timestamp: Date = .now) {
        self.id = UUID()
        self.provider = provider
        self.model = model
        self.inputTokens = inputTokens
        self.outputTokens = outputTokens
        self.cachedTokens = cachedTokens
        self.costUSD = costUSD
        self.timestamp = timestamp
    }
}

/// Aggregated spending summary
struct SpendingSummary {
    let totalUSD: Double
    let byProvider: [Provider: Double]
    let totalRequests: Int
    let totalTokens: Int
    let events: [UsageEvent]

    var formattedTotal: String {
        String(format: "$%.2f", totalUSD)
    }
}

/// Provider API configuration
struct ProviderConfig: Codable {
    let provider: Provider
    var apiKey: String
    var isEnabled: Bool

    static let appGroupID = "group.com.apispending.widget"
}

/// Exchange rate cache entry
struct ExchangeRateCache: Codable {
    let rates: [String: Double]
    let fetchedAt: Date
    let baseCurrency: String

    var isStale: Bool {
        Date().timeIntervalSince(fetchedAt) > 86400 // 24h
    }
}
