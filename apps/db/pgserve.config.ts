import { definePgserveConfig } from "@rwgql/pgserve-dev";

export const pgserveDevConfig = definePgserveConfig(import.meta.url, {
  databaseName: "redwoodgql",
  defaultPort: 8432,
  dataDir: "apps/db/.pgserve",
  pgserveBinPath: "apps/db/node_modules/pgserve/bin/pgserve-wrapper.cjs",
  appEnvAdapter: "prisma",
  devPorts: [8910, 8911, 8912, 8913],
});
