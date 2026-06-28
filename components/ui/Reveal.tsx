"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

const OFFSETS: Record<Direction, { x?: number; y?: number }> = {
  up:    { y: 36 },
  down:  { y: -36 },
  left:  { x: 36 },
  right: { x: -36 },
};

type Props = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  margin?: string;
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.65,
  className,
  margin = "-60px",
}: Props) {
  const shouldReduce = useReducedMotion();
  const offset = OFFSETS[direction];

  return (
    <motion.div
      className={className}
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{
        duration: shouldReduce ? 0.15 : duration,
        delay: shouldReduce ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
