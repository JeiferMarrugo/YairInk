import { getSiteConfig } from "@/lib/content";
import { getArtist } from "@/lib/artists";
import { isOpenWaConfigured, sendTextViaOpenWA } from "@/lib/openwa";
import {
  buildAppointmentCancelledMessage,
  buildAppointmentConfirmedMessage,
  buildAppointmentCreatedMessage,
  buildArtistAppointmentConfirmedMessage,
  buildSessionSummaryMessage,
} from "@/lib/whatsapp";
import type { AppointmentRecord, AppointmentStatus } from "@/types/scheduling";

export type AppointmentNotifyEvent =
  | "created"
  | "confirmed"
  | "cancelled"
  | "completed";

export type AppointmentNotifyResult = {
  sent: boolean;
  reason?: string;
};

export type AppointmentNotificationsResult = {
  client: AppointmentNotifyResult;
  artist: AppointmentNotifyResult;
};

function resolveClientPhone(appointment: AppointmentRecord): string | null {
  const phone =
    appointment.clientPhone?.trim() ||
    appointment.clientPhoneDisplay?.trim() ||
    null;
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 ? phone : null;
}

export function resolveNotifyEventForCreate(
  status: AppointmentStatus
): AppointmentNotifyEvent | null {
  if (status === "cancelled") return "cancelled";
  if (status === "confirmed") return "confirmed";
  return "created";
}

export function resolveNotifyEventForStatusChange(
  previous: AppointmentStatus,
  next: AppointmentStatus
): AppointmentNotifyEvent | null {
  if (previous === next) return null;
  if (next === "confirmed") return "confirmed";
  if (next === "cancelled") return "cancelled";
  if (next === "completed") return "completed";
  return null;
}

export async function notifyClientAboutAppointment(
  appointment: AppointmentRecord,
  event: AppointmentNotifyEvent,
  shareUrl?: string
): Promise<AppointmentNotifyResult> {
  if (!isOpenWaConfigured()) {
    return { sent: false, reason: "OpenWA no configurado." };
  }

  const phone = resolveClientPhone(appointment);
  if (!phone) {
    return { sent: false, reason: "El cliente no tiene teléfono válido." };
  }

  try {
    const site = await getSiteConfig();
    const message =
      event === "completed" && shareUrl
        ? buildSessionSummaryMessage(appointment, shareUrl, site)
        : event === "confirmed"
          ? buildAppointmentConfirmedMessage(appointment, site)
          : event === "cancelled"
            ? buildAppointmentCancelledMessage(appointment, site)
            : buildAppointmentCreatedMessage(appointment, site);

    await sendTextViaOpenWA(phone, message);
    return { sent: true };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Error al enviar WhatsApp.";
    return { sent: false, reason };
  }
}

export async function notifyArtistAboutAppointment(
  appointment: AppointmentRecord
): Promise<AppointmentNotifyResult> {
  if (!isOpenWaConfigured()) {
    return { sent: false, reason: "OpenWA no configurado." };
  }

  if (!appointment.artistId) {
    return { sent: false, reason: "La cita no tiene artista asignado." };
  }

  const artist = await getArtist(appointment.artistId);
  if (!artist?.phone) {
    return { sent: false, reason: "Artista sin teléfono configurado." };
  }

  try {
    const site = await getSiteConfig();
    const message = buildArtistAppointmentConfirmedMessage(
      appointment,
      { name: artist.name },
      site
    );
    await sendTextViaOpenWA(artist.phone, message);
    return { sent: true };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Error al enviar WhatsApp.";
    return { sent: false, reason };
  }
}

export async function notifyAboutAppointment(
  appointment: AppointmentRecord,
  event: AppointmentNotifyEvent,
  shareUrl?: string
): Promise<AppointmentNotificationsResult> {
  const client = await notifyClientAboutAppointment(
    appointment,
    event,
    shareUrl
  );

  let artist: AppointmentNotifyResult = {
    sent: false,
    reason: "No aplica para este evento.",
  };

  if (event === "confirmed") {
    artist = await notifyArtistAboutAppointment(appointment);
  }

  return { client, artist };
}
