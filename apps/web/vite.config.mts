import { defineConfig, lazyPlugins } from "vite-plus";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: lazyPlugins(() => [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ]),
});
