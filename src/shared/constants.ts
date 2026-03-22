/** Default hotkey to toggle OeS overlay */
export const DEFAULT_HOTKEY = 'CommandOrControl+Shift+Space';

/** Timeout for AX tree read operations (ms) */
export const AX_TIMEOUT_MS = 5000;

/** Timeout for LLM API calls (ms) */
export const LLM_TIMEOUT_MS = 30000;

/** Maximum action steps per plan */
export const MAX_PLAN_STEPS = 20;

/** Model IDs — fixed routing per CLAUDE.md rules */
export const MODELS = {
  /** Speed-critical: intent classification */
  INTENT: 'claude-haiku-4-5-20251001',
  /** Quality-critical: planning and generation */
  PLANNER: 'claude-sonnet-4-6-20250514',
} as const;

/** Overlay dimensions */
export const OVERLAY = {
  WIDTH: 420,
  HEIGHT: 600,
  MARGIN: 16,
} as const;

/** Naitiv brand colors */
export const BRAND = {
  BG: '#08080F',
  SURFACE: '#111118',
  ACCENT: '#C8FF00',
  TEXT: '#E2E2F0',
  TEXT_MUTED: '#8888A0',
} as const;
