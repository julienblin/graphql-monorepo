#!/usr/bin/env node

const path = require("path");
const fs = require("fs");

let [mode, port, ..._] = process.argv.slice(2);

mode = mode || "prod";
port = parseInt(port || "4000");

if (!["dev", "prod"].includes(mode)) {
  console.error(`Unknown mode ${mode}.`);
  process.exit(1);
}

fs.rmdirSync(path.join(__dirname, "dist"), { recursive: true, force: true });

let runningServer = null;

const startPlugin = () => {
  return {
    name: "startPlugin",
    setup(build) {
      build.onEnd((res) => {
        if (runningServer) {
          console.log(`♻️ ${path.basename(__dirname)} service restarting...`);
          runningServer.stop().then(() => {
            purgeAppRequireCache(path.resolve(__dirname, "./dist/server.js"));
            runningServer = startServer();
          });
        } else {
          runningServer = startServer();
        }
      });
    },
  };
};

const purgeAppRequireCache = (buildPath) => {
  for (let key in require.cache) {
    if (key.startsWith(buildPath)) {
      delete require.cache[key];
    }
  }
};

const startServer = () => {
  const server = require("./dist/server").server;
  server.listen(port).then(({ url }) => {
    console.log(`🚀 ${path.basename(__dirname)} service ready at ${url}`);
  });
  return server;
};

const plugins = [require("@luckycatfactory/esbuild-graphql-loader").default()];
if (mode === "dev") {
  plugins.push(startPlugin());
}

require("esbuild")
  .build({
    entryPoints: ["src/server.ts"],
    bundle: true,
    platform: "node",
    target: "node14",
    outdir: "dist",
    plugins,
    watch: mode === "dev",
    sourcemap: mode === "dev",
    minify: mode === "prod",
  })
  .catch(() => {
    process.exit(1);
  });
