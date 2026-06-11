import { processImageFileForPreset } from "@/lib/image-process-client";
import type { ImagePreset } from "@/lib/image-presets";

type ApiErrorBody = { error?: string };

export type UploadResult = {
  url: string;
  width: number;
  height: number;
};

export async function parseUploadApiResponse(
  response: Response
): Promise<{ url: string }> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    if (response.status === 401) {
      throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
    }
    if (response.status === 413) {
      throw new Error("La imagen es demasiado grande. Máximo 4 MB.");
    }
    throw new Error(
      `Error del servidor (${response.status}). Recarga la página e inténtalo de nuevo.`
    );
  }

  const result = (await response.json()) as ApiErrorBody & { url?: string };

  if (!response.ok) {
    throw new Error(result.error ?? "No se pudo subir la imagen.");
  }

  if (!result.url) {
    throw new Error("Respuesta inválida del servidor.");
  }

  return { url: result.url };
}

/** Límite alineado con Vercel Hobby (~4.5 MB de body). */
export const UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

export const UPLOAD_MAX_MB_LABEL = "4 MB";

export async function prepareUploadFile(
  file: File,
  preset: ImagePreset
) {
  try {
    return await processImageFileForPreset(file, preset);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "No se pudo optimizar la imagen."
    );
  }
}

export async function uploadAdminImage(
  file: File,
  folder: "artists" | "sessions" | "content",
  preset: ImagePreset
): Promise<UploadResult> {
  const prepared = await prepareUploadFile(file, preset);
  const form = new FormData();
  form.append("file", prepared.file);
  form.append("folder", folder);
  form.append("preset", preset);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const { url } = await parseUploadApiResponse(response);
  return { url, width: prepared.width, height: prepared.height };
}
