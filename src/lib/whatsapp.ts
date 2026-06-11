import type { SiteConfig } from "@/types/content";
import type { AppointmentRecord } from "@/types/scheduling";
import { appointmentTypeLabels } from "@/types/scheduling";
import { STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";

function appointmentFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function formatAppointmentSchedule(appointment: AppointmentRecord): string {
  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);
  const date = start.toLocaleDateString(STUDIO_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: STUDIO_TIMEZONE,
  });
  const startTime = start.toLocaleTimeString(STUDIO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TIMEZONE,
  });
  const endTime = end.toLocaleTimeString(STUDIO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: STUDIO_TIMEZONE,
  });
  return `${date}\n${startTime} – ${endTime}`;
}

function appointmentDetailsBlock(appointment: AppointmentRecord): string {
  const lines = [
    `• Tipo: ${appointmentTypeLabels[appointment.eventType]}`,
    `• Fecha y hora:\n  ${formatAppointmentSchedule(appointment)}`,
  ];
  if (appointment.concept?.trim()) {
    lines.push(`• Concepto: ${appointment.concept.trim()}`);
  }
  if (appointment.placement?.trim()) {
    lines.push(`• Zona: ${appointment.placement.trim()}`);
  }
  if (appointment.artist?.trim()) {
    lines.push(`• Artista: ${appointment.artist.trim()}`);
  }
  return lines.join("\n");
}

export function buildAppointmentCreatedMessage(
  appointment: AppointmentRecord,
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName = appointmentFirstName(appointment.clientName);
  const artistName = appointment.artist?.trim() || site.artist.name;
  const statusNote =
    appointment.status === "confirmed"
      ? `Tu cita con *${artistName}* ha sido *confirmada*.`
      : `Tu cita con *${artistName}* queda *pendiente de confirmación*. Te avisaremos cuando quede confirmada.`;

  return (
    `Hola ${firstName}, te escribimos de ${site.name}.\n\n` +
    `Hemos registrado tu cita en nuestro calendario.\n${statusNote}\n\n` +
    `*Detalles:*\n${appointmentDetailsBlock(appointment)}\n\n` +
    `Si necesitas cambiar algo, responde a este mensaje.\n\n` +
    `— ${site.name}`
  );
}

export function buildAppointmentConfirmedMessage(
  appointment: AppointmentRecord,
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName = appointmentFirstName(appointment.clientName);
  const artistName = appointment.artist?.trim() || site.artist.name;

  return (
    `Hola ${firstName}, te escribimos de ${site.name}.\n\n` +
    `✅ *Tu cita con ${artistName} ha sido confirmada* para:\n\n` +
    `${formatAppointmentSchedule(appointment)}\n\n` +
    `*Detalles:*\n${appointmentDetailsBlock(appointment)}\n\n` +
    `Te esperamos puntualmente. Si no puedes asistir, avísanos con antelación.\n\n` +
    `— ${site.name}`
  );
}

export function buildAppointmentCancelledMessage(
  appointment: AppointmentRecord,
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName = appointmentFirstName(appointment.clientName);
  const artistName = appointment.artist?.trim() || site.artist.name;

  return (
    `Hola ${firstName}, te escribimos de ${site.name}.\n\n` +
    `Tu cita con *${artistName}* ha sido *cancelada*.\n\n` +
    `*Cita cancelada:*\n${appointmentDetailsBlock(appointment)}\n\n` +
    `Si deseas reagendar, escríbenos y buscaremos un nuevo horario.\n\n` +
    `— ${site.name}`
  );
}

export function buildArtistAppointmentConfirmedMessage(
  appointment: AppointmentRecord,
  artist: { name: string },
  site: Pick<SiteConfig, "name">
) {
  return (
    `Hola ${artist.name}, te escribimos de ${site.name}.\n\n` +
    `✅ *Se confirmó una cita contigo:*\n\n` +
    `*Cliente:* ${appointment.clientName}\n` +
    `*Tipo:* ${appointmentTypeLabels[appointment.eventType]}\n` +
    `*Fecha y hora:*\n${formatAppointmentSchedule(appointment)}\n` +
    (appointment.concept?.trim()
      ? `*Concepto:* ${appointment.concept.trim()}\n`
      : "") +
    (appointment.placement?.trim()
      ? `*Zona:* ${appointment.placement.trim()}\n`
      : "") +
    `\nRevisa tu calendario y prepárate para la sesión.`
  );
}

export function buildArtistAppointmentReminderMessage(
  appointment: AppointmentRecord,
  artist: { name: string },
  site: Pick<SiteConfig, "name">
) {
  return (
    `⏰ *Recordatorio — ${site.name}*\n\n` +
    `Hola ${artist.name}, tu cita con *${appointment.clientName}* ` +
    `comienza en aproximadamente 2 horas.\n\n` +
    `*Horario:*\n${formatAppointmentSchedule(appointment)}\n` +
    `*Tipo:* ${appointmentTypeLabels[appointment.eventType]}\n` +
    (appointment.concept?.trim()
      ? `*Concepto:* ${appointment.concept.trim()}\n`
      : "") +
    `\n¡Nos vemos pronto!`
  );
}

export function buildSessionSummaryMessage(
  appointment: AppointmentRecord,
  shareUrl: string,
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName = appointmentFirstName(appointment.clientName);
  const artistName = appointment.artist?.trim() || site.artist.name;
  const piece =
    appointment.concept?.trim() ||
    appointment.style?.trim() ||
    appointmentTypeLabels[appointment.eventType];

  return (
    `Hola ${firstName}, te escribimos de ${site.name}.\n\n` +
    `✨ *Tu sesión con ${artistName} ya está lista.*\n\n` +
    `Preparamos un resumen de tu tatuaje «${piece}» con las fotos de la sesión.\n\n` +
    `👉 *Ver tu resumen y dejar reseña:*\n${shareUrl}\n\n` +
    `Tu opinión nos ayuda a seguir creando arte en tu piel.\n\n` +
    `— ${site.name}`
  );
}

export function buildFeedbackRequestMessage(
  clientName: string,
  piece: string,
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName = clientName.split(" ")[0];
  return (
    `Hola ${firstName}, soy ${site.artist.name} de ${site.name}. ` +
    `Nos encantaría conocer tu opinión sobre tu pieza "${piece}". ` +
    `¿Podrías compartirnos tu experiencia? ¡Gracias!`
  );
}

export function buildNewReviewMessage(site: Pick<SiteConfig, "name">) {
  return `Hola ${site.name}, soy cliente y me gustaría compartir mi experiencia y reseña sobre mi tatuaje.`;
}

export type InquirySummary = {
  fullName: string;
  email: string;
  phone: string;
  concept: string;
  size: string;
  placement: string;
  timePreference: string;
  preferredMonth: string;
};

export function buildInquiryConfirmationMessage(
  inquiry: InquirySummary,
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName = inquiry.fullName.trim().split(/\s+/)[0] || inquiry.fullName;

  return (
    `Hola ${firstName}, soy ${site.artist.name} de ${site.name}.\n\n` +
    `Gracias por tu solicitud de consulta. Pronto atenderemos tu petición.\n\n` +
    `*Resumen de tu solicitud:*\n` +
    `• Concepto: ${inquiry.concept.trim()}\n` +
    `• Tamaño: ${inquiry.size.trim()}\n` +
    `• Zona: ${inquiry.placement.trim()}\n` +
    `• Horario: ${inquiry.timePreference.trim()}\n` +
    `• Mes preferido: ${inquiry.preferredMonth.trim()}\n` +
    `• Email: ${inquiry.email.trim()}\n\n` +
    `Te contactaremos en 1-3 días hábiles para hablar de tu proyecto.\n\n` +
    `— ${site.name}`
  );
}

export function buildArtistInquiryAlertMessage(
  inquiry: InquirySummary & { phoneDisplay: string },
  site: Pick<SiteConfig, "name" | "artist">
) {
  const firstName =
    inquiry.fullName.trim().split(/\s+/)[0] || inquiry.fullName;
  const chatUrl = clientDirectUrl(
    inquiry.phone,
    `Hola ${firstName}, soy ${site.artist.name} de ${site.name}. He recibido tu solicitud de consulta y me gustaría hablar contigo sobre tu proyecto.`
  );

  return (
    `🔔 *Nueva consulta — ${site.name}*\n\n` +
    `*Cliente:* ${inquiry.fullName}\n` +
    `*Teléfono:* ${inquiry.phoneDisplay}\n` +
    `*Email:* ${inquiry.email}\n\n` +
    `*Concepto:* ${inquiry.concept.trim()}\n` +
    `*Tamaño:* ${inquiry.size.trim()}\n` +
    `*Zona:* ${inquiry.placement.trim()}\n` +
    `*Horario:* ${inquiry.timePreference.trim()}\n` +
    `*Mes preferido:* ${inquiry.preferredMonth.trim()}\n\n` +
    `👉 *Abrir chat con el cliente:*\n${chatUrl}`
  );
}

export function resolveArtistNotifyPhone(site: Pick<SiteConfig, "contact">): string {
  const fromEnv = process.env.ARTIST_NOTIFY_PHONE?.trim();
  if (fromEnv) return fromEnv.replace(/\D/g, "");
  return site.contact.whatsapp.replace(/\D/g, "");
}

export function studioWhatsAppUrl(
  message: string,
  site: Pick<SiteConfig, "contact">
) {
  const phone = site.contact.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function clientFeedbackRequestUrl(
  clientName: string,
  piece: string,
  clientPhone: string,
  site: SiteConfig
) {
  return clientDirectUrl(
    clientPhone,
    buildFeedbackRequestMessage(clientName, piece, site)
  );
}

export function newReviewUrl(site: SiteConfig) {
  return studioWhatsAppUrl(buildNewReviewMessage(site), site);
}

export function clientDirectUrl(phone: string, message: string) {
  const normalized = phone.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
