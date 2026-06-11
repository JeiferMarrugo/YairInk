"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import type { Review } from "@/types/content";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < count ? "text-black" : "text-black/20"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
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

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function tattooDownloadName(src: string, piece: string) {
  const ext = src.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
    ? ext
    : "jpg";
  const slug = piece
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `yairink-${slug || "tatuaje"}.${safeExt}`;
}

async function downloadTattooImage(src: string, piece: string) {
  const filename = tattooDownloadName(src, piece);

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
    toast.error("No se pudo descargar la imagen.");
  }
}

function ModalActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-sm border border-black/15 bg-white/95 text-black shadow-sm backdrop-blur-sm transition-colors hover:border-black hover:bg-black hover:text-white"
    >
      {children}
    </button>
  );
}

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      id={`review-${review.id}`}
      className="flex flex-col border border-black/10 bg-white scroll-mt-28"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-black/10">
        <Image
          src={review.image}
          alt={review.imageAlt}
          fill
          className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="absolute bottom-3 right-3 bg-black px-3 py-1.5 text-[9px] tracking-[0.12em] text-white transition-colors hover:bg-black/80"
            >
              VER TATUAJE
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px]"
            />
            <Dialog.Content
              className="fixed left-1/2 top-1/2 z-50 flex w-[min(94vw,720px)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm border border-black/10 bg-white shadow-2xl focus:outline-none"
            >
              <div className="relative flex min-h-[min(50vh,420px)] max-h-[min(72vh,640px)] w-full items-center justify-center bg-off-white px-4 py-6 sm:px-8 sm:py-10">
                <div className="relative h-full w-full min-h-[240px]">
                  <Image
                    src={review.image}
                    alt={review.imageAlt}
                    fill
                    className="object-contain"
                    sizes="720px"
                    priority
                  />
                </div>

                <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
                  <ModalActionButton
                    label="Descargar tatuaje"
                    onClick={() =>
                      void downloadTattooImage(review.image, review.piece)
                    }
                  >
                    <DownloadIcon size={16} />
                  </ModalActionButton>
                  <Dialog.Close
                    type="button"
                    aria-label="Cerrar"
                    className="flex h-10 w-10 items-center justify-center rounded-sm border border-black/15 bg-white/95 text-black shadow-sm backdrop-blur-sm transition-colors hover:border-black hover:bg-black hover:text-white"
                  >
                    <CloseIcon />
                  </Dialog.Close>
                </div>
              </div>

              <div className="shrink-0 border-t border-black/10 px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.15em] text-black/40">
                      CLIENTE
                    </p>
                    <Dialog.Title className="mt-1 font-serif text-xl sm:text-2xl">
                      {review.name}
                    </Dialog.Title>
                    <Dialog.Description className="mt-1.5 text-sm text-black/50">
                      {review.piece} · {review.date}
                    </Dialog.Description>
                  </div>
                  <Stars count={review.rating} />
                </div>
                <blockquote className="mt-6 border-t border-black/10 pt-5 font-serif text-base leading-relaxed text-black/75 sm:text-lg">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div className="flex flex-1 flex-col p-8">
        <Stars count={review.rating} />
        <blockquote className="mt-6 flex-1 font-serif text-lg leading-relaxed">
          &ldquo;{review.text}&rdquo;
        </blockquote>
        <div className="mt-8 border-t border-black/10 pt-6">
          <p className="text-[10px] tracking-[0.15em]">{review.name}</p>
          <p className="mt-1 text-xs text-black/50">{review.piece}</p>
          <p className="mt-1 text-[10px] tracking-[0.1em] text-black/40">
            {review.date}
          </p>
        </div>
      </div>
    </article>
  );
}
