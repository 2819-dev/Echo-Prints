import SiteHeader from "@/components/SiteHeader";
import { db, type ColorStock } from "@/lib/db";
import ColorPicker from "./ColorPicker";

export const dynamic = "force-dynamic";

export default async function ColorGuidePage() {
  const colors = await db.sql<ColorStock>`
    SELECT * FROM colors ORDER BY sort_order ASC, name ASC
  `;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <SiteHeader backHref="/browse" backLabel="Back to browse" />

      <h1 className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">Color Guide</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Pick the color you want your print made in. Tap a swatch to select it, then head to
        the shop to order &mdash; just mention the color name.
      </p>

      <div className="mt-10">
        <ColorPicker colors={colors} />
      </div>
    </main>
  );
}
