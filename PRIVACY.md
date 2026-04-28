# Privacy Policy — API Spending Monitor

**Last updated:** April 2026

## What data we collect

API Spending Monitor collects the following data **locally on your device only**:

- **API usage metadata**: token counts, model names, timestamps, and calculated costs from AI API calls (Anthropic, OpenAI, Gemini)
- **API keys**: Admin API keys you provide for billing data access
- **Settings**: your preferences (currency, theme, budget limits, poll interval)

## How data is collected

Data is collected in two ways:
1. **Passive interception**: The extension monitors API calls made from your browser tabs and extracts usage metadata from responses. No request content or prompts are captured.
2. **Active polling**: If you provide Admin API keys, the extension periodically fetches aggregated usage reports directly from provider billing APIs.

## Where data is stored

All data is stored **exclusively in your browser's local storage** (`chrome.storage.local`). No data is transmitted to any server, analytics service, or third party.

## What data we do NOT collect

- API request/response content (prompts, completions)
- Personal information (name, email, browsing history)
- Telemetry or analytics
- Crash reports

## Data sharing

We do not share, sell, or transmit any data to third parties. The only network requests made are:
- To AI provider APIs (Anthropic, OpenAI) using your own API keys
- To Frankfurter API (api.frankfurter.dev) for currency exchange rates — no personal data is sent

## Data deletion

You can delete all stored data at any time via Settings > Clear Data, or by uninstalling the extension.

## API key security

API keys are stored in `chrome.storage.local`, which is sandboxed to the extension and inaccessible to web pages or other extensions. Keys are never logged, transmitted, or exposed in any way beyond their intended use (authenticating with provider APIs).

## Contact

For privacy concerns, contact: [your email here]
