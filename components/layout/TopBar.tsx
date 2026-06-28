"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Browse", href: "/browse" },
  { label: "Favorites", href: "/favorites" },
];

export function TopBar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-6 bg-background/90 backdrop-blur-md border-b border-hairline">
        {/* Wordmark */}
        <Link href="/" className="mr-8 flex items-center gap-0.5 font-bold text-lg tracking-tight select-none">
          Song
          <span className="relative">
            <span className="text-foreground">i</span>
            <span
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pop"
              aria-hidden
            />
          </span>
          fy
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 mr-auto">
          {NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-pop text-pop-ink"
                  : "text-ink-soft hover:text-foreground hover:bg-elevated"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search (⌘K)"
            className="group flex items-center gap-2 h-9 px-3 rounded-full border border-hairline hover:border-pop transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden className="text-ink-soft group-hover:text-foreground transition-colors">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <kbd className="hidden sm:inline text-[11px] text-ink-soft font-mono">⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
