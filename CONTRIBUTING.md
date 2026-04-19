# Contributing to MaterialFlow AI

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/<your-username>/materialflow-ai.git
cd materialflow-ai

# Install dependencies
npm install

# Start development
npm run dev:full
```

## Branch Strategy

- `main` — Production-ready code. All PRs target this branch.
- `develop` — Integration branch for features in progress.
- `feature/*` — Feature branches (e.g., `feature/add-supabase-auth`).
- `fix/*` — Bug fix branches (e.g., `fix/blob-url-leak`).
- `hotfix/*` — Emergency production fixes.

## Code Standards

### JavaScript / React
- Use functional components with hooks
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Destructure props in function signature
- No `var` — only `const` and `let`

### CSS
- Use CSS custom properties from the design system (e.g., `var(--accent)`)
- Never hardcode colors — always reference design tokens
- Follow BEM-like naming: `.component-element` (e.g., `.chat-panel`, `.chat-input`)
- Dark theme is default; light theme overrides go in `[data-theme="light"]`

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add model selection dropdown
fix: resolve blob URL memory leak in WorkbenchPanel
docs: update API key setup instructions
style: align header buttons
refactor: extract file icon logic to utility
perf: lazy-load Monaco editor
security: sanitize user input in server endpoint
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run build` passes with zero errors
4. Open a PR using the provided template
5. Request review from a maintainer

## Reporting Issues

Use the GitHub issue templates:
- **Bug Report** — For bugs with reproduction steps
- **Feature Request** — For new feature proposals

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
