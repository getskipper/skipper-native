// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  canContact: () => true,
  sendNotification: ({ title, body, actions, cb }) => {
    const notif = new Notification(title, {
      body,
    });

    notif.onclick = () => {
      console.info("[native] Clicked", cb);
      cb();
    };
  },
});
