import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc';

contextBridge.exposeInMainWorld('electronAPI', {
  getSnapshot: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SNAPSHOT),
  getActiveApp: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_APP),
  confirmAction: (description: string) => ipcRenderer.invoke(IPC_CHANNELS.CONFIRM_ACTION, description),
  submitCommand: (command: string) => ipcRenderer.invoke(IPC_CHANNELS.SUBMIT_COMMAND, command),
  generateOverlay: (command: string) => ipcRenderer.invoke(IPC_CHANNELS.GENERATE_OVERLAY, command),
  executeStep: (step: unknown) => ipcRenderer.invoke(IPC_CHANNELS.EXECUTE_STEP, step),
  onToggleOverlay: (callback: () => void) => {
    ipcRenderer.on(IPC_CHANNELS.TOGGLE_OVERLAY, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TOGGLE_OVERLAY, callback);
  },
});
