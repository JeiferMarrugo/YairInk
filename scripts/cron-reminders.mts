/**
 * Daemon de recordatorios WhatsApp (artista, 2 h antes de la cita).
 * Ejecutar en segundo plano: npm run cron:reminders
 */
import { processArtistReminders } from "../src/lib/reminders";

const INTERVAL_MS = Number(
  process.env.REMINDER_CRON_INTERVAL_MS ?? 10 * 60 * 1000
);

function minutesLabel(ms: number): string {
  return String(Math.round(ms / 60_000));
}

async function runTick() {
  const stamp = new Date().toLocaleString("es-CO", {
    timeZone: "America/Bogota",
  });
  try {
    const result = await processArtistReminders();
    console.log(`[${stamp}] Recordatorios:`, JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${stamp}] Error en cron:`, message);
  }
}

console.log(
  `Cron de recordatorios activo — cada ${minutesLabel(INTERVAL_MS)} min (America/Bogota)`
);
console.log("Ctrl+C para detener.\n");

await runTick();
setInterval(runTick, INTERVAL_MS);
