"use client";

import { useEffect, useState } from "react";
import type { Album, Track } from "@/types";
import { fetchTopAlbums, fetchTopSongs } from "@/lib/api/charts";
import { SEED_ALBUMS, SEED_TRACKS } from "@/data/seed";

type State<T> = { data: T[]; loading: boolean; error: string | null };

export function useTopAlbums(limit = 50) {
  const [state, setState] = useState<State<Album>>({
    data: SEED_ALBUMS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchTopAlbums(limit)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ data: SEED_ALBUMS, loading: false, error: e.message }); });
    return () => { cancelled = true; };
  }, [limit]);

  return state;
}

export function useTopSongs(limit = 50) {
  const [state, setState] = useState<State<Track>>({
    data: SEED_TRACKS,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchTopSongs(limit)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ data: SEED_TRACKS, loading: false, error: e.message }); });
    return () => { cancelled = true; };
  }, [limit]);

  return state;
}
