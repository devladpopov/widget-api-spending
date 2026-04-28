// Content script: monkey-patches fetch() to intercept AI API responses
// and extract usage data + rate limit headers.

const AI_API_HOSTS = [
  'api.anthropic.com',
  'api.openai.com',
  'generativelanguage.googleapis.com',
];

// Also intercept on provider web UIs (for plan/subscription users)
const PLAN_HOSTS = [
  'claude.ai',
  'chatgpt.com',
  'chat.openai.com',
];

function detectProvider(url: string): string | null {
  if (url.includes('anthropic.com')) return 'anthropic';
  if (url.includes('openai.com') || url.includes('chatgpt.com')) return 'openai';
  if (url.includes('googleapis.com')) return 'gemini';
  return null;
}

// Inject the fetch interceptor into the page context via a script element
const script = document.createElement('script');
script.textContent = `(${injectInterceptor.toString()})()`;
(document.head ?? document.documentElement).appendChild(script);
script.remove();

function injectInterceptor() {
  const originalFetch = window.fetch;

  const allHosts = [
    'api.anthropic.com',
    'api.openai.com',
    'generativelanguage.googleapis.com',
    'claude.ai',
    'chatgpt.com',
    'chat.openai.com',
  ];

  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const request = new Request(...args);
    const url = request.url;

    const isRelevant = allHosts.some(host => url.includes(host));
    if (!isRelevant) {
      return originalFetch.apply(this, args);
    }

    const response = await originalFetch.apply(this, args);
    const clone = response.clone();

    // Extract rate limit headers (available on the response object)
    const rateLimitHeaders: Record<string, string> = {};
    const rlKeys = [
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
      'x-ratelimit-reset',
      'x-ratelimit-limit-tokens',
      'x-ratelimit-remaining-tokens',
      'x-ratelimit-reset-tokens',
      'x-ratelimit-limit-requests',
      'x-ratelimit-remaining-requests',
      'x-ratelimit-reset-requests',
      // Anthropic-specific
      'anthropic-ratelimit-tokens-limit',
      'anthropic-ratelimit-tokens-remaining',
      'anthropic-ratelimit-tokens-reset',
      'anthropic-ratelimit-requests-limit',
      'anthropic-ratelimit-requests-remaining',
      'anthropic-ratelimit-requests-reset',
      // OpenAI-specific
      'x-ratelimit-limit-tokens',
      'x-ratelimit-remaining-tokens',
    ];

    for (const key of rlKeys) {
      const val = response.headers.get(key);
      if (val) rateLimitHeaders[key] = val;
    }

    // Process body asynchronously
    clone.text().then(text => {
      try {
        const body = JSON.parse(text);
        window.postMessage({
          type: 'API_SPENDING_INTERCEPTED',
          url,
          usage: body.usage ?? body.usageMetadata ?? null,
          model: body.model ?? null,
          rateLimitHeaders,
          timestamp: Date.now(),
        }, '*');
      } catch {
        // Not JSON — but might still have rate limit headers
        if (Object.keys(rateLimitHeaders).length > 0) {
          window.postMessage({
            type: 'API_SPENDING_INTERCEPTED',
            url,
            usage: null,
            model: null,
            rateLimitHeaders,
            timestamp: Date.now(),
          }, '*');
        }
      }
    });

    return response;
  };
}

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
      data: {
        provider,
        headers: rateLimitHeaders,
        timestamp,
      },
    });
  }

  // Send usage event if present
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
