import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/colors", label: "Colors" },
  { href: "/become-a-retailer", label: "Retailers" },
];

export default function SiteHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-hairline bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" aria-label="Echo Prints home" className="shrink-0">
          <BrandLogo size="sm" />
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          {backHref && (
            <Link href={backHref} className="text-sm font-medium text-muted hover:text-ink">
              {backLabel ?? "Back"}
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-lg border border-hairline px-3.5 py-1.5 text-sm font-semibold text-ink hover:bg-panel2"
          >
            Log In
          </Link>
        </div>
      </div>
    </header>
  );
}
