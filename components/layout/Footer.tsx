import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <p className="text-display text-[2rem] font-bold mb-3">
            Song<span className="text-pop">i</span>fy
          </p>
          <p className="text-ink-soft text-sm max-w-xs leading-relaxed">
            The latest music from global charts — beautifully presented, ready to buy.
          </p>
          {/* Decorative newsletter */}
          <div className="mt-6 flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email for newsletter"
              className="flex-1 px-4 py-2.5 text-sm rounded-full border border-hairline bg-transparent focus:outline-none focus:border-pop placeholder:text-ink-soft"
            />
            <button className="px-5 py-2.5 text-sm font-bold rounded-full bg-pop text-pop-ink hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="text-eyebrow text-ink-soft mb-4">Explore</p>
          <ul className="space-y-2.5">
            {[
              { label: "Browse All", href: "/browse" },
              { label: "Top Albums", href: "/browse?tab=albums" },
              { label: "Top Songs", href: "/browse?tab=songs" },
              { label: "Favorites", href: "/favorites" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-ink-soft hover:text-foreground transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="text-eyebrow text-ink-soft mb-4">Info</p>
          <ul className="space-y-2.5">
            {["About", "Contact", "Privacy", "Terms"].map((label) => (
              <li key={label}>
                <span className="text-sm text-ink-soft cursor-default">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-ink-soft">
          <span>© {new Date().getFullYear()} Songify. Powered by the iTunes API.</span>
          <span className="flex gap-4">
            {["Twitter", "Instagram", "Spotify"].map((s) => (
              <span key={s} className="hover:text-foreground cursor-pointer transition-colors">{s}</span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
