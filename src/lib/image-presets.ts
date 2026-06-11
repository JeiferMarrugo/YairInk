/** Ratios y tamaños de salida según el contexto visual del sitio. */
export type ImagePreset =
  | "login"
  | "portrait"
  | "square"
  | "wide"
  | "video"
  | "session"
  | "artist";

export type ImageAspectKey =
  | "login"
  | "portrait"
  | "square"
  | "wide"
  | "video";

export type ImagePresetConfig = {
  width: number;
  height: number;
  label: string;
  /** Calidad WebP 0–1 */
  quality: number;
};

export const IMAGE_PRESETS: Record<ImagePreset, ImagePresetConfig> = {
  /** Panel login — mitad de pantalla × alto completo (8:9) */
  login: { width: 1920, height: 2160, label: "Login 8:9", quality: 0.93 },
  /** Hero, inicio, servicios — 3:4 */
  portrait: { width: 1800, height: 2400, label: "Retrato 3:4", quality: 0.93 },
  /** Home minimal, hero servicios — 1:1 */
  square: { width: 1800, height: 1800, label: "Cuadrado 1:1", quality: 0.93 },
  /** Estudio, cita portafolio — 21:9 */
  wide: { width: 2400, height: 1029, label: "Panorámica 21:9", quality: 0.92 },
  /** Contenido genérico — 16:9 */
  video: { width: 1920, height: 1080, label: "Horizontal 16:9", quality: 0.92 },
  /** Fotos de sesión / portafolio — 4:5 */
  session: { width: 1800, height: 2250, label: "Portafolio 4:5", quality: 0.93 },
  /** Avatar artista — 1:1 compacto */
  artist: { width: 960, height: 960, label: "Avatar 1:1", quality: 0.92 },
};

const PRESET_SET = new Set<string>(Object.keys(IMAGE_PRESETS));

const ASPECT_TO_PRESET: Record<ImageAspectKey, ImagePreset> = {
  login: "login",
  portrait: "portrait",
  square: "square",
  wide: "wide",
  video: "video",
};

export function isImagePreset(value: string): value is ImagePreset {
  return PRESET_SET.has(value);
}

export function presetFromAspect(aspect: ImageAspectKey): ImagePreset {
  return ASPECT_TO_PRESET[aspect];
}

export function resolveImagePreset(
  preset: string | null | undefined,
  folder: "artists" | "sessions" | "content"
): ImagePreset {
  if (preset && isImagePreset(preset)) return preset;
  if (folder === "artists") return "artist";
  if (folder === "sessions") return "session";
  return "portrait";
}

export function formatPresetOutput(preset: ImagePreset): string {
  const { width, height, label, quality } = IMAGE_PRESETS[preset];
  return `${width}×${height} px · WebP ${Math.round(quality * 100)}% · ${label}`;
}

export function getPresetAspectRatio(preset: ImagePreset): number {
  const { width, height } = IMAGE_PRESETS[preset];
  return width / height;
}
