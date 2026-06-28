"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ScrollTiltedGrid, DEFAULT_GRID_IMAGES } from "@/components/motion/ScrollTiltedGrid";
import type { Album } from "@/types";

type Props = { albums: Album[] };

export function ShowcaseGrid({ albums }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const headerY = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [40, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  // Use live album artwork; fall back to curated images only if all are empty
  const liveAlbums = albums.slice(0, 12).filter((a) => a.artwork);
  const liveImages = liveAlbums.map((a) => a.artwork) as string[];
  const liveLinks = liveAlbums.map((a) => `/albums?id=${a.id}`);

  const images = liveImages.length >= 4 ? liveImages : undefined; // undefined → DEFAULT_GRID_IMAGES
  const links = liveImages.length >= 4 ? liveLinks : undefined;

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t border-hairline">
      {/* Section header — parallaxes in from below */}
      <motion.div
        className="sticky top-28 z-20 text-center pointer-events-none"
        style={{ y: headerY, opacity: headerOpacity }}
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
