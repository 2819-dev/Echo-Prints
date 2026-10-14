import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { logoutAction } from "@/lib/actions/auth";

export function AppHeaderBar() {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-hairline bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" aria-label="Echo Prints home" className="shrink-0">
          <BrandLogo size="sm" />
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/shop" className="text-sm font-medium text-muted transition hover:text-ink">
            Shop
          </Link>
          <Link href="/account" className="text-sm font-medium text-muted transition hover:text-ink">
            Account
          </Link>
        </nav>
        <form action={logoutAction} className="shrink-0">
          <button className="rounded-lg border border-hairline px-3.5 py-1.5 text-sm font-semibold text-ink hover:bg-panel2">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}

export default function AppHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-10">
      <h1 className="text-2xl font-display font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}
