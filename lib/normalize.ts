import type { Track, Album, Artist } from "@/types";
import { upscale } from "./artwork";
import { normalizeGenre } from "./genres";

// ─── Raw iTunes shapes ────────────────────────────────────────────────────────

export type RawItunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  artistId: number;
  collectionName: string;
  collectionId: number;
  artworkUrl100: string;
  previewUrl?: string;
  trackPrice?: number;
  currency?: string;
  primaryGenreName: string;
  trackTimeMillis?: number;
  releaseDate: string;
  trackNumber?: number;
  trackViewUrl?: string;
};

export type RawItunesAlbum = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artistId: number;
  artworkUrl100: string;
  collectionPrice?: number;
  currency?: string;
  primaryGenreName: string;
  trackCount?: number;
  releaseDate: string;
  collectionViewUrl: string;
};

export type RawItunesArtist = {
  artistId: number;
  artistName: string;
  primaryGenreName: string;
  artistViewUrl: string;
};

// ─── RSS feed shape ───────────────────────────────────────────────────────────

export type RawFeedResult = {
  id: string;
  name: string;
  artistName: string;
  artistId?: string;
  artworkUrl100: string;
  genres?: { genreId: string; name: string }[];
  url: string;
  releaseDate?: string;
  collectionId?: string;
};

// ─── Normalizers ─────────────────────────────────────────────────────────────

export function normalizeTrack(raw: RawItunesTrack): Track {
  return {
    id: raw.trackId,
    name: raw.trackName,
    artistName: raw.artistName,
    artistId: raw.artistId,
    albumName: raw.collectionName,
    albumId: raw.collectionId,
    artwork: upscale(raw.artworkUrl100),
    previewUrl: raw.previewUrl ?? null,
    price: raw.trackPrice ?? null,
    currency: raw.currency ?? "USD",
    genre: normalizeGenre(raw.primaryGenreName),
    durationMs: raw.trackTimeMillis ?? 0,
    releaseDate: raw.releaseDate,
    trackNumber: raw.trackNumber ?? 0,
    url: raw.trackViewUrl ?? `https://music.apple.com/us/album/-/${raw.collectionId}?i=${raw.trackId}`,
  };
}

export function normalizeAlbum(raw: RawItunesAlbum): Album {
  return {
    id: raw.collectionId,
    name: raw.collectionName,
    artistName: raw.artistName,
    artistId: raw.artistId,
    artwork: upscale(raw.artworkUrl100),
    price: raw.collectionPrice ?? null,
    currency: raw.currency ?? "USD",
    genre: normalizeGenre(raw.primaryGenreName),
    trackCount: raw.trackCount ?? 0,
    releaseDate: raw.releaseDate,
    url: raw.collectionViewUrl,
  };
}

export function normalizeArtist(raw: RawItunesArtist): Artist {
  return {
    id: raw.artistId,
    name: raw.artistName,
    genre: normalizeGenre(raw.primaryGenreName),
    url: raw.artistViewUrl,
  };
}

export function normalizeFeedAlbum(raw: RawFeedResult): Album {
  return {
    id: parseInt(raw.id, 10),
    name: raw.name,
    artistName: raw.artistName,
    artistId: raw.artistId ? parseInt(raw.artistId, 10) : 0,
    artwork: upscale(raw.artworkUrl100),
    price: null,
    currency: "USD",
    genre: normalizeGenre(raw.genres?.[0]?.name ?? ""),
    trackCount: 0,
    releaseDate: raw.releaseDate ?? "",
    url: raw.url,
  };
}

export function normalizeFeedTrack(raw: RawFeedResult): Track {
  return {
    id: parseInt(raw.id, 10),
    name: raw.name,
    artistName: raw.artistName,
    artistId: raw.artistId ? parseInt(raw.artistId, 10) : 0,
    albumName: "",
    albumId: 0,
    artwork: upscale(raw.artworkUrl100),
    previewUrl: null,
    price: null,
    currency: "USD",
    genre: normalizeGenre(raw.genres?.[0]?.name ?? ""),
    durationMs: 0,
    releaseDate: raw.releaseDate ?? "",
    trackNumber: 0,
    url: raw.url ?? "",
  };
}

// ─── iTunes RSS feed (itunes.apple.com/us/rss/...) ───────────────────────────

export type RawItunesRSSEntry = {
  "im:name": { label: string };
  "im:image": Array<{ label: string; attributes: { height: string } }>;
  "im:price"?: { label: string; attributes: { amount: string; currency: string } };
  "im:itemCount"?: { label: string };
  "id": { label: string; attributes: { "im:id": string } };
  "im:artist": { label: string; attributes?: { href?: string } };
  "category"?: { attributes: { term: string } };
  "im:releaseDate"?: { label: string; attributes?: { label?: string } };
  "link": { attributes: { href: string } };
  "im:collection"?: {
    "im:name"?: { label: string };
    "link"?: { attributes: { href: string } };
  };
};

function parseIdFromUrl(url: string): number {
  const match = url.match(/\/(\d+)(?:\?|\/|$)/);
  return match ? parseInt(match[1]) : 0;
}

function parsePrice(entry: RawItunesRSSEntry): number | null {
  const amount = parseFloat(entry["im:price"]?.attributes.amount ?? "");
  return isNaN(amount) || amount <= 0 ? null : amount;
}

export function normalizeItunesRSSAlbum(entry: RawItunesRSSEntry): Album {
  const id = parseInt(entry["id"].attributes["im:id"]);
  const artwork = upscale(entry["im:image"][2]?.label ?? entry["im:image"][0]?.label ?? "");
  const artistHref = entry["im:artist"].attributes?.href ?? "";
  const artistId = parseIdFromUrl(artistHref);
  const url = entry["link"].attributes.href.replace(/\?.*/, "");

  return {
    id,
    name: entry["im:name"].label,
    artistName: entry["im:artist"].label,
    artistId,
    artwork,
    price: parsePrice(entry),
    currency: entry["im:price"]?.attributes.currency ?? "USD",
    genre: normalizeGenre(entry["category"]?.attributes.term ?? ""),
    trackCount: parseInt(entry["im:itemCount"]?.label ?? "0"),
    releaseDate: entry["im:releaseDate"]?.label ?? "",
    url,
  };
}

export function normalizeItunesRSSTrack(entry: RawItunesRSSEntry): Track {
  const id = parseInt(entry["id"].attributes["im:id"]);
  const artwork = upscale(entry["im:image"][2]?.label ?? entry["im:image"][0]?.label ?? "");
  const artistHref = entry["im:artist"].attributes?.href ?? "";
  const artistId = parseIdFromUrl(artistHref);
  const albumHref = entry["im:collection"]?.link?.attributes.href ?? "";
  const albumId = parseIdFromUrl(albumHref);
  const url = entry["link"].attributes.href.replace(/\?.*/, "");

  return {
    id,
    name: entry["im:name"].label,
    artistName: entry["im:artist"].label,
    artistId,
    albumName: entry["im:collection"]?.["im:name"]?.label ?? "",
    albumId,
    artwork,
    previewUrl: null,
    price: parsePrice(entry),
    currency: entry["im:price"]?.attributes.currency ?? "USD",
    genre: normalizeGenre(entry["category"]?.attributes.term ?? ""),
    durationMs: 0,
    releaseDate: entry["im:releaseDate"]?.label ?? "",
    trackNumber: 0,
    url,
  };
}
