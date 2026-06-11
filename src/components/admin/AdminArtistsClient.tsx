"use client";

import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import PhoneField from "@/components/PhoneField";
import { validatePhoneFromForm } from "@/lib/phone-client";
import { uploadAdminImage } from "@/lib/upload-client";
import type { ArtistRecord } from "@/types/artist";

type AdminArtistsClientProps = {
  initialArtists: ArtistRecord[];
};

async function uploadArtistPhoto(file: File): Promise<string> {
  return uploadAdminImage(file, "artists", "artist");
}

export default function AdminArtistsClient({
  initialArtists,
}: AdminArtistsClientProps) {
  const [artists, setArtists] = useState(initialArtists);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors([]);

    const form = new FormData(event.currentTarget);
    const phoneResult = validatePhoneFromForm(form, "phone");

    if (!phoneResult.ok) {
      setErrors([phoneResult.error]);
      setLoading(false);
      return;
    }

    try {
      let photoUrl: string | undefined;
      const photoFile = photoInputRef.current?.files?.[0];
      if (photoFile) {
        photoUrl = await uploadArtistPhoto(photoFile);
      }

      const payload = {
        name: String(form.get("name") ?? ""),
        phone: phoneResult.display,
        email: String(form.get("email") ?? ""),
        specialty: String(form.get("specialty") ?? ""),
        photoUrl,
      };

      const response = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors([result.error ?? "No se pudo crear el artista."]);
        return;
      }

      setArtists((prev) =>
        [...prev, result.artist as ArtistRecord].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      toast.success("Artista registrado");
      formRef.current?.reset();
      if (photoInputRef.current) photoInputRef.current.value = "";
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Error de conexión.",
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(artist: ArtistRecord) {
    try {
      const response = await fetch(`/api/admin/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !artist.isActive }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "No se pudo actualizar.");
        return;
      }
      setArtists((prev) =>
        prev.map((item) => (item.id === artist.id ? result.artist : item))
      );
    } catch {
      toast.error("Error de conexión.");
    }
  }

  async function updatePhoto(artist: ArtistRecord, file: File) {
    try {
      const photoUrl = await uploadArtistPhoto(file);
      const response = await fetch(`/api/admin/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "No se pudo actualizar la foto.");
        return;
      }
      setArtists((prev) =>
        prev.map((item) => (item.id === artist.id ? result.artist : item))
      );
      toast.success("Foto actualizada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al subir la foto."
      );
    }
  }

  const inputClass =
    "w-full border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30";
  const labelClass = "mb-1 block text-[9px] tracking-[0.15em] text-black/50";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <h2 className="mb-4 font-serif text-xl">Equipo</h2>
        <div className="space-y-3">
          {artists.length === 0 && (
            <p className="text-sm text-black/50">
              Aún no hay artistas. Registra al menos uno para agendar citas.
            </p>
          )}
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center justify-between border border-black/10 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={artist.photoUrl ?? avatarUrl(artist.name)}
                  fallback={artist.name.slice(0, 2).toUpperCase()}
                  size="sm"
                />
                <div>
                  <p className="font-medium">{artist.name}</p>
                  <p className="text-[10px] text-black/45">
                    {artist.phone}
                    {artist.specialty ? ` · ${artist.specialty}` : ""}
                  </p>
                  <label className="mt-2 inline-block cursor-pointer text-[9px] tracking-[0.1em] text-black/45 underline">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void updatePhoto(artist, file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void toggleActive(artist)}
                className={`px-3 py-1 text-[8px] tracking-[0.1em] ${
                  artist.isActive
                    ? "bg-black text-white"
                    : "bg-black/10 text-black/50"
                }`}
              >
                {artist.isActive ? "ACTIVO" : "INACTIVO"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-black/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-xl">Nuevo artista</h2>
        {errors.length > 0 && (
          <div className="mb-4 border border-black bg-black px-4 py-3 text-sm text-white">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <form ref={formRef} onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>
              NOMBRE
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <PhoneField
            prefix="phone"
            label="WHATSAPP / TELÉFONO"
            hint="Selecciona el país e ingresa el número móvil del artista."
          />
          <div>
            <label htmlFor="artistPhoto" className={labelClass}>
              FOTO (OPCIONAL)
            </label>
            <input
              ref={photoInputRef}
              id="artistPhoto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-black/60 file:mr-3 file:border-0 file:bg-black file:px-3 file:py-2 file:text-[9px] file:tracking-[0.1em] file:text-white"
            />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              EMAIL (OPCIONAL)
            </label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label htmlFor="specialty" className={labelClass}>
              ESPECIALIDAD (OPCIONAL)
            </label>
            <input
              id="specialty"
              name="specialty"
              placeholder="Fine line, blackwork..."
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black py-3 text-[10px] tracking-[0.15em] text-white hover:bg-black/85 disabled:opacity-50"
          >
            {loading ? "GUARDANDO..." : "REGISTRAR ARTISTA"}
          </button>
        </form>
      </section>
    </div>
  );
}
