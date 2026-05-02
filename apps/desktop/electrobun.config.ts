import type { ElectrobunConfig } from "electrobun";

const webBuildDir = "../web/dist";

export default {
  app: {
    identifier: "dev.bettertstack.wallzapp.desktop",
    name: "wallzapp",
    version: "0.0.1",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    copy: {
      [webBuildDir]: "views/mainview",
    },
    linux: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
    mac: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
    watchIgnore: [`${webBuildDir}/**`],
    win: {
      bundleCEF: true,
      defaultRenderer: "cef",
    },
  },
  runtime: {
    exitOnLastWindowClosed: true,
  },
} satisfies ElectrobunConfig;
