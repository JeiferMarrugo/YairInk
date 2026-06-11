type ApiErrorBody = { error?: string };

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
