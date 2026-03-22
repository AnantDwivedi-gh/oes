import { systemPreferences } from 'electron';

/** AX tree node structure from macOS Accessibility API */
export interface AXNode {
  role: string;
  title: string;
  value: string;
  children: AXNode[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  enabled: boolean;
  focused: boolean;
}

/**
 * Wraps an AX call with graceful fallback on failure.
 * @param fn - The async AX operation to attempt
 * @param fallback - Value to return if the operation fails
 * @returns The result of fn() or the fallback value
 */
export async function withAXFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error('[AX]', e);
    return fallback;
  }
}

/**
 * Checks if the app has Accessibility permissions.
 * @returns true if trusted, false otherwise
 */
export function checkAXPermission(): boolean {
  // DECISION: false param means don't prompt — we handle prompting in UI
  if (process.platform !== 'darwin') {
    console.warn('[AX] Not on macOS — AX features unavailable');
    return false;
  }
  return systemPreferences.isTrustedAccessibilityClient(false);
}

/**
 * Reads the AX tree for the frontmost application.
 * @returns The root AXNode of the active window, or null
 */
export async function readAXTree(): Promise<AXNode | null> {
  return withAXFallback(async () => {
    // DECISION: Stub implementation — real AX bindings require node-gyp native module on macOS
    // Will be replaced with actual AXUIElement calls via native addon
    console.warn('[AX] readAXTree is a stub — native bindings not yet built');
    return null;
  }, null);
}
