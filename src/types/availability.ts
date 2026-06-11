export type CalendarBlockRecord = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  allDay: boolean;
  createdAt: string;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  dateLabel: string;
  timeLabel: string;
};

export type CreateBlockInput = {
  startsAt: string;
  endsAt: string;
  reason?: string;
  allDay?: boolean;
};
