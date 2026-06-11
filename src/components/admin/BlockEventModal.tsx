"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { CalendarBlockRecord } from "@/types/availability";

type BlockEventModalProps = {
  block: CalendarBlockRecord;
  onClose: () => void;
  onDeleted: () => void;
};

export default function BlockEventModal({
  block,
  onClose,
  onDeleted,
}: BlockEventModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blocks/${block.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "No se pudo desbloquear.");
        return;
      }
      toast.success("Bloqueo eliminado");
      onDeleted();
      onClose();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  const start = new Date(block.startsAt);
  const end = new Date(block.endsAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif text-xl">Horario bloqueado</p>
        <p className="mt-2 text-sm text-black/60">
          {block.reason ?? "Sin motivo"}
        </p>
        <p className="mt-3 text-xs capitalize text-black/50">
          {start.toLocaleString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {!block.allDay &&
            ` – ${end.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </p>
        {block.allDay && (
          <p className="mt-1 text-[9px] tracking-[0.1em] text-black/40">
            DÍA COMPLETO
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleDelete()}
          className="mt-6 w-full bg-black py-3 text-[10px] tracking-[0.12em] text-white hover:bg-black/85 disabled:opacity-50"
        >
          {loading ? "..." : "DESBLOQUEAR"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 text-[10px] tracking-[0.12em] text-black/40"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}
