"use client";

import { toast } from "sonner";
import LiveClock from "@/components/admin/LiveClock";
import UserMenu from "@/components/admin/UserMenu";
import { useAdminLayout } from "@/contexts/AdminLayoutContext";

type AdminTopBarProps = {
  searchPlaceholder?: string;
};

export default function AdminTopBar({
  searchPlaceholder = "Buscar...",
}: AdminTopBarProps) {
  const { toggleMobileNav } = useAdminLayout();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-white px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggleMobileNav}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 border border-black/10 lg:hidden"
          aria-label="Abrir menú"
        >
          <span className="block h-px w-4 bg-black" />
          <span className="block h-px w-4 bg-black" />
          <span className="block h-px w-4 bg-black" />
        </button>

        <p className="truncate font-serif text-base sm:text-lg lg:hidden">
          YAIRINK
        </p>

        <div className="hidden min-w-0 items-center gap-8 lg:flex">
          <p className="font-serif text-lg">YAIRINK</p>
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
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="w-40 border border-black/10 bg-off-white py-2 pl-8 pr-3 text-[10px] tracking-[0.05em] outline-none focus:border-black/30 lg:w-56"
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
