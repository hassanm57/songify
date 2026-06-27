"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type FavoriteItem = { id: number; type: "album" | "track"; name: string; artistName: string; artwork: string };

type FavoritesCtx = {
  favorites: FavoriteItem[];
  isFavorite: (id: number) => boolean;
  toggle: (item: FavoriteItem) => void;
};

const FavoritesContext = createContext<FavoritesCtx | null>(null);

const LS_KEY = "songify:favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = (items: FavoriteItem[]) => {
    setFavorites(items);
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  };

  const isFavorite = useCallback(
    (id: number) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggle = useCallback(
    (item: FavoriteItem) => {
      const next = favorites.some((f) => f.id === item.id)
        ? favorites.filter((f) => f.id !== item.id)
        : [...favorites, item];
      persist(next);
    },
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be inside FavoritesProvider");
  return ctx;
}
