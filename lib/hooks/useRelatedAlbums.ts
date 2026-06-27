"use client";

import { useEffect, useState } from "react";
import type { Album } from "@/types";
import { fetchArtistAlbums } from "@/lib/api/itunes";

type State = { albums: Album[]; loading: boolean };

export function useRelatedAlbums(artistId: number | null, excludeId?: number) {
  const [state, setState] = useState<State>({ albums: [], loading: !!artistId });

  useEffect(() => {
    if (!artistId) return;
    let cancelled = false;
    fetchArtistAlbums(artistId)
      .then(({ albums }) => {
        if (cancelled) return;
        setState({
          albums: excludeId ? albums.filter((a) => a.id !== excludeId) : albums,
          loading: false,
        });
      })
      .catch(() => { if (!cancelled) setState({ albums: [], loading: false }); });
    return () => { cancelled = true; };
  }, [artistId, excludeId]);

  return state;
}
