"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PlayerTrack } from "@/types";

type PlayerState = {
  currentTrack: PlayerTrack | null;
  queue: PlayerTrack[];
  isPlaying: boolean;
  progress: number;   // 0–1
  duration: number;   // seconds
  volume: number;     // 0–1
};

type PlayerActions = {
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (ratio: number) => void;
  setVolume: (v: number) => void;
};

const PlayerContext = createContext<(PlayerState & PlayerActions) | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState((s) => ({
        ...s,
        progress: audio.duration ? audio.currentTime / audio.duration : 0,
        duration: audio.duration || 0,
      }));
    };
    const onEnded = () => {
      setState((s) => {
        const idx = s.queue.findIndex((t) => t.id === s.currentTrack?.id);
        const next = s.queue[idx + 1] ?? null;
        if (next?.previewUrl) {
          audio.src = next.previewUrl;
          audio.play();
          return { ...s, currentTrack: next, isPlaying: true, progress: 0 };
        }
        return { ...s, isPlaying: false, progress: 0 };
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const play = useCallback((track: PlayerTrack, queue: PlayerTrack[] = []) => {
    const audio = audioRef.current;
    if (!audio || !track.previewUrl) return;
    audio.src = track.previewUrl;
    audio.play();
    setState((s) => ({
      ...s,
      currentTrack: track,
      queue: queue.length ? queue : [track],
      isPlaying: true,
      progress: 0,
    }));
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const idx = s.queue.findIndex((t) => t.id === s.currentTrack?.id);
      const track = s.queue[idx + 1];
      if (!track?.previewUrl) return s;
      const audio = audioRef.current!;
      audio.src = track.previewUrl;
      audio.play();
      return { ...s, currentTrack: track, isPlaying: true, progress: 0 };
    });
  }, []);

  const prev = useCallback(() => {
    setState((s) => {
      const idx = s.queue.findIndex((t) => t.id === s.currentTrack?.id);
      const track = s.queue[idx - 1];
      if (!track?.previewUrl) return s;
      const audio = audioRef.current!;
      audio.src = track.previewUrl;
      audio.play();
      return { ...s, currentTrack: track, isPlaying: true, progress: 0 };
    });
  }, []);

  const seek = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = ratio * audio.duration;
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState((s) => ({ ...s, volume: v }));
  }, []);

  return (
    <PlayerContext.Provider value={{ ...state, play, pause, resume, next, prev, seek, setVolume }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
