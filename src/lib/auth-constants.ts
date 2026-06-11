/** Tiempo máximo de inactividad antes de cerrar sesión (30 minutos). */
export const SESSION_IDLE_TIMEOUT = 30 * 60;

export const SESSION_COOKIE = "yairink-admin-session";

/** Cookie y JWT usan el mismo TTL de inactividad. */
export const SESSION_MAX_AGE = SESSION_IDLE_TIMEOUT;

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
