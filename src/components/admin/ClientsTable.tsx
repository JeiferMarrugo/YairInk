"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import type { ClientRecord, ClientStatus } from "@/types/scheduling";
import { clientStatusLabels } from "@/types/scheduling";

export type ClientTableRow = ClientRecord & {
  initials: string;
  lastSession: string;
  totalSpent: string;
};

const statusStyles: Record<ClientStatus, string> = {
  activo: "bg-beige text-black",
  inactivo: "bg-black/10 text-black/60",
  "en-sesion": "bg-black text-white",
};

type ClientsTableProps = {
  clients: ClientTableRow[];
  onSelect: (client: ClientTableRow) => void;
  selectedId: string;
};

export default function ClientsTable({
  clients,
  onSelect,
  selectedId,
}: ClientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<ClientTableRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "CLIENTE",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={avatarUrl(row.original.name)}
              fallback={row.original.initials}
              size="sm"
            />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-[10px] text-black/40">
                {row.original.email ?? "—"}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "lastSession",
        header: "ÚLTIMA SESIÓN",
        cell: ({ getValue }) => (
          <span className="text-xs text-black/60">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "totalSpent",
        header: "TOTAL",
        cell: ({ getValue }) => (
          <span className="font-serif">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "ESTADO",
        cell: ({ getValue }) => {
          const status = getValue() as ClientStatus;
          return (
            <span
              className={`px-2 py-0.5 text-[8px] tracking-[0.1em] ${statusStyles[status]}`}
            >
              {clientStatusLabels[status]}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            {row.original.phone && (
              <a
                href={`tel:${row.original.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-black/30 transition-colors hover:text-black"
              >
                ☎
              </a>
            )}
            {row.original.email && (
              <a
                href={`mailto:${row.original.email}`}
                onClick={(e) => e.stopPropagation()}
                className="text-black/30 transition-colors hover:text-black"
              >
                ✉
              </a>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (clients.length === 0) {
    return (
      <div className="border border-black/10 bg-white p-8 text-center text-sm text-black/50">
        Aún no hay clientes.{" "}
        <Link href="/admin/citas/nueva" className="underline hover:text-black">
          Crea una cita
        </Link>{" "}
        para registrar el primero.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Filtrar clientes..."
        className="w-full max-w-xs border border-black/10 bg-white px-4 py-2 text-xs outline-none focus:border-black/30"
      />

      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-black/10 text-[9px] tracking-[0.15em] text-black/40"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 font-normal"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onSelect(row.original)}
                className={`cursor-pointer border-b border-black/5 transition-colors hover:bg-off-white ${
                  selectedId === row.original.id ? "bg-beige/60" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
