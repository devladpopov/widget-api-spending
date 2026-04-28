# API Spending Widget — iOS

WidgetKit home screen widget showing AI API spending.

## Requirements

- Xcode 15+
- iOS 17+
- Swift 5.9+

## Setup

1. Open `ApiSpendingWidget.xcodeproj` in Xcode (or create from this scaffold)
2. Add your API keys in Settings
3. Build and run on device/simulator
4. Long-press home screen → Add Widget → API Spending

## Architecture

- `SpendingCore/` — shared logic (API clients, models, currency conversion)
- `SpendingWidgetExtension/` — WidgetKit timeline provider and views
- `ApiSpendingWidget/` — main app for configuration

The widget uses WidgetKit's `TimelineProvider` to refresh every 15 minutes.
Data is shared between app and extension via App Group container.
