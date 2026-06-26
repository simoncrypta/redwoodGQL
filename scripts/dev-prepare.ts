import { execSync } from "node:child_process";

import { parseCliArgs, startLocalDevPgserve } from "./pgserve-local-dev.ts";

const DEV_PORTS = [8910, 8911, 8912, 8913] as const;

const freeTcpPort = (port: number) => {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
  } catch {
    // Port already free.
  }
};

async function main() {
  for (const port of DEV_PORTS) {
    freeTcpPort(port);
  }

  await startLocalDevPgserve(parseCliArgs(), {
    detach: true,
    emitReadyMarker: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
