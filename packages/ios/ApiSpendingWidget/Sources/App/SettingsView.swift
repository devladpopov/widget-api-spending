import SwiftUI
import WidgetKit

struct SettingsView: View {
    @AppStorage("anthropic_key", store: UserDefaults(suiteName: ProviderConfig.appGroupID))
    private var anthropicKey = ""

    @AppStorage("openai_key", store: UserDefaults(suiteName: ProviderConfig.appGroupID))
    private var openaiKey = ""

    @AppStorage("currency", store: UserDefaults(suiteName: ProviderConfig.appGroupID))
    private var currency = "USD"

    private let currencies = ["USD", "EUR", "GBP", "RUB", "JPY", "CNY", "CAD", "AUD"]

    private let cream = Color(red: 0.957, green: 0.937, blue: 0.890)
    private let accent = Color(red: 0.788, green: 0.392, blue: 0.259)

    var body: some View {
        NavigationStack {
            List {
                Section("API Keys") {
                    SecureField("Anthropic Admin Key", text: $anthropicKey)
                        .font(.system(.body, design: .monospaced))
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)

                    SecureField("OpenAI Admin Key", text: $openaiKey)
                        .font(.system(.body, design: .monospaced))
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }

                Section("Display") {
                    Picker("Currency", selection: $currency) {
                        ForEach(currencies, id: \.self) { curr in
                            Text(curr).tag(curr)
                        }
                    }
                }

                Section {
                    Button("Refresh Widget") {
                        WidgetCenter.shared.reloadAllTimelines()
                    }
                    .foregroundColor(accent)
                }

                Section("About") {
                    LabeledContent("Version", value: "0.1.0")
                    LabeledContent("Providers", value: "Anthropic, OpenAI, Gemini")
                }
            }
            .navigationTitle("API Spending")
            .onChange(of: anthropicKey) { _, _ in
                WidgetCenter.shared.reloadAllTimelines()
            }
            .onChange(of: openaiKey) { _, _ in
                WidgetCenter.shared.reloadAllTimelines()
            }
            .onChange(of: currency) { _, _ in
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}

#Preview {
    SettingsView()
}
