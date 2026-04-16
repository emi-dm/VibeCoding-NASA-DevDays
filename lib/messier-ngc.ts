/** Número NGC principal asociado a cada Messier del catálogo (Ohio State Messier list, J2000). */
export const MESSIER_NGC: Partial<Record<number, number>> = {
  31: 224,
  32: 221,
  33: 598,
  49: 4472,
  51: 5194,
  58: 4579,
  59: 4621,
  60: 4649,
  61: 4303,
  63: 5055,
  64: 4826,
  65: 3623,
  66: 3627,
  74: 628,
  77: 1068,
  81: 3031,
  82: 3034,
  83: 5236,
  84: 4374,
  85: 4382,
  86: 4406,
  87: 4486,
  88: 4501,
  89: 4552,
  90: 4569,
  91: 4548,
  94: 4736,
  95: 3351,
  96: 3368,
  98: 4192,
  99: 4254,
  100: 4321,
  101: 5457,
  102: 5866,
  104: 4594,
  105: 3379,
  106: 4258,
  108: 3556,
  109: 3992,
  110: 205,
};

export function extractMessierCatalogNumber(text: string): number | null {
  const m = text.match(/\bM\s*(\d+)\b/i) ?? text.match(/^M(\d+)$/i);
  if (m) return parseInt(m[1], 10);
  const m2 = text.match(/\bMessier\s*(\d+)\b/i);
  return m2 ? parseInt(m2[1], 10) : null;
}
