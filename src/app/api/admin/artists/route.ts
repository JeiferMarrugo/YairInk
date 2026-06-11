import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createArtist, listArtists } from "@/lib/artists";
import type { CreateArtistInput } from "@/types/artist";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") === "1";

  try {
    const artists = await listArtists(activeOnly);
    return NextResponse.json({ artists });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar artistas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as CreateArtistInput;
    const artist = await createArtist(body);
    return NextResponse.json({ artist }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear artista.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
