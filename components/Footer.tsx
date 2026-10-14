import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/colors", label: "Colors" },
  { href: "/become-a-retailer", label: "Become a Retailer" },
  { href: "/login", label: "Log In" },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" aria-label="Echo Prints home">
          <BrandLogo size="sm" />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Echo Prints</p>
      </div>
    </footer>
  );
}
