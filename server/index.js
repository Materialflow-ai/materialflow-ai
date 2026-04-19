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

// ═══════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════

const SYSTEM_PROMPT_BUILD = `You are an expert full-stack developer inside MaterialFlow AI, a code builder platform.

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

const SYSTEM_PROMPT_PLAN = `You are an expert software architect inside MaterialFlow AI.

The user will describe an app idea. Analyze it and produce a detailed architecture plan in the following JSON structure. Respond ONLY with valid JSON, no markdown fences:

{
  "summary": "Brief 1-2 sentence overview of what will be built",
  "components": [
    { "name": "ComponentName", "purpose": "What it does", "props": ["prop1", "prop2"] }
  ],
  "techStack": {
    "frontend": "React + Vite + TypeScript",
    "styling": "Tailwind CSS",
    "backend": "Node.js + Express",
    "database": "Supabase (PostgreSQL)",
    "hosting": "Vercel Edge Network"
  },
  "apis": [
    { "endpoint": "/api/resource", "method": "GET", "purpose": "Description" }
  ],
  "estimatedFiles": ["src/App.tsx", "src/components/Header.tsx"],
  "keyFeatures": ["Feature 1", "Feature 2"],
  "estimatedComplexity": "medium",
  "estimatedBuildTime": "~2 minutes"
}

Rules:
- Be specific and realistic with component names and API designs.
- Tailor the tech stack to the project needs.
- Include 5-8 components, 3-6 API endpoints, and 6-10 files.
- Consider auth, database, and deployment needs.`;

const SYSTEM_PROMPT_DISCUSS = `You are a senior developer advisor inside MaterialFlow AI.

The user wants to discuss their project — ask questions, debate approaches, explore requirements.
You should NOT generate any code. Instead:
- Give thoughtful, specific advice about architecture, technology choices, and design patterns.
- Ask clarifying questions to understand requirements better.
- Suggest best practices and potential pitfalls.
- Reference real tools, libraries, and services by name.
- Keep responses conversational but technically deep.
- Use markdown formatting with **bold** for key terms and bullet points for lists.`;

const SYSTEM_PROMPT_TOOLUSE = `You are an expert developer inside MaterialFlow AI. 
You have access to tools to read and modify project files surgically. 
When the user asks to edit part of their app, use the write_file or edit_file tools to make minimal, targeted changes instead of regenerating everything.
Always explain what you're changing and why.`;

// ═══════════════════════════════════════════════
// TOOL DEFINITIONS (Phase 3)
// ═══════════════════════════════════════════════

const TOOLS = [
  {
    name: 'read_file',
    description: 'Read the contents of a file in the project.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root, e.g. "src/App.tsx"' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Create or overwrite a file with the given content. Use for new files or full rewrites.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root' },
        content: { type: 'string', description: 'Complete file contents to write' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'edit_file',
    description: 'Make a surgical edit to an existing file by searching for a string and replacing it.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root' },
        search: { type: 'string', description: 'Exact string to search for in the file' },
        replace: { type: 'string', description: 'Replacement string' },
      },
      required: ['path', 'search', 'replace'],
    },
  },
  {
    name: 'delete_file',
    description: 'Delete a file from the project.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to delete' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_files',
    description: 'List all files currently in the project.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_dependency',
    description: 'Add an NPM package dependency to the project.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Package name, e.g. "framer-motion"' },
        version: { type: 'string', description: 'Version range, e.g. "^11.0.0". Optional.' },
      },
      required: ['name'],
    },
  },
];

// ═══════════════════════════════════════════════
// HELPER: Extract API key from request
// ═══════════════════════════════════════════════

function extractApiKey(req) {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.body.apiKey;
}

function validateRequest(req, res) {
  const apiKey = extractApiKey(req);

  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    res.status(400).json({ error: 'Valid API key is required. Add one in Settings > API Keys.' });
    return null;
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required and must not be empty.' });
    return null;
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      res.status(400).json({ error: 'Each message must have a role and text content.' });
      return null;
    }
    if (!['user', 'assistant'].includes(msg.role)) {
      res.status(400).json({ error: 'Message role must be "user" or "assistant".' });
      return null;
    }
  }

  return apiKey;
}

function setupSSE(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
}

// ═══════════════════════════════════════════════
// POST /api/generate — streams Anthropic response via SSE (v1)
// ═══════════════════════════════════════════════

app.post('/api/generate', rateLimit, async (req, res) => {
  const apiKey = validateRequest(req, res);
  if (!apiKey) return;

  const { messages, model = 'claude-sonnet-4-6', maxTokens = 16000 } = req.body;
  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 16000, 100), 64000);
  const safeModel = typeof model === 'string' && model.length < 100 ? model : 'claude-sonnet-4-6';

  setupSSE(res);
  let streamAborted = false;

  try {
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: safeModel,
      max_tokens: safeMaxTokens,
      system: SYSTEM_PROMPT_BUILD,
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

// ═══════════════════════════════════════════════
// POST /api/generate-v2 — Tool-use based generation (Phase 3)
// ═══════════════════════════════════════════════

app.post('/api/generate-v2', rateLimit, async (req, res) => {
  const apiKey = validateRequest(req, res);
  if (!apiKey) return;

  const { messages, model = 'claude-sonnet-4-6', maxTokens = 16000, projectFiles = {} } = req.body;
  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 16000, 100), 64000);
  const safeModel = typeof model === 'string' && model.length < 100 ? model : 'claude-sonnet-4-6';

  setupSSE(res);
  let streamAborted = false;

  try {
    const client = new Anthropic({ apiKey });

    // Build context about current project files
    const fileContext = Object.keys(projectFiles).length > 0
      ? `\n\nCurrent project files:\n${Object.keys(projectFiles).map(f => `- ${f}`).join('\n')}`
      : '';

    const stream = await client.messages.stream({
      model: safeModel,
      max_tokens: safeMaxTokens,
      system: SYSTEM_PROMPT_TOOLUSE + fileContext,
      tools: TOOLS,
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

    // Handle tool use events
    stream.on('contentBlock', (block) => {
      if (streamAborted) return;
      if (block.type === 'tool_use') {
        res.write(`data: ${JSON.stringify({
          type: 'tool_use',
          toolName: block.name,
          toolInput: block.input,
          toolId: block.id,
        })}\n\n`);
      }
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
      console.error('V2 Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Stream failed' })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      streamAborted = true;
      try { stream.controller?.abort(); } catch (e) {}
    });

  } catch (error) {
    console.error('V2 API error:', error);
    if (!streamAborted) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Failed to connect to Anthropic API' })}\n\n`);
      res.end();
    }
  }
});

// ═══════════════════════════════════════════════
// POST /api/plan — Architecture planning (Phase 4)
// ═══════════════════════════════════════════════

app.post('/api/plan', rateLimit, async (req, res) => {
  const apiKey = validateRequest(req, res);
  if (!apiKey) return;

  const { messages, model = 'claude-sonnet-4-6', maxTokens = 8000 } = req.body;
  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 8000, 100), 16000);
  const safeModel = typeof model === 'string' && model.length < 100 ? model : 'claude-sonnet-4-6';

  setupSSE(res);
  let streamAborted = false;

  try {
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: safeModel,
      max_tokens: safeMaxTokens,
      system: SYSTEM_PROMPT_PLAN,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    let inputTokens = 0;
    let outputTokens = 0;

    stream.on('text', (text) => {
      if (!streamAborted) {
        res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
      }
    });

    stream.on('finalMessage', (message) => {
      if (streamAborted) return;
      inputTokens = message.usage?.input_tokens || 0;
      outputTokens = message.usage?.output_tokens || 0;
      res.write(`data: ${JSON.stringify({ type: 'done', inputTokens, outputTokens, model: message.model })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      if (streamAborted) return;
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Plan generation failed' })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      streamAborted = true;
      try { stream.controller?.abort(); } catch (e) {}
    });

  } catch (error) {
    console.error('Plan API error:', error);
    if (!streamAborted) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Failed to connect' })}\n\n`);
      res.end();
    }
  }
});

// ═══════════════════════════════════════════════
// POST /api/discuss — Conversational advice (Phase 4)
// ═══════════════════════════════════════════════

app.post('/api/discuss', rateLimit, async (req, res) => {
  const apiKey = validateRequest(req, res);
  if (!apiKey) return;

  const { messages, model = 'claude-sonnet-4-6', maxTokens = 4000 } = req.body;
  const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 4000, 100), 16000);
  const safeModel = typeof model === 'string' && model.length < 100 ? model : 'claude-sonnet-4-6';

  setupSSE(res);
  let streamAborted = false;

  try {
    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: safeModel,
      max_tokens: safeMaxTokens,
      system: SYSTEM_PROMPT_DISCUSS,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    let inputTokens = 0;
    let outputTokens = 0;

    stream.on('text', (text) => {
      if (!streamAborted) {
        res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
      }
    });

    stream.on('finalMessage', (message) => {
      if (streamAborted) return;
      inputTokens = message.usage?.input_tokens || 0;
      outputTokens = message.usage?.output_tokens || 0;
      res.write(`data: ${JSON.stringify({ type: 'done', inputTokens, outputTokens, model: message.model })}\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      if (streamAborted) return;
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Discussion failed' })}\n\n`);
      res.end();
    });

    req.on('close', () => {
      streamAborted = true;
      try { stream.controller?.abort(); } catch (e) {}
    });

  } catch (error) {
    console.error('Discuss API error:', error);
    if (!streamAborted) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Failed to connect' })}\n\n`);
      res.end();
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), version: '2.0.0' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MaterialFlow AI backend running on port ${PORT}`);
  console.log(`  → /api/generate   (v1 — full code gen)`);
  console.log(`  → /api/generate-v2 (v2 — tool use)`);
  console.log(`  → /api/plan       (architecture planning)`);
  console.log(`  → /api/discuss    (conversational advice)`);
});
