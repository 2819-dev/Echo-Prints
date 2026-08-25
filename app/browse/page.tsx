import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const KOFI_URL = "https://ko-fi.com/echo3d";

function ShopIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

function SwatchIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 12l4-4 4 3 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12v4l4 3 4-3 3 3 4-3v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const tiles = [
  {
    title: "Shop Now",
    description: "Browse and buy ready-made prints on our Ko-fi shop.",
    href: KOFI_URL,
    external: true,
    Icon: ShopIcon,
  },
  {
    title: "Color Guide",
    description: "Pick the color you want your print made in.",
    href: "/colors",
    external: false,
    Icon: SwatchIcon,
  },
  {
    title: "Become a Retailer",
    description: "Sell Echo Prints in your store, or join the printer network.",
    href: "/become-a-retailer",
    external: false,
    Icon: HandshakeIcon,
  },
];

export default function BrowsePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <SiteHeader backHref="/" backLabel="Home" />

      <div className="mt-16 flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse Echo Prints</h1>
        <p className="mt-3 text-slate-500">What are you here for?</p>

        <div className="mt-12 grid w-full gap-6 sm:grid-cols-3">
          {tiles.map(({ title, description, href, external, Icon }) => (
            <Link
              key={title}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="card-glow group flex flex-col items-center rounded-2xl bg-panel p-8 text-center transition hover:-translate-y-1 hover:bg-panel2"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent/20">
                <Icon />
              </span>
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
