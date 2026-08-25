import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { logoutAction } from "@/lib/actions/auth";

export default function AppHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/browse" aria-label="Echo Prints home">
          <BrandLogo size="sm" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-sm text-muted hover:text-ink">
            Account
          </Link>
          <form action={logoutAction}>
            <button className="text-sm text-muted hover:text-ink">Log out</button>
          </form>
        </div>
      </div>
      <div className="mt-10">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
