"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE,
  verifyAdminLogin,
} from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  const safeRedirect =
    from.startsWith("/admin") && !from.startsWith("/admin/login")
      ? from
      : "/admin";

  if (!email || !password) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Introduce email y contraseña.")}&from=${encodeURIComponent(safeRedirect)}`
    );
  }

  let user;
  try {
    user = await verifyAdminLogin(email, password);
  } catch {
    redirect(
      `/admin/login?error=${encodeURIComponent("Error de conexión con la base de datos.")}&from=${encodeURIComponent(safeRedirect)}`
    );
  }

  if (!user) {
    redirect(
      `/admin/login?error=${encodeURIComponent("Credenciales incorrectas.")}&from=${encodeURIComponent(safeRedirect)}`
    );
  }

  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions());

  redirect(`${safeRedirect}?bienvenido=1`);
}
