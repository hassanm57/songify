import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageTransition } from "@/components/motion/PageTransition";
import { TopBar } from "@/components/layout/TopBar";
import { PlayerBar } from "@/components/player/PlayerBar";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Songify - The latest music, beautifully.",
  description: "Discover and buy the latest songs, albums, and artists. Fresh charts, beautifully presented.",
};

const noFlashScript = `
(function(){
  try{
    var t=localStorage.getItem('songify:theme');
    var prefersDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
    if(t==='dark'||(t===null&&prefersDark)){document.documentElement.classList.add('dark')}
  }catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <FavoritesProvider>
          <PlayerProvider>
            <SmoothScroll>
              <TopBar />
              <main className="pt-14 pb-24">
                <PageTransition>{children}</PageTransition>
              </main>
              <PlayerBar />
            </SmoothScroll>
          </PlayerProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
