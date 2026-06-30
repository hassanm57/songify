"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { TrackRow } from "@/components/cards/TrackRow";
import { CardSkeleton, TrackSkeleton } from "@/components/cards/CardSkeleton";
import { useTopAlbums, useTopSongs } from "@/lib/hooks/useCharts";
import { fetchSongsByGenre, fetchAlbumsByGenre } from "@/lib/api/browse";
import { GENRES, type Genre } from "@/lib/genres";
import { cn } from "@/lib/utils";
import type { Album, Track } from "@/types";

// ─── Genre card palette ───────────────────────────────────────────────────────
const GENRE_META: Record<Genre, { gradient: string; emoji: string }> = {
  "All":              { gradient: "from-[#C8FF00] to-[#7A9900]",  emoji: "🎵" },
  "Pop":              { gradient: "from-pink-500 to-rose-600",      emoji: "✨" },
  "Hip-Hop/Rap":      { gradient: "from-orange-500 to-red-600",     emoji: "🔥" },
  "R&B/Soul":         { gradient: "from-purple-500 to-violet-700",  emoji: "🎤" },
  "Dance/Electronic": { gradient: "from-blue-400 to-cyan-600",      emoji: "⚡" },
  "Rock":             { gradient: "from-red-600 to-gray-900",        emoji: "🎸" },
  "Country":          { gradient: "from-amber-500 to-yellow-700",   emoji: "🤠" },
  "Latin":            { gradient: "from-orange-400 to-pink-600",    emoji: "💃" },
  "Alternative":      { gradient: "from-teal-500 to-emerald-700",   emoji: "🌿" },
  "K-Pop":            { gradient: "from-pink-400 to-fuchsia-600",   emoji: "⭐" },
  "Afrobeats":        { gradient: "from-yellow-500 to-orange-600",  emoji: "🥁" },
};

type Tab = "albums" | "songs";

// ─── Skeletons ────────────────────────────────────────────────────────────────
function AlbumGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 18 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

function SongListSkeleton() {
  return (
    <div className="border border-hairline rounded-xl overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => <TrackSkeleton key={i} />)}
    </div>
  );
}

// ─── Sort controls ────────────────────────────────────────────────────────────
type SortKey = "default" | "az" | "year";

function sortAlbums(albums: Album[], s: SortKey) {
  const a = [...albums];
  if (s === "az") return a.sort((x, y) => x.name.localeCompare(y.name));
  if (s === "year") return a.sort((x, y) => y.releaseDate.localeCompare(x.releaseDate));
  return a;
}
function sortTracks(tracks: Track[], s: SortKey) {
  const a = [...tracks];
  if (s === "az") return a.sort((x, y) => x.name.localeCompare(y.name));
  if (s === "year") return a.sort((x, y) => y.releaseDate.localeCompare(x.releaseDate));
  return a;
}

// ─── Genre grid card ─────────────────────────────────────────────────────────
function GenreCard({ genre, onClick }: { genre: Genre; onClick: () => void }) {
  const meta = GENRE_META[genre];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full rounded-xl overflow-hidden text-left cursor-pointer",
        "bg-gradient-to-br", meta.gradient,
        "h-28 sm:h-32"
      )}
    >
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <span className="text-white font-bold text-base sm:text-lg leading-tight drop-shadow">
          {genre}
        </span>
        <span className="text-3xl sm:text-4xl select-none" aria-hidden>
          {meta.emoji}
        </span>
      </div>
      {/* subtle shine */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity" />
    </motion.button>
  );
}

// ─── Genre content view ───────────────────────────────────────────────────────
function GenreContent({
  genre,
  onBack,
}: {
  genre: Genre;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>("albums");
  const [sort, setSort] = useState<SortKey>("default");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<Track[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);

  // Use chart hooks for "All", genre-specific fetch otherwise
  const { data: chartAlbums, loading: chartAlbumsLoading } = useTopAlbums(genre === "All" ? 50 : 0);
  const { data: chartSongs,  loading: chartSongsLoading  } = useTopSongs(genre === "All" ? 50 : 0);

  useEffect(() => {
    if (genre === "All") {
      setAlbums(chartAlbums);
      setLoadingAlbums(chartAlbumsLoading);
    } else {
      setLoadingAlbums(true);
      fetchAlbumsByGenre(genre, 50)
        .then((data) => { setAlbums(data); setLoadingAlbums(false); })
        .catch(() => setLoadingAlbums(false));
    }
  }, [genre, chartAlbums, chartAlbumsLoading]);

  useEffect(() => {
    if (genre === "All") {
      setSongs(chartSongs);
      setLoadingSongs(chartSongsLoading);
    } else {
      setLoadingSongs(true);
      fetchSongsByGenre(genre, 50)
        .then((data) => { setSongs(data); setLoadingSongs(false); })
        .catch(() => setLoadingSongs(false));
    }
  }, [genre, chartSongs, chartSongsLoading]);

  const sortedAlbums = useMemo(() => sortAlbums(albums, sort), [albums, sort]);
  const sortedSongs  = useMemo(() => sortTracks(songs, sort),  [songs, sort]);

  const meta = GENRE_META[genre];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className={cn("rounded-2xl bg-gradient-to-br p-8 mb-8 relative overflow-hidden", meta.gradient)}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Browse
        </button>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Genre</p>
        <h1 className="text-white font-bold text-4xl sm:text-5xl drop-shadow-sm">{genre}</h1>
        <div className="absolute -bottom-4 -right-4 text-[120px] opacity-20 select-none" aria-hidden>
          {meta.emoji}
        </div>
      </div>

      {/* Tabs + sort */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex rounded-full border border-hairline overflow-hidden">
          {(["albums", "songs"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-1.5 text-xs font-bold capitalize transition-colors",
                tab === t ? "bg-pop text-pop-ink" : "text-ink-soft hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-8 px-3 pr-7 rounded-full border border-hairline text-xs font-semibold bg-background text-foreground cursor-pointer hover:border-pop transition-colors appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%234A4A4A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
        >
          <option value="default">Default</option>
          <option value="az">A to Z</option>
          <option value="year">Newest First</option>
        </select>

        <span className="text-xs text-ink-soft ml-auto tabular-nums">
          {tab === "albums" ? (loadingAlbums ? "..." : `${sortedAlbums.length} albums`) : (loadingSongs ? "..." : `${sortedSongs.length} songs`)}
        </span>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "albums" ? (
          <motion.div key="albums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {loadingAlbums ? <AlbumGridSkeleton /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sortedAlbums.map((album, i) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.28 }}
                  >
                    <AlbumCard album={album} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="songs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {loadingSongs ? <SongListSkeleton /> : (
              <div className="border border-hairline rounded-xl overflow-hidden">
                {sortedSongs.map((track, i) => (
                  <div key={track.id} className="border-b border-hairline last:border-b-0">
                    <TrackRow track={track} index={i} queue={sortedSongs} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BrowsePage() {
  const [activeGenre, setActiveGenre] = useState<Genre | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <AnimatePresence mode="wait">
        {activeGenre === null ? (
          /* Genre grid */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-10">
              <p className="text-eyebrow text-ink-soft mb-1">Explore</p>
              <h1 className="text-h2">Browse all</h1>
              <p className="text-ink-soft mt-2 text-sm">Pick a vibe and dive in.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {GENRES.map((genre) => (
                <GenreCard key={genre} genre={genre} onClick={() => setActiveGenre(genre)} />
              ))}
            </div>
          </motion.div>
        ) : (
          /* Genre content */
          <motion.div
            key={`content-${activeGenre}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GenreContent genre={activeGenre} onBack={() => setActiveGenre(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
