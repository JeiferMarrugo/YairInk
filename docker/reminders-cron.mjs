/**
 * Cron de recordatorios vía API (Docker).
 * Llama a /api/cron/appointment-reminders cada N minutos.
 */
const APP_URL = (process.env.APP_URL ?? "http://host.docker.internal:3000").replace(
  /\/$/,
  ""
);
const CRON_SECRET = process.env.CRON_SECRET?.trim();
const INTERVAL_MS = Number(process.env.REMINDER_CRON_INTERVAL_MS ?? 10 * 60 * 1000);

if (!CRON_SECRET) {
  console.error("Falta CRON_SECRET en el entorno.");
  process.exit(1);
}

async function runTick() {
  const stamp = new Date().toISOString();
  try {
    const response = await fetch(
      `${APP_URL}/api/cron/appointment-reminders`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
        signal: AbortSignal.timeout(60_000),
      }
    );
    const body = await response.text();
    console.log(`[${stamp}] HTTP ${response.status}: ${body}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${stamp}] Error:`, message);
  }
}

console.log(
  `Reminders cron → ${APP_URL}/api/cron/appointment-reminders (cada ${INTERVAL_MS / 60_000} min)`
);

await runTick();
setInterval(runTick, INTERVAL_MS);
