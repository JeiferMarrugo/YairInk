export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

export type AppointmentType =
  | "consulta"
  | "sesion"
  | "retoque"
  | "pieza_personalizada";

export type ClientStatus = "activo" | "inactivo" | "en-sesion";

export type ClientRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  phoneDisplay: string | null;
  status: ClientStatus;
  totalSpentCents: number;
  lastSessionAt: string | null;
  style: string | null;
  placement: string | null;
  notes: string | null;
  createdAt: string;
};

export type AppointmentRecord = {
  id: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientPhoneDisplay: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  artistId: string | null;
  artist: string | null;
  eventType: AppointmentType;
  status: AppointmentStatus;
  concept: string | null;
  placement: string | null;
  sizeEstimate: string | null;
  style: string | null;
  notes: string | null;
  completedAt: string | null;
  shareToken: string | null;
  sessionPhotos: string[];
  portfolioItemId: string | null;
  reviewSubmitted: boolean;
  createdAt: string;
};

export type CreateAppointmentInput = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: AppointmentType;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  artistId: string;
  concept: string;
  placement: string;
  sizeEstimate: string;
  style: string;
  notes: string;
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  confirmed: "CONFIRMADA",
  pending: "PENDIENTE",
  cancelled: "CANCELADA",
  completed: "REALIZADA",
};

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  consulta: "Consulta",
  sesion: "Sesión completa",
  retoque: "Retoque",
  pieza_personalizada: "Pieza personalizada",
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  activo: "ACTIVO",
  inactivo: "INACTIVO",
  "en-sesion": "EN SESIÓN",
};
