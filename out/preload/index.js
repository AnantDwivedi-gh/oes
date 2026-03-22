let electron = require("electron");
//#region src/shared/ipc.ts
/**
* IPC channel constants — the single source of truth for all IPC communication.
* Main and renderer must both import from here. Never hardcode channel strings.
*/
var IPC_CHANNELS = {
	GET_SNAPSHOT: "oes:get-snapshot",
	GET_ACTIVE_APP: "oes:get-active-app",
	CONFIRM_ACTION: "oes:confirm-action",
	TOGGLE_OVERLAY: "oes:toggle-overlay",
	SUBMIT_COMMAND: "oes:submit-command",
	STEP_UPDATE: "oes:step-update",
	EXECUTE_STEP: "oes:execute-step",
	GENERATE_OVERLAY: "oes:generate-overlay"
};
//#endregion
//#region src/preload/index.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	getSnapshot: () => electron.ipcRenderer.invoke(IPC_CHANNELS.GET_SNAPSHOT),
	getActiveApp: () => electron.ipcRenderer.invoke(IPC_CHANNELS.GET_ACTIVE_APP),
	confirmAction: (description) => electron.ipcRenderer.invoke(IPC_CHANNELS.CONFIRM_ACTION, description),
	onToggleOverlay: (callback) => {
		electron.ipcRenderer.on(IPC_CHANNELS.TOGGLE_OVERLAY, callback);
		return () => electron.ipcRenderer.removeListener(IPC_CHANNELS.TOGGLE_OVERLAY, callback);
	}
});
//#endregion
