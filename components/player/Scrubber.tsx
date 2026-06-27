"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  progress: number;
  onSeek: (ratio: number) => void;
  className?: string;
};

export function Scrubber({ progress, onSeek, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getRatio = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleClick = (e: React.MouseEvent) => {
    onSeek(getRatio(e.clientX));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    onSeek(getRatio(e.clientX));
  };

  return (
    <div
      ref={trackRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      role="slider"
      aria-label="Playback progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("group relative h-1 rounded-full bg-hairline cursor-pointer", className)}
    >
      {/* Fill */}
      <div
        className="h-full rounded-full bg-pop transition-[width] duration-100"
        style={{ width: `${progress * 100}%` }}
      />
      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-pop opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
}
