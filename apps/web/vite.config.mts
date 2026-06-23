import { defineConfig, lazyPlugins, type Plugin } from "vite-plus";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const clientRuntimeEntries = new Set<string>(["react-server-dom-webpack/client.browser"]);

const removeClientRuntimeEntries = (dependencies: string[] | undefined) =>
  dependencies?.filter((dependency) => !clientRuntimeEntries.has(dependency));

const addClientRuntimeExclusions = (dependencies: string[] | undefined) => [
  ...(dependencies ?? []),
  ...clientRuntimeEntries.values(),
];

const preserveClientRuntimeSideEffects = {
  name: "rwsdk:preserve-client-runtime-side-effects",
  enforce: "post",
  apply: "serve",
  configEnvironment(_environmentName, environmentConfig) {
    environmentConfig.optimizeDeps ??= {};
    environmentConfig.optimizeDeps.include = removeClientRuntimeEntries(
      environmentConfig.optimizeDeps.include,
    );
    environmentConfig.optimizeDeps.exclude = addClientRuntimeExclusions(
      environmentConfig.optimizeDeps.exclude,
    );
  },
  configResolved(config) {
    const clientOptimizeDeps = config.environments.client.optimizeDeps;
    clientOptimizeDeps.include = removeClientRuntimeEntries(clientOptimizeDeps.include);
    clientOptimizeDeps.exclude = addClientRuntimeExclusions(clientOptimizeDeps.exclude);
  },
} satisfies Plugin;

export default defineConfig({
  plugins: lazyPlugins(() => [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
    preserveClientRuntimeSideEffects,
  ]),
});
