"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import { useAdminUser } from "@/contexts/AdminUserContext";
import { getInitials } from "@/lib/display";

export default function UserMenu() {
  const user = useAdminUser();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    window.location.href = "/admin/login";
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1 pl-1 pr-3 transition-colors hover:border-black/25 hover:bg-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 data-[state=open]:border-black/25 data-[state=open]:bg-off-white"
          aria-label="Menú de usuario"
        >
          <Avatar
            src={avatarUrl(user.name)}
            fallback={getInitials(user.name)}
            size="sm"
          />
          <span className="hidden text-left md:block">
            <span className="block text-xs font-medium leading-none">
              {user.name}
            </span>
            <span className="mt-0.5 block text-[9px] tracking-[0.08em] text-black/40">
              {user.role}
            </span>
          </span>
          <span className="text-[10px] text-black/30">▾</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] border border-black/10 bg-white p-1.5 shadow-lg"
          sideOffset={8}
          align="end"
        >
          <div className="border-b border-black/5 px-3 py-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-[10px] text-black/40">{user.role}</p>
          </div>

          <DropdownMenu.Item
            className="cursor-pointer px-3 py-2.5 text-xs outline-none transition-colors hover:bg-off-white focus:bg-off-white"
            onSelect={() =>
              toast.message("Mi perfil", {
                description: user.email || "Sesión activa en el panel.",
              })
            }
          >
            Mi perfil
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="cursor-pointer px-3 py-2.5 text-xs outline-none transition-colors hover:bg-off-white focus:bg-off-white"
            onSelect={() =>
              toast.info("Sin notificaciones nuevas", {
                description: "Estás al día con todas las citas.",
              })
            }
          >
            Notificaciones
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="cursor-pointer px-3 py-2.5 text-xs outline-none transition-colors hover:bg-off-white focus:bg-off-white"
            onSelect={() =>
              toast.success("Entrada registrada", {
                description: `${user.name} — ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`,
              })
            }
          >
            Registrar entrada
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/"
              className="block px-3 py-2.5 text-xs outline-none transition-colors hover:bg-off-white"
            >
              Ver sitio público
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-black/10" />

          <DropdownMenu.Item
            className="cursor-pointer px-3 py-2.5 text-xs text-red-700 outline-none transition-colors hover:bg-red-50 focus:bg-red-50"
            onSelect={handleLogout}
          >
            Cerrar sesión
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
