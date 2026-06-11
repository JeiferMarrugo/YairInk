import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/auth-constants";
import { signAccessToken, verifyAccessToken } from "@/lib/jwt";

async function withRefreshedSession(
  response: NextResponse,
  session: NonNullable<Awaited<ReturnType<typeof verifyAccessToken>>>
) {
  const newToken = await signAccessToken({
    sub: session.sub,
    email: session.email,
    name: session.name,
    role: session.role,
  });
  response.cookies.set(SESSION_COOKIE, newToken, getSessionCookieOptions());
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyAccessToken(token) : null;
  const isLoggedIn = session !== null;
  const isLoginPage = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isLoginPage && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    loginUrl.searchParams.set("reason", "expired");
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && isLoggedIn) {
    return withRefreshedSession(
      NextResponse.redirect(new URL("/admin", request.url)),
      session!
    );
  }

  if (pathname.startsWith("/api/whatsapp") && !isLoggedIn) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (pathname.startsWith("/api/admin") && !isLoggedIn) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const shouldRefresh =
    isLoggedIn &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/whatsapp"));

  if (shouldRefresh) {
    return withRefreshedSession(NextResponse.next(), session!);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/whatsapp/:path*", "/api/admin/:path*"],
};
