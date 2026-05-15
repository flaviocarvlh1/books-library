import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Diretório `backend/` (tanto rodando de `src/` quanto de `dist/`). */
const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const candidatePaths = [
  join(backendRoot, ".env"),
  join(backendRoot, ".env.local"),
  join(process.cwd(), ".env"),
  join(process.cwd(), ".env.local"),
  join(process.cwd(), "backend", ".env"),
  join(process.cwd(), "backend", ".env.local"),
];

let loadedPath: string | null = null;
for (const p of candidatePaths) {
  if (existsSync(p)) {
    const result = config({ path: p, override: true });
    if (!result.error) {
      loadedPath = p;
      break;
    }
  }
}

export const envLoadInfo = {
  loadedPath,
  triedPaths: candidatePaths,
  mysqlUser: process.env.MYSQL_USER ?? "root",
  /** Não expõe a senha; só indica se há algum caractere. */
  mysqlPasswordConfigured: Boolean(
    process.env.MYSQL_PASSWORD != null &&
      String(process.env.MYSQL_PASSWORD).length > 0,
  ),
};
