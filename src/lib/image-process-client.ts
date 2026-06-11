import { IMAGE_PRESETS, type ImagePreset } from "@/lib/image-presets";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("No se pudo exportar la imagen optimizada.")),
      "image/webp",
      quality
    );
  });
}

/** Recorta, redimensiona y exporta WebP en el navegador (sin Sharp en el servidor). */
export async function processImageFileForPreset(
  file: File,
  preset: ImagePreset
): Promise<File> {
  const { width, height, quality } = IMAGE_PRESETS[preset];
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const srcW = width / scale;
  const srcH = height / scale;
  const srcX = (img.naturalWidth - srcW) / 2;
  const srcY = (img.naturalHeight - srcH) / 2;

  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, width, height);

  const blob = await canvasToWebpBlob(canvas, quality);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";

  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}
