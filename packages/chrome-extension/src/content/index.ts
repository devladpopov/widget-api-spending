// Content script: injects the fetch interceptor as an external script
// (avoids CSP inline-script violations) and relays messages to background.

function detectProvider(url: string): string | null {
  if (url.includes('anthropic.com')) return 'anthropic';
  if (url.includes('openai.com') || url.includes('chatgpt.com')) return 'openai';
  if (url.includes('googleapis.com')) return 'gemini';
  return null;
}

// Inject interceptor as external script (CSP-safe)
const script = document.createElement('script');
script.src = chrome.runtime.getURL('interceptor.js');
script.onload = () => script.remove();
(document.head ?? document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type !== 'API_SPENDING_INTERCEPTED') return;

  const { url, usage, model, rateLimitHeaders, timestamp } = event.data;
  const provider = detectProvider(url);
  if (!provider) return;

  // Send rate limit data if present
  if (rateLimitHeaders && Object.keys(rateLimitHeaders).length > 0) {
    chrome.runtime.sendMessage({
      type: 'RATE_LIMIT_UPDATE',
      data: { provider, headers: rateLimitHeaders, timestamp },
    });
  }

  if (!usage) return;

  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheWriteTokens = 0;

  if (provider === 'anthropic') {
    inputTokens = usage.input_tokens ?? 0;
    outputTokens = usage.output_tokens ?? 0;
    cacheReadTokens = usage.cache_read_input_tokens ?? 0;
    cacheWriteTokens = usage.cache_creation_input_tokens ?? 0;
  } else if (provider === 'openai') {
    inputTokens = usage.prompt_tokens ?? 0;
    outputTokens = usage.completion_tokens ?? 0;
  } else if (provider === 'gemini') {
    inputTokens = usage.promptTokenCount ?? 0;
    outputTokens = usage.candidatesTokenCount ?? 0;
  }

  chrome.runtime.sendMessage({
    type: 'USAGE_EVENT',
    data: {
      id: `${provider}-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp,
      provider,
      model: model ?? 'unknown',
      inputTokens,
      outputTokens,
      cacheReadTokens,
      cacheWriteTokens,
      source: 'interceptor',
    },
  });
});
