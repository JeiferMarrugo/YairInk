import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE,
  verifyAdminLogin,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Introduce email y contraseña." },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await verifyAdminLogin(email, password);
    } catch {
      return NextResponse.json(
        { error: "Error de conexión con la base de datos." },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());

    return response;
  } catch {
    return NextResponse.json(
      { error: "Error al iniciar sesión." },
      { status: 500 }
    );
  }
}
