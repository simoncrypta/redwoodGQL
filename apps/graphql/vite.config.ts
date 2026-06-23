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
});
