import Foundation

/// Currency conversion using Frankfurter API (free, ECB data)
actor CurrencyService {
    static let shared = CurrencyService()

    private var cache: ExchangeRateCache?
    private let defaults = UserDefaults(suiteName: ProviderConfig.appGroupID)

    private init() {
        if let data = defaults?.data(forKey: "exchangeRates"),
           let cached = try? JSONDecoder().decode(ExchangeRateCache.self, from: data) {
            self.cache = cached
        }
    }

    func convert(_ amountUSD: Double, to currency: String) async -> Double {
        guard currency != "USD" else { return amountUSD }

        let rates = await fetchRates()
        guard let rate = rates[currency] else { return amountUSD }
        return amountUSD * rate
    }

    func fetchRates() async -> [String: Double] {
        if let cache, !cache.isStale {
            return cache.rates
        }

        guard let url = URL(string: "https://api.frankfurter.dev/v1/latest?base=USD") else {
            return cache?.rates ?? [:]
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(FrankfurterResponse.self, from: data)
            let newCache = ExchangeRateCache(rates: response.rates, fetchedAt: .now, baseCurrency: "USD")
            self.cache = newCache

            if let encoded = try? JSONEncoder().encode(newCache) {
                defaults?.set(encoded, forKey: "exchangeRates")
            }

            return response.rates
        } catch {
            return cache?.rates ?? [:]
        }
    }
}

private struct FrankfurterResponse: Codable {
    let rates: [String: Double]
}
