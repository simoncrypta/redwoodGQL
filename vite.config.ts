import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["test-project/**"],
  },
  lint: {
    ignorePatterns: ["test-project/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    exclude: [...configDefaults.exclude, "test-project/**"],
    projects: ["packages/*"],
  },
  run: {
    cache: true,
    tasks: {
      dev: {
        command:
          "vp run --parallel --filter rwsdk --filter graphql --filter @rwgql/yoga-server dev",
        cache: false,
      },
    },
  },
});
