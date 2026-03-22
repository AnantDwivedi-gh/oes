import { readAXTree, checkAXPermission, withAXFallback } from './bridge';
import { getActiveAppInfo } from '../screencap';
import type { AppContext } from '../../shared/types';

/**
 * Builds a full AppContext snapshot from the active window.
 * @returns AppContext with app metadata and AX tree
 */
export async function takeSnapshot(): Promise<AppContext> {
  const appInfo = await getActiveAppInfo();

  const hasPermission = checkAXPermission();

  const axTree = hasPermission
    ? await withAXFallback(async () => readAXTree(), null)
    : null;

  return {
    appName: appInfo.appName,
    bundleId: appInfo.bundleId,
    windowTitle: appInfo.windowTitle,
    windowBounds: appInfo.windowBounds,
    axTree,
    timestamp: Date.now(),
  };
}
