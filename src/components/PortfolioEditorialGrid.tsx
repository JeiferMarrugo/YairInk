"use client";

import PortfolioCard, {
  type PortfolioLayoutSpan,
} from "@/components/PortfolioCard";
import type { PortfolioItem } from "@/types/content";

type PortfolioEditorialGridProps = {
  items: PortfolioItem[];
};

function layoutSpan(item: PortfolioItem): PortfolioLayoutSpan {
  const size = item.size;
  if (
    size === "large" ||
    size === "small" ||
    size === "grid" ||
    size === "bottom-left" ||
    size === "bottom-right"
  ) {
    return size;
  }
  return "grid";
}

function pickBySize(items: PortfolioItem[], size: PortfolioLayoutSpan) {
  const index = items.findIndex((item) => layoutSpan(item) === size);
  if (index === -1) return null;
  return items.splice(index, 1)[0];
}

function buildEditorialSections(items: PortfolioItem[]) {
  const pool = [...items];

  const large = pickBySize(pool, "large");
  const small = pickBySize(pool, "small");
  const row1 =
    large && small
      ? [
          { item: large, layout: "large" as const },
          { item: small, layout: "small" as const },
        ]
      : pool.length >= 2
        ? [
            { item: pool.shift()!, layout: "large" as const },
            { item: pool.shift()!, layout: "small" as const },
          ]
        : pool.length === 1
          ? [{ item: pool.shift()!, layout: "large" as const }]
          : [];

  const row2: Array<{ item: PortfolioItem; layout: PortfolioLayoutSpan }> = [];
  for (let i = 0; i < 3; i += 1) {
    const gridItem = pickBySize(pool, "grid");
    if (gridItem) {
      row2.push({ item: gridItem, layout: "grid" });
    } else if (pool.length > 0) {
      row2.push({ item: pool.shift()!, layout: "grid" });
    }
  }

  const bottomLeft = pickBySize(pool, "bottom-left");
  const bottomRight = pickBySize(pool, "bottom-right");
  const row3: Array<{ item: PortfolioItem; layout: PortfolioLayoutSpan }> = [];

  if (bottomLeft) row3.push({ item: bottomLeft, layout: "bottom-left" });
  if (bottomRight) row3.push({ item: bottomRight, layout: "bottom-right" });

  if (row3.length === 0 && pool.length >= 2) {
    row3.push({ item: pool.shift()!, layout: "bottom-left" });
    row3.push({ item: pool.shift()!, layout: "bottom-right" });
  } else if (row3.length === 1 && pool.length > 0) {
    row3.push({ item: pool.shift()!, layout: "bottom-right" });
  }

  const remainder = pool.map((item) => ({
    item,
    layout: layoutSpan(item),
  }));

  return { row1, row2, row3, remainder };
}

export default function PortfolioEditorialGrid({
  items,
}: PortfolioEditorialGridProps) {
  const { row1, row2, row3, remainder } = buildEditorialSections(items);

  return (
    <div className="space-y-12 lg:space-y-16">
      {row1.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {row1.map(({ item, layout }) => (
            <div
              key={item.id}
              className={
                layout === "large" ? "lg:col-span-7" : "lg:col-span-5"
              }
            >
              <PortfolioCard item={item} layout={layout} />
            </div>
          ))}
        </div>
      )}

      {row2.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {row2.map(({ item, layout }) => (
            <PortfolioCard key={item.id} item={item} layout={layout} />
          ))}
        </div>
      )}

      {row3.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {row3.map(({ item, layout }) => (
            <div
              key={item.id}
              className={
                layout === "bottom-left" ? "lg:col-span-5" : "lg:col-span-7"
              }
            >
              <PortfolioCard item={item} layout={layout} />
            </div>
          ))}
        </div>
      )}

      {remainder.length > 0 && (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {remainder.map(({ item, layout }) => (
            <PortfolioCard key={item.id} item={item} layout={layout} />
          ))}
        </div>
      )}
    </div>
  );
}
