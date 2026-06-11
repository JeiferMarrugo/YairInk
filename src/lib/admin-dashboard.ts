import { query, queryOne } from "@/lib/db";
import { formatCurrency } from "@/lib/display";
import { STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";
import { appointmentTypeLabels } from "@/types/scheduling";
import type {
  AdminPortfolioItem,
  AppointmentTrendPoint,
  DashboardMetrics,
  RecentActivityItem,
  RevenueTrendPoint,
  ScheduleStatus,
  TodayScheduleItem,
} from "@/types/admin-dashboard";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString(STUDIO_LOCALE, {
    day: "numeric",
    month: "short",
    timeZone: STUDIO_TIMEZONE,
  });
}

function resolveScheduleStatus(
  eventType: string,
  startsAt: string,
  endsAt: string
): ScheduleStatus {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  if (now >= start && now <= end) return "en-progreso";
  if (eventType === "consulta") return "consulta";
  return "proximamente";
}

function buildDescription(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(" · ");
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const totals = await queryOne<{
    revenue: string;
    week_appointments: string;
    new_clients: string;
    pending_week: string;
  }>(
    `SELECT
       COALESCE((SELECT SUM(total_spent_cents) FROM clients), 0)::text AS revenue,
       COALESCE((
         SELECT COUNT(*) FROM appointments
         WHERE status IN ('confirmed', 'pending', 'completed')
           AND starts_at >= date_trunc('week', NOW() AT TIME ZONE $1)
           AND starts_at < date_trunc('week', NOW() AT TIME ZONE $1) + INTERVAL '7 days'
       ), 0)::text AS week_appointments,
       COALESCE((
         SELECT COUNT(*) FROM clients
         WHERE created_at >= date_trunc('month', NOW() AT TIME ZONE $1)
       ), 0)::text AS new_clients,
       COALESCE((
         SELECT COUNT(*) FROM appointments
         WHERE status = 'pending'
           AND starts_at >= NOW()
       ), 0)::text AS pending_week`,
    [STUDIO_TIMEZONE]
  );

  const revenue = Number(totals?.revenue ?? 0);
  const weekAppointments = Number(totals?.week_appointments ?? 0);
  const newClients = Number(totals?.new_clients ?? 0);
  const pendingWeek = Number(totals?.pending_week ?? 0);

  return {
    revenue: {
      value: formatCurrency(revenue),
      detail: "Total acumulado de clientes registrados",
    },
    appointments: {
      value: String(weekAppointments),
      detail:
        pendingWeek > 0
          ? `${pendingWeek} pendiente${pendingWeek === 1 ? "" : "s"} por confirmar`
          : "Citas activas esta semana",
    },
    newClients: {
      value: String(newClients),
      detail: "Registrados este mes",
    },
  };
}

export async function getTodaySchedule(): Promise<TodayScheduleItem[]> {
  const rows = await query<{
    id: string;
    client_name: string;
    starts_at: string;
    ends_at: string;
    event_type: string;
    concept: string | null;
    style: string | null;
    placement: string | null;
    artist: string | null;
  }>(
    `SELECT id, client_name, starts_at, ends_at, event_type,
            concept, style, placement, artist
     FROM appointments
     WHERE (starts_at AT TIME ZONE $1)::date = (NOW() AT TIME ZONE $1)::date
       AND status IN ('confirmed', 'pending')
     ORDER BY starts_at ASC`,
    [STUDIO_TIMEZONE]
  );

  return rows.map((row) => ({
    id: row.id,
    time: new Date(row.starts_at).toLocaleTimeString(STUDIO_LOCALE, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: STUDIO_TIMEZONE,
    }),
    status: resolveScheduleStatus(row.event_type, row.starts_at, row.ends_at),
    client: row.client_name,
    description:
      buildDescription([
        row.concept,
        row.style,
        row.placement,
      ]) ||
      appointmentTypeLabels[
        row.event_type as keyof typeof appointmentTypeLabels
      ],
    artist: row.artist?.trim() || "—",
  }));
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const rows = await query<{
    id: string;
    kind: string;
    title: string;
    detail: string;
    happened_at: string;
  }>(
    `SELECT * FROM (
       SELECT id, 'appointment' AS kind,
              'Nueva cita: ' || client_name AS title,
              event_type || ' · ' ||
              to_char(starts_at AT TIME ZONE $1, 'DD Mon HH24:MI') AS detail,
              created_at AS happened_at
       FROM appointments
       UNION ALL
       SELECT id, 'review' AS kind,
              'Nueva reseña: ' || name AS title,
              piece AS detail,
              created_at AS happened_at
       FROM reviews
       UNION ALL
       SELECT id, 'portfolio' AS kind,
              'Portafolio: ' || title AS title,
              meta AS detail,
              created_at AS happened_at
       FROM portfolio_items
       UNION ALL
       SELECT id, 'completed' AS kind,
              'Sesión realizada: ' || client_name AS title,
              COALESCE(concept, style, 'Tatuaje completado') AS detail,
              completed_at AS happened_at
       FROM appointments
       WHERE status = 'completed' AND completed_at IS NOT NULL
     ) activity
     ORDER BY happened_at DESC
     LIMIT 8`,
    [STUDIO_TIMEZONE]
  );

  return rows.map((row) => ({
    id: `${row.kind}-${row.id}`,
    title: row.title,
    detail: row.detail,
    time: formatRelativeTime(row.happened_at),
  }));
}

export async function getAppointmentTrends(): Promise<AppointmentTrendPoint[]> {
  const rows = await query<{
    day_index: number;
    consultations: string;
    sessions: string;
  }>(
    `SELECT
       EXTRACT(DOW FROM starts_at AT TIME ZONE $1)::int AS day_index,
       COUNT(*) FILTER (WHERE event_type = 'consulta')::text AS consultations,
       COUNT(*) FILTER (
         WHERE event_type IN ('sesion', 'retoque', 'pieza_personalizada')
       )::text AS sessions
     FROM appointments
     WHERE starts_at >= (NOW() AT TIME ZONE $1)::date - INTERVAL '6 days'
       AND status <> 'cancelled'
     GROUP BY 1
     ORDER BY 1`,
    [STUDIO_TIMEZONE]
  );

  const byDay = new Map(
    rows.map((row) => [
      row.day_index,
      {
        consultations: Number(row.consultations),
        sessions: Number(row.sessions),
      },
    ])
  );

  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: STUDIO_TIMEZONE })
  );
  const todayIndex = today.getDay();

  return Array.from({ length: 7 }, (_, offset) => {
    const dayIndex = (todayIndex - 6 + offset + 7) % 7;
    const stats = byDay.get(dayIndex) ?? { consultations: 0, sessions: 0 };
    return {
      day: DAY_LABELS[dayIndex],
      consultations: stats.consultations,
      sessions: stats.sessions,
    };
  });
}

export async function getRevenueTrends(): Promise<RevenueTrendPoint[]> {
  const rows = await query<{ month_start: string; ingresos: string }>(
    `SELECT
       date_trunc('month', last_session_at)::date AS month_start,
       COALESCE(SUM(total_spent_cents), 0)::text AS ingresos
     FROM clients
     WHERE last_session_at IS NOT NULL
       AND last_session_at >= date_trunc('month', NOW() AT TIME ZONE $1) - INTERVAL '5 months'
     GROUP BY 1
     ORDER BY 1`,
    [STUDIO_TIMEZONE]
  );

  if (rows.length === 0) {
    return [];
  }

  return rows.map((row) => ({
    mes: new Date(row.month_start).toLocaleDateString(STUDIO_LOCALE, {
      month: "short",
      timeZone: STUDIO_TIMEZONE,
    }),
    ingresos: Number(row.ingresos),
  }));
}

export async function listAdminPortfolioItems(): Promise<AdminPortfolioItem[]> {
  const rows = await query<{
    id: string;
    title: string;
    meta: string;
    src: string;
    alt: string;
    created_at: string;
    is_published: boolean;
  }>(
    `SELECT id, title, meta, src, alt, created_at, is_published
     FROM portfolio_items
     ORDER BY sort_order ASC, created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    meta: row.meta,
    src: row.src,
    alt: row.alt,
    uploaded: new Date(row.created_at)
      .toLocaleDateString(STUDIO_LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: STUDIO_TIMEZONE,
      })
      .toUpperCase(),
    isPublished: row.is_published,
  }));
}

export function getDashboardDateLabel(): string {
  return new Date().toLocaleDateString(STUDIO_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: STUDIO_TIMEZONE,
  });
}
