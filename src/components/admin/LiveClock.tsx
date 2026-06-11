"use client";

import { useEffect, useState } from "react";

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="hidden h-10 w-24 border border-black/10 bg-off-white sm:block" />
    );
  }

  const time = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = now.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="hidden border border-black/10 bg-off-white px-4 py-2 sm:block">
      <p className="font-serif text-lg leading-none tabular-nums">{time}</p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-black/40">
        {date}
      </p>
    </div>
  );
}
