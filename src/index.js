const { app, shell, BrowserWindow } = require("electron");
const { menubar } = require("menubar");
const path = require("path");

const iconPath = path.join(__dirname, "icon.png");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    frame: false,
    backgroundColor: "#090C22",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL("https://getskipper.dev/");
};

// Creates the menu bar item.
function createMenuItem() {
  const mb = menubar({
    index: "https://getskipper.dev/app",
    preloadWindow: true,
    nodeIntegration: true,
    icon: iconPath,
    browserWindow: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      resizable: false,
      // vibrancy: "popover",
      transparent: true,
      y: 30,
      width: 460,
      height: 550,
      alwaysOnTop: true,
      frame: false,
    },
  });

  // Close the menu window when the user is changing windows.
  mb.app.on("browser-window-blur", () => {
    mb.hideWindow();
  });

  mb.on("ready", () => {
    console.log("menubar app is ready");
    // setTimeout(() => mb.tray.setImage(icon_2_Path), 3000)

    mb.window.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https:") || url.startsWith("http:")) {
        shell.openExternal(url);
      }
      return { action: "deny" };
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.whenReady().then(createMenuItem);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app.on("activate", () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });
