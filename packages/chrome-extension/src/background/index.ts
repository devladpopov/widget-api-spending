/// <reference types="chrome" />

const POLL_ALARM = 'poll-usage';
const POLL_INTERVAL_MIN = 5;

// Set up periodic polling via chrome.alarms (survives service worker termination)
chrome.alarms.create(POLL_ALARM, { periodInMinutes: POLL_INTERVAL_MIN });

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
  return true;
});

async function pollUsage(): Promise<void> {
  const { providers } = await chrome.storage.local.get('providers');
  if (!providers) return;

  // TODO: Poll each configured provider's billing API
  // For now, just update the badge
  await updateBadge();
}

async function handleInterceptedUsage(eventData: unknown): Promise<void> {
  const { events = [] } = await chrome.storage.local.get('events');
  events.push(eventData);

  // Keep last 10000 events max
  if (events.length > 10000) {
    events.splice(0, events.length - 10000);
  }

  await chrome.storage.local.set({ events });
  await updateBadge();
}

async function updateBadge(): Promise<void> {
  const { events = [] } = await chrome.storage.local.get('events');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCost = events
    .filter((e: { timestamp: number }) => e.timestamp >= todayStart.getTime())
    .reduce((sum: number, e: { costUsd: number }) => sum + (e.costUsd ?? 0), 0);

  const text = todayCost > 0 ? `$${todayCost.toFixed(todayCost >= 10 ? 0 : 2)}` : '';
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: '#1a1a2e' });
}

// Initial poll on install/update
chrome.runtime.onInstalled.addListener(() => {
  pollUsage();
});
