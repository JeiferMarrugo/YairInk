import { SignJWT, jwtVerify } from "jose";
import { SESSION_IDLE_TIMEOUT } from "@/lib/auth-constants";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

const TOKEN_TTL = `${SESSION_IDLE_TIMEOUT}s`;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET es obligatorio en producción.");
    }
    return new TextEncoder().encode("yairink-dev-secret-cambiar-en-produccion");
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(
  user: Pick<AccessTokenPayload, "sub" | "email" | "name" | "role">
): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.sub) return null;

    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? ""),
    };
  } catch {
    return null;
  }
}
