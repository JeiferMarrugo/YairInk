import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateArtist } from "@/lib/artists";
import type { UpdateArtistInput } from "@/types/artist";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as UpdateArtistInput;
    const artist = await updateArtist(id, body);
    if (!artist) {
      return NextResponse.json({ error: "Artista no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ artist });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar artista.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
