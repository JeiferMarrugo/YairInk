import { STUDIO_TIMEZONE } from "@/lib/availability-config";

function studioDateKey(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-CA", { timeZone: STUDIO_TIMEZONE });
}

function studioTimeParts(value: Date | string): { date: string; time: string } {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** true si el día de la cita (hora Colombia) ya pasó. */
export function isPastAppointmentDay(startsAt: string): boolean {
  return studioDateKey(startsAt) < studioDateKey(new Date());
}

export function appointmentDurationMs(
  startsAt: string,
  endsAt: string
): number {
  return new Date(endsAt).getTime() - new Date(startsAt).getTime();
}

/** Valores iniciales para reagendar: mañana, misma hora de la cita original. */
export function defaultRescheduleFields(startsAt: string): {
  date: string;
  time: string;
} {
  const { time } = studioTimeParts(startsAt);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: studioDateKey(tomorrow), time };
}

/** Interpreta fecha y hora en zona del estudio (Colombia). */
export function studioLocalToIso(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0)
  );
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIMEZONE,
    timeZoneName: "shortOffset",
  }).formatToParts(utcGuess);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = offset.match(/GMT([+-]\d+)/);
  const offsetMs = match ? Number(match[1]) * 60 * 60 * 1000 : 0;
  return new Date(utcGuess.getTime() - offsetMs).toISOString();
}

export function notifyAppointmentsChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("yairink:appointments-changed"));
  }
}
