"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import { useAdminUser } from "@/contexts/AdminUserContext";
import { getInitials } from "@/lib/display";

const navItems = [
  { href: "/admin", label: "Panel de Control", icon: "▦" },
  { href: "/admin/calendario", label: "Calendario", icon: "◫" },
  { href: "/admin/artistas", label: "Artistas", icon: "◉" },
  { href: "/admin/portfolio", label: "Portafolio", icon: "◈" },
  { href: "/admin/clientes", label: "Clientes", icon: "◎" },
  { href: "/admin/resenas", label: "Reseñas", icon: "★" },
  { href: "/admin/inventario", label: "Inventario", icon: "▣" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const user = useAdminUser();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    window.location.href = "/admin/login";
  }

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-black/10 bg-off-white">
      <div className="shrink-0 border-b border-black/10 px-5 py-6">
        <Link href="/admin" className="block">
          <p className="font-serif text-lg font-semibold">YAIRINK</p>
          <p className="mt-0.5 text-[10px] tracking-[0.2em] text-black/50">
            ADMINISTRACIÓN
          </p>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative mb-1 flex items-center gap-3 px-3 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-white font-medium shadow-sm"
                  : "text-black/60 hover:bg-white/60 hover:text-black"
              }`}
            >
              <span className="flex w-5 shrink-0 items-center justify-center text-base leading-none opacity-50">
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="absolute right-0 top-1/2 h-9 w-0.5 -translate-y-1/2 bg-black" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-black/10 bg-white p-4">
        <div className="mb-3 flex items-center gap-3 border border-black/5 bg-off-white px-3 py-3">
          <Avatar
            src={avatarUrl(user.name)}
            fallback={getInitials(user.name)}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[10px] tracking-[0.12em] text-black/45">
              {user.role}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/admin/citas/nueva"
            className="block w-full bg-black py-2.5 text-center text-[11px] tracking-[0.15em] text-white transition-colors hover:bg-black/85"
          >
            NUEVA CITA
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full border border-black/10 py-2.5 text-[11px] tracking-[0.15em] text-black/55 transition-colors hover:border-black/25 hover:bg-off-white hover:text-black"
          >
            CERRAR SESIÓN
          </button>
        </div>
      </div>
    </aside>
  );
}
