"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearch } from "@/lib/hooks/useSearch";
import { usePlayer } from "@/context/PlayerProvider";
import { formatPrice, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Album, Artist, Track } from "@/types";

const ease = [0.22, 1, 0.36, 1] as const;

type Tab = "songs" | "albums" | "artists";

/* ── individual result rows ─────────────────────────────────────── */

function SongResult({ track, onClose }: { track: Track; onClose: () => void }) {
  const player = usePlayer();
  const isActive = player.currentTrack?.id === track.id;

  return (
    <button
      onClick={() => {
        if (track.previewUrl) player.play(track, [track]);
        onClose();
      }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-elevated transition-colors text-left group",
        isActive && "bg-elevated"
      )}
    >
      <img src={track.artwork} alt={track.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isActive && "text-pop")}>{track.name}</p>
        <p className="text-xs text-ink-soft truncate">{track.artistName}</p>
      </div>
      <span className="text-xs text-ink-soft tabular-nums flex-shrink-0 hidden sm:block">
        {formatDuration(track.durationMs)}
      </span>
      {track.price && (
        <span className="text-xs font-bold text-pop tabular-nums flex-shrink-0">
          {formatPrice(track.price)}
        </span>
      )}
      {track.previewUrl && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" aria-hidden>
          <path d="M3 1.5L10 6L3 10.5V1.5Z" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

function AlbumResult({ album, onClose }: { album: Album; onClose: () => void }) {
  return (
    <Link
      href={`/albums?id=${album.id}`}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-elevated transition-colors group"
    >
      <img src={album.artwork} alt={album.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{album.name}</p>
        <p className="text-xs text-ink-soft truncate">{album.artistName} · {album.genre}</p>
      </div>
      {album.price && (
        <span className="text-xs font-bold text-pop tabular-nums flex-shrink-0">
          {formatPrice(album.price)}
        </span>
      )}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" aria-hidden>
        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

function ArtistResult({ artist, onClose }: { artist: Artist; onClose: () => void }) {
  return (
    <Link
      href={`/artists?id=${artist.id}`}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-elevated transition-colors group"
    >
      <div className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center flex-shrink-0 border border-hairline">
        <span className="text-sm font-bold opacity-50">{artist.name[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{artist.name}</p>
        <p className="text-xs text-ink-soft truncate">{artist.genre}</p>
      </div>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" aria-hidden>
        <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

/* ── main overlay ────────────────────────────────────────────────── */

type Props = { open: boolean; onClose: () => void };

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("songs");
  const inputRef = useRef<HTMLInputElement>(null);
  const { tracks, albums, artists, loading } = useSearch(query);

  const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0;
  const isEmpty = query.trim().length > 0 && !loading && !hasResults;

  const tabCounts: Record<Tab, number> = {
    songs: tracks.length,
    albums: albums.length,
    artists: artists.length,
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
      setTab("songs");
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) onClose(); // let parent handle open toggle
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-2xl bg-background border border-hairline rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.25, ease }}
              role="dialog"
              aria-modal="true"
              aria-label="Search music"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-ink-soft" aria-hidden>
                  <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search songs, albums, artists..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-soft/60 min-w-0"
                  aria-label="Search"
                />
                {loading && (
                  <div className="w-4 h-4 border-2 border-hairline border-t-pop rounded-full animate-spin flex-shrink-0" aria-label="Searching" />
                )}
                <kbd
                  onClick={onClose}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-hairline text-[11px] text-ink-soft cursor-pointer hover:bg-elevated transition-colors"
                >
                  ESC
                </kbd>
              </div>

              {/* Tabs — only shown when there are results */}
              {hasResults && (
                <div className="flex border-b border-hairline px-4">
                  {(["songs", "albums", "artists"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "relative px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors",
                        tab === t ? "text-foreground" : "text-ink-soft hover:text-foreground"
                      )}
                    >
                      {t}
                      {tabCounts[t] > 0 && (
                        <span className={cn(
                          "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          tab === t ? "bg-pop text-pop-ink" : "bg-elevated text-ink-soft"
                        )}>
                          {tabCounts[t]}
                        </span>
                      )}
                      {tab === t && (
                        <motion.div
                          layoutId="search-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-pop rounded-full"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="max-h-[55vh] overflow-y-auto">
                {isEmpty && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-ink-soft text-sm">No results for <span className="font-semibold text-foreground">"{query}"</span></p>
                  </div>
                )}

                {!query.trim() && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-ink-soft text-sm">Type to search across songs, albums, and artists</p>
                  </div>
                )}

                {tab === "songs" && tracks.length > 0 && (
                  <motion.div
                    key="songs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    {tracks.map((track) => (
                      <SongResult key={track.id} track={track} onClose={onClose} />
                    ))}
                  </motion.div>
                )}

                {tab === "albums" && albums.length > 0 && (
                  <motion.div
                    key="albums"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    {albums.map((album) => (
                      <AlbumResult key={album.id} album={album} onClose={onClose} />
                    ))}
                  </motion.div>
                )}

                {tab === "artists" && artists.length > 0 && (
                  <motion.div
                    key="artists"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    {artists.map((artist) => (
                      <ArtistResult key={artist.id} artist={artist} onClose={onClose} />
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer hint */}
              {hasResults && (
                <div className="px-4 py-2 border-t border-hairline flex items-center gap-3 text-[11px] text-ink-soft">
                  <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                  <span><kbd className="font-mono">↵</kbd> select</span>
                  <span><kbd className="font-mono">ESC</kbd> close</span>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
