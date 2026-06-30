"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { TrackRow } from "@/components/cards/TrackRow";
import { CardSkeleton, TrackSkeleton } from "@/components/cards/CardSkeleton";
import { Reveal } from "@/components/ui/Reveal";
import type { Album, Track } from "@/types";

type AlbumRailProps = {
  title: string;
  eyebrow?: string;
  albums: Album[];
  loading?: boolean;
  viewAllHref?: string;
};

type SongRailProps = {
  title: string;
  eyebrow?: string;
  tracks: Track[];
  loading?: boolean;
  viewAllHref?: string;
};

const CARD_WIDTH = "w-44 sm:w-52 flex-none";

function RailHeader({ title, eyebrow, viewAllHref }: { title: string; eyebrow?: string; viewAllHref?: string }) {
  return (
    <Reveal direction="up" margin="-40px">
      <div className="flex items-end justify-between mb-5 px-0.5">
        <div>
          {eyebrow && <p className="text-eyebrow text-ink-soft mb-1">{eyebrow}</p>}
          <h2 className="text-h2">{title}</h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-ink-soft hover:text-foreground hover:underline transition-colors">
            View all
          </Link>
        )}
      </div>
    </Reveal>
  );
}

export function AlbumRail({ title, eyebrow, albums, loading, viewAllHref }: AlbumRailProps) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="mb-14"
    >
      <RailHeader title={title} eyebrow={eyebrow} viewAllHref={viewAllHref} />

      <div ref={emblaRef} className="overflow-hidden -mx-1">
        <div className="flex gap-4 px-1">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={CARD_WIDTH}>
                  <CardSkeleton />
                </div>
              ))
            : albums.map((album) => (
                <div key={album.id} className={CARD_WIDTH}>
                  <AlbumCard album={album} />
                </div>
              ))}
        </div>
      </div>
    </motion.section>
  );
}

export function SongRail({ title, eyebrow, tracks, loading, viewAllHref }: SongRailProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mb-14"
    >
      <RailHeader title={title} eyebrow={eyebrow} viewAllHref={viewAllHref} />

      <div className="border border-hairline rounded-xl overflow-hidden">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <TrackSkeleton key={i} className="px-3" />)
          : tracks.slice(0, 10).map((track, i) => (
              <div key={track.id} className="border-b border-hairline last:border-b-0">
                <TrackRow track={track} index={i} queue={tracks} />
              </div>
            ))}
      </div>
    </motion.section>
  );
}
