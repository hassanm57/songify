"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useReceipt } from "@/context/ReceiptProvider";
import { formatPrice } from "@/lib/format";

const ease = [0.22, 1, 0.36, 1] as const;

type Spark = { id: number; x: number; y: number; vx: number; vy: number; life: number };

function useConfetti(active: boolean) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const frameRef = useRef<number | null>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (!active || shouldReduce) return;
    const initial: Spark[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 6 + 3),
      life: 1,
    }));
    setSparks(initial);

    let ticks = 0;
    function tick() {
      ticks++;
      setSparks((prev) =>
        prev
          .map((s) => ({ ...s, x: s.x + s.vx * 0.8, y: s.y + s.vy * 0.8 + 0.3, vy: s.vy + 0.25, life: s.life - 0.025 }))
          .filter((s) => s.life > 0)
      );
      if (ticks < 60) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [active, shouldReduce]);

  return sparks;
}

function LineItem({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      className="flex justify-between items-baseline py-1.5 border-b border-dashed border-hairline last:border-0"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease }}
    >
      <span className="text-[11px] uppercase tracking-widest font-bold text-ink-soft">{label}</span>
      <span className="text-sm font-mono tabular-nums text-ink ml-4 text-right">{value}</span>
    </motion.div>
  );
}

export function ReceiptModal() {
  const { pendingPurchase, clearPurchase } = useReceipt();
  const [stampVisible, setStampVisible] = useState(false);
  const shouldReduce = useReducedMotion();
  const sparks = useConfetti(stampVisible);

  useEffect(() => {
    if (!pendingPurchase) { setStampVisible(false); return; }
    const t = setTimeout(() => setStampVisible(true), shouldReduce ? 0 : 900);
    return () => clearTimeout(t);
  }, [pendingPurchase, shouldReduce]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") clearPurchase(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clearPurchase]);

  const item = pendingPurchase;

  const formattedDate = item
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(item.purchasedAt))
    : "";
  const formattedTime = item
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(item.purchasedAt))
    : "";

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={clearPurchase}
            aria-hidden
          />

          {/* Receipt wrapper — confetti lives here */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Confetti sparks */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {sparks.map((s) => (
                <div
                  key={s.id}
                  className="absolute w-2 h-2 rounded-sm bg-pop"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    opacity: s.life,
                    transform: `rotate(${s.id * 37}deg) scale(${s.life})`,
                  }}
                />
              ))}
            </div>

            {/* Paper slip */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Purchase receipt"
              className="pointer-events-auto relative w-[min(90vw,340px)] bg-white dark:bg-[#111] rounded-sm shadow-2xl overflow-hidden"
              initial={{ scaleY: 0, opacity: 0, originY: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0, originY: 0 }}
              transition={{ duration: shouldReduce ? 0.15 : 0.55, ease }}
              style={{ transformOrigin: "top center" }}
            >
              {/* Perforated top edge */}
              <div className="h-3 bg-elevated dark:bg-[#1a1a1a] border-b border-dashed border-hairline" />

              <div className="px-6 py-5">
                {/* Store header */}
                <motion.div
                  className="text-center mb-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-ink-soft mb-1">Digital Receipt</p>
                  <p className="text-xl font-black tracking-tight">Songify</p>
                </motion.div>

                {/* Artwork */}
                <motion.div
                  className="flex justify-center mb-4"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, duration: 0.4, ease }}
                >
                  <img
                    src={item.artwork}
                    alt={item.name}
                    className="w-24 h-24 rounded object-cover shadow-md"
                  />
                </motion.div>

                {/* Line items */}
                <div className="space-y-0 mb-4">
                  <LineItem label="Item" value={item.name} delay={0.35} />
                  <LineItem label="Artist" value={item.artistName} delay={0.42} />
                  <LineItem label="Type" value={item.type === "album" ? "Album" : "Track"} delay={0.49} />
                  <LineItem label="Order" value={item.orderNumber} delay={0.56} />
                  <LineItem label="Date" value={formattedDate} delay={0.63} />
                  <LineItem label="Time" value={formattedTime} delay={0.70} />
                </div>

                {/* Total */}
                <motion.div
                  className="flex justify-between items-center py-3 border-t-2 border-ink mb-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.78, duration: 0.3 }}
                >
                  <span className="text-sm font-black uppercase tracking-widest">Total</span>
                  <span className="text-xl font-black tabular-nums">
                    {item.price ? formatPrice(item.price) : "Free"}
                  </span>
                </motion.div>

                {/* PAID stamp */}
                <div className="relative flex justify-center mb-5 h-16 items-center">
                  <AnimatePresence>
                    {stampVisible && (
                      <motion.div
                        className="border-4 border-pop rounded px-4 py-1 rotate-[-12deg] select-none"
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      >
                        <span className="text-2xl font-black tracking-[0.2em] text-pop">PAID</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close */}
                <motion.button
                  onClick={clearPurchase}
                  className="w-full py-2.5 bg-ink text-white dark:bg-white dark:text-ink text-sm font-bold rounded-full hover:opacity-80 transition-opacity"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.3 }}
                >
                  Done
                </motion.button>
              </div>

              {/* Perforated bottom edge */}
              <div className="h-3 bg-elevated dark:bg-[#1a1a1a] border-t border-dashed border-hairline" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
