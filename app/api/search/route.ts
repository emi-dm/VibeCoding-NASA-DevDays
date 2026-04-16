import { NextResponse } from "next/server";
import { NASA_YEAR_MAX, NASA_YEAR_MIN, parseYearInput } from "@/lib/nasa-year-input";
import { buildNasaImageSearchAttempts } from "@/lib/nasa-search-fallback";
import {
  NASA_IMAGES_API,
  normalizeSearchResponse,
  type SearchCollectionRaw,
} from "@/lib/nasa-images";

const MAX_PAGE_SIZE = 24;

function errorMessage(status: number): string {
  if (status === 429) {
    return "Demasiadas peticiones a la NASA. Espera un momento e inténtalo de nuevo.";
  }
  if (status >= 500) {
    return "El servicio de la NASA no está disponible temporalmente.";
  }
  return "No se pudo completar la búsqueda.";
}

function parseYearParam(value: string | null): number | null {
  return parseYearInput(value ?? "");
}

type YearFilter = { yearStart: number | null; yearEnd: number | null };

async function fetchNasaSearchJson(
  q: string,
  page: number,
  pageSize: number,
  mediaType: string,
  years: YearFilter,
): Promise<{ ok: boolean; status: number; raw: SearchCollectionRaw | null }> {
  const nasaUrl = new URL("/search", NASA_IMAGES_API);
  nasaUrl.searchParams.set("q", q);
  nasaUrl.searchParams.set("page", String(page));
  nasaUrl.searchParams.set("page_size", String(pageSize));
  nasaUrl.searchParams.set("media_type", mediaType);
  if (years.yearStart !== null) {
    nasaUrl.searchParams.set("year_start", String(years.yearStart));
  }
  if (years.yearEnd !== null) {
    nasaUrl.searchParams.set("year_end", String(years.yearEnd));
  }

  let upstream: Response;
  try {
    upstream = await fetch(nasaUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
  } catch {
    return { ok: false, status: 502, raw: null };
  }

  if (!upstream.ok) {
    return { ok: false, status: upstream.status, raw: null };
  }

  try {
    const raw = (await upstream.json()) as SearchCollectionRaw;
    return { ok: true, status: upstream.status, raw };
  } catch {
    return { ok: false, status: 502, raw: null };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json(
      { error: "Falta el parámetro de búsqueda (q)." },
      { status: 400 },
    );
  }

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSizeRaw = Number(searchParams.get("page_size") ?? "12") || 12;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), MAX_PAGE_SIZE);

  const media = searchParams.get("media_type");
  const mediaType =
    media === "image" || media === "video" || media === "audio"
      ? media
      : "image,video";

  const rawYearStart = searchParams.get("year_start");
  const rawYearEnd = searchParams.get("year_end");
  if (
    (rawYearStart && rawYearStart.trim() !== "" && parseYearInput(rawYearStart) === null) ||
    (rawYearEnd && rawYearEnd.trim() !== "" && parseYearInput(rawYearEnd) === null)
  ) {
    return NextResponse.json(
      { error: `Año inválido. Usa cuatro dígitos (${NASA_YEAR_MIN}–${NASA_YEAR_MAX}).` },
      { status: 400 },
    );
  }

  const yearStart = parseYearParam(rawYearStart);
  const yearEnd = parseYearParam(rawYearEnd);
  if (
    yearStart !== null &&
    yearEnd !== null &&
    yearStart > yearEnd
  ) {
    return NextResponse.json(
      { error: "year_start no puede ser mayor que year_end." },
      { status: 400 },
    );
  }
  const years: YearFilter = { yearStart, yearEnd };

  const attempts = page === 1 ? buildNasaImageSearchAttempts(q) : [q];

  let lastHttpError: { status: number; message: string } | null = null;
  let lastSuccess: { body: ReturnType<typeof normalizeSearchResponse>; attempt: string } | null = null;

  for (const attempt of attempts) {
    const { ok, status, raw } = await fetchNasaSearchJson(attempt, page, pageSize, mediaType, years);
    if (!ok || !raw) {
      lastHttpError = { status: status >= 500 ? 502 : status, message: errorMessage(status) };
      continue;
    }

    const body = normalizeSearchResponse(raw, page, pageSize);
    lastSuccess = { body, attempt };

    if (page === 1 && body.totalHits === 0 && attempt !== attempts[attempts.length - 1]) {
      continue;
    }
    break;
  }

  if (!lastSuccess) {
    return NextResponse.json(
      { error: lastHttpError?.message ?? "No hay conexión con la API de imágenes de la NASA." },
      { status: lastHttpError?.status ?? 502 },
    );
  }

  const { body, attempt } = lastSuccess;
  const effectiveQuery = attempt;

  return NextResponse.json(
    {
      ...body,
      effectiveQuery,
      yearStart: yearStart ?? undefined,
      yearEnd: yearEnd ?? undefined,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    },
  );
}
