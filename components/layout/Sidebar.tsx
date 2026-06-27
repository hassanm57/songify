"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/genres";

type Props = {
  selectedGenre: string;
  onSelectGenre: (g: string) => void;
};

const NAV_LINKS = [
  { label: "Browse", href: "/browse", icon: "⊞" },
  { label: "Songs", href: "/browse?tab=songs", icon: "♫" },
  { label: "Albums", href: "/browse?tab=albums", icon: "⬛" },
  { label: "Favorites", href: "/favorites", icon: "♥" },
];

export function Sidebar({ selectedGenre, onSelectGenre }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-4 border-r border-hairline">
        <nav className="space-y-0.5 mb-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-soft hover:text-foreground hover:bg-elevated transition-colors"
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
                    ? "bg-pop text-pop-ink font-bold"
                    : "text-ink-soft hover:text-foreground hover:bg-elevated"
                )}
              >
                {genre}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile genre chips */}
      <div className="lg:hidden flex gap-2 overflow-x-auto px-6 pb-4 pt-2 scrollbar-none">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre)}
            className={cn(
              "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              selectedGenre === genre
                ? "bg-pop text-pop-ink border-pop font-bold"
                : "border-hairline text-ink-soft hover:border-foreground hover:text-foreground"
            )}
          >
            {genre}
          </button>
        ))}
      </div>
    </>
  );
}
