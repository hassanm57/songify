"use client";

import { useEffect, useRef, useState } from "react";
import type { Album, Artist, Track } from "@/types";
import { searchAlbums, searchArtists, searchTracks } from "@/lib/api/itunes";

type SearchResults = {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  loading: boolean;
  error: string | null;
};

export function useSearch(query: string, debounceMs = 350) {
  const [results, setResults] = useState<SearchResults>({
    tracks: [],
    albums: [],
    artists: [],
    loading: false,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults({ tracks: [], albums: [], artists: [], loading: false, error: null });
      return;
    }

    setResults((s) => ({ ...s, loading: true, error: null }));

    timerRef.current = setTimeout(async () => {
      try {
        const [tracks, albums, artists] = await Promise.all([
          searchTracks(query, 10),
          searchAlbums(query, 10),
          searchArtists(query, 5),
        ]);
        setResults({ tracks, albums, artists, loading: false, error: null });
      } catch (e) {
        setResults((s) => ({
          ...s,
          loading: false,
          error: e instanceof Error ? e.message : "Search failed",
        }));
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs]);

  return results;
}
