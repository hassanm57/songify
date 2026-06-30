"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Billboard Hot 100 — Week of July 4, 2026 (live scraped)
const BASE_PLACEHOLDERS = [
  "I Knew It, I Knew You — Taylor Swift",
  "Choosin' Texas — Ella Langley",
  "Stupid Song — Olivia Rodrigo",
  "Drop Dead — Olivia Rodrigo",
  "Be Her — Ella Langley",
  "The Cure — Olivia Rodrigo",
  "Janice STFU — Drake",
  "Hate That I Made You Love Me — Ariana Grande",
  "Honeybee — Olivia Rodrigo",
  "Man I Need — Olivia Dean",
  "I Just Might — Bruno Mars",
  "Maggots For Brains — Olivia Rodrigo",
  "So Easy (To Fall In Love) — Olivia Dean",
  "I Can't Love You Anymore — Ella Langley & Morgan Wallen",
  "My Way — Olivia Rodrigo",
  "Begged — Olivia Rodrigo",
  "What's Wrong With Me — Olivia Rodrigo & Robert Smith",
  "Dracula — Tame Impala",
  "U + Me = — Olivia Rodrigo",
  "Expectations — Olivia Rodrigo",
  "Less — Olivia Rodrigo",
  "Boston — Stella Lefty",
  "Risk It All — Bruno Mars",
  "Stateside — PinkPantheress",
  "Purple — Olivia Rodrigo",
  "Shabang — Drake",
  "Cigarette Smoke — Olivia Rodrigo",
  "Homewrecker — Sombr",
  "Midnight Sun — Zara Larsson",
  "Earrings — Malcolm Todd",
  "Be By You — Luke Combs",
  "Don't We — Morgan Wallen",
  "Cinderella — Mac Miller & Ty Dolla $ign",
  "Babydoll — Dominic Fike",
  "Ran To Atlanta — Drake ft. Future",
  "Chicago — Michael Jackson",
  "Sleepless In A Hotel Room — Luke Combs",
  "E85 — Don Toliver",
  "Whisper My Name — Drake",
  "American Girls — Harry Styles",
  "Human Nature — Michael Jackson",
  "Change My Mind — Riley Green",
  "The Great Divide — Noah Kahan",
  "Swim — BTS",
  "Fever Dream — Alex Warren",
  "Hit The Wall — Gracie Abrams",
  "Mexico Honey — Kacey Musgraves",
  "What You Need — Tems",
  "Beautiful Things — Megan Moroney",
  "Dai Dai — Shakira & Burna Boy",
  "Willing And Able — Noah Kahan",
  "Woman — Kane Brown",
  "House Tour — Sabrina Carpenter",
  "Phone, Keys, Wallet — Lainey Wilson & John Mayer",
  "Girls — The Kid LAROI",
  "Pinky Up — Katseye",
  "Mr. Know It All — Teddy Swims",
  "Porch Light — Noah Kahan",
  "Don't Worry — Drake",
  "Empty Words — Corey Kent",
  "Rocky Mountain Low — Corey Kent & Koe Wetzel",
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
