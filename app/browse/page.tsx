import Link from "next/link";

const KOFI_URL = "https://ko-fi.com/echo3d";

const tiles = [
  {
    title: "Shop Now",
    description: "Browse and buy ready-made prints on Ko-fi.",
    href: KOFI_URL,
    external: true,
    emoji: "\u{1F6D2}",
  },
  {
    title: "Color Stock",
    description: "See which swirl colorways are in stock, or request a custom one.",
    href: "/inventory",
    external: false,
    emoji: "\u{1F3A8}",
  },
  {
    title: "Become a Retailer",
    description: "Sell Echo Prints in your store, or join the printer network.",
    href: "/become-a-retailer",
    external: false,
    emoji: "\u{1F91D}",
  },
];

export default function BrowsePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse Echo Prints</h1>
      <p className="mt-3 text-slate-400">What are you here for?</p>

      <div className="mt-12 grid w-full gap-6 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.title}
            href={tile.href}
            target={tile.external ? "_blank" : undefined}
            rel={tile.external ? "noopener noreferrer" : undefined}
            className="card-glow flex flex-col items-center rounded-2xl bg-panel p-8 text-center transition hover:-translate-y-1 hover:bg-panel/80"
          >
            <span className="text-4xl">{tile.emoji}</span>
            <h2 className="mt-4 text-xl font-semibold">{tile.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{tile.description}</p>
          </Link>
        ))}
      </div>

      <Link href="/" className="mt-12 text-sm text-slate-500 hover:text-slate-300">
        &larr; Back
      </Link>
    </main>
  );
}
