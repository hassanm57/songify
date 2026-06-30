"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatYear } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import type { Album } from "@/types";

type Props = { albums: Album[] };

export function AlbumShelfCarousel({ albums }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    containScroll: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Subtle parallax on the whole section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    // @ts-ignore -- valid runtime option, not yet in this version's types
    layoutEffect: false,
  });
  const sectionY = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [30, -30]);

  if (!albums.length) return null;

  // Only use albums with artwork for the shelf
  const withArtwork = albums.filter((a) => a.artwork);
  if (!withArtwork.length) return null;
  const shelf = withArtwork.slice(0, 15);

  return (
    <section ref={sectionRef} className="border-t border-hairline overflow-hidden">
      <motion.div style={{ y: sectionY }} className="py-20">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <Reveal direction="up">
          <p className="text-eyebrow text-ink-soft mb-2">Featured shelf</p>
        </Reveal>
        <div className="flex items-end justify-between">
          <Reveal direction="up" delay={0.08}>
            <h2 className="text-h2">This week&apos;s picks</h2>
          </Reveal>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous album"
              className="w-9 h-9 rounded-full border border-hairline flex items-center justify-center hover:border-pop hover:bg-pop hover:text-pop-ink transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next album"
              className="w-9 h-9 rounded-full border border-hairline flex items-center justify-center hover:border-pop hover:bg-pop hover:text-pop-ink transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex items-end gap-4 px-[calc(50vw-120px)]">
          {shelf.map((album, i) => {
            const isCenter = i === selectedIndex;
            return (
              <motion.div
                key={album.id}
                animate={{
                  width: isCenter ? 240 : 72,
                  opacity: isCenter ? 1 : 0.45,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex-none overflow-hidden rounded-lg cursor-pointer"
              >
                <Link href={`/albums?id=${album.id}`} tabIndex={isCenter ? 0 : -1}>
                  <div className={cn(
                    "relative overflow-hidden rounded-lg bg-elevated",
                    isCenter ? "aspect-square" : "aspect-[1/3]"
                  )}>
                    <img
                      src={album.artwork}
                      alt={album.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    {isCenter && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <p className="text-white font-bold text-sm leading-tight truncate">{album.name}</p>
                        <p className="text-white/70 text-xs mt-0.5 truncate">
                          {album.artistName} · {formatYear(album.releaseDate)}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      </motion.div>
    </section>
  );
}
