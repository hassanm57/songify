import type { Album, Track } from "@/types";
import { normalizeItunesRSSAlbum, normalizeItunesRSSTrack, type RawItunesRSSEntry } from "@/lib/normalize";

// itunes.apple.com has access-control-allow-origin: * so it's safe to fetch client-side
const BASE = "https://itunes.apple.com";

const memCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000;

async function fetchItunesRSS<T>(url: string): Promise<T[]> {
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

  const res = await fetch(url);
  if (!res.ok) throw new Error(`iTunes RSS fetch failed: ${res.status}`);
  const json = await res.json();
  const data: T[] = json.feed?.entry ?? [];

  memCache.set(url, { data, ts: Date.now() });
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(url, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }

  return data;
}

export async function fetchTopAlbums(limit = 50): Promise<Album[]> {
  const raw = await fetchItunesRSS<RawItunesRSSEntry>(`${BASE}/us/rss/topalbums/limit=${limit}/json`);
  return raw.map(normalizeItunesRSSAlbum);
}

export async function fetchTopSongs(limit = 50): Promise<Track[]> {
  const raw = await fetchItunesRSS<RawItunesRSSEntry>(`${BASE}/us/rss/topsongs/limit=${limit}/json`);
  return raw.map(normalizeItunesRSSTrack);
}
