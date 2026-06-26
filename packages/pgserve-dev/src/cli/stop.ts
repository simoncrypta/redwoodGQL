import { parseCliArgs } from "@rwgql/task-core/cli";

import { loadResolvedConfigFromArgv } from "../config/loadConfig.ts";
import { stopLocalDevPgserve } from "../local-dev/index.ts";

async function main() {
  const config = await loadResolvedConfigFromArgv();
  await stopLocalDevPgserve(config, parseCliArgs());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
