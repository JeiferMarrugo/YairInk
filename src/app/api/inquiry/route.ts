import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { after, NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/content";
import { isOpenWaConfigured, sendTextViaOpenWA } from "@/lib/openwa";
import { validatePhone } from "@/lib/phone";
import { createPublicBooking } from "@/lib/scheduling";
import { STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";
import {
  buildArtistInquiryAlertMessage,
  buildInquiryConfirmationMessage,
  resolveArtistNotifyPhone,
} from "@/lib/whatsapp";

export type InquiryPayload = {
  fullName: string;
  email: string;
  phone: string;
  concept: string;
  size: string;
  placement: string;
  timePreference: string;
  preferredMonth: string;
  selectedSlot?: {
    startsAt: string;
    endsAt: string;
  };
};

function validate(body: Partial<InquiryPayload>) {
  const errors: string[] = [];

  if (!body.fullName?.trim()) errors.push("El nombre es obligatorio.");
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("Introduce un email válido.");
  }

  const phoneResult = validatePhone(String(body.phone ?? ""));
  if (!phoneResult.ok) {
    errors.push(phoneResult.error);
  }

  if (!body.concept?.trim() || body.concept.trim().length < 20) {
    errors.push("Describe tu concepto con al menos 20 caracteres.");
  }
  if (!body.size?.trim()) errors.push("Indica el tamaño estimado.");
  if (!body.placement?.trim()) errors.push("Indica la zona del cuerpo.");

  if (!body.selectedSlot?.startsAt || !body.selectedSlot?.endsAt) {
    errors.push("Selecciona un horario disponible antes de enviar.");
  }

  return { errors, phoneResult };
}

async function saveInquiry(data: InquiryPayload & { phoneDisplay: string }) {
  const dir = path.join(process.cwd(), "data", "inquiries");
  await mkdir(dir, { recursive: true });

  const entry = {
    ...data,
    submittedAt: new Date().toISOString(),
  };

  await appendFile(
    path.join(dir, "inquiries.jsonl"),
    `${JSON.stringify(entry)}\n`,
    "utf8"
  );
}

async function sendEmail(data: InquiryPayload & { phoneDisplay: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.STUDIO_EMAIL ?? process.env.RESEND_TO_EMAIL;

  if (!apiKey || !to) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "YAIRINK <onboarding@resend.dev>",
      to: [to],
      reply_to: data.email,
      subject: `Nueva consulta — ${data.fullName}`,
      text: [
        `Nombre: ${data.fullName}`,
        `Email: ${data.email}`,
        `Teléfono: ${data.phoneDisplay}`,
        `Concepto: ${data.concept}`,
        `Tamaño: ${data.size}`,
        `Ubicación: ${data.placement}`,
        `Horario: ${data.timePreference}`,
        `Mes preferido: ${data.preferredMonth}`,
      ].join("\n"),
    }),
  });

  return response.ok;
}

async function sendClientWhatsApp(data: InquiryPayload) {
  if (!isOpenWaConfigured()) {
    return { sent: false as const, reason: "OpenWA no configurado." };
  }

  try {
    const site = await getSiteConfig();
    const message = buildInquiryConfirmationMessage(data, site);
    const result = await sendTextViaOpenWA(data.phone, message);
    return { sent: true as const, messageId: result.messageId };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Error al enviar WhatsApp.";
    return { sent: false as const, reason };
  }
}

async function sendArtistWhatsApp(
  data: InquiryPayload & { phoneDisplay: string }
) {
  if (!isOpenWaConfigured()) {
    return { sent: false as const, reason: "OpenWA no configurado." };
  }

  try {
    const site = await getSiteConfig();
    const artistPhone = resolveArtistNotifyPhone(site);

    if (!artistPhone) {
      return { sent: false as const, reason: "Teléfono del tatuador no configurado." };
    }

    const message = buildArtistInquiryAlertMessage(data, site);
    const result = await sendTextViaOpenWA(artistPhone, message);
    return { sent: true as const, messageId: result.messageId };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Error al notificar al tatuador.";
    return { sent: false as const, reason };
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<InquiryPayload>;
    const { errors, phoneResult } = validate(body);

    if (errors.length > 0 || !phoneResult.ok) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const slotStart = body.selectedSlot!.startsAt;
    const slotEnd = body.selectedSlot!.endsAt;
    const slotDate = new Date(slotStart);
    const preferredMonth = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, "0")}`;
    const timePreference = `${slotDate.toLocaleDateString(STUDIO_LOCALE, {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: STUDIO_TIMEZONE,
    })} · ${slotDate.toLocaleTimeString(STUDIO_LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: STUDIO_TIMEZONE,
    })}`;

    const data: InquiryPayload = {
      fullName: body.fullName!.trim(),
      email: body.email!.trim(),
      phone: phoneResult.whatsapp,
      concept: body.concept!.trim(),
      size: body.size!.trim(),
      placement: body.placement!.trim(),
      timePreference,
      preferredMonth,
      selectedSlot: { startsAt: slotStart, endsAt: slotEnd },
    };

    await createPublicBooking({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      concept: data.concept,
      size: data.size,
      placement: data.placement,
      startsAt: slotStart,
      endsAt: slotEnd,
    });

    const inquiryRecord = { ...data, phoneDisplay: phoneResult.display };
    await saveInquiry(inquiryRecord);

    const whatsappEnabled = isOpenWaConfigured();

    after(async () => {
      await sendEmail(inquiryRecord);
      await Promise.all([
        sendClientWhatsApp(data),
        sendArtistWhatsApp(inquiryRecord),
      ]);
    });

    return NextResponse.json({
      success: true,
      message: whatsappEnabled
        ? "Reserva registrada. Te enviaremos un WhatsApp de confirmación en breve. La cita queda pendiente de confirmación del estudio."
        : "Reserva registrada. Te contactaremos para confirmar tu cita.",
    });
  } catch {
    return NextResponse.json(
      { errors: ["No se pudo enviar la consulta. Inténtalo de nuevo."] },
      { status: 500 }
    );
  }
}
