import type { Album, Track } from "@/types";
import { normalizeAlbum, normalizeTrack, type RawItunesAlbum, type RawItunesTrack } from "@/lib/normalize";
import type { Genre } from "@/lib/genres";
import { queuedFetch } from "@/lib/api/requestQueue";

const BASE = "https://itunes.apple.com";
const memCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 10 * 60 * 1000;

// Representative search terms per genre — gives varied, high-quality iTunes results
const GENRE_TERMS: Record<Genre, string[]> = {
  "All":              ["taylor swift", "drake", "the weeknd", "olivia rodrigo", "sabrina carpenter"],
  "Pop":              ["taylor swift", "sabrina carpenter", "olivia rodrigo", "charli xcx", "dua lipa"],
  "Hip-Hop/Rap":      ["drake", "kendrick lamar", "travis scott", "post malone", "21 savage"],
  "R&B/Soul":         ["sza", "the weeknd", "beyonce", "frank ocean", "usher"],
  "Dance/Electronic": ["dua lipa", "calvin harris", "david guetta", "marshmello", "the chainsmokers"],
  "Rock":             ["arctic monkeys", "foo fighters", "imagine dragons", "the killers", "tame impala"],
  "Country":          ["morgan wallen", "luke combs", "ella langley", "zach bryan", "tyler childers"],
  "Latin":            ["bad bunny", "shakira", "j balvin", "peso pluma", "karol g"],
  "Alternative":      ["billie eilish", "hozier", "noah kahan", "phoebe bridgers", "clairo"],
  "K-Pop":            ["bts", "blackpink", "stray kids", "twice", "aespa"],
  "Afrobeats":        ["burna boy", "wizkid", "davido", "tems", "rema"],
};

function getCache<T>(key: string): T[] | null {
  const mem = memCache.get(key);
  if (mem && Date.now() - mem.ts < TTL) return mem.data as T[];
  if (typeof window !== "undefined") {
    try {
      const ss = sessionStorage.getItem(key);
      if (ss) {
        const { data, ts } = JSON.parse(ss);
        if (Date.now() - ts < TTL) { memCache.set(key, { data, ts }); return data as T[]; }
      }
    } catch {}
  }
  return null;
}

function setCache(key: string, data: unknown) {
  const ts = Date.now();
  memCache.set(key, { data, ts });
  if (typeof window !== "undefined") {
    try { sessionStorage.setItem(key, JSON.stringify({ data, ts })); } catch {}
  }
}

async function searchOne<T>(term: string, entity: "song" | "album", limit: number): Promise<T[]> {
  try {
    const res = await queuedFetch(
      `${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=${entity}&limit=${limit}&country=us`,
      { priority: "low" }
    );
    const json = await res.json();
    return (json.results ?? []) as T[];
  } catch {
    return [];
  }
}

export async function fetchSongsByGenre(genre: Genre, limit = 50): Promise<Track[]> {
  const key = `browse:songs:${genre}`;
  const cached = getCache<Track>(key);
  if (cached) return cached;

  const terms = GENRE_TERMS[genre] ?? GENRE_TERMS["All"];
  const perTerm = Math.ceil(limit / terms.length);

  const batches = await Promise.all(terms.map((t) => searchOne<RawItunesTrack>(t, "song", perTerm)));
  const seen = new Set<number>();
  const data = batches
    .flat()
    .map((r) => { try { return normalizeTrack(r); } catch { return null; } })
    .filter(Boolean)
    .filter((t) => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true; })
    .slice(0, limit) as Track[];

  if (data.length > 0) setCache(key, data);
  return data;
}

export async function fetchAlbumsByGenre(genre: Genre, limit = 50): Promise<Album[]> {
  const key = `browse:albums:${genre}`;
  const cached = getCache<Album>(key);
  if (cached) return cached;

  const terms = GENRE_TERMS[genre] ?? GENRE_TERMS["All"];
  const perTerm = Math.ceil(limit / terms.length);

  const batches = await Promise.all(terms.map((t) => searchOne<RawItunesAlbum>(t, "album", perTerm)));
  const seen = new Set<number>();
  const data = batches
    .flat()
    .map((r) => { try { return normalizeAlbum(r); } catch { return null; } })
    .filter(Boolean)
    .filter((a) => { if (!a || seen.has(a.id)) return false; seen.add(a.id); return true; })
    .slice(0, limit) as Album[];

  if (data.length > 0) setCache(key, data);
  return data;
}
