import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/reviews/ReviewCard";
import { getPublicContent } from "@/lib/content";
import { newReviewUrl } from "@/lib/whatsapp";

function Stars({ count, ariaLabel }: { count: number; ariaLabel: string }) {
  return (
    <div className="flex gap-1" aria-label={ariaLabel}>
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

export default async function ReviewsPage() {
  const { site, reviews, pages } = await getPublicContent();
  const page = pages.reviews;
  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const reviewUrl = newReviewUrl(site);

  return (
    <>
      <Header />
      <main className="bg-off-white">
        <section className="mx-auto max-w-[1400px] px-6 pt-16 pb-10 lg:px-12 lg:pt-24">
          <p className="text-[10px] tracking-[0.25em] text-black/40">
            {page.label}
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
            {page.title}
          </h1>
          <p className="mt-6 max-w-xl text-sm text-black/60">
            {page.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-black/10 pt-8">
            <p className="font-serif text-5xl">{average.toFixed(1)}</p>
            <div>
              <Stars
                count={Math.round(average)}
                ariaLabel={page.starsAriaLabel.replace(
                  "{{count}}",
                  String(Math.round(average))
                )}
              />
              <p className="mt-2 text-[10px] tracking-[0.15em] text-black/50">
                {reviews.length} {page.verifiedLabel}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border border-black/10 bg-white p-5">
            <div className="flex-1">
              <p className="text-[10px] tracking-[0.15em] text-black/40">
                {page.clientPromptLabel}
              </p>
              <p className="mt-1 text-sm text-black/70">
                {page.clientPromptDescription}
              </p>
            </div>
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] px-5 py-3 text-[10px] tracking-[0.12em] text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon />
              {page.clientPromptCta}
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12 lg:pb-28">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          <div className="mt-16 border-t border-black/10 pt-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              {page.footerTitle}
            </h2>
            <p className="mt-4 text-sm text-black/60">{page.footerDescription}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/booking"
                className="inline-block bg-black px-10 py-4 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
              >
                {page.footerPrimaryCta}
              </Link>
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-black px-8 py-4 text-[10px] tracking-[0.15em] transition-colors hover:bg-black hover:text-white"
              >
                <WhatsAppIcon className="text-current" />
                {page.footerSecondaryCta}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function WhatsAppIcon({ className = "text-white" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
