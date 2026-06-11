import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createBlock, listBlocks } from "@/lib/availability";
import type { CreateBlockInput } from "@/types/availability";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { error: "Parámetros start y end requeridos." },
      { status: 400 }
    );
  }

  try {
    const blocks = await listBlocks(start, end);
    return NextResponse.json({ blocks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar bloqueos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as CreateBlockInput;
    const block = await createBlock(body);
    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al bloquear.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
