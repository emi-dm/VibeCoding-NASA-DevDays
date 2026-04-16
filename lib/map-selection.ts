import type { GalaxyCatalogEntry } from "@/lib/galaxy-catalog";

export type MapSelection =
  | { kind: "messier"; galaxy: GalaxyCatalogEntry }
  | { kind: "galactic-center" };

/**
 * Consulta inicial para el centro galáctico. Cadenas muy largas suelen devolver 0 resultados
 * (la API trata los términos como AND). `galactic center` devuelve cientos de ítems.
 */
export const GALACTIC_CENTER_NASA_QUERY = "galactic center";
