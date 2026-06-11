import pg from "pg";
import { contentDefaults } from "./content-defaults.ts";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

async function upsertContent(key: string, value: unknown) {
  await pool.query(
    `INSERT INTO site_content (key, value)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, JSON.stringify(value)]
  );
  console.log(`  content: ${key}`);
}

async function seedPortfolio() {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM portfolio_items"
  );
  if (Number(rows[0].count) > 0) {
    console.log("  portfolio_items: ya existen, omitido");
    return;
  }

  for (const item of contentDefaults.portfolioItems) {
    const images =
      "images" in item && item.images.length > 0
        ? item.images
        : [{ src: item.src, alt: item.alt }];

    await pool.query(
      `INSERT INTO portfolio_items (title, meta, category, src, alt, images, layout_size, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)`,
      [
        item.title,
        item.meta,
        item.category,
        item.src,
        item.alt,
        JSON.stringify(images),
        item.layout_size,
        item.sort_order,
      ]
    );
  }
  console.log(`  portfolio_items: ${contentDefaults.portfolioItems.length} registros`);
}

async function seedReviews() {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM reviews"
  );
  if (Number(rows[0].count) > 0) {
    console.log("  reviews: ya existen, omitido");
    return;
  }

  for (const review of contentDefaults.reviews) {
    await pool.query(
      `INSERT INTO reviews (name, piece, rating, review_date, text, image, image_alt, client_phone, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        review.name,
        review.piece,
        review.rating,
        review.review_date,
        review.text,
        review.image,
        review.image_alt,
        review.client_phone,
        review.sort_order,
      ]
    );
  }
  console.log(`  reviews: ${contentDefaults.reviews.length} registros`);
}

async function run() {
  console.log("Sembrando contenido público...\n");

  await upsertContent("site", contentDefaults.site);
  await upsertContent("images", contentDefaults.images);
  await upsertContent("portfolio_filters", contentDefaults.portfolioFilters);
  await upsertContent("pages", contentDefaults.pages);
  await upsertContent("components", contentDefaults.components);

  await seedPortfolio();
  await seedReviews();

  console.log("\nContenido público listo.");
  await pool.end();
}

run().catch((err) => {
  console.error("Error en seed-content:", err.message);
  process.exit(1);
});
