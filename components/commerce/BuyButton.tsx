"use client";

import { useReceipt, makePurchasedItem } from "@/context/ReceiptProvider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Album, Track } from "@/types";

type AlbumBuyProps = {
  item: Album;
  type: "album";
  className?: string;
  size?: "sm" | "md";
};

type TrackBuyProps = {
  item: Track;
  type: "track";
  className?: string;
  size?: "sm" | "md";
};

type Props = AlbumBuyProps | TrackBuyProps;

export function BuyButton({ item, type, className, size = "md" }: Props) {
  const { initiateCheckout } = useReceipt();

  function handleBuy() {
    initiateCheckout(
      makePurchasedItem(
        {
          id: item.id,
          name: item.name,
          artistName: item.artistName,
          artwork: item.artwork,
          price: item.price,
          currency: item.currency,
        },
        type
      )
    );
  }

  const label = item.price ? `Buy ${formatPrice(item.price)}` : "Buy";

  return (
    <button
      onClick={handleBuy}
      className={cn(
        "rounded-full bg-pop text-pop-ink font-bold hover:opacity-90 active:scale-95 transition-all",
        size === "md" ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-xs",
        className
      )}
    >
      {label}
    </button>
  );
}
