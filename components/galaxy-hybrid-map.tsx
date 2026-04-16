"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { galacticLbToRaDec } from "@/lib/galactic";
import {
  formatDecSexagesimal,
  formatRaSexagesimal,
  messierPrimaryNasaQuery,
  morphologyLabel,
  type GalaxyCatalogEntry,
} from "@/lib/galaxy-catalog";
import { GALACTIC_CENTER_NASA_QUERY, type MapSelection } from "@/lib/map-selection";
import {
  NASA_YEAR_MAX,
  NASA_YEAR_MIN,
  parseYearInput,
  validateYearOrderMessage,
} from "@/lib/nasa-year-input";
import type { SearchNormalized } from "@/lib/nasa-images";

const GC_COORDS = galacticLbToRaDec(0, 0);

const GalaxySphere3D = dynamic(
  () => import("@/components/galaxy-sphere-3d").then((m) => m.GalaxySphere3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(72vh,580px)] min-h-[300px] w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        Cargando esfera celeste 3D…
      </div>
    ),
  },
);

const MORPH_COLOR: Record<GalaxyCatalogEntry["morphology"], string> = {
  spiral: "#6366f1",
  elliptical: "#a855f7",
  lenticular: "#f59e0b",
  irregular: "#14b8a6",
};

function SidebarNasaYearControls({
  draftStart,
  draftEnd,
  setDraftStart,
  setDraftEnd,
  fieldError,
  onApply,
  onClear,
  appliedStart,
  appliedEnd,
}: {
  draftStart: string;
  draftEnd: string;
  setDraftStart: (v: string) => void;
  setDraftEnd: (v: string) => void;
  fieldError: string | null;
  onApply: () => void;
  onClear: () => void;
  appliedStart: number | null;
  appliedEnd: number | null;
}) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Filtro por fecha (NASA)</p>
      <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
        La API de la NASA solo admite <strong className="font-medium text-zinc-700 dark:text-zinc-300">año</strong> (
        {NASA_YEAR_MIN}–{NASA_YEAR_MAX}), no día concreto.
      </p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <div className="flex min-w-[88px] flex-1 flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Desde</label>
          <input
            value={draftStart}
            onChange={(e) => setDraftStart(e.target.value)}
            placeholder="YYYY"
            inputMode="numeric"
            maxLength={4}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex min-w-[88px] flex-1 flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Hasta</label>
          <input
            value={draftEnd}
            onChange={(e) => setDraftEnd(e.target.value)}
            placeholder="YYYY"
            inputMode="numeric"
            maxLength={4}
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      </div>
      {fieldError ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{fieldError}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          Aplicar filtro
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Quitar filtro
        </button>
      </div>
      {appliedStart !== null || appliedEnd !== null ? (
        <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
          Filtro activo: <span className="font-mono">{appliedStart ?? "…"}</span> —{" "}
          <span className="font-mono">{appliedEnd ?? "…"}</span>
        </p>
      ) : null}
    </div>
  );
}

function NasaResultsBlock({ nasa }: { nasa: SearchNormalized }) {
  const yearBits =
    nasa.yearStart !== undefined || nasa.yearEnd !== undefined
      ? ` · Años NASA ${nasa.yearStart ?? "…"}–${nasa.yearEnd ?? "…"}`
      : "";
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {nasa.totalHits.toLocaleString("es-ES")} resultado{nasa.totalHits === 1 ? "" : "s"} en la NASA (página{" "}
        {nasa.page}
        ).{yearBits}
      </p>
      <ul className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {nasa.items.map((item) => (
          <li key={item.nasaId}>
            <Link
              href={`/media/${encodeURIComponent(item.nasaId)}`}
              className="flex gap-3 rounded-xl border border-zinc-100 p-2 transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
            >
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                {item.previewUrl ? (
                  <Image
                    src={item.previewUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-zinc-400">—</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                <p className="text-[10px] uppercase text-zinc-500">{item.mediaType}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {nasa.items.length === 0 ? <p className="text-sm text-zinc-500">Sin resultados para esta consulta.</p> : null}
    </div>
  );
}

export function GalaxyHybridMap() {
  const [selected, setSelected] = useState<MapSelection | null>(null);
  const [nasa, setNasa] = useState<SearchNormalized | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [draftYearStart, setDraftYearStart] = useState("");
  const [draftYearEnd, setDraftYearEnd] = useState("");
  const [appliedYearStart, setAppliedYearStart] = useState<number | null>(null);
  const [appliedYearEnd, setAppliedYearEnd] = useState<number | null>(null);
  const [yearFieldError, setYearFieldError] = useState<string | null>(null);

  useEffect(() => {
    setDraftYearStart("");
    setDraftYearEnd("");
    setAppliedYearStart(null);
    setAppliedYearEnd(null);
    setYearFieldError(null);
  }, [selected]);

  const loadNasaForQuery = useCallback(
    async (q: string, signal: AbortSignal) => {
      setLoading(true);
      setErr(null);
      setNasa(null);
      try {
        const params = new URLSearchParams({
          q,
          page_size: "8",
          media_type: "image,video",
        });
        if (appliedYearStart !== null) {
          params.set("year_start", String(appliedYearStart));
        }
        if (appliedYearEnd !== null) {
          params.set("year_end", String(appliedYearEnd));
        }
        const res = await fetch(`/api/search?${params.toString()}`, { signal });
        const json = (await res.json()) as SearchNormalized & { error?: string };
        if (!res.ok) {
          throw new Error(json.error ?? "Error al consultar la NASA.");
        }
        setNasa(json);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErr(e instanceof Error ? e.message : "Error desconocido.");
      } finally {
        setLoading(false);
      }
    },
    [appliedYearStart, appliedYearEnd],
  );

  useEffect(() => {
    if (!selected) return;
    const ac = new AbortController();
    const q =
      selected.kind === "messier"
        ? messierPrimaryNasaQuery(selected.galaxy.messier)
        : GALACTIC_CENTER_NASA_QUERY;
    void loadNasaForQuery(q, ac.signal);
    return () => ac.abort();
  }, [selected, loadNasaForQuery]);

  const applyYearFilter = () => {
    const ys = draftYearStart.trim() ? parseYearInput(draftYearStart) : null;
    const ye = draftYearEnd.trim() ? parseYearInput(draftYearEnd) : null;
    if (draftYearStart.trim() && ys === null) {
      setYearFieldError(`Año inicial inválido (${NASA_YEAR_MIN}–${NASA_YEAR_MAX}, formato YYYY).`);
      return;
    }
    if (draftYearEnd.trim() && ye === null) {
      setYearFieldError(`Año final inválido (${NASA_YEAR_MIN}–${NASA_YEAR_MAX}, formato YYYY).`);
      return;
    }
    const orderMsg = validateYearOrderMessage(ys, ye);
    if (orderMsg) {
      setYearFieldError(orderMsg);
      return;
    }
    setAppliedYearStart(ys);
    setAppliedYearEnd(ye);
    setYearFieldError(null);
  };

  const clearYearFilter = () => {
    setDraftYearStart("");
    setDraftYearEnd("");
    setAppliedYearStart(null);
    setAppliedYearEnd(null);
    setYearFieldError(null);
  };

  const legend = useMemo(
    () =>
      (Object.keys(MORPH_COLOR) as GalaxyCatalogEntry["morphology"][]).map((m) => (
        <span key={m} className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: MORPH_COLOR[m] }} />
          {morphologyLabel(m)}
        </span>
      )),
    [],
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Esfera celeste en <strong className="font-medium text-zinc-800 dark:text-zinc-200">3D</strong> (Y = polo norte
          celeste). La <strong className="font-medium text-amber-800 dark:text-amber-200">banda dorada</strong> sigue el
          plano galáctico (Vía Láctea); el <strong className="font-medium text-yellow-800 dark:text-yellow-200">Sol</strong>{" "}
          marca el origen heliocéntrico y el <strong className="font-medium text-orange-800 dark:text-orange-200">naranja</strong>{" "}
          el centro galáctico (clic para buscar en la NASA). Las galaxias Messier también son clicables.
        </p>
        <div className="flex flex-wrap gap-4 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
          {legend}
        </div>
        <div onPointerLeave={() => (document.body.style.cursor = "auto")}>
          <GalaxySphere3D selected={selected} onSelect={setSelected} />
        </div>
      </div>

      <aside className="w-full shrink-0 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:w-[380px]">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Datos híbridos</h2>
        {!selected ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Haz clic en una galaxia Messier (esferas de color) o en el{" "}
            <strong className="text-orange-700 dark:text-orange-300">centro galáctico</strong> (esfera naranja) para ver
            coordenadas y resultados en vivo de la NASA.
          </p>
        ) : (
          <>
            <SidebarNasaYearControls
              draftStart={draftYearStart}
              draftEnd={draftYearEnd}
              setDraftStart={setDraftYearStart}
              setDraftEnd={setDraftYearEnd}
              fieldError={yearFieldError}
              onApply={applyYearFilter}
              onClear={clearYearFilter}
              appliedStart={appliedYearStart}
              appliedEnd={appliedYearEnd}
            />
            {selected.kind === "galactic-center" ? (
              <>
                <div className="space-y-1 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <p className="text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
                    Centro galáctico
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Dirección hacia el centro de la Vía Láctea (longitud galáctica l ≈ 0°, latitud b = 0°), en la
                    constelación de Sagitario (región de Sgr A*).
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No es un objeto Messier: es un punto de referencia en el mapa.
                  </p>
                  <dl className="mt-3 space-y-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between gap-2">
                      <dt>l, b</dt>
                      <dd>0°, 0°</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>AR</dt>
                      <dd>{formatRaSexagesimal(GC_COORDS.raDeg)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>AR (°)</dt>
                      <dd>{GC_COORDS.raDeg.toFixed(4)}°</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Dec</dt>
                      <dd>{formatDecSexagesimal(GC_COORDS.decDeg)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Dec (°)</dt>
                      <dd>{GC_COORDS.decDeg.toFixed(4)}°</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    Consulta enviada:{" "}
                    <span className="break-all text-zinc-700 dark:text-zinc-300">{GALACTIC_CENTER_NASA_QUERY}</span>
                    {nasa?.effectiveQuery && nasa.effectiveQuery !== GALACTIC_CENTER_NASA_QUERY ? (
                      <>
                        <br />
                        Índice NASA (efectivo):{" "}
                        <span className="break-all text-zinc-700 dark:text-zinc-300">{nasa.effectiveQuery}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                {loading ? (
                  <p className="text-sm text-zinc-500">Consultando la biblioteca de imágenes de la NASA…</p>
                ) : err ? (
                  <p className="text-sm text-red-700 dark:text-red-300">{err}</p>
                ) : nasa ? (
                  <NasaResultsBlock nasa={nasa} />
                ) : null}
              </>
            ) : (
              <>
                <div className="space-y-1 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                  <p className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                    {selected.galaxy.messier}
                  </p>
                  {selected.galaxy.name ? (
                    <p className="text-base text-zinc-800 dark:text-zinc-200">{selected.galaxy.name}</p>
                  ) : null}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{morphologyLabel(selected.galaxy.morphology)}</p>
                  <dl className="mt-3 space-y-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex justify-between gap-2">
                      <dt>AR</dt>
                      <dd>{formatRaSexagesimal(selected.galaxy.raDeg)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>AR (°)</dt>
                      <dd>{selected.galaxy.raDeg.toFixed(4)}°</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Dec</dt>
                      <dd>{formatDecSexagesimal(selected.galaxy.decDeg)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Dec (°)</dt>
                      <dd>{selected.galaxy.decDeg.toFixed(4)}°</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    Consulta enviada:{" "}
                    <span className="break-all text-zinc-700 dark:text-zinc-300">
                      {messierPrimaryNasaQuery(selected.galaxy.messier)}
                    </span>
                    {nasa?.effectiveQuery &&
                    nasa.effectiveQuery !== messierPrimaryNasaQuery(selected.galaxy.messier) ? (
                      <>
                        <br />
                        Índice NASA (efectivo):{" "}
                        <span className="break-all text-zinc-700 dark:text-zinc-300">{nasa.effectiveQuery}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                {loading ? (
                  <p className="text-sm text-zinc-500">Consultando la biblioteca de imágenes de la NASA…</p>
                ) : err ? (
                  <p className="text-sm text-red-700 dark:text-red-300">{err}</p>
                ) : nasa ? (
                  <NasaResultsBlock nasa={nasa} />
                ) : null}
              </>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
