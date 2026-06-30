import type { Album, Track } from "@/types";
import {
  normalizeAlbum,
  normalizeTrack,
  normalizeFeedAlbum,
  type RawFeedResult,
  type RawItunesAlbum,
  type RawItunesTrack,
} from "@/lib/normalize";

const BASE = "https://itunes.apple.com";
const memCache = new Map<string, { data: unknown; ts: number }>();
const TTL = 5 * 60 * 1000;

// ─── Cache helpers ────────────────────────────────────────────────────────────

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

// ─── iTunes Search API ────────────────────────────────────────────────────────

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

// ─── Top Albums ───────────────────────────────────────────────────────────────
// Primary: Apple Marketing Tools RSS (current CORS-enabled chart)
// Fallback: iTunes search by chart artists

const AMT_ALBUMS_URL = "https://rss.applemarketingtools.com/api/v2/us/music/most-played/50/albums.json";

export async function fetchTopAlbums(limit = 50, force = false): Promise<Album[]> {
  const cacheKey = `charts:albums:v4:${limit}`;
  if (!force) {
    const cached = getCache<Album>(cacheKey);
    if (cached) return cached;
  }

  // Try Apple Marketing Tools RSS
  try {
    const res = await fetch(AMT_ALBUMS_URL);
    if (res.ok) {
      const json = await res.json();
      const results: RawFeedResult[] = json.feed?.results ?? [];
      if (results.length > 0) {
        const data = results
          .slice(0, limit)
          .map((r) => { try { return normalizeFeedAlbum(r); } catch { return null; } })
          .filter(Boolean) as Album[];
        if (data.length > 0) { setCache(cacheKey, data); return data; }
      }
    }
  } catch {}

  // Fallback: search by current chart artists
  const terms = [
    "olivia rodrigo", "taylor swift", "drake", "ella langley", "bruno mars",
    "ariana grande", "olivia dean", "luke combs", "tame impala", "noah kahan",
  ];
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

// ─── Top Songs (Billboard Hot 100 — Week of July 4, 2026) ────────────────────
// Each entry is a search term: "title artist" — iTunes returns the exact track.

const BILLBOARD_HOT_100: string[] = [
  "Choosin Texas Ella Langley",
  "I Knew It I Knew You Taylor Swift",
  "Be Her Ella Langley",
  "Stupid Song Olivia Rodrigo",
  "Drop Dead Olivia Rodrigo",
  "Janice STFU Drake",
  "Hate That I Made You Love Me Ariana Grande",
  "Man I Need Olivia Dean",
  "I Cant Love You Anymore Ella Langley Morgan Wallen",
  "Dracula Tame Impala JENNIE",
  "So Easy To Fall In Love Olivia Dean",
  "I Just Might Bruno Mars",
  "The Cure Olivia Rodrigo",
  "Boston Stella Lefty",
  "Risk It All Bruno Mars",
  "Homewrecker sombr",
  "Stateside PinkPantheress Zara Larsson",
  "Honeybee Olivia Rodrigo",
  "Midnight Sun Zara Larsson",
  "Shabang Drake",
  "Be By You Luke Combs",
  "Dont We Morgan Wallen",
  "Earrings Malcolm Todd",
  "Maggots For Brains Olivia Rodrigo",
  "Spend Dat Yung Miami",
  "Cinderella Mac Miller Ty Dolla Sign",
  "Expectations Olivia Rodrigo",
  "My Way Olivia Rodrigo",
  "Babydoll Dominic Fike",
  "Whats Wrong With Me Olivia Rodrigo Robert Smith",
  "Begged Olivia Rodrigo",
  "Sleepless In A Hotel Room Luke Combs",
  "u me Olivia Rodrigo",
  "Less Olivia Rodrigo",
  "Loving Life Again Ella Langley",
  "Chicago Michael Jackson",
  "E85 Don Toliver",
  "American Girls Harry Styles",
  "Ran To Atlanta Drake Future Molly Santana",
  "Die On This Hill Sienna Spiro",
  "Freakin Out Dexter And The Moonrocks",
  "Pop Dat Thang DaBaby",
  "Iconic By Mistake Le Sserafim ILLIT KATSEYE",
  "The Great Divide Noah Kahan",
  "Human Nature Michael Jackson",
  "Change My Mind Riley Green",
  "Dont Tell On Me Jason Aldean",
  "Whisper My Name Drake",
  "Hit The Wall Gracie Abrams",
  "Cigarette Smoke Olivia Rodrigo",
];

export async function fetchTopSongs(limit = 50, force = false): Promise<Track[]> {
  const cacheKey = `charts:songs:billboard:v4:${limit}`;
  if (!force) {
    const cached = getCache<Track>(cacheKey);
    if (cached) return cached;
  }

  const terms = BILLBOARD_HOT_100.slice(0, limit);
  const results = await Promise.all(
    terms.map((term) =>
      fetch(`${BASE}/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=1&country=us`)
        .then((r) => r.json())
        .then((j) => (j.results?.[0] ?? null) as RawItunesTrack | null)
        .catch(() => null)
    )
  );

  const seen = new Set<number>();
  const data = results
    .filter(Boolean)
    .map((r) => { try { return normalizeTrack(r!); } catch { return null; } })
    .filter(Boolean)
    .filter((t) => { if (!t || seen.has(t.id)) return false; seen.add(t.id); return true; })
    .slice(0, limit) as Track[];

  if (data.length > 0) setCache(cacheKey, data);
  return data;
}
