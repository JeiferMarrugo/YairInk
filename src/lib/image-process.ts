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

export async function processImageForPreset(
  input: Buffer,
  preset: ImagePreset
): Promise<ProcessedImage> {
  const { width, height } = IMAGE_PRESETS[preset];

  const buffer = await sharp(input)
    .rotate()
    .resize(width, height, {
      fit: "cover",
      position: "attention",
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    extension: "webp",
    width,
    height,
  };
}
