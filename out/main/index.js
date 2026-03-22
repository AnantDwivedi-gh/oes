let electron = require("electron");
let path = require("path");
let child_process = require("child_process");
let util = require("util");
//#region src/main/overlay.ts
/**
* Creates the always-on-top overlay window.
* @returns The overlay BrowserWindow instance
*/
function createOverlayWindow() {
	const { width: screenWidth, height: screenHeight } = electron.screen.getPrimaryDisplay().workAreaSize;
	const OVERLAY_WIDTH = 420;
	const OVERLAY_HEIGHT = 600;
	const win = new electron.BrowserWindow({
		width: OVERLAY_WIDTH,
		height: OVERLAY_HEIGHT,
		x: screenWidth - OVERLAY_WIDTH - 16,
		y: screenHeight - OVERLAY_HEIGHT - 16,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		resizable: false,
		hasShadow: false,
		webPreferences: {
			preload: (0, path.join)(__dirname, "../preload/index.js"),
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	win.setAlwaysOnTop(true, "floating");
	win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
	if (process.env.NODE_ENV === "development") win.loadURL("http://localhost:5173");
	else win.loadFile((0, path.join)(__dirname, "../renderer/index.html"));
	win.hide();
	return win;
}
//#endregion
//#region src/main/hotkey.ts
var DEFAULT_HOTKEY = "CommandOrControl+Shift+Space";
/**
* Registers the global hotkey to toggle the overlay window.
* @param overlayWindow - The overlay BrowserWindow to toggle
*/
function registerHotkey(overlayWindow) {
	if (!electron.globalShortcut.register(DEFAULT_HOTKEY, () => {
		toggleOverlay(overlayWindow);
	})) console.error("[Hotkey] Failed to register global shortcut:", DEFAULT_HOTKEY);
}
/**
* Toggles overlay visibility without stealing focus from the target app.
* @param win - The overlay BrowserWindow
*/
function toggleOverlay(win) {
	if (win.isVisible()) win.hide();
	else win.showInactive();
}
//#endregion
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
//#region src/main/ax/bridge.ts
/**
* Wraps an AX call with graceful fallback on failure.
* @param fn - The async AX operation to attempt
* @param fallback - Value to return if the operation fails
* @returns The result of fn() or the fallback value
*/
async function withAXFallback(fn, fallback) {
	try {
		return await fn();
	} catch (e) {
		console.error("[AX]", e);
		return fallback;
	}
}
/**
* Checks if the app has Accessibility permissions.
* @returns true if trusted, false otherwise
*/
function checkAXPermission() {
	if (process.platform !== "darwin") {
		console.warn("[AX] Not on macOS — AX features unavailable");
		return false;
	}
	return electron.systemPreferences.isTrustedAccessibilityClient(false);
}
/**
* Reads the AX tree for the frontmost application.
* @returns The root AXNode of the active window, or null
*/
async function readAXTree() {
	return withAXFallback(async () => {
		console.warn("[AX] readAXTree is a stub — native bindings not yet built");
		return null;
	}, null);
}
//#endregion
//#region src/main/screencap.ts
var execAsync = (0, util.promisify)(child_process.exec);
/**
* Gets metadata about the frontmost application via osascript.
* @returns ActiveAppInfo with app name, bundle ID, window title, bounds, and PID
*/
async function getActiveAppInfo() {
	if (process.platform !== "darwin") return {
		appName: "Unknown",
		bundleId: "com.unknown.app",
		windowTitle: "Unknown Window",
		windowBounds: {
			x: 0,
			y: 0,
			width: 1920,
			height: 1080
		},
		pid: 0
	};
	try {
		const { stdout } = await execAsync(`osascript -e '${`
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
    `.replace(/'/g, "'\\''")}'`);
		const parts = stdout.trim().split("|");
		const [posX, posY] = (parts[3] ?? "0,0").split(",").map(Number);
		const [sizeW, sizeH] = (parts[4] ?? "1920,1080").split(",").map(Number);
		return {
			appName: parts[0] ?? "Unknown",
			bundleId: parts[1] ?? "com.unknown.app",
			windowTitle: parts[2] ?? "Unknown Window",
			windowBounds: {
				x: posX,
				y: posY,
				width: sizeW,
				height: sizeH
			},
			pid: parseInt(parts[5] ?? "0", 10)
		};
	} catch (error) {
		console.error("[Screencap] Failed to get active app info:", error);
		return {
			appName: "Unknown",
			bundleId: "com.unknown.app",
			windowTitle: "Unknown Window",
			windowBounds: {
				x: 0,
				y: 0,
				width: 1920,
				height: 1080
			},
			pid: 0
		};
	}
}
//#endregion
//#region src/main/ax/snapshot.ts
/**
* Builds a full AppContext snapshot from the active window.
* @returns AppContext with app metadata and AX tree
*/
async function takeSnapshot() {
	const appInfo = await getActiveAppInfo();
	const axTree = checkAXPermission() ? await withAXFallback(async () => readAXTree(), null) : null;
	return {
		appName: appInfo.appName,
		bundleId: appInfo.bundleId,
		windowTitle: appInfo.windowTitle,
		windowBounds: appInfo.windowBounds,
		axTree,
		timestamp: Date.now()
	};
}
//#endregion
//#region src/main/index.ts
/** @description OeS main process bootstrap */
var overlayWindow = null;
async function bootstrap() {
	overlayWindow = createOverlayWindow();
	registerHotkey(overlayWindow);
	electron.ipcMain.handle(IPC_CHANNELS.GET_SNAPSHOT, async () => {
		return takeSnapshot();
	});
	electron.ipcMain.handle(IPC_CHANNELS.GET_ACTIVE_APP, async () => {
		return getActiveAppInfo();
	});
	electron.ipcMain.handle(IPC_CHANNELS.CONFIRM_ACTION, async (_event, stepDescription) => {
		return true;
	});
}
electron.app.whenReady().then(bootstrap);
electron.app.on("will-quit", () => {
	electron.globalShortcut.unregisterAll();
});
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
//#endregion
