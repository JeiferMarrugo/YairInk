import { NextResponse } from "next/server";
import {
  notifyAboutAppointment,
  resolveNotifyEventForCreate,
} from "@/lib/appointment-notify";
import { requireAuth } from "@/lib/auth";
import { createAppointment, listAppointments, listPendingAppointments } from "@/lib/scheduling";
import type { CreateAppointmentInput } from "@/types/scheduling";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  if (statusFilter === "pending") {
    try {
      const appointments = await listPendingAppointments();
      return NextResponse.json({ appointments });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al cargar citas.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Parámetros start y end requeridos." },
      { status: 400 }
    );
  }

  try {
    const appointments = await listAppointments(start, end);
    return NextResponse.json({ appointments });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar citas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as CreateAppointmentInput;
    const appointment = await createAppointment(body);

    const notifyEvent = resolveNotifyEventForCreate(body.status);
    const notifications =
      notifyEvent !== null
        ? await notifyAboutAppointment(appointment, notifyEvent)
        : {
            client: { sent: false as const, reason: "Sin notificación." },
            artist: { sent: false as const, reason: "Sin notificación." },
          };

    return NextResponse.json(
      { appointment, whatsapp: notifications.client, artistWhatsapp: notifications.artist },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear la cita.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
