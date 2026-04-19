// MaterialFlow AI — Model Router
// Routes AI requests to the correct provider (Anthropic, OpenAI, Google, DeepSeek)
// Each provider gets its own streaming implementation

const API_BASE = '';

/**
 * Route a generation request to the correct model provider
 */
export async function routeGeneration({ messages, apiKey, model, maxTokens = 16000, onText, onDone, onError, onStatus, providerKeys = {} }) {
  const provider = getProvider(model);
  const key = providerKeys[provider] || apiKey;

  if (!key) {
    onError?.(`No API key configured for ${provider}. Add one in Settings > API Keys.`);
    return null;
  }

  switch (provider) {
    case 'Anthropic':
      return streamAnthropic({ messages, apiKey: key, model, maxTokens, onText, onDone, onError, onStatus });
    case 'OpenAI':
      return streamOpenAI({ messages, apiKey: key, model, maxTokens, onText, onDone, onError, onStatus });
    case 'Google':
      return streamGoogle({ messages, apiKey: key, model, maxTokens, onText, onDone, onError, onStatus });
    case 'DeepSeek':
      return streamOpenAICompatible({ messages, apiKey: key, model, maxTokens, baseUrl: 'https://api.deepseek.com', onText, onDone, onError, onStatus });
    default:
      onError?.(`Unknown provider for model: ${model}`);
      return null;
  }
}

function getProvider(modelId) {
  if (modelId.startsWith('claude')) return 'Anthropic';
  if (modelId.startsWith('gpt') || modelId.startsWith('o1') || modelId.startsWith('o3')) return 'OpenAI';
  if (modelId.startsWith('gemini')) return 'Google';
  if (modelId.startsWith('deepseek')) return 'DeepSeek';
  if (modelId.startsWith('llama')) return 'Meta';
  return 'Anthropic'; // Default fallback
}

/**
 * Get all provider names that need API keys for the configured models
 */
export function getRequiredProviders(models) {
  return [...new Set(models.map(m => getProvider(m.id)))];
}

// ═══════════════════════════════════════════════
// Anthropic Streaming (via backend proxy)
// ═══════════════════════════════════════════════

async function streamAnthropic({ messages, apiKey, model, maxTokens, onText, onDone, onError, onStatus }) {
  const controller = new AbortController();
  onStatus?.('streaming');

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ messages, model, maxTokens }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onError?.(err.error || `Anthropic error: ${res.status}`);
      return controller;
    }

    await readSSE(res, { onText, onDone, onError });
  } catch (e) {
    if (e.name !== 'AbortError') onError?.(e.message);
  }
  return controller;
}

// ═══════════════════════════════════════════════
// OpenAI Streaming (direct — browser-safe with CORS)
// ═══════════════════════════════════════════════

async function streamOpenAI({ messages, apiKey, model, maxTokens, onText, onDone, onError, onStatus }) {
  return streamOpenAICompatible({ messages, apiKey, model, maxTokens, baseUrl: 'https://api.openai.com', onText, onDone, onError, onStatus });
}

async function streamOpenAICompatible({ messages, apiKey, model, maxTokens, baseUrl, onText, onDone, onError, onStatus }) {
  const controller = new AbortController();
  onStatus?.('streaming');

  try {
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMsgs = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role, content: m.content,
    }));

    const body = {
      model,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        ...(systemMsg ? [{ role: 'system', content: systemMsg.content }] : []),
        ...chatMsgs,
      ],
    };

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onError?.(err.error?.message || `${model} error: ${res.status}`);
      return controller;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          onDone?.({ fullText, inputTokens: 0, outputTokens: 0 });
          return controller;
        }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            onText?.(delta, fullText);
          }
        } catch (e) { /* skip */ }
      }
    }

    onDone?.({ fullText, inputTokens: 0, outputTokens: 0 });
  } catch (e) {
    if (e.name !== 'AbortError') onError?.(e.message);
  }
  return controller;
}

// ═══════════════════════════════════════════════
// Google Gemini Streaming
// ═══════════════════════════════════════════════

async function streamGoogle({ messages, apiKey, model, maxTokens, onText, onDone, onError, onStatus }) {
  const controller = new AbortController();
  onStatus?.('streaming');

  try {
    const geminiModel = model.replace('gemini-', 'gemini-');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const systemInstruction = messages.find(m => m.role === 'system');

    const body = {
      contents,
      generationConfig: { maxOutputTokens: maxTokens },
    };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      onError?.(err.error?.message || `Gemini error: ${res.status}`);
      return controller;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const parsed = JSON.parse(line.slice(6));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullText += text;
            onText?.(text, fullText);
          }
        } catch (e) { /* skip */ }
      }
    }

    onDone?.({ fullText, inputTokens: 0, outputTokens: 0 });
  } catch (e) {
    if (e.name !== 'AbortError') onError?.(e.message);
  }
  return controller;
}

// ═══════════════════════════════════════════════
// Shared SSE Reader (for Anthropic proxy)
// ═══════════════════════════════════════════════

async function readSSE(response, { onText, onDone, onError }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'text') { fullText += event.text; onText?.(event.text, fullText); }
        if (event.type === 'done') onDone?.({ fullText, ...event });
        if (event.type === 'error') onError?.(event.error);
      } catch (e) { /* skip */ }
    }
  }
}
