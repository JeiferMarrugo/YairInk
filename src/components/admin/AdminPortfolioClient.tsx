"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminPortfolioItem } from "@/types/admin-dashboard";

type AdminPortfolioClientProps = {
  initialItems: AdminPortfolioItem[];
};

export default function AdminPortfolioClient({
  initialItems,
}: AdminPortfolioClientProps) {
  const [items, setItems] = useState(initialItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function toggleVisibility(item: AdminPortfolioItem) {
    setUpdatingId(item.id);
    try {
      const response = await fetch(`/api/admin/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      const result = (await response.json()) as {
        item?: AdminPortfolioItem;
        error?: string;
      };

      if (!response.ok || !result.item) {
        toast.error(result.error ?? "No se pudo actualizar la visibilidad.");
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? result.item! : entry))
      );
      toast.success(
        result.item.isPublished
          ? "Pieza visible en la web"
          : "Pieza oculta del portafolio público"
      );
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-black/50">
        Aún no hay piezas en el portafolio. Se crean al marcar sesiones como
        realizadas o desde el contenido del sitio.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const isUpdating = updatingId === item.id;

        return (
          <article key={item.id} className="border border-black/10 bg-white">
            <div className="relative aspect-square">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                unoptimized={item.src.startsWith("http")}
                className={`object-cover transition-opacity ${
                  item.isPublished ? "grayscale" : "grayscale opacity-40"
                }`}
              />
              <span
                className={`absolute right-2 top-2 px-2 py-0.5 text-[8px] tracking-[0.1em] ${
                  item.isPublished
                    ? "bg-green-100 text-green-800"
                    : "bg-black/10 text-black/60"
                }`}
              >
                {item.isPublished ? "VISIBLE" : "OCULTO"}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-sm">{item.title}</h3>
              <p className="mt-1 text-[10px] text-black/45">{item.meta}</p>
              <p className="mt-2 text-[9px] tracking-[0.05em] text-black/40">
                SUBIDO {item.uploaded}
              </p>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void toggleVisibility(item)}
                className={`mt-4 w-full py-2.5 text-[9px] tracking-[0.12em] transition-colors disabled:opacity-50 ${
                  item.isPublished
                    ? "border border-black/15 bg-off-white hover:border-black/30 hover:bg-white"
                    : "bg-black text-white hover:bg-black/80"
                }`}
              >
                {isUpdating
                  ? "GUARDANDO…"
                  : item.isPublished
                    ? "OCULTAR EN WEB"
                    : "MOSTRAR EN WEB"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
