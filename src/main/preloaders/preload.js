const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  sendSelfie: (data) => ipcRenderer.send("get-selfie", data),
  captureScreenshot: () => ipcRenderer.send("take-screenshot"),
  getScreenshot: (callback) => ipcRenderer.on("screenshot-data", callback),
  removeListener: () => ipcRenderer.removeAllListeners("screenshot-data"),
  startMonitoring: () => ipcRenderer.send("start-monitoring"),
  getActiveTime: (callback) => ipcRenderer.on("active-time", callback),
});
