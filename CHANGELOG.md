# Changelog

All notable changes to MaterialFlow AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-19

### Added
- AI-powered code generation with Anthropic Claude streaming
- Live preview with embedded browser and mobile device frame
- Monaco code editor with syntax highlighting and multi-file support
- Dark and light theme with smooth transitions
- Project management (create, rename, fork, delete, export)
- Template library (gym tracker, dashboard, todo, e-commerce, landing page, weather, chat)
- Architecture planner (Plan mode)
- AI discussion mode (Discuss mode)
- ZIP and single HTML export
- One-click deploy UI (Netlify, Vercel, Cloudflare, GitHub Pages)
- Model selector with multiple AI provider support
- Toast notification system
- Global error boundary with recovery UI
- Custom confirmation dialogs
- Keyboard shortcuts (Ctrl+S, Ctrl+N, Ctrl+E, Escape)
- Security warning for API key storage

### Fixed
- Build-breaking unescaped quotes in template literals
- Blob URL memory leak in preview panel
- File icon crash when receiving object instead of string
- Missing streaming status in agent indicator
- Preview not rebuilding when editing non-HTML files
- Server crash on stream abort
- Native `confirm()` dialogs replaced with themed components

### Security
- API keys sent via Authorization header instead of request body
- Server-side input validation for all API parameters
- Rate limiting on API proxy endpoint (20 req/min)
- Environment-based API URL configuration
- Hardcoded localhost URL removed

### Infrastructure
- CI/CD pipeline with GitHub Actions (lint, build, security, deploy)
- Docker multi-stage build with non-root user
- Docker Compose for local and production environments
- Nginx reverse proxy config with SSE support
- Vercel deployment config
- Netlify deployment config
- ESLint + Prettier code quality tools
- EditorConfig for cross-editor consistency
- Comprehensive README with architecture docs
- PR and issue templates
- Contributing guide
- MIT license
