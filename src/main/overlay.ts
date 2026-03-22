import { BrowserWindow, screen } from 'electron';
import { join } from 'path';

/**
 * Creates the always-on-top overlay window.
 * @returns The overlay BrowserWindow instance
 */
export function createOverlayWindow(): BrowserWindow {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const OVERLAY_WIDTH = 420;
  const OVERLAY_HEIGHT = 600;

  const win = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x: screenWidth - OVERLAY_WIDTH - 16,
    y: screenHeight - OVERLAY_HEIGHT - 16,
    frame: false,
    transparent: true,
    // DECISION: 'floating' level keeps overlay above all apps without stealing focus
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // DECISION: setAlwaysOnTop with 'floating' ensures overlay stays above target app
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Start hidden — hotkey toggles visibility
  win.hide();

  return win;
}
