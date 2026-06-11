import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublicContent } from "@/lib/content";

export default async function AboutPage() {
  const { site, images, imageAlts, pages } = await getPublicContent();
  const about = pages.about;

  return (
    <>
      <Header />
      <main className="bg-off-white">
        <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-12 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-black/40">
                {about.label}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                {about.title}
              </h1>
              <p className="mt-6 text-sm leading-relaxed text-black/60">
                {about.intro}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-black/60">
                {site.artist.bio}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-black/10 pt-8">
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-black/40">
                    {about.experienceLabel}
                  </p>
                  <p className="mt-2 font-serif text-2xl">
                    {site.artist.experience}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-black/40">
                    {about.stylesLabel}
                  </p>
                  <p className="mt-2 text-sm text-black/60">
                    {site.artist.styles.join(" · ")}
                  </p>
                </div>
              </div>

              <Link
                href="/booking"
                className="mt-10 inline-block bg-black px-8 py-3.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
              >
                {about.cta}
              </Link>
            </div>

            <div className="relative aspect-[3/4] w-full max-w-lg lg:ml-auto">
              <Image
                src={images.services.hero}
                alt={imageAlts.aboutArtist}
                fill
                className="object-cover grayscale"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-white px-6 py-16 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-3">
            <div>
              <h2 className="font-serif text-xl">{about.locationTitle}</h2>
              <p className="mt-3 text-sm text-black/60">{site.location.full}</p>
            </div>
            <div>
              <h2 className="font-serif text-xl">{about.contactTitle}</h2>
              <p className="mt-3 text-sm text-black/60">{site.contact.email}</p>
              <p className="text-sm text-black/60">{site.contact.phone}</p>
            </div>
            <div>
              <h2 className="font-serif text-xl">{about.socialTitle}</h2>
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-black/60 underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                {site.contact.instagramHandle}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
