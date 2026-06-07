const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    collectLinks: () => ipcRenderer.send("collect-links"),
    crawlDetails: () => ipcRenderer.send("crawl-details"),
    onLogUpdate: (callback) => ipcRenderer.on("log-update", (event, value) => callback(value))
});
