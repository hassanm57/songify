export function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatPrice(price: number | null, currency = "USD"): string {
  if (price === null || price === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

export function formatYear(dateStr: string): string {
  return dateStr ? new Date(dateStr).getFullYear().toString() : "";
}
