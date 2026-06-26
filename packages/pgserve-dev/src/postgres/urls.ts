export function getSocketDir(): string {
  return `${process.env.XDG_RUNTIME_DIR ?? `/run/user/${process.getuid?.() ?? 1000}`}/pgserve`;
}

export function buildPostgresSocketUrl(postgresPort: number, databaseName: string): string {
  const socketDir = getSocketDir();
  return `postgresql://postgres@localhost:${postgresPort}/${databaseName}?host=${socketDir}&socket=${socketDir}`;
}
