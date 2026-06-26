import { parseCliArgs } from "@rwgql/task-core/cli";
import { freeTcpPorts } from "@rwgql/task-core/process";

import { loadResolvedConfigFromArgv } from "../config/loadConfig.ts";
import { startLocalDevPgserve } from "../local-dev/index.ts";

async function main() {
  const config = await loadResolvedConfigFromArgv();
  const args = parseCliArgs();

  if (config.devPorts?.length) {
    freeTcpPorts(config.devPorts);
  }

  await startLocalDevPgserve(config, args, {
    detach: true,
    emitReadyMarker: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
