"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  formatPresetOutput,
  getPresetAspectRatio,
  IMAGE_PRESETS,
  type ImagePreset,
} from "@/lib/image-presets";
import {
  uploadAdminImage,
  UPLOAD_MAX_BYTES,
  UPLOAD_MAX_MB_LABEL,
} from "@/lib/upload-client";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  preset: ImagePreset;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  preset,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const uploadPreset = preset;
  const presetConfig = IMAGE_PRESETS[uploadPreset];
  const outputHint = formatPresetOutput(uploadPreset);

  const previewSrc = localPreview || value;

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });

      setUploading(true);
      try {
        const { url, width, height } = await uploadAdminImage(
          file,
          "content",
          uploadPreset
        );
        onChange(url);
        toast.success(`Imagen lista: ${width}×${height} px (WebP)`);
        setLocalPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al subir la imagen."
        );
        setLocalPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } finally {
        setUploading(false);
      }
    },
    [onChange, uploadPreset]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: UPLOAD_MAX_BYTES,
    multiple: false,
    disabled: uploading,
    noClick: true,
    noKeyboard: true,
  });

  const dropLabel = useMemo(() => {
    if (uploading) return "Subiendo…";
    if (isDragActive) return "Suelta la imagen aquí";
    return "Arrastra una imagen o elige un archivo";
  }, [uploading, isDragActive]);

  return (
    <div className="flex flex-col border border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-3">
        <p className="text-[10px] tracking-[0.12em] text-black/50">{label}</p>
        <p className="mt-1 text-[9px] tracking-[0.06em] text-black/35">
          {outputHint}
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`group relative overflow-hidden bg-off-white ${
          isDragActive ? "ring-2 ring-inset ring-black/20" : ""
        }`}
        style={{ aspectRatio: getPresetAspectRatio(uploadPreset) }}
      >
        <input {...getInputProps()} />

        {previewSrc ? (
          <Image
            src={previewSrc}
            alt={label}
            fill
            unoptimized={
              previewSrc.startsWith("blob:") || previewSrc.startsWith("http")
            }
            className="object-cover object-center grayscale transition duration-300 group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center p-6 text-center text-xs text-black/35">
            Sin imagen — sube JPG, PNG o WebP en alta resolución
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] tracking-[0.15em]">
            OPTIMIZANDO…
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-[9px] tracking-[0.1em] text-white/90">{dropLabel}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <button
          type="button"
          onClick={open}
          disabled={uploading}
          className="w-full border border-black/15 bg-off-white py-2.5 text-[10px] tracking-[0.12em] transition-colors hover:border-black/30 hover:bg-white disabled:opacity-50"
        >
          {uploading ? "OPTIMIZANDO…" : "ELEGIR ARCHIVO"}
        </button>

        <label className="block">
          <span className="text-[9px] tracking-[0.1em] text-black/40">
            RUTA (editable)
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full border border-black/10 bg-white px-3 py-2 text-xs outline-none focus:border-black/30"
            placeholder="/uploads/content/... o URL de Vercel Blob"
          />
        </label>

        {hint && <p className="text-[10px] text-black/40">{hint}</p>}
        <p className="text-[10px] text-black/35">
          Al subir, se recorta al ratio del sitio, se ajusta hasta{" "}
          {presetConfig.width}×{presetConfig.height} px sin ampliar la original, y
          se guarda en WebP (máx. {UPLOAD_MAX_MB_LABEL}).
        </p>
      </div>
    </div>
  );
}
