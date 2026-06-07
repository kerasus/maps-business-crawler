const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("disable-setuid-sandbox");
app.commandLine.appendSwitch("disable-dev-shm-usage");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-software-rasterizer");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        backgroundColor: "#1e1e1e"
    });
    mainWindow.loadFile(path.join(__dirname, "../ui/index.html"));
}

function runScript(scriptPath) {
    const process = spawn("node", [scriptPath]);

    process.stdout.on("data", (data) => {
        mainWindow.webContents.send("log-update", data.toString());
    });

    process.stderr.on("data", (data) => {
        mainWindow.webContents.send("log-update", `ERROR: ${data.toString()}`);
    });

    process.on("close", (code) => {
        mainWindow.webContents.send("log-update", `\n--- Process finished with code ${code} ---\n`);
    });
}

app.whenReady().then(createWindow);

ipcMain.on("collect-links", () => {
    runScript("crawler/collect-links.js");
});

ipcMain.on("crawl-details", () => {
    runScript("crawler/crawl-details.js");
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});