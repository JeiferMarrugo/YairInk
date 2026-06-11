import type { BookingFormContent, ImagesConfig } from "@/types/content";

export type EditableSite = {
  name: string;
  tagline: string;
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
  nav: Array<{ href: string; label: string }>;
  pricing: Array<{ title: string; desc: string; price: string }>;
  process: string[];
  philosophy: string;
  copyrightTemplate: string;
  seo: { title: string; description: string };
};

export type EditablePages = {
  home: {
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
    serviceSectionLabel: string;
    philosophyLabel: string;
    philosophyTitle: string;
    philosophyDescription: string;
    philosophyCards: Array<{ title: string; description: string }>;
    hygieneLabel: string;
    hygieneTitle: string;
    hygieneDescription: string;
    hygieneItems: Array<{ icon: string; title: string; desc: string }>;
    ctaTitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    services: Array<{
      number: string;
      title: string;
      description: string;
      bullets: string[];
      imageKey: string;
      imageAlt: string;
      imageLeft: boolean;
      showButton?: boolean;
      buttonLabel?: string;
    }>;
  };
  portfolio: {
    title: string;
    subtitle: string;
    quote: string;
    filterAllLabel: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaLink: string;
  };
  booking: {
    title: string;
    description: string;
    locationTitle: string;
    mapLink: string;
    contactTitle: string;
    scheduleTitle: string;
    processTitle: string;
  };
  reviews: {
    label: string;
    titleTemplate: string;
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
};

export type EditableComponents = {
  header: { ctaLabel: string };
  footer: {
    links: Array<{ href: string; label: string; external: boolean }>;
  };
  bookingForm: BookingFormContent;
};

export type EditableContent = {
  site: EditableSite;
  images: ImagesConfig;
  portfolio_filters: string[];
  pages: EditablePages;
  components: EditableComponents;
};

export const CONTENT_KEYS = [
  "site",
  "images",
  "portfolio_filters",
  "pages",
  "components",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];
