/**
 * Asegura que la sesión de WhatsApp exista y se inicie tras cada deploy/reinicio.
 * OpenWA resetea sesiones a DISCONNECTED al arrancar — este script llama /start
 * automáticamente. Con los datos de sesión en volumen, no pide QR de nuevo.
 */

import { readdirSync, unlinkSync } from "fs";
import { join } from "path";

const API_URL = (process.env.OPENWA_API_URL || "http://openwa-api:2785/api").replace(
  /\/$/,
  ""
);
const API_KEY = process.env.OPENWA_API_KEY || "";
const SESSION_NAME = process.env.OPENWA_SESSION_NAME || "yairink";
const SESSION_ID = process.env.OPENWA_SESSION_ID || "";
const INTERVAL_MS = Number(process.env.OPENWA_WATCH_INTERVAL_MS || 30000);
const SESSIONS_DIR = process.env.SESSIONS_DIR || "";

function clearChromiumLocks() {
  if (!SESSIONS_DIR) return;
  try {
    function walk(dir) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.startsWith("Singleton")) {
          unlinkSync(full);
          console.log(`[openwa-watcher] Lock eliminado: ${full}`);
        }
      }
    }
    walk(SESSIONS_DIR);
  } catch {
    // no crítico
  }
}

function headers() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

async function waitForApi(maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        console.log("[openwa-watcher] API lista");
        return;
      }
    } catch {
      // retry
    }
    console.log(`[openwa-watcher] Esperando API... (${i + 1}/${maxAttempts})`);
    await sleep(5000);
  }
  throw new Error("OpenWA API no respondió a tiempo.");
}

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
    signal: AbortSignal.timeout(30000),
  });

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { ok: res.ok, status: res.status, body };
}

async function resolveSessionId() {
  if (SESSION_ID) {
    const { ok, body } = await api(`/sessions/${SESSION_ID}`);
    if (ok) return SESSION_ID;
    console.warn(`[openwa-watcher] SESSION_ID ${SESSION_ID} no encontrado, buscando por nombre...`);
  }

  const { ok, body } = await api("/sessions");
  if (!ok) throw new Error("No se pudo listar sesiones.");

  const sessions = Array.isArray(body) ? body : body?.data ?? [];
  const found = sessions.find((s) => s.name === SESSION_NAME);
  if (found?.id) return found.id;

  console.log(`[openwa-watcher] Creando sesión "${SESSION_NAME}"...`);
  const created = await api("/sessions", {
    method: "POST",
    body: JSON.stringify({
      name: SESSION_NAME,
      config: { autoReconnect: true, maxReconnectAttempts: 10 },
    }),
  });

  if (!created.ok) {
    throw new Error(`Error al crear sesión: ${JSON.stringify(created.body)}`);
  }

  const session = created.body?.data ?? created.body;
  return session.id;
}

function normalizeStatus(status) {
  return String(status || "").toUpperCase();
}

async function ensureSessionStarted(sessionId) {
  const { ok, body } = await api(`/sessions/${sessionId}`);
  if (!ok) throw new Error(`Sesión ${sessionId} no encontrada.`);

  const session = body?.data ?? body;
  const status = normalizeStatus(session.status);

  if (status === "CONNECTED" || status === "READY") {
    console.log(`[openwa-watcher] Sesión conectada (${session.phone || session.name})`);
    return;
  }

  if (status === "SCAN_QR" || status === "QR_READY") {
    console.log("[openwa-watcher] Esperando escaneo de QR en el dashboard (localhost:2886)");
    return;
  }

  if (status === "INITIALIZING" || status === "CONNECTING" || status === "AUTHENTICATING") {
    console.log(`[openwa-watcher] Sesión en progreso: ${status}`);
    return;
  }

  console.log(`[openwa-watcher] Iniciando sesión (estado: ${status})...`);
  const started = await api(`/sessions/${sessionId}/start`, { method: "POST" });

  if (started.ok) {
    const updated = started.body?.data ?? started.body;
    console.log(`[openwa-watcher] Start OK → ${normalizeStatus(updated?.status)}`);
    return;
  }

  if (started.status === 400 && String(started.body?.message || "").includes("already started")) {
    return;
  }

  console.warn("[openwa-watcher] No se pudo iniciar:", JSON.stringify(started.body));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tick() {
  if (!API_KEY) {
    throw new Error("OPENWA_API_KEY es obligatorio para el watcher.");
  }
  const sessionId = await resolveSessionId();
  await ensureSessionStarted(sessionId);
}

async function main() {
  console.log("[openwa-watcher] Iniciando...");
  console.log(`[openwa-watcher] API: ${API_URL}`);
  console.log(`[openwa-watcher] Sesión: ${SESSION_NAME}`);

  clearChromiumLocks();
  await waitForApi();
  await tick();

  console.log(`[openwa-watcher] Modo vigilancia cada ${INTERVAL_MS / 1000}s`);
  setInterval(() => {
    tick().catch((err) => console.error("[openwa-watcher]", err.message));
  }, INTERVAL_MS);
}

main().catch((err) => {
  console.error("[openwa-watcher] Error fatal:", err.message);
  process.exit(1);
});
