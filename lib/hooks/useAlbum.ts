"use client";

import { useEffect, useState } from "react";
import type { Album, Track } from "@/types";
import { fetchAlbumWithTracks } from "@/lib/api/itunes";

type State = {
  album: Album | null;
  tracks: Track[];
  loading: boolean;
  error: string | null;
};

export function useAlbum(id: number | null) {
  const [state, setState] = useState<State>({
    album: null,
    tracks: [],
    loading: !!id,
    error: null,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchAlbumWithTracks(id)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState({ album: null, tracks: [], loading: false, error: "Album not found" });
        } else {
          setState({ album: result.album, tracks: result.tracks, loading: false, error: null });
        }
      })
      .catch((e) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e.message }));
      });
    return () => { cancelled = true; };
  }, [id]);

  return state;
}
