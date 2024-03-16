const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ipc", {
  getSelfie: (callback) => ipcRenderer.on("selfie-url", callback),
});
