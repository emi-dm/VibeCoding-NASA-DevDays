"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ApodPayload } from "@/lib/apod";

export function ApodSection() {
  const [data, setData] = useState<ApodPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apod");
        const json = (await res.json()) as ApodPayload & { error?: string };
        if (!res.ok) {
          throw new Error(json.error ?? "No se pudo cargar APOD.");
        }
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error desconocido.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando imagen astronómica del día…</p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-900 dark:bg-amber-950/40">
        <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">
          Imagen astronómica del día
        </h2>
        <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-200/90">{error ?? "Sin datos."}</p>
      </section>
    );
  }

  const isVideo = data.media_type === "video";
  const visualUrl = isVideo ? data.url : data.hdurl ?? data.url;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-indigo-950 to-zinc-900 text-zinc-50 shadow-lg dark:border-zinc-800">
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative aspect-video w-full bg-black lg:aspect-auto lg:min-h-[280px]">
          {isVideo && visualUrl ? (
            <iframe
              title={data.title ?? "APOD"}
              src={visualUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : visualUrl ? (
            <Image
              src={visualUrl}
              alt={data.title ?? "Astronomy Picture of the Day"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Sin vista previa disponible.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 p-6 lg:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-200/90">
            NASA APOD · {data.date}
          </p>
          <h2 className="text-2xl font-semibold leading-tight">{data.title}</h2>
          <p className="line-clamp-6 text-sm leading-relaxed text-zinc-200/90">
            {data.explanation}
          </p>
          {data.copyright ? (
            <p className="text-xs text-zinc-400">
              <span className="text-zinc-500">Crédito imagen (APOD / NASA):</span> ©{" "}
              {data.copyright}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
