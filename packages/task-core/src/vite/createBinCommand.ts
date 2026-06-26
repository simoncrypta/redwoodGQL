import { createRequire } from "node:module";
import path from "node:path";

const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));

export function createBinCommand(packageName: string, cliName: string): string {
  const packageJsonPath = requireFromCwd.resolve(`${packageName}/package.json`);
  const packageRoot = path.dirname(packageJsonPath);
  const packageJson = requireFromCwd(packageJsonPath) as {
    bin?: Record<string, string>;
  };

  const binRelativePath = packageJson.bin?.[cliName];
  if (!binRelativePath) {
    throw new Error(`Missing bin "${cliName}" in ${packageName}`);
  }

  return `node ${path.join(packageRoot, binRelativePath)}`;
}

export function createBinResolver(packageName: string): (cliName: string) => string {
  return (cliName: string) => createBinCommand(packageName, cliName);
}
