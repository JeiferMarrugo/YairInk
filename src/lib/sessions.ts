import crypto from "crypto";
import { query, queryOne } from "@/lib/db";
import { getAppointment } from "@/lib/scheduling";
import type { AppointmentRecord } from "@/types/scheduling";
import { appointmentTypeLabels } from "@/types/scheduling";
import { STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";

type SessionPhoto = { src: string; alt: string };

type AppointmentSessionRow = {
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
  session_photos: SessionPhoto[] | null;
  portfolio_item_id: string | null;
  created_at: string;
  review_id: string | null;
};

export type SessionPublicView = {
  token: string;
  clientName: string;
  artistName: string;
  artistPhotoUrl: string | null;
  artistSpecialty: string | null;
  eventType: string;
  concept: string | null;
  placement: string | null;
  style: string | null;
  completedAt: string;
  sessionPhotos: SessionPhoto[];
  reviewSubmitted: boolean;
  siteName: string;
};

const APPOINTMENT_SESSION_SELECT = `
  a.id, a.client_id, a.client_name, a.client_email, a.client_phone, a.title,
  a.starts_at, a.ends_at, a.artist_id, a.artist, a.event_type, a.status,
  a.concept, a.placement, a.size_estimate, a.style, a.notes,
  a.completed_at, a.share_token, a.session_photos, a.portfolio_item_id, a.created_at,
  (SELECT r.id FROM reviews r WHERE r.appointment_id = a.id LIMIT 1) AS review_id
`;

function formatReviewDate(date: Date): string {
  const label = date.toLocaleDateString(STUDIO_LOCALE, {
    month: "long",
    year: "numeric",
    timeZone: STUDIO_TIMEZONE,
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildPieceLabel(input: {
  style: string | null;
  placement: string | null;
  eventType: AppointmentRecord["eventType"];
}): string {
  const parts = [input.style?.trim(), input.placement?.trim()].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  return appointmentTypeLabels[input.eventType];
}

function buildPortfolioMeta(appointment: AppointmentRecord): string {
  const parts = [
    appointment.style?.trim(),
    appointment.placement?.trim(),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Sesión realizada";
}

function mapStyleToPortfolioCategory(style: string | null): string {
  const value = style?.toLowerCase() ?? "";
  if (value.includes("black")) return "BLACKWORK";
  if (value.includes("minimal")) return "MINIMALISMO";
  return "LÍNEA FINA";
}

async function ensurePortfolioItemForAppointment(
  appointmentId: string,
  input: {
    style: string | null;
    placement: string | null;
    eventType: AppointmentRecord["eventType"];
    portfolioItemId: string | null;
  },
  photos: SessionPhoto[]
): Promise<void> {
  if (input.portfolioItemId || photos.length === 0) return;

  const title = buildPieceLabel({
    style: input.style,
    placement: input.placement,
    eventType: input.eventType,
  });
  const meta = [input.style?.trim(), input.placement?.trim()]
    .filter(Boolean)
    .join(" · ") || "Sesión realizada";
  const primary = photos[0];
  const sortRow = await queryOne<{ next_order: number }>(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM portfolio_items`
  );

  const portfolio = await queryOne<{ id: string }>(
    `INSERT INTO portfolio_items (
       title, meta, category, src, alt, layout_size, images, appointment_id, is_published, sort_order
     ) VALUES ($1, $2, $3, $4, $5, 'grid', $6::jsonb, $7, TRUE, $8)
     RETURNING id`,
    [
      title,
      meta,
      mapStyleToPortfolioCategory(input.style),
      primary.src,
      primary.alt,
      JSON.stringify(photos),
      appointmentId,
      sortRow?.next_order ?? 1,
    ]
  );

  if (portfolio) {
    await query(
      `UPDATE appointments SET portfolio_item_id = $2 WHERE id = $1`,
      [appointmentId, portfolio.id]
    );
  }
}

function normalizeSessionPhotos(
  photos: SessionPhoto[] | null,
  clientName: string
): SessionPhoto[] {
  if (!photos || photos.length === 0) return [];
  return photos.map((photo, index) => ({
    src: photo.src,
    alt: photo.alt?.trim() || `Tatuaje de ${clientName} — foto ${index + 1}`,
  }));
}

export async function completeAppointment(
  id: string,
  options: { photoUrls: string[]; publishPortfolio: boolean }
): Promise<{ appointment: AppointmentRecord; shareToken: string }> {
  const current = await getAppointment(id);
  if (!current) throw new Error("Cita no encontrada.");
  if (current.status === "cancelled") {
    throw new Error("No se puede marcar como realizada una cita cancelada.");
  }
  if (current.status === "completed") {
    throw new Error("Esta cita ya está marcada como realizada.");
  }
  if (options.photoUrls.length === 0) {
    throw new Error("Sube al menos una foto del tatuaje.");
  }

  const shareToken = crypto.randomBytes(24).toString("hex");
  const sessionPhotos = options.photoUrls.map((src, index) => ({
    src,
    alt: `Tatuaje de ${current.clientName} — foto ${index + 1}`,
  }));

  let portfolioItemId: string | null = null;

  if (options.publishPortfolio) {
    const title = buildPieceLabel({
      style: current.style,
      placement: current.placement,
      eventType: current.eventType,
    });
    const meta = buildPortfolioMeta(current);
    const primary = sessionPhotos[0];

    const portfolio = await queryOne<{ id: string }>(
      `INSERT INTO portfolio_items (
         title, meta, category, src, alt, layout_size, images, appointment_id, is_published
       ) VALUES ($1, $2, $3, $4, $5, 'grid', $6::jsonb, $7, TRUE)
       RETURNING id`,
      [
        title,
        meta,
        mapStyleToPortfolioCategory(current.style),
        primary.src,
        primary.alt,
        JSON.stringify(sessionPhotos),
        id,
      ]
    );
    portfolioItemId = portfolio?.id ?? null;
  }

  await query(
    `UPDATE appointments SET
       status = 'completed',
       completed_at = NOW(),
       share_token = $2,
       session_photos = $3::jsonb,
       portfolio_item_id = COALESCE($4, portfolio_item_id)
     WHERE id = $1`,
    [id, shareToken, JSON.stringify(sessionPhotos), portfolioItemId]
  );

  const appointment = await getAppointment(id);
  if (!appointment) throw new Error("No se pudo cargar la cita actualizada.");

  return { appointment, shareToken };
}

export async function getSessionByToken(
  token: string
): Promise<SessionPublicView | null> {
  const row = await queryOne<
    AppointmentSessionRow & {
      artist_photo_url: string | null;
      artist_specialty: string | null;
      site_name: string;
    }
  >(
    `SELECT ${APPOINTMENT_SESSION_SELECT},
            ar.photo_url AS artist_photo_url,
            ar.specialty AS artist_specialty,
            (SELECT value->>'name' FROM site_content WHERE key = 'site' LIMIT 1) AS site_name
     FROM appointments a
     LEFT JOIN artists ar ON ar.id = a.artist_id
     WHERE a.share_token = $1 AND a.status = 'completed'`,
    [token]
  );

  if (!row?.completed_at) return null;

  return {
    token,
    clientName: row.client_name,
    artistName: row.artist ?? "Artista",
    artistPhotoUrl: row.artist_photo_url,
    artistSpecialty: row.artist_specialty,
    eventType: appointmentTypeLabels[row.event_type as keyof typeof appointmentTypeLabels] ?? row.event_type,
    concept: row.concept,
    placement: row.placement,
    style: row.style,
    completedAt: row.completed_at,
    sessionPhotos: normalizeSessionPhotos(row.session_photos, row.client_name),
    reviewSubmitted: Boolean(row.review_id),
    siteName: row.site_name ?? "YAIRINK",
  };
}

export async function submitSessionReview(
  token: string,
  input: { rating: number; text: string }
): Promise<void> {
  const rating = Math.round(input.rating);
  const text = input.text.trim();

  if (rating < 1 || rating > 5) {
    throw new Error("Selecciona una valoración entre 1 y 5 estrellas.");
  }
  if (text.length < 10) {
    throw new Error("Escribe al menos 10 caracteres en tu reseña.");
  }

  const row = await queryOne<{
    id: string;
    client_name: string;
    style: string | null;
    placement: string | null;
    event_type: string;
    session_photos: SessionPhoto[] | null;
    client_phone: string | null;
    portfolio_item_id: string | null;
    review_id: string | null;
  }>(
    `SELECT a.id, a.client_name, a.style, a.placement, a.event_type,
            a.session_photos, a.client_phone, a.portfolio_item_id,
            (SELECT r.id FROM reviews r WHERE r.appointment_id = a.id LIMIT 1) AS review_id
     FROM appointments a
     WHERE a.share_token = $1 AND a.status = 'completed'`,
    [token]
  );

  if (!row) throw new Error("Sesión no encontrada.");
  if (row.review_id) throw new Error("Ya enviaste una reseña para esta sesión.");

  const photos = normalizeSessionPhotos(row.session_photos, row.client_name);
  const primary = photos[0];
  if (!primary) throw new Error("Esta sesión no tiene fotos.");

  const piece = buildPieceLabel({
    style: row.style,
    placement: row.placement,
    eventType: row.event_type as AppointmentRecord["eventType"],
  });

  const reviewDate = formatReviewDate(new Date());
  const sortRow = await queryOne<{ next_order: number }>(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM reviews`
  );

  const review = await queryOne<{ id: string }>(
    `INSERT INTO reviews (
       name, piece, rating, review_date, text, image, image_alt,
       client_phone, sort_order, is_published, appointment_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10)
     RETURNING id`,
    [
      row.client_name,
      piece,
      rating,
      reviewDate,
      text,
      primary.src,
      primary.alt,
      row.client_phone,
      sortRow?.next_order ?? 1,
      row.id,
    ]
  );

  if (!review) throw new Error("No se pudo guardar la reseña.");

  await ensurePortfolioItemForAppointment(
    row.id,
    {
      style: row.style,
      placement: row.placement,
      eventType: row.event_type as AppointmentRecord["eventType"],
      portfolioItemId: row.portfolio_item_id,
    },
    photos
  );
}
