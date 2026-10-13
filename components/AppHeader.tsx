import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { logoutAction } from "@/lib/actions/auth";

export default function AppHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <header className="sticky top-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-3 bg-white px-6 py-4">
        <Link href="/browse" aria-label="Echo Prints home" className="shrink-0">
          <BrandLogo size="sm" />
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/shop" className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-panel2 hover:text-ink">
            Shop
          </Link>
          <Link href="/account" className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-panel2 hover:text-ink">
            Account
          </Link>
        </nav>
        <form action={logoutAction} className="shrink-0">
          <button className="rounded-full border border-hairline px-3.5 py-1.5 text-sm font-semibold text-ink hover:bg-panel2">
            Log out
          </button>
        </form>
      </header>
      <div className="mt-10">
        <h1 className="text-2xl font-display font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
