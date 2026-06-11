import Link from "next/link";
import PasswordInput from "@/components/admin/PasswordInput";
import { loginAction } from "@/app/admin/login/actions";

type LoginFormProps = {
  error?: string;
  redirectTo?: string;
  defaultEmail?: string;
};

export default function LoginForm({
  error,
  redirectTo = "/admin",
  defaultEmail = "",
}: LoginFormProps) {
  return (
    <div className="relative z-30 flex w-full max-w-sm flex-col">
      <div className="mb-10">
        <h1 className="font-serif text-3xl tracking-wide">YAIRINK</h1>
        <p className="mt-1 text-[10px] tracking-[0.25em] text-black/50">
          ADMINISTRACIÓN
        </p>
      </div>

      {error && (
        <div className="mb-6 border border-black bg-black px-4 py-3 text-xs text-white">
          {error}
        </div>
      )}

      <form action={loginAction} method="post" className="space-y-6">
        <input type="hidden" name="from" value={redirectTo} />

        <div>
          <label
            htmlFor="email"
            className="text-[10px] font-medium tracking-[0.15em]"
          >
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={defaultEmail}
            placeholder="admin@yairink.com"
            className="mt-2 w-full border border-black/20 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-black"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[10px] font-medium tracking-[0.15em]"
            >
              CONTRASEÑA
            </label>
            <span className="text-[10px] text-black/40">
              ¿Olvidaste tu contraseña?
            </span>
          </div>
          <PasswordInput />
        </div>

        <button
          type="submit"
          className="w-full bg-black py-4 text-[10px] tracking-[0.2em] text-white transition-colors hover:bg-black/80"
        >
          INICIAR SESIÓN
        </button>
      </form>

      <div className="mt-10 border-t border-black/10 pt-8">
        <p className="text-center text-xs text-black/50">
          ¿Nuevo en YAIRINK?{" "}
          <Link
            href="/booking"
            className="font-medium text-black underline underline-offset-4"
          >
            SOLICITAR ACCESO
          </Link>
        </p>
        <p className="mt-8 flex items-center justify-center gap-2 text-[9px] tracking-[0.1em] text-black/30">
          <span>🛡</span> ENTORNO SEGURO DE ALTA PRECISIÓN
        </p>
      </div>
    </div>
  );
}
