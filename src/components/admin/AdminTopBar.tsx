"use client";

import { toast } from "sonner";
import LiveClock from "@/components/admin/LiveClock";
import UserMenu from "@/components/admin/UserMenu";

type AdminTopBarProps = {
  searchPlaceholder?: string;
};

export default function AdminTopBar({
  searchPlaceholder = "Buscar...",
}: AdminTopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
      <div className="flex items-center gap-8">
        <p className="hidden font-serif text-lg md:block">YAIRINK</p>
        <div className="flex gap-6 text-[10px] tracking-[0.15em]">
          <button type="button" className="border-b border-black pb-0.5">
            VISTA DEL ESTUDIO
          </button>
          <button
            type="button"
            onClick={() =>
              toast.message("Reportes", {
                description: "Módulo de reportes disponible próximamente.",
              })
            }
            className="text-black/40 transition-colors hover:text-black"
          >
            REPORTES
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="w-44 border border-black/10 bg-off-white py-2 pl-8 pr-3 text-[10px] tracking-[0.05em] outline-none focus:border-black/30 lg:w-56"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-black/30">
            ⌕
          </span>
        </div>

        <LiveClock />
        <UserMenu />
      </div>
    </header>
  );
}
