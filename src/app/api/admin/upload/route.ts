import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { saveUploadedImage, type UploadFolder } from "@/lib/uploads";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Selecciona una imagen válida." },
        { status: 400 }
      );
    }

    if (folder !== "artists" && folder !== "sessions") {
      return NextResponse.json(
        { error: "Carpeta de destino no válida." },
        { status: 400 }
      );
    }

    const url = await saveUploadedImage(file, folder as UploadFolder);
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
