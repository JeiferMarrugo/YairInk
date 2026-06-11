import { query, queryOne } from "@/lib/db";
import { getSiteConfig } from "@/lib/content";
import { isOpenWaConfigured, sendTextViaOpenWA } from "@/lib/openwa";
import { buildArtistAppointmentReminderMessage } from "@/lib/whatsapp";
import type { AppointmentRecord } from "@/types/scheduling";

type ReminderRow = {
  id: string;
  client_name: string;
  starts_at: string;
  ends_at: string;
  artist: string | null;
  event_type: string;
  concept: string | null;
  placement: string | null;
  artist_id: string | null;
  artist_phone: string | null;
  artist_name: string | null;
};

function mapReminderRow(row: ReminderRow): AppointmentRecord {
  return {
    id: row.id,
    clientId: null,
    clientName: row.client_name,
    clientEmail: null,
    clientPhone: null,
    clientPhoneDisplay: null,
    title: row.client_name,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    artistId: row.artist_id,
    artist: row.artist_name ?? row.artist,
    eventType: row.event_type as AppointmentRecord["eventType"],
    status: "confirmed",
    concept: row.concept,
    placement: row.placement,
    sizeEstimate: null,
    style: null,
    notes: null,
    completedAt: null,
    shareToken: null,
    sessionPhotos: [],
    portfolioItemId: null,
    reviewSubmitted: false,
    createdAt: row.starts_at,
  };
}

export async function processArtistReminders(): Promise<{
  processed: number;
  sent: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let sent = 0;

  if (!isOpenWaConfigured()) {
    return { processed: 0, sent: 0, errors: ["OpenWA no configurado."] };
  }

  const rows = await query<ReminderRow>(
    `SELECT a.id, a.client_name, a.starts_at, a.ends_at, a.artist, a.event_type,
            a.concept, a.placement, a.artist_id,
            ar.phone AS artist_phone, ar.name AS artist_name
     FROM appointments a
     INNER JOIN artists ar ON ar.id = a.artist_id AND ar.is_active = TRUE
     WHERE a.status = 'confirmed'
       AND a.starts_at > NOW()
       AND a.starts_at BETWEEN NOW() + INTERVAL '1 hour 50 minutes'
                           AND NOW() + INTERVAL '2 hours 10 minutes'
       AND NOT EXISTS (
         SELECT 1 FROM appointment_reminders r
         WHERE r.appointment_id = a.id AND r.reminder_type = 'artist_2h'
       )`
  );

  const site = await getSiteConfig();

  for (const row of rows) {
    const appointment = mapReminderRow(row);
    const phone = row.artist_phone;

    if (!phone?.trim()) {
      errors.push(`Cita ${row.id}: artista sin teléfono.`);
      continue;
    }

    try {
      const message = buildArtistAppointmentReminderMessage(
        appointment,
        { name: row.artist_name ?? row.artist ?? "Artista" },
        site
      );
      await sendTextViaOpenWA(phone, message);

      await queryOne(
        `INSERT INTO appointment_reminders (appointment_id, reminder_type)
         VALUES ($1, 'artist_2h')
         ON CONFLICT (appointment_id, reminder_type) DO NOTHING`,
        [row.id]
      );

      sent += 1;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al enviar recordatorio.";
      errors.push(`Cita ${row.id}: ${message}`);
    }
  }

  return { processed: rows.length, sent, errors };
}
