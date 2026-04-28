import WidgetKit
import SwiftUI

// MARK: - Timeline Provider

struct SpendingEntry: TimelineEntry {
    let date: Date
    let totalToday: Double
    let totalWeek: Double
    let totalMonth: Double
    let byProvider: [String: Double] // provider name → cost
    let currency: String
    let currencySymbol: String
    let isPlaceholder: Bool

    static var placeholder: SpendingEntry {
        SpendingEntry(
            date: .now,
            totalToday: 4.23,
            totalWeek: 18.91,
            totalMonth: 67.40,
            byProvider: ["Anthropic": 2.85, "OpenAI": 1.12, "Gemini": 0.26],
            currency: "USD",
            currencySymbol: "$",
            isPlaceholder: true
        )
    }
}

struct SpendingTimelineProvider: TimelineProvider {
    typealias Entry = SpendingEntry

    func placeholder(in context: Context) -> SpendingEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (SpendingEntry) -> Void) {
        completion(.placeholder)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SpendingEntry>) -> Void) {
        Task {
            let entry = await fetchCurrentSpending()
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }

    private func fetchCurrentSpending() async -> SpendingEntry {
        let defaults = UserDefaults(suiteName: ProviderConfig.appGroupID)
        let currency = defaults?.string(forKey: "currency") ?? "USD"

        var totalToday: Double = 0
        var totalWeek: Double = 0
        var totalMonth: Double = 0
        var byProvider: [String: Double] = [:]

        // Fetch from each configured provider
        if let anthropicKey = defaults?.string(forKey: "anthropic_key"), !anthropicKey.isEmpty {
            let client = AnthropicClient(apiKey: anthropicKey)
            if let events = try? await client.fetchUsage() {
                let cost = events.reduce(0) { $0 + $1.costUSD }
                totalToday += cost
                byProvider["Anthropic"] = cost
            }
        }

        if let openaiKey = defaults?.string(forKey: "openai_key"), !openaiKey.isEmpty {
            let client = OpenAIClient(apiKey: openaiKey)
            if let events = try? await client.fetchUsage() {
                let cost = events.reduce(0) { $0 + $1.costUSD }
                totalToday += cost
                byProvider["OpenAI"] = cost
            }
        }

        // Convert currency if needed
        var symbol = "$"
        if currency != "USD" {
            let converted = await CurrencyService.shared.convert(totalToday, to: currency)
            totalToday = converted
            // Simple symbol lookup
            let symbols: [String: String] = ["EUR": "\u{20AC}", "GBP": "\u{00A3}", "RUB": "\u{20BD}", "JPY": "\u{00A5}"]
            symbol = symbols[currency] ?? currency
        }

        return SpendingEntry(
            date: .now,
            totalToday: totalToday,
            totalWeek: totalWeek,
            totalMonth: totalMonth,
            byProvider: byProvider,
            currency: currency,
            currencySymbol: symbol,
            isPlaceholder: false
        )
    }
}

// MARK: - Widget Views

struct SpendingWidgetEntryView: View {
    var entry: SpendingEntry
    @Environment(\.widgetFamily) var family

    private let cream = Color(red: 0.957, green: 0.937, blue: 0.890) // #F4EFE3
    private let accent = Color(red: 0.788, green: 0.392, blue: 0.259) // #C96442
    private let textPrimary = Color(red: 0.102, green: 0.094, blue: 0.082) // #1a1815
    private let textSecondary = Color(red: 0.541, green: 0.518, blue: 0.439) // #8a8470

    var body: some View {
        switch family {
        case .systemSmall:
            smallWidget
        case .systemMedium:
            mediumWidget
        default:
            smallWidget
        }
    }

    // MARK: Small Widget (2x2)
    var smallWidget: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text("API Spending")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(textSecondary)
                    .textCase(.uppercase)
                Spacer()
            }

            Text("\(entry.currencySymbol)\(entry.totalToday, specifier: "%.2f")")
                .font(.system(size: 28, weight: .semibold, design: .monospaced))
                .foregroundColor(textPrimary)
                .minimumScaleFactor(0.6)

            Text("today")
                .font(.system(size: 10, design: .monospaced))
                .foregroundColor(textSecondary)

            Spacer()

            // Provider dots
            HStack(spacing: 6) {
                ForEach(Array(entry.byProvider.sorted(by: { $0.value > $1.value })), id: \.key) { name, cost in
                    HStack(spacing: 3) {
                        Circle()
                            .fill(providerColor(name))
                            .frame(width: 5, height: 5)
                        Text("\(entry.currencySymbol)\(cost, specifier: "%.2f")")
                            .font(.system(size: 9, design: .monospaced))
                            .foregroundColor(textPrimary)
                    }
                }
            }
        }
        .padding(14)
        .containerBackground(cream, for: .widget)
    }

    // MARK: Medium Widget (4x2)
    var mediumWidget: some View {
        HStack(spacing: 16) {
            // Left: total
            VStack(alignment: .leading, spacing: 4) {
                Text("API SPENDING")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(textSecondary)
                    .textCase(.uppercase)
                    .tracking(0.5)

                Text("\(entry.currencySymbol)\(entry.totalToday, specifier: "%.2f")")
                    .font(.system(size: 32, weight: .semibold, design: .monospaced))
                    .foregroundColor(textPrimary)
                    .minimumScaleFactor(0.5)

                Text("today")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(textSecondary)
            }

            Spacer()

            // Right: per-provider breakdown
            VStack(alignment: .leading, spacing: 6) {
                ForEach(Array(entry.byProvider.sorted(by: { $0.value > $1.value })), id: \.key) { name, cost in
                    HStack(spacing: 6) {
                        Circle()
                            .fill(providerColor(name))
                            .frame(width: 6, height: 6)
                        Text(name)
                            .font(.system(size: 11))
                            .foregroundColor(textPrimary)
                        Spacer()
                        Text("\(entry.currencySymbol)\(cost, specifier: "%.2f")")
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(textPrimary)
                    }
                }
            }
            .frame(maxWidth: 160)
        }
        .padding(16)
        .containerBackground(cream, for: .widget)
    }

    func providerColor(_ name: String) -> Color {
        switch name {
        case "Anthropic": return accent
        case "OpenAI": return Color(red: 0.49, green: 0.53, blue: 0.46)
        case "Gemini": return Color(red: 0.72, green: 0.60, blue: 0.36)
        default: return .gray
        }
    }
}

// MARK: - Widget Declaration

struct SpendingWidget: Widget {
    let kind = "SpendingWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SpendingTimelineProvider()) { entry in
            SpendingWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("API Spending")
        .description("Track your AI API costs in real-time")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    SpendingWidget()
} timeline: {
    SpendingEntry.placeholder
}

#Preview(as: .systemMedium) {
    SpendingWidget()
} timeline: {
    SpendingEntry.placeholder
}
