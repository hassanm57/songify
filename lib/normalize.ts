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
  };
}
