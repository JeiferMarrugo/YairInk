#!/usr/bin/env node
/**
 * Actualiza DATABASE_URL en Vercel Production y redeploya.
 *
 * Usage:
 *   node scripts/vercel-env-db.mjs "postgresql://..."
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const url = process.argv[2]?.trim();
if (!url || !url.startsWith("postgresql://")) {
  console.error("Uso: node scripts/vercel-env-db.mjs \"postgresql://...\"");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, input) {
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    encoding: "utf8",
    input,
  });
  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.status !== 0) {
    throw new Error(out || command);
  }
  return out;
}

try {
  console.log("Actualizando DATABASE_URL en Vercel...");
  run('npx vercel env add DATABASE_URL production --force', `${url}\n`);
  console.log("Redeploy producción...");
  run("npx vercel --prod --yes");
  console.log("Listo: https://yairink.vercel.app");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
