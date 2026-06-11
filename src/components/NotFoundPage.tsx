import Link from "next/link";

const links = [
  { href: "/", label: "INICIO" },
  { href: "/portfolio", label: "PORTAFOLIO" },
  { href: "/services", label: "SERVICIOS" },
  { href: "/reviews", label: "RESEÑAS" },
];

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-off-white text-black">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-12">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-wide lg:text-xl"
          >
            YAIRINK
          </Link>
          <Link
            href="/booking"
            className="bg-black px-5 py-2.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
          >
            RESERVAR
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 py-20 lg:px-12">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="grid gap-16 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-7">
              <p className="text-[10px] tracking-[0.35em] text-black/40">
                ERROR 404
              </p>
              <h1 className="mt-6 font-serif text-[clamp(5rem,18vw,12rem)] leading-[0.85] tracking-tight">
                404
              </h1>
            </div>

            <div className="lg:col-span-5 lg:pb-4">
              <h2 className="font-serif text-3xl leading-tight md:text-4xl">
                Perdido en el lienzo.
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-black/60">
                La página que buscas no existe o fue movida. Como un trazo que no
                encontró su lugar, este camino termina aquí.
              </p>
              <blockquote className="mt-10 border-l border-black/15 pl-5 font-serif text-lg italic text-black/70">
                &ldquo;No todo lo que se busca está destinado a permanecer.&rdquo;
              </blockquote>
            </div>
          </div>

          <div className="mt-20 border-t border-black/10 pt-10">
            <p className="text-[10px] tracking-[0.25em] text-black/40">
              EXPLORAR
            </p>
            <nav className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] tracking-[0.2em] underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-black px-8 py-3.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
              >
                VOLVER AL INICIO
              </Link>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center border border-black px-8 py-3.5 text-[10px] tracking-[0.15em] transition-colors hover:bg-black hover:text-white"
              >
                CONSULTAR AHORA
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-black/5 px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 text-[10px] tracking-[0.15em] text-black/40 sm:flex-row">
          <span>YAIRINK</span>
          <span>Estudio de tatuaje · Fine line &amp; blackwork</span>
        </div>
      </footer>
    </div>
  );
}
