import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listClients } from "@/lib/scheduling";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const clients = await listClients();
    return NextResponse.json({ clients });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar clientes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
