function isConfigured(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Rellena solo huecos: lo guardado en BD gana; defaults solo si falta o está vacío.
 */
export function mergeWithDefaults<T>(defaults: T, stored: unknown): T {
  if (!isConfigured(stored)) {
    return structuredClone(defaults);
  }

  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) && stored.length > 0
      ? stored
      : defaults) as T;
  }

  if (!isPlainObject(defaults)) {
    return (isConfigured(stored) ? stored : defaults) as T;
  }

  if (!isPlainObject(stored)) {
    return structuredClone(defaults);
  }

  const result = { ...defaults } as Record<string, unknown>;

  for (const key of Object.keys(defaults)) {
    const defaultValue = (defaults as Record<string, unknown>)[key];
    const storedValue = stored[key];

    if (Array.isArray(defaultValue)) {
      result[key] =
        Array.isArray(storedValue) && storedValue.length > 0
          ? storedValue
          : defaultValue;
      continue;
    }

    if (isPlainObject(defaultValue)) {
      result[key] = mergeWithDefaults(defaultValue, storedValue);
      continue;
    }

    result[key] = isConfigured(storedValue) ? storedValue : defaultValue;
  }

  return result as T;
}
