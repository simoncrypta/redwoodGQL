import { defineConfig, lazyPlugins } from "vite-plus";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const webPackageBuilds = [
  "@rwgql/auth#build",
  "@rwgql/dbauth#build",
  "@rwgql/rwsdk-apollo-client#build",
  "@rwgql/cell#build",
] as const;

export default defineConfig({
  plugins: lazyPlugins(() => [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ]),
  run: {
    tasks: {
      dev: {
        command: "vp dev --port 8910",
        dependsOn: [...webPackageBuilds],
        cache: false,
      },
      build: {
        command: "vp build",
        dependsOn: [...webPackageBuilds],
      },
      check: {
        command: ["vp run graphql#codegen", "vp run generate", "vp run types"],
        dependsOn: [...webPackageBuilds],
      },
      generate: {
        command: "rw-scripts ensure-env && wrangler types --include-runtime false",
      },
      types: {
        command: "tsc",
      },
    },
  },
});
