import Foundation

/// Fetches usage from Anthropic Admin API
struct AnthropicClient {
    let apiKey: String

    func fetchUsage(since: Date = Calendar.current.startOfDay(for: .now)) async throws -> [UsageEvent] {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        let startDate = formatter.string(from: since)
        let endDate = formatter.string(from: .now)

        guard let url = URL(string: "https://api.anthropic.com/v1/organizations/usage_report/messages?start_date=\(startDate)&end_date=\(endDate)&group_by=model") else {
            return []
        }

        var request = URLRequest(url: url)
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(AnthropicUsageResponse.self, from: data)

        return response.data.compactMap { item in
            guard let pricing = getPricing(for: item.model) else { return nil }
            let cost = pricing.calculateCost(
                inputTokens: item.inputTokens,
                outputTokens: item.outputTokens,
                cachedTokens: item.cacheReadInputTokens
            )
            return UsageEvent(
                provider: .anthropic,
                model: item.model,
                inputTokens: item.inputTokens,
                outputTokens: item.outputTokens,
                cachedTokens: item.cacheReadInputTokens,
                costUSD: cost,
                timestamp: since
            )
        }
    }
}

private struct AnthropicUsageResponse: Codable {
    let data: [AnthropicUsageItem]
}

private struct AnthropicUsageItem: Codable {
    let model: String
    let inputTokens: Int
    let outputTokens: Int
    let cacheReadInputTokens: Int

    enum CodingKeys: String, CodingKey {
        case model
        case inputTokens = "input_tokens"
        case outputTokens = "output_tokens"
        case cacheReadInputTokens = "cache_read_input_tokens"
    }
}
