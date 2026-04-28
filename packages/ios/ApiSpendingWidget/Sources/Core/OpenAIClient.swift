import Foundation

/// Fetches usage from OpenAI Admin API
struct OpenAIClient {
    let apiKey: String

    func fetchUsage(since: Date = Calendar.current.startOfDay(for: .now)) async throws -> [UsageEvent] {
        let startTime = Int(since.timeIntervalSince1970)

        guard let url = URL(string: "https://api.openai.com/v1/organization/usage/completions?start_time=\(startTime)&group_by=model") else {
            return []
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(OpenAIUsageResponse.self, from: data)

        return response.data.compactMap { bucket in
            bucket.results.compactMap { result -> UsageEvent? in
                let model = result.model ?? "unknown"
                guard let pricing = getPricing(for: model) else { return nil }
                let cost = pricing.calculateCost(
                    inputTokens: result.inputTokens,
                    outputTokens: result.outputTokens,
                    cachedTokens: result.inputCachedTokens
                )
                return UsageEvent(
                    provider: .openai,
                    model: model,
                    inputTokens: result.inputTokens,
                    outputTokens: result.outputTokens,
                    cachedTokens: result.inputCachedTokens,
                    costUSD: cost,
                    timestamp: Date(timeIntervalSince1970: TimeInterval(bucket.startTime))
                )
            }
        }.flatMap { $0 }
    }
}

private struct OpenAIUsageResponse: Codable {
    let data: [OpenAIBucket]
}

private struct OpenAIBucket: Codable {
    let startTime: Int
    let results: [OpenAIResult]

    enum CodingKeys: String, CodingKey {
        case startTime = "start_time"
        case results
    }
}

private struct OpenAIResult: Codable {
    let model: String?
    let inputTokens: Int
    let outputTokens: Int
    let inputCachedTokens: Int

    enum CodingKeys: String, CodingKey {
        case model
        case inputTokens = "input_tokens"
        case outputTokens = "output_tokens"
        case inputCachedTokens = "input_cached_tokens"
    }
}
