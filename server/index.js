// MaterialFlow AI — Backend Proxy Server
// Handles Anthropic API streaming to avoid exposing API keys in the browser

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();

// Security & middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter (production should use Redis-backed)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW;
  }

  record.count++;
  rateLimitMap.set(ip, record);

  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  // Clean old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  next();
}

const SYSTEM_PROMPT = `You are an expert full-stack developer inside MaterialFlow AI, a code builder platform.

When the user describes an app, generate ALL files wrapped in XML tags like this:

<file name="index.html">
<!-- full file contents here -->
</file>

<file name="src/App.tsx">
// full file contents here
</file>

<file name="src/styles.css">
/* full file contents */
</file>

Rules:
- Always output complete, runnable code. Never truncate or use placeholders.
- For Web apps: generate a single self-contained index.html with inline CSS and JS that works standalone.
- For React apps: generate index.html + component files.
- For Mobile (React Native): use Expo SDK with react-native components.
- Use modern design: dark themes, gradients, Inter font, smooth animations, rounded corners.
- Include responsive design and accessibility attributes.
- After all files, write a brief summary of what you built and key features.
- Temperature: 0.2 for deterministic code output.`;

// POST /api/generate — streams Anthropic response via SSE
app.post('/api/generate', rateLimit, async (req, res) => {
  const { messages, model = 'claude-sonnet-4-6', maxTokens = 16000 } = req.body;

  // Read API key from Authorization header (preferred) or body (fallback)
  const authHeader = req.headers.authorization;
  const apiKey = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.body.apiKey;

  // Input validation
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    return res.status(400).json({ error: 'Valid API key is required. Add one in Settings > API Keys.' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required and must not be empty.' });
  }

  // Validate each message
  for (const msg of messages) {
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      return res.status(400).json({ error: 'Each message must have a role and text content.' });
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      return res.status(400).json({ error: 'Message role must be "user" or "assistant".' });
    }
  }

  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 16000, 100), 64000);
  const safeModel = typeof model === 'string' && model.length < 100 ? model : 'claude-sonnet-4-6';

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  let streamAborted = false;

  try {
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: safeModel,
      max_tokens: safeMaxTokens,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    let inputTokens = 0;
    let outputTokens = 0;

    stream.on('text', (text) => {
      if (!streamAborted) {
        res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
      }
    });

    stream.on('message', (message) => {
      inputTokens = message.usage?.input_tokens || 0;
      outputTokens = message.usage?.output_tokens || 0;
    });

    stream.on('finalMessage', (message) => {
      if (streamAborted) return;
      inputTokens = message.usage?.input_tokens || 0;
      outputTokens = message.usage?.output_tokens || 0;

      res.write(`data: ${JSON.stringify({
        type: 'done',
        inputTokens,
        outputTokens,
        model: message.model,
        stopReason: message.stop_reason,
      })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      if (streamAborted) return;
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Stream failed' })}\n\n`);
      res.end();
    });

    // Handle client disconnect gracefully (BUG #8 fix)
    req.on('close', () => {
      streamAborted = true;
      try {
        stream.controller?.abort();
      } catch (e) {
        // Stream already finished or controller unavailable — safe to ignore
      }
    });

  } catch (error) {
    console.error('API error:', error);
    if (!streamAborted) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Failed to connect to Anthropic API' })}\n\n`);
      res.end();
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MaterialFlow AI backend running on port ${PORT}`);
});
