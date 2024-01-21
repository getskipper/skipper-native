const { app, shell, session } = require("electron");
const { menubar } = require("menubar");
const URL = require("url-parse");
const path = require("path");

// ====================================
// ============ Variables =============
// ====================================

const IS_LOCAL = false;
const IS_DEBUGGING = false;

// ====================================
// ============= Helpers ==============
// ====================================

function log(...args) {
  if (IS_DEBUGGING) {
    console.info(...args);
  }
}

// ====================================
// ============ Constants =============
// ====================================

const URL_BASE = IS_LOCAL ? "http://localhost:8080" : "https://getskipper.dev";

const APP_URL = `${URL_BASE}/app`;
const iconPath = path.join(__dirname, "iconTemplate.png");

// ====================================
// ============== Core ================
// ====================================

function isUrlFromOktaSSO(url) {
  const parsed = new URL(url);
  const domain = parsed.hostname.split(".").slice(-2);
  if (domain[0] === "okta" || domain[0] === "oktacdn") {
    return true;
  }
}

function isUrlFromLocalhost(url) {
  const parsed = new URL(url);
  const domain = parsed.hostname.split(".").slice(-2);
  if (domain[0] === "localhost") {
    return true;
  }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Creates the menu bar item.
function createMenuItem() {
  const mb = menubar({
    index: APP_URL,
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
      width: 580,
      height: 620,
      alwaysOnTop: true,
      frame: false,

      transparency: true,
      backgroundColor: "#00000000", // transparent hexadecimal or anything with transparency,
      vibrancy: "hud",
      visualEffectState: "followWindow",
    },
  });

  // Close the menu window when the user is changing windows.
  mb.app.on("browser-window-blur", () => {
    if (IS_DEBUGGING) return;
    mb.hideWindow();
  });

  mb.on("ready", () => {
    log("Menubar app is ready");

    if (IS_DEBUGGING) {
      mb.window.webContents.openDevTools();
    }

    // https://www.electronjs.org/docs/latest/tutorial/security#csp-http-headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      // log("details", details.url);

      if (isUrlFromLocalhost(details.url)) {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              `default-src
                'self'
                'unsafe-inline'
                'unsafe-eval'
                https://gstatic.com
                https://fonts.gstatic.com
                https://fonts.googleapis.com
                https://googleapis.com
                https://api.github.com
                https://github.com
                https://github.githubassets.com
                https://avatars.githubusercontent.com
            `,
            ],
          },
        });
        return;
      }

      if (isUrlFromOktaSSO(details.url)) {
        log("\tunsafe");
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [
              `default-src
                https://getskipper.dev
                https://okta.com
                https://*.okta.com
                https://oktacdn.com
                https://*.oktacdn.com
                'unsafe-inline'
                'unsafe-eval'
            `,
            ],
          },
        });
        return;
      }

      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            `default-src
              https://getskipper.dev
              https://gstatic.com
              https://fonts.gstatic.com
              https://fonts.googleapis.com
              https://googleapis.com
              https://api.github.com
              https://github.com
              https://github.githubassets.com
              https://avatars.githubusercontent.com
            `,
          ],
        },
      });
    });

    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      if (details.url.includes(`${URL_BASE}/has-unread-updates`)) {
        log(details.url);
        const [, countStr] = details.url.split("/has-unread-updates/");
        const count = parseInt(countStr, 10);

        if (!isNaN(count)) {
          mb.tray.setTitle(String(count), { fontType: "monospacedDigit" });
        }
      } else if (details.url.includes(`${URL_BASE}/no-unread-updates`)) {
        mb.tray.setTitle("");
      }

      callback(details);
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
