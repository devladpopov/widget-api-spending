# Стратегический план реализации

## Фаза 1 — Chrome Extension MVP (Anthropic only)
**Срок: 2-3 недели**

Задачи:
- [ ] Инициализация монорепо (pnpm + Turborepo + Vite)
- [ ] `packages/core` — адаптер Anthropic (Usage API + Cost API)
- [ ] `packages/core` — таблица цен Claude моделей
- [ ] `packages/core` — расчёт стоимости из токенов
- [ ] `packages/core` — модуль валют (Frankfurter API)
- [ ] `packages/core` — модель данных (UsageEvent, SpendingSummary)
- [ ] `packages/chrome-extension` — Manifest V3, permissions
- [ ] Service worker: polling Anthropic Usage API через chrome.alarms
- [ ] Content script: перехват fetch для api.anthropic.com (fallback без Admin ключа)
- [ ] IndexedDB: хранение истории
- [ ] Popup UI: сегодня/неделя/месяц, разбивка по моделям
- [ ] Badge: сумма за сегодня
- [ ] Settings page: Admin API key, валюта, таймзона
- [ ] Сборка и локальное тестирование

**Результат:** рабочее расширение, трекающее расходы на Claude.

## Фаза 2 — Multi-Provider + Polish
**Срок: 2 недели**

- [ ] Адаптер OpenAI (Usage API + локальный расчёт стоимости)
- [ ] Адаптер Gemini (token estimation из перехвата)
- [ ] Графики расходов за период (sparklines в попапе)
- [ ] Budget alerts (уведомления при превышении лимита)
- [ ] Экспорт CSV/JSON
- [ ] Публикация в Chrome Web Store

**Результат:** полноценное расширение для 3 провайдеров.

## Фаза 3 — Desktop Widget (Tauri v2)
**Срок: 3-4 недели**

- [ ] Tauri v2 проект (Windows + macOS)
- [ ] System tray с динамической иконкой
- [ ] Flyout panel (та же UI что в попапе)
- [ ] SQLite для хранения
- [ ] OS keychain для ключей
- [ ] Native messaging с Chrome extension (опционально)
- [ ] Auto-start при загрузке ОС

**Результат:** виджет в трее, всегда видно расход.

## Фаза 4 — Mobile + Ecosystem
**Срок: 4-6 недель**

- [ ] Android home screen widget (React Native или Tauri Mobile)
- [ ] iOS WidgetKit (Swift bridge)
- [ ] SDK-обёртка (npm package) для разработчиков
- [ ] VS Code extension (status bar)
- [ ] Опциональный backend для кросс-девайс синхронизации

## Стек

| Компонент | Технология |
|-----------|-----------|
| Язык | TypeScript (core), Rust (Tauri backend) |
| Монорепо | pnpm workspaces + Turborepo |
| Сборка | Vite |
| Тесты | Vitest |
| Chrome ext | Manifest V3 |
| Desktop | Tauri v2 |
| Mobile | React Native / Expo |
| UI | Preact или Solid (маленький бандл) |
| Стили | Tailwind CSS |
| БД (browser) | IndexedDB |
| БД (native) | SQLite |
| Валюты | Frankfurter API |
