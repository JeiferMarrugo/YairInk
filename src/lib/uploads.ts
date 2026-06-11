import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadFolder = "artists" | "sessions" | "content";

function useBlobStorage(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim()
  );
}

function assertStorageConfigured(): void {
  if (process.env.VERCEL !== "1" || useBlobStorage()) return;
  throw new Error(
    "Blob Store no conectado al proyecto. En Vercel: Storage → yairinkuploads → Projects → Connect to Project → yairink."
  );
}

function buildFileName(file: File): string {
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
}

async function saveToLocalDisk(
  file: File,
  folder: UploadFolder,
  name: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${folder}/${name}`;
}

async function saveToVercelBlob(
  file: File,
  folder: UploadFolder,
  name: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const blob = await put(`yairink/${folder}/${name}`, buffer, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function saveUploadedImage(
  file: File,
  folder: UploadFolder
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WebP.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.");
  }

  const name = buildFileName(file);

  assertStorageConfigured();

  if (useBlobStorage()) {
    return saveToVercelBlob(file, folder, name);
  }

  return saveToLocalDisk(file, folder, name);
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
