import { NextResponse } from "next/server";
import type { ApodPayload } from "@/lib/apod";

const APOD_URL = "https://api.nasa.gov/planetary/apod";

function errorMessage(status: number): string {
  if (status === 429) {
    return "Límite de la API APOD alcanzado. Configura NASA_API_KEY en el servidor para más cuota.";
  }
  if (status >= 500) {
    return "El servicio APOD de la NASA no está disponible temporalmente.";
  }
  return "No se pudo cargar la imagen astronómica del día.";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const apiKey = process.env.NASA_API_KEY?.trim() || "DEMO_KEY";

  const url = new URL(APOD_URL);
  url.searchParams.set("api_key", apiKey);
  if (date) {
    url.searchParams.set("date", date);
  }

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
  } catch {
    return NextResponse.json(
      { error: "No hay conexión con api.nasa.gov." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: errorMessage(upstream.status) },
      { status: upstream.status >= 500 ? 502 : upstream.status },
    );
  }

  let data: ApodPayload;
  try {
    data = (await upstream.json()) as ApodPayload;
  } catch {
    return NextResponse.json({ error: "Respuesta APOD inválida." }, { status: 502 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
}
