import { defineConfig, lazyPlugins } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const isTest = Boolean(process.env.VITEST);

const webPackageBuilds = [
  "@rwgql/auth#build",
  "@rwgql/dbauth#build",
  "@rwgql/rwsdk-apollo-client#build",
  "@rwgql/cell#build",
] as const;

export default defineConfig({
  resolve: {
    tsconfigPaths: isTest,
  },
  plugins: lazyPlugins(() =>
    isTest
      ? []
      : [
          cloudflare({
            viteEnvironment: { name: "worker" },
          }),
          redwood(),
        ],
  ),
  test: {
    browser: {
      enabled: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
    },
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["testUtils/setup.ts"],
  },
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
