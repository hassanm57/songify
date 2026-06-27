export const GENRES = [
  "All",
  "Pop",
  "Hip-Hop/Rap",
  "R&B/Soul",
  "Dance/Electronic",
  "Rock",
  "Country",
  "Latin",
  "Alternative",
  "K-Pop",
  "Afrobeats",
] as const;

export type Genre = (typeof GENRES)[number];

export function normalizeGenre(raw: string): string {
  if (!raw) return "Other";
  if (raw.includes("Hip-Hop") || raw.includes("Rap")) return "Hip-Hop/Rap";
  if (raw.includes("R&B") || raw.includes("Soul")) return "R&B/Soul";
  if (raw.includes("Dance") || raw.includes("Electronic")) return "Dance/Electronic";
  return raw;
}
