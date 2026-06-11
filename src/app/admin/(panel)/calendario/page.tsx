"use client";

import dynamic from "next/dynamic";
import AdminTopBar from "@/components/admin/AdminTopBar";
import PendingRequestsPanel from "@/components/admin/PendingRequestsPanel";

const AdminCalendar = dynamic(
  () => import("@/components/admin/AdminCalendar"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center border border-black/10 bg-white text-sm text-black/40">
        Cargando calendario...
      </div>
    ),
  }
);

export default function AdminCalendarPage() {
  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar sesiones..." />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl">Calendario</h1>
            <p className="mt-1 text-sm text-black/50">
              Selecciona un rango para crear cita o bloquear · Arrastra citas
              para reprogramar
            </p>
          </div>
          <AdminCalendar />
        </div>
        <PendingRequestsPanel />
      </main>
    </>
  );
}
