"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import AdminTopBar from "@/components/admin/AdminTopBar";
import ClientsTable from "@/components/admin/ClientsTable";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import { formatCurrency, formatSessionDate, getInitials } from "@/lib/display";
import type { ClientRecord } from "@/types/scheduling";

type AdminClientsClientProps = {
  initialClients: ClientRecord[];
};

export default function AdminClientsClient({
  initialClients,
}: AdminClientsClientProps) {
  const [clients] = useState(initialClients);
  const [selected, setSelected] = useState<ClientRecord | null>(
    initialClients[0] ?? null
  );

  const tableRows = useMemo(
    () =>
      clients.map((client) => ({
        ...client,
        initials: getInitials(client.name),
        lastSession: formatSessionDate(client.lastSessionAt),
        totalSpent: formatCurrency(client.totalSpentCents),
      })),
    [clients]
  );

  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar clientes..." />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h1 className="font-serif text-3xl">Clientes</h1>
            <Link
              href="/admin/citas/nueva"
              className="bg-black px-4 py-2 text-[10px] tracking-[0.12em] text-white hover:bg-black/85"
            >
              NUEVA CITA
            </Link>
          </div>
          <ClientsTable
            clients={tableRows}
            selectedId={selected?.id ?? ""}
            onSelect={(row) => {
              const client = clients.find((c) => c.id === row.id);
              if (client) setSelected(client);
            }}
          />
        </div>

        {selected && (
          <aside className="w-80 shrink-0 overflow-y-auto border-l border-black/10 bg-white p-5">
            <div className="mb-6 flex items-center gap-3">
              <Avatar
                src={avatarUrl(selected.name)}
                fallback={getInitials(selected.name)}
                size="lg"
              />
              <div>
                <h2 className="font-serif text-xl">{selected.name}</h2>
                <p className="text-[10px] text-black/40">{selected.email ?? "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-black/10 p-3">
                <p className="text-[8px] tracking-[0.1em] text-black/40">
                  ÚLTIMA SESIÓN
                </p>
                <p className="mt-1 text-sm">
                  {formatSessionDate(selected.lastSessionAt)}
                </p>
              </div>
              <div className="border border-black/10 p-3">
                <p className="text-[8px] tracking-[0.1em] text-black/40">
                  VALOR TOTAL
                </p>
                <p className="mt-1 font-serif text-sm">
                  {formatCurrency(selected.totalSpentCents)}
                </p>
              </div>
            </div>

            {(selected.phone || selected.style || selected.placement) && (
              <div className="mt-6 space-y-3 text-sm">
                {selected.phone && (
                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-black/40">
                      TELÉFONO
                    </p>
                    <p>{selected.phone}</p>
                  </div>
                )}
                {selected.style && (
                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-black/40">
                      ESTILO
                    </p>
                    <p>{selected.style}</p>
                  </div>
                )}
                {selected.placement && (
                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-black/40">
                      ZONA PREFERIDA
                    </p>
                    <p>{selected.placement}</p>
                  </div>
                )}
              </div>
            )}

            {selected.notes && (
              <div className="mt-6">
                <p className="text-[9px] tracking-[0.15em] text-black/40">NOTAS</p>
                <p className="mt-2 text-xs leading-relaxed text-black/60">
                  {selected.notes}
                </p>
              </div>
            )}

            <div className="mt-8 flex gap-2">
              <Link
                href="/admin/citas/nueva"
                className="flex-1 bg-black py-3 text-center text-[9px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
              >
                RESERVAR SESIÓN
              </Link>
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="border border-black/20 px-4 py-3 text-black/50 transition-colors hover:border-black"
                  onClick={() =>
                    toast.message("Abriendo cliente de email", {
                      description: selected.email ?? undefined,
                    })
                  }
                >
                  ✉
                </a>
              )}
            </div>
          </aside>
        )}
      </main>
    </>
  );
}
