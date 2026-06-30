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

// Billboard Hot 100 — Week of July 4, 2026
// Searched by "title artist" so iTunes returns the exact song with artwork + previewUrl
const BILLBOARD_HOT_100: string[] = [
  "I Knew It I Knew You Taylor Swift",
  "Choosin Texas Ella Langley",
  "Stupid Song Olivia Rodrigo",
  "Drop Dead Olivia Rodrigo",
  "Be Her Ella Langley",
  "The Cure Olivia Rodrigo",
  "Janice STFU Drake",
  "Hate That I Made You Love Me Ariana Grande",
  "Honeybee Olivia Rodrigo",
  "Man I Need Olivia Dean",
  "I Just Might Bruno Mars",
  "So Easy To Fall In Love Olivia Dean",
  "I Cant Love You Anymore Ella Langley Morgan Wallen",
  "Begged Olivia Rodrigo",
  "Dracula Tame Impala",
  "Boston Stella Lefty",
  "Risk It All Bruno Mars",
  "Stateside PinkPantheress",
  "Earrings Malcolm Todd",
  "Be By You Luke Combs",
  "Don't We Morgan Wallen",
  "Cinderella Mac Miller Ty Dolla Sign",
  "Babydoll Dominic Fike",
  "Chicago Michael Jackson",
  "Human Nature Michael Jackson",
  "Whisper My Name Drake",
  "American Girls Harry Styles",
  "Change My Mind Riley Green",
  "The Great Divide Noah Kahan",
  "Swim BTS",
  "Fever Dream Alex Warren",
  "Hit The Wall Gracie Abrams",
  "Mexico Honey Kacey Musgraves",
  "What You Need Tems",
  "Beautiful Things Megan Moroney",
  "Dai Dai Shakira Burna Boy",
  "Willing And Able Noah Kahan",
  "Woman Kane Brown",
  "House Tour Sabrina Carpenter",
  "Phone Keys Wallet Lainey Wilson John Mayer",
  "Girls Kid LAROI",
  "Mr Know It All Teddy Swims",
  "Porch Light Noah Kahan",
  "Don't Worry Drake",
  "Rocky Mountain Low Corey Kent Koe Wetzel",
  "Midnight Sun Zara Larsson",
  "Homewrecker Sombr",
  "Raindance Dave Tems",
  "Come Over BTS",
  "Mcarthur Hardy Morgan Wallen",
];

export async function fetchTopSongs(limit = 50): Promise<Track[]> {
  const cacheKey = `charts:songs:billboard:${limit}`;
  const cached = getCache<Track>(cacheKey);
  if (cached) return cached;

  // Search iTunes by exact Billboard title+artist — guarantees real artwork + previewUrl
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
