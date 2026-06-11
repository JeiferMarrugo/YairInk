export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AppointmentForm from "@/components/admin/AppointmentForm";
import { listArtists } from "@/lib/artists";

type PageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

export default async function NewAppointmentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const artists = await listArtists();

  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar..." />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-8">
          <Link
            href="/admin/calendario"
            className="text-[10px] tracking-[0.15em] text-black/40 hover:text-black"
          >
            ← VOLVER AL CALENDARIO
          </Link>
          <h1 className="mt-3 font-serif text-3xl">Nueva cita</h1>
          <p className="mt-1 text-sm text-black/50">
            Registra una cita manual con todos los datos del cliente y sus
            preferencias.
          </p>
        </div>

        <div className="max-w-3xl border border-black/10 bg-white p-6">
          <AppointmentForm
            artists={artists}
            initialStart={params.start}
            initialEnd={params.end}
          />
        </div>
      </main>
    </>
  );
}
