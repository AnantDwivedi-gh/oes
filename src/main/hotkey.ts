import { BrowserWindow, globalShortcut } from 'electron';

// DECISION: Default hotkey matches macOS convention. User-configurable via electron-store later.
const DEFAULT_HOTKEY = 'CommandOrControl+Shift+Space';

/**
 * Registers the global hotkey to toggle the overlay window.
 * @param overlayWindow - The overlay BrowserWindow to toggle
 */
export function registerHotkey(overlayWindow: BrowserWindow): void {
  const success = globalShortcut.register(DEFAULT_HOTKEY, () => {
    toggleOverlay(overlayWindow);
  });

  if (!success) {
    console.error('[Hotkey] Failed to register global shortcut:', DEFAULT_HOTKEY);
  }
}

/**
 * Toggles overlay visibility without stealing focus from the target app.
 * @param win - The overlay BrowserWindow
 */
function toggleOverlay(win: BrowserWindow): void {
  if (win.isVisible()) {
    win.hide();
  } else {
    // DECISION: showInactive() prevents stealing focus from the target app
    win.showInactive();
  }
}
