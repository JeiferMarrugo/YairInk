import { STUDIO_CURRENCY, STUDIO_LOCALE, STUDIO_TIMEZONE } from "@/lib/availability-config";

/** Monto en pesos colombianos (enteros). */
export function formatCurrency(pesos: number): string {
  return new Intl.NumberFormat(STUDIO_LOCALE, {
    style: "currency",
    currency: STUDIO_CURRENCY,
    maximumFractionDigits: 0,
  }).format(pesos);
}

/** @deprecated Usa formatCurrency */
export const formatEuros = formatCurrency;

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatSessionDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(STUDIO_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: STUDIO_TIMEZONE,
  });
}
