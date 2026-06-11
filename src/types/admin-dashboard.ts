export type ScheduleStatus = "en-progreso" | "proximamente" | "consulta";

export const scheduleStatusLabels: Record<ScheduleStatus, string> = {
  "en-progreso": "EN PROGRESO",
  proximamente: "PRÓXIMAMENTE",
  consulta: "CONSULTA",
};

export type DashboardMetrics = {
  revenue: { value: string; detail: string };
  appointments: { value: string; detail: string };
  newClients: { value: string; detail: string };
};

export type TodayScheduleItem = {
  id: string;
  time: string;
  status: ScheduleStatus;
  client: string;
  description: string;
  artist: string;
};

export type RecentActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

export type AppointmentTrendPoint = {
  day: string;
  consultations: number;
  sessions: number;
};

export type RevenueTrendPoint = {
  mes: string;
  ingresos: number;
};

export type AdminPortfolioItem = {
  id: string;
  title: string;
  meta: string;
  src: string;
  alt: string;
  uploaded: string;
  isPublished: boolean;
};
