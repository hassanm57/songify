"use client";

import { useEffect, useState } from "react";
import type { Album, Track } from "@/types";
import { fetchTopAlbums, fetchTopSongs } from "@/lib/api/charts";

type State<T> = { data: T[]; loading: boolean; error: string | null };

const REFRESH_MS = 10 * 60 * 1000; // re-fetch every 10 minutes while page is open

export function useTopAlbums(limit = 50) {
  const [state, setState] = useState<State<Album>>({ data: [], loading: true, error: null });

  useEffect(() => {
    if (limit === 0) { setState({ data: [], loading: false, error: null }); return; }

    let cancelled = false;

    async function load(force: boolean) {
      try {
        const data = await fetchTopAlbums(limit, force);
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (e) {
        console.error("[Songify] useTopAlbums error:", e);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: String(e) }));
      }
    }

    load(false);
    const interval = setInterval(() => load(true), REFRESH_MS);

    return () => { cancelled = true; clearInterval(interval); };
  }, [limit]);

  return state;
}

export function useTopSongs(limit = 50) {
  const [state, setState] = useState<State<Track>>({ data: [], loading: true, error: null });

  useEffect(() => {
    if (limit === 0) { setState({ data: [], loading: false, error: null }); return; }

    let cancelled = false;

    async function load(force: boolean) {
      try {
        const data = await fetchTopSongs(limit, force);
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (e) {
        console.error("[Songify] useTopSongs error:", e);
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: String(e) }));
      }
    }

    load(false);
    const interval = setInterval(() => load(true), REFRESH_MS);

    return () => { cancelled = true; clearInterval(interval); };
  }, [limit]);

  return state;
}
