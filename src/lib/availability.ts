import { query, queryOne } from "@/lib/db";
import {
  AVAILABILITY_HORIZON_DAYS,
  MIN_ADVANCE_HOURS,
  SLOT_DURATION_MINUTES,
  STUDIO_CLOSE_HOUR,
  STUDIO_LOCALE,
  STUDIO_OPEN_HOUR,
  STUDIO_TIMEZONE,
} from "@/lib/availability-config";
import type {
  AvailabilitySlot,
  CalendarBlockRecord,
  CreateBlockInput,
} from "@/types/availability";

type BlockRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  all_day: boolean;
  created_at: string;
};

type BusyRow = {
  starts_at: string;
  ends_at: string;
};

function mapBlock(row: BlockRow): CalendarBlockRecord {
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason,
    allDay: row.all_day,
    createdAt: row.created_at,
  };
}

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = offset.match(/GMT([+-]\d+)/);
  if (!match) return 0;
  return Number(match[1]) * 60 * 60 * 1000;
}

function makeZonedDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset = getTimeZoneOffsetMs(utcGuess, STUDIO_TIMEZONE);
  return new Date(utcGuess.getTime() - offset);
}

function parseMonth(month: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthNum = Number(match[2]);
  if (monthNum < 1 || monthNum > 12) return null;
  return { year, month: monthNum };
}

function formatSlotLabels(
  start: Date,
  end: Date
): Pick<AvailabilitySlot, "dateLabel" | "timeLabel"> {
  const dateLabel = start.toLocaleDateString(STUDIO_LOCALE, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: STUDIO_TIMEZONE,
  });
  const timeLabel = `${start.toLocaleTimeString(STUDIO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TIMEZONE,
  })} – ${end.toLocaleTimeString(STUDIO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TIMEZONE,
  })}`;
  return { dateLabel, timeLabel };
}

async function getBusyIntervals(start: string, end: string): Promise<BusyRow[]> {
  const appointments = await query<BusyRow>(
    `SELECT starts_at, ends_at
     FROM appointments
     WHERE status IN ('confirmed', 'pending')
       AND starts_at < $2::timestamptz
       AND ends_at > $1::timestamptz`,
    [start, end]
  );

  const blocks = await query<BusyRow>(
    `SELECT starts_at, ends_at
     FROM calendar_blocks
     WHERE starts_at < $2::timestamptz
       AND ends_at > $1::timestamptz`,
    [start, end]
  );

  return [...appointments, ...blocks];
}

function isSlotFree(
  slotStart: Date,
  slotEnd: Date,
  busy: BusyRow[],
  minStartMs: number
): boolean {
  const startMs = slotStart.getTime();
  const endMs = slotEnd.getTime();
  if (startMs < minStartMs) return false;

  for (const interval of busy) {
    const busyStart = new Date(interval.starts_at).getTime();
    const busyEnd = new Date(interval.ends_at).getTime();
    if (overlaps(startMs, endMs, busyStart, busyEnd)) return false;
  }
  return true;
}

export async function listBlocks(
  start: string,
  end: string
): Promise<CalendarBlockRecord[]> {
  const rows = await query<BlockRow>(
    `SELECT id, starts_at, ends_at, reason, all_day, created_at
     FROM calendar_blocks
     WHERE starts_at < $2::timestamptz AND ends_at > $1::timestamptz
     ORDER BY starts_at ASC`,
    [start, end]
  );
  return rows.map(mapBlock);
}

function zonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function normalizeBlockInput(input: CreateBlockInput): CreateBlockInput {
  if (!input.allDay) return input;

  const parts = zonedParts(new Date(input.startsAt), STUDIO_TIMEZONE);
  return {
    ...input,
    startsAt: makeZonedDate(
      parts.year,
      parts.month,
      parts.day,
      STUDIO_OPEN_HOUR
    ).toISOString(),
    endsAt: makeZonedDate(
      parts.year,
      parts.month,
      parts.day,
      STUDIO_CLOSE_HOUR
    ).toISOString(),
  };
}

export async function createBlock(
  input: CreateBlockInput
): Promise<CalendarBlockRecord> {
  const normalized = normalizeBlockInput(input);

  if (!normalized.startsAt || !normalized.endsAt) {
    throw new Error("Indica inicio y fin del bloqueo.");
  }
  if (normalized.endsAt <= normalized.startsAt) {
    throw new Error("La hora de fin debe ser posterior al inicio.");
  }

  const row = await queryOne<BlockRow>(
    `INSERT INTO calendar_blocks (starts_at, ends_at, reason, all_day)
     VALUES ($1::timestamptz, $2::timestamptz, $3, $4)
     RETURNING id, starts_at, ends_at, reason, all_day, created_at`,
    [
      normalized.startsAt,
      normalized.endsAt,
      normalized.reason?.trim() || null,
      normalized.allDay ?? false,
    ]
  );

  if (!row) throw new Error("No se pudo crear el bloqueo.");
  return mapBlock(row);
}

export async function deleteBlock(id: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `DELETE FROM calendar_blocks WHERE id = $1 RETURNING id`,
    [id]
  );
  return Boolean(row);
}

export async function isSlotAvailable(
  startsAt: string,
  endsAt: string
): Promise<boolean> {
  if (endsAt <= startsAt) return false;

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const durationMs = end.getTime() - start.getTime();
  if (durationMs !== SLOT_DURATION_MINUTES * 60 * 1000) return false;

  const minStartMs = Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000;
  const busy = await getBusyIntervals(startsAt, endsAt);
  return isSlotFree(start, end, busy, minStartMs);
}

export async function findAvailableSlots(month: string): Promise<AvailabilitySlot[]> {
  const parsed = parseMonth(month);
  if (!parsed) throw new Error("Mes inválido. Usa formato YYYY-MM.");

  const { year, month: monthNum } = parsed;
  const rangeStart = makeZonedDate(year, monthNum, 1, 0);
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? year + 1 : year;
  const rangeEnd = makeZonedDate(nextYear, nextMonth, 1, 0);

  const horizonEnd = new Date(
    Date.now() + AVAILABILITY_HORIZON_DAYS * 24 * 60 * 60 * 1000
  );
  const effectiveEnd =
    rangeEnd.getTime() < horizonEnd.getTime() ? rangeEnd : horizonEnd;

  const busy = await getBusyIntervals(
    rangeStart.toISOString(),
    effectiveEnd.toISOString()
  );

  const minStartMs = Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000;
  const slots: AvailabilitySlot[] = [];
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  for (let day = 1; day <= daysInMonth; day += 1) {
    for (
      let hour = STUDIO_OPEN_HOUR;
      hour + SLOT_DURATION_MINUTES / 60 <= STUDIO_CLOSE_HOUR;
      hour += SLOT_DURATION_MINUTES / 60
    ) {
      const slotStart = makeZonedDate(year, monthNum, day, hour);
      const slotEnd = new Date(
        slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000
      );

      if (slotStart.getTime() >= effectiveEnd.getTime()) break;
      if (!isSlotFree(slotStart, slotEnd, busy, minStartMs)) continue;

      const labels = formatSlotLabels(slotStart, slotEnd);
      slots.push({
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        ...labels,
      });
    }
  }

  return slots;
}
