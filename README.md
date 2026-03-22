# OeS

**Your software. Spoken to. Zero source changes. Ever.**

OeS is a desktop overlay that makes any macOS application AI-native — without touching the target app's source code, binary, or files.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY and VITE_CONVEX_URL to .env

# Start Convex (requires login first)
npx convex dev

# Start development
npm run dev
```

## Required macOS Permissions

- **Accessibility**: System Preferences → Privacy & Security → Accessibility → Enable OeS
- **Screen Recording** (optional): For window metadata detection

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL from `npx convex dev` |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for intent parsing and planning |

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Electron + Convex dev servers |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript validation |
| `npm test` | Run test suite |
| `npm run lint` | ESLint check |

## Hotkey

**Cmd+Shift+Space** — Toggle overlay visibility

## Architecture

- **Electron** main process: window management, AX bridge, hotkeys
- **React** renderer: overlay UI with Tailwind, Framer Motion, React-Konva
- **Agent pipeline**: intent (Haiku) → planner (Sonnet) → executor
- **Convex**: real-time backend for sessions, action logs, overlays
