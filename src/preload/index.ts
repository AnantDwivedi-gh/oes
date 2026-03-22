import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc';

contextBridge.exposeInMainWorld('electronAPI', {
  getSnapshot: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SNAPSHOT),
  getActiveApp: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_APP),
  confirmAction: (description: string) => ipcRenderer.invoke(IPC_CHANNELS.CONFIRM_ACTION, description),
  onToggleOverlay: (callback: () => void) => {
    ipcRenderer.on(IPC_CHANNELS.TOGGLE_OVERLAY, callback);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TOGGLE_OVERLAY, callback);
  },
});
