import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ActiveAppInfo {
  appName: string;
  bundleId: string;
  windowTitle: string;
  windowBounds: { x: number; y: number; width: number; height: number };
  pid: number;
}

/**
 * Gets metadata about the frontmost application via osascript.
 * @returns ActiveAppInfo with app name, bundle ID, window title, bounds, and PID
 */
export async function getActiveAppInfo(): Promise<ActiveAppInfo> {
  if (process.platform !== 'darwin') {
    // DECISION: Return stub data on non-macOS for development
    return {
      appName: 'Unknown',
      bundleId: 'com.unknown.app',
      windowTitle: 'Unknown Window',
      windowBounds: { x: 0, y: 0, width: 1920, height: 1080 },
      pid: 0,
    };
  }

  try {
    const script = `
      tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set appName to name of frontApp
        set appPid to unix id of frontApp
        set bundleId to bundle identifier of frontApp
        tell frontApp
          set winTitle to name of front window
          set winPos to position of front window
          set winSize to size of front window
        end tell
        return appName & "|" & bundleId & "|" & winTitle & "|" & (item 1 of winPos) & "," & (item 2 of winPos) & "|" & (item 1 of winSize) & "," & (item 2 of winSize) & "|" & appPid
      end tell
    `;

    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
    const parts = stdout.trim().split('|');

    const [posX, posY] = (parts[3] ?? '0,0').split(',').map(Number);
    const [sizeW, sizeH] = (parts[4] ?? '1920,1080').split(',').map(Number);

    return {
      appName: parts[0] ?? 'Unknown',
      bundleId: parts[1] ?? 'com.unknown.app',
      windowTitle: parts[2] ?? 'Unknown Window',
      windowBounds: { x: posX, y: posY, width: sizeW, height: sizeH },
      pid: parseInt(parts[5] ?? '0', 10),
    };
  } catch (error) {
    console.error('[Screencap] Failed to get active app info:', error);
    return {
      appName: 'Unknown',
      bundleId: 'com.unknown.app',
      windowTitle: 'Unknown Window',
      windowBounds: { x: 0, y: 0, width: 1920, height: 1080 },
      pid: 0,
    };
  }
}
