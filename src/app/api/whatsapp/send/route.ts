import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSiteConfig } from "@/lib/content";
import { isOpenWaConfigured, sendTextViaOpenWA } from "@/lib/openwa";
import { buildFeedbackRequestMessage } from "@/lib/whatsapp";

type SendBody = {
  phone: string;
  message?: string;
  clientName?: string;
  piece?: string;
};

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  if (!isOpenWaConfigured()) {
    return NextResponse.json(
      {
        error: "OpenWA no configurado.",
        hint: "Activa WHATSAPP_ENABLED=true y levanta OpenWA con Docker (localhost:2785)",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as SendBody;
    const { phone, clientName, piece } = body;

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "El teléfono es obligatorio." },
        { status: 400 }
      );
    }

    const message =
      body.message?.trim() ||
      (clientName && piece
        ? buildFeedbackRequestMessage(
            clientName,
            piece,
            await getSiteConfig()
          )
        : "");

    if (!message) {
      return NextResponse.json(
        { error: "Falta el mensaje o los datos del cliente." },
        { status: 400 }
      );
    }

    const result = await sendTextViaOpenWA(phone, message);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: "Mensaje enviado por WhatsApp.",
    });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Error al enviar mensaje.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
