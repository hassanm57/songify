# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Songify — Build Plan

A **frontend-only, fully static** website for discovering and "buying" the latest
music — songs, albums, and artists pulled live from current global charts. The
experience is editorial, lively, and heavily animated, on a **white** canvas with
the **Puritan** typeface and a monochrome-plus-neon aesthetic.

> This document is the source of truth for the build. Update it as decisions
> change. Everything below reflects choices confirmed with the project owner.

---

## 1. Confirmed Decisions (do not re-litigate)

| Area | Decision |
| --- | --- |
| Rendering | **Static**. Next.js with `output: "export"` — pure HTML/JS/CSS, no server. |
| Framework | **Next.js (App Router) + TypeScript + Tailwind CSS + framer-motion**. |
| UI primitives | **shadcn/ui** (Radix-based, Tailwind-styled) for accessible modal/dropdown/tabs/slider/combobox behavior. |
| Smooth scroll | **Lenis** for momentum scrolling that elevates the immersive scroll-driven motion. |
| Carousel | **Embla Carousel** for the album-shelf (drag + snap + center spotlight). |
| Class utils | **clsx + tailwind-merge** via a `cn()` helper for conditional class composition. |
| Optional polish | `sonner` (toasts), `vaul` (drawers), `tailwindcss-animate` — add only when a moment needs them. |
| Data | **Live iTunes / Apple Marketing APIs** (no key, CORS-friendly, client-side fetch). |
| Audio | **30-second previews** with a **persistent bottom player bar**. |
| Buy flow | "Buy Now" triggers an **animated digital receipt** (no real payment). |
| Background | **White** (`#FFFFFF`) is the default canvas. Optional dark-mode toggle. |
| Typography | **Puritan** (Google Fonts) as the primary family. |
| Palette | Monochrome base (black/white/grey) + **neon lime `#C8FF00`** as the single pop accent. |
| Motion | **Full immersive** — scroll-driven, parallax, tilt, magnetic hover, page transitions. |
| Homepage layout | **Card-library rails** (genre rows) with a left sidebar, à la the HomeLibrary/CROWD refs. |
| Catalog scope | **Global charts, all genres**, with genre filtering. |
| Card click | **Full detail pages** for albums and artists. |
| Extra features | **Search**, **genre + sort filters**, **favorites/wishlist (localStorage)**, **dark-mode toggle**. |

---

## 2. Vision & Art Direction

The feeling: a high-end music magazine that happens to be a store. Generous white
space, oversized Puritan headings, crisp black UI, and lime used *surgically* —
only on play buttons, active states, prices/CTAs, and focus rings. Album art does
the color work; the chrome stays monochrome so covers pop.

Inspiration distilled from the provided references:
- **BEAT Records** — bold poster typography, confident hero, framed album trios.
- **CROWD player** — sidebar nav, sort/filter controls, sticky bottom player.
- **Kurosawa VHS shelf** — a horizontal "spines & covers" carousel with a spotlighted center item (used as a feature section).
- **HomeLibrary** — genre rails of "Most Popular" / "Recommended" cards.
- **Screen (Spirited Away)** — clean white detail-page layout with metadata columns and a "Related" rail.
- **ScrollTiltedGrid** — the provided framer-motion component, used as an immersive editorial showcase band.

We **inspire from, never copy** these layouts.

---

## 3. Design System

### 3.1 Color tokens (CSS variables in `globals.css`)
```
--bg:            #FFFFFF   /* canvas (light)           */
--bg-elevated:   #F6F6F4   /* subtle card / panel       */
--ink:           #0A0A0A   /* primary text / UI         */
--ink-soft:      #4A4A4A   /* secondary text            */
--hairline:      #E6E6E3   /* borders / dividers        */
--pop:           #C8FF00   /* neon lime accent          */
--pop-ink:       #0A0A0A   /* text on lime              */
--overlay:       rgba(10,10,10,0.55)

/* dark mode overrides under [data-theme="dark"] */
--bg:            #0A0A0A
--bg-elevated:   #161616
--ink:           #F4F4F2
--ink-soft:      #A7A7A2
--hairline:      #262626
/* --pop stays #C8FF00 */
```
Lime is **never** used for large fills or body text — only accents, active states,
play glyphs, CTAs, and focus rings (WCAG: lime-on-black for contrast).

### 3.2 Typography — Puritan
- Load via `next/font/google` (`Puritan`, weights 400/700, italic). Expose as `--font-puritan`; set as the default sans on `<body>`.
- Scale (fluid `clamp`):
  - Display `clamp(2.75rem, 6vw, 6rem)`, 700, tight tracking, used for hero + section titles.
  - H2 `clamp(1.75rem, 3vw, 2.75rem)` 700.
  - Body `1rem`/`1.0625rem`, 400, `--ink-soft` for secondary.
  - Eyebrow/labels: 700, uppercase, `0.18em` letter-spacing, small caps feel.
- Numerals (prices, timestamps) use `font-variant-numeric: tabular-nums`.

### 3.3 Spacing, radius, shadow
- 8px base grid; section vertical rhythm uses large `clamp` paddings for editorial air.
- Radius: cards `0.375rem` (matches ScrollTiltedGrid default), pills/buttons full-round.
- Shadows are soft and low-opacity; rely on hairlines + motion for depth, not heavy shadows (keeps the white airy).

### 3.4 Motion principles
- Easing: shared `easeOut = cubicBezier(0.22, 1, 0.36, 1)` (matches the provided component).
- Durations: micro 120–180ms, standard 280–420ms, scene/scroll 600ms+.
- **Always** gate non-essential motion behind `useReducedMotion()` / `prefers-reduced-motion`.
- Performance budget: animate only `transform`, `opacity`, `filter`; set `will-change` deliberately; target 60fps.
- **Smooth scroll:** mount **Lenis** once at the app root; it drives `window.scrollY`, so framer-motion's `useScroll` (incl. `ScrollTiltedGrid`) reads from it for free. Disable/short-circuit Lenis under `prefers-reduced-motion`.

---

## 4. Data Layer (live, keyless, client-side)

All data is fetched in the browser at runtime — compatible with static export.

### 4.1 Sources
1. **Apple Marketing RSS feeds** — current charts ("latest/up-to-date"):
   - Top albums: `https://rss.applemarketingtools.com/api/v2/us/music/most-played/50/albums.json`
   - Top songs: `https://rss.applemarketingtools.com/api/v2/us/music/most-played/50/songs.json`
   - Returns id, name, artistName, artworkUrl100, genres, url. CORS-enabled.
2. **iTunes Search API** — search + detail + previews:
   - Search: `https://itunes.apple.com/search?term={q}&media=music&entity={song|album|musicArtist}&limit={n}`
   - Lookup (tracklist / details): `https://itunes.apple.com/lookup?id={collectionId}&entity=song`
   - Lookup artist + discography: `https://itunes.apple.com/lookup?id={artistId}&entity=album&limit=25`
   - Returns `previewUrl` (30s m4a), `trackPrice`, `collectionPrice`, `releaseDate`, `primaryGenreName`, `artworkUrl100`, ids.

### 4.2 Strategy
- **Homepage rails & charts** ← RSS feeds (gives the "latest" guarantee). Enrich items lazily via `lookup` to obtain `previewUrl`/price only when needed (hover/play/buy).
- **Search, detail pages, tracklists, previews** ← Search/Lookup.
- **Artwork:** upscale by string-replacing `100x100bb` → `600x600bb` (or `1000x1000bb`) in artwork URLs.
- **Genres:** filter client-side on `primaryGenreName`/feed `genres`; maintain a curated genre list for the sidebar.

### 4.3 Implementation notes
- `lib/api/itunes.ts` and `lib/api/charts.ts` wrap fetches; return **normalized** domain types (`Track`, `Album`, `Artist`) so UI never touches raw API shapes.
- `lib/normalize.ts` maps raw → domain; `lib/artwork.ts` handles resolution swaps.
- Caching: in-memory module cache + `sessionStorage` keyed by request, with a short TTL, to avoid refetch on navigation and to be polite to the APIs.
- Resilience: every fetch has loading **skeletons**, error fallback, and a small curated JSON seed (`data/seed.ts`) so the homepage hero never renders empty if a feed hiccups.

---

## 5. Information Architecture & Routes

```
/                      Home — hero + genre rails + immersive showcase band
/browse                All charts grid + filters (genre, sort) + search
/albums/[id]           Album detail page (tracklist, buy, related)
/artists/[id]          Artist detail page (bio header, discography, top songs)
/search?q=             Search results (songs / albums / artists tabs)
/favorites             Saved items (localStorage-backed)
```
Static export note: dynamic routes (`[id]`) render **client-side** from API data
(no `generateStaticParams` for an unbounded live catalog). Use a single static
shell per dynamic segment that hydrates and fetches by `id` from the URL. Configure
`images.unoptimized: true` (or plain `<img>`) since there's no image server.

---

## 6. Page Specs

### 6.1 Home (`/`)
1. **Sticky top bar** — `Songify` wordmark (Puritan, lime dot on the "i"), nav (Browse · Favorites), search trigger, theme toggle, mini-cart/receipt indicator.
2. **Hero** — oversized Puritan display headline ("The latest, beautifully."), animated word reveal, a featured chart album with parallax cover + neon "Play ▶" / "Buy" CTAs.
3. **Left genre sidebar** (desktop) — Browse / Songs / Albums / Artists + genre list; collapses to a top scroller on mobile. (CROWD/HomeLibrary inspiration.)
4. **Genre rails** — horizontally scrollable rows: "Top Albums", "Top Songs", then per-genre ("Pop", "Hip-Hop", "R&B", "Dance", …). Cards lift + reveal a lime play button on hover; drag/scroll with snap.
5. **Immersive showcase band** — the provided **`ScrollTiltedGrid`** populated with current chart artwork (portrait covers tilting in/out on scroll).
6. **Album shelf carousel** — Kurosawa-style horizontal "spines + spotlighted center" feature for an editorial pick.
7. **Footer** — newsletter (decorative), socials, sitemap; Screen-reference layout.

### 6.2 Browse (`/browse`)
- Full responsive card grid + **filter bar**: genre chips, sort dropdown (Recently Released, Most Played, A–Z, Price), and entity toggle (Songs/Albums). Animated layout changes via framer-motion `layout`.

### 6.3 Album detail (`/albums/[id]`)
- White editorial layout (Screen-inspired): large cover (parallax), title/artist/year/genre metadata column, **tracklist** with per-row play (preview) + duration + price, "Buy Now" CTA, and a **"More from this artist" / "Related"** rail.

### 6.4 Artist detail (`/artists/[id]`)
- Bold header (name in Puritan display, optional hero artwork), **discography** grid, **top songs** list with previews, follow/favorite action.

### 6.5 Favorites (`/favorites`)
- Grid of saved tracks/albums from localStorage with remove + animated empty state.

---

## 7. Audio Player

- **Global player context** (`PlayerProvider`) holds `currentTrack`, `queue`, `isPlaying`, `progress`, `volume`; single shared `HTMLAudioElement`.
- **Sticky bottom bar** (CROWD-inspired): mini artwork, title/artist, play/pause, prev/next, animated scrubber (lime fill), time `mm:ss`, volume. Slides up with motion when first track plays; respects reduced-motion.
- Any card/track row's play button enqueues + plays its `previewUrl`. Visual "now playing" equalizer animation on the active item.
- Edge cases: missing `previewUrl` → disable play with tooltip; auto-advance queue at preview end; pause others when a new track starts.

---

## 8. "Buy" → Digital Receipt Animation

- "Buy Now" (album or track) opens an animated **digital receipt** modal/overlay:
  - Paper-slip "prints"/unrolls in (scaleY + mask reveal), monospace-ish line items (Puritan tabular nums), item, artist, price, a faux order #, timestamp, and a lime "PAID" stamp that thwacks in.
  - Confetti/spark micro-burst in lime, then a "Download" affordance (decorative).
- Lightweight `cart`/`purchase` context (or just a transient purchase event) — no persistent checkout, no payment. Optional: keep a running "purchased" list in localStorage for a receipts history.

---

## 9. Cross-cutting Features

- **Search** — debounced live search hitting the Search API; results split into Songs / Albums / Artists tabs; animated result entrance; accessible combobox with keyboard nav. A `⌘K` quick-search overlay is a nice-to-have.
- **Filters/Sort** — genre chips + sort menu on Browse and rails; client-side, animated reflow.
- **Favorites** — heart toggle on every card/row; persisted in localStorage via a `useFavorites` hook; heart fills lime with a spring pop.
- **Dark mode** — `data-theme` on `<html>`, toggle in the top bar, persisted; default remains **white/light** per spec. `next-themes` (or a tiny custom hook) with no-flash inline script.

---

## 10. Component Inventory

```
components/
  layout/        TopBar, Sidebar, Footer, PageTransition, ThemeToggle
  home/          Hero, GenreRail, ShowcaseGrid (wraps ScrollTiltedGrid), AlbumShelfCarousel
  cards/         AlbumCard, TrackRow, ArtistCard, CardSkeleton
  player/        PlayerBar, Scrubber, NowPlayingEqualizer
  commerce/      BuyButton, ReceiptModal
  search/        SearchOverlay, SearchResults, FilterBar, SortMenu, GenreChips
  ui/            // shadcn/ui generated primitives live here (dialog, dropdown-menu,
                 // tabs, slider, command, popover, ...) + our own:
                 Button, IconButton, Pill, Marquee, Reveal (scroll-reveal wrapper),
                 MagneticHover, SkeletonShimmer, EmptyState
  motion/        ScrollTiltedGrid.tsx, SmoothScroll.tsx (Lenis provider)
```
- Keep the provided `ScrollTiltedGrid` as-is in `components/motion/`; feed it live chart artwork URLs via its `images` prop.
- `Reveal`, `MagneticHover`, and `PageTransition` standardize the "full immersive" motion language across pages.
- **shadcn/ui** supplies the *behavior* (a11y, focus-trap, keyboard nav) for: the receipt **dialog**, sort **dropdown-menu**, search-result **tabs**, the `⌘K` **command** palette, and the player **slider** (scrubber/volume). We restyle them to the monochrome+lime system — never ship the default theme as-is.
- **Embla** powers `AlbumShelfCarousel` and the horizontally-scrolled genre rails (drag, snap, center spotlight).
- `cn()` (clsx + tailwind-merge) lives in `lib/cn.ts` and is used for all conditional class composition.

---

## 11. State Management

- React Context for **player**, **favorites**, **theme**, and transient **purchase/receipt** state. No heavy global store needed.
- Data fetching via lightweight hooks (`useCharts`, `useAlbum`, `useArtist`, `useSearch`) with internal cache (Section 4.3). SWR is optional if caching gets complex; otherwise hand-rolled.

---

## 12. Project Structure

```
app/
  layout.tsx            // fonts, providers, theme, top bar, player bar
  page.tsx              // Home
  browse/page.tsx
  albums/[id]/page.tsx
  artists/[id]/page.tsx
  search/page.tsx
  favorites/page.tsx
  globals.css           // tokens, base, Puritan wiring
components/             // see Section 10
lib/
  api/{itunes,charts}.ts
  normalize.ts artwork.ts genres.ts format.ts (time/price)
  hooks/{useCharts,useAlbum,useArtist,useSearch,useFavorites,usePlayer}.ts
  cn.ts
context/{PlayerProvider,FavoritesProvider,ThemeProvider,ReceiptProvider}.tsx
data/seed.ts            // curated fallback
types/index.ts          // Track, Album, Artist domain types
```

---

## 13. Commands

```bash
# Install dependencies (after scaffolding)
npm i framer-motion next-themes lenis embla-carousel-react clsx tailwind-merge

# Accessible primitives (Radix-based, copied into components/ui)
npx shadcn@latest init
npx shadcn@latest add dialog dropdown-menu tabs slider command popover

# Optional, add when needed:
# npm i sonner vaul tailwindcss-animate

# Develop
npm run dev          # local dev server (http://localhost:3000)

# Quality
npm run lint         # ESLint
npx tsc --noEmit     # type-check

# Build static site
npm run build        # with output:"export" -> emits ./out (static)
npx serve out        # preview the static export locally
```
`next.config.ts` must set `output: "export"` and `images: { unoptimized: true }`.
Deploy `./out` to any static host (Vercel works directly; or GitHub Pages / Netlify).

---

## 14. Implementation Phases

1. **Scaffold & system** — Next.js + Tailwind + framer-motion, Puritan font, color tokens, `output: export`, providers, top bar shell, theme toggle.
2. **Data layer** — iTunes + RSS wrappers, normalization, artwork upscaling, caching, seed fallback, skeletons.
3. **Home** — hero, sidebar, genre rails, card components, hover/reveal motion.
4. **Player** — provider, sticky bar, previews, now-playing states.
5. **Detail pages** — album + artist, tracklist, related rails.
6. **Commerce** — BuyButton + animated digital receipt.
7. **Search & filters** — overlay, results, FilterBar/SortMenu, genre chips.
8. **Favorites + dark mode** polish.
9. **Immersive layer** — `ScrollTiltedGrid` showcase band, album shelf carousel, page transitions, parallax, magnetic hover.
10. **A11y, performance, responsive, reduced-motion pass**, then static-export verification.

---

## 15. Accessibility & Performance Guardrails

- Honor `prefers-reduced-motion` everywhere (the provided component already does).
- All controls keyboard-operable; visible lime focus rings; proper roles/labels; audio controls labeled.
- Color contrast: never rely on lime for essential text on white; keep body text `--ink`.
- Lazy-load below-the-fold imagery; cap concurrent API enrichment; debounce search; avoid layout thrash by animating transforms only.

---

## 16. Open Risks / Watch-list

- **iTunes/RSS API availability & rate limits** — mitigate with caching + curated `seed.ts` fallback.
- **CORS / regional feeds** — RSS uses a `country` segment (`us`); make it a constant that's easy to change.
- **Static dynamic routes** — `[id]` pages hydrate client-side; ensure graceful loading/empty/error states since there's no SSR.
- **Preview gaps** — not every track exposes `previewUrl`; UI must degrade gracefully.
- **Performance of "full immersive" motion** — profile on mid-range devices; keep `will-change` scoped.
