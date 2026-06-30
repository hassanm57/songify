"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Billboard Hot 100 — Week of July 4, 2026
type Song = { title: string; artist: string };

const SONGS: Song[] = [
  { title: "Choosin' Texas",               artist: "Ella Langley" },
  { title: "I Knew It, I Knew You",        artist: "Taylor Swift" },
  { title: "Be Her",                       artist: "Ella Langley" },
  { title: "Stupid Song",                  artist: "Olivia Rodrigo" },
  { title: "Drop Dead",                    artist: "Olivia Rodrigo" },
  { title: "Janice STFU",                  artist: "Drake" },
  { title: "Hate That I Made You Love Me", artist: "Ariana Grande" },
  { title: "Man I Need",                   artist: "Olivia Dean" },
  { title: "I Can't Love You Anymore",     artist: "Ella Langley" },
  { title: "Dracula",                      artist: "Tame Impala & JENNIE" },
  { title: "So Easy (To Fall In Love)",    artist: "Olivia Dean" },
  { title: "I Just Might",                 artist: "Bruno Mars" },
  { title: "The Cure",                     artist: "Olivia Rodrigo" },
  { title: "Boston",                       artist: "Stella Lefty" },
  { title: "Risk It All",                  artist: "Bruno Mars" },
  { title: "Homewrecker",                  artist: "sombr" },
  { title: "Stateside",                    artist: "PinkPantheress" },
  { title: "Honeybee",                     artist: "Olivia Rodrigo" },
  { title: "Midnight Sun",                 artist: "Zara Larsson" },
  { title: "Shabang",                      artist: "Drake" },
  { title: "Be By You",                    artist: "Luke Combs" },
  { title: "Don't We",                     artist: "Morgan Wallen" },
  { title: "Earrings",                     artist: "Malcolm Todd" },
  { title: "Maggots For Brains",           artist: "Olivia Rodrigo" },
  { title: "Spend Dat",                    artist: "Yung Miami" },
  { title: "Cinderella",                   artist: "Mac Miller" },
  { title: "Expectations",                 artist: "Olivia Rodrigo" },
  { title: "My Way",                       artist: "Olivia Rodrigo" },
  { title: "Babydoll",                     artist: "Dominic Fike" },
  { title: "What's Wrong With Me",         artist: "Olivia Rodrigo" },
  { title: "Begged",                       artist: "Olivia Rodrigo" },
  { title: "Sleepless In A Hotel Room",    artist: "Luke Combs" },
  { title: "u + me = <3",                  artist: "Olivia Rodrigo" },
  { title: "Less",                         artist: "Olivia Rodrigo" },
  { title: "Loving Life Again",            artist: "Ella Langley" },
  { title: "Chicago",                      artist: "Michael Jackson" },
  { title: "E85",                          artist: "Don Toliver" },
  { title: "American Girls",               artist: "Harry Styles" },
  { title: "Ran To Atlanta",               artist: "Drake" },
  { title: "Die On This Hill",             artist: "Sienna Spiro" },
  { title: "Freakin' Out",                 artist: "Dexter And The Moonrocks" },
  { title: "Pop Dat Thang",               artist: "DaBaby" },
  { title: "Iconic By Mistake",            artist: "Le Sserafim" },
  { title: "The Great Divide",             artist: "Noah Kahan" },
  { title: "Human Nature",                 artist: "Michael Jackson" },
  { title: "Change My Mind",               artist: "Riley Green" },
  { title: "Don't Tell On Me",             artist: "Jason Aldean" },
  { title: "Whisper My Name",              artist: "Drake" },
  { title: "Hit The Wall",                 artist: "Gracie Abrams" },
  { title: "Cigarette Smoke",              artist: "Olivia Rodrigo" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function displayText(song: Song, i: number): string {
  if (i % 5 === 3) return song.title;
  return `${song.title} by ${song.artist}`;
}

type ArtEntry = { url: string; href: string };

const CHAR_DELAY = 55;
const IDLE_DELAY = 1900;

type Props = { className?: string };

export function OrbSearch({ className }: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  // null = loading/skeleton; ArtEntry = artwork ready
  const [art, setArt] = useState<ArtEntry | null>(null);

  const songs     = useMemo(() => shuffle(SONGS), []);
  const song      = songs[idx];
  const text      = displayText(song, idx);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const artCache    = useRef<Map<string, ArtEntry>>(new Map());

  // ── Typewriter ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current)  clearTimeout(timeoutRef.current);

    const chars = Array.from(text);
    setDisplayedText("");
    setIsTyping(true);

    let charIndex = 0;
    intervalRef.current = setInterval(() => {
      if (charIndex < chars.length) {
        setDisplayedText(chars.slice(0, charIndex + 1).join(""));
        charIndex += 1;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
        timeoutRef.current = setTimeout(
          () => setIdx((prev) => (prev + 1) % songs.length),
          IDLE_DELAY
        );
      }
    }, CHAR_DELAY);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current)  clearTimeout(timeoutRef.current);
    };
  }, [idx, songs, text]);

  // ── Artwork fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    setArt(null); // show skeleton while fetching

    const cacheKey = `${song.title}-${song.artist}`;
    const cached   = artCache.current.get(cacheKey);
    if (cached) { setArt(cached); return; }

    const controller = new AbortController();
    const term       = encodeURIComponent(`${song.title} ${song.artist}`);

    fetch(
      `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((j) => {
        const result = j.results?.[0];
        if (!result) return;
        const url   = (result.artworkUrl100 as string).replace("100x100bb", "400x400bb");
        const albumId: number | undefined = result.collectionId;
        const href  = albumId ? `/albums?id=${albumId}` : "/browse";
        const entry = { url, href };
        artCache.current.set(cacheKey, entry);
        setArt(entry);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [idx, songs, song.title, song.artist]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <div className="flex items-center gap-3">

        {/* ── Album art — always visible, crossfades between songs ── */}
        <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-elevated">
          <AnimatePresence>
            {art ? (
              /* Artwork */
              <motion.div
                key={art.url}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Link href={art.href} className="block w-full h-full" tabIndex={-1}>
                  <img
                    src={art.url}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </motion.div>
            ) : (
              /* Skeleton while fetching */
              <motion.div
                key={`sk-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 bg-elevated animate-pulse"
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Search pill ── */}
        <motion.div
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center gap-3 px-4 py-3 bg-background rounded-full border border-hairline transition-shadow"
          style={{
            boxShadow: isFocused
              ? "0 0 0 2px #C8FF00, 0 8px 24px rgba(0,0,0,0.1)"
              : "0 2px 10px rgba(0,0,0,0.07)",
          }}
        >
          {/* Lime pulsing orb */}
          <div className="relative flex-shrink-0 w-6 h-6">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-6 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #e8ff70 0%, #C8FF00 50%, #8ab800 100%)",
                boxShadow: "0 0 12px rgba(200,255,0,0.6), 0 0 24px rgba(200,255,0,0.2)",
              }}
            />
            <motion.div
              animate={{ scale: [0.7, 1.4, 0.7], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(200,255,0,0.3)" }}
            />
          </div>

          <div className="w-px h-5 bg-hairline flex-shrink-0" />

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`${displayedText}${isTyping ? "|" : ""}`}
            aria-label="Search songs and albums"
            className="flex-1 min-w-0 text-sm text-foreground placeholder-ink-soft bg-transparent border-none outline-none font-light tracking-wide"
          />

          {value && (
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 h-7 px-3 rounded-full bg-pop text-pop-ink text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Search
            </motion.button>
          )}
        </motion.div>

      </div>
    </motion.form>
  );
}
