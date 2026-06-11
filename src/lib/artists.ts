import { query, queryOne } from "@/lib/db";
import { validatePhone } from "@/lib/phone";
import type {
  ArtistRecord,
  CreateArtistInput,
  UpdateArtistInput,
} from "@/types/artist";

type ArtistRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  specialty: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
};

function mapArtist(row: ArtistRow): ArtistRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    phoneDisplay: row.phone,
    email: row.email,
    specialty: row.specialty,
    photoUrl: row.photo_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function listArtists(activeOnly = false): Promise<ArtistRecord[]> {
  const rows = await query<ArtistRow>(
    `SELECT id, name, phone, email, specialty, photo_url, is_active, created_at
     FROM artists
     ${activeOnly ? "WHERE is_active = TRUE" : ""}
     ORDER BY name ASC`
  );
  return rows.map(mapArtist);
}

export async function getArtist(id: string): Promise<ArtistRecord | null> {
  const row = await queryOne<ArtistRow>(
    `SELECT id, name, phone, email, specialty, photo_url, is_active, created_at
     FROM artists WHERE id = $1`,
    [id]
  );
  return row ? mapArtist(row) : null;
}

export async function getDefaultArtist(): Promise<ArtistRecord | null> {
  const row = await queryOne<ArtistRow>(
    `SELECT id, name, phone, email, specialty, photo_url, is_active, created_at
     FROM artists
     WHERE is_active = TRUE
     ORDER BY created_at ASC
     LIMIT 1`
  );
  return row ? mapArtist(row) : null;
}

export function validateArtistInput(body: Partial<CreateArtistInput>) {
  const errors: string[] = [];
  if (!body.name?.trim()) errors.push("El nombre del artista es obligatorio.");

  const phoneResult = validatePhone(String(body.phone ?? ""));
  if (!phoneResult.ok) errors.push(phoneResult.error);

  if (body.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("Introduce un email válido.");
  }

  return { errors, phoneResult };
}

export async function createArtist(body: CreateArtistInput): Promise<ArtistRecord> {
  const { errors, phoneResult } = validateArtistInput(body);
  if (errors.length > 0 || !phoneResult.ok) {
    throw new Error(
      errors[0] ?? (!phoneResult.ok ? phoneResult.error : "Datos inválidos.")
    );
  }

  const row = await queryOne<ArtistRow>(
    `INSERT INTO artists (name, phone, email, specialty, photo_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, phone, email, specialty, photo_url, is_active, created_at`,
    [
      body.name.trim(),
      phoneResult.display,
      body.email?.trim().toLowerCase() || null,
      body.specialty?.trim() || null,
      body.photoUrl?.trim() || null,
      body.isActive ?? true,
    ]
  );

  if (!row) throw new Error("No se pudo crear el artista.");
  return mapArtist(row);
}

export async function updateArtist(
  id: string,
  body: UpdateArtistInput
): Promise<ArtistRecord | null> {
  const current = await getArtist(id);
  if (!current) return null;

  let phone = current.phone;
  if (body.phone !== undefined) {
    const phoneResult = validatePhone(body.phone);
    if (!phoneResult.ok) throw new Error(phoneResult.error);
    phone = phoneResult.display;
  }

  const row = await queryOne<ArtistRow>(
    `UPDATE artists SET
       name = COALESCE($2, name),
       phone = COALESCE($3, phone),
       email = COALESCE($4, email),
       specialty = COALESCE($5, specialty),
       photo_url = COALESCE($6, photo_url),
       is_active = COALESCE($7, is_active)
     WHERE id = $1
     RETURNING id, name, phone, email, specialty, photo_url, is_active, created_at`,
    [
      id,
      body.name?.trim() ?? null,
      phone,
      body.email !== undefined ? body.email.trim().toLowerCase() || null : null,
      body.specialty !== undefined ? body.specialty.trim() || null : null,
      body.photoUrl !== undefined ? body.photoUrl?.trim() || null : null,
      body.isActive ?? null,
    ]
  );

  return row ? mapArtist(row) : null;
}
