import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublicContent } from "@/lib/content";
import type { ServiceBlock } from "@/types/content";

export default async function ServicesPage() {
  const { site, images, imageAlts, pages } = await getPublicContent();
  const content = pages.services;

  return (
    <>
      <Header />
      <main>
        <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h1 className="font-serif text-4xl leading-tight md:text-5xl">
                {content.heroTitle}
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-black/60">
                {content.heroDescription}
              </p>
            </div>
            <div className="relative aspect-square w-full max-w-lg lg:ml-auto">
              <Image
                src={images.services.hero}
                alt={imageAlts.servicesHero}
                fill
                priority
                className="object-cover grayscale"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {content.services.map((service) => (
          <section
            key={service.title}
            className="border-t border-black/10 px-6 py-16 lg:px-12 lg:py-20"
          >
            <div className="mx-auto max-w-[1400px]">
              <p className="mb-10 text-[10px] tracking-[0.2em] text-black/40">
                {service.number} / {content.serviceSectionLabel}
              </p>
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
                {service.imageLeft ? (
                  <>
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={service.image}
                        alt={service.imageAlt}
                        fill
                        className="object-cover grayscale"
                        sizes="50vw"
                      />
                    </div>
                    <ServiceContent service={service} />
                  </>
                ) : (
                  <>
                    <ServiceContent service={service} />
                    <div className="relative aspect-[4/3] w-full border-4 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
                      <Image
                        src={service.image}
                        alt={service.imageAlt}
                        fill
                        className="object-cover grayscale"
                        sizes="50vw"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        ))}

        <section className="bg-beige px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-black/40">
                {content.philosophyLabel}
              </p>
              <h2 className="mt-6 font-serif text-3xl md:text-4xl">
                {content.philosophyTitle}
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-black/60">
                {content.philosophyDescription}
              </p>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {content.philosophyCards.map((card) => (
                  <div key={card.title}>
                    <h3 className="text-[10px] tracking-[0.15em]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs text-black/50">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-black/10 bg-white p-8 lg:p-10">
              <p className="text-[10px] tracking-[0.2em] text-black/40">
                {content.hygieneLabel}
              </p>
              <h3 className="mt-4 font-serif text-xl md:text-2xl">
                {content.hygieneTitle}
              </h3>
              <p className="mt-4 text-sm text-black/60">
                {content.hygieneDescription}
              </p>
              <div className="mt-8 space-y-6">
                {content.hygieneItems.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="mt-0.5 text-sm text-black/30">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[10px] tracking-[0.15em]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-black/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 text-center lg:px-12 lg:py-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl md:text-4xl">
              {content.ctaTitle}
            </h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/booking"
                className="bg-black px-8 py-3.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
              >
                {content.ctaPrimary}
              </Link>
              <Link
                href="/portfolio"
                className="border border-black px-8 py-3.5 text-[10px] tracking-[0.15em] transition-colors hover:bg-black hover:text-white"
              >
                {content.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ServiceContent({ service }: { service: ServiceBlock }) {
  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl">{service.title}</h2>
      <p className="mt-6 text-sm leading-relaxed text-black/60">
        {service.description}
      </p>
      {service.bullets.length > 0 && (
        <ul className="mt-6 space-y-2">
          {service.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-center gap-2 text-[10px] tracking-[0.1em]"
            >
              <span className="h-1.5 w-1.5 bg-black" />
              {bullet}
            </li>
          ))}
        </ul>
      )}
      {service.showButton && service.buttonLabel && (
        <Link
          href="/portfolio"
          className="mt-8 inline-block border border-black px-6 py-3 text-[10px] tracking-[0.15em] transition-colors hover:bg-black hover:text-white"
        >
          {service.buttonLabel}
        </Link>
      )}
    </div>
  );
}
