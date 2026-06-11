import Image from "next/image";
import Link from "next/link";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { listAdminPortfolioItems } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const portfolioItems = await listAdminPortfolioItems();

  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar en portafolio..." />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <section className="mb-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl">Portafolio</h1>
              <p className="mt-1 text-[10px] tracking-[0.15em] text-black/40">
                PIEZAS REGISTRADAS EN LA BASE DE DATOS
              </p>
            </div>
            <Link
              href="/admin/configuracion"
              className="flex items-center gap-2 bg-black px-5 py-2.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
            >
              GESTIONAR CONTENIDO
            </Link>
          </div>

          {portfolioItems.length === 0 ? (
            <p className="text-sm text-black/50">
              Aún no hay piezas en el portafolio. Se crean al marcar sesiones
              como realizadas o desde el contenido del sitio.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {portfolioItems.map((item) => (
                <article
                  key={item.id}
                  className="border border-black/10 bg-white"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover grayscale"
                    />
                    <span
                      className={`absolute right-2 top-2 px-2 py-0.5 text-[8px] tracking-[0.1em] ${
                        item.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-black/10 text-black/60"
                      }`}
                    >
                      {item.isPublished ? "PUBLICADO" : "BORRADOR"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-sm">{item.title}</h3>
                    <p className="mt-1 text-[10px] text-black/45">{item.meta}</p>
                    <p className="mt-2 text-[9px] tracking-[0.05em] text-black/40">
                      SUBIDO {item.uploaded}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-black/10 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl">Inventario de Suministros</h2>
              <p className="mt-1 text-[10px] tracking-[0.15em] text-black/40">
                SEGUIMIENTO DE RECURSOS DE GRADO CLÍNICO
              </p>
            </div>
          </div>

          <p className="text-sm text-black/50">
            Gestiona el inventario completo desde la sección{" "}
            <Link
              href="/admin/inventario"
              className="underline underline-offset-4"
            >
              Inventario
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
