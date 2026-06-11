import { query } from "@/lib/db";
import { contentDefaults } from "@/lib/content-defaults";
import { mergeWithDefaults } from "@/lib/content-merge";
import type { ImagesConfig } from "@/types/content";
import type {
  ContentKey,
  EditableComponents,
  EditableContent,
  EditablePages,
  EditableSite,
} from "@/types/content-admin";

type ContentRow = { key: string; value: unknown };

export async function getEditableContent(): Promise<EditableContent> {
  const rows = await query<ContentRow>(
    "SELECT key, value FROM site_content ORDER BY key"
  );
  const map = new Map(rows.map((row) => [row.key, row.value]));

  return {
    site: mergeWithDefaults(
      contentDefaults.site,
      map.get("site")
    ) as EditableSite,
    images: mergeWithDefaults(
      contentDefaults.images,
      map.get("images")
    ) as ImagesConfig,
    portfolio_filters: mergeWithDefaults(
      contentDefaults.portfolioFilters,
      map.get("portfolio_filters")
    ) as string[],
    pages: mergeWithDefaults(
      contentDefaults.pages,
      map.get("pages")
    ) as EditablePages,
    components: mergeWithDefaults(
      contentDefaults.components,
      map.get("components")
    ) as EditableComponents,
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
