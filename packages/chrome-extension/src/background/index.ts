/// <reference types="chrome" />
import { fetchAnthropicUsage, fetchOpenAIUsage, calculateCost, fetchExchangeRates } from '@api-spending/core';
import type { UsageEvent } from '@api-spending/core';

const POLL_ALARM = 'poll-usage';
const DEFAULT_POLL_MIN = 5;

// Set up periodic polling
chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get('settings');
  const interval = settings?.pollInterval ?? DEFAULT_POLL_MIN;
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: interval });
  pollUsage();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === POLL_ALARM) {
    await pollUsage();
  }
});

// Listen for intercepted usage data from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'USAGE_EVENT') {
    handleInterceptedUsage(message.data);
    sendResponse({ ok: true });
  }
  if (message.type === 'SETTINGS_UPDATED') {
    handleSettingsUpdated(message.settings);
    sendResponse({ ok: true });
  }
  return true;
});

async function handleSettingsUpdated(settings: Record<string, unknown>): Promise<void> {
  const interval = (settings.pollInterval as number) ?? DEFAULT_POLL_MIN;
  await chrome.alarms.clear(POLL_ALARM);
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: interval });

  // Refresh exchange rates if currency changed
  const currency = settings.currency as string;
  if (currency && currency !== 'USD') {
    try {
      const rates = await fetchExchangeRates();
      const rate = rates.rates[currency] ?? 1;
      await chrome.storage.local.set({
        settings: { ...settings, exchangeRate: rate },
      });
    } catch {}
  }

  pollUsage();
}

async function pollUsage(): Promise<void> {
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const newEvents: UsageEvent[] = [];

  // Anthropic
  if (settings.anthropicKey) {
    try {
      const events = await fetchAnthropicUsage(settings.anthropicKey, todayStart, now, '1h');
      newEvents.push(...events);
    } catch (err) {
      console.warn('[API Spending] Anthropic poll failed:', err);
    }
  }

  // OpenAI
  if (settings.openaiKey) {
    try {
      const events = await fetchOpenAIUsage(settings.openaiKey, todayStart, now, '1h');
      newEvents.push(...events);
    } catch (err) {
      console.warn('[API Spending] OpenAI poll failed:', err);
    }
  }

  if (newEvents.length > 0) {
    await mergeEvents(newEvents);
  }

  await updateBadge();
  await checkBudgetAlerts();
}

async function mergeEvents(newEvents: UsageEvent[]): Promise<void> {
  const { events: existing = [] } = await chrome.storage.local.get('events');

  // Deduplicate by ID — billing API events have deterministic IDs
  const existingIds = new Set(existing.map((e: UsageEvent) => e.id));
  const unique = newEvents.filter(e => !existingIds.has(e.id));

  if (unique.length === 0) return;

  const merged = [...existing, ...unique]
    .sort((a: UsageEvent, b: UsageEvent) => a.timestamp - b.timestamp);

  // Keep last 10000 events
  if (merged.length > 10000) {
    merged.splice(0, merged.length - 10000);
  }

  await chrome.storage.local.set({ events: merged });
}

async function handleInterceptedUsage(eventData: Partial<UsageEvent>): Promise<void> {
  // Calculate cost if missing
  if (!eventData.costUsd && eventData.provider && eventData.model) {
    eventData.costUsd = calculateCost(
      eventData.provider,
      eventData.model,
      eventData.inputTokens ?? 0,
      eventData.outputTokens ?? 0,
      eventData.cacheReadTokens ?? 0,
      eventData.cacheWriteTokens ?? 0,
    );
  }

  const { events = [] } = await chrome.storage.local.get('events');
  events.push(eventData);

  if (events.length > 10000) {
    events.splice(0, events.length - 10000);
  }

  await chrome.storage.local.set({ events });
  await updateBadge();
  await checkBudgetAlerts();
}

async function updateBadge(): Promise<void> {
  const { events = [] } = await chrome.storage.local.get('events');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCost = events
    .filter((e: UsageEvent) => e.timestamp >= todayStart.getTime())
    .reduce((sum: number, e: UsageEvent) => sum + (e.costUsd ?? 0), 0);

  const text = todayCost > 0 ? `$${todayCost.toFixed(todayCost >= 10 ? 0 : 2)}` : '';
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: '#C96442' });
}

async function checkBudgetAlerts(): Promise<void> {
  const { settings, events = [], alertsSent = {} } = await chrome.storage.local.get([
    'settings', 'events', 'alertsSent',
  ]);
  if (!settings) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayKey = todayStart.toISOString().slice(0, 10);
  const monthKey = todayStart.toISOString().slice(0, 7);

  const todayCost = events
    .filter((e: UsageEvent) => e.timestamp >= todayStart.getTime())
    .reduce((sum: number, e: UsageEvent) => sum + (e.costUsd ?? 0), 0);

  const monthCost = events
    .filter((e: UsageEvent) => e.timestamp >= monthStart.getTime())
    .reduce((sum: number, e: UsageEvent) => sum + (e.costUsd ?? 0), 0);

  const budgetDaily = parseFloat(settings.budgetDaily);
  const budgetMonthly = parseFloat(settings.budgetMonthly);

  if (budgetDaily > 0 && todayCost >= budgetDaily && alertsSent[`daily-${todayKey}`] !== true) {
    chrome.notifications.create(`budget-daily-${todayKey}`, {
      type: 'basic',
      iconUrl: 'assets/claude-toad-square.png',
      title: 'Daily Budget Alert',
      message: `You've spent $${todayCost.toFixed(2)} today (limit: $${budgetDaily.toFixed(2)})`,
    });
    alertsSent[`daily-${todayKey}`] = true;
    await chrome.storage.local.set({ alertsSent });
  }

  if (budgetMonthly > 0 && monthCost >= budgetMonthly && alertsSent[`monthly-${monthKey}`] !== true) {
    chrome.notifications.create(`budget-monthly-${monthKey}`, {
      type: 'basic',
      iconUrl: 'assets/claude-toad-square.png',
      title: 'Monthly Budget Alert',
      message: `You've spent $${monthCost.toFixed(2)} this month (limit: $${budgetMonthly.toFixed(2)})`,
    });
    alertsSent[`monthly-${monthKey}`] = true;
    await chrome.storage.local.set({ alertsSent });
  }
}
