import type { Metadata } from "next";
import { Puritan, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/context/PlayerProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TopBar } from "@/components/layout/TopBar";

const puritan = Puritan({
  variable: "--font-puritan",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Songify — The latest music, beautifully.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${puritan.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <FavoritesProvider>
          <PlayerProvider>
            <SmoothScroll>
              <TopBar />
              <main className="pt-14">
                {children}
              </main>
            </SmoothScroll>
          </PlayerProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
