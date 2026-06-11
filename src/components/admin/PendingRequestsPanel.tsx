"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import ReschedulePendingModal from "@/components/admin/ReschedulePendingModal";
import {
  isPastAppointmentDay,
  notifyAppointmentsChanged,
} from "@/lib/appointment-datetime";
import { STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";
import type { ArtistRecord } from "@/types/artist";
import type { AppointmentRecord } from "@/types/scheduling";
import { appointmentTypeLabels } from "@/types/scheduling";

export default function PendingRequestsPanel() {
  const router = useRouter();
  const [pending, setPending] = useState<AppointmentRecord[]>([]);
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] =
    useState<AppointmentRecord | null>(null);

  const loadPending = useCallback(async () => {
    try {
      const [pendingRes, artistsRes] = await Promise.all([
        fetch("/api/admin/appointments?status=pending"),
        fetch("/api/admin/artists?active=1"),
      ]);
      const pendingData = await pendingRes.json();
      const artistsData = await artistsRes.json();
      if (pendingRes.ok) {
        setPending(pendingData.appointments as AppointmentRecord[]);
      }
      if (artistsRes.ok) {
        setArtists(artistsData.artists as ArtistRecord[]);
      }
    } catch {
      /* panel secundario — fallo silencioso */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  function afterAppointmentChange() {
    notifyAppointmentsChanged();
    router.refresh();
  }

  async function confirmAppointment(id: string, name: string) {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "No se pudo confirmar.");
        return;
      }
      toast.success(`Cita confirmada para ${name}`);
      if (result.whatsapp?.sent) {
        toast.message("WhatsApp enviado al cliente");
      } else if (
        result.whatsapp?.reason &&
        result.whatsapp.reason !== "Sin cambio de estado."
      ) {
        toast.message("WhatsApp no enviado", {
          description: result.whatsapp.reason,
        });
      }
      setPending((prev) => prev.filter((apt) => apt.id !== id));
      afterAppointmentChange();
    } catch {
      toast.error("Error de conexión.");
    }
  }

  async function cancelAppointment(id: string, name: string) {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "No se pudo cancelar.");
        return;
      }
      toast.message(`Cita cancelada`, { description: name });
      if (result.whatsapp?.sent) {
        toast.message("WhatsApp enviado al cliente");
      } else if (
        result.whatsapp?.reason &&
        result.whatsapp.reason !== "Sin cambio de estado."
      ) {
        toast.message("WhatsApp no enviado", {
          description: result.whatsapp.reason,
        });
      }
      setPending((prev) => prev.filter((apt) => apt.id !== id));
      afterAppointmentChange();
    } catch {
      toast.error("Error de conexión.");
    }
  }

  function handleRescheduled(updated: AppointmentRecord) {
    setPending((prev) =>
      prev.map((apt) => (apt.id === updated.id ? updated : apt))
    );
    afterAppointmentChange();
  }

  function formatWhen(startsAt: string) {
    const date = new Date(startsAt);
    return date.toLocaleString(STUDIO_LOCALE, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: STUDIO_TIMEZONE,
    });
  }

  return (
    <>
      <aside className="max-h-[42vh] w-full shrink-0 overflow-y-auto border-t border-black/10 bg-white p-4 sm:p-5 xl:max-h-none xl:w-80 xl:border-l xl:border-t-0">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg">Citas pendientes</h2>
            <span className="bg-black px-2 py-0.5 text-[9px] text-white">
              {String(pending.length).padStart(2, "0")}
            </span>
          </div>

          {loading && (
            <p className="text-xs text-black/40">Cargando...</p>
          )}

          {!loading && pending.length === 0 && (
            <p className="text-xs text-black/40">
              No hay citas pendientes de confirmar.
            </p>
          )}

          <div className="space-y-4">
            {pending.map((apt) => {
              const isPast = isPastAppointmentDay(apt.startsAt);

              return (
                <div
                  key={apt.id}
                  className={`border p-4 ${
                    isPast
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-black/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={avatarUrl(apt.clientName)}
                      fallback={apt.clientName.slice(0, 2).toUpperCase()}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{apt.clientName}</p>
                      <p className="text-[10px] text-black/50">
                        {appointmentTypeLabels[apt.eventType]}
                      </p>
                    </div>
                    {isPast && (
                      <span className="shrink-0 bg-amber-100 px-2 py-0.5 text-[8px] tracking-[0.08em] text-amber-900">
                        FECHA PASADA
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-[10px] tracking-[0.05em] ${
                      isPast ? "text-amber-900/70" : "text-black/45"
                    }`}
                  >
                    {formatWhen(apt.startsAt)}
                  </p>
                  {apt.concept && (
                    <p className="mt-2 text-xs italic text-black/60 line-clamp-2">
                      &ldquo;{apt.concept}&rdquo;
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => cancelAppointment(apt.id, apt.clientName)}
                      className="flex-1 border border-black/20 py-2 text-[9px] tracking-[0.1em] transition-colors hover:bg-off-white"
                    >
                      CANCELAR
                    </button>
                    {isPast ? (
                      <button
                        type="button"
                        onClick={() => setRescheduleTarget(apt)}
                        className="flex-1 bg-black py-2 text-[9px] tracking-[0.1em] text-white transition-colors hover:bg-black/80"
                      >
                        REAGENDAR
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          confirmAppointment(apt.id, apt.clientName)
                        }
                        className="flex-1 bg-black py-2 text-[9px] tracking-[0.1em] text-white transition-colors hover:bg-black/80"
                      >
                        CONFIRMAR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/admin/citas/nueva"
            className="mt-4 block w-full border border-black/10 py-2 text-center text-[9px] tracking-[0.1em] text-black/50 hover:bg-off-white"
          >
            + NUEVA CITA MANUAL
          </Link>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg">Artistas activos</h2>
          <ul className="space-y-3">
            {artists.length === 0 && (
              <li className="text-xs text-black/40">
                Registra artistas en{" "}
                <Link href="/admin/artistas" className="underline">
                  Artistas
                </Link>
                .
              </li>
            )}
            {artists.map((artist) => (
              <li
                key={artist.id}
                className="flex items-center justify-between border-b border-black/5 pb-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    src={artist.photoUrl ?? avatarUrl(artist.name)}
                    fallback={artist.name.slice(0, 2).toUpperCase()}
                    size="sm"
                  />
                  <span>{artist.name}</span>
                </div>
                <span className="text-[10px] tracking-[0.05em] text-black/50">
                  DISPONIBLE
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {rescheduleTarget && (
        <ReschedulePendingModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={handleRescheduled}
        />
      )}
    </>
  );
}
