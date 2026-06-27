"use client";

import { useFavorites } from "@/context/FavoritesProvider";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <p className="text-eyebrow text-ink-soft mb-2">Your collection</p>
      <h1 className="text-h2 mb-8">Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-ink-soft">Nothing saved yet — hit the heart on any album or song.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <img src={item.artwork} alt={item.name} className="w-full aspect-square object-cover rounded-[0.375rem]" />
              <p className="text-sm font-bold truncate">{item.name}</p>
              <p className="text-xs text-ink-soft truncate">{item.artistName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
