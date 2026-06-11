"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import type { SessionPublicView } from "@/lib/sessions";
import { STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";

type SessionSummaryClientProps = {
  session: SessionPublicView;
};

function photoDownloadName(src: string, index: number) {
  const ext = src.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    ? ext
    : "jpg";
  return `yairink-tatuaje-${index + 1}.${safeExt}`;
}

function DownloadIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 4v9" />
      <path d="m8.5 9.5 3.5 3.5 3.5-3.5" />
      <path d="M5 20h14" />
    </svg>
  );
}

async function downloadPhoto(src: string, index: number) {
  const filename = photoDownloadName(src, index);

  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error("fetch failed");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.download = filename;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.error("No se pudo descargar. Intenta abrir la imagen y guardarla.");
  }
}

export default function SessionSummaryClient({
  session,
}: SessionSummaryClientProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(session.reviewSubmitted);

  const completedLabel = new Date(session.completedAt).toLocaleDateString(
    STUDIO_LOCALE,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: STUDIO_TIMEZONE,
    }
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/session/${session.token}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "No se pudo enviar la reseña.");
        return;
      }

      setSubmitted(true);
      toast.success("¡Gracias por tu reseña!");
    } catch {
      toast.error("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  const hasPhotos = session.sessionPhotos.length > 0;
  const [downloadingAll, setDownloadingAll] = useState(false);

  async function handleDownloadAll() {
    setDownloadingAll(true);
    try {
      for (let index = 0; index < session.sessionPhotos.length; index += 1) {
        await downloadPhoto(session.sessionPhotos[index].src, index);
        if (index < session.sessionPhotos.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
      toast.success("Fotos descargadas");
    } catch {
      toast.error("No se pudieron descargar todas las fotos.");
    } finally {
      setDownloadingAll(false);
    }
  }

  return (
    <main className="bg-off-white">
      <section className="mx-auto max-w-[1100px] px-6 py-16 lg:px-12 lg:py-24">
        <p className="text-[10px] tracking-[0.25em] text-black/40">
          RESUMEN DE SESIÓN
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
          Tu sesión, lista
        </h1>
        <p className="mt-4 text-sm capitalize text-black/55">{completedLabel}</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/50">
          Gracias por confiar en el estudio. Revisa los detalles de tu visita y,
          si quieres, comparte tu experiencia con una reseña.
        </p>

        <div className="mt-12 grid gap-14 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:gap-16">
          {/* Contenido principal */}
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <Avatar
                src={session.artistPhotoUrl ?? avatarUrl(session.artistName)}
                fallback={session.artistName.slice(0, 2).toUpperCase()}
                className="h-14 w-14 text-xs"
              />
              <div>
                <p className="text-[10px] tracking-[0.15em] text-black/40">
                  ARTISTA
                </p>
                <p className="font-serif text-xl">{session.artistName}</p>
                {session.artistSpecialty && (
                  <p className="mt-0.5 text-xs text-black/50">
                    {session.artistSpecialty}
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-10 grid gap-6 border-t border-black/10 pt-10 sm:grid-cols-2 sm:gap-x-10">
              <div>
                <dt className="text-[10px] tracking-[0.15em] text-black/40">
                  CLIENTE
                </dt>
                <dd className="mt-2 text-sm text-black/80">
                  {session.clientName}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.15em] text-black/40">
                  TIPO
                </dt>
                <dd className="mt-2 text-sm text-black/80">
                  {session.eventType}
                </dd>
              </div>
              {session.placement && (
                <div>
                  <dt className="text-[10px] tracking-[0.15em] text-black/40">
                    ZONA
                  </dt>
                  <dd className="mt-2 text-sm text-black/80">
                    {session.placement}
                  </dd>
                </div>
              )}
              {session.style && (
                <div>
                  <dt className="text-[10px] tracking-[0.15em] text-black/40">
                    ESTILO
                  </dt>
                  <dd className="mt-2 text-sm text-black/80">
                    {session.style}
                  </dd>
                </div>
              )}
              {session.concept && (
                <div className="sm:col-span-2">
                  <dt className="text-[10px] tracking-[0.15em] text-black/40">
                    CONCEPTO
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-black/70">
                    {session.concept}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-10 border-t border-black/10 pt-10">
              <h2 className="font-serif text-2xl">Deja tu reseña</h2>
              <p className="mt-2 max-w-lg text-sm text-black/55">
                Tu opinión puede aparecer en nuestra página de reseñas.
              </p>

              {submitted ? (
                <div className="mt-8 max-w-lg">
                  <p className="font-serif text-lg">
                    Gracias por compartir tu experiencia.
                  </p>
                  <p className="mt-2 text-sm text-black/55">
                    Ya recibimos tu reseña — significa mucho para el estudio.
                  </p>
                  <Link
                    href="/reviews"
                    className="mt-6 inline-block text-[10px] tracking-[0.15em] underline underline-offset-4 transition-opacity hover:opacity-60"
                  >
                    VER RESEÑAS DEL ESTUDIO
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 max-w-lg space-y-6"
                >
                  <div>
                    <p className="text-[10px] tracking-[0.15em] text-black/40">
                      VALORACIÓN
                    </p>
                    <div className="mt-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`text-xl transition-opacity hover:opacity-70 ${
                            value <= rating ? "text-black" : "text-black/20"
                          }`}
                          aria-label={`${value} estrellas`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reviewText"
                      className="text-[10px] tracking-[0.15em] text-black/40"
                    >
                      TU RESEÑA
                    </label>
                    <textarea
                      id="reviewText"
                      required
                      minLength={10}
                      rows={4}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      placeholder="Cuéntanos cómo fue tu experiencia..."
                      className="mt-3 w-full resize-none rounded-sm border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed placeholder:text-black/30 outline-none focus:border-black/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-black px-10 py-3.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80 disabled:opacity-50"
                  >
                    {loading ? "ENVIANDO..." : "PUBLICAR RESEÑA"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Galería lateral */}
          {hasPhotos && (
            <aside className="lg:pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] tracking-[0.15em] text-black/40">
                  FOTOS DE TU TATUAJE
                </p>
                {session.sessionPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => void handleDownloadAll()}
                    disabled={downloadingAll}
                    aria-label={
                      downloadingAll
                        ? "Descargando fotos..."
                        : "Descargar todas las fotos"
                    }
                    className="flex h-8 w-8 items-center justify-center border border-black/15 bg-white text-black transition-colors hover:bg-black hover:text-white disabled:opacity-40"
                  >
                    <DownloadIcon size={14} />
                  </button>
                )}
              </div>
              <div className="mt-4 space-y-4">
                {session.sessionPhotos.map((photo, index) => (
                  <div
                    key={`${photo.src}-${index}`}
                    className="group relative aspect-[4/5] overflow-hidden border border-black/10 bg-white"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      priority={index === 0}
                      className="object-contain p-3"
                      sizes="(max-width: 1024px) 100vw, 360px"
                    />
                    <button
                      type="button"
                      onClick={() => void downloadPhoto(photo.src, index)}
                      aria-label={`Descargar foto ${index + 1}`}
                      className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-sm border border-black/15 bg-white/95 text-black shadow-sm backdrop-blur-sm transition-colors hover:border-black hover:bg-black hover:text-white"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>
    </main>
  );
}
