"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  DEFAULT_COUNTRY,
  getPhoneCountryOptions,
  type CountryCode,
} from "@/lib/phone-client";

type PhoneFieldProps = {
  prefix: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultCountry?: CountryCode;
  nationalPlaceholder?: string;
  variant?: "public" | "admin";
};

export default function PhoneField({
  prefix,
  label,
  hint,
  required = true,
  defaultCountry = DEFAULT_COUNTRY,
  nationalPlaceholder = "300 123 4567",
  variant = "admin",
}: PhoneFieldProps) {
  const countries = useMemo(() => getPhoneCountryOptions(), []);
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const countryId = `${prefix}Country`;
  const nationalId = `${prefix}National`;

  const selected =
    countries.find((item) => item.code === country) ??
    countries.find((item) => item.code === DEFAULT_COUNTRY);

  const isPublic = variant === "public";

  const labelClass = isPublic
    ? "text-[10px] tracking-[0.15em]"
    : "mb-1 block text-[9px] tracking-[0.15em] text-black/50";

  const countryWrapClass = isPublic
    ? "relative mt-3 w-full max-w-[12.5rem] shrink-0"
    : "relative w-full max-w-[12.5rem] shrink-0";

  const selectClass = isPublic
    ? "w-full appearance-none border-0 border-b border-black bg-transparent py-2 pl-10 pr-6 text-[10px] tracking-[0.08em] outline-none"
    : "w-full appearance-none border border-black/10 bg-white py-3 pl-10 pr-8 text-sm outline-none focus:border-black/30";

  const inputClass = isPublic
    ? "mt-3 min-w-0 flex-1 border-0 border-b border-black bg-transparent py-2 text-[10px] tracking-[0.1em] placeholder:text-black/30 outline-none"
    : "min-w-0 flex-1 border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30";

  const hintClass = "mt-1.5 text-[9px] tracking-[0.08em] text-black/40";

  const flagWrapClass = isPublic
    ? "pointer-events-none absolute left-0 top-1/2 flex h-[14px] w-[20px] -translate-y-1/2 overflow-hidden rounded-[2px] border border-black/10"
    : "pointer-events-none absolute left-3 top-1/2 flex h-[14px] w-[20px] -translate-y-1/2 overflow-hidden rounded-[2px] border border-black/10";

  const chevronClass = isPublic
    ? "pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-black/40"
    : "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-black/40";

  return (
    <div>
      <label htmlFor={nationalId} className={labelClass}>
        {label}
      </label>
      <div className={`flex items-end gap-3 ${isPublic ? "" : ""}`}>
        <div className={countryWrapClass}>
          {selected && (
            <span className={flagWrapClass} aria-hidden>
              <Image
                src={selected.flagUrl}
                alt=""
                width={20}
                height={14}
                className="h-full w-full object-cover"
                unoptimized
              />
            </span>
          )}
          <span className={chevronClass} aria-hidden>
            ▾
          </span>
          <select
            id={countryId}
            name={countryId}
            value={country}
            onChange={(event) =>
              setCountry(event.target.value as CountryCode)
            }
            aria-label="País"
            className={selectClass}
          >
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <input
          id={nationalId}
          name={`${prefix}National`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          placeholder={nationalPlaceholder}
          className={inputClass}
        />
      </div>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}
