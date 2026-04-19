# MaterialFlow AI

**AI-powered platform for building full-stack web and mobile applications.**
Prompt, run, edit, and deploy — all from your browser.

---

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Anthropic_Claude-API-191919?style=for-the-badge&logo=anthropic&logoColor=white" alt="Anthropic" />
  <img src="https://img.shields.io/badge/Monaco_Editor-VSCode-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
</p>

---

## Features

- **AI Code Generation** — Describe your app and get a full working codebase
- **Live Preview** — See your app running in real-time in an embedded browser
- **Monaco Code Editor** — Full VS Code editing experience with syntax highlighting
- **Multi-Model Support** — Claude Sonnet 4, Opus 4, GPT-4o, Gemini 2.5 Pro, and more
- **Template Library** — Pre-built templates for common app types (dashboards, e-commerce, etc.)
- **Project Management** — Multiple tabs, renaming, forking, and ZIP export
- **Dark and Light Themes** — Premium design system with smooth theme transitions
- **Mobile Preview** — Device frame preview for React Native / Expo apps
- **Architecture Planner** — Plan your app's component tree and tech stack before building
- **Discussion Mode** — Discuss ideas with AI without generating code
- **One-Click Deploy** — Deploy to Netlify, Vercel, Cloudflare, or GitHub Pages

## Quick Start

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd materialflow-ai

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development (frontend only)
npm run dev

# Start with backend (for AI streaming)
npm run dev:full
```

The app runs at **http://localhost:5173**
The backend API runs at **http://localhost:3001**

### API Keys

To use AI code generation, add your Anthropic API key in **Settings > API Keys**.
Keys are stored locally in your browser's localStorage.

## Project Structure

```
materialflow-ai/
|-- index.html              # App entry point with SEO meta tags
|-- package.json            # Dependencies and scripts
|-- vite.config.js          # Vite config with API proxy and code splitting
|-- .env.example            # Environment variable documentation
|-- server/
|   +-- index.js            # Express backend for Anthropic API proxy
+-- src/
    |-- main.jsx            # React root with ErrorBoundary
    |-- App.jsx             # Main app with state management
    |-- components/
    |   |-- Header.jsx      # Top bar with project controls
    |   |-- Sidebar.jsx     # Project list and templates
    |   |-- ChatPanel.jsx   # AI chat with template cards
    |   |-- WorkbenchPanel.jsx  # Preview + Monaco code editor
    |   |-- PlanPanel.jsx   # Architecture planner
    |   |-- DiscussPanel.jsx # Discussion mode
    |   |-- SettingsPanel.jsx # Settings with API key management
    |   |-- ProjectTabs.jsx # Multi-project tabs
    |   |-- StatusBar.jsx   # Bottom status bar
    |   |-- DeployModal.jsx # Deployment wizard
    |   |-- DeployFab.jsx   # Deploy floating button
    |   |-- NewProjectModal.jsx # New project wizard
    |   |-- ModelSelector.jsx # AI model picker
    |   |-- AgentStatus.jsx # AI agent status indicator
    |   |-- Toast.jsx       # Toast notification system
    |   |-- ErrorBoundary.jsx # Global error recovery
    |   +-- ConfirmDialog.jsx # Custom confirm dialog
    |-- engine/
    |   |-- codeGenerator.js   # Template-based code generation
    |   |-- streamEngine.js    # Real-time AI streaming client
    |   +-- projectStore.js    # localStorage persistence layer
    +-- styles/
        +-- index.css       # Complete design system (dark/light themes)
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run server` | Start Express backend server |
| `npm run dev:full` | Start both frontend and backend concurrently |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6, vanilla CSS design system |
| Editor | Monaco Editor (VS Code engine), lazy loaded |
| Backend | Express.js proxy for Anthropic API streaming (SSE) |
| Storage | localStorage for projects, settings, API keys |
| Export | JSZip for multi-file project export |
| Icons | Lucide React + Material Symbols |
| CI/CD | GitHub Actions (lint, build, security, deploy) |
| Container | Docker multi-stage build, Nginx reverse proxy |
| Deploy | Vercel, Netlify, Cloudflare Pages, GitHub Pages |

## Deployment

### Vercel

```bash
npx vercel --prod
```

Configuration is in `vercel.json`.

### Netlify

```bash
npx netlify deploy --prod --dir=dist
```

Configuration is in `netlify.toml`.

### Docker

```bash
# Build and run
docker compose up -d

# With Nginx reverse proxy (production profile)
docker compose --profile production up -d
```

### GitHub Actions

Push to `main` triggers automatic deployment. Required secrets:

| Secret | Purpose |
|--------|---------|
| `NETLIFY_AUTH_TOKEN` | Netlify deploy token |
| `NETLIFY_SITE_ID` | Netlify site identifier |
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

## Security

- API keys are stored locally in the browser (never sent to our servers)
- Backend proxy prevents client-side API key exposure
- Rate limiting on API proxy endpoint (20 req/min)
- Input validation on all server endpoints
- CORS enabled for development
- Security headers via Nginx (CSP, X-Frame-Options, HSTS)

## License

[MIT](LICENSE)
