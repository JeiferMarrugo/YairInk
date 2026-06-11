"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validatePhoneFromForm } from "@/lib/phone-client";
import PhoneField from "@/components/PhoneField";
import type { ArtistRecord } from "@/types/artist";
import type {
  AppointmentStatus,
  AppointmentType,
  CreateAppointmentInput,
} from "@/types/scheduling";
import {
  appointmentStatusLabels,
  appointmentTypeLabels,
} from "@/types/scheduling";

type AppointmentFormProps = {
  artists: ArtistRecord[];
  initialStart?: string;
  initialEnd?: string;
};

function toLocalInputValue(iso?: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function AppointmentForm({
  artists,
  initialStart,
  initialEnd,
}: AppointmentFormProps) {
  const router = useRouter();
  const startDefaults = useMemo(
    () => toLocalInputValue(initialStart),
    [initialStart]
  );
  const endDefaults = useMemo(() => toLocalInputValue(initialEnd), [initialEnd]);

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrors([]);

    const form = new FormData(event.currentTarget);
    const phoneResult = validatePhoneFromForm(form, "clientPhone");

    if (!phoneResult.ok) {
      setErrors([phoneResult.error]);
      setStatus("error");
      return;
    }

    const date = String(form.get("date") ?? "");
    const startTime = String(form.get("startTime") ?? "");
    const endTime = String(form.get("endTime") ?? "");

    const payload: CreateAppointmentInput = {
      clientName: String(form.get("clientName") ?? ""),
      clientEmail: String(form.get("clientEmail") ?? ""),
      clientPhone: phoneResult.display,
      eventType: String(form.get("eventType") ?? "consulta") as AppointmentType,
      status: String(form.get("appointmentStatus") ?? "pending") as AppointmentStatus,
      startsAt: combineDateTime(date, startTime),
      endsAt: combineDateTime(date, endTime),
      artistId: String(form.get("artistId") ?? ""),
      concept: String(form.get("concept") ?? ""),
      placement: String(form.get("placement") ?? ""),
      sizeEstimate: String(form.get("sizeEstimate") ?? ""),
      style: String(form.get("style") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    try {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors([result.error ?? "No se pudo crear la cita."]);
        setStatus("error");
        return;
      }

      if (result.whatsapp?.sent) {
        toast.message("WhatsApp enviado al cliente");
      } else if (
        result.whatsapp?.reason &&
        result.whatsapp.reason !== "Sin notificación."
      ) {
        toast.message("Cita creada", {
          description: `WhatsApp al cliente: ${result.whatsapp.reason}`,
        });
      }

      if (result.artistWhatsapp?.sent) {
        toast.message("WhatsApp enviado al artista");
      } else if (
        result.artistWhatsapp?.reason &&
        !["Sin notificación.", "No aplica para este evento."].includes(
          result.artistWhatsapp.reason
        )
      ) {
        toast.message("Aviso al artista pendiente", {
          description: result.artistWhatsapp.reason,
        });
      }

      router.push("/admin/calendario");
      router.refresh();
    } catch {
      setErrors(["Error de conexión. Inténtalo de nuevo."]);
      setStatus("error");
    }
  }

  const activeArtists = artists.filter((artist) => artist.isActive);
  const inputClass =
    "w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30";
  const labelClass = "mb-1 block text-[9px] tracking-[0.15em] text-black/50";

  return (
    <>
      {activeArtists.length === 0 && (
        <div className="mb-6 border border-black/20 bg-off-white px-4 py-3 text-sm text-black/60">
          Registra al menos un artista activo en{" "}
          <a href="/admin/artistas" className="underline">
            Artistas
          </a>{" "}
          antes de crear citas.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="border border-black bg-black px-6 py-4 text-sm text-white">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-serif text-xl">Datos del cliente</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="clientName" className={labelClass}>
              NOMBRE COMPLETO
            </label>
            <input
              id="clientName"
              name="clientName"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="clientEmail" className={labelClass}>
              EMAIL
            </label>
            <input
              id="clientEmail"
              name="clientEmail"
              type="email"
              required
              className={inputClass}
            />
          </div>
          <PhoneField
            prefix="clientPhone"
            label="TELÉFONO / WHATSAPP"
            hint="Selecciona el país e ingresa el número del cliente."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl">Preferencias del proyecto</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="concept" className={labelClass}>
              CONCEPTO / DESCRIPCIÓN
            </label>
            <textarea
              id="concept"
              name="concept"
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="style" className={labelClass}>
              ESTILO
            </label>
            <input id="style" name="style" className={inputClass} />
          </div>
          <div>
            <label htmlFor="placement" className={labelClass}>
              ZONA / UBICACIÓN
            </label>
            <input id="placement" name="placement" className={inputClass} />
          </div>
          <div>
            <label htmlFor="sizeEstimate" className={labelClass}>
              TAMAÑO ESTIMADO
            </label>
            <input id="sizeEstimate" name="sizeEstimate" className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl">Cita</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="eventType" className={labelClass}>
              TIPO
            </label>
            <select id="eventType" name="eventType" className={inputClass}>
              {(Object.keys(appointmentTypeLabels) as AppointmentType[]).map(
                (type) => (
                  <option key={type} value={type}>
                    {appointmentTypeLabels[type]}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="appointmentStatus" className={labelClass}>
              ESTADO
            </label>
            <select
              id="appointmentStatus"
              name="appointmentStatus"
              defaultValue="pending"
              className={inputClass}
            >
              {(Object.keys(appointmentStatusLabels) as AppointmentStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {appointmentStatusLabels[s]}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label htmlFor="artistId" className={labelClass}>
              ARTISTA / TATUADOR
            </label>
            <select
              id="artistId"
              name="artistId"
              required
              defaultValue={activeArtists[0]?.id ?? ""}
              className={inputClass}
              disabled={activeArtists.length === 0}
            >
              {activeArtists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                  {artist.specialty ? ` · ${artist.specialty}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className={labelClass}>
              FECHA
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={startDefaults.date}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="startTime" className={labelClass}>
              HORA INICIO
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue={startDefaults.time || "10:00"}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endTime" className={labelClass}>
              HORA FIN
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              required
              defaultValue={endDefaults.time || "12:00"}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="notes" className={labelClass}>
              NOTAS INTERNAS
            </label>
            <textarea id="notes" name="notes" rows={2} className={inputClass} />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={status === "loading" || activeArtists.length === 0}
          className="bg-black px-8 py-3 text-[11px] tracking-[0.15em] text-white transition-colors hover:bg-black/85 disabled:opacity-50"
        >
          {status === "loading" ? "GUARDANDO..." : "CREAR CITA"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/calendario")}
          className="border border-black/20 px-8 py-3 text-[11px] tracking-[0.15em] text-black/60 transition-colors hover:border-black"
        >
          CANCELAR
        </button>
      </div>
    </form>
    </>
  );
}
