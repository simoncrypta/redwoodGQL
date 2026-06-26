import { parseCliArgs } from "@rwgql/task-core/cli";

import { loadResolvedConfigFromArgv } from "../config/loadConfig.ts";
import { startLocalDevPgserve } from "../local-dev/index.ts";

async function main() {
  const config = await loadResolvedConfigFromArgv();
  const args = parseCliArgs();
  await startLocalDevPgserve(config, args, {
    detach: true,
    emitReadyMarker: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
