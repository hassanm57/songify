"use client";

import { useParams } from "next/navigation";
import { useAlbum } from "@/lib/hooks/useAlbum";
import { TrackRow } from "@/components/cards/TrackRow";
import { formatYear, formatPrice } from "@/lib/format";
import Link from "next/link";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { album, tracks, loading, error } = useAlbum(id ? parseInt(id) : null);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 animate-pulse">
        <div className="flex gap-10">
          <div className="w-56 h-56 rounded-xl bg-elevated flex-shrink-0" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-8 w-3/4 rounded bg-elevated" />
            <div className="h-4 w-1/2 rounded bg-elevated" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-ink-soft">Album not found.</p>
        <Link href="/" className="text-sm text-pop hover:underline mt-2 inline-block">← Back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 mb-12">
        <img
          src={album.artwork}
          alt={album.name}
          className="w-52 h-52 object-cover rounded-xl shadow-xl flex-shrink-0"
        />
        <div className="flex flex-col justify-end">
          <p className="text-eyebrow text-ink-soft mb-2">Album</p>
          <h1 className="text-h2 mb-2">{album.name}</h1>
          <Link href={`/artists/${album.artistId}`} className="text-ink-soft hover:text-foreground transition-colors mb-4">
            {album.artistName}
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft mb-6">
            <span>{formatYear(album.releaseDate)}</span>
            <span>·</span>
            <span>{album.trackCount} songs</span>
            <span>·</span>
            <span>{album.genre}</span>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-full bg-pop text-pop-ink text-sm font-bold hover:opacity-90 transition-opacity">
              Buy {formatPrice(album.price)}
            </button>
            <Link
              href={album.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full border border-hairline text-sm hover:border-foreground transition-colors"
            >
              View on Apple Music
            </Link>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      {tracks.length > 0 && (
        <section>
          <h2 className="text-eyebrow text-ink-soft mb-4">Tracklist</h2>
          <div className="border border-hairline rounded-xl overflow-hidden">
            {tracks.map((track, i) => (
              <div key={track.id} className="border-b border-hairline last:border-b-0">
                <TrackRow track={track} index={i} queue={tracks} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
