"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const BASE_PLACEHOLDERS = [
  // From current charts
  "stupid song — Olivia Rodrigo",
  "Billie Jean — Michael Jackson",
  "hate that i made you love me — Ariana Grande",
  "Beauty And A Beat — Justin Bieber, Nicki Minaj",
  "SWIM — BTS",
  "Dai Dai — Shakira, Burna Boy",
  "the cure — Olivia Rodrigo",
  "Babydoll — Dominic Fike",
  "drop dead — Olivia Rodrigo",
  "Earrings — Malcolm Todd",
  "Beat It — Michael Jackson",
  "honeybee — Hippo Campus",
  // Billboard Hot 100 recent hits
  "A Bar Song (Tipsy) — Shaboozey",
  "Die With A Smile — Lady Gaga & Bruno Mars",
  "Too Sweet — Hozier",
  "Espresso — Sabrina Carpenter",
  "Please Please Please — Sabrina Carpenter",
  "Good Luck, Babe! — Chappell Roan",
  "I Had Some Help — Post Malone ft. Morgan Wallen",
  "Beautiful Things — Benson Boone",
  "Not Like Us — Kendrick Lamar",
  "Luther — Kendrick Lamar ft. SZA",
  "Timeless — The Weeknd & Playboi Carti",
  "APT. — Rose & Bruno Mars",
  "That's So True — Gracie Abrams",
  "BIRDS OF A FEATHER — Billie Eilish",
  "lunch — Billie Eilish",
  "Texas Hold Em — Beyonce",
  "we cant be friends — Ariana Grande",
  "Lose Control — Teddy Swims",
  "Fortnight — Taylor Swift ft. Post Malone",
  "Down Bad — Taylor Swift",
  "Cruel Summer — Taylor Swift",
  "suffer — Charlie xcx",
  "360 — Charli XCX",
  "Von Dutch — Charli XCX",
  "i like the way you kiss me — Artemas",
  "Stumblin In — Cyberhouse",
  "CLOUDS — NF",
  "Love You Next — Drake",
  "Search & Rescue — Drake",
  "Chemical — Post Malone",
  "Stick Season — Noah Kahan",
  "Outnumbered — Dermot Kennedy",
  "Stargazing — Myles Smith",
  "Wildfire — Cautious Clay",
  "Saturn — SZA",
  "Kill Bill — SZA",
  "Snooze — SZA",
  "Used — Jennifer Lopez & Cardi B",
  "GNX — Kendrick Lamar",
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

type Props = { className?: string };

export function OrbSearch({ className }: Props) {
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
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div
        animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 px-4 py-3 bg-background rounded-full border border-hairline transition-shadow"
        style={{
          boxShadow: isFocused
            ? "0 0 0 2px #C8FF00, 0 8px 24px rgba(0,0,0,0.1)"
            : "0 2px 10px rgba(0,0,0,0.07)",
        }}
      >
        {/* Lime pulsing orb */}
        <div className="relative flex-shrink-0 w-7 h-7">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-7 h-7 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, #e8ff70 0%, #C8FF00 50%, #8ab800 100%)",
              boxShadow: "0 0 14px rgba(200,255,0,0.6), 0 0 28px rgba(200,255,0,0.2)",
            }}
          />
          <motion.div
            animate={{ scale: [0.7, 1.4, 0.7], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(200,255,0,0.3)" }}
          />
        </div>

        <div className="w-px h-6 bg-hairline flex-shrink-0" />

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`${displayedText}${isTyping ? "|" : ""}`}
          aria-label="Search songs and albums"
          className="flex-1 text-sm text-foreground placeholder-ink-soft bg-transparent border-none outline-none font-light tracking-wide"
        />

        {value && (
          <motion.button
            type="submit"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-shrink-0 h-7 px-3.5 rounded-full bg-pop text-pop-ink text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Search
          </motion.button>
        )}
      </motion.div>
    </motion.form>
  );
}
