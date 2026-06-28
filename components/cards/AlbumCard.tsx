"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesProvider";
import { usePlayer } from "@/context/PlayerProvider";
import { formatPrice } from "@/lib/format";
import type { Album, PlayerTrack } from "@/types";

type Props = {
  album: Album;
  queue?: PlayerTrack[];
  className?: string;
};

export function AlbumCard({ album, queue = [], className }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const player = usePlayer();
  const fav = isFavorite(album.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!queue.length) return;
    const first = queue.find((t) => t.previewUrl) ?? null;
    if (first) player.play(first, queue);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({ id: album.id, type: "album", name: album.name, artistName: album.artistName, artwork: album.artwork, artistId: album.artistId });
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex flex-col cursor-pointer select-none", className)}
    >
      <Link href={`/albums?id=${album.id}`} className="block">
        {/* Artwork */}
        <div className="relative overflow-hidden rounded-[0.375rem] aspect-square bg-elevated">
          {album.artwork ? (
            <img
              src={album.artwork}
              alt={album.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-black opacity-10">{album.name[0]}</span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={handlePlay}
              aria-label={`Play ${album.name}`}
              className="w-12 h-12 rounded-full bg-pop flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M6 3.5L14.5 9L6 14.5V3.5Z" fill="#0A0A0A" />
              </svg>
            </button>
          </div>

          {/* Favorite button */}
          <button
            onClick={handleFav}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            className={cn(
              "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              fav ? "opacity-100 bg-pop" : "bg-black/50 hover:bg-pop"
            )}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path
                d="M6.5 11.5S1 8.5 1 4.5A2.5 2.5 0 0 1 6.5 3 2.5 2.5 0 0 1 12 4.5C12 8.5 6.5 11.5 6.5 11.5Z"
                fill={fav ? "#0A0A0A" : "none"}
                stroke={fav ? "#0A0A0A" : "white"}
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <p className="text-sm font-bold leading-tight truncate">{album.name}</p>
          <p className="text-xs text-ink-soft truncate mt-0.5">{album.artistName}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-pop tabular-nums">
              {formatPrice(album.price)}
            </span>
            {album.genre && (
              <span className="text-[10px] text-ink-soft uppercase tracking-wider truncate max-w-[80px]">
                {album.genre}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
