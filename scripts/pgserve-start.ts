import {
  parseCliArgs,
  printPgserveReadyMarker,
  registerShutdown,
  removeConnectionEnvFiles,
  startLocalDevPgserve,
  stopProvider,
} from "./pgserve-local-dev.ts";

async function main() {
  const args = parseCliArgs();
  const { dataDir, provider } = await startLocalDevPgserve(args, {
    emitReadyMarker: false,
  });
  registerShutdown(provider, args, dataDir);

  try {
    printPgserveReadyMarker();
    console.log("pgserve connection is ready.");
    console.log("Keeping pgserve running. Press Ctrl+C to stop.");
    await new Promise(() => undefined);
  } catch (error) {
    await stopProvider(provider);
    removeConnectionEnvFiles(args, dataDir);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
