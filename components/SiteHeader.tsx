import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/colors", label: "Colors" },
  { href: "/become-a-retailer", label: "Retailers" },
];

export default function SiteHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="sticky top-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-3 bg-white px-6 py-4">
      <Link href="/browse" aria-label="Echo Prints home" className="shrink-0">
        <BrandLogo size="sm" />
      </Link>
      <nav className="flex items-center gap-1">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-panel2 hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        {backHref && (
          <Link href={backHref} className="text-sm font-medium text-muted hover:text-ink">
            {backLabel ?? "Back"}
          </Link>
        )}
        <Link
          href="/login"
          className="rounded-full border border-hairline px-3.5 py-1.5 text-sm font-semibold text-ink hover:bg-panel2"
        >
          Log In
        </Link>
      </div>
    </header>
  );
}
