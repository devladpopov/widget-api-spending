// Content script: monkey-patches fetch() to intercept AI API responses
// and extract usage data without requiring Admin API keys.

const AI_API_HOSTS = [
  'api.anthropic.com',
  'api.openai.com',
  'generativelanguage.googleapis.com',
];

function isAIApiUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return AI_API_HOSTS.some(host => parsed.hostname === host);
  } catch {
    return false;
  }
}

function detectProvider(url: string): string | null {
  if (url.includes('api.anthropic.com')) return 'anthropic';
  if (url.includes('api.openai.com')) return 'openai';
  if (url.includes('generativelanguage.googleapis.com')) return 'gemini';
  return null;
}

// Inject the fetch interceptor into the page context via a script element
const script = document.createElement('script');
script.textContent = `(${injectInterceptor.toString()})()`;
(document.head ?? document.documentElement).appendChild(script);
script.remove();

function injectInterceptor() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const request = new Request(...args);
    const url = request.url;

    const aiHosts = [
      'api.anthropic.com',
      'api.openai.com',
      'generativelanguage.googleapis.com',
    ];

    const isAI = aiHosts.some(host => url.includes(host));
    if (!isAI) {
      return originalFetch.apply(this, args);
    }

    const response = await originalFetch.apply(this, args);

    // Clone so we can read the body without consuming it
    const clone = response.clone();

    // Process asynchronously to not block the caller
    clone.text().then(text => {
      try {
        const body = JSON.parse(text);
        window.postMessage({
          type: 'API_SPENDING_INTERCEPTED',
          url,
          usage: body.usage ?? body.usageMetadata ?? null,
          model: body.model ?? null,
          timestamp: Date.now(),
        }, '*');
      } catch {
        // Not JSON or no usage data — ignore
      }
    });

    return response;
  };
}

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type !== 'API_SPENDING_INTERCEPTED') return;

  const { url, usage, model, timestamp } = event.data;
  if (!usage) return;

  const provider = detectProvider(url);
  if (!provider) return;

  // Normalize usage data across providers
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
