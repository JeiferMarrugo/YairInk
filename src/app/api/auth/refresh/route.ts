import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSession,
  getSessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const token = await createSessionToken({
    id: session.sub,
    email: session.email,
    password_hash: "",
    name: session.name,
    role: session.role,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());
  return response;
}
