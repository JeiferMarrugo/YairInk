"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import AdminTopBar from "@/components/admin/AdminTopBar";
import WhatsAppSendButton from "@/components/admin/WhatsAppSendButton";
import WhatsAppStatus from "@/components/admin/WhatsAppStatus";
import Avatar, { avatarUrl } from "@/components/ui/Avatar";
import type { Review, SiteConfig } from "@/types/content";

type AdminReviewsClientProps = {
  reviews: Review[];
  site: SiteConfig;
};

export default function AdminReviewsClient({
  reviews,
  site,
}: AdminReviewsClientProps) {
  return (
    <>
      <AdminTopBar searchPlaceholder="Buscar reseñas..." />
      <main className="flex-1 overflow-y-auto bg-off-white p-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Reseñas</h1>
            <p className="mt-1 text-sm text-black/50">
              Gestiona opiniones y solicita feedback por WhatsApp
            </p>
          </div>
          <p className="text-[10px] tracking-[0.15em] text-black/40">
            {reviews.length} RESEÑAS PUBLICADAS
          </p>
        </div>

        <div className="mb-6">
          <WhatsAppStatus />
        </div>

        <div className="grid gap-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-[120px_1fr_auto]"
            >
              <div className="relative aspect-square w-full max-w-[120px] overflow-hidden">
                <Image
                  src={review.image}
                  alt={review.imageAlt}
                  fill
                  className="object-cover grayscale"
                  sizes="120px"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar
                    src={avatarUrl(review.name)}
                    fallback={review.name.slice(0, 2)}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">{review.name}</p>
                    <p className="text-xs text-black/50">{review.piece}</p>
                  </div>
                  <span className="text-[10px] text-black/30">{review.date}</span>
                  <span className="text-xs text-black/40">
                    {"★".repeat(review.rating)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-black/70">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>

              <div className="flex flex-row flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                <Dialog.Root>
                  <Dialog.Trigger asChild>
                    <button
                      type="button"
                      className="border border-black px-4 py-2.5 text-[9px] tracking-[0.12em] transition-colors hover:bg-off-white"
                    >
                      VER TATUAJE
                    </button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[min(94vw,640px)] max-h-[92vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm border border-black/10 bg-white shadow-2xl">
                      <div className="relative flex min-h-[min(45vh,380px)] max-h-[min(68vh,560px)] w-full items-center justify-center bg-off-white px-4 py-6">
                        <div className="relative h-full w-full min-h-[220px]">
                          <Image
                            src={review.image}
                            alt={review.imageAlt}
                            fill
                            className="object-contain"
                            sizes="640px"
                          />
                        </div>
                        <Dialog.Close
                          type="button"
                          aria-label="Cerrar"
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-sm border border-black/15 bg-white text-black shadow-sm hover:bg-black hover:text-white"
                        >
                          ×
                        </Dialog.Close>
                      </div>
                      <div className="shrink-0 border-t border-black/10 px-6 py-5">
                        <p className="text-[9px] tracking-[0.15em] text-black/40">
                          CLIENTE
                        </p>
                        <Dialog.Title className="mt-1 font-serif text-xl">
                          {review.name}
                        </Dialog.Title>
                        <Dialog.Description className="mt-1 text-sm text-black/50">
                          {review.piece} · {review.date}
                        </Dialog.Description>
                        <p className="mt-2 text-xs text-black/40">
                          {"★".repeat(review.rating)}
                        </p>
                        <blockquote className="mt-4 border-t border-black/10 pt-4 text-sm leading-relaxed text-black/70">
                          &ldquo;{review.text}&rdquo;
                        </blockquote>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>

                {review.clientPhone ? (
                  <WhatsAppSendButton
                    phone={review.clientPhone}
                    clientName={review.name}
                    piece={review.piece}
                    site={site}
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed bg-black/20 px-4 py-2.5 text-[9px] tracking-[0.12em] text-black/40"
                  >
                    SIN TELÉFONO
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
