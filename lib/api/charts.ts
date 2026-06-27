import type { Album, Track } from "@/types";
import { normalizeFeedAlbum, normalizeFeedTrack, type RawFeedResult } from "@/lib/normalize";

const COUNTRY = "us";
const BASE = `https://rss.applemarketingtools.com/api/v2/${COUNTRY}/music/most-played`;

const memCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 min

async function fetchFeed<T>(url: string): Promise<T[]> {
  const cached = memCache.get(url);
  if (cached && Date.now() - cached.ts < TTL) return cached.data as T[];

  // Try sessionStorage first (survives client-side navigation)
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
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
  const json = await res.json();
  const data: T[] = json.feed?.results ?? [];

  memCache.set(url, { data, ts: Date.now() });
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(url, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }

  return data;
}

export async function fetchTopAlbums(limit = 50): Promise<Album[]> {
  const raw = await fetchFeed<RawFeedResult>(`${BASE}/${limit}/albums.json`);
  return raw.map(normalizeFeedAlbum);
}

export async function fetchTopSongs(limit = 50): Promise<Track[]> {
  const raw = await fetchFeed<RawFeedResult>(`${BASE}/${limit}/songs.json`);
  return raw.map(normalizeFeedTrack);
}
