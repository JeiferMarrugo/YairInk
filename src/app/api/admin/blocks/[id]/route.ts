import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteBlock } from "@/lib/availability";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteBlock(id);
    if (!deleted) {
      return NextResponse.json({ error: "Bloqueo no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar bloqueo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
