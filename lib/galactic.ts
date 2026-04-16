/**
 * Transformación galáctica (l, b) → ecuatorial J2000 (RA, Dec) en grados,
 * matriz IAU / Astropy (vector en cartesianas galácticas → ICRS).
 * @see https://en.wikipedia.org/wiki/Galactic_coordinate_system
 */
const M_ICRS_FROM_GAL = [
  [-0.0548755604024359, 0.4941094277218434, -0.8676661360270043],
  [-0.8734370922346828, -0.4448295864241444, -0.1980763906229225],
  [-0.4838350277553092, 0.7469822517203148, 0.4559837958673508],
] as const;

export function galacticLbToRaDec(lDeg: number, bDeg: number): { raDeg: number; decDeg: number } {
  const l = (lDeg * Math.PI) / 180;
  const b = (bDeg * Math.PI) / 180;
  const cosb = Math.cos(b);
  const sinb = Math.sin(b);
  const cosl = Math.cos(l);
  const sinl = Math.sin(l);
  const xg = cosb * cosl;
  const yg = cosb * sinl;
  const zg = sinb;

  const x =
    M_ICRS_FROM_GAL[0][0] * xg + M_ICRS_FROM_GAL[0][1] * yg + M_ICRS_FROM_GAL[0][2] * zg;
  const y =
    M_ICRS_FROM_GAL[1][0] * xg + M_ICRS_FROM_GAL[1][1] * yg + M_ICRS_FROM_GAL[1][2] * zg;
  const z =
    M_ICRS_FROM_GAL[2][0] * xg + M_ICRS_FROM_GAL[2][1] * yg + M_ICRS_FROM_GAL[2][2] * zg;

  let raDeg = Math.atan2(y, x) * (180 / Math.PI);
  raDeg = (raDeg + 360) % 360;
  const decDeg = Math.asin(Math.max(-1, Math.min(1, z))) * (180 / Math.PI);
  return { raDeg, decDeg };
}

/** Anchura aproximada de la banda galáctica en latitud galáctica (grados). */
export const MILKY_WAY_BAND_WIDTH_DEG = 14;
