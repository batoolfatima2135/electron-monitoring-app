const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  powerMonitor,
} = require("electron");
const path = require("path");
const fs = require("fs");

let activeTime = 0;
let monitoringStarted = false;
let interval;
let lockInterval;
let sleepInterval;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preloaders/preload.js"),
    },
  });

  ipcMain.on("take-screenshot", () => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      const dataURL = sources[0].thumbnail.toDataURL();
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, "");
      const folderPath = "screenshots";
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      const fileName = `./screenshots/screenshot_${Date.now()}.png`;
      const parentDir = path.resolve(__dirname, "../..");
      const filePath = path.join(parentDir, fileName);
      fs.writeFile(filePath, base64Data, "base64", (err) => {
        if (err) {
          mainWindow.webContents.send("screenshot-data", {
            dataURL: dataURL,
            message: "Failed to save screenshot",
          });
          return;
        }
      });
      mainWindow.webContents.send("screenshot-data", {
        dataURL: dataURL,
        message: "Screenshot saved successfuly",
      });
    });
  });
  const parentDir = path.resolve(__dirname, "..");
  ipcMain.on("get-selfie", (event, data) => {
    const selfieWindow = new BrowserWindow({
      width: 850,
      height: 600,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preloaders/selfiePreload.js"),
      },
    });
    selfieWindow.loadFile(path.join(parentDir, "/renderer/selfie.html"));
    selfieWindow.once("ready-to-show", () => {
      selfieWindow.show();
    });
    selfieWindow.webContents.send("selfie-url", data);
  });
  ipcMain.on("request-active-time", (event) => {
    event.sender.send("active-time", activeTime);
  }); // Variable to track the time of the last system resume event

  ipcMain.on("start-monitoring", () => {
    if (!monitoringStarted) {
      interval = setInterval(() => {
        activeTime++;

        mainWindow.webContents.send("active-time", activeTime);
      }, 1000);
      monitoringStarted = true;
    }
  });
  powerMonitor.on("suspend", () => {
    if (monitoringStarted) {
      if (interval) clearInterval(interval);
      if (lockInterval) {
        clearInterval(lockInterval);
      } // Correct way to clear the interval
    }
  });
  powerMonitor.on("lock-screen", () => {
    if (monitoringStarted) {
      if (interval) clearInterval(interval);
      // Correct way to clear the interval
      if (lockInterval) {
        clearInterval(lockInterval);
      }
    }
  });

  powerMonitor.on("unlock-screen", () => {
    if (monitoringStarted) {
      lockInterval = setInterval(() => {
        activeTime++;
        mainWindow.webContents.send("active-time", activeTime);
      }, 1000);
    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(parentDir, "/renderer/index.html"));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
