import Link from "next/link";
import { db, type ColorStock } from "@/lib/db";

const CUSTOM_COLOR_EMAIL = "custom@echoprints.xyz";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const colors = await db.sql<ColorStock>`
    SELECT * FROM colors ORDER BY sort_order ASC, name ASC
  `;

  const mailtoHref = `mailto:${CUSTOM_COLOR_EMAIL}?subject=${encodeURIComponent(
    "Custom color request"
  )}&body=${encodeURIComponent(
    "Hi Echo Prints,\n\nI'd like to request a custom color:\n\n"
  )}`;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <Link href="/browse" className="text-sm text-slate-500 hover:text-slate-300">
        &larr; Back to browse
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Color Stock</h1>
      <p className="mt-3 text-slate-400">
        Bambu Lab Silk Dual-Color (&ldquo;swirl&rdquo;) filament &mdash; current availability.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {colors.map((color) => (
          <div
            key={color.id}
            className="card-glow flex items-center gap-4 rounded-2xl bg-panel p-5"
          >
            <div
              className="h-14 w-14 flex-shrink-0 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)`,
              }}
            />
            <div className="flex-1">
              <h2 className="font-semibold">{color.name}</h2>
              <p className="text-xs text-slate-500">{color.material}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                color.in_stock
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {color.in_stock ? "In stock" : "Out of stock"}
            </span>
          </div>
        ))}
        {colors.length === 0 && (
          <p className="text-slate-500">No colors listed yet &mdash; check back soon.</p>
        )}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-slate-700 p-6 text-center">
        <h3 className="font-semibold">Don&apos;t see the color you want?</h3>
        <p className="mt-1 text-sm text-slate-400">
          Request a custom colorway and we&apos;ll see what we can do.
        </p>
        <a
          href={mailtoHref}
          className="mt-4 inline-block rounded-full bg-accent2 px-6 py-2.5 font-semibold text-ink transition hover:bg-accent2/90"
        >
          Request a Custom Color
        </a>
      </div>
    </main>
  );
}
