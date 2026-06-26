import { parseCliArgs } from "@rwgql/task-core/cli";

import { loadResolvedConfigFromArgv } from "../config/loadConfig.ts";
import {
  printPgserveReadyMarker,
  registerShutdown,
  removeConnectionEnvFiles,
  startLocalDevPgserve,
  stopProvider,
} from "../local-dev/index.ts";

async function main() {
  const config = await loadResolvedConfigFromArgv();
  const args = parseCliArgs();
  const { provider } = await startLocalDevPgserve(config, args, {
    emitReadyMarker: false,
  });
  registerShutdown(config, provider, args);

  try {
    printPgserveReadyMarker();
    console.log("pgserve connection is ready.");
    console.log("Keeping pgserve running. Press Ctrl+C to stop.");
    await new Promise(() => undefined);
  } catch (error) {
    await stopProvider(provider);
    removeConnectionEnvFiles(config, args);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
