import type { Track, Album, Artist } from "@/types";
import {
  normalizeTrack,
  normalizeAlbum,
  normalizeArtist,
  type RawItunesTrack,
  type RawItunesAlbum,
  type RawItunesArtist,
} from "@/lib/normalize";
import { queuedFetch } from "@/lib/api/requestQueue";

const BASE = "https://itunes.apple.com";

const memCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000;

async function fetchItunes<T>(url: string): Promise<T[]> {
  const cached = memCache.get(url);
  if (cached && Date.now() - cached.ts < TTL) return cached.data as T[];

  if (typeof window !== "undefined") {
    try {
      const ss = sessionStorage.getItem(url);
      if (ss) {
        const { data, ts } = JSON.parse(ss);
        if (Date.now() - ts < TTL) {
          memCache.set(url, { data, ts });
          return data as T[];
        }
      }
    } catch {}
  }

  // "high" priority: these calls are directly triggered by user actions
  // (search, opening a detail page, buying/playing), so they should jump
  // ahead of background chart/decorative enrichment in the shared queue.
  const res = await queuedFetch(url, { priority: "high" });
  if (!res.ok) throw new Error(`iTunes fetch failed: ${res.status}`);
  const json = await res.json();
  const data: T[] = json.results ?? [];

  memCache.set(url, { data, ts: Date.now() });
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(url, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }

  return data;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchTracks(term: string, limit = 25): Promise<Track[]> {
  const url = `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`;
  const raw = await fetchItunes<RawItunesTrack>(url);
  return raw.filter((r) => (r as { wrapperType?: string }).wrapperType === "track").map(normalizeTrack);
}

export async function searchAlbums(term: string, limit = 25): Promise<Album[]> {
  const url = `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=album&limit=${limit}`;
  const raw = await fetchItunes<RawItunesAlbum>(url);
  return raw.filter((r) => (r as { wrapperType?: string }).wrapperType === "collection").map(normalizeAlbum);
}

export async function searchArtists(term: string, limit = 25): Promise<Artist[]> {
  const url = `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=musicArtist&limit=${limit}`;
  const raw = await fetchItunes<RawItunesArtist>(url);
  return raw.filter((r) => (r as { wrapperType?: string }).wrapperType === "artist").map(normalizeArtist);
}

// ─── Lookup ───────────────────────────────────────────────────────────────────

export async function fetchAlbumWithTracks(
  collectionId: number
): Promise<{ album: Album; tracks: Track[] } | null> {
  const url = `${BASE}/lookup?id=${collectionId}&entity=song`;
  const raw = await fetchItunes<Record<string, unknown>>(url);
  if (!raw.length) return null;

  const albumRaw = raw.find((r) => r.wrapperType === "collection") as RawItunesAlbum | undefined;
  const trackRaws = raw.filter((r) => r.wrapperType === "track") as RawItunesTrack[];

  if (!albumRaw) return null;

  return {
    album: normalizeAlbum(albumRaw),
    tracks: trackRaws.map(normalizeTrack),
  };
}

export async function fetchArtistAlbums(
  artistId: number
): Promise<{ artist: Artist | null; albums: Album[] }> {
  const url = `${BASE}/lookup?id=${artistId}&entity=album&limit=25`;
  const raw = await fetchItunes<Record<string, unknown>>(url);

  const artistRaw = raw.find((r) => r.wrapperType === "artist") as RawItunesArtist | undefined;
  const albumRaws = raw.filter((r) => r.wrapperType === "collection") as RawItunesAlbum[];

  return {
    artist: artistRaw ? normalizeArtist(artistRaw) : null,
    albums: albumRaws.map(normalizeAlbum),
  };
}

// Enrich a feed-derived item with preview URL + price from iTunes
export async function enrichTrack(trackId: number): Promise<Partial<Track>> {
  const url = `${BASE}/lookup?id=${trackId}`;
  const raw = await fetchItunes<RawItunesTrack>(url);
  const r = raw[0];
  if (!r) return {};
  return { previewUrl: r.previewUrl ?? null, price: r.trackPrice ?? null };
}

export async function enrichAlbum(collectionId: number): Promise<Partial<Album>> {
  const url = `${BASE}/lookup?id=${collectionId}`;
  const raw = await fetchItunes<RawItunesAlbum>(url);
  const r = raw[0];
  if (!r) return {};
  return { price: r.collectionPrice ?? null, trackCount: r.trackCount ?? 0 };
}
