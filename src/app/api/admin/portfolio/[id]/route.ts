import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updatePortfolioItemPublished } from "@/lib/admin-dashboard";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { isPublished?: boolean };

    if (typeof body.isPublished !== "boolean") {
      return NextResponse.json(
        { error: "Indica si la pieza debe mostrarse (isPublished)." },
        { status: 400 }
      );
    }

    const item = await updatePortfolioItemPublished(id, body.isPublished);
    if (!item) {
      return NextResponse.json(
        { error: "Pieza de portafolio no encontrada." },
        { status: 404 }
      );
    }

    revalidatePath("/portfolio");
    revalidatePath("/", "layout");

    return NextResponse.json({ item });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar la pieza.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
