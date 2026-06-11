"use client";

import Link from "next/link";
import DeveloperCredit from "@/components/DeveloperCredit";
import { usePublicContent } from "@/contexts/PublicContentContext";

type FooterProps = {
  /** Tema del footer principal — la barra de crédito contrasta automáticamente */
  theme?: "light" | "dark";
};

export default function Footer({ theme = "light" }: FooterProps) {
  const { site, components } = usePublicContent();

  const isDark = theme === "dark";

  return (
    <footer
      className={
        isDark
          ? "border-t border-white/10 bg-black text-white"
          : "border-t border-black/10 bg-white text-black"
      }
    >
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row lg:px-12">
        <Link
          href="/"
          className={`font-serif text-base font-semibold tracking-wide transition-opacity hover:opacity-70 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {site.name}
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {components.footer.links.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[9px] tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-60 ${
                  isDark ? "text-white/80" : "text-black"
                }`}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[9px] tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-60 ${
                  isDark ? "text-white/80" : "text-black"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <p
          className={`text-[9px] tracking-[0.15em] ${
            isDark ? "text-white/70" : "text-black/70"
          }`}
        >
          {site.copyright}
        </p>
      </div>

      <DeveloperCredit
        barClassName={isDark ? "bg-white text-black" : "bg-black text-white"}
        textClassName={isDark ? "text-black/70" : "text-white/75"}
        logoInverted={!isDark}
        href="https://example.com"
      />
    </footer>
  );
}
