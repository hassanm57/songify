"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAlbum } from "@/lib/hooks/useAlbum";
import { useRelatedAlbums } from "@/lib/hooks/useRelatedAlbums";
import { TrackRow } from "@/components/cards/TrackRow";
import { AlbumRail } from "@/components/home/GenreRail";
import { formatYear, formatDuration, formatPrice } from "@/lib/format";

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-72 bg-elevated w-full" />
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-4">
        <div className="h-3 w-24 rounded bg-elevated" />
        <div className="h-9 w-2/3 rounded bg-elevated" />
        <div className="h-4 w-40 rounded bg-elevated" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-elevated" />)}
        </div>
      </div>
    </div>
  );
}

export function AlbumPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const albumId = id ? parseInt(id) : null;
  const { album, tracks, loading, error } = useAlbum(albumId);
  const { albums: relatedAlbums, loading: relatedLoading } = useRelatedAlbums(
    album?.artistId ?? null,
    albumId ?? undefined
  );

  if (loading) return <Skeleton />;

  if (error || !album) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-ink-soft mb-4">Album not found.</p>
        <Link href="/" className="text-sm font-semibold hover:underline">Back home</Link>
      </div>
    );
  }

  const totalDuration = tracks.reduce((sum, t) => sum + t.durationMs, 0);

  return (
    <article>
      {/* Hero */}
      <div className="relative bg-elevated border-b border-hairline overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 opacity-20 blur-2xl"
          style={{ backgroundImage: `url(${album.artwork})` }}
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto px-6 py-14 flex flex-col sm:flex-row gap-8 sm:gap-12 items-start sm:items-end">
          <motion.img
            src={album.artwork}
            alt={album.name}
            className="w-44 h-44 sm:w-56 sm:h-56 object-cover rounded-xl shadow-2xl flex-shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-eyebrow text-ink-soft">Album</p>
            <h1 className="text-h2 leading-tight">{album.name}</h1>
            <Link
              href={`/artists?id=${album.artistId}`}
              className="text-base font-semibold text-ink-soft hover:text-foreground transition-colors w-fit"
            >
              {album.artistName}
            </Link>
            <p className="text-sm text-ink-soft flex flex-wrap gap-x-3 gap-y-1">
              <span>{formatYear(album.releaseDate)}</span>
              <span aria-hidden>·</span>
              <span>{album.trackCount} songs</span>
              {totalDuration > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>{formatDuration(totalDuration)}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{album.genre}</span>
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <a
                href={album.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-pop text-pop-ink text-sm font-bold hover:opacity-90 transition-opacity"
              >
                {album.price ? `Buy ${formatPrice(album.price)}` : "Get on Apple Music"}
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tracklist + related */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {tracks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-soft">
              <span className="w-5 text-center">#</span>
              <span className="w-10 flex-shrink-0" />
              <span className="flex-1">Title</span>
              <span className="hidden sm:block w-12 text-right">Time</span>
              <span className="w-10 text-right">Price</span>
              <span className="w-7" />
            </div>
            <div className="border border-hairline rounded-xl overflow-hidden">
              {tracks.map((track, i) => (
                <div key={track.id} className="border-b border-hairline last:border-b-0">
                  <TrackRow track={track} index={i} queue={tracks} />
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {(relatedAlbums.length > 0 || relatedLoading) && (
          <div className="mt-16">
            <AlbumRail
              eyebrow={album.artistName}
              title={`More by ${album.artistName}`}
              albums={relatedAlbums}
              loading={relatedLoading}
            />
          </div>
        )}
      </div>
    </article>
  );
}
