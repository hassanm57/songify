"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ScrollTiltedGrid, DEFAULT_GRID_IMAGES } from "@/components/motion/ScrollTiltedGrid";
import type { Album } from "@/types";

type Props = { albums: Album[] };

export function ShowcaseGrid({ albums }: Props) {
  const shouldReduce = useReducedMotion();

  const liveAlbums = albums.slice(0, 12).filter((a) => a.artwork);
  const liveImages = liveAlbums.map((a) => a.artwork) as string[];
  const liveLinks = liveAlbums.map((a) => `/albums?id=${a.id}`);

  const images = liveImages.length >= 4 ? liveImages : undefined;
  const links  = liveImages.length >= 4 ? liveLinks  : undefined;

  return (
    <section className="relative overflow-hidden border-t border-hairline">
      {/* Section header — animates in as the section enters the viewport */}
      <motion.div
        className="sticky top-28 z-20 text-center pointer-events-none"
        initial={{ y: shouldReduce ? 0 : 40, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: false, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-eyebrow text-ink-soft mb-2">Chart toppers</p>
        <h2 className="text-h2">
          Now trending
          <motion.span
            className="text-pop inline-block"
            animate={shouldReduce ? {} : { scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            .
          </motion.span>
        </h2>
      </motion.div>

      <ScrollTiltedGrid
        images={images ?? [...DEFAULT_GRID_IMAGES]}
        links={links}
        maxWidth="2xl"
        gap={8}
        maxTilt={65}
        maxBlur={6}
        rounded="0.5rem"
      />
    </section>
  );
}
