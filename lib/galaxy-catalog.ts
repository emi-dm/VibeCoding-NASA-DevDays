/**
 * Catálogo estático: galaxias del catálogo Messier (tipos SpG, ElG, IrG, S0G).
 * Coordenadas ecuatoriales J2000 aproximadas (RA en grados 0–360, Dec −90…+90),
 * derivadas de tablas estándar (p. ej. Ohio State Messier list).
 *
 * Las imágenes y metadatos enriquecidos al seleccionar un punto se obtienen de la
 * NASA Image and Video Library vía /api/search (no forma parte de este JSON).
 */
export type GalaxyMorphology = "spiral" | "elliptical" | "lenticular" | "irregular";

export type GalaxyCatalogEntry = {
  messier: string;
  /** Nombre corto en español (puede estar vacío) */
  name: string;
  raDeg: number;
  decDeg: number;
  morphology: GalaxyMorphology;
};

/** Consulta inicial para la NASA (`M31`, …). El servidor `/api/search` prueba variantes si no hay resultados. */
export function messierPrimaryNasaQuery(messier: string): string {
  const m = messier.match(/^M(\d+)$/i);
  if (!m) return messier.trim();
  return `M${parseInt(m[1], 10)}`;
}

export const GALAXY_CATALOG: GalaxyCatalogEntry[] = [
  { messier: "M31", name: "Andrómeda", raDeg: 10.675, decDeg: 41.26667, morphology: "spiral" },
  { messier: "M32", name: "Satélite de Andrómeda", raDeg: 10.675, decDeg: 40.86667, morphology: "elliptical" },
  { messier: "M33", name: "Triángulo", raDeg: 23.475, decDeg: 30.65, morphology: "spiral" },
  { messier: "M49", name: "", raDeg: 187.45, decDeg: 8.0, morphology: "elliptical" },
  { messier: "M51", name: "Remolino", raDeg: 202.475, decDeg: 47.2, morphology: "spiral" },
  { messier: "M58", name: "", raDeg: 189.425, decDeg: 11.81667, morphology: "spiral" },
  { messier: "M59", name: "", raDeg: 190.5, decDeg: 11.65, morphology: "elliptical" },
  { messier: "M60", name: "", raDeg: 190.925, decDeg: 11.55, morphology: "elliptical" },
  { messier: "M61", name: "", raDeg: 185.475, decDeg: 4.46667, morphology: "spiral" },
  { messier: "M63", name: "Girasol", raDeg: 198.95, decDeg: 42.03333, morphology: "spiral" },
  { messier: "M64", name: "Ojo negro", raDeg: 194.175, decDeg: 21.68333, morphology: "spiral" },
  { messier: "M65", name: "", raDeg: 169.725, decDeg: 13.08333, morphology: "spiral" },
  { messier: "M66", name: "", raDeg: 170.05, decDeg: 12.98333, morphology: "spiral" },
  { messier: "M74", name: "", raDeg: 24.175, decDeg: 15.78333, morphology: "spiral" },
  { messier: "M77", name: "", raDeg: 40.675, decDeg: -0.01667, morphology: "spiral" },
  { messier: "M81", name: "Bode", raDeg: 148.9, decDeg: 69.06667, morphology: "spiral" },
  { messier: "M82", name: "Cigarro", raDeg: 148.95, decDeg: 69.68333, morphology: "irregular" },
  { messier: "M83", name: "Molinete austral", raDeg: 204.25, decDeg: -29.86667, morphology: "spiral" },
  { messier: "M84", name: "", raDeg: 186.275, decDeg: 12.88333, morphology: "lenticular" },
  { messier: "M85", name: "", raDeg: 186.35, decDeg: 18.18333, morphology: "lenticular" },
  { messier: "M86", name: "", raDeg: 186.55, decDeg: 12.95, morphology: "lenticular" },
  { messier: "M87", name: "Virgo A", raDeg: 187.7, decDeg: 12.4, morphology: "elliptical" },
  { messier: "M88", name: "", raDeg: 188.0, decDeg: 14.41667, morphology: "spiral" },
  { messier: "M89", name: "", raDeg: 188.925, decDeg: 12.55, morphology: "elliptical" },
  { messier: "M90", name: "", raDeg: 189.2, decDeg: 13.16667, morphology: "spiral" },
  { messier: "M91", name: "", raDeg: 188.85, decDeg: 14.5, morphology: "spiral" },
  { messier: "M94", name: "", raDeg: 192.725, decDeg: 41.11667, morphology: "spiral" },
  { messier: "M95", name: "", raDeg: 161.0, decDeg: 11.7, morphology: "spiral" },
  { messier: "M96", name: "", raDeg: 161.7, decDeg: 11.81667, morphology: "spiral" },
  { messier: "M98", name: "", raDeg: 183.45, decDeg: 14.9, morphology: "spiral" },
  { messier: "M99", name: "", raDeg: 184.7, decDeg: 14.41667, morphology: "spiral" },
  { messier: "M100", name: "", raDeg: 185.725, decDeg: 15.81667, morphology: "spiral" },
  { messier: "M101", name: "Molinete", raDeg: 210.8, decDeg: 54.35, morphology: "spiral" },
  { messier: "M102", name: "", raDeg: 226.625, decDeg: 55.76667, morphology: "lenticular" },
  { messier: "M104", name: "Sombrero", raDeg: 190.0, decDeg: -11.61667, morphology: "spiral" },
  { messier: "M105", name: "", raDeg: 161.95, decDeg: 12.58333, morphology: "elliptical" },
  { messier: "M106", name: "", raDeg: 184.75, decDeg: 47.3, morphology: "spiral" },
  { messier: "M108", name: "", raDeg: 167.875, decDeg: 55.66667, morphology: "spiral" },
  { messier: "M109", name: "", raDeg: 179.4, decDeg: 53.38333, morphology: "spiral" },
  { messier: "M110", name: "Satélite de Andrómeda", raDeg: 10.1, decDeg: 41.68333, morphology: "elliptical" },
];

const MORPH_LABELS: Record<GalaxyMorphology, string> = {
  spiral: "Espiral",
  elliptical: "Elíptica",
  lenticular: "Lenticular (S0)",
  irregular: "Irregular",
};

export function morphologyLabel(m: GalaxyMorphology): string {
  return MORPH_LABELS[m];
}

/** Proyección plate carrée: RA 0…360° → x, Dec −90…+90° → y (viewBox altura para polo sur arriba visual: y crece hacia sur celeste típico mapa) */
export function radecToMapXY(
  raDeg: number,
  decDeg: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const x = (raDeg / 360) * width;
  const y = ((90 - decDeg) / 180) * height;
  return { x, y };
}

/**
 * Posición en la esfera celeste unidad (Three.js: Y = polo norte celeste).
 * RA en grados [0,360), Dec en grados [-90,+90].
 */
export function radecToCartesian(raDeg: number, decDeg: number): { x: number; y: number; z: number } {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  const cosDec = Math.cos(dec);
  return {
    x: cosDec * Math.cos(ra),
    y: Math.sin(dec),
    z: cosDec * Math.sin(ra),
  };
}

export function formatRaSexagesimal(raDeg: number): string {
  const raHours = raDeg / 15;
  const h = Math.floor(raHours);
  const mFloat = (raHours - h) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${h}h ${m}m ${s}s`;
}

export function formatDecSexagesimal(decDeg: number): string {
  const sign = decDeg >= 0 ? "+" : "−";
  const ad = Math.abs(decDeg);
  const d = Math.floor(ad);
  const mFloat = (ad - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${sign}${d}° ${m}′ ${s}″`;
}
