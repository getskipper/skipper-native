const path = require("path");

module.exports = {
  packagerConfig: {
    icon: "src/mac-icon",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        background: "./src/dmg-background.png",
        icon: "./src/mac-icon.png",
        overwrite: true,
        iconSize: 120,
        contents: [
          {
            x: 508,
            y: 144,
            type: "link",
            path: "/Applications",
          },
          {
            x: 192,
            y: 144,
            type: "file",
            path: path.resolve(process.cwd(), "out/Skipper-darwin-x64/Skipper.app"),
          },
        ],
        additionalDMGOptions: {
          title: "Skipper-1.0.0",
        },
      },
    },
  ],
};
