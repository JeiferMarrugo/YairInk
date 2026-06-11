/** Ratios y tamaños de salida según el contexto visual del sitio. */
export type ImagePreset =
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
};

export const IMAGE_PRESETS: Record<ImagePreset, ImagePresetConfig> = {
  /** Login, hero, inicio, servicios — 3:4 */
  portrait: { width: 1200, height: 1600, label: "Retrato 3:4" },
  /** Home minimal, hero servicios — 1:1 */
  square: { width: 1200, height: 1200, label: "Cuadrado 1:1" },
  /** Estudio, cita portafolio — 21:9 */
  wide: { width: 2100, height: 900, label: "Panorámica 21:9" },
  /** Contenido genérico — 16:9 */
  video: { width: 1920, height: 1080, label: "Horizontal 16:9" },
  /** Fotos de sesión / portafolio — 4:5 */
  session: { width: 1200, height: 1500, label: "Portafolio 4:5" },
  /** Avatar artista — 1:1 compacto */
  artist: { width: 800, height: 800, label: "Avatar 1:1" },
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
