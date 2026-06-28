"use client";

import { useMemo, useState } from "react";
import { Hero } from "@/components/home/Hero";
import { AlbumRail, SongRail } from "@/components/home/GenreRail";
import { ShowcaseGrid } from "@/components/home/ShowcaseGrid";
import { AlbumShelfCarousel } from "@/components/home/AlbumShelfCarousel";
import { DesktopSidebar, MobileGenreBar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { OrbSearch } from "@/components/search/OrbSearch";
import { useTopAlbums, useTopSongs } from "@/lib/hooks/useCharts";

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { data: albums, loading: albumsLoading } = useTopAlbums(50);
  const { data: songs,  loading: songsLoading  } = useTopSongs(50);

  const featured = albums[0] ?? null;

  const filteredAlbums = useMemo(
    () => selectedGenre === "All" ? albums : albums.filter((a) => a.genre === selectedGenre),
    [albums, selectedGenre]
  );

  const filteredSongs = useMemo(
    () => selectedGenre === "All" ? songs : songs.filter((s) => s.genre === selectedGenre),
    [songs, selectedGenre]
  );

  return (
    <>
      <OrbSearch />
      <Hero featured={featured} />

      {/* Mobile-only chip bar — sits above the rails, hidden on desktop */}
      <MobileGenreBar selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />

      {/* Sidebar + rails — desktop sidebar is inside the flex row */}
      <div className="flex max-w-[1600px] mx-auto w-full">
        <DesktopSidebar selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />

        <div className="flex-1 min-w-0 px-6 lg:px-10 pt-10">
          <AlbumRail
            eyebrow="Global charts"
            title="Top Albums"
            albums={filteredAlbums}
            loading={albumsLoading}
            viewAllHref="/browse?tab=albums"
          />

          <SongRail
            eyebrow="Most played"
            title="Top Songs"
            tracks={filteredSongs}
            loading={songsLoading}
            viewAllHref="/browse?tab=songs"
          />

          {selectedGenre === "All" && (
            <AlbumRail
              eyebrow="Discover"
              title="New Releases"
              albums={albums.slice(25, 50)}
              loading={albumsLoading}
              viewAllHref="/browse"
            />
          )}
        </div>
      </div>

      <ShowcaseGrid albums={albums} />
      <AlbumShelfCarousel albums={albums} />
      <Footer />
    </>
  );
}
