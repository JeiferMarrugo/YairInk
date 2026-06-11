"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CalendarSelectModalProps = {
  start: string;
  end: string;
  onClose: () => void;
  onBlocked: () => void;
};

export default function CalendarSelectModal({
  start,
  end,
  onClose,
  onBlocked,
}: CalendarSelectModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBlock(allDay: boolean) {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: start,
          endsAt: end,
          reason: reason.trim() || (allDay ? "Día bloqueado" : "Horario bloqueado"),
          allDay,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "No se pudo bloquear.");
        return;
      }
      toast.success(allDay ? "Día bloqueado" : "Horario bloqueado");
      onBlocked();
      onClose();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  function handleCreateAppointment() {
    const params = new URLSearchParams({ start, end });
    router.push(`/admin/citas/nueva?${params.toString()}`);
    onClose();
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const label = `${startDate.toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })} – ${endDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-serif text-xl">Selección del calendario</p>
        <p className="mt-2 text-sm capitalize text-black/60">{label}</p>

        <div className="mt-4">
          <label
            htmlFor="blockReason"
            className="text-[9px] tracking-[0.12em] text-black/40"
          >
            MOTIVO (OPCIONAL)
          </label>
          <input
            id="blockReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Vacaciones, evento, etc."
            className="mt-2 w-full border border-black/10 px-3 py-2 text-sm outline-none focus:border-black/30"
          />
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleBlock(false)}
            className="w-full border border-black/20 py-3 text-[10px] tracking-[0.12em] hover:bg-off-white disabled:opacity-50"
          >
            BLOQUEAR ESTE HORARIO
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleBlock(true)}
            className="w-full border border-black/20 py-3 text-[10px] tracking-[0.12em] hover:bg-off-white disabled:opacity-50"
          >
            BLOQUEAR DÍA COMPLETO
          </button>
          <button
            type="button"
            onClick={handleCreateAppointment}
            className="w-full bg-black py-3 text-[10px] tracking-[0.12em] text-white hover:bg-black/85"
          >
            CREAR CITA
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-[10px] tracking-[0.12em] text-black/40"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
