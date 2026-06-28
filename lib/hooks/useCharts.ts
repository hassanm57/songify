"use client";

import { useEffect, useState } from "react";
import type { Album, Track } from "@/types";
import { fetchTopAlbums, fetchTopSongs } from "@/lib/api/charts";

type State<T> = { data: T[]; loading: boolean; error: string | null };

export function useTopAlbums(limit = 50) {
  const [state, setState] = useState<State<Album>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    fetchTopAlbums(limit)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => {
        console.error("[Songify] useTopAlbums error:", e);
        if (!cancelled) setState({ data: [], loading: false, error: String(e) });
      });
    return () => { cancelled = true; };
  }, [limit]);

  return state;
}

export function useTopSongs(limit = 50) {
  const [state, setState] = useState<State<Track>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    fetchTopSongs(limit)
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => {
        console.error("[Songify] useTopSongs error:", e);
        if (!cancelled) setState({ data: [], loading: false, error: String(e) });
      });
    return () => { cancelled = true; };
  }, [limit]);

  return state;
}
