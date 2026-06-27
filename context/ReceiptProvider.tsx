"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type PurchasedItem = {
  id: number;
  name: string;
  artistName: string;
  artwork: string;
  price: number | null;
  currency: string;
  orderNumber: string;
  purchasedAt: string;
  type: "album" | "track";
};

type ReceiptContextValue = {
  pendingPurchase: PurchasedItem | null;
  initiateCheckout: (item: PurchasedItem) => void;
  clearPurchase: () => void;
};

const ReceiptContext = createContext<ReceiptContextValue | null>(null);

export function ReceiptProvider({ children }: { children: React.ReactNode }) {
  const [pendingPurchase, setPendingPurchase] = useState<PurchasedItem | null>(null);

  const initiateCheckout = useCallback((item: PurchasedItem) => {
    setPendingPurchase(item);
  }, []);

  const clearPurchase = useCallback(() => {
    setPendingPurchase(null);
  }, []);

  return (
    <ReceiptContext.Provider value={{ pendingPurchase, initiateCheckout, clearPurchase }}>
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipt() {
  const ctx = useContext(ReceiptContext);
  if (!ctx) throw new Error("useReceipt must be used inside ReceiptProvider");
  return ctx;
}

function generateOrderNumber() {
  return "SGF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function makePurchasedItem(
  item: { id: number; name: string; artistName: string; artwork: string; price: number | null; currency: string },
  type: "album" | "track"
): PurchasedItem {
  return {
    ...item,
    orderNumber: generateOrderNumber(),
    purchasedAt: new Date().toISOString(),
    type,
  };
}
