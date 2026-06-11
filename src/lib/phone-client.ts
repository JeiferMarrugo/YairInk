import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

export type { CountryCode };

export const DEFAULT_COUNTRY: CountryCode = "CO";

const PRIORITY_COUNTRIES: CountryCode[] = [
  "CO",
  "US",
  "MX",
  "ES",
  "AR",
  "PE",
  "CL",
  "EC",
  "VE",
  "BR",
  "PA",
  "CR",
  "DO",
  "GT",
  "BO",
];

export type PhoneCountryOption = {
  code: CountryCode;
  flagUrl: string;
  label: string;
  shortLabel: string;
  callingCode: string;
};

export function getFlagUrl(code: CountryCode): string {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export type PhoneValidationResult =
  | { ok: true; e164: string; display: string; whatsapp: string }
  | { ok: false; error: string };

let cachedCountryOptions: PhoneCountryOption[] | null = null;

export function getPhoneCountryOptions(): PhoneCountryOption[] {
  if (cachedCountryOptions) return cachedCountryOptions;

  const labels = new Intl.DisplayNames(["es"], { type: "region" });
  const all = getCountries();
  const priority = PRIORITY_COUNTRIES.filter((code) => all.includes(code));
  const rest = all
    .filter((code) => !priority.includes(code))
    .sort((a, b) =>
      (labels.of(a) ?? a).localeCompare(labels.of(b) ?? "", "es")
    );

  cachedCountryOptions = [...priority, ...rest].map((code) => {
    const name = labels.of(code) ?? code;
    const callingCode = getCountryCallingCode(code);
    return {
      code,
      flagUrl: getFlagUrl(code),
      label: `${name} (+${callingCode})`,
      shortLabel: `${name} (+${callingCode})`,
      callingCode,
    };
  });

  return cachedCountryOptions;
}

export function combinePhone(country: CountryCode, national: string): string {
  const digits = national.replace(/\D/g, "");
  if (!digits) return "";
  return `+${getCountryCallingCode(country)}${digits}`;
}

export function validatePhone(
  input: string,
  defaultCountry: CountryCode = DEFAULT_COUNTRY
): PhoneValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, error: "El teléfono es obligatorio." };
  }

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);

  if (!parsed || !parsed.isValid()) {
    return {
      ok: false,
      error: "Introduce un número válido para el país seleccionado.",
    };
  }

  return {
    ok: true,
    e164: parsed.format("E.164"),
    display: parsed.formatInternational(),
    whatsapp: parsed.number.replace("+", ""),
  };
}

export function validatePhoneFields(
  country: CountryCode,
  national: string
): PhoneValidationResult {
  const trimmedNational = national.trim();
  if (!trimmedNational) {
    return { ok: false, error: "El teléfono es obligatorio." };
  }

  return validatePhone(combinePhone(country, trimmedNational), country);
}

export function validatePhoneFromForm(
  form: FormData,
  prefix: string
): PhoneValidationResult {
  const country = String(
    form.get(`${prefix}Country`) ?? DEFAULT_COUNTRY
  ) as CountryCode;
  const national = String(form.get(`${prefix}National`) ?? "");
  return validatePhoneFields(country, national);
}
