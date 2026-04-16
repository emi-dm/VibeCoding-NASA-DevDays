import { NextResponse } from "next/server";
import {
  NASA_IMAGES_API,
  normalizeAssetResponse,
  type AssetCollectionRaw,
} from "@/lib/nasa-images";

type RouteContext = { params: Promise<{ nasaId: string }> };

function errorMessage(status: number): string {
  if (status === 429) {
    return "Demasiadas peticiones. Prueba de nuevo en unos segundos.";
  }
  if (status >= 500) {
    return "El servicio de la NASA no está disponible temporalmente.";
  }
  return "No se pudo cargar el recurso.";
}

export async function GET(_request: Request, context: RouteContext) {
  const { nasaId: encoded } = await context.params;
  const nasaId = decodeURIComponent(encoded).trim();
  if (!nasaId) {
    return NextResponse.json({ error: "Identificador vacío." }, { status: 400 });
  }

  const nasaUrl = new URL(`/asset/${encodeURIComponent(nasaId)}`, NASA_IMAGES_API);

  let upstream: Response;
  try {
    upstream = await fetch(nasaUrl.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
  } catch {
    return NextResponse.json(
      { error: "No hay conexión con la API de imágenes de la NASA." },
      { status: 502 },
    );
  }

  let raw: AssetCollectionRaw;
  try {
    raw = (await upstream.json()) as AssetCollectionRaw;
  } catch {
    return NextResponse.json(
      { error: "Respuesta inválida del servicio de la NASA." },
      { status: 502 },
    );
  }

  if (!upstream.ok || raw.reason) {
    const status =
      raw.reason && upstream.ok
        ? 404
        : upstream.status >= 500
          ? 502
          : upstream.status;
    return NextResponse.json(
      {
        error: typeof raw.reason === "string" ? raw.reason : errorMessage(upstream.status),
      },
      { status },
    );
  }

  const body = normalizeAssetResponse(nasaId, raw);
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
