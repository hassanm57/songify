"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const BASE_PLACEHOLDERS = [
  "Blinding Lights — The Weeknd",
  "Anti-Hero — Taylor Swift",
  "As It Was — Harry Styles",
  "Heat Waves — Glass Animals",
  "Levitating — Dua Lipa",
  "Good 4 U — Olivia Rodrigo",
  "drivers license — Olivia Rodrigo",
  "STAY — The Kid LAROI",
  "Watermelon Sugar — Harry Styles",
  "Circles — Post Malone",
  "Sunflower — Post Malone",
  "Lucid Dreams — Juice WRLD",
  "Thank U, Next — Ariana Grande",
  "God's Plan — Drake",
  "SICKO MODE — Travis Scott",
  "Shape of You — Ed Sheeran",
  "Despacito — Luis Fonsi",
  "Montero — Lil Nas X",
  "Uptown Funk — Mark Ronson",
  "Shake It Off — Taylor Swift",
  "Rolling in the Deep — Adele",
  "Someone Like You — Adele",
  "Bohemian Rhapsody — Queen",
  "Billie Jean — Michael Jackson",
  "Thriller — Michael Jackson",
  "Purple Rain — Prince",
  "Hotel California — Eagles",
  "Smells Like Teen Spirit — Nirvana",
  "Sweet Child O Mine — Guns N Roses",
  "Superstition — Stevie Wonder",
  "AFTER HOURS — The Weeknd",
  "MIDNIGHTS — Taylor Swift",
  "Un Verano Sin Ti — Bad Bunny",
  "SOUR — Olivia Rodrigo",
  "PLANET HER — Doja Cat",
  "CERTIFIED LOVER BOY — Drake",
  "Mr. Morale & The Big Steppers — Kendrick Lamar",
  "Happier Than Ever — Billie Eilish",
  "Future Nostalgia — Dua Lipa",
  "Fine Line — Harry Styles",
  "ASTROWORLD — Travis Scott",
  "IGOR — Tyler, the Creator",
  "Chromakopia — Tyler, the Creator",
  "GNX — Kendrick Lamar",
  "Cowboy Carter — Beyonce",
  "Eternal Sunshine — Ariana Grande",
  "Short n Sweet — Sabrina Carpenter",
  "hit me hard and soft — Billie Eilish",
  "VULTURES 1 — Ye",
  "For All The Dogs — Drake",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CHAR_DELAY = 55;
const IDLE_DELAY = 1800;

export function OrbSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const placeholders = useMemo(() => shuffle(BASE_PLACEHOLDERS), []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const current = placeholders[placeholderIndex];
    if (!current) return;
    const chars = Array.from(current);

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
        timeoutRef.current = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        }, IDLE_DELAY);
      }
    }, CHAR_DELAY);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [placeholderIndex, placeholders]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  }

  return (
    <div className="w-full flex justify-center px-6 pt-8 pb-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        <motion.div
          animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 px-5 py-4 bg-[#0A0A0A] rounded-full border border-transparent"
          style={{
            boxShadow: isFocused
              ? "0 0 0 2px #C8FF00, 0 20px 60px rgba(0,0,0,0.25)"
              : "0 8px 40px rgba(0,0,0,0.18)",
          }}
        >
          {/* Lime pulsing orb */}
          <div className="relative flex-shrink-0 w-10 h-10">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="w-10 h-10 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 35%, #e8ff70 0%, #C8FF00 50%, #8ab800 100%)",
                boxShadow: "0 0 20px rgba(200,255,0,0.6), 0 0 40px rgba(200,255,0,0.25)",
              }}
            />
            <motion.div
              animate={{ scale: [0.7, 1.4, 0.7], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(200,255,0,0.3)" }}
            />
          </div>

          <div className="w-px h-8 bg-[#2a2a2a] flex-shrink-0" />

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`${displayedText}${isTyping ? "|" : ""}`}
            aria-label="Search songs and albums"
            className="flex-1 text-base text-white placeholder-[#555] bg-transparent border-none outline-none font-light tracking-wide"
          />

          {value && (
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex-shrink-0 h-8 px-4 rounded-full bg-pop text-pop-ink text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Search
            </motion.button>
          )}
        </motion.div>
      </motion.form>
    </div>
  );
}
