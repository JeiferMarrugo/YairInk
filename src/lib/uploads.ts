import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { processImageForPreset } from "@/lib/image-process";
import {
  resolveImagePreset,
  type ImagePreset,
} from "@/lib/image-presets";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
/** Límite de entrada antes de optimizar (la salida WebP será mucho menor). */
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export type UploadFolder = "artists" | "sessions" | "content";

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function useBlobStorage(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim() ||
      isVercelRuntime()
  );
}

function buildFileName(extension: string): string {
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
}

async function saveBufferToLocalDisk(
  buffer: Buffer,
  folder: UploadFolder,
  name: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${folder}/${name}`;
}

async function saveBufferToVercelBlob(
  buffer: Buffer,
  folder: UploadFolder,
  name: string,
  contentType: string
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  const blob = await put(`yairink/${folder}/${name}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    ...(token ? { token } : {}),
  });

  return blob.url;
}

export async function saveUploadedImage(
  file: File,
  folder: UploadFolder,
  preset?: ImagePreset
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WebP.");
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("La imagen no puede superar 15 MB.");
  }

  const resolvedPreset = resolveImagePreset(preset, folder);
  const input = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processImageForPreset(input, resolvedPreset);
  } catch {
    throw new Error(
      "No se pudo procesar la imagen. Prueba con otro archivo JPG, PNG o WebP."
    );
  }

  const name = buildFileName(processed.extension);

  if (useBlobStorage()) {
    try {
      return await saveBufferToVercelBlob(
        processed.buffer,
        folder,
        name,
        processed.contentType
      );
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "Error desconocido.";
      throw new Error(
        `No se pudo subir la imagen. ${detail} Verifica que yairinkuploads esté conectado a yairink y redeploy.`
      );
    }
  }

  return saveBufferToLocalDisk(processed.buffer, folder, name);
}

export function getAppUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.REMINDER_APP_URL?.trim() ||
    process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function isBlobStorageEnabled(): boolean {
  return useBlobStorage();
}
