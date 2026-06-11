import { NextResponse } from "next/server";
import { submitSessionReview } from "@/lib/sessions";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;

  try {
    const body = (await request.json()) as {
      rating?: number;
      text?: string;
    };

    await submitSessionReview(token, {
      rating: Number(body.rating),
      text: String(body.text ?? ""),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar la reseña.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
