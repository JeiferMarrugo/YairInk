import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioImage from "@/components/PortfolioImage";
import { getPublicContent } from "@/lib/content";

export default async function HomePage() {
  const { site, images, imageAlts, pages } = await getPublicContent();
  const home = pages.home;

  return (
    <>
      <Header />
      <main>
        <section className="bg-off-white">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12 lg:py-24">
            <div>
              <h1 className="font-serif text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {site.tagline}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-black/70">
                {home.heroDescription}
              </p>
              <Link
                href="/booking"
                className="mt-8 inline-block bg-black px-8 py-3.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
              >
                {home.heroCta}
              </Link>
            </div>

            <div className="relative">
              <div className="relative aspect-[3/4] w-full max-w-lg border border-black/10 lg:ml-auto">
                <Image
                  src={images.hero}
                  alt={imageAlts.hero}
                  fill
                  priority
                  className="object-cover grayscale"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-4 left-4 bg-white px-5 py-4 shadow-sm lg:left-8">
                <p className="text-[9px] tracking-[0.2em] text-black/50">
                  {site.artist.role}
                </p>
                <p className="mt-1 font-serif text-lg">{site.artist.fullName}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black px-6 py-20 text-white lg:px-12 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] tracking-[0.25em] text-white/50">
              {home.philosophyLabel}
            </p>
            <blockquote className="mt-8 font-serif text-2xl leading-snug md:text-3xl lg:text-4xl">
              &ldquo;{site.philosophy}&rdquo;
            </blockquote>
          </div>
        </section>

        <section className="bg-off-white px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl">
                  {home.portfolioTitle}
                </h2>
                <p className="mt-3 max-w-md text-sm text-black/60">
                  {home.portfolioDescription}
                </p>
              </div>
              <Link
                href="/portfolio"
                className="text-[10px] tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                {home.portfolioLink}
              </Link>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
              <PortfolioImage
                src={images.home.geometric}
                alt={imageAlts.homeGeometric}
                className="aspect-[3/4] lg:col-span-3"
              />
              <div className="lg:col-span-5">
                <PortfolioImage
                  src={images.home.botanical}
                  alt={imageAlts.homeBotanical}
                  className="aspect-[3/4] w-full"
                />
                <p className="mt-4 font-serif text-xl italic">
                  {home.investmentLabel}
                </p>
              </div>
              <div className="flex flex-col gap-6 lg:col-span-4">
                <PortfolioImage
                  src={images.home.minimal}
                  alt={imageAlts.homeMinimal}
                  className="aspect-square w-full sm:w-2/3"
                />
                <div className="mt-auto border-t border-black/10 pt-6">
                  {site.pricing.map((item, i) => (
                    <div
                      key={item.title}
                      className={`flex items-start justify-between gap-4 py-4 ${
                        i < site.pricing.length - 1
                          ? "border-b border-black/10"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="text-[10px] tracking-[0.15em]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-black/50">{item.desc}</p>
                      </div>
                      <p className="font-serif text-lg">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-beige px-6 py-20 text-center lg:px-12 lg:py-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl">
              {home.ctaTitle}
            </h2>
            <p className="mt-6 text-sm text-black/60">{home.ctaDescription}</p>
            <Link
              href="/booking"
              className="mt-10 inline-block bg-black px-10 py-4 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
            >
              {home.ctaButton}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
