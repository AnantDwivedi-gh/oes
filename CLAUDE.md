<!-- RISK: macOS Accessibility API unavailable on non-macOS dev machines | MITIGATION: All AX calls wrapped in withAXFallback() with graceful stubs; CI tests mock AX layer entirely -->
<!-- RISK: Convex cold-start latency could block real-time step updates during action execution | MITIGATION: Optimistic UI updates via Zustand; Convex useQuery for eventual consistency confirmation -->
<!-- RISK: electron-vite + React-Konva + Tailwind v4 bundler conflicts (ESM/CJS mismatch) | MITIGATION: Pin exact versions; electron-vite config with explicit externals; test build early in Phase 1 -->

# OeS
# Naitiv | Product 01 | macOS-first
# "Your software. Spoken to. Zero source changes. Ever."

---

## What OeS Is

OeS (pronounced like "OS") is a desktop overlay that sits on top of any running
application and makes it AI-native — without touching the target app's source code,
binary, or files in any way.

The user opens OeS, types or speaks a command, and OeS executes it inside whatever
app they are using. "Color grade this clip." "Rename every layer starting with temp."
"Export all red-labeled sequences." "Make this interface simpler — hide everything
I don't need." OeS understands the app's current state via the macOS Accessibility API,
plans a sequence of steps to fulfill the command, and executes those steps through
OS-level automation — keyboard simulation, mouse events, and Accessibility write
operations. The target app never knows OeS exists.

OeS also lets users redesign any app's interface with a natural language command.
The user describes the UI they want and OeS renders a canvas overlay on top of the
target app — hiding complexity, surfacing only what matters. Every element in that
overlay is a commandable agent that can trigger automations.

These are not two products. This is one product with one overlay, one agent pipeline,
and one purpose: make every application on your Mac feel like it was built for AI.

---

## The One Rule That Cannot Break

OeS never modifies the source code, binary, preferences, or files of any target
application. Every action is executed through OS-level APIs (Accessibility, keyboard/
mouse simulation, AppleScript). The target app PID must never equal the OeS process PID.
This is enforced in code — not just documented.

---

## Autonomous Operation — Read This First

Claude Code must operate at MAXIMUM autonomy on this project.

- Spawn subagents for any task with 2+ independent parts. Do not work sequentially
  when parallel is possible. Consult the subagent routing table below.
- Checkpoint before any large refactor, file deletion batch, or destructive operation.
  Label every checkpoint descriptively. Do not ask — just do it.
- Self-heal continuously. After every significant code generation step, run
  `npm run type-check`. Fix all TypeScript errors before moving on. Never accumulate
  broken state between sessions.
- Background tasks. Start dev servers in the background. Never block the main
  conversation waiting for a server process.
- Hook enforcement. After any .ts or .tsx file is written: run type-check.
  After any test file is written: run `npm test -- --run`.
- Document decisions. Every non-obvious architectural choice gets a one-line comment
  starting with `// DECISION:` explaining why. Future agents need to understand this.
- Only pause for three things: destructive irreversible operations, security decisions,
  product direction changes. Everything else — make the right call and move.

---

## Architecture

```
oes/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── electron.vite.config.ts
├── .env.example
│
├── src/
│   ├── main/                        # Electron main process
│   │   ├── index.ts                 # App bootstrap, IPC setup
│   │   ├── overlay.ts               # Always-on-top window manager
│   │   ├── hotkey.ts                # Global hotkey registration
│   │   ├── ax/
│   │   │   ├── bridge.ts            # macOS AXUIElement bindings
│   │   │   ├── snapshot.ts          # AX tree → structured snapshot
│   │   │   └── executor.ts          # Step execution via AX + nut.js
│   │   └── screencap.ts             # Active window metadata
│   │
│   ├── renderer/                    # React overlay UI
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── CommandBar.tsx       # Primary input — text + voice
│   │   │   ├── ActionPlan.tsx       # Live step-by-step execution view
│   │   │   ├── OverlayCanvas.tsx    # Canvas layer for UI reskinning
│   │   │   ├── ConfirmGate.tsx      # Confirmation UI for destructive steps
│   │   │   └── StatusDot.tsx        # Ambient status indicator
│   │   └── stores/
│   │       ├── overlayStore.ts      # Zustand — UI + overlay state
│   │       └── sessionStore.ts      # Zustand — active session state
│   │
│   ├── agent/                       # All LLM orchestration lives here only
│   │   ├── context.ts               # AppContextBuilder
│   │   ├── intent.ts                # IntentParser → uses Haiku
│   │   ├── planner.ts               # ActionPlanner → uses Sonnet
│   │   ├── executor.ts              # Step executor + rollback manager
│   │   ├── uiGen.ts                 # UI overlay generator → uses Sonnet
│   │   └── prompts/
│   │       ├── system.ts            # Base OeS system prompt
│   │       ├── intent.ts            # Intent classification prompt
│   │       ├── planner.ts           # Action planning prompt
│   │       └── uiGen.ts             # UI generation prompt
│   │
│   ├── overlay/                     # Canvas overlay system
│   │   ├── schema.ts                # Zod schema — OverlayJSON
│   │   ├── renderer.ts              # OverlayJSON → Konva canvas
│   │   └── store.ts                 # Overlay CRUD — local SQLite cache
│   │
│   └── shared/
│       ├── types.ts                 # All shared TypeScript types
│       ├── ipc.ts                   # IPC channel definitions (const only)
│       └── constants.ts
│
├── convex/                          # Convex — the only backend
│   ├── schema.ts
│   ├── sessions.ts
│   ├── actionLog.ts
│   ├── overlays.ts
│   ├── appProfiles.ts
│   └── _generated/
│
└── .claude/
    ├── agents/
    │   ├── ax-specialist.md
    │   ├── ui-builder.md
    │   ├── convex-backend.md
    │   ├── type-checker.md
    │   └── test-runner.md
    └── commands/
        └── build.md
```

---

## Tech Stack — Do Not Deviate

| Layer              | Technology                                          |
|--------------------|-----------------------------------------------------|
| Desktop shell      | Electron 33+ with electron-vite                     |
| UI framework       | React 19 + TypeScript strict mode                   |
| Styling            | Tailwind CSS v4 + CSS variables                     |
| Animation          | Framer Motion — overlay open/close and step reveals |
| Client state       | Zustand                                             |
| Backend / DB       | Convex — real-time, TypeScript-native               |
| AI SDK             | @anthropic-ai/sdk with streaming                    |
| Intent model       | claude-haiku-4-5 — speed-critical classification    |
| Planning + gen     | claude-sonnet-4-6 — quality-critical generation     |
| AX bridge          | Native macOS bindings via node-gyp + osascript      |
| OS automation      | nut.js — keyboard and mouse simulation              |
| Canvas overlay     | React-Konva (Konva.js)                              |
| Schema validation  | Zod                                                 |
| Local cache        | better-sqlite3 — overlays + action history offline  |
| Testing            | Vitest + @testing-library/react                     |

---

## Convex — Rules

Convex is the only backend. No other database. No raw SQL.

- Queries: pure reads, reactive, never call external APIs.
- Mutations: the only write path. Never write from actions directly.
- Actions: call external APIs (Anthropic etc.), schedule work, call mutations.
- All DB operations live in convex/ only. Never import Convex from src/main/.
- Renderer connects via ConvexReactClient. Use useQuery() for reactive data.
- Every table has indexes for every field queried in queries.
- v.any() is banned unless accompanied by a comment explaining why.

---

## Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    deviceId: v.string(),
    activeApp: v.string(),
    windowTitle: v.string(),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("idle")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_device", ["deviceId"]),

  actionLog: defineTable({
    sessionId: v.id("sessions"),
    appName: v.string(),
    intent: v.string(),
    steps: v.array(v.object({
      stepId: v.string(),
      description: v.string(),
      type: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("done"),
        v.literal("failed"),
        v.literal("skipped")
      ),
      reversible: v.boolean(),
    })),
    outcome: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("cancelled"),
      v.literal("partial")
    ),
    durationMs: v.number(),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]).index("by_app", ["appName"]),

  overlays: defineTable({
    deviceId: v.string(),
    appName: v.string(),
    appBundleId: v.string(),
    name: v.string(),
    description: v.string(),
    overlayJson: v.string(),
    isPublic: v.boolean(),
    useCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_app", ["appName"]).index("by_device", ["deviceId"]),

  appProfiles: defineTable({
    appBundleId: v.string(),
    appName: v.string(),
    axCapabilities: v.array(v.string()),
    commonActions: v.array(v.string()),
    uiMap: v.string(),
    lastSeen: v.number(),
  }).index("by_bundle", ["appBundleId"]),
});
```

---

## Code Rules

- TypeScript strict. Every function has an explicit return type.
- `any` is banned. ESLint: `@typescript-eslint/no-explicit-any: error`
- Max function length: 40 lines. Split aggressively.
- Max file length: 250 lines. Split into modules.
- Every public function: JSDoc with @param and @returns.
- Errors are never swallowed. Always: console.error + surface to UI.
- IPC channels: defined in shared/ipc.ts as const. Never hardcode strings.
- All LLM calls in src/agent/ only. Never from renderer or main directly.
- Model routing is fixed: Haiku for intent classification, Sonnet for planning
  and generation. Never swap these without a documented reason.

---

## Invariants — Enforced in Code

1. Target app PID ≠ OeS PID — asserted in executor.ts before every action.
   Violation throws SourceModificationAttemptError.
2. reversible: false steps — must call confirmWithUser() and await approval.
3. All AX calls wrapped in withAXFallback() — graceful degradation if permission denied.
4. OverlayRenderer.render() accepts only Zod-validated OverlayJSON.
   Unvalidated input throws InvalidOverlayError.

---

## NPM Commands

```
npm run dev            # Electron + Convex dev (concurrent)
npm run build          # Production build
npm run type-check     # tsc --noEmit
npm test               # vitest run
npm run test:watch     # vitest watch
npm run convex:dev     # Convex dev server only
npm run convex:deploy  # Deploy Convex to production
npm run lint           # ESLint
```

---

## Naitiv Brand — Apply to All In-App Copy

Minimal. Warm. Confident. Never verbose. Never condescending.
OeS does not say "I'm processing your request." It says "On it." or just does it.
No loading spinners with text. Status dots only. Motion communicates state.
The product does the talking.

---

## Subagent Routing

| Task                                                   | Subagent         |
|--------------------------------------------------------|------------------|
| AX bridge, overlay window, permissions, nut.js         | ax-specialist    |
| React components, Konva, Tailwind, Framer, Zustand     | ui-builder       |
| Convex schema, queries, mutations, actions             | convex-backend   |
| TypeScript errors, shared types, Zod schemas, IPC      | type-checker     |
| Vitest tests, mocks, coverage                          | test-runner      |
| Codebase search and exploration                        | built-in explore |
| Novel architecture decisions                           | built-in plan    |
