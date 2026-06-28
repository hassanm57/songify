"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useFavorites } from "@/context/FavoritesProvider";
import type { FavoriteItem } from "@/context/FavoritesProvider";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.5, ease }}
      className="flex flex-col items-center justify-center py-32 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-hairline" aria-hidden>
          <path
            d="M28 48S6 36 6 19A11 11 0 0 1 28 12a11 11 0 0 1 22 7C50 36 28 48 28 48Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      <h2 className="text-h2 mb-3">Nothing saved yet</h2>
      <p className="text-ink-soft max-w-xs">
        Hit the heart on any album or song to save it here for later.
      </p>
      <Link
        href="/"
        className="mt-8 px-6 py-2.5 rounded-full bg-pop text-pop-ink text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Discover music
      </Link>
    </motion.div>
  );
}

/* ── Favorite card ───────────────────────────────────────────────── */
function FavoriteCard({ item, onRemove }: { item: FavoriteItem; onRemove: () => void }) {
  const href = item.type === "album"
    ? `/albums?id=${item.id}`
    : item.artistId ? `/artists?id=${item.artistId}` : "#";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease }}
      className="group relative"
    >
      <Link href={href} className="block">
        <div className={cn(
          "relative overflow-hidden rounded-lg bg-elevated aspect-square",
          item.type === "track" && "rounded-full"
        )}>
          {item.artwork ? (
            <img
              src={item.artwork}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-black opacity-10">{item.name[0]}</span>
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              {item.type}
            </span>
          </div>
        </div>
      </Link>

      {/* Info + remove */}
      <div className="mt-2.5 flex items-start justify-between gap-2">
        <Link href={href} className="min-w-0">
          <p className="text-sm font-bold truncate leading-snug">{item.name}</p>
          <p className="text-xs text-ink-soft truncate">{item.artistName}</p>
        </Link>

        <button
          onClick={onRemove}
          aria-label={`Remove ${item.name} from favorites`}
          className="flex-shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-pop hover:bg-pop hover:text-pop-ink transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
            <path d="M7 12S1 8.5 1 4.5A3 3 0 0 1 7 3a3 3 0 0 1 6 1.5C13 8.5 7 12 7 12Z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

/* ── Filter tabs ─────────────────────────────────────────────────── */
type Filter = "all" | "albums" | "tracks";

function FilterTabs({ active, counts, onChange }: {
  active: Filter;
  counts: Record<Filter, number>;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-hairline mb-8">
      {(["all", "albums", "tracks"] as Filter[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            "relative px-4 py-2.5 text-xs font-bold uppercase tracking-widest capitalize transition-colors",
            active === f ? "text-foreground" : "text-ink-soft hover:text-foreground"
          )}
        >
          {f}
          {counts[f] > 0 && (
            <span className={cn(
              "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              active === f ? "bg-pop text-pop-ink" : "bg-elevated text-ink-soft"
            )}>
              {counts[f]}
            </span>
          )}
          {active === f && (
            <motion.div
              layoutId="fav-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-pop rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  const [filter, setFilter] = useState<Filter>("all");

  const albums = favorites.filter((f) => f.type === "album");
  const tracks = favorites.filter((f) => f.type === "track");

  const visible = filter === "all" ? favorites : filter === "albums" ? albums : tracks;

  const counts: Record<Filter, number> = {
    all: favorites.length,
    albums: albums.length,
    tracks: tracks.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-eyebrow text-ink-soft mb-1">Your collection</p>
        <h1 className="text-h2">Favorites</h1>
      </div>

      <AnimatePresence mode="wait">
        {favorites.length === 0 ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FilterTabs active={filter} counts={counts} onChange={setFilter} />

            <AnimatePresence>
              {visible.length === 0 ? (
                <motion.p
                  key="tab-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-ink-soft py-12 text-center"
                >
                  No {filter} saved yet.
                </motion.p>
              ) : (
                <motion.div
                  key={filter}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
                >
                  <AnimatePresence>
                    {visible.map((item) => (
                      <FavoriteCard
                        key={item.id}
                        item={item}
                        onRemove={() => toggle(item)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
