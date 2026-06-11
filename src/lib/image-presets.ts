/** Ratios y tamaños de salida según el contexto visual del sitio. */
export type ImagePreset =
  | "login"
  | "portrait"
  | "square"
  | "wide"
  | "video"
  | "session"
  | "artist";

export type ImagePresetConfig = {
  width: number;
  height: number;
  label: string;
  /** Calidad WebP 0–1 */
  quality: number;
};

export const IMAGE_PRESETS: Record<ImagePreset, ImagePresetConfig> = {
  /** Panel login — mitad de pantalla × alto completo (8:9) */
  login: { width: 1920, height: 2160, label: "Login 8:9", quality: 0.92 },
  /** Hero, inicio, servicios — 3:4 */
  portrait: { width: 1600, height: 2133, label: "Retrato 3:4", quality: 0.9 },
  /** Home minimal, hero servicios — 1:1 */
  square: { width: 1600, height: 1600, label: "Cuadrado 1:1", quality: 0.9 },
  /** Estudio, cita portafolio — 21:9 */
  wide: { width: 2100, height: 900, label: "Panorámica 21:9", quality: 0.88 },
  /** Contenido genérico — 16:9 */
  video: { width: 1920, height: 1080, label: "Horizontal 16:9", quality: 0.88 },
  /** Fotos de sesión / portafolio — 4:5 */
  session: { width: 1600, height: 2000, label: "Portafolio 4:5", quality: 0.9 },
  /** Avatar artista — 1:1 compacto */
  artist: { width: 960, height: 960, label: "Avatar 1:1", quality: 0.88 },
};

const PRESET_SET = new Set<string>(Object.keys(IMAGE_PRESETS));

export function isImagePreset(value: string): value is ImagePreset {
  return PRESET_SET.has(value);
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
