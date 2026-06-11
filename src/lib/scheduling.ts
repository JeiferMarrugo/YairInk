import { query, queryOne } from "@/lib/db";
import { isSlotAvailable } from "@/lib/availability";
import { getArtist, getDefaultArtist } from "@/lib/artists";
import { validatePhone } from "@/lib/phone";
import type {
  AppointmentRecord,
  AppointmentStatus,
  AppointmentType,
  ClientRecord,
  ClientStatus,
  CreateAppointmentInput,
} from "@/types/scheduling";
import { appointmentTypeLabels } from "@/types/scheduling";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  total_spent_cents: number;
  last_session_at: string | null;
  style: string | null;
  placement: string | null;
  notes: string | null;
  created_at: string;
};

type AppointmentRow = {
  id: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  artist_id: string | null;
  artist: string | null;
  event_type: string;
  status: string;
  concept: string | null;
  placement: string | null;
  size_estimate: string | null;
  style: string | null;
  notes: string | null;
  completed_at: string | null;
  share_token: string | null;
  session_photos: Array<{ src: string; alt?: string }> | null;
  portfolio_item_id: string | null;
  review_id?: string | null;
  created_at: string;
};

const APPOINTMENT_SELECT = `id, client_id, client_name, client_email, client_phone, title,
  starts_at, ends_at, artist_id, artist, event_type, status, concept, placement,
  size_estimate, style, notes, completed_at, share_token, session_photos,
  portfolio_item_id, created_at`;

function mapClient(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    phoneDisplay: row.phone,
    status: row.status as ClientStatus,
    totalSpentCents: row.total_spent_cents,
    lastSessionAt: row.last_session_at,
    style: row.style,
    placement: row.placement,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapAppointment(row: AppointmentRow): AppointmentRecord {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientPhoneDisplay: row.client_phone,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    artistId: row.artist_id,
    artist: row.artist,
    eventType: row.event_type as AppointmentType,
    status: row.status as AppointmentStatus,
    concept: row.concept,
    placement: row.placement,
    sizeEstimate: row.size_estimate,
    style: row.style,
    notes: row.notes,
    completedAt: row.completed_at,
    shareToken: row.share_token,
    sessionPhotos: (row.session_photos ?? []).map((photo) => photo.src),
    portfolioItemId: row.portfolio_item_id,
    reviewSubmitted: Boolean(row.review_id),
    createdAt: row.created_at,
  };
}


export async function listClients(): Promise<ClientRecord[]> {
  const rows = await query<ClientRow>(
    `SELECT id, name, email, phone, status, total_spent_cents, last_session_at,
            style, placement, notes, created_at
     FROM clients
     ORDER BY name ASC`
  );
  return rows.map(mapClient);
}

export async function listPendingAppointments(): Promise<AppointmentRecord[]> {
  const rows = await query<AppointmentRow>(
    `SELECT ${APPOINTMENT_SELECT},
            (SELECT r.id FROM reviews r WHERE r.appointment_id = appointments.id LIMIT 1) AS review_id
     FROM appointments
     WHERE status = 'pending'
     ORDER BY starts_at ASC
     LIMIT 30`
  );
  return rows.map(mapAppointment);
}

export async function listAppointments(
  start: string,
  end: string
): Promise<AppointmentRecord[]> {
  const rows = await query<AppointmentRow>(
    `SELECT ${APPOINTMENT_SELECT},
            (SELECT r.id FROM reviews r WHERE r.appointment_id = appointments.id LIMIT 1) AS review_id
     FROM appointments
     WHERE starts_at >= $1::timestamptz AND starts_at < $2::timestamptz
     ORDER BY starts_at ASC`,
    [start, end]
  );
  return rows.map(mapAppointment);
}

export async function getAppointment(id: string): Promise<AppointmentRecord | null> {
  const row = await queryOne<AppointmentRow>(
    `SELECT ${APPOINTMENT_SELECT},
            (SELECT r.id FROM reviews r WHERE r.appointment_id = appointments.id LIMIT 1) AS review_id
     FROM appointments WHERE id = $1`,
    [id]
  );
  return row ? mapAppointment(row) : null;
}

async function upsertClient(input: {
  name: string;
  email: string;
  phone: string;
  phoneDisplay: string;
  style: string;
  placement: string;
  notes: string;
  sessionDate: string;
}): Promise<string> {
  const email = input.email.trim().toLowerCase() || null;
  const existing = email
    ? await queryOne<ClientRow>(
        `SELECT id, name, email, phone, status, total_spent_cents, last_session_at,
                style, placement, notes, created_at
         FROM clients WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email]
      )
    : await queryOne<ClientRow>(
        `SELECT id, name, email, phone, status, total_spent_cents, last_session_at,
                style, placement, notes, created_at
         FROM clients WHERE phone = $1 LIMIT 1`,
        [input.phoneDisplay]
      );

  const sessionDate = input.sessionDate.slice(0, 10);

  if (existing) {
    await query(
      `UPDATE clients SET
         name = $2,
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         style = COALESCE(NULLIF($5, ''), style),
         placement = COALESCE(NULLIF($6, ''), placement),
         notes = COALESCE(NULLIF($7, ''), notes),
         last_session_at = CASE
           WHEN last_session_at IS NULL THEN $8::date
           ELSE GREATEST(last_session_at, $8::date)
         END
       WHERE id = $1`,
      [
        existing.id,
        input.name,
        email,
        input.phoneDisplay,
        input.style,
        input.placement,
        input.notes,
        sessionDate,
      ]
    );
    return existing.id;
  }

  const inserted = await queryOne<{ id: string }>(
    `INSERT INTO clients (name, email, phone, status, style, placement, notes, last_session_at)
     VALUES ($1, $2, $3, 'activo', $4, $5, $6, $7::date)
     RETURNING id`,
    [
      input.name,
      email,
      input.phoneDisplay,
      input.style || null,
      input.placement || null,
      input.notes || null,
      sessionDate,
    ]
  );

  if (!inserted) throw new Error("No se pudo crear el cliente.");
  return inserted.id;
}

function buildTitle(clientName: string, eventType: AppointmentType): string {
  const shortName = clientName.trim().split(/\s+/).slice(0, 2).join(" ");
  return `${shortName} — ${appointmentTypeLabels[eventType]}`;
}

export function validateAppointmentInput(body: Partial<CreateAppointmentInput>) {
  const errors: string[] = [];

  if (!body.clientName?.trim()) errors.push("El nombre del cliente es obligatorio.");
  if (!body.clientEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.clientEmail)) {
    errors.push("Introduce un email válido.");
  }

  const phoneResult = validatePhone(String(body.clientPhone ?? ""));
  if (!phoneResult.ok) errors.push(phoneResult.error);

  if (!body.startsAt) errors.push("Indica la fecha y hora de inicio.");
  if (!body.endsAt) errors.push("Indica la fecha y hora de fin.");
  if (body.startsAt && body.endsAt && body.endsAt <= body.startsAt) {
    errors.push("La hora de fin debe ser posterior al inicio.");
  }

  if (!body.eventType) errors.push("Selecciona el tipo de cita.");
  if (!body.status) errors.push("Selecciona el estado de la cita.");
  if (!body.artistId?.trim()) errors.push("Selecciona un artista.");

  return { errors, phoneResult };
}

export async function createAppointment(
  body: CreateAppointmentInput
): Promise<AppointmentRecord> {
  const { errors, phoneResult } = validateAppointmentInput(body);
  if (errors.length > 0 || !phoneResult.ok) {
    throw new Error(
      errors[0] ?? (!phoneResult.ok ? phoneResult.error : "Datos inválidos.")
    );
  }

  const clientId = await upsertClient({
    name: body.clientName.trim(),
    email: body.clientEmail.trim(),
    phone: phoneResult.whatsapp,
    phoneDisplay: phoneResult.display,
    style: body.style.trim(),
    placement: body.placement.trim(),
    notes: body.notes.trim(),
    sessionDate: body.startsAt,
  });

  const artist = await getArtist(body.artistId.trim());
  if (!artist || !artist.isActive) {
    throw new Error("Selecciona un artista activo.");
  }

  const title = buildTitle(body.clientName, body.eventType);

  const row = await queryOne<AppointmentRow>(
    `INSERT INTO appointments (
       client_id, client_name, client_email, client_phone, title,
       starts_at, ends_at, artist_id, artist, event_type, status,
       concept, placement, size_estimate, style, notes
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING ${APPOINTMENT_SELECT}`,
    [
      clientId,
      body.clientName.trim(),
      body.clientEmail.trim().toLowerCase(),
      phoneResult.display,
      title,
      body.startsAt,
      body.endsAt,
      artist.id,
      artist.name,
      body.eventType,
      body.status,
      body.concept.trim() || null,
      body.placement.trim() || null,
      body.sizeEstimate.trim() || null,
      body.style.trim() || null,
      body.notes.trim() || null,
    ]
  );

  if (!row) throw new Error("No se pudo crear la cita.");
  return mapAppointment(row);
}

export async function updateAppointment(
  id: string,
  patch: {
    status?: AppointmentStatus;
    startsAt?: string;
    endsAt?: string;
    notes?: string;
  }
): Promise<AppointmentRecord | null> {
  const current = await getAppointment(id);
  if (!current) return null;

  const row = await queryOne<AppointmentRow>(
    `UPDATE appointments SET
       status = COALESCE($2, status),
       starts_at = COALESCE($3::timestamptz, starts_at),
       ends_at = COALESCE($4::timestamptz, ends_at),
       notes = COALESCE($5, notes)
     WHERE id = $1
     RETURNING ${APPOINTMENT_SELECT}`,
    [
      id,
      patch.status ?? null,
      patch.startsAt ?? null,
      patch.endsAt ?? null,
      patch.notes ?? null,
    ]
  );

  return row ? mapAppointment(row) : null;
}

export type PublicBookingInput = {
  fullName: string;
  email: string;
  phone: string;
  concept: string;
  size: string;
  placement: string;
  startsAt: string;
  endsAt: string;
  artistId?: string;
};

export async function createPublicBooking(
  input: PublicBookingInput
): Promise<AppointmentRecord> {
  const available = await isSlotAvailable(input.startsAt, input.endsAt);
  if (!available) {
    throw new Error("Ese horario ya no está disponible. Elige otro.");
  }

  const defaultArtist =
    (input.artistId ? await getArtist(input.artistId) : null) ??
    (await getDefaultArtist());

  if (!defaultArtist) {
    throw new Error("No hay artistas activos configurados.");
  }

  return createAppointment({
    clientName: input.fullName.trim(),
    clientEmail: input.email.trim(),
    clientPhone: input.phone,
    eventType: "consulta",
    status: "pending",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    artistId: defaultArtist.id,
    concept: input.concept.trim(),
    placement: input.placement.trim(),
    sizeEstimate: input.size.trim(),
    style: "",
    notes: "Reserva web — pendiente de confirmación",
  });
}
