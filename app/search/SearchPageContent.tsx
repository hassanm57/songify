"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/lib/hooks/useSearch";
import { TrackRow } from "@/components/cards/TrackRow";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { CardSkeleton, TrackSkeleton } from "@/components/cards/CardSkeleton";
import { cn } from "@/lib/utils";

type Tab = "songs" | "albums" | "artists";

export function SearchPageContent() {
  const router = useRouter();
  // Start empty to match pre-rendered HTML (avoids hydration mismatch).
  // A mount effect immediately populates from window.location.search, which
  // is always correct on the client — no timing race with useSearchParams().
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("songs");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    if (q) setQuery(q);
  }, []); // intentionally runs only once on mount

  // Keep URL in sync as the user types, but NEVER replace if query is empty —
  // that would clobber the ?q= that OrbSearch already put in the URL.
  useEffect(() => {
    if (!query) return;
    const current = new URLSearchParams(window.location.search).get("q") ?? "";
    if (query === current) return; // already in sync, skip the replace
    const t = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
    }, 500);
    return () => clearTimeout(t);
  }, [query, router]);

  const { tracks, albums, artists, loading, error } = useSearch(query);

  const tabCounts: Record<Tab, number> = {
    songs: tracks.length,
    albums: albums.length,
    artists: artists.length,
  };
  const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="text-eyebrow text-ink-soft mb-1">Find music</p>
        <h1 className="text-h2">Search</h1>
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <svg
          width="18" height="18" viewBox="0 0 16 16" fill="none"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
          aria-hidden
        >
          <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Songs, albums, artists..."
          autoFocus
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-hairline bg-elevated text-base outline-none focus:border-pop transition-colors placeholder:text-ink-soft/60"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-hairline border-t-pop rounded-full animate-spin" />
        )}
      </div>

      {/* Tabs */}
      {hasResults && (
        <div className="flex gap-1 border-b border-hairline mb-6">
          {(["songs", "albums", "artists"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors",
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
      <AnimatePresence mode="wait">
        {!query.trim() ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-ink-soft">Type something to search</p>
          </motion.div>
        ) : loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {tab === "songs" ? (
              <div className="border border-hairline rounded-xl overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => <TrackSkeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            )}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-ink-soft text-sm">Something went wrong. Try again.</p>
          </motion.div>
        ) : !hasResults ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <p className="text-lg mb-1">No results for</p>
            <p className="text-h2">"{query}"</p>
            <p className="text-ink-soft text-sm mt-3">Check the spelling or try a different search</p>
          </motion.div>
        ) : tab === "songs" && tracks.length > 0 ? (
          <motion.div
            key="songs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-hairline rounded-xl overflow-hidden"
          >
            {tracks.map((track, i) => (
              <div key={track.id} className="border-b border-hairline last:border-b-0">
                <TrackRow track={track} index={i} queue={tracks} />
              </div>
            ))}
          </motion.div>
        ) : tab === "albums" && albums.length > 0 ? (
          <motion.div
            key="albums"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {albums.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <AlbumCard album={album} />
              </motion.div>
            ))}
          </motion.div>
        ) : tab === "artists" && artists.length > 0 ? (
          <motion.div
            key="artists"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="tab-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <p className="text-ink-soft text-sm">No {tab} for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
