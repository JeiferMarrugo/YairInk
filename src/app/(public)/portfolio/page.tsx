"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioEditorialGrid from "@/components/PortfolioEditorialGrid";
import PortfolioImage from "@/components/PortfolioImage";
import { usePublicContent } from "@/contexts/PublicContentContext";

export default function PortfolioPage() {
  const { portfolioFilters, portfolioItems, images, imageAlts, pages } =
    usePublicContent();
  const page = pages.portfolio;

  const [activeFilter, setActiveFilter] = useState<string>("TODOS");

  const filtered =
    activeFilter === "TODOS"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeFilter);

  const topItems = filtered.slice(0, 5);
  const bottomItems = filtered.slice(5);

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="mx-auto max-w-[1400px] px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:px-12 lg:pt-24 lg:pb-16">
          <h1 className="max-w-4xl font-serif text-4xl leading-[1.05] md:text-5xl lg:text-[3.25rem]">
            {page.title}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-black/55 md:text-base">
            {page.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-2">
            {portfolioFilters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  aria-label={filter === "TODOS" ? page.filterAllLabel : filter}
                  className={`px-5 py-2.5 text-[10px] tracking-[0.15em] transition-colors ${
                    isActive
                      ? "bg-black text-white"
                      : "border border-black/20 text-black hover:border-black"
                  }`}
                >
                  {filter === "TODOS" ? page.filterAllLabel : filter}
                </button>
              );
            })}
          </div>
        </section>

        {filtered.length > 0 ? (
          <>
            <section className="mx-auto max-w-[1400px] px-6 pb-16 lg:px-12 lg:pb-24">
              <PortfolioEditorialGrid items={topItems} />
            </section>

            <section className="mx-auto max-w-[1400px] px-6 lg:px-12">
              <PortfolioImage
                src={images.quote}
                alt={imageAlts.quote}
                className="aspect-[21/9] w-full"
              />
              <blockquote className="py-14 text-center font-serif text-xl italic leading-relaxed text-black/65 md:text-2xl lg:py-20">
                &ldquo;{page.quote}&rdquo;
              </blockquote>
            </section>

            {bottomItems.length > 0 && (
              <section className="mx-auto max-w-[1400px] px-6 pb-16 lg:px-12 lg:pb-24">
                <PortfolioEditorialGrid items={bottomItems} />
              </section>
            )}
          </>
        ) : (
          <section className="mx-auto max-w-[1400px] px-6 pb-16 lg:px-12">
            <p className="text-center text-sm text-black/50">
              No hay piezas en esta categoría.
            </p>
          </section>
        )}

        <section className="border-t border-black/10 bg-off-white">
          <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center lg:px-12 lg:py-20">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl">
                {page.ctaTitle}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-black/55">
                {page.ctaDescription}
              </p>
            </div>
            <Link
              href="/booking"
              className="text-[10px] tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {page.ctaLink}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
