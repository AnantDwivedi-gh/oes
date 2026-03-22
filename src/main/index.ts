import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import { createOverlayWindow } from './overlay';
import { registerHotkey } from './hotkey';
import { IPC_CHANNELS } from '../shared/ipc';
import { takeSnapshot } from './ax/snapshot';
import { getActiveAppInfo } from './screencap';
import { executeStep } from './ax/executor';
import { parseIntent } from '../agent/intent';
import { planAction } from '../agent/planner';
import { generateOverlay } from '../agent/uiGen';
import type { ActionStep } from '../shared/types';

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

  // DECISION: Full agent pipeline — snapshot → intent → plan, all in main process where Node.js APIs are available
  ipcMain.handle(IPC_CHANNELS.SUBMIT_COMMAND, async (_event, command: string) => {
    const snapshot = await takeSnapshot();
    const intent = await parseIntent(command, snapshot);
    const plan = await planAction(intent, snapshot);
    return plan;
  });

  // DECISION: Overlay generation uses snapshot for context, returns OverlayJSON to renderer
  ipcMain.handle(IPC_CHANNELS.GENERATE_OVERLAY, async (_event, command: string) => {
    const snapshot = await takeSnapshot();
    const overlay = await generateOverlay(command, snapshot);
    return overlay;
  });

  // DECISION: Step execution delegated to ax/executor with active app PID for safety check
  ipcMain.handle(IPC_CHANNELS.EXECUTE_STEP, async (_event, step: ActionStep) => {
    const appInfo = await getActiveAppInfo();
    return executeStep(step, appInfo.pid);
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
