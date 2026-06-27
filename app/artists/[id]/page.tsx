"use client";

import { useParams } from "next/navigation";
import { useArtist } from "@/lib/hooks/useArtist";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { TrackRow } from "@/components/cards/TrackRow";
import Link from "next/link";

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const { artist, albums, topSongs, loading, error } = useArtist(id ? parseInt(id) : null);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-10 w-1/3 rounded bg-elevated mb-4" />
        <div className="h-4 w-1/5 rounded bg-elevated" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-ink-soft">Artist not found.</p>
        <Link href="/" className="text-sm text-pop hover:underline mt-2 inline-block">← Back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-eyebrow text-ink-soft mb-2">{artist.genre}</p>
        <h1 className="text-display mb-4">{artist.name}</h1>
        <Link
          href={artist.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink-soft hover:text-foreground hover:underline transition-colors"
        >
          View on Apple Music →
        </Link>
      </div>

      {/* Top Songs */}
      {topSongs.length > 0 && (
        <section className="mb-14">
          <h2 className="text-eyebrow text-ink-soft mb-4">Top Songs</h2>
          <div className="border border-hairline rounded-xl overflow-hidden">
            {topSongs.slice(0, 5).map((track, i) => (
              <div key={track.id} className="border-b border-hairline last:border-b-0">
                <TrackRow track={track} index={i} queue={topSongs} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discography */}
      {albums.length > 0 && (
        <section>
          <h2 className="text-eyebrow text-ink-soft mb-5">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
