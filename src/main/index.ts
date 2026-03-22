import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import { createOverlayWindow } from './overlay';
import { registerHotkey } from './hotkey';
import { IPC_CHANNELS } from '../shared/ipc';
import { takeSnapshot } from './ax/snapshot';
import { getActiveAppInfo } from './screencap';

/** @description OeS main process bootstrap */
let overlayWindow: BrowserWindow | null = null;

async function bootstrap(): Promise<void> {
  overlayWindow = createOverlayWindow();

  registerHotkey(overlayWindow);

  // DECISION: IPC handlers registered here to keep main/index.ts as the single wiring point
  ipcMain.handle(IPC_CHANNELS.GET_SNAPSHOT, async () => {
    return takeSnapshot();
  });

  ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_APP, async () => {
    return getActiveAppInfo();
  });

  ipcMain.handle(IPC_CHANNELS.CONFIRM_ACTION, async (_event, stepDescription: string) => {
    // DECISION: For now returns true; ConfirmGate UI will handle this via renderer
    return true;
  });
}

app.whenReady().then(bootstrap);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// DECISION: macOS-first — keep app alive when all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
