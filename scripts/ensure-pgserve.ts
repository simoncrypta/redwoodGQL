import { parseCliArgs, startLocalDevPgserve } from "./pgserve-local-dev.ts";

async function main() {
  const args = parseCliArgs();
  await startLocalDevPgserve(args, {
    detach: true,
    emitReadyMarker: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
