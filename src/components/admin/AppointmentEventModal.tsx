"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadAdminImage } from "@/lib/upload-client";
import type { AppointmentRecord, AppointmentStatus } from "@/types/scheduling";
import {
  appointmentStatusLabels,
  appointmentTypeLabels,
} from "@/types/scheduling";

type AppointmentEventModalProps = {
  appointment: AppointmentRecord;
  onClose: () => void;
  onUpdated: (appointment: AppointmentRecord) => void;
};

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: "bg-black text-white",
  pending: "bg-[#fff7ed] text-[#431407] border-2 border-dashed border-[#ea580c]",
  cancelled: "bg-black/10 text-black/50 line-through",
  completed: "bg-emerald-900 text-white",
};

const editableStatuses: AppointmentStatus[] = [
  "confirmed",
  "pending",
  "cancelled",
];

async function uploadSessionPhotos(files: FileList): Promise<string[]> {
  const urls: string[] = [];

  for (const file of Array.from(files)) {
    const { url } = await uploadAdminImage(file, "sessions", "session");
    urls.push(url);
  }

  return urls;
}

export default function AppointmentEventModal({
  appointment,
  onClose,
  onUpdated,
}: AppointmentEventModalProps) {
  const [loading, setLoading] = useState<AppointmentStatus | "complete" | null>(
    null
  );
  const [publishPortfolio, setPublishPortfolio] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function updateStatus(nextStatus: AppointmentStatus) {
    setLoading(nextStatus);
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "No se pudo actualizar.");
        return;
      }

      toast.success(`Cita ${appointmentStatusLabels[nextStatus].toLowerCase()}`);
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

      if (result.artistWhatsapp?.sent) {
        toast.message("WhatsApp enviado al artista");
      }

      onUpdated(result.appointment);
      onClose();
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoading(null);
    }
  }

  async function markCompleted() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      toast.error("Sube al menos una foto del tatuaje.");
      return;
    }

    setLoading("complete");
    try {
      const photoUrls = await uploadSessionPhotos(files);
      const response = await fetch(
        `/api/admin/appointments/${appointment.id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoUrls, publishPortfolio }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "No se pudo completar la cita.");
        return;
      }

      toast.success("Sesión marcada como realizada");
      if (result.whatsapp?.sent) {
        toast.message("Resumen enviado por WhatsApp al cliente");
      } else if (result.whatsapp?.reason) {
        toast.message("WhatsApp no enviado", {
          description: result.whatsapp.reason,
        });
      }

      if (result.shareUrl) {
        toast.message("Enlace del resumen", {
          description: result.shareUrl,
        });
      }

      onUpdated(result.appointment);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al completar la cita."
      );
    } finally {
      setLoading(null);
    }
  }

  const start = new Date(appointment.startsAt);
  const end = new Date(appointment.endsAt);
  const dateLabel = start.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = `${start.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const canComplete =
    appointment.status === "confirmed" || appointment.status === "pending";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-xl">{appointment.clientName}</p>
            <p className="mt-1 text-sm text-black/50">
              {appointmentTypeLabels[appointment.eventType]}
            </p>
          </div>
          <span
            className={`px-2 py-1 text-[8px] tracking-[0.1em] ${statusStyles[appointment.status]}`}
          >
            {appointmentStatusLabels[appointment.status]}
          </span>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-[9px] tracking-[0.12em] text-black/40">FECHA</dt>
            <dd className="capitalize">{dateLabel}</dd>
          </div>
          <div>
            <dt className="text-[9px] tracking-[0.12em] text-black/40">HORARIO</dt>
            <dd>{timeLabel}</dd>
          </div>
          {appointment.clientEmail && (
            <div>
              <dt className="text-[9px] tracking-[0.12em] text-black/40">EMAIL</dt>
              <dd>{appointment.clientEmail}</dd>
            </div>
          )}
          {appointment.clientPhoneDisplay && (
            <div>
              <dt className="text-[9px] tracking-[0.12em] text-black/40">TELÉFONO</dt>
              <dd>{appointment.clientPhoneDisplay}</dd>
            </div>
          )}
          {appointment.concept && (
            <div>
              <dt className="text-[9px] tracking-[0.12em] text-black/40">CONCEPTO</dt>
              <dd className="text-black/70">{appointment.concept}</dd>
            </div>
          )}
          {(appointment.style || appointment.placement || appointment.sizeEstimate) && (
            <div className="grid grid-cols-3 gap-2 border border-black/10 p-3 text-xs">
              {appointment.style && (
                <div>
                  <p className="text-[8px] text-black/40">ESTILO</p>
                  <p>{appointment.style}</p>
                </div>
              )}
              {appointment.placement && (
                <div>
                  <p className="text-[8px] text-black/40">ZONA</p>
                  <p>{appointment.placement}</p>
                </div>
              )}
              {appointment.sizeEstimate && (
                <div>
                  <p className="text-[8px] text-black/40">TAMAÑO</p>
                  <p>{appointment.sizeEstimate}</p>
                </div>
              )}
            </div>
          )}
          {appointment.notes && (
            <div>
              <dt className="text-[9px] tracking-[0.12em] text-black/40">NOTAS</dt>
              <dd className="text-black/60">{appointment.notes}</dd>
            </div>
          )}
        </dl>

        {appointment.status !== "completed" && (
          <div className="mt-6 space-y-2">
            <p className="text-[9px] tracking-[0.12em] text-black/40">
              CAMBIAR ESTADO
            </p>
            <div className="flex flex-wrap gap-2">
              {editableStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={appointment.status === s || loading !== null}
                  onClick={() => updateStatus(s)}
                  className={`px-4 py-2 text-[9px] tracking-[0.1em] transition-colors disabled:opacity-40 ${
                    appointment.status === s
                      ? "bg-black text-white"
                      : "border border-black/20 hover:bg-off-white"
                  }`}
                >
                  {loading === s ? "..." : appointmentStatusLabels[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        {canComplete && (
          <div className="mt-6 space-y-3 border border-black/10 bg-off-white p-4">
            <p className="text-[9px] tracking-[0.12em] text-black/40">
              SESIÓN REALIZADA
            </p>
            <p className="text-xs text-black/55">
              Sube fotos del tatuaje. Enviaremos al cliente un enlace con el
              resumen para que deje su reseña.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="block w-full text-xs text-black/60 file:mr-3 file:border-0 file:bg-black file:px-3 file:py-2 file:text-[9px] file:tracking-[0.1em] file:text-white"
            />
            <label className="flex items-center gap-2 text-xs text-black/60">
              <input
                type="checkbox"
                checked={publishPortfolio}
                onChange={(event) => setPublishPortfolio(event.target.checked)}
              />
              Publicar fotos en el portafolio
            </label>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => void markCompleted()}
              className="w-full bg-emerald-900 py-2.5 text-[9px] tracking-[0.12em] text-white hover:bg-emerald-950 disabled:opacity-50"
            >
              {loading === "complete"
                ? "PROCESANDO..."
                : "MARCAR REALIZADA Y ENVIAR RESUMEN"}
            </button>
          </div>
        )}

        {appointment.status === "completed" && appointment.shareToken && (
          <div className="mt-6 border border-black/10 bg-off-white p-4 text-xs text-black/60">
            <p className="text-[9px] tracking-[0.12em] text-black/40">
              ENLACE DEL CLIENTE
            </p>
            <a
              href={`/sesion/${appointment.shareToken}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-black underline"
            >
              /sesion/{appointment.shareToken}
            </a>
            {appointment.reviewSubmitted && (
              <p className="mt-2 text-black/50">El cliente ya dejó reseña.</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-black/10 py-2 text-[10px] tracking-[0.12em] text-black/50 hover:bg-off-white"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}
