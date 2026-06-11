import pg from "pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: databaseUrl });

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yairink.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "yairink2024";

const clients = [
  {
    name: "Julian Thorne",
    email: "julian.t@email.com",
    status: "activo",
    total_spent_cents: 850000,
    last_session_at: "2025-10-12",
  },
  {
    name: "Sofia Nakamura",
    email: "sofia.n@email.com",
    status: "activo",
    total_spent_cents: 1200000,
    last_session_at: "2026-05-15",
  },
  {
    name: "David Kessler",
    email: "david.k@email.com",
    status: "en-sesion",
    total_spent_cents: 450000,
    last_session_at: "2026-05-10",
  },
  {
    name: "Isabella Rossini",
    email: "isabella.r@email.com",
    status: "activo",
    total_spent_cents: 320000,
    last_session_at: "2026-05-17",
  },
  {
    name: "Marcus Greene",
    email: "marcus.g@email.com",
    status: "activo",
    total_spent_cents: 980000,
    last_session_at: "2026-04-28",
  },
];

const studioArtists = [
  {
    name: "Yair I.",
    phone: "+57 300 123 4567",
    specialty: "Fine line · Blackwork",
  },
];

const appointments = [
  {
    client_name: "Sofia Nakamura",
    title: "Sofia Nakamura — Sesión completa",
    starts_at: "2026-06-09T10:00:00-05:00",
    ends_at: "2026-06-09T14:00:00-05:00",
    artist: "Yair I.",
    event_type: "sesion",
    status: "confirmed",
    client_email: "sofia.n@email.com",
    concept: "Manga floral en antebrazo",
    style: "Fine line",
    placement: "Antebrazo",
  },
  {
    client_name: "David Kessler",
    title: "David Kessler — Consulta",
    starts_at: "2026-06-10T16:00:00-05:00",
    ends_at: "2026-06-10T18:00:00-05:00",
    artist: "Yair I.",
    event_type: "consulta",
    status: "pending",
    client_email: "david.k@email.com",
    concept: "Blackwork geométrico espalda",
    style: "Blackwork",
    placement: "Espalda",
  },
  {
    client_name: "Isabella Rossini",
    title: "Isabella Rossini — Retoque",
    starts_at: "2026-06-11T09:00:00-05:00",
    ends_at: "2026-06-11T11:00:00-05:00",
    artist: "Yair I.",
    event_type: "retoque",
    status: "cancelled",
    client_email: "isabella.r@email.com",
    concept: "Retoque línea fina muñeca",
    style: "Fine line",
    placement: "Muñeca",
  },
];

const inquiries = [
  {
    name: "Amelia Clarke",
    email: "amelia@email.com",
    style: "Fine line floral · 3 h",
    message:
      "Busco algo delicado para el antebrazo interior, inspirado en botánica mediterránea.",
  },
  {
    name: "Thomas Wright",
    email: "thomas@email.com",
    style: "Blackwork geométrico · 5 h",
    message:
      "Quiero una pieza grande en la espalda con simetría y líneas arquitectónicas.",
  },
];

async function seedAdmin() {
  const hash = await bcrypt.hash(adminPassword, 12);
  const { rowCount } = await pool.query(
    `INSERT INTO admin_users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name,
       updated_at = NOW()`,
    [adminEmail.toLowerCase(), hash, "Yair I.", "DIRECTOR CREATIVO"]
  );
  console.log(
    rowCount ? `  admin: ${adminEmail} (creado/actualizado)` : `  admin: ${adminEmail}`
  );
}

async function seedClients() {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM clients"
  );
  if (Number(rows[0].count) > 0) {
    console.log("  clients: ya existen, omitido");
    return;
  }

  for (const c of clients) {
    await pool.query(
      `INSERT INTO clients (name, email, status, total_spent_cents, last_session_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [c.name, c.email, c.status, c.total_spent_cents, c.last_session_at]
    );
  }
  console.log(`  clients: ${clients.length} registros`);
}

async function seedArtists(): Promise<string | null> {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM artists"
  );
  if (Number(rows[0].count) > 0) {
    const existing = await pool.query<{ id: string }>(
      "SELECT id FROM artists ORDER BY created_at ASC LIMIT 1"
    );
    console.log("  artists: ya existen, omitido");
    return existing.rows[0]?.id ?? null;
  }

  let firstId: string | null = null;
  for (const artist of studioArtists) {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO artists (name, phone, specialty, is_active)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id`,
      [artist.name, artist.phone, artist.specialty]
    );
    firstId = firstId ?? rows[0]?.id ?? null;
  }
  console.log(`  artists: ${studioArtists.length} registros`);
  return firstId;
}

async function seedAppointments(artistId: string | null) {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM appointments"
  );
  if (Number(rows[0].count) > 0) {
    console.log("  appointments: ya existen, omitido");
    return;
  }

  for (const a of appointments) {
    await pool.query(
      `INSERT INTO appointments (
         client_name, title, starts_at, ends_at, artist_id, artist, event_type, status,
         client_email, concept, style, placement
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        a.client_name,
        a.title,
        a.starts_at,
        a.ends_at,
        artistId,
        a.artist,
        a.event_type,
        a.status,
        a.client_email,
        a.concept,
        a.style,
        a.placement,
      ]
    );
  }
  console.log(`  appointments: ${appointments.length} registros`);
}

async function seedInquiries() {
  const { rows } = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM booking_inquiries"
  );
  if (Number(rows[0].count) > 0) {
    console.log("  inquiries: ya existen, omitido");
    return;
  }

  for (const q of inquiries) {
    await pool.query(
      `INSERT INTO booking_inquiries (name, email, style, message)
       VALUES ($1, $2, $3, $4)`,
      [q.name, q.email, q.style, q.message]
    );
  }
  console.log(`  inquiries: ${inquiries.length} registros`);
}

async function run() {
  console.log("Sembrando datos...\n");
  await pool.query("SELECT 1");
  await seedAdmin();
  await seedClients();
  const artistId = await seedArtists();
  await seedAppointments(artistId);
  await seedInquiries();
  console.log("\nSeed completado.");
  await pool.end();
}

run().catch((err) => {
  console.error("Error en seed:", err.message);
  process.exit(1);
});
