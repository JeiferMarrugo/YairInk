export type NavLink = { href: string; label: string };

export type PricingItem = { title: string; desc: string; price: string };

export type SiteConfig = {
  name: string;
  tagline: string;
  seo: { title: string; description: string };
  artist: {
    name: string;
    fullName: string;
    role: string;
    bio: string;
    experience: string;
    styles: string[];
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    instagramHandle: string;
  };
  location: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    full: string;
    mapsUrl: string;
  };
  hours: { label: string; schedule: string };
  nav: NavLink[];
  pricing: PricingItem[];
  process: string[];
  philosophy: string;
  copyright: string;
};

export type ImageAltsConfig = {
  hero: string;
  studio: string;
  quote: string;
  homeGeometric: string;
  homeBotanical: string;
  homeMinimal: string;
  aboutArtist: string;
  servicesHero: string;
};

export type ImagesConfig = {
  hero: string;
  studio: string;
  services: {
    fineline: string;
    ornamental: string;
    microRealism: string;
    hero: string;
  };
  home: { geometric: string; botanical: string; minimal: string };
  quote: string;
  alts: ImageAltsConfig;
};

export type PortfolioCategory = "LÍNEA FINA" | "BLACKWORK" | "MINIMALISMO";

export type PortfolioImageSlide = { src: string; alt: string };

export type PortfolioItem = {
  id: string;
  title: string;
  meta: string;
  category: PortfolioCategory;
  src: string;
  alt: string;
  images: PortfolioImageSlide[];
  size: "large" | "small" | "grid" | "bottom-left" | "bottom-right";
  /** Citas completadas vinculadas al portafolio */
  clientName?: string;
  reviewText?: string;
  reviewRating?: number;
  reviewId?: string;
};

export type Review = {
  id: string;
  name: string;
  piece: string;
  rating: number;
  date: string;
  text: string;
  image: string;
  imageAlt: string;
  clientPhone?: string;
};

export type HomePageContent = {
  heroDescription: string;
  heroCta: string;
  philosophyLabel: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioLink: string;
  investmentLabel: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
};

export type AboutPageContent = {
  label: string;
  title: string;
  intro: string;
  experienceLabel: string;
  stylesLabel: string;
  cta: string;
  locationTitle: string;
  contactTitle: string;
  socialTitle: string;
};

export type ServiceBlock = {
  number: string;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  imageLeft: boolean;
  showButton?: boolean;
  buttonLabel?: string;
};

export type ServicesPageContent = {
  heroTitle: string;
  heroDescription: string;
  services: ServiceBlock[];
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

export type PortfolioPageContent = {
  title: string;
  subtitle: string;
  quote: string;
  filterAllLabel: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaLink: string;
};

export type BookingPageContent = {
  title: string;
  description: string;
  locationTitle: string;
  mapLink: string;
  contactTitle: string;
  scheduleTitle: string;
  processTitle: string;
};

export type ReviewsPageContent = {
  label: string;
  title: string;
  description: string;
  starsAriaLabel: string;
  verifiedLabel: string;
  clientPromptLabel: string;
  clientPromptDescription: string;
  clientPromptCta: string;
  footerTitle: string;
  footerDescription: string;
  footerPrimaryCta: string;
  footerSecondaryCta: string;
};

export type FooterLink = {
  href: string;
  label: string;
  external: boolean;
};

export type BookingFormContent = {
  successMessage: string;
  connectionError: string;
  submitLabel: string;
  submittingLabel: string;
  timeOptions: string[];
  fields: {
    fullName: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    phone: { label: string; placeholder: string; hint?: string };
    concept: { label: string; placeholder: string };
    size: { label: string; placeholder: string };
    placement: { label: string; placeholder: string };
    timePreference: { label: string };
    preferredMonth: { label: string };
  };
};

export type PublicContent = {
  site: SiteConfig;
  images: ImagesConfig;
  imageAlts: ImageAltsConfig;
  portfolioFilters: string[];
  portfolioItems: PortfolioItem[];
  reviews: Review[];
  pages: {
    home: HomePageContent;
    about: AboutPageContent;
    services: ServicesPageContent;
    portfolio: PortfolioPageContent;
    booking: BookingPageContent;
    reviews: ReviewsPageContent;
  };
  components: {
    header: { ctaLabel: string };
    footer: { links: FooterLink[] };
    bookingForm: BookingFormContent;
  };
};
