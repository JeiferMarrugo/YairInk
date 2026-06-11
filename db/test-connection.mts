import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("Falta DATABASE_URL en .env.local");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

try {
  const { rows } = await pool.query<{
    db: string;
    user: string;
    version: string;
  }>(`
    SELECT
      current_database() AS db,
      current_user AS "user",
      version() AS version
  `);

  const row = rows[0];
  console.log("Conexión exitosa");
  console.log(`  Base de datos: ${row.db}`);
  console.log(`  Usuario:       ${row.user}`);
  console.log(`  PostgreSQL:    ${row.version.split(",")[0]}`);

  const tables = await pool.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  if (tables.rows.length) {
    console.log("\nTablas:");
    for (const t of tables.rows) console.log(`  - ${t.table_name}`);
  } else {
    console.log("\nSin tablas aún. Ejecuta: npm run db:setup");
  }
} catch (err) {
  console.error("Error de conexión:", (err as Error).message);
  process.exit(1);
} finally {
  await pool.end();
}
