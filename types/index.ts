export type Track = {
  id: number;
  name: string;
  artistName: string;
  artistId: number;
  albumName: string;
  albumId: number;
  artwork: string;       // high-res (600×600)
  previewUrl: string | null;
  price: number | null;
  currency: string;
  genre: string;
  durationMs: number;
  releaseDate: string;
  trackNumber: number;
};

export type Album = {
  id: number;
  name: string;
  artistName: string;
  artistId: number;
  artwork: string;
  price: number | null;
  currency: string;
  genre: string;
  trackCount: number;
  releaseDate: string;
  url: string;
};

export type Artist = {
  id: number;
  name: string;
  genre: string;
  url: string;
};

export type PlayerTrack = Pick<
  Track,
  "id" | "name" | "artistName" | "artwork" | "previewUrl" | "albumName" | "albumId"
>;
