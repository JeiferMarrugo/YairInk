import { NextResponse } from "next/server";
import {
  notifyAboutAppointment,
  resolveNotifyEventForStatusChange,
  type AppointmentNotifyResult,
} from "@/lib/appointment-notify";
import { requireAuth } from "@/lib/auth";
import { getAppointment, updateAppointment } from "@/lib/scheduling";
import type { AppointmentStatus } from "@/types/scheduling";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const appointment = await getAppointment(id);
    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }
    return NextResponse.json({ appointment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar la cita.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      status?: AppointmentStatus;
      startsAt?: string;
      endsAt?: string;
      notes?: string;
    };

    const current = await getAppointment(id);
    if (!current) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    const appointment = await updateAppointment(id, body);
    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
    }

    let whatsapp: AppointmentNotifyResult = {
      sent: false,
      reason: "Sin cambio de estado.",
    };
    let artistWhatsapp: AppointmentNotifyResult = {
      sent: false,
      reason: "Sin cambio de estado.",
    };

    if (body.status) {
      const notifyEvent = resolveNotifyEventForStatusChange(
        current.status,
        body.status
      );
      if (notifyEvent) {
        const notifications = await notifyAboutAppointment(
          appointment,
          notifyEvent
        );
        whatsapp = notifications.client;
        artistWhatsapp = notifications.artist;
      }
    }

    return NextResponse.json({ appointment, whatsapp, artistWhatsapp });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar la cita.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
