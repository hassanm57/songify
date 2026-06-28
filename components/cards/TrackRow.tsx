"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/context/FavoritesProvider";
import { usePlayer } from "@/context/PlayerProvider";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Track } from "@/types";

function NowPlayingBars() {
  return (
    <span className="flex items-end gap-[2px] h-3.5" aria-label="Now playing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] bg-pop rounded-sm animate-pulse"
          style={{
            height: `${[10, 14, 8][i]}px`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </span>
  );
}

type Props = {
  track: Track;
  index?: number;
  queue?: Track[];
  className?: string;
};

export function TrackRow({ track, index, queue = [], className }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const player = usePlayer();
  const fav = isFavorite(track.id);
  const [imgError, setImgError] = useState(false);
  const isActive = player.currentTrack?.id === track.id;

  const handlePlay = () => {
    if (!track.previewUrl) return;
    if (isActive) {
      player.isPlaying ? player.pause() : player.resume();
    } else {
      const playable = (queue.length ? queue : [track]).filter((t) => t.previewUrl);
      player.play(track, playable);
    }
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle({ id: track.id, type: "track", name: track.name, artistName: track.artistName, artwork: track.artwork, artistId: track.artistId });
  };

  return (
    <div
      onClick={handlePlay}
      role="row"
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
        isActive ? "bg-elevated" : "hover:bg-elevated",
        !track.previewUrl && "cursor-default opacity-80",
        className
      )}
    >
      {/* Index / playing indicator */}
      <div className="w-5 flex-shrink-0 flex items-center justify-center">
        {isActive && player.isPlaying ? (
          <NowPlayingBars />
        ) : (
          <span className={cn("text-xs tabular-nums", isActive ? "text-pop font-bold" : "text-ink-soft group-hover:hidden")}>
            {index !== undefined ? index + 1 : ""}
          </span>
        )}
        {!isActive && track.previewUrl && (
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
            className="hidden group-hover:block"
          >
            <path d="M3 1.5L10 6L3 10.5V1.5Z" fill="currentColor" />
          </svg>
        )}
      </div>

      {/* Artwork */}
      {track.artwork && !imgError ? (
        <img
          src={track.artwork}
          alt={track.albumName}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded bg-elevated flex-shrink-0 flex items-center justify-center">
          <span className="text-xs font-bold opacity-20">{track.name[0]}</span>
        </div>
      )}

      {/* Name + artist */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate leading-tight", isActive && "text-pop")}>
          {track.name}
        </p>
        <p className="text-xs text-ink-soft truncate mt-0.5">
          <Link
            href={`/artists?id=${track.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:underline hover:text-foreground transition-colors"
          >
            {track.artistName}
          </Link>
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs text-ink-soft tabular-nums flex-shrink-0 hidden sm:block">
        {formatDuration(track.durationMs)}
      </span>

      {/* Price / Buy link */}
      <div className="flex-shrink-0 w-16 text-right" onClick={(e) => e.stopPropagation()}>
        {track.price ? (
          <a
            href={track.url || `https://music.apple.com/us/album/-/${track.albumId}?i=${track.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-pop tabular-nums opacity-0 group-hover:opacity-100 hover:underline transition-opacity"
          >
            {formatPrice(track.price)}
          </a>
        ) : null}
      </div>

      {/* Favorite */}
      <button
        onClick={handleFav}
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        className={cn(
          "w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 transition-colors",
          fav ? "text-pop" : "text-ink-soft opacity-0 group-hover:opacity-100 hover:text-pop"
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 12S1 8.5 1 4.5A3 3 0 0 1 7 3a3 3 0 0 1 6 1.5C13 8.5 7 12 7 12Z"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
