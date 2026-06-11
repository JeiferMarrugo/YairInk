import { NextResponse } from "next/server";
import { notifyAboutAppointment } from "@/lib/appointment-notify";
import { requireAuth } from "@/lib/auth";
import { completeAppointment } from "@/lib/sessions";
import { getAppUrl } from "@/lib/uploads";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      photoUrls?: string[];
      publishPortfolio?: boolean;
    };

    const photoUrls = Array.isArray(body.photoUrls)
      ? body.photoUrls.filter((url) => typeof url === "string" && url.trim())
      : [];

    const { appointment, shareToken } = await completeAppointment(id, {
      photoUrls,
      publishPortfolio: body.publishPortfolio !== false,
    });

    const shareUrl = `${getAppUrl()}/sesion/${shareToken}`;
    const whatsapp = await notifyAboutAppointment(
      appointment,
      "completed",
      shareUrl
    );

    return NextResponse.json({ appointment, shareUrl, whatsapp });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo completar la cita.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
