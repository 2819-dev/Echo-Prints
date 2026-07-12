import Link from "next/link";
import Logo from "@/components/Logo";

export default function SiteHeader({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="flex items-center justify-between">
      <Link href="/browse" aria-label="Echo Prints home">
        <Logo size="sm" />
      </Link>
      {backHref && (
        <Link href={backHref} className="text-sm text-slate-500 hover:text-slate-300">
          {backLabel ?? "Back"}
        </Link>
      )}
    </header>
  );
}
