import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  NASA_IMAGES_API,
  normalizeAssetResponse,
  type AssetCollectionRaw,
} from "@/lib/nasa-images";

type PageProps = { params: Promise<{ nasaId: string }> };

async function fetchAsset(nasaId: string) {
  const url = new URL(`/asset/${encodeURIComponent(nasaId)}`, NASA_IMAGES_API);
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  const raw = (await res.json()) as AssetCollectionRaw;
  if (!res.ok || raw.reason) {
    return null;
  }
  return normalizeAssetResponse(nasaId, raw);
}

export default async function MediaPage({ params }: PageProps) {
  const { nasaId: encoded } = await params;
  const nasaId = decodeURIComponent(encoded);
  const asset = await fetchAsset(nasaId);
  if (!asset) {
    notFound();
  }

  const nasaDetailsUrl = `https://images.nasa.gov/search-results?query=${encodeURIComponent(nasaId)}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <nav>
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← Volver al explorador
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {nasaId}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Identificador NASA: <span className="font-mono text-zinc-700 dark:text-zinc-300">{nasaId}</span>
        </p>
        <a
          href={nasaDetailsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Abrir ficha en images.nasa.gov
        </a>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-black shadow-xl dark:border-zinc-800">
        {asset.primaryVideo ? (
          <video
            key={asset.primaryVideo}
            className="aspect-video w-full bg-black"
            controls
            playsInline
            poster={asset.posterUrl ?? undefined}
            preload="metadata"
          >
            <source src={asset.primaryVideo} type="video/mp4" />
            Tu navegador no reproduce vídeo HTML5.
          </video>
        ) : asset.primaryImage ? (
          <div className="relative min-h-[320px] w-full bg-zinc-950">
            <Image
              src={asset.primaryImage}
              alt={nasaId}
              fill
              className="object-contain p-4"
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-zinc-300">
            No hay archivo de imagen o vídeo directo en el manifiesto. Revisa los enlaces en la NASA.
          </div>
        )}
      </div>

      {asset.videoUrls.length > 1 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Otras calidades de vídeo
          </h2>
          <ul className="flex flex-col gap-2">
            {asset.videoUrls.map((href) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {href}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
