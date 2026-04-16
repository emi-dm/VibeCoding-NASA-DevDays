export const NASA_IMAGES_API = "https://images-api.nasa.gov";

export type NasaMediaType = "image" | "video" | "audio";

export type SearchItemNormalized = {
  nasaId: string;
  title: string;
  description: string;
  mediaType: NasaMediaType;
  dateCreated?: string;
  center?: string;
  previewUrl: string | null;
  collectionJsonUrl: string;
};

export type SearchNormalized = {
  items: SearchItemNormalized[];
  totalHits: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  /** Si el servidor probó otra cadena y esa devolvió resultados (p. ej. NGC en lugar de M). */
  effectiveQuery?: string;
  /** Eco del filtro por año enviado a la NASA (`year_start` / `year_end`, solo año). */
  yearStart?: number;
  yearEnd?: number;
};

export type AssetNormalized = {
  nasaId: string;
  videoUrls: string[];
  imageUrls: string[];
  primaryVideo: string | null;
  primaryImage: string | null;
  posterUrl: string | null;
  rawHrefs: string[];
};

type LinkEntry = { href?: string; rel?: string; render?: string };

type SearchItemRaw = {
  href?: string;
  data?: Array<{
    nasa_id?: string;
    title?: string;
    description?: string;
    media_type?: string;
    date_created?: string;
    center?: string;
  }>;
  links?: LinkEntry[];
};

export type SearchCollectionRaw = {
  collection?: {
    items?: SearchItemRaw[];
    metadata?: { total_hits?: number };
    links?: LinkEntry[];
  };
};

export type AssetCollectionRaw = {
  collection?: {
    items?: Array<{ href?: string } | string>;
  };
  reason?: string;
};

export function toHttps(url: string): string {
  if (url.startsWith("http://")) {
    return `https://${url.slice(7)}`;
  }
  return url;
}

function pickPreviewUrl(links: LinkEntry[] | undefined): string | null {
  if (!links?.length) return null;
  const preview = links.find((l) => l.rel === "preview" && l.href);
  if (preview?.href) return toHttps(preview.href);
  const thumb = links.find(
    (l) => l.href?.includes("~thumb.") || l.href?.includes("~small."),
  );
  if (thumb?.href) return toHttps(thumb.href);
  const anyImg = links.find((l) => l.render === "image" && l.href);
  return anyImg?.href ? toHttps(anyImg.href) : null;
}

function asMediaType(raw: string | undefined): NasaMediaType | null {
  if (raw === "image" || raw === "video" || raw === "audio") return raw;
  return null;
}

export function normalizeSearchItem(item: SearchItemRaw): SearchItemNormalized | null {
  const row = item.data?.[0];
  if (!row?.nasa_id) return null;
  const mediaType = asMediaType(row.media_type);
  if (!mediaType) return null;
  const collectionJsonUrl = item.href ? toHttps(item.href) : "";
  return {
    nasaId: row.nasa_id,
    title: row.title?.trim() || row.nasa_id,
    description: (row.description ?? "").trim(),
    mediaType,
    dateCreated: row.date_created,
    center: row.center,
    previewUrl: pickPreviewUrl(item.links),
    collectionJsonUrl,
  };
}

export function normalizeSearchResponse(
  raw: SearchCollectionRaw,
  page: number,
  pageSize: number,
): SearchNormalized {
  const itemsRaw = raw.collection?.items ?? [];
  const items: SearchItemNormalized[] = [];
  for (const it of itemsRaw) {
    const n = normalizeSearchItem(it);
    if (n) items.push(n);
  }
  const totalHits = raw.collection?.metadata?.total_hits ?? items.length;
  const hasMore = page * pageSize < totalHits;
  return { items, totalHits, page, pageSize, hasMore };
}

function extractHrefs(assetJson: AssetCollectionRaw): string[] {
  const out: string[] = [];
  const rawItems = assetJson.collection?.items;
  if (!rawItems) return out;
  for (const entry of rawItems) {
    if (typeof entry === "string") {
      out.push(toHttps(entry));
      continue;
    }
    if (entry && typeof entry === "object" && "href" in entry && entry.href) {
      out.push(toHttps(entry.href));
    }
  }
  return out;
}

/** La API a veces repite el mismo `href` varias veces en el manifiesto. */
function dedupePreserveOrder(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

const VIDEO_PRIORITY = ["~mobile.", "~medium.", "~preview.", "~small.", "~orig."];

function scoreVideoUrl(url: string): number {
  const lower = url.toLowerCase();
  let score = 0;
  for (let i = 0; i < VIDEO_PRIORITY.length; i++) {
    if (lower.includes(VIDEO_PRIORITY[i])) {
      score = VIDEO_PRIORITY.length - i;
      break;
    }
  }
  if (lower.endsWith(".mp4")) score += 1;
  return score;
}

export function normalizeAssetResponse(
  nasaId: string,
  raw: AssetCollectionRaw,
): AssetNormalized {
  const hrefs = dedupePreserveOrder(extractHrefs(raw));
  const videoUrls = hrefs.filter((u) => /\.mp4(\?|$)/i.test(u));
  const imageUrls = hrefs.filter((u) => /\.(jpe?g|png|gif|webp)(\?|$)/i.test(u));
  videoUrls.sort((a, b) => scoreVideoUrl(b) - scoreVideoUrl(a));
  const primaryVideo = videoUrls[0] ?? null;
  const posterCandidates = imageUrls.filter(
    (u) => /~thumb\./i.test(u) || /~small\./i.test(u),
  );
  const posterUrl = posterCandidates[0] ?? imageUrls[0] ?? null;
  const imageForDisplay =
    imageUrls.find((u) => /~large\.|~orig\./i.test(u)) ?? imageUrls[0] ?? null;
  return {
    nasaId,
    videoUrls,
    imageUrls,
    primaryVideo,
    primaryImage: primaryVideo ? null : imageForDisplay,
    posterUrl,
    rawHrefs: hrefs,
  };
}
