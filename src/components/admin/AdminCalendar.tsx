"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventClickArg,
  EventDropArg,
  DatesSetArg,
  DateSelectArg,
} from "@fullcalendar/core";
import { toast } from "sonner";
import esLocale from "@fullcalendar/core/locales/es";
import AppointmentEventModal from "@/components/admin/AppointmentEventModal";
import BlockEventModal from "@/components/admin/BlockEventModal";
import CalendarSelectModal from "@/components/admin/CalendarSelectModal";
import type { CalendarBlockRecord } from "@/types/availability";
import type { AppointmentRecord } from "@/types/scheduling";
import { appointmentStatusLabels } from "@/types/scheduling";
import "@/styles/fullcalendar.css";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  classNames: string[];
  editable?: boolean;
  extendedProps: Record<string, unknown>;
};

function mapToCalendarEvent(apt: AppointmentRecord): CalendarEvent {
  return {
    id: apt.id,
    title: apt.title,
    start: apt.startsAt,
    end: apt.endsAt,
    classNames: [`status-${apt.status}`, `type-${apt.eventType}`],
    editable: true,
    extendedProps: { kind: "appointment", appointment: apt },
  };
}

function mapBlockToCalendarEvent(block: CalendarBlockRecord): CalendarEvent {
  return {
    id: `block-${block.id}`,
    title: block.reason ?? "Bloqueado",
    start: block.startsAt,
    end: block.endsAt,
    classNames: ["event-block"],
    editable: false,
    extendedProps: { kind: "block", block },
  };
}

export default function AdminCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<AppointmentRecord | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<CalendarBlockRecord | null>(
    null
  );
  const [selection, setSelection] = useState<{ start: string; end: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const rangeRef = useRef({ start: "", end: "" });

  const loadEvents = useCallback(async (start: string, end: string) => {
    rangeRef.current = { start, end };
    setLoading(true);
    try {
      const [appointmentsRes, blocksRes] = await Promise.all([
        fetch(
          `/api/admin/appointments?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
        ),
        fetch(
          `/api/admin/blocks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
        ),
      ]);

      const appointmentsData = await appointmentsRes.json();
      const blocksData = await blocksRes.json();

      if (!appointmentsRes.ok) {
        toast.error(appointmentsData.error ?? "Error al cargar citas.");
        return;
      }
      if (!blocksRes.ok) {
        toast.error(blocksData.error ?? "Error al cargar bloqueos.");
        return;
      }

      const appointmentEvents = (
        appointmentsData.appointments as AppointmentRecord[]
      ).map(mapToCalendarEvent);
      const blockEvents = (blocksData.blocks as CalendarBlockRecord[]).map(
        mapBlockToCalendarEvent
      );

      setEvents([...appointmentEvents, ...blockEvents]);
    } catch {
      toast.error("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  function refreshCalendar() {
    const { start, end } = rangeRef.current;
    if (start && end) void loadEvents(start, end);
  }

  useEffect(() => {
    const handler = () => refreshCalendar();
    window.addEventListener("yairink:appointments-changed", handler);
    return () =>
      window.removeEventListener("yairink:appointments-changed", handler);
  }, [loadEvents]);

  function handleDatesSet(info: DatesSetArg) {
    void loadEvents(info.startStr, info.endStr);
  }

  function handleEventClick(info: EventClickArg) {
    const kind = info.event.extendedProps.kind as string;
    if (kind === "block") {
      setSelectedBlock(info.event.extendedProps.block as CalendarBlockRecord);
      return;
    }
    setSelected(info.event.extendedProps.appointment as AppointmentRecord);
  }

  async function handleEventDrop(info: EventDropArg) {
    const kind = info.event.extendedProps.kind as string;
    if (kind === "block") {
      info.revert();
      return;
    }

    const apt = info.event.extendedProps.appointment as AppointmentRecord;
    try {
      const response = await fetch(`/api/admin/appointments/${apt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: info.event.start?.toISOString(),
          endsAt: info.event.end?.toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        info.revert();
        toast.error(result.error ?? "No se pudo reprogramar.");
        return;
      }
      toast.success("Cita reprogramada");
      const updated = result.appointment as AppointmentRecord;
      info.event.setExtendedProp("appointment", updated);
    } catch {
      info.revert();
      toast.error("Error de conexión.");
    }
  }

  function handleUpdated(appointment: AppointmentRecord) {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === appointment.id ? mapToCalendarEvent(appointment) : event
      )
    );
  }

  function handleSelect(info: DateSelectArg) {
    setSelection({ start: info.startStr, end: info.endStr });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-[10px] tracking-[0.08em] text-black/50">
        {(Object.keys(appointmentStatusLabels) as Array<
          keyof typeof appointmentStatusLabels
        >).map((status) => (
          <span key={status} className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 status-${status}`} />
            {appointmentStatusLabels[status]}
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 event-block" />
          BLOQUEADO
        </span>
        {loading && <span className="text-black/30">Actualizando...</span>}
      </div>

      <p className="mb-4 text-xs text-black/45">
        Selecciona un rango en el calendario para crear cita o bloquear horario.
      </p>

      <div className="yairink-calendar border border-black/10 bg-white p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,today,next",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          locale={esLocale}
          firstDay={1}
          slotMinTime="09:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          height="auto"
          events={events}
          editable
          selectable
          selectMirror
          dayMaxEvents
          weekends
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
          }}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          select={handleSelect}
          eventDrop={handleEventDrop}
        />
      </div>

      {selected && (
        <AppointmentEventModal
          appointment={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}

      {selectedBlock && (
        <BlockEventModal
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onDeleted={refreshCalendar}
        />
      )}

      {selection && (
        <CalendarSelectModal
          start={selection.start}
          end={selection.end}
          onClose={() => setSelection(null)}
          onBlocked={refreshCalendar}
        />
      )}
    </>
  );
}
