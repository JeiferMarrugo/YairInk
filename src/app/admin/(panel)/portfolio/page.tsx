import Link from "next/link";
import AdminPortfolioClient from "@/components/admin/AdminPortfolioClient";
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
                CONTROL DE VISIBILIDAD EN LA WEB PÚBLICA
              </p>
            </div>
            <Link
              href="/admin/configuracion"
              className="flex items-center gap-2 bg-black px-5 py-2.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
            >
              GESTIONAR CONTENIDO
            </Link>
          </div>

          <AdminPortfolioClient initialItems={portfolioItems} />
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
