"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types";

type Props = { artist: Artist; className?: string };

export function ArtistCard({ artist, className }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group text-center cursor-pointer select-none", className)}
    >
      <Link href={`/artists?id=${artist.id}`} className="block">
        <div className="w-full aspect-square rounded-full overflow-hidden bg-elevated mb-3 ring-2 ring-transparent group-hover:ring-pop transition-all duration-300">
          <div className="w-full h-full flex items-center justify-center bg-elevated">
            <span className="text-display opacity-20 text-4xl font-bold">
              {artist.name[0]}
            </span>
          </div>
        </div>
        <p className="text-sm font-bold truncate">{artist.name}</p>
        <p className="text-xs text-ink-soft mt-0.5 truncate">{artist.genre}</p>
      </Link>
    </motion.div>
  );
}
