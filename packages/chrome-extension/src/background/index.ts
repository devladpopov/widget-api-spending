/// <reference types="chrome" />
import { fetchAnthropicUsage, fetchOpenAIUsage, calculateCost, fetchExchangeRates } from '@api-spending/core';
import type { UsageEvent } from '@api-spending/core';

const POLL_ALARM = 'poll-usage';
const DEFAULT_POLL_MIN = 5;

// ── Rate limit state ──
interface RateLimitState {
  provider: string;
  tokensLimit: number;
  tokensRemaining: number;
  tokensReset: string; // ISO date or relative like "2024-01-01T12:00:00Z"
  requestsLimit: number;
  requestsRemaining: number;
  requestsReset: string;
  updatedAt: number;
}

// ── Init ──
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

// ── Message handlers ──
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'USAGE_EVENT') {
    handleInterceptedUsage(message.data);
    sendResponse({ ok: true });
  }
  if (message.type === 'RATE_LIMIT_UPDATE') {
    handleRateLimitUpdate(message.data);
    sendResponse({ ok: true });
  }
  if (message.type === 'SETTINGS_UPDATED') {
    handleSettingsUpdated(message.settings);
    sendResponse({ ok: true });
  }
  return true;
});

// ── Rate limit handler ──
async function handleRateLimitUpdate(data: { provider: string; headers: Record<string, string>; timestamp: number }): Promise<void> {
  const { provider, headers, timestamp } = data;
  const h = headers;

  const state: RateLimitState = {
    provider,
    tokensLimit: parseInt(h['anthropic-ratelimit-tokens-limit'] ?? h['x-ratelimit-limit-tokens'] ?? '0', 10),
    tokensRemaining: parseInt(h['anthropic-ratelimit-tokens-remaining'] ?? h['x-ratelimit-remaining-tokens'] ?? '0', 10),
    tokensReset: h['anthropic-ratelimit-tokens-reset'] ?? h['x-ratelimit-reset-tokens'] ?? '',
    requestsLimit: parseInt(h['anthropic-ratelimit-requests-limit'] ?? h['x-ratelimit-limit-requests'] ?? '0', 10),
    requestsRemaining: parseInt(h['anthropic-ratelimit-requests-remaining'] ?? h['x-ratelimit-remaining-requests'] ?? '0', 10),
    requestsReset: h['anthropic-ratelimit-requests-reset'] ?? h['x-ratelimit-reset-requests'] ?? h['x-ratelimit-reset'] ?? '',
    updatedAt: timestamp,
  };

  // Store per-provider
  const key = `rateLimit_${provider}`;
  await chrome.storage.local.set({ [key]: state });
  await updateBadge();
}

// ── Settings ──
async function handleSettingsUpdated(settings: Record<string, unknown>): Promise<void> {
  const interval = (settings.pollInterval as number) ?? DEFAULT_POLL_MIN;
  await chrome.alarms.clear(POLL_ALARM);
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: interval });

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

// ── Polling ──
async function pollUsage(): Promise<void> {
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const newEvents: UsageEvent[] = [];

  if (settings.anthropicKey) {
    try {
      const events = await fetchAnthropicUsage(settings.anthropicKey, todayStart, now, '1h');
      newEvents.push(...events);
    } catch (err) {
      console.warn('[API Spending] Anthropic poll failed:', err);
    }
  }

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

// ── Event storage ──
async function mergeEvents(newEvents: UsageEvent[]): Promise<void> {
  const { events: existing = [] } = await chrome.storage.local.get('events');
  const existingIds = new Set(existing.map((e: UsageEvent) => e.id));
  const unique = newEvents.filter(e => !existingIds.has(e.id));
  if (unique.length === 0) return;

  const merged = [...existing, ...unique]
    .sort((a: UsageEvent, b: UsageEvent) => a.timestamp - b.timestamp);

  if (merged.length > 10000) merged.splice(0, merged.length - 10000);
  await chrome.storage.local.set({ events: merged });
}

async function handleInterceptedUsage(eventData: Partial<UsageEvent>): Promise<void> {
  if (!eventData.costUsd && eventData.provider && eventData.model) {
    eventData.costUsd = calculateCost(
      eventData.provider, eventData.model,
      eventData.inputTokens ?? 0, eventData.outputTokens ?? 0,
      eventData.cacheReadTokens ?? 0, eventData.cacheWriteTokens ?? 0,
    );
  }

  const { events = [] } = await chrome.storage.local.get('events');
  events.push(eventData);
  if (events.length > 10000) events.splice(0, events.length - 10000);
  await chrome.storage.local.set({ events });
  await updateBadge();
  await checkBudgetAlerts();
}

// ── Badge / Icon drawing ──
async function updateBadge(): Promise<void> {
  const { events = [], settings } = await chrome.storage.local.get(['events', 'settings']);
  const mode = settings?.mode ?? 'api'; // 'api' or 'plan'

  if (mode === 'plan') {
    await drawPlanIcon();
  } else {
    await drawApiIcon(events);
  }
}

async function drawApiIcon(events: UsageEvent[]): Promise<void> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCost = events
    .filter((e: UsageEvent) => e.timestamp >= todayStart.getTime())
    .reduce((sum: number, e: UsageEvent) => sum + (e.costUsd ?? 0), 0);

  const text = todayCost >= 100 ? `$${Math.round(todayCost)}`
    : todayCost >= 10 ? `$${todayCost.toFixed(1)}`
    : `$${todayCost.toFixed(2)}`;

  try {
    const imageData = await renderIcon(text, null);
    await chrome.action.setIcon({ imageData: imageData as unknown as Record<string, ImageData> });
    await chrome.action.setBadgeText({ text: '' });
  } catch {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color: '#C96442' });
  }
}

async function drawPlanIcon(): Promise<void> {
  // Find the most relevant rate limit data
  const storage = await chrome.storage.local.get(null);
  const rlKeys = Object.keys(storage).filter(k => k.startsWith('rateLimit_'));

  let bestRL: RateLimitState | null = null;
  for (const key of rlKeys) {
    const rl = storage[key] as RateLimitState;
    if (!bestRL || rl.updatedAt > bestRL.updatedAt) bestRL = rl;
  }

  if (!bestRL || bestRL.tokensLimit === 0) {
    // No rate limit data yet — show waiting state
    try {
      const imageData = await renderIcon('...', null);
      await chrome.action.setIcon({ imageData: imageData as unknown as Record<string, ImageData> });
      await chrome.action.setBadgeText({ text: '' });
    } catch {
      await chrome.action.setBadgeText({ text: '...' });
    }
    return;
  }

  const pct = bestRL.tokensLimit > 0
    ? Math.round(((bestRL.tokensLimit - bestRL.tokensRemaining) / bestRL.tokensLimit) * 100)
    : 0;

  // Time until reset
  let resetText = '';
  if (bestRL.tokensReset) {
    const resetDate = new Date(bestRL.tokensReset);
    const diffMs = resetDate.getTime() - Date.now();
    if (diffMs > 0) {
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(mins / 60);
      resetText = hours > 0 ? `${hours}h${mins % 60}m` : `${mins}m`;
    }
  }

  const label = resetText || `${pct}%`;

  try {
    const imageData = await renderIcon(label, pct);
    await chrome.action.setIcon({ imageData: imageData as unknown as Record<string, ImageData> });
    await chrome.action.setBadgeText({ text: '' });
  } catch {
    await chrome.action.setBadgeText({ text: `${pct}%` });
    await chrome.action.setBadgeBackgroundColor({ color: pct > 90 ? '#d44' : pct > 70 ? '#C96442' : '#4a8a3a' });
  }
}

/**
 * Render the toolbar icon with toad + label.
 * If progressPct is provided, draws a ring around the toad.
 */
async function renderIcon(
  label: string,
  progressPct: number | null,
): Promise<Record<string, ImageData>> {
  const sizes = [16, 32];
  const imageData: Record<string, ImageData> = {};

  const resp = await fetch(chrome.runtime.getURL('assets/claude-toad-square.png'));
  const blob = await resp.blob();

  for (const sz of sizes) {
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(sz, sz);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    if (progressPct !== null) {
      // ── Plan mode: ring + toad + label ──
      const cx = sz / 2;
      const cy = sz * 0.38;
      const radius = sz * 0.32;
      const lineW = sz >= 32 ? 2.5 : 1.5;

      // Background ring (grey)
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, Math.PI * 1.5);
      ctx.strokeStyle = '#E5DDC8';
      ctx.lineWidth = lineW;
      ctx.stroke();

      // Progress ring
      const angle = -Math.PI / 2 + (progressPct / 100) * Math.PI * 2;
      const color = progressPct > 90 ? '#d44' : progressPct > 70 ? '#C96442' : '#6a9a5a';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, angle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineW;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Toad inside ring
      const toadSz = Math.round(sz * 0.4);
      const toadX = Math.round(cx - toadSz / 2);
      const toadY = Math.round(cy - toadSz / 2);
      ctx.drawImage(bitmap, toadX, toadY, toadSz, toadSz);

      // Label below ring
      const fontSize = sz >= 32 ? 8 : 5;
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, cx, sz * 0.72);
    } else {
      // ── API mode: toad + price badge ──
      const toadH = Math.round(sz * 0.55);
      const toadW = toadH;
      const toadX = Math.round((sz - toadW) / 2);
      ctx.drawImage(bitmap, toadX, 0, toadW, toadH);

      const badgeH = Math.round(sz * 0.38);
      const badgeY = sz - badgeH;
      const badgeR = sz >= 32 ? 3 : 2;
      const fontSize = sz >= 32 ? 9 : 6;

      ctx.fillStyle = '#F4EFE3';
      ctx.strokeStyle = '#C96442';
      ctx.lineWidth = sz >= 32 ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(1, badgeY, sz - 2, badgeH - 1, badgeR);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#C96442';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, sz / 2, badgeY + badgeH / 2);
    }

    bitmap.close();
    imageData[String(sz)] = ctx.getImageData(0, 0, sz, sz);
  }

  return imageData;
}

// ── Budget alerts ──
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
