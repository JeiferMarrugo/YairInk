"use client";

import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import {
  scheduleStatusLabels,
  type ScheduleStatus,
} from "@/types/admin-dashboard";

type ScheduleCardProps = {
  time: string;
  status: ScheduleStatus;
  client: string;
  description: string;
  artist: string;
};

export default function ScheduleCard({
  time,
  status,
  client,
  description,
  artist,
}: ScheduleCardProps) {
  return (
    <div className="border border-black/10 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-serif text-lg">{time}</span>
        <span
          className={`px-2 py-0.5 text-[8px] tracking-[0.1em] ${
            status === "en-progreso"
              ? "bg-beige text-black"
              : status === "consulta"
                ? "bg-black text-white"
                : "bg-black/10 text-black/60"
          }`}
        >
          {scheduleStatusLabels[status]}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Avatar src={avatarUrl(client)} fallback={artist} size="sm" />
        <div>
          <p className="font-medium">{client}</p>
          <p className="mt-0.5 text-xs text-black/50">{description}</p>
        </div>
      </div>
    </div>
  );
}
