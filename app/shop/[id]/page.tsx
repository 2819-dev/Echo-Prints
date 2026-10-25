import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { db, type Product, type ProductPhoto, type ColorStock, type ProductPart } from "@/lib/db";
import ProductDetail, { type PartWithColors } from "./ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [products, photos, colors, parts, partColorRows] = await Promise.all([
    db.sql<Product>`SELECT * FROM products WHERE id = ${productId} AND active = TRUE`,
    db.sql<ProductPhoto>`SELECT * FROM product_photos WHERE product_id = ${productId} ORDER BY sort_order ASC`,
    db.sql<ColorStock>`
      SELECT c.* FROM product_colors pc
      JOIN colors c ON c.id = pc.color_id
      WHERE pc.product_id = ${productId}
      ORDER BY pc.sort_order ASC
    `,
    db.sql<ProductPart>`SELECT * FROM product_parts WHERE product_id = ${productId} ORDER BY sort_order ASC`,
    db.sql<ColorStock & { part_id: number }>`
      SELECT c.*, ppc.part_id FROM product_part_colors ppc
      JOIN colors c ON c.id = ppc.color_id
      JOIN product_parts pp ON pp.id = ppc.part_id
      WHERE pp.product_id = ${productId}
      ORDER BY ppc.sort_order ASC
    `,
  ]);
  const product = products[0];
  if (!product) notFound();

  const colorsByPart = new Map<number, ColorStock[]>();
  for (const row of partColorRows) {
    const { part_id, ...color } = row;
    const list = colorsByPart.get(part_id) ?? [];
    list.push(color);
    colorsByPart.set(part_id, list);
  }
  const partsWithColors: PartWithColors[] = parts.map((p) => ({ ...p, colors: colorsByPart.get(p.id) ?? [] }));

  return (
    <>
      <SiteHeader backHref="/shop" backLabel="Back to shop" />
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <div className="mt-10">
          <ProductDetail product={product} photos={photos} colors={colors} parts={partsWithColors} />
        </div>
      </main>
    </>
  );
}
