import sharp from "sharp";
import {
  IMAGE_PRESETS,
  type ImagePreset,
} from "@/lib/image-presets";

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
  width: number;
  height: number;
};

async function resizeCover(
  input: Buffer,
  width: number,
  height: number,
  position: "attention" | "centre"
): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export async function processImageForPreset(
  input: Buffer,
  preset: ImagePreset
): Promise<ProcessedImage> {
  const { width, height } = IMAGE_PRESETS[preset];

  let buffer: Buffer;
  try {
    buffer = await resizeCover(input, width, height, "attention");
  } catch {
    buffer = await resizeCover(input, width, height, "centre");
  }

  return {
    buffer,
    contentType: "image/webp",
    extension: "webp",
    width,
    height,
  };
}
