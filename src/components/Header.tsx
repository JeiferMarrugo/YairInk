"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePublicContent } from "@/contexts/PublicContentContext";

export default function Header() {
  const pathname = usePathname();
  const { site, components } = usePublicContent();

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-12">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-wide lg:text-xl"
        >
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {site.nav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] tracking-[0.2em] transition-opacity hover:opacity-60 ${
                  isActive ? "underline underline-offset-4" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/booking"
          className="bg-black px-5 py-2.5 text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-black hover:outline hover:outline-1 hover:outline-black"
        >
          {components.header.ctaLabel}
        </Link>
      </div>
    </header>
  );
}
