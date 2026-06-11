#!/usr/bin/env node
/**
 * Stage, commit (if needed) and push to origin.
 *
 * Usage:
 *   node scripts/autopush.mjs
 *   node scripts/autopush.mjs "feat: mensaje del commit"
 *   npm run autopush -- "fix: algo"
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function run(command, { allowFailure = false } = {}) {
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    encoding: "utf8",
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.status !== 0 && !allowFailure) {
    throw new Error(output || `Command failed: ${command}`);
  }

  return { status: result.status ?? 1, output };
}

function runGit(args, options) {
  return run(`git ${args}`, options);
}

function defaultMessage() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace("T", " ");
  return `chore: autopush ${stamp}`;
}

function getCurrentBranch() {
  const { status, output } = runGit("branch --show-current", { allowFailure: true });
  const branch = output.trim();
  if (status === 0 && branch) return branch;
  return "main";
}

function hasRemote() {
  const { status, output } = runGit("remote get-url origin", { allowFailure: true });
  return status === 0 && Boolean(output.trim());
}

function main() {
  if (!existsSync(path.join(root, ".git"))) {
    console.error("Error: no hay repositorio git en", root);
    process.exit(1);
  }

  const message = process.argv.slice(2).join(" ").trim() || defaultMessage();
  const branch = getCurrentBranch();

  console.log(`Branch: ${branch}`);

  const statusBefore = runGit("status --porcelain", { allowFailure: true }).output;
  if (!statusBefore) {
    console.log("No hay cambios locales.");
  } else {
    runGit("add -A");
    console.log("Cambios preparados:");
    console.log(statusBefore);

    const commit = runGit(`commit -m ${JSON.stringify(message)}`, {
      allowFailure: true,
    });

    if (commit.status !== 0) {
      if (/nothing to commit/i.test(commit.output)) {
        console.log("Nada que commitear.");
      } else {
        throw new Error(commit.output || "No se pudo crear el commit.");
      }
    } else {
      console.log(`Commit: ${message}`);
    }
  }

  if (!hasRemote()) {
    console.log("Sin remote origin. Commit local listo; agrega origin y vuelve a ejecutar.");
    return;
  }

  const upstream = runGit(`rev-parse --abbrev-ref ${branch}@{upstream}`, {
    allowFailure: true,
  });

  if (upstream.status !== 0) {
    console.log(`Publicando rama nueva: ${branch}`);
    runGit(`push -u origin ${branch}`);
  } else {
    runGit("push");
  }

  console.log("Push completado.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
