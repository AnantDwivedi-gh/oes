// DECISION: Local SQLite cache for overlays — enables offline use
// Will use better-sqlite3 in main process, accessed via IPC from renderer
// For now, in-memory store as placeholder until main process SQLite is wired

import type { OverlayJSON } from '../shared/types';

interface CachedOverlay {
  id: string;
  appName: string;
  appBundleId: string;
  name: string;
  overlayJson: OverlayJSON;
  createdAt: number;
  updatedAt: number;
}

/** In-memory overlay cache — will be backed by better-sqlite3 */
const cache = new Map<string, CachedOverlay>();

/**
 * Saves an overlay to the local cache.
 * @param overlay - The overlay to cache
 */
export function cacheOverlay(overlay: CachedOverlay): void {
  cache.set(overlay.id, overlay);
}

/**
 * Retrieves a cached overlay by ID.
 * @param id - The overlay ID
 * @returns The cached overlay or undefined
 */
export function getCachedOverlay(id: string): CachedOverlay | undefined {
  return cache.get(id);
}

/**
 * Gets all cached overlays for an app.
 * @param appName - The application name to filter by
 * @returns Array of cached overlays
 */
export function getCachedOverlaysByApp(appName: string): CachedOverlay[] {
  return Array.from(cache.values()).filter((o) => o.appName === appName);
}

/**
 * Removes a cached overlay.
 * @param id - The overlay ID to remove
 */
export function removeCachedOverlay(id: string): void {
  cache.delete(id);
}
