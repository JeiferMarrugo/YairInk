"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  appointmentDurationMs,
  defaultRescheduleFields,
  studioLocalToIso,
} from "@/lib/appointment-datetime";
import type { AppointmentRecord } from "@/types/scheduling";
import { appointmentTypeLabels } from "@/types/scheduling";

type ReschedulePendingModalProps = {
  appointment: AppointmentRecord;
  onClose: () => void;
  onRescheduled: (appointment: AppointmentRecord) => void;
};

export default function ReschedulePendingModal({
  appointment,
  onClose,
  onRescheduled,
}: ReschedulePendingModalProps) {
  const defaults = useMemo(
    () => defaultRescheduleFields(appointment.startsAt),
    [appointment.startsAt]
  );
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const startsAt = studioLocalToIso(date, time);
      const startMs = new Date(startsAt).getTime();
      if (Number.isNaN(startMs)) {
        toast.error("Fecha u hora no válida.");
        return;
      }
      if (startMs <= Date.now()) {
        toast.error("Elige una fecha y hora futuras.");
        return;
      }

      const duration = appointmentDurationMs(
        appointment.startsAt,
        appointment.endsAt
      );
      const endsAt = new Date(startMs + duration).toISOString();

      const response = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startsAt, endsAt }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "No se pudo reagendar.");
        return;
      }

      toast.success("Cita reagendada");
      onRescheduled(result.appointment as AppointmentRecord);
      onClose();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-serif text-xl">Reagendar cita</p>
        <p className="mt-1 text-sm text-black/50">
          {appointment.clientName} ·{" "}
          {appointmentTypeLabels[appointment.eventType]}
        </p>
        <p className="mt-2 text-[10px] tracking-[0.08em] text-amber-800">
          La fecha original ya pasó. Elige un nuevo día y hora.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[9px] tracking-[0.12em] text-black/40">
              NUEVA FECHA
            </span>
            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-black/30"
            />
          </label>
          <label className="block">
            <span className="text-[9px] tracking-[0.12em] text-black/40">
              NUEVA HORA
            </span>
            <input
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1 w-full border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-black/30"
            />
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-black/15 py-2.5 text-[9px] tracking-[0.1em] hover:bg-off-white disabled:opacity-50"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black py-2.5 text-[9px] tracking-[0.1em] text-white hover:bg-black/80 disabled:opacity-50"
            >
              {loading ? "GUARDANDO…" : "REAGENDAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
