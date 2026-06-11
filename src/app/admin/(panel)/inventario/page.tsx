import AdminTopBar from "@/components/admin/AdminTopBar";

export const dynamic = "force-dynamic";

export default function AdminInventoryPage() {
  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar suministros..." />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Inventario de Suministros</h1>
            <p className="mt-1 text-[10px] tracking-[0.15em] text-black/40">
              SEGUIMIENTO DE RECURSOS DE GRADO CLÍNICO
            </p>
          </div>
        </div>

        <div className="border border-black/10 bg-white p-8 text-center">
          <p className="font-serif text-xl">Sin inventario registrado</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-black/50">
            Todavía no hay una tabla de suministros en la base de datos. Cuando
            la configures, los niveles de stock y alertas aparecerán aquí de
            forma automática.
          </p>
        </div>
      </main>
    </>
  );
}
