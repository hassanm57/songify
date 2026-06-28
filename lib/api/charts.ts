import type { Album, Track } from "@/types";
import {
  normalizeAlbum,
  normalizeTrack,
  normalizeItunesRSSAlbum,
  normalizeItunesRSSTrack,
  type RawItunesRSSEntry,
  type RawItunesAlbum,
  type RawItunesTrack,
} from "@/lib/normalize";

const BASE = "https://itunes.apple.com";
const memCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000;

// ─── Cache helpers ────────────────────────────────────────────────────────────

function getCache<T>(url: string): T[] | null {
  const mem = memCache.get(url);
  if (mem && Date.now() - mem.ts < TTL) return mem.data as T[];
  if (typeof window !== "undefined") {
    try {
      const ss = sessionStorage.getItem(url);
      if (ss) {
        const { data, ts } = JSON.parse(ss);
        if (Date.now() - ts < TTL) { memCache.set(url, { data, ts }); return data as T[]; }
      }
    } catch {}
  }
  return null;
}

function setCache(url: string, data: unknown) {
  const ts = Date.now();
  memCache.set(url, { data, ts });
  if (typeof window !== "undefined") {
    try { sessionStorage.setItem(url, JSON.stringify({ data, ts })); } catch {}
  }
}

// ─── Old iTunes RSS (may fail on some browsers / regions) ────────────────────

async function fetchItunesRSS<T>(url: string): Promise<T[]> {
  const cached = getCache<T>(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  const json = await res.json();
  const data: T[] = json.feed?.entry ?? [];
  if (data.length === 0) throw new Error("RSS returned empty feed");

  setCache(url, data);
  return data;
}

// ─── iTunes Search API (confirmed CORS-enabled) ───────────────────────────────

async function searchItunes<T>(entity: "album" | "song", terms: string[], limitPerTerm: number): Promise<T[]> {
  const results = await Promise.all(
    terms.map((t) =>
      fetch(`${BASE}/search?term=${encodeURIComponent(t)}&media=music&entity=${entity}&limit=${limitPerTerm}&country=us`)
        .then((r) => r.json())
        .then((j) => (j.results ?? []) as T[])
        .catch(() => [] as T[])
    )
  );
  return results.flat();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchTopAlbums(limit = 50): Promise<Album[]> {
  const cacheKey = `charts:albums:${limit}`;
  const cached = getCache<Album>(cacheKey);
  if (cached) return cached;

  // 1. Try old iTunes RSS (fast, real chart data)
  try {
    const raw = await fetchItunesRSS<RawItunesRSSEntry>(`${BASE}/us/rss/topalbums/limit=${limit}/json`);
    const data = raw
      .map((e) => { try { return normalizeItunesRSSAlbum(e); } catch { return null; } })
      .filter(Boolean) as Album[];
    if (data.length > 0) { setCache(cacheKey, data); return data; }
  } catch (e) {
    console.error("[Songify] iTunes RSS albums failed, using search fallback:", e);
  }

  // 2. Fallback: search API – popular artist names give high-quality recent results
  const terms = ["taylor swift", "drake", "the weeknd", "sabrina carpenter", "kendrick lamar", "olivia rodrigo", "billie eilish", "bad bunny", "ariana grande", "sza"];
  const perTerm = Math.ceil(limit / terms.length);
  const raw = await searchItunes<RawItunesAlbum>("album", terms, perTerm);

  const seen = new Set<number>();
  const data = raw
    .map((r) => { try { return normalizeAlbum(r); } catch { return null; } })
    .filter(Boolean)
    .filter((a) => { if (!a || seen.has(a.id)) return false; seen.add(a.id); return true; })
    .slice(0, limit) as Album[];

  setCache(cacheKey, data);
  return data;
}

export async function fetchTopSongs(limit = 50): Promise<Track[]> {
  const cacheKey = `charts:songs:${limit}`;
  const cached = getCache<Track>(cacheKey);
  if (cached) return cached;

  // 1. Try old iTunes RSS
  try {
    const raw = await fetchItunesRSS<RawItunesRSSEntry>(`${BASE}/us/rss/topsongs/limit=${limit}/json`);
    const data = raw
      .map((e) => { try { return normalizeItunesRSSTrack(e); } catch { return null; } })
      .filter(Boolean) as Track[];
    if (data.length > 0) { setCache(cacheKey, data); return data; }
  } catch (e) {
    console.error("[Songify] iTunes RSS songs failed, using search fallback:", e);
  }

  // 2. Fallback: search by popular artist names, entity=song
  const terms = ["taylor swift", "drake", "the weeknd", "sabrina carpenter", "kendrick lamar", "olivia rodrigo", "billie eilish", "bad bunny", "ariana grande", "sza"];
  const perTerm = Math.ceil(limit / terms.length);
  const raw = await searchItunes<RawItunesTrack>("song", terms, perTerm);

  const seen = new Set<number>();
  const data = raw
    .map((r) => { try { return normalizeTrack(r); } catch { return null; } })
    .filter(Boolean)
    .filter((t) => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true; })
    .slice(0, limit) as Track[];

  setCache(cacheKey, data);
  return data;
}
