"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { SearchItemNormalized, SearchNormalized } from "@/lib/nasa-images";
import {
  NASA_YEAR_MAX,
  NASA_YEAR_MIN,
  parseYearInput,
  validateYearOrderMessage,
} from "@/lib/nasa-year-input";

type MediaFilter = "image,video" | "image" | "video";

type ValidYears =
  | { ok: true; yearStart: number | null; yearEnd: number | null }
  | { ok: false; message: string };

function validateYearInputs(yearStartInput: string, yearEndInput: string): ValidYears {
  const yearStart = yearStartInput.trim() ? parseYearInput(yearStartInput) : null;
  if (yearStartInput.trim() && yearStart === null) {
    return {
      ok: false,
      message: `Año inicial inválido (${NASA_YEAR_MIN}–${NASA_YEAR_MAX}, formato YYYY).`,
    };
  }

  const yearEnd = yearEndInput.trim() ? parseYearInput(yearEndInput) : null;
  if (yearEndInput.trim() && yearEnd === null) {
    return {
      ok: false,
      message: `Año final inválido (${NASA_YEAR_MIN}–${NASA_YEAR_MAX}, formato YYYY).`,
    };
  }

  const orderError = validateYearOrderMessage(yearStart, yearEnd);
  if (orderError) {
    return { ok: false, message: orderError };
  }

  return { ok: true, yearStart, yearEnd };
}

function buildSearchParams(
  q: string,
  page: number,
  mediaType: MediaFilter,
  yearStart: number | null,
  yearEnd: number | null,
): URLSearchParams {
  const params = new URLSearchParams({
    q,
    page: String(page),
    page_size: "12",
    media_type: mediaType,
  });
  if (yearStart !== null) {
    params.set("year_start", String(yearStart));
  }
  if (yearEnd !== null) {
    params.set("year_end", String(yearEnd));
  }
  return params;
}

function MediaBadge({ type }: { type: SearchItemNormalized["mediaType"] }) {
  const label = type === "video" ? "Vídeo" : type === "audio" ? "Audio" : "Imagen";
  return (
    <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
      {label}
    </span>
  );
}

export function SearchExplorer() {
  const [q, setQ] = useState("nebula");
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<MediaFilter>("image,video");
  const [result, setResult] = useState<SearchNormalized | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Para paginación: misma cadena que resolvió el índice en la página 1 (`effectiveQuery` del API). */
  const resolvedQueryRef = useRef<string | null>(null);
  /** Años aplicados en la última búsqueda desde página 1 (reutilizados en Anterior/Siguiente). */
  const yearStartRef = useRef<number | null>(null);
  const yearEndRef = useRef<number | null>(null);

  const [yearStartInput, setYearStartInput] = useState("");
  const [yearEndInput, setYearEndInput] = useState("");

  const runSearch = useCallback(
    async (nextQ: string, nextPage: number, nextMedia: MediaFilter) => {
      const trimmed = nextQ.trim();
      if (!trimmed) {
        setError("Escribe un término de búsqueda.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const qForApi = nextPage === 1 ? trimmed : (resolvedQueryRef.current ?? trimmed);

        let ys: number | null;
        let ye: number | null;
        if (nextPage === 1) {
          const validYears = validateYearInputs(yearStartInput, yearEndInput);
          if (!validYears.ok) {
            setError(validYears.message);
            return;
          }
          ys = validYears.yearStart;
          ye = validYears.yearEnd;
          yearStartRef.current = ys;
          yearEndRef.current = ye;
        } else {
          ys = yearStartRef.current;
          ye = yearEndRef.current;
        }

        const params = buildSearchParams(qForApi, nextPage, nextMedia, ys, ye);
        const res = await fetch(`/api/search?${params.toString()}`);
        const json = (await res.json()) as SearchNormalized & { error?: string };
        if (!res.ok) {
          throw new Error(json.error ?? "Error al buscar.");
        }
        resolvedQueryRef.current = json.effectiveQuery ?? qForApi;
        setResult(json);
        if (nextPage === 1) {
          setQ(trimmed);
        }
        setPage(nextPage);
        setMediaType(nextMedia);
      } catch (e) {
        setResult(null);
        setError(e instanceof Error ? e.message : "Error desconocido.");
      } finally {
        setLoading(false);
      }
    },
    [yearStartInput, yearEndInput],
  );

  useEffect(() => {
    void runSearch("nebula", 1, "image,video");
  }, [runSearch]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runSearch(q, 1, mediaType);
  };

  const totalLabel = result
    ? `${result.totalHits.toLocaleString("es-ES")} resultado${result.totalHits === 1 ? "" : "s"}`
    : null;

  const yearFilterLabel =
    result && (result.yearStart !== undefined || result.yearEnd !== undefined)
      ? ` · Años NASA ${result.yearStart ?? "…"}–${result.yearEnd ?? "…"}`
      : "";

  return (
    <section className="flex flex-col gap-6">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/60"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label htmlFor="q" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Buscar en la biblioteca de la NASA
            </label>
            <input
              id="q"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej.: James Webb, Marte, nebulosa…"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500/30 placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>
          <div className="flex w-full flex-col gap-2 md:w-48">
            <label htmlFor="media" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Tipo de medio
            </label>
            <select
              id="media"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaFilter)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="image,video">Imágenes y vídeos</option>
              <option value="image">Solo imágenes</option>
              <option value="video">Solo vídeos</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 md:self-end"
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Filtro por año (NASA)</p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Solo años completos ({NASA_YEAR_MIN}–{NASA_YEAR_MAX}). Déjalos vacíos para no filtrar.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 md:gap-4">
            <div className="flex min-w-[100px] flex-1 flex-col gap-1">
              <label htmlFor="year-start" className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                Desde
              </label>
              <input
                id="year-start"
                name="year_start"
                value={yearStartInput}
                onChange={(e) => setYearStartInput(e.target.value)}
                placeholder="YYYY"
                inputMode="numeric"
                maxLength={4}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="flex min-w-[100px] flex-1 flex-col gap-1">
              <label htmlFor="year-end" className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                Hasta
              </label>
              <input
                id="year-end"
                name="year_end"
                value={yearEndInput}
                onChange={(e) => setYearEndInput(e.target.value)}
                placeholder="YYYY"
                inputMode="numeric"
                maxLength={4}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
          {error}
        </p>
      ) : null}

      {result ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {totalLabel}
              {yearFilterLabel}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Página {result.page} · {result.items.length} ítems mostrados
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((item) => (
              <li key={item.nasaId}>
                <Link
                  href={`/media/${encodeURIComponent(item.nasaId)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-700"
                >
                  <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        Sin miniatura
                      </div>
                    )}
                    <div className="absolute left-2 top-2">
                      <MediaBadge type={item.mediaType} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {item.title}
                    </h3>
                    {item.dateCreated ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(item.dateCreated).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => void runSearch(q, page - 1, mediaType)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!result.hasMore || loading}
              onClick={() => void runSearch(q, page + 1, mediaType)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
