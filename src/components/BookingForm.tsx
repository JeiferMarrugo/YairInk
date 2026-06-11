"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { usePublicContent } from "@/contexts/PublicContentContext";
import PhoneField from "@/components/PhoneField";
import { validatePhoneFromForm } from "@/lib/phone-client";
import type { AvailabilitySlot } from "@/types/availability";

function defaultSearchMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function validateClientFields(form: FormData): string[] {
  const errors: string[] = [];
  const fullName = String(form.get("fullName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const concept = String(form.get("concept") ?? "").trim();
  const size = String(form.get("size") ?? "").trim();
  const placement = String(form.get("placement") ?? "").trim();

  if (!fullName) errors.push("El nombre es obligatorio.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Introduce un email válido.");
  }
  if (!concept || concept.length < 20) {
    errors.push("Describe tu concepto con al menos 20 caracteres.");
  }
  if (!size) errors.push("Indica el tamaño estimado.");
  if (!placement) errors.push("Indica la zona del cuerpo.");

  return errors;
}

export default function BookingForm() {
  const { components } = usePublicContent();
  const formContent = components.bookingForm;

  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [searchMonth, setSearchMonth] = useState(defaultSearchMonth);
  const [searching, setSearching] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const key = slot.dateLabel;
      const list = groups.get(key) ?? [];
      list.push(slot);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [slots]);

  async function handleSearchAvailability() {
    setSearching(true);
    setSelectedSlot(null);

    try {
      const response = await fetch(
        `/api/availability?month=${encodeURIComponent(searchMonth)}`
      );
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "No se pudo buscar disponibilidad.");
        setSlots([]);
        return;
      }

      const nextSlots = result.slots as AvailabilitySlot[];
      setSlots(nextSlots);

      if (nextSlots.length === 0) {
        toast.message("Sin horarios libres", {
          description: "Prueba otro mes en el selector.",
        });
      }
    } catch {
      toast.error(formContent.connectionError);
      setSlots([]);
    } finally {
      setSearching(false);
    }
  }

  async function submitForm() {
    if (submitting) return;

    const formEl = formRef.current;
    if (!formEl) return;

    if (!selectedSlot) {
      toast.error("Busca disponibilidad y selecciona un horario.");
      return;
    }

    const form = new FormData(formEl);
    const clientErrors = validateClientFields(form);
    if (clientErrors.length > 0) {
      toast.error(clientErrors.join(" "));
      return;
    }

    const phoneResult = validatePhoneFromForm(form, "phone");
    if (!phoneResult.ok) {
      toast.error(phoneResult.error);
      return;
    }

    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: phoneResult.display,
      concept: String(form.get("concept") ?? "").trim(),
      size: String(form.get("size") ?? "").trim(),
      placement: String(form.get("placement") ?? "").trim(),
      timePreference: selectedSlot.timeLabel,
      preferredMonth: searchMonth,
      selectedSlot: {
        startsAt: selectedSlot.startsAt,
        endsAt: selectedSlot.endsAt,
      },
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const messages = Array.isArray(result.errors)
          ? result.errors
          : [result.error ?? "Error al enviar la consulta."];
        toast.error(messages.join(" "));
        return;
      }

      toast.success(
        typeof result.message === "string"
          ? result.message
          : formContent.successMessage,
        { duration: 6000 }
      );
      setSelectedSlot(null);
      setSlots([]);
      formEl.reset();
    } catch {
      toast.error(formContent.connectionError);
    } finally {
      setSubmitting(false);
    }
  }

  const fields = formContent.fields;

  return (
    <div>
      <section className="mb-10 border border-black/10 bg-off-white/50 p-6">
        <p className="text-[10px] tracking-[0.15em]">DISPONIBILIDAD</p>
        <p className="mt-2 text-sm text-black/60">
          Elige un mes y busca horarios libres en el estudio (bloques de 2 h).
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label
              htmlFor="searchMonth"
              className="text-[10px] tracking-[0.15em]"
            >
              MES
            </label>
            <input
              id="searchMonth"
              type="month"
              value={searchMonth}
              onChange={(e) => setSearchMonth(e.target.value)}
              className="mt-3 block border-0 border-b border-black bg-transparent py-2 text-[10px] tracking-[0.1em] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSearchAvailability()}
            disabled={searching}
            className="border border-black bg-white px-6 py-3 text-[10px] tracking-[0.15em] transition-colors hover:bg-black hover:text-white disabled:opacity-50"
          >
            {searching ? "BUSCANDO..." : "BUSCAR DISPONIBILIDAD"}
          </button>
        </div>

        {groupedSlots.length > 0 && (
          <div className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">
            {groupedSlots.map(([dateLabel, daySlots]) => (
              <div key={dateLabel}>
                <p className="mb-2 text-[9px] tracking-[0.12em] text-black/40">
                  {dateLabel.toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => {
                    const isSelected =
                      selectedSlot?.startsAt === slot.startsAt;
                    return (
                      <button
                        key={slot.startsAt}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 text-[10px] tracking-[0.08em] transition-colors ${
                          isSelected
                            ? "bg-black text-white"
                            : "border border-black/20 bg-white hover:border-black"
                        }`}
                      >
                        {slot.timeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedSlot && (
          <p className="mt-4 text-xs text-black/60">
            Horario seleccionado:{" "}
            <span className="font-medium text-black">
              {selectedSlot.dateLabel} · {selectedSlot.timeLabel}
            </span>
          </p>
        )}
      </section>

      <form
        ref={formRef}
        className="space-y-8"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submitForm();
        }}
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <FormField
            label={fields.fullName.label}
            name="fullName"
            placeholder={fields.fullName.placeholder}
          />
          <FormField
            label={fields.email.label}
            name="email"
            placeholder={fields.email.placeholder}
            type="email"
          />
        </div>

        <PhoneField
          prefix="phone"
          variant="public"
          label={fields.phone.label}
          hint={fields.phone.hint}
          nationalPlaceholder={fields.phone.placeholder}
        />

        <FormField
          label={fields.concept.label}
          name="concept"
          placeholder={fields.concept.placeholder}
          multiline
        />

        <div className="grid gap-8 sm:grid-cols-2">
          <FormField
            label={fields.size.label}
            name="size"
            placeholder={fields.size.placeholder}
          />
          <FormField
            label={fields.placement.label}
            name="placement"
            placeholder={fields.placement.placeholder}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedSlot}
          className="bg-black px-12 py-4 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? formContent.submittingLabel : "CONFIRMAR RESERVA"}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  multiline = false,
  hint,
  inputMode,
  autoComplete,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  hint?: string;
  inputMode?: "tel" | "text" | "email" | "numeric";
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[10px] tracking-[0.15em]">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          rows={4}
          className="mt-3 w-full resize-none border-0 border-b border-black bg-transparent py-2 text-[10px] tracking-[0.1em] placeholder:text-black/30 outline-none"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className="mt-3 w-full border-0 border-b border-black bg-transparent py-2 text-[10px] tracking-[0.1em] placeholder:text-black/30 outline-none"
        />
      )}
      {hint && (
        <p className="mt-1.5 text-[9px] tracking-[0.08em] text-black/40">
          {hint}
        </p>
      )}
    </div>
  );
}
