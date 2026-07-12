import SiteHeader from "@/components/SiteHeader";
import { db, type ColorStock } from "@/lib/db";

const KOFI_URL = "https://ko-fi.com/echo3d";
const CUSTOM_COLOR_EMAIL = "custom@echoprints.xyz";

export const dynamic = "force-dynamic";

function ColorSwatch({ color }: { color: ColorStock }) {
  return (
    <div className="card-glow overflow-hidden rounded-2xl bg-panel">
      <div
        className="relative aspect-square"
        style={{
          background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 30%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
            color.in_stock
              ? "bg-white/85 text-emerald-700"
              : "bg-white/85 text-rose-700"
          }`}
        >
          {color.in_stock ? "Available now" : "Currently unavailable"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{color.name}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{color.material}</p>
      </div>
    </div>
  );
}

export default async function ColorGuidePage() {
  const colors = await db.sql<ColorStock>`
    SELECT * FROM colors ORDER BY sort_order ASC, name ASC
  `;

  const mailtoHref = `mailto:${CUSTOM_COLOR_EMAIL}?subject=${encodeURIComponent(
    "Custom color request"
  )}&body=${encodeURIComponent(
    "Hi Echo Prints,\n\nI'd like to request a custom color:\n\n"
  )}`;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <SiteHeader backHref="/browse" backLabel="Back to browse" />

      <h1 className="mt-10 text-3xl font-bold tracking-tight sm:text-4xl">Color Guide</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        These swatches show exactly what each swirl colorway looks like, so you can pick with
        confidence &mdash; no guessing from a name on a label. Find your favorite here, then
        head to the shop and choose it as a variant.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <ColorSwatch key={color.id} color={color} />
        ))}
        {colors.length === 0 && (
          <p className="text-slate-500">No colors listed yet &mdash; check back soon.</p>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-panel/50 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="font-semibold">Found your color?</h3>
          <p className="mt-1 text-sm text-slate-500">
            Head to the shop and pick it as a variant when you order.
          </p>
        </div>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full bg-accent px-6 py-2.5 font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-dark"
        >
          Go to Shop
        </a>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
        <h3 className="font-semibold">Don&apos;t see the color you want?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Request a custom colorway and we&apos;ll see what we can do.
        </p>
        <a
          href={mailtoHref}
          className="mt-4 inline-block rounded-full border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Request a Custom Color
        </a>
      </div>
    </main>
  );
}
