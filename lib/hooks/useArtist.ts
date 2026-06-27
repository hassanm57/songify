"use client";

import { useEffect, useState } from "react";
import type { Album, Artist, Track } from "@/types";
import { fetchArtistAlbums, searchTracks } from "@/lib/api/itunes";

type State = {
  artist: Artist | null;
  albums: Album[];
  topSongs: Track[];
  loading: boolean;
  error: string | null;
};

export function useArtist(id: number | null) {
  const [state, setState] = useState<State>({
    artist: null,
    albums: [],
    topSongs: [],
    loading: !!id,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchArtistAlbums(id)
      .then(async ({ artist, albums }) => {
        if (cancelled) return;
        // Fetch top songs by artist name for the top songs list
        const topSongs = artist
          ? await searchTracks(artist.name, 10).catch(() => [])
          : [];
        if (!cancelled) {
          setState({ artist, albums, topSongs, loading: false, error: null });
        }
      })
      .catch((e) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e.message }));
      });

    return () => { cancelled = true; };
  }, [id]);

  return state;
}
