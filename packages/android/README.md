# API Spending Widget — Android

Jetpack Glance home screen widget showing AI API spending.

## Requirements

- Android Studio Hedgehog+
- Kotlin 2.0+
- Min SDK 26 (Android 8.0)

## Setup

1. Open `packages/android/` in Android Studio
2. Sync Gradle
3. Run on device/emulator
4. Enter API keys in the app
5. Long-press home screen, add "API Spending" widget

## Architecture

- `SpendingWidget.kt` — Glance widget (small 2x2, medium 3x2)
- `MainActivity.kt` — Compose settings screen
- `PollingWorker.kt` — WorkManager periodic API polling (every 15 min)
- Cream design system (#F4EFE3 background, #C96442 accent)
