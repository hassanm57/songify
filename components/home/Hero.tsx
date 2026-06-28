"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, type Variants } from "framer-motion";
import { useRef } from "react";
import { MagneticHover } from "@/components/ui/MagneticHover";
import { OrbSearch } from "@/components/search/OrbSearch";
import type { Album } from "@/types";

const easeOut = [0.22, 1, 0.36, 1] as const;

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 40, skewY: 4 },
  visible: (i: number) => ({
    opacity: 1, y: 0, skewY: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: easeOut },
  }),
};

const HEADLINE = ["The", "latest,", "beautifully."];

function BrowseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <rect x="0.5" y="8" width="3" height="5" rx="0.5" fill="currentColor" />
      <rect x="5" y="4.5" width="3" height="8.5" rx="0.5" fill="currentColor" />
      <rect x="9.5" y="0.5" width="3" height="12.5" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type Props = { featured: Album | null };

// Album column width shared between the left spacer and the right album column
// so text stays visually centered.
const COL = "w-64 xl:w-80 flex-shrink-0";

export function Hero({ featured }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY       = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [0, -90]);
  const textY        = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [0, 50]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blobY        = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden"
    >
      {/* Lime glow blob */}
      <motion.div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-3xl bg-pop pointer-events-none"
        style={{ y: blobY }}
        aria-hidden
      />

      <div className="w-full max-w-7xl mx-auto px-6 py-20 flex items-center gap-8 lg:gap-16">

        {/* Left spacer — same width as album column, keeps text visually centered */}
        <div className={`hidden lg:block ${COL}`} aria-hidden />

        {/* Center: all text content */}
        <motion.div
          style={{ y: textY }}
          className="flex-1 flex flex-col items-center text-center min-w-0"
        >
          <motion.p
            className="text-eyebrow text-ink-soft mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            Global Charts · Updated Daily
          </motion.p>

          <h1 className="text-display mb-8 overflow-hidden" aria-label="The latest, beautifully.">
            {HEADLINE.map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mr-[0.25em]"
              >
                {i === 2 ? (
                  <span>
                    beautifully
                    <span className="text-pop">.</span>
                  </span>
                ) : word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="text-ink-soft text-lg leading-relaxed max-w-md mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: easeOut }}
          >
            Discover and own the songs &amp; albums defining the moment, pulled live from global charts.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: easeOut }}
          >
            <MagneticHover strength={0.4}>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-background text-sm font-bold hover:opacity-80 transition-opacity"
              >
                <BrowseIcon />
                Browse charts
              </Link>
            </MagneticHover>
            <MagneticHover strength={0.4}>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-hairline text-sm font-medium hover:border-foreground hover:bg-elevated transition-colors"
              >
                <SearchIcon />
                Search music
              </Link>
            </MagneticHover>
          </motion.div>

          {/* OrbSearch — pushed down with extra top margin */}
          <OrbSearch className="w-full max-w-sm mt-12" />
        </motion.div>

        {/* Right: featured album — parallaxes on scroll, matches spacer width */}
        <motion.div
          className={`relative hidden lg:flex items-center justify-center ${COL} pt-12`}
          style={{ y: imageY, opacity: imageOpacity }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: easeOut }}
        >
          {featured && featured.artwork ? (
            <>
              <motion.div
                animate={shouldReduce ? {} : { y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Link href={`/albums?id=${featured.id}`}>
                  <img
                    src={featured.artwork}
                    alt={featured.name}
                    className="w-56 h-56 xl:w-72 xl:h-72 object-cover rounded-xl shadow-2xl"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </Link>

                {/* Now-playing pill */}
                <motion.div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-hairline rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <motion.span
                    className="w-2 h-2 rounded-full bg-pop flex-shrink-0"
                    animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  <span className="text-xs font-bold truncate max-w-[130px]">{featured.name}</span>
                  <span className="text-xs text-ink-soft flex-shrink-0">by {featured.artistName}</span>
                </motion.div>

                {/* #1 badge */}
                <div className="absolute -top-3 -right-3 bg-pop text-pop-ink text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  #1 Chart
                </div>
              </motion.div>

              {/* Ghost stacked cards */}
              <div className="absolute top-16 -right-2 w-56 h-56 xl:w-72 xl:h-72 rounded-xl bg-elevated -z-0 rotate-3 opacity-60" aria-hidden />
              <div className="absolute top-22 -right-5 w-56 h-56 xl:w-72 xl:h-72 rounded-xl bg-elevated -z-10 rotate-6 opacity-30" aria-hidden />
            </>
          ) : (
            <div className="w-56 h-56 xl:w-72 xl:h-72 rounded-xl bg-elevated animate-pulse" />
          )}
        </motion.div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{ opacity: arrowOpacity }}
      >
        <motion.div
          animate={shouldReduce ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="text-ink-soft">
            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
