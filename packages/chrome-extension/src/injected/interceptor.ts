// This file is injected into the page context as an external script
// to bypass CSP restrictions on inline scripts.

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

  // Extract rate limit headers
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
    'anthropic-ratelimit-tokens-limit',
    'anthropic-ratelimit-tokens-remaining',
    'anthropic-ratelimit-tokens-reset',
    'anthropic-ratelimit-requests-limit',
    'anthropic-ratelimit-requests-remaining',
    'anthropic-ratelimit-requests-reset',
  ];

  for (const key of rlKeys) {
    const val = response.headers.get(key);
    if (val) rateLimitHeaders[key] = val;
  }

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
