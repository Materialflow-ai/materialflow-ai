// MaterialFlow AI — Real AI Streaming Engine
// Streams from Anthropic API via backend proxy, parses file output, tracks credits

const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api/generate';

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
 * Stream code generation from the backend
 * @param {Object} options
 * @param {Array} options.messages - Chat history [{role, content}]
 * @param {string} options.apiKey - Anthropic API key
 * @param {string} options.model - Model ID
 * @param {function} options.onText - Called with each text chunk
 * @param {function} options.onDone - Called when stream completes {files, summary, inputTokens, outputTokens, creditsUsed}
 * @param {function} options.onError - Called on error
 * @param {function} options.onStatus - Called with status updates
 * @returns {AbortController} - Call .abort() to cancel
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          try {
            const event = JSON.parse(data);

            if (event.type === 'text') {
              fullText += event.text;
              onText?.(event.text, fullText);
            }

            if (event.type === 'done') {
              const files = parseFiles(fullText);
              const summary = extractSummary(fullText);
              const html = buildPreviewHTML(files);
              const creditsUsed = calculateCredits(event.inputTokens, event.outputTokens);

              onDone?.({
                fullText,
                files,
                fileNames: Object.keys(files),
                html,
                summary,
                inputTokens: event.inputTokens,
                outputTokens: event.outputTokens,
                creditsUsed,
                model: event.model,
              });
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
  })();

  return controller;
}

const HEALTH_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
  ? import.meta.env.VITE_API_URL.replace('/api/generate', '/api/health')
  : '/api/health';

export async function checkBackendHealth() {
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
