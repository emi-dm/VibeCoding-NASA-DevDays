/** Límites alineados con la API de imágenes de la NASA (año completo). */
export const NASA_YEAR_MIN = 1800;
export const NASA_YEAR_MAX = 2100;

/** Acepta solo `YYYY` (cuatro dígitos). */
export function parseYearInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (!/^\d{4}$/.test(t)) return null;
  const y = Number.parseInt(t, 10);
  if (y < NASA_YEAR_MIN || y > NASA_YEAR_MAX) return null;
  return y;
}

export function validateYearOrderMessage(
  start: number | null,
  end: number | null,
): string | null {
  if (start !== null && end !== null && start > end) {
    return "El año inicial no puede ser mayor que el año final.";
  }
  return null;
}
