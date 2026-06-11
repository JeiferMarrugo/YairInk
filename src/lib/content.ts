import { cache } from "react";
import { query } from "@/lib/db";
import type {
  AboutPageContent,
  BookingFormContent,
  FooterLink,
  HomePageContent,
  ImageAltsConfig,
  ImagesConfig,
  PortfolioItem,
  PortfolioPageContent,
  PublicContent,
  Review,
  ReviewsPageContent,
  ServicesPageContent,
  SiteConfig,
  BookingPageContent,
} from "@/types/content";

type ContentRow = { key: string; value: unknown };

type SiteRow = Omit<SiteConfig, "copyright"> & {
  copyrightTemplate: string;
};

type PagesRow = {
  home: HomePageContent;
  about: {
    label: string;
    title: string;
    introTemplate: string;
    experienceLabel: string;
    stylesLabel: string;
    cta: string;
    locationTitle: string;
    contactTitle: string;
    socialTitle: string;
  };
  services: {
    heroTitle: string;
    heroDescription: string;
    services: Array<{
      number: string;
      title: string;
      description: string;
      bullets: string[];
      imageKey: keyof ImagesConfig["services"];
      imageAlt: string;
      imageLeft: boolean;
      showButton?: boolean;
      buttonLabel?: string;
    }>;
    philosophyLabel: string;
    philosophyTitle: string;
    philosophyDescription: string;
    philosophyCards: { title: string; description: string }[];
    hygieneLabel: string;
    hygieneTitle: string;
    hygieneDescription: string;
    hygieneItems: { icon: string; title: string; desc: string }[];
    ctaTitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    serviceSectionLabel: string;
  };
  portfolio: PortfolioPageContent;
  booking: BookingPageContent;
  reviews: Omit<ReviewsPageContent, "title" | "starsAriaLabel"> & {
    titleTemplate: string;
    starsAriaLabel: string;
  };
};

type ComponentsRow = {
  header: { ctaLabel: string };
  footer: {
    links: Array<{ href: string; label: string; external: boolean }>;
  };
  bookingForm: BookingFormContent;
};

function fillTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

async function loadContentMap(): Promise<Map<string, unknown>> {
  const rows = await query<ContentRow>(
    "SELECT key, value FROM site_content ORDER BY key"
  );
  return new Map(rows.map((row) => [row.key, row.value]));
}

async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  const rows = await query<{
    id: string;
    title: string;
    meta: string;
    category: string;
    src: string;
    alt: string;
    layout_size: string;
    images: Array<{ src: string; alt: string }> | null;
    client_name: string | null;
    review_text: string | null;
    review_rating: number | null;
    review_id: string | null;
  }>(
    `SELECT p.id, p.title, p.meta, p.category, p.src, p.alt, p.layout_size, p.images,
            a.client_name,
            r.text AS review_text,
            r.rating AS review_rating,
            r.id AS review_id
     FROM portfolio_items p
     LEFT JOIN appointments a ON a.id = p.appointment_id
     LEFT JOIN reviews r ON r.appointment_id = p.appointment_id AND r.is_published = TRUE
     WHERE p.is_published = TRUE
     ORDER BY
       CASE WHEN r.id IS NOT NULL THEN 0 ELSE 1 END,
       p.sort_order ASC`
  );

  return rows.map((row) => {
    const gallery =
      row.images && row.images.length > 0
        ? row.images
        : [{ src: row.src, alt: row.alt }];

    return {
      id: row.id,
      title: row.title,
      meta: row.meta,
      category: row.category as PortfolioItem["category"],
      src: gallery[0].src,
      alt: gallery[0].alt,
      images: gallery,
      size: row.layout_size as PortfolioItem["size"],
      clientName: row.client_name ?? undefined,
      reviewText: row.review_text ?? undefined,
      reviewRating: row.review_rating ?? undefined,
      reviewId: row.review_id ?? undefined,
    };
  });
}

async function loadReviews(): Promise<Review[]> {
  const rows = await query<{
    id: string;
    name: string;
    piece: string;
    rating: number;
    review_date: string;
    text: string;
    image: string;
    image_alt: string;
    client_phone: string | null;
  }>(
    `SELECT id, name, piece, rating, review_date, text, image, image_alt, client_phone
     FROM reviews
     WHERE is_published = TRUE
     ORDER BY sort_order ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    piece: row.piece,
    rating: row.rating,
    date: row.review_date,
    text: row.text,
    image: row.image,
    imageAlt: row.image_alt,
    clientPhone: row.client_phone ?? undefined,
  }));
}

function buildSite(raw: SiteRow): SiteConfig {
  return {
    name: raw.name,
    tagline: raw.tagline,
    seo: raw.seo ?? {
      title: `${raw.name} — Estudio de Tatuaje Fine Line`,
      description: raw.tagline,
    },
    artist: raw.artist,
    contact: raw.contact,
    location: raw.location,
    hours: raw.hours,
    nav: raw.nav,
    pricing: raw.pricing,
    process: raw.process,
    philosophy: raw.philosophy,
    copyright: raw.copyrightTemplate.replace(
      "{{year}}",
      String(new Date().getFullYear())
    ),
  };
}

function buildAbout(raw: PagesRow["about"], site: SiteConfig): AboutPageContent {
  return {
    label: raw.label,
    title: raw.title,
    intro: fillTemplate(raw.introTemplate, {
      siteName: site.name,
      artistName: site.artist.name,
    }),
    experienceLabel: raw.experienceLabel,
    stylesLabel: raw.stylesLabel,
    cta: raw.cta,
    locationTitle: raw.locationTitle,
    contactTitle: raw.contactTitle,
    socialTitle: raw.socialTitle,
  };
}

function buildServices(
  raw: PagesRow["services"],
  site: SiteConfig,
  images: ImagesConfig
): ServicesPageContent {
  return {
    heroTitle: raw.heroTitle,
    heroDescription: fillTemplate(raw.heroDescription, {
      artistName: site.artist.name,
    }),
    serviceSectionLabel: raw.serviceSectionLabel,
    philosophyLabel: raw.philosophyLabel,
    philosophyTitle: raw.philosophyTitle,
    philosophyDescription: raw.philosophyDescription,
    philosophyCards: raw.philosophyCards,
    hygieneLabel: raw.hygieneLabel,
    hygieneTitle: raw.hygieneTitle,
    hygieneDescription: raw.hygieneDescription,
    hygieneItems: raw.hygieneItems,
    ctaTitle: raw.ctaTitle,
    ctaPrimary: raw.ctaPrimary,
    ctaSecondary: raw.ctaSecondary,
    services: raw.services.map((service) => ({
      number: service.number,
      title: service.title,
      description: service.description,
      bullets: service.bullets,
      image: images.services[service.imageKey],
      imageAlt: service.imageAlt,
      imageLeft: service.imageLeft,
      showButton: service.showButton,
      buttonLabel: service.buttonLabel,
    })),
  };
}

function buildImageAlts(
  raw: ImagesConfig,
  site: SiteConfig
): ImageAltsConfig {
  const vars = {
    siteName: site.name,
    artistName: site.artist.name,
    artistFullName: site.artist.fullName,
  };
  const alts = raw.alts ?? {
    hero: "Tatuaje fine line de {{artistName}}",
    studio: "Interior del estudio {{siteName}}",
    quote: "Estación de trabajo del estudio {{siteName}}",
    homeGeometric: "Tatuaje geométrico en hombro",
    homeBotanical: "Tatuaje botánico en antebrazo",
    homeMinimal: "Tatuaje minimalista",
    aboutArtist: "{{artistFullName}} tatuando",
    servicesHero: "{{artistFullName}} trabajando",
  };

  return {
    hero: fillTemplate(alts.hero, vars),
    studio: fillTemplate(alts.studio, vars),
    quote: fillTemplate(alts.quote, vars),
    homeGeometric: fillTemplate(alts.homeGeometric, vars),
    homeBotanical: fillTemplate(alts.homeBotanical, vars),
    homeMinimal: fillTemplate(alts.homeMinimal, vars),
    aboutArtist: fillTemplate(alts.aboutArtist, vars),
    servicesHero: fillTemplate(alts.servicesHero, vars),
  };
}

function buildReviewsPage(
  raw: PagesRow["reviews"],
  site: SiteConfig
): ReviewsPageContent {
  return {
    label: raw.label,
    title: fillTemplate(raw.titleTemplate, { artistName: site.artist.name }),
    description: raw.description,
    starsAriaLabel: raw.starsAriaLabel ?? "{{count}} de 5 estrellas",
    verifiedLabel: raw.verifiedLabel,
    clientPromptLabel: raw.clientPromptLabel,
    clientPromptDescription: raw.clientPromptDescription,
    clientPromptCta: raw.clientPromptCta,
    footerTitle: raw.footerTitle,
    footerDescription: raw.footerDescription,
    footerPrimaryCta: raw.footerPrimaryCta,
    footerSecondaryCta: raw.footerSecondaryCta,
  };
}

function buildFooterLinks(
  links: ComponentsRow["footer"]["links"],
  site: SiteConfig
): FooterLink[] {
  return links.map((link) => ({
    ...link,
    href: fillTemplate(link.href, { instagramUrl: site.contact.instagram }),
  }));
}

async function loadPublicContentUncached(): Promise<PublicContent> {
  const map = await loadContentMap();

  if (!map.has("site")) {
    throw new Error(
      "Contenido del sitio no encontrado. Ejecuta: npm run db:seed-content"
    );
  }

  const site = buildSite(map.get("site") as SiteRow);
  const images = map.get("images") as ImagesConfig;
  const imageAlts = buildImageAlts(images, site);
  const portfolioFilters = map.get("portfolio_filters") as string[];
  const pages = map.get("pages") as PagesRow;
  const components = map.get("components") as ComponentsRow;

  const [portfolioItems, reviews] = await Promise.all([
    loadPortfolioItems(),
    loadReviews(),
  ]);

  return {
    site,
    images,
    imageAlts,
    portfolioFilters,
    portfolioItems,
    reviews,
    pages: {
      home: pages.home,
      about: buildAbout(pages.about, site),
      services: buildServices(pages.services, site, images),
      portfolio: pages.portfolio,
      booking: pages.booking,
      reviews: buildReviewsPage(pages.reviews, site),
    },
    components: {
      header: components.header,
      footer: { links: buildFooterLinks(components.footer.links, site) },
      bookingForm: components.bookingForm,
    },
  };
}

export const getPublicContent = cache(loadPublicContentUncached);

export async function getSiteConfig(): Promise<SiteConfig> {
  const { site } = await getPublicContent();
  return site;
}

export async function getReviews(): Promise<Review[]> {
  const { reviews } = await getPublicContent();
  return reviews;
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const { portfolioItems } = await getPublicContent();
  return portfolioItems;
}
