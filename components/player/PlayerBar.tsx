"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePlayer } from "@/context/PlayerProvider";
import { Scrubber } from "./Scrubber";
import { formatSeconds } from "@/lib/format";
import { cn } from "@/lib/utils";

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 2.5L13 8L5 13.5V2.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3" y="2" width="4" height="12" rx="1" fill="currentColor" />
      <rect x="9" y="2" width="4" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M11 2L4 7L11 12V2Z" fill="currentColor" />
      <rect x="2" y="2" width="2" height="10" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 2L10 7L3 12V2Z" fill="currentColor" />
      <rect x="10" y="2" width="2" height="10" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function VolumeIcon({ level }: { level: number }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 5.5H5.5L9 2.5V13.5L5.5 10.5H3V5.5Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      {level > 0 && <path d="M11 5.5C11.8 6.3 12.3 7.1 12.3 8C12.3 8.9 11.8 9.7 11 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />}
      {level > 0.5 && <path d="M12.5 3.5C14 4.8 14.8 6.3 14.8 8C14.8 9.7 14 11.2 12.5 12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />}
    </svg>
  );
}

export function PlayerBar() {
  const player = usePlayer();
  const { currentTrack, isPlaying, progress, duration, volume, pause, resume, next, prev, seek, setVolume } = player;

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          key="player-bar"
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 inset-x-0 z-50 h-20 bg-background/95 backdrop-blur-lg border-t border-hairline"
        >
          {/* Progress bar sits flush at top */}
          <Scrubber
            progress={progress}
            onSeek={seek}
            className="absolute top-0 inset-x-0 rounded-none h-[3px] group-hover:h-1"
          />

          <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-4">

            {/* Left: artwork + track info */}
            <div className="flex items-center gap-3 w-56 flex-shrink-0 min-w-0">
              <Link href={`/albums?id=${currentTrack.albumId}`} className="flex-shrink-0">
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.albumName}
                  className="w-11 h-11 rounded object-cover"
                />
              </Link>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">{currentTrack.name}</p>
                <p className="text-xs text-ink-soft truncate mt-0.5">{currentTrack.artistName}</p>
              </div>
            </div>

            {/* Center: controls + scrubber */}
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              {/* Transport controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={prev}
                  aria-label="Previous"
                  className="text-ink-soft hover:text-foreground transition-colors"
                >
                  <PrevIcon />
                </button>

                <button
                  onClick={isPlaying ? pause : resume}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                <button
                  onClick={next}
                  aria-label="Next"
                  className="text-ink-soft hover:text-foreground transition-colors"
                >
                  <NextIcon />
                </button>
              </div>

              {/* Scrubber + time */}
              <div className="w-full max-w-md flex items-center gap-2">
                <span className="text-[10px] text-ink-soft tabular-nums w-7 text-right flex-shrink-0">
                  {formatSeconds(progress * duration)}
                </span>
                <Scrubber progress={progress} onSeek={seek} className="flex-1" />
                <span className="text-[10px] text-ink-soft tabular-nums w-7 flex-shrink-0">
                  {formatSeconds(duration)}
                </span>
              </div>
            </div>

            {/* Right: volume */}
            <div className="hidden md:flex items-center gap-2 w-36 flex-shrink-0">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
                aria-label="Toggle mute"
                className="text-ink-soft hover:text-foreground transition-colors flex-shrink-0"
              >
                <VolumeIcon level={volume} />
              </button>
              <div className="relative flex-1 h-1 rounded-full bg-hairline cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
                }}
              >
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-100"
                  style={{ width: `${volume * 100}%` }}
                />
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-foreground",
                    "opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                  style={{ left: `${volume * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
