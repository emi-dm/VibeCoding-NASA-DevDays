import { extractMessierCatalogNumber, MESSIER_NGC } from "@/lib/messier-ngc";

/**
 * Variantes de búsqueda para la NASA Image Library: muchas cadenas largas o con "galaxy"
 * devuelven 0 resultados (AND implícito). Orden: original, M{n}, Messier {n}, número NGC.
 */
export function buildNasaImageSearchAttempts(primaryQuery: string): string[] {
  const q = primaryQuery.trim();
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (s: string) => {
    const t = s.trim();
    const k = t.toLowerCase();
    if (!t || seen.has(k)) return;
    seen.add(k);
    out.push(t);
  };

  add(q);

  const n = extractMessierCatalogNumber(q);
  if (n !== null) {
    add(`M${n}`);
    const ngc = MESSIER_NGC[n];
    if (ngc !== undefined) {
      add(String(ngc));
    }
    add(`Messier ${n}`);
  }

  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 6) {
    add(words.slice(0, 4).join(" "));
    add(words.slice(0, 2).join(" "));
  } else if (words.length > 4) {
    add(words.slice(0, 3).join(" "));
    add(words.slice(0, 2).join(" "));
  }

  return out.slice(0, 8);
}
