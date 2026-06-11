import { IMAGE_PRESETS, type ImagePreset } from "@/lib/image-presets";

export type ProcessedImage = {
  file: File;
  width: number;
  height: number;
};

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

/**
 * Recorta al ratio del preset, redimensiona al máximo del preset sin ampliar
 * (evita borrosidad) y exporta WebP en el navegador.
 */
export async function processImageFileForPreset(
  file: File,
  preset: ImagePreset
): Promise<ProcessedImage> {
  const { width: maxW, height: maxH, quality } = IMAGE_PRESETS[preset];
  const targetAspect = maxW / maxH;
  const img = await loadImage(file);

  let srcX: number;
  let srcY: number;
  let srcW: number;
  let srcH: number;

  const imgAspect = img.naturalWidth / img.naturalHeight;

  if (imgAspect > targetAspect) {
    srcH = img.naturalHeight;
    srcW = srcH * targetAspect;
    srcX = (img.naturalWidth - srcW) / 2;
    srcY = 0;
  } else {
    srcW = img.naturalWidth;
    srcH = srcW / targetAspect;
    srcX = 0;
    srcY = (img.naturalHeight - srcH) / 2;
  }

  const downscale = Math.min(1, maxW / srcW, maxH / srcH);
  const outW = Math.max(1, Math.round(srcW * downscale));
  const outH = Math.max(1, Math.round(srcH * downscale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No se pudo procesar la imagen.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

  const blob = await canvasToWebpBlob(canvas, quality);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagen";

  return {
    file: new File([blob], `${baseName}.webp`, { type: "image/webp" }),
    width: outW,
    height: outH,
  };
}
