import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { isImagePreset } from "@/lib/image-presets";
import { saveUploadedImage, type UploadFolder } from "@/lib/uploads";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "");
    const presetRaw = String(form.get("preset") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Selecciona una imagen válida." },
        { status: 400 }
      );
    }

    if (folder !== "artists" && folder !== "sessions" && folder !== "content") {
      return NextResponse.json(
        { error: "Carpeta de destino no válida." },
        { status: 400 }
      );
    }

    if (presetRaw && !isImagePreset(presetRaw)) {
      return NextResponse.json(
        { error: "Formato de imagen (preset) no válido." },
        { status: 400 }
      );
    }

    const url = await saveUploadedImage(
      file,
      folder as UploadFolder,
      presetRaw && isImagePreset(presetRaw) ? presetRaw : undefined
    );
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
