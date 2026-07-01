<div align="center">

<img width="1465" height="836" alt="image" src="https://github.com/user-attachments/assets/1216d746-6517-448d-bfd0-30a8b9802e27" />
<img width="1468" height="830" alt="image" src="https://github.com/user-attachments/assets/46689473-a2e4-45ca-911f-d83ce88fbd51" />
<img width="1463" height="826" alt="image" src="https://github.com/user-attachments/assets/b6bc9fc2-db2c-4371-aea2-dfaa1493d920" />
<img width="1470" height="829" alt="image" src="https://github.com/user-attachments/assets/dc607ca0-52ef-409c-8f75-9881871a726c" />
<img width="1450" height="825" alt="image" src="https://github.com/user-attachments/assets/f1ac17e0-726b-4fa9-85f6-5d6ba5b944cb" />
<img width="1460" height="829" alt="image" src="https://github.com/user-attachments/assets/b55bf4c9-3e75-444c-a492-5919f0450fcc" />






# Songify

**A frontend-only, fully static music discovery site — live global charts, 30-second previews, and an editorial, heavily-animated UI, built entirely on client-side data with zero backend.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Static Export](https://img.shields.io/badge/Output-Static_Export-black?style=flat-square&logo=vercel&logoColor=white)](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

[**Live Demo**](https://songify-ashen.vercel.app) · [Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started)

</div>

<br />

## What is this?

Songify is a **fully static** (`next export`) music storefront — no server, no database, no API routes. Every byte of chart data, search result, and 30-second preview is fetched **directly from the browser**, live, from Apple's public iTunes Search API and Marketing RSS feeds, then normalized, cached, and rendered through a heavily-animated, editorial UI.

Think of it as a high-end music magazine that happens to be a store: generous white space, oversized display type, a monochrome black/white/grey palette punctuated by a single neon-lime accent, and full scroll-driven motion — parallax, tilt, magnetic hover, page transitions — throughout.

It exists to demonstrate **production-grade frontend engineering** in a project with no backend to lean on: real API integration under real-world constraints (undocumented rate limits, dead CORS endpoints, unbounded live catalogs on a static host), a from-scratch audio player, and an animation system that stays smooth and accessible.

<br />

## ✨ Features

- **Editorial homepage** — animated word-reveal hero with a parallaxing featured album, a genre sidebar, and horizontally-scrolling chart rails (Embla-powered, drag + snap) for Top Albums, Top Songs, and New Releases
- **Immersive scroll showcase** — a custom `ScrollTiltedGrid` component tilts and parallaxes a grid of live album art in and out of view as you scroll
- **⌘K command palette search** — debounced, tabbed (Songs / Albums / Artists) live search with keyboard navigation and inline preview playback, built on a Radix-style accessible primitive
- **Full audio player** — persistent bottom bar with a single shared `<audio>` element, play queue, auto-advance, scrubber, volume, and a "now playing" indicator on the active row anywhere in the app
- **Browse & filter** — a colorful genre grid (11 genres), Albums/Songs toggle, and sort controls (Recently Released / A–Z), all with animated `layout` transitions
- **Album & artist detail pages** — parallax cover art, full tracklist with inline preview + price, a "Buy" CTA that deep-links straight to the real Apple Music listing, and a related/discography rail
- **Favorites** — heart-toggle on any card or row, persisted to `localStorage`, with its own dedicated page and animated empty state
- **Dark mode** — manual toggle, `localStorage`-persisted, zero flash-of-wrong-theme on load
- **Fully responsive & accessible** — keyboard-operable controls, visible focus rings, labeled audio controls, and `prefers-reduced-motion` respected across every animation in the app

<br />

## 🧱 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) + `output: "export"` | Pure static HTML/JS/CSS — deployable anywhere, no server runtime |
| **Language** | TypeScript 5.9 | End-to-end type safety, normalized domain types over raw API shapes |
| **UI library** | React 19.2 | Latest concurrent features, server-free client components throughout |
| **Styling** | Tailwind CSS 4 (CSS-first `@theme`) | `oklch` design tokens, zero-runtime utility styling |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) 12 | Scroll-driven parallax, layout transitions, gesture-based hover |
| **Smooth scroll** | [Lenis](https://lenis.darkroom.engineering/) | Momentum scrolling that Framer Motion's `useScroll` reads from for free |
| **Carousels** | [Embla Carousel](https://www.embla-carousel.com/) | Drag + snap chart rails and the album shelf |
| **UI primitives** | [Base UI](https://base-ui.com/) + [shadcn](https://ui.shadcn.com/) CLI, [cmdk](https://cmdk.paco.me/) | Accessible dialog / dropdown / tabs / slider / command palette behavior, fully restyled |
| **Icons** | [lucide-react](https://lucide.dev/) | Consistent, tree-shakeable icon set |
| **Fonts** | Figtree (UI/body) + Geist Mono (tabular numerals) via `next/font/google` | Self-hosted, zero layout shift |
| **Data** | [iTunes Search/Lookup API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) + Apple Marketing RSS | Live, keyless, no backend required |
| **Hosting** | [Vercel](https://vercel.com) | Static export served as a CDN-cached static site |

No database. No API routes. No auth. No payment processor. Every dynamic thing you see is fetched by the browser, in real time, from a public third-party API.

<br />

## 🏗 Architecture

### Static-first, client-fetched

`next.config.ts` sets `output: "export"` — the entire site builds down to static HTML/JS/CSS with no server. Routes with unbounded, live IDs (`/albums`, `/artists`) can't use Next's `[id]` dynamic segments with `generateStaticParams` (there's no way to pre-render every album that could ever chart), so they render a **single static shell per route** that reads `?id=` from the URL client-side and fetches on mount — loading skeletons and empty/error states stand in for what SSR would normally guarantee.

### Data layer

```
lib/api/itunes.ts     search, lookup, artist/album resolution — normalized to domain types
lib/api/charts.ts     Top Albums / Top Songs, resolved against the real Billboard charts
lib/api/browse.ts     genre-filtered browsing
lib/normalize.ts      raw iTunes/RSS shapes → clean Track / Album / Artist types
lib/artwork.ts        100x100 → 600x600 artwork upscaling
```

The UI never touches a raw API response — everything is normalized at the boundary. Every fetch is cached in-memory and in `sessionStorage` with a TTL, so navigating between pages within a session doesn't re-hit the network.

### The interesting part: a client-side request priority queue

Apple's iTunes Search API enforces an **undocumented rate limit** — send too many requests too fast and it starts silently returning `403`, which the browser reports as a misleading CORS error. The homepage resolves its chart rails against real, named Billboard entries (rather than an artist's generic "top result"), which means dozens of individual search calls fire on load to enrich rail content. Left naive, that background traffic alone was enough to exhaust the rate-limit budget before a user could even finish typing a real search — a genuine production bug, diagnosed by instrumenting live network traffic with Playwright and watching 403s stack up in real time as the burst fired.

The fix is `lib/api/requestQueue.ts` — a small shared queue that every `itunes.apple.com` call routes through:

- **`high` priority** (search, opening an album/artist, buy/play) gets its own concurrency lane and dispatches immediately.
- **`low` priority** (background chart/genre prefetching, decorative hero art) is paced with a minimum gap between dispatches, so it trickles in over several seconds instead of bursting — and it can never block a real user's search.

It's a small file, but it's the difference between "works on localhost" and "works under Apple's real, unpublished rate limit in production."

### State management

No global store — just React Context, scoped to what actually needs to be shared:

```
context/PlayerProvider.tsx      single <audio> element, queue, scrubber, volume
context/FavoritesProvider.tsx   localStorage-backed favorites
```

Everything else is local component state or a data-fetching hook (`useCharts`, `useAlbum`, `useArtist`, `useSearch`) with its own cache.

<br />

## 🎨 Design System

- **Palette** — monochrome black / white / grey, plus a single neon-lime accent (`#C8FF00`) used *only* for CTAs, active states, play glyphs, and focus rings. Album art carries all the color; the chrome stays out of the way.
- **Color tokens** — defined in `oklch()`, mapped onto shadcn's semantic slots (`--background`, `--foreground`, `--card`, …) plus Songify-specific tokens (`--pop`, `--ink`, `--ink-soft`, `--hairline`, `--elevated`), with a full `.dark` override set.
- **Typography** — Figtree for everything UI/body, Geist Mono for prices and timestamps (`font-variant-numeric: tabular-nums`), fluid `clamp()` sizing for display headings.
- **Motion** — a shared `cubicBezier(0.22, 1, 0.36, 1)` ease throughout; only `transform`, `opacity`, and `filter` are animated; every non-essential animation is gated behind `useReducedMotion()`.

<br />

## 📁 Project Structure

```
app/
  layout.tsx              fonts, providers, top bar, persistent player bar
  page.tsx                home — hero, sidebar, genre rails, showcase, shelf
  browse/                 genre grid + filtered results
  albums/, artists/       static shells that hydrate by ?id=
  search/                 full search results page
  favorites/              localStorage-backed saved items
components/
  layout/                 TopBar, Sidebar, Footer, ThemeToggle
  home/                   Hero, GenreRail, ShowcaseGrid, AlbumShelfCarousel
  cards/                  AlbumCard, ArtistCard, TrackRow, skeletons
  player/                 PlayerBar, Scrubber
  search/                 SearchOverlay (⌘K), OrbSearch (hero typewriter)
  motion/                 ScrollTiltedGrid, SmoothScroll (Lenis), PageTransition
  ui/                     shadcn-generated primitives + MagneticHover, Reveal
context/                  PlayerProvider, FavoritesProvider
lib/
  api/                    itunes.ts, charts.ts, browse.ts, requestQueue.ts
  hooks/                  useCharts, useAlbum, useArtist, useSearch, useRelatedAlbums
  normalize.ts, artwork.ts, format.ts, genres.ts, utils.ts
types/index.ts             Track, Album, Artist, PlayerTrack domain types
```

<br />

## 🚀 Getting Started

```bash
# clone & install
git clone https://github.com/hassanm57/songify.git
cd songify
npm install

# develop
npm run dev              # http://localhost:3000

# quality
npm run lint
npx tsc --noEmit

# build the static export
npm run build             # emits ./out
npx serve out              # preview the static build locally
```

Deploy `./out` to any static host — Vercel, Netlify, GitHub Pages, or a plain S3 bucket all work, since there's no server to run.

<br />

## 🗺 What's not here (by design)

This is a portfolio/demo project, not a real store: there's no payment processor, no user accounts, and no backend. The "Buy" button deep-links to the item's real Apple Music listing rather than faking a checkout — the goal was to showcase frontend craft against a genuine live data source, not to simulate commerce.

<br />

## License

Personal portfolio project. Feel free to read the code and borrow ideas — please reach out before reusing it wholesale.

<br />

<div align="center">

Built by [Hassan Mansoor](https://github.com/hassanm57)

</div>
