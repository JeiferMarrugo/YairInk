import { query } from "@/lib/db";
import type { ImagesConfig } from "@/types/content";
import type {
  ContentKey,
  EditableContent,
} from "@/types/content-admin";

type ContentRow = { key: string; value: unknown };

function normalizeImages(raw: ImagesConfig): ImagesConfig {
  const fallback =
    raw.services?.hero ?? "/images/portfolio/artist-at-work.jpg";
  return {
    ...raw,
    login: raw.login ?? fallback,
  };
}

export async function getEditableContent(): Promise<EditableContent> {
  const rows = await query<ContentRow>(
    "SELECT key, value FROM site_content ORDER BY key"
  );
  const map = new Map(rows.map((row) => [row.key, row.value]));

  if (!map.has("site")) {
    throw new Error(
      "Contenido del sitio no encontrado. Ejecuta: npm run db:seed-content"
    );
  }

  return {
    site: map.get("site") as EditableContent["site"],
    images: normalizeImages(map.get("images") as ImagesConfig),
    portfolio_filters: map.get("portfolio_filters") as string[],
    pages: map.get("pages") as EditableContent["pages"],
    components: map.get("components") as EditableContent["components"],
  };
}

export async function updateContentKey(
  key: ContentKey,
  value: unknown
): Promise<void> {
  await query(
    `INSERT INTO site_content (key, value)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, JSON.stringify(value)]
  );
}
