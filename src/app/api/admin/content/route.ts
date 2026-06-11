import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getEditableContent, updateContentKey } from "@/lib/content-admin";
import { CONTENT_KEYS, type ContentKey } from "@/types/content-admin";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const content = await getEditableContent();
    return NextResponse.json(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar contenido.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const body = (await request.json()) as { key?: string; value?: unknown };

    if (!body.key || !CONTENT_KEYS.includes(body.key as ContentKey)) {
      return NextResponse.json(
        { error: "Clave de contenido no válida." },
        { status: 400 }
      );
    }

    if (body.value === undefined) {
      return NextResponse.json(
        { error: "Falta el valor a guardar." },
        { status: 400 }
      );
    }

    await updateContentKey(body.key as ContentKey, body.value);
    revalidatePath("/", "layout");

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al guardar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
