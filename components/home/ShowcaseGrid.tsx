"use client";

import { motion } from "framer-motion";
import { ScrollTiltedGrid } from "@/components/motion/ScrollTiltedGrid";
import type { Album } from "@/types";

type Props = { albums: Album[] };

export function ShowcaseGrid({ albums }: Props) {
  const images = albums.length
    ? albums.slice(0, 12).map((a) => a.artwork)
    : undefined; // falls back to DEFAULT_GRID_IMAGES

  return (
    <section className="relative overflow-hidden border-t border-hairline">
      {/* Section header */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <motion.p
          className="text-eyebrow text-ink-soft mb-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Chart toppers
        </motion.p>
        <motion.h2
          className="text-h2 whitespace-nowrap"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Now trending
          <span className="text-pop">.</span>
        </motion.h2>
      </div>

      <ScrollTiltedGrid
        images={images}
        maxWidth="2xl"
        gap={8}
        maxTilt={65}
        maxBlur={6}
        rounded="0.5rem"
      />
    </section>
  );
}
