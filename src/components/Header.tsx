"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { usePublicContent } from "@/contexts/PublicContentContext";

export default function Header() {
  const pathname = usePathname();
  const { site, components } = usePublicContent();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-12">
          <Link
            href="/"
            className="font-serif text-base font-semibold tracking-wide sm:text-lg lg:text-xl"
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/booking"
              className="hidden bg-black px-4 py-2 text-[9px] tracking-[0.15em] text-white transition-colors hover:bg-white hover:text-black hover:outline hover:outline-1 hover:outline-black sm:inline-block sm:px-5 sm:py-2.5 sm:text-[10px]"
            >
              {components.header.ctaLabel}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1 border border-black/10 lg:hidden"
              aria-label="Abrir menú"
            >
              <span className="block h-px w-4 bg-black" />
              <span className="block h-px w-4 bg-black" />
              <span className="block h-px w-4 bg-black" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(100vw-2.5rem,20rem)] flex-col bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <p className="font-serif text-lg">{site.name}</p>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center border border-black/10 text-lg leading-none"
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6">
          {site.nav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`mb-1 block border-b border-black/5 py-4 text-[11px] tracking-[0.2em] transition-opacity hover:opacity-60 ${
                  isActive ? "font-medium underline underline-offset-4" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-black/10 p-5">
          <Link
            href="/booking"
            onClick={() => setMenuOpen(false)}
            className="block bg-black py-3.5 text-center text-[10px] tracking-[0.15em] text-white transition-colors hover:bg-black/80"
          >
            {components.header.ctaLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
