import AdminArtistsClient from "@/components/admin/AdminArtistsClient";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { listArtists } from "@/lib/artists";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const artists = await listArtists();

  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar artistas..." />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="font-serif text-3xl">Artistas</h1>
          <p className="mt-1 text-sm text-black/50">
            Registra tatuadores con su WhatsApp para asignarlos en citas y enviar
            alertas automáticas.
          </p>
        </div>
        <AdminArtistsClient initialArtists={artists} />
      </main>
    </>
  );
}
