import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db";
import {
  signAccessToken,
  verifyAccessToken,
  type AccessTokenPayload,
} from "@/lib/jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-constants";

export {
  SESSION_COOKIE,
  SESSION_IDLE_TIMEOUT,
  SESSION_MAX_AGE,
  getSessionCookieOptions,
} from "@/lib/auth-constants";

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
};

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL ?? "admin@yairink.com",
    password: process.env.ADMIN_PASSWORD ?? "yairink2024",
  };
}

export async function verifyAdminLogin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  if (!process.env.DATABASE_URL?.trim()) {
    const credentials = getAdminCredentials();
    if (
      email.toLowerCase() === credentials.email.toLowerCase() &&
      password === credentials.password
    ) {
      return {
        id: "env",
        email: credentials.email,
        password_hash: "",
        name: "Yair I.",
        role: "DIRECTOR CREATIVO",
      };
    }
    return null;
  }

  const user = await queryOne<AdminUser>(
    `SELECT id, email, password_hash, name, role
     FROM admin_users
     WHERE LOWER(email) = LOWER($1) AND is_active = TRUE`,
    [email.trim()]
  );

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  return valid ? user : null;
}

export async function createSessionToken(user: AdminUser): Promise<string> {
  return signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

function extractBearerToken(request?: Request): string | null {
  if (!request) return null;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function getSession(
  request?: Request
): Promise<AccessTokenPayload | null> {
  const bearer = extractBearerToken(request);
  if (bearer) return verifyAccessToken(bearer);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return verifyAccessToken(token);
}

export async function isAuthenticated(request?: Request): Promise<boolean> {
  const session = await getSession(request);
  return session !== null;
}

export async function requireAuth(
  request?: Request
): Promise<
  { user: AccessTokenPayload } | { error: NextResponse }
> {
  const user = await getSession(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "No autorizado." }, { status: 401 }),
    };
  }
  return { user };
}
