import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const { rows } = await pool.query<{ name: string }>(
    "SELECT name FROM schema_migrations ORDER BY id"
  );
  return new Set(rows.map((r) => r.name));
}

async function run() {
  console.log("Conectando a PostgreSQL...");
  await pool.query("SELECT 1");
  console.log("Conexión OK\n");

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const migrationsDir = join(__dirname, "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf-8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        file,
      ]);
      await client.query("COMMIT");
      console.log(`  apply ${file}`);
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  console.log(count ? `\n${count} migración(es) aplicada(s).` : "\nSin migraciones pendientes.");
  await pool.end();
}

run().catch((err) => {
  console.error("Error en migración:", err.message);
  process.exit(1);
});
