// MaterialFlow AI — Real AI Streaming Engine
// Streams from Anthropic API via backend proxy, parses file output, tracks credits

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace('/api/generate', '')
  : '';

const API_URL = `${API_BASE}/api/generate`;
const API_V2_URL = `${API_BASE}/api/generate-v2`;
const API_PLAN_URL = `${API_BASE}/api/plan`;
const API_DISCUSS_URL = `${API_BASE}/api/discuss`;

/**
 * Parse <file name="...">...</file> blocks from streamed output
 */
export function parseFiles(text) {
  const files = {};
  const regex = /<file\s+name="([^"]+)">([\s\S]*?)<\/file>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    files[match[1]] = match[2].trim();
  }
  return files;
}

/**
 * Extract the summary text (everything after the last </file>)
 */
export function extractSummary(text) {
  const lastClose = text.lastIndexOf('</file>');
  if (lastClose === -1) return text;
  return text.slice(lastClose + 7).trim();
}

/**
 * Build a single HTML blob from parsed files for iframe preview
 */
export function buildPreviewHTML(files) {
  // If there's a direct index.html, use it
  if (files['index.html']) return files['index.html'];

  // If there's an App.tsx or App.jsx, wrap in minimal HTML
  const appFile = files['App.tsx'] || files['App.jsx'] || files['src/App.tsx'] || files['src/App.jsx'];
  const cssFile = files['styles.css'] || files['src/styles.css'] || files['src/index.css'] || '';

  if (appFile) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Preview</title>
<style>${cssFile}</style>
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
${appFile}
</script>
</body>
</html>`;
  }

  // Fallback: concatenate all files into one HTML
  const allContent = Object.values(files).join('\n');
  if (allContent.includes('<!DOCTYPE') || allContent.includes('<html')) return allContent;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview</title></head>
<body>${allContent}</body></html>`;
}

/**
 * Calculate credits from token usage
 * claude-sonnet-4-6: $3/M input, $15/M output
 * 1 credit = $0.01
 */
export function calculateCredits(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;
  const totalCost = inputCost + outputCost;
  return Math.max(1, Math.ceil(totalCost * 100));
}

/**
 * Generic SSE stream reader — shared by all streaming endpoints
 */
async function readSSEStream(response, { onText, onDone, onError, onToolUse, signal }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);

        try {
          const event = JSON.parse(data);

          if (event.type === 'text') {
            fullText += event.text;
            onText?.(event.text, fullText);
          }

          if (event.type === 'tool_use') {
            onToolUse?.(event);
          }

          if (event.type === 'done') {
            onDone?.({ fullText, ...event });
          }

          if (event.type === 'error') {
            onError?.(event.error);
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      onError?.(error.message || 'Connection failed');
    }
  }
}

/**
 * Stream code generation from the backend (v1)
 */
export function streamGenerate({ messages, apiKey, model = 'claude-sonnet-4-6', onText, onDone, onError, onStatus }) {
  const controller = new AbortController();

  (async () => {
    onStatus?.('connecting');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ messages, model }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        onError?.(err.error || `HTTP ${response.status}`);
        return;
      }

      onStatus?.('streaming');

      await readSSEStream(response, {
        onText,
        onDone: (result) => {
          const files = parseFiles(result.fullText);
          const summary = extractSummary(result.fullText);
          const html = buildPreviewHTML(files);
          const creditsUsed = calculateCredits(result.inputTokens, result.outputTokens);

          onDone?.({
            fullText: result.fullText,
            files,
            fileNames: Object.keys(files),
            html,
            summary,
            inputTokens: result.inputTokens,
            outputTokens: result.outputTokens,
            creditsUsed,
            model: result.model,
          });
        },
        onError,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        onError?.(error.message || 'Connection failed');
      }
    }
  })();

  return controller;
}

/**
 * Stream tool-use based generation (v2)
 */
export function streamGenerateV2({ messages, apiKey, model = 'claude-sonnet-4-6', projectFiles = {}, onText, onDone, onError, onToolUse, onStatus }) {
  const controller = new AbortController();

  (async () => {
    onStatus?.('connecting');

    try {
      const response = await fetch(API_V2_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ messages, model, projectFiles }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        onError?.(err.error || `HTTP ${response.status}`);
        return;
      }

      onStatus?.('streaming');

      await readSSEStream(response, {
        onText,
        onToolUse,
        onDone: (result) => {
          const creditsUsed = calculateCredits(result.inputTokens, result.outputTokens);
          onDone?.({
            ...result,
            creditsUsed,
          });
        },
        onError,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        onError?.(error.message || 'Connection failed');
      }
    }
  })();

  return controller;
}

/**
 * Stream architecture plan generation
 */
export function streamPlan({ messages, apiKey, model = 'claude-sonnet-4-6', onText, onDone, onError, onStatus }) {
  const controller = new AbortController();

  (async () => {
    onStatus?.('connecting');

    try {
      const response = await fetch(API_PLAN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ messages, model }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        onError?.(err.error || `HTTP ${response.status}`);
        return;
      }

      onStatus?.('streaming');

      await readSSEStream(response, {
        onText,
        onDone: (result) => {
          // Try to parse the plan JSON from the full text
          let plan = null;
          try {
            // Strip any markdown code fences
            const cleanText = result.fullText
              .replace(/```json\s*/g, '')
              .replace(/```\s*/g, '')
              .trim();
            plan = JSON.parse(cleanText);
          } catch (e) {
            // If JSON parse fails, return raw text
          }

          const creditsUsed = calculateCredits(result.inputTokens, result.outputTokens);
          onDone?.({
            ...result,
            plan,
            creditsUsed,
          });
        },
        onError,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        onError?.(error.message || 'Connection failed');
      }
    }
  })();

  return controller;
}

/**
 * Stream discussion/conversation response
 */
export function streamDiscuss({ messages, apiKey, model = 'claude-sonnet-4-6', onText, onDone, onError, onStatus }) {
  const controller = new AbortController();

  (async () => {
    onStatus?.('connecting');

    try {
      const response = await fetch(API_DISCUSS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ messages, model }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        onError?.(err.error || `HTTP ${response.status}`);
        return;
      }

      onStatus?.('streaming');

      await readSSEStream(response, {
        onText,
        onDone: (result) => {
          const creditsUsed = calculateCredits(result.inputTokens, result.outputTokens);
          onDone?.({ ...result, creditsUsed });
        },
        onError,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        onError?.(error.message || 'Connection failed');
      }
    }
  })();

  return controller;
}

const HEALTH_URL = `${API_BASE}/api/health`;

export async function checkBackendHealth() {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
