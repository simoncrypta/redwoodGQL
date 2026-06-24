import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [".nitro/**", ".output/**"],
  },
  lint: {
    ignorePatterns: [".nitro/**", ".output/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      dev: {
        command: "vp run @rwgql/auth#build && vp run @rwgql/dbauth#build && nitro dev",
        cache: false,
      },
    },
  },
});
