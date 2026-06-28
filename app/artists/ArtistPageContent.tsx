"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useArtist } from "@/lib/hooks/useArtist";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { TrackRow } from "@/components/cards/TrackRow";
import { TrackSkeleton } from "@/components/cards/CardSkeleton";
import type { Album } from "@/types";

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 bg-elevated w-full" />
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-4">
        <div className="h-4 w-20 rounded bg-elevated" />
        <div className="h-14 w-1/2 rounded bg-elevated" />
        <div className="mt-10 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <TrackSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}

function DiscographyCarousel({ albums }: { albums: Album[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    update();
  }, [emblaApi, update]);

  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden -mx-1">
        <div className="flex gap-5 px-1">
          {albums.map((album) => (
            <div key={album.id} className="w-40 sm:w-48 flex-none">
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
          aria-label="Previous"
          className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center disabled:opacity-30 hover:border-pop hover:bg-pop hover:text-pop-ink transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
          aria-label="Next"
          className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center disabled:opacity-30 hover:border-pop hover:bg-pop hover:text-pop-ink transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ArtistPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { artist, albums, topSongs, loading, error } = useArtist(id ? parseInt(id) : null);

  if (loading) return <Skeleton />;

  if (error || !artist) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-ink-soft mb-4">Artist not found.</p>
        <Link href="/" className="text-sm font-semibold hover:underline">Back home</Link>
      </div>
    );
  }

  return (
    <article>
      <div className="relative border-b border-hairline overflow-hidden bg-elevated">
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <motion.p
            className="text-eyebrow text-ink-soft mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {artist.genre}
          </motion.p>
          <motion.h1
            className="text-display mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {artist.name}
          </motion.h1>
          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            {artist.url ? (
              <Link
                href={artist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-soft hover:text-foreground transition-colors underline underline-offset-2"
              >
                Apple Music profile
              </Link>
            ) : null}
            {albums.length > 0 && (
              <span className="text-sm text-ink-soft">
                {albums.length} release{albums.length !== 1 ? "s" : ""}
              </span>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {topSongs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5">
              <p className="text-eyebrow text-ink-soft mb-1">Popular</p>
              <h2 className="text-h2">Top Songs</h2>
            </div>
            <div className="border border-hairline rounded-xl overflow-hidden">
              {topSongs.slice(0, 5).map((track, i) => (
                <div key={track.id} className="border-b border-hairline last:border-b-0">
                  <TrackRow track={track} index={i} queue={topSongs} />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {albums.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5">
              <p className="text-eyebrow text-ink-soft mb-1">Releases</p>
              <h2 className="text-h2">Discography</h2>
            </div>
            <DiscographyCarousel albums={albums} />
          </motion.section>
        )}
      </div>
    </article>
  );
}
