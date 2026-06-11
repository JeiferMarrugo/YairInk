import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { getPublicContent } from "@/lib/content";

export default async function BookingPage() {
  const { site, images, imageAlts, pages } = await getPublicContent();
  const booking = pages.booking;

  return (
    <>
      <Header />
      <main className="bg-cream">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-12 lg:grid-cols-[1fr_380px] lg:gap-16 lg:px-12 lg:py-16">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl">{booking.title}</h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-black/60">
              {booking.description}
            </p>

            <div className="mt-10">
              <BookingForm />
            </div>
          </div>

          <aside className="lg:pt-8">
            <div className="relative aspect-[4/5] w-full border border-black/20">
              <div className="absolute -right-2 -top-2 h-full w-full border border-black/30" />
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={images.studio}
                  alt={imageAlts.studio}
                  fill
                  className="object-cover grayscale"
                  sizes="400px"
                />
              </div>
            </div>

            <div className="mt-10 space-y-8">
              <InfoBlock title={booking.locationTitle}>
                <p>{site.location.street}</p>
                <p>
                  {site.location.city}, {site.location.postalCode}
                </p>
                <a
                  href={site.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  {booking.mapLink}
                </a>
              </InfoBlock>

              <InfoBlock title={booking.contactTitle}>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  {site.contact.email.toUpperCase()}
                </a>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="block underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  {site.contact.phone}
                </a>
                <a
                  href={site.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  {site.contact.instagramHandle.toUpperCase()}
                </a>
              </InfoBlock>

              <InfoBlock title={booking.scheduleTitle}>
                <p>{site.hours.schedule}</p>
                <p className="text-black/50">{site.hours.label}</p>
              </InfoBlock>

              <InfoBlock title={booking.processTitle}>
                <ol className="space-y-2">
                  {site.process.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="text-black/30">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </InfoBlock>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-black/20 pt-6">
      <h3 className="text-[10px] tracking-[0.15em]">{title}</h3>
      <div className="mt-3 space-y-1 text-[10px] tracking-[0.1em] text-black/70">
        {children}
      </div>
    </div>
  );
}
