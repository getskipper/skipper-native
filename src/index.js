const { app, shell, session } = require("electron");
const { menubar } = require("menubar");
const path = require("path");

const iconPath = path.join(__dirname, "iconTemplate.png");

const isLocal = true;
const URL = isLocal ? "http://localhost:3000/appv2" : "https://getskipper.dev";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Creates the menu bar item.
function createMenuItem() {
  const mb = menubar({
    index: URL,
    preloadWindow: true,
    nodeIntegration: false,
    contextIsolation: true,
    icon: iconPath,
    browserWindow: {
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      nodeIntegration: false,
      contextIsolation: true,
      resizable: false,
      transparent: true,
      width: 650,
      height: 660,
      alwaysOnTop: true,
      frame: false,

      transparency: true,
      backgroundColor: "#00000000", // transparent hexadecimal or anything with transparency,
      vibrancy: "hud",
      visualEffectState: "followWindow",
    },
  });

  // Close the menu window when the user is changing windows.
  // mb.app.on("browser-window-blur", () => {
  //   mb.hideWindow();
  // });

  mb.on("ready", () => {
    console.log("menubar app is ready");
    mb.window.webContents.openDevTools();

    // https://www.electronjs.org/docs/latest/tutorial/security#csp-http-headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src https://github.com https://github.githubassets.com https://avatars.githubusercontent.com 'none'",
          ],
        },
      });
    });

    mb.window.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("https:")) {
        shell.openExternal(url);
      }
      return { action: "deny" };
    });
  });

  mb.on("focus-lost", () => {
    // Can close window.
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
