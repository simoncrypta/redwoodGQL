import { defineConfig } from "nitro";

export default defineConfig({
  devServer: {
    port: 8911,
  },
  serverEntry: {
    format: "node",
    handler: "./server.node.ts",
  },
});
