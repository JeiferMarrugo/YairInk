import { NextResponse } from "next/server";
import { findAvailableSlots } from "@/lib/availability";
import { SLOT_DURATION_MINUTES } from "@/lib/availability-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month) {
    return NextResponse.json(
      { error: "Parámetro month requerido (YYYY-MM)." },
      { status: 400 }
    );
  }

  try {
    const slots = await findAvailableSlots(month);
    return NextResponse.json({
      slots,
      slotDurationMinutes: SLOT_DURATION_MINUTES,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al buscar disponibilidad.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
