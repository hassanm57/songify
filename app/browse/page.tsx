"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTopAlbums, useTopSongs } from "@/lib/hooks/useCharts";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { TrackRow } from "@/components/cards/TrackRow";
import { CardSkeleton, TrackSkeleton } from "@/components/cards/CardSkeleton";
import { GENRES, normalizeGenre, type Genre } from "@/lib/genres";
import { formatYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Album, Track } from "@/types";

type Entity = "albums" | "songs";
type SortKey = "chart" | "az" | "year" | "price";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "chart", label: "Chart Order" },
  { value: "az", label: "A to Z" },
  { value: "year", label: "Release Year" },
  { value: "price", label: "Price" },
];

function sortAlbums(albums: Album[], sort: SortKey): Album[] {
  const a = [...albums];
  if (sort === "az") return a.sort((x, y) => x.name.localeCompare(y.name));
  if (sort === "year") return a.sort((x, y) => y.releaseDate.localeCompare(x.releaseDate));
  if (sort === "price") return a.sort((x, y) => (y.price ?? 0) - (x.price ?? 0));
  return a;
}

function sortTracks(tracks: Track[], sort: SortKey): Track[] {
  const a = [...tracks];
  if (sort === "az") return a.sort((x, y) => x.name.localeCompare(y.name));
  if (sort === "year") return a.sort((x, y) => y.releaseDate.localeCompare(x.releaseDate));
  if (sort === "price") return a.sort((x, y) => (y.price ?? 0) - (x.price ?? 0));
  return a;
}

/* ── Genre chips ─────────────────────────────────────────────────── */
function GenreChips({ active, onChange }: { active: Genre; onChange: (g: Genre) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {GENRES.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={cn(
            "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
            active === g
              ? "bg-pop text-pop-ink"
              : "border border-hairline text-ink-soft hover:border-pop hover:text-foreground"
          )}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

/* ── Sort dropdown ───────────────────────────────────────────────── */
function SortMenu({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortKey)}
      className="h-8 px-3 pr-7 rounded-full border border-hairline text-xs font-semibold bg-background text-foreground cursor-pointer hover:border-pop transition-colors appearance-none"
      aria-label="Sort by"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%234A4A4A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ── Entity toggle ───────────────────────────────────────────────── */
function EntityToggle({ value, onChange }: { value: Entity; onChange: (e: Entity) => void }) {
  return (
    <div className="flex rounded-full border border-hairline overflow-hidden">
      {(["albums", "songs"] as Entity[]).map((e) => (
        <button
          key={e}
          onClick={() => onChange(e)}
          className={cn(
            "px-4 py-1.5 text-xs font-bold capitalize transition-colors",
            value === e ? "bg-pop text-pop-ink" : "text-ink-soft hover:text-foreground"
          )}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function BrowsePage() {
  const [genre, setGenre] = useState<Genre>("All");
  const [sort, setSort] = useState<SortKey>("chart");
  const [entity, setEntity] = useState<Entity>("albums");

  const { data: albums, loading: albumsLoading } = useTopAlbums(50);
  const { data: songs, loading: songsLoading } = useTopSongs(50);

  const filteredAlbums = useMemo(() => {
    const filtered = genre === "All"
      ? albums
      : albums.filter((a) => normalizeGenre(a.genre) === genre || a.genre === genre);
    return sortAlbums(filtered, sort);
  }, [albums, genre, sort]);

  const filteredSongs = useMemo(() => {
    const filtered = genre === "All"
      ? songs
      : songs.filter((t) => normalizeGenre(t.genre) === genre || t.genre === genre);
    return sortTracks(filtered, sort);
  }, [songs, genre, sort]);

  const loading = entity === "albums" ? albumsLoading : songsLoading;
  const count = entity === "albums" ? filteredAlbums.length : filteredSongs.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-eyebrow text-ink-soft mb-1">Explore</p>
        <h1 className="text-h2">Browse Charts</h1>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-4 mb-8">
        <GenreChips active={genre} onChange={setGenre} />
        <div className="flex items-center gap-3 flex-wrap">
          <EntityToggle value={entity} onChange={setEntity} />
          <SortMenu value={sort} onChange={setSort} />
          {!loading && (
            <span className="text-xs text-ink-soft ml-auto tabular-nums">
              {count} {entity}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {entity === "albums" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 24 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <div className="border border-hairline rounded-xl overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => <TrackSkeleton key={i} />)}
              </div>
            )}
          </motion.div>
        ) : count === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center"
          >
            <p className="text-2xl mb-2">Nothing here</p>
            <p className="text-ink-soft text-sm">Try a different genre or category</p>
            <button
              onClick={() => { setGenre("All"); setSort("chart"); }}
              className="mt-6 px-5 py-2 rounded-full border border-hairline text-sm font-semibold hover:border-pop hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        ) : entity === "albums" ? (
          <motion.div
            key={`albums-${genre}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filteredAlbums.map((album, i) => (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.4), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <AlbumCard album={album} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={`songs-${genre}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-hairline rounded-xl overflow-hidden"
          >
            {filteredSongs.map((track, i) => (
              <div key={track.id} className="border-b border-hairline last:border-b-0">
                <TrackRow track={track} index={i} queue={filteredSongs} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
