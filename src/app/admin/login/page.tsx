import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { getPublicContent } from "@/lib/content";

export const metadata = {
  title: "YAIRINK — Iniciar Sesión",
  description: "Acceso al panel de administración de YAIRINK",
};

const REASON_MESSAGES: Record<string, string> = {
  idle: "Sesión cerrada por inactividad (30 minutos sin actividad).",
  expired: "Tu sesión ha expirado. Inicia sesión de nuevo.",
};

type PageProps = {
  searchParams: Promise<{
    error?: string;
    from?: string;
    email?: string;
    reason?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { images } = await getPublicContent();
  const loginImage =
    images.login || images.services.hero || "/images/portfolio/artist-at-work.jpg";
  const reasonError = params.reason
    ? REASON_MESSAGES[params.reason]
    : undefined;
  const error =
    reasonError ??
    (params.error ? decodeURIComponent(params.error) : undefined);
  const redirectTo =
    params.from && params.from.startsWith("/admin") ? params.from : "/admin";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden h-screen overflow-hidden bg-black lg:block">
        <Image
          src={loginImage}
          alt="Estudio YAIRINK"
          fill
          priority
          className="object-cover object-center grayscale"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 z-10 flex flex-col justify-end p-12">
          <blockquote className="max-w-md font-serif text-2xl italic leading-snug text-white">
            &ldquo;El arte de la precisión se encuentra en la quietud de la
            aguja.&rdquo;
          </blockquote>
          <div className="mt-6 h-px w-12 bg-white/40" />
        </div>
      </div>

      <div className="relative z-20 flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-12">
        <LoginForm error={error} redirectTo={redirectTo} />
      </div>
    </div>
  );
}
