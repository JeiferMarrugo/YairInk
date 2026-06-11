import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const email = process.env.ADMIN_EMAIL ?? "admin@yairink.com";
const password = process.env.ADMIN_PASSWORD ?? "yairink2024";

const { rows } = await pool.query<{ password_hash: string; name: string }>(
  "SELECT password_hash, name FROM admin_users WHERE LOWER(email) = LOWER($1)",
  [email]
);

if (!rows[0]) {
  console.error("Usuario admin no encontrado");
  process.exit(1);
}

const ok = await bcrypt.compare(password, rows[0].password_hash);
console.log(ok ? `Login OK — ${rows[0].name} (${email})` : "Login FALLIDO — contraseña incorrecta");
await pool.end();
process.exit(ok ? 0 : 1);
