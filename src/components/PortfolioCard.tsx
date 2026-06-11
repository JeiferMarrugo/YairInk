"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import type { PortfolioItem } from "@/types/content";

export type PortfolioLayoutSpan =
  | "large"
  | "small"
  | "grid"
  | "bottom-left"
  | "bottom-right";

type PortfolioCardProps = {
  item: PortfolioItem;
  layout?: PortfolioLayoutSpan;
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-[10px] ${i < count ? "text-black" : "text-black/20"}`}
        >
          ★
        </span>
      ))}
    </div>
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

const imageAspect: Record<PortfolioLayoutSpan, string> = {
  large: "aspect-[4/5] lg:min-h-[min(72vh,640px)] lg:aspect-auto",
  small: "aspect-[4/5] lg:aspect-[3/4]",
  grid: "aspect-[4/5]",
  "bottom-left": "aspect-square lg:aspect-[4/5]",
  "bottom-right": "aspect-[16/10] lg:aspect-[5/4]",
};

export default function PortfolioCard({
  item,
  layout = "grid",
}: PortfolioCardProps) {
  const slides =
    item.images.length > 0 ? item.images : [{ src: item.src, alt: item.alt }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const isClientPiece = Boolean(item.clientName);
  const heading = item.clientName ?? item.title;
  const previewIndex = open ? activeIndex : 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [item.id]);

  useEffect(() => {
    if (!open || slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [open, slides.length, item.id]);

  function goTo(index: number) {
    setActiveIndex(index);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <article className="group">
        <Dialog.Trigger asChild>
          <button type="button" className="block w-full text-left">
            <div
              className={`relative w-full overflow-hidden bg-neutral-100 ${imageAspect[layout]}`}
            >
              {slides.map((slide, index) => (
                <Image
                  key={`${slide.src}-${index}`}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className={`object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0 ${
                    index === previewIndex ? "opacity-100" : "opacity-0"
                  }`}
                  sizes={
                    layout === "large" || layout === "bottom-right"
                      ? "(max-width: 1024px) 100vw, 60vw"
                      : "(max-width: 768px) 100vw, 33vw"
                  }
                />
              ))}
              {slides.length > 1 && (
                <span className="absolute right-3 top-3 text-[8px] tracking-[0.15em] text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                  {slides.length} fotos
                </span>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-serif text-lg leading-snug md:text-xl">
                {heading}
              </h3>
              <p className="mt-1 text-[10px] tracking-[0.14em] text-black/45">
                {item.meta}
              </p>
              {item.reviewRating && (
                <div className="mt-2">
                  <Stars count={item.reviewRating} />
                </div>
              )}
              {item.reviewText && (
                <p className="mt-2 line-clamp-2 font-serif text-sm italic leading-relaxed text-black/55">
                  &ldquo;{item.reviewText}&rdquo;
                </p>
              )}
            </div>
          </button>
        </Dialog.Trigger>
      </article>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex w-[min(94vw,800px)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm border border-black/10 bg-white shadow-2xl focus:outline-none"
        >
          <div className="relative flex min-h-[min(50vh,440px)] max-h-[min(72vh,640px)] w-full items-center justify-center bg-neutral-950 px-2 py-4 sm:px-4">
            <div className="relative h-full w-full min-h-[240px]">
              {slides.map((slide, index) => (
                <Image
                  key={`modal-${slide.src}-${index}`}
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className={`object-contain transition-opacity duration-500 ${
                    index === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="800px"
                  priority={index === 0}
                />
              ))}
            </div>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    goTo((activeIndex - 1 + slides.length) % slides.length)
                  }
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-white/20 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goTo((activeIndex + 1) % slides.length)}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm border border-white/20 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
                  aria-label="Foto siguiente"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Foto ${index + 1}`}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        index === activeIndex ? "bg-white" : "bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <Dialog.Close
              type="button"
              aria-label="Cerrar"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-sm border border-white/20 bg-black/50 text-white backdrop-blur-sm hover:bg-white hover:text-black"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>

          <div className="shrink-0 border-t border-black/10 px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                {isClientPiece && (
                  <p className="text-[10px] tracking-[0.15em] text-black/40">
                    CLIENTE
                  </p>
                )}
                <Dialog.Title className="mt-1 font-serif text-xl sm:text-2xl">
                  {heading}
                </Dialog.Title>
                <Dialog.Description className="mt-1.5 text-sm text-black/50">
                  {item.meta}
                </Dialog.Description>
              </div>
              {item.reviewRating && <Stars count={item.reviewRating} />}
            </div>

            {item.reviewText && (
              <blockquote className="mt-5 border-t border-black/10 pt-5 font-serif text-base leading-relaxed text-black/75 sm:text-lg">
                &ldquo;{item.reviewText}&rdquo;
              </blockquote>
            )}

            {item.reviewId && (
              <Link
                href={`/reviews#review-${item.reviewId}`}
                className="mt-5 inline-block text-[10px] tracking-[0.15em] underline underline-offset-4 transition-opacity hover:opacity-60"
                onClick={() => setOpen(false)}
              >
                VER RESEÑA COMPLETA
              </Link>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
