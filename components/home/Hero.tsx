"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { Album } from "@/types";

const easeOut = [0.22, 1, 0.36, 1] as const;

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 40, skewY: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: easeOut },
  }),
};

const HEADLINE = ["The", "latest,", "beautifully."];

type Props = { featured: Album | null };

export function Hero({ featured }: Props) {

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center px-6 lg:px-12 overflow-hidden">
      {/* Background accent blob */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-3xl bg-pop pointer-events-none"
        aria-hidden
      />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-20">
        {/* Left — text */}
        <div>
          <motion.p
            className="text-eyebrow text-ink-soft mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="text-ink-soft text-lg leading-relaxed max-w-md mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Discover and own the songs &amp; albums defining the moment — from global charts, live.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/browse"
              className="px-7 py-3.5 rounded-full bg-ink text-background text-sm font-bold hover:opacity-80 transition-opacity"
            >
              Browse charts
            </Link>
            <Link
              href="/search"
              className="px-7 py-3.5 rounded-full border border-hairline text-sm font-medium hover:border-foreground hover:bg-elevated transition-colors"
            >
              Search music
            </Link>
          </motion.div>
        </div>

        {/* Right — featured album */}
        {featured ? (
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Floating artwork */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Link href={`/albums/${featured.id}`}>
                <img
                  src={featured.artwork}
                  alt={featured.name}
                  className="w-72 h-72 lg:w-96 lg:h-96 object-cover rounded-xl shadow-2xl"
                  priority-hint="high"
                />
              </Link>

              {/* Now-playing pill */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-hairline rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <span className="w-2 h-2 rounded-full bg-pop animate-pulse flex-shrink-0" />
                <span className="text-xs font-bold truncate max-w-[160px]">{featured.name}</span>
                <span className="text-xs text-ink-soft flex-shrink-0">— {featured.artistName}</span>
              </motion.div>

              {/* Decorative tag */}
              <div className="absolute -top-3 -right-3 bg-pop text-pop-ink text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                #{" "}1 Chart
              </div>
            </motion.div>

            {/* Stacked ghost cards behind */}
            <div className="absolute top-6 right-6 lg:right-0 w-72 h-72 lg:w-96 lg:h-96 rounded-xl bg-elevated -z-10 rotate-3 opacity-60" aria-hidden />
            <div className="absolute top-12 right-12 lg:right-6 w-72 h-72 lg:w-96 lg:h-96 rounded-xl bg-elevated -z-20 rotate-6 opacity-30" aria-hidden />
          </motion.div>
        ) : (
          <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-xl bg-elevated animate-pulse" />
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-eyebrow text-ink-soft">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-ink-soft to-transparent"
        />
      </motion.div>
    </section>
  );
}
