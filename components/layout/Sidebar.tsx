"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/genres";

type GenreProps = {
  selectedGenre: string;
  onSelectGenre: (g: string) => void;
};

const NAV_LINKS = [
  { label: "Browse",    href: "/browse" },
  { label: "Songs",     href: "/browse?tab=songs" },
  { label: "Albums",    href: "/browse?tab=albums" },
  { label: "Favorites", href: "/favorites" },
];

/** Sticky left sidebar — desktop only (lg+). Place inside the flex row. */
export function DesktopSidebar({ selectedGenre, onSelectGenre }: GenreProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-4 border-r border-hairline">
      <nav className="space-y-0.5 mb-8">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href
                ? "font-semibold text-foreground bg-elevated"
                : "text-ink-soft hover:text-foreground hover:bg-elevated"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <p className="text-eyebrow text-ink-soft mb-3 px-3">Genres</p>
      <ul className="space-y-0.5">
        {GENRES.map((genre) => (
          <li key={genre}>
            <button
              onClick={() => onSelectGenre(genre)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedGenre === genre
                  ? "bg-pop text-pop-ink font-semibold"
                  : "text-ink-soft hover:text-foreground hover:bg-elevated"
              )}
            >
              {genre}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Horizontal genre chip scroller — mobile only (below lg). Place above the flex row. */
export function MobileGenreBar({ selectedGenre, onSelectGenre }: GenreProps) {
  return (
    <div className="lg:hidden flex gap-2 overflow-x-auto px-6 py-3 border-b border-hairline">
      {GENRES.map((genre) => (
        <button
          key={genre}
          onClick={() => onSelectGenre(genre)}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
            selectedGenre === genre
              ? "bg-pop text-pop-ink border-pop font-semibold"
              : "border-hairline text-ink-soft hover:border-foreground hover:text-foreground"
          )}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
