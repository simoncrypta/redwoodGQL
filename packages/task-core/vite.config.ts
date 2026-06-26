import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: {
      tsgo: true,
    },
    entry: [
      "src/index.ts",
      "src/cli/parseArgs.ts",
      "src/cli/dev.ts",
      "src/port/parsePort.ts",
      "src/process/index.ts",
      "src/vite/index.ts",
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
