import SiteHeader from "@/components/SiteHeader";
import { db, type Product, type ProductPhoto } from "@/lib/db";
import ShopGrid, { type ShopProduct } from "./ShopGrid";
import CartBadge from "./CartBadge";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const [products, photos, productColors, productParts] = await Promise.all([
    db.sql<Product>`SELECT * FROM products WHERE active = TRUE ORDER BY sort_order ASC, title ASC`,
    db.sql<ProductPhoto>`SELECT * FROM product_photos ORDER BY sort_order ASC`,
    db.sql<{ product_id: number }>`SELECT DISTINCT product_id FROM product_colors`,
    db.sql<{ product_id: number }>`SELECT DISTINCT product_id FROM product_parts`,
  ]);

  const photosByProduct = new Map<number, ProductPhoto[]>();
  for (const photo of photos) {
    const list = photosByProduct.get(photo.product_id) ?? [];
    list.push(photo);
    photosByProduct.set(photo.product_id, list);
  }
  const productsNeedingColorChoice = new Set([
    ...productColors.map((pc) => pc.product_id),
    ...productParts.map((pp) => pp.product_id),
  ]);
  const rows: ShopProduct[] = products.map((p) => ({
    ...p,
    photos: photosByProduct.get(p.id) ?? [],
    hasColors: productsNeedingColorChoice.has(p.id),
  }));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight sm:text-4xl">Shop</h1>
            <p className="mt-2 max-w-xl text-muted">
              The full catalog, ready to order. Items without a listed price are either made to order &mdash;
              request a quote and we&apos;ll follow up &mdash; or marked coming soon.
            </p>
          </div>
          <CartBadge />
        </div>

        <div className="mt-10">
          <ShopGrid products={rows} />
        </div>
      </main>
    </>
  );
}
