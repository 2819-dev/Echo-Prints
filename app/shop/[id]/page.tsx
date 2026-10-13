import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { db, type Product, type ProductPhoto } from "@/lib/db";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [products, photos] = await Promise.all([
    db.sql<Product>`SELECT * FROM products WHERE id = ${productId} AND active = TRUE`,
    db.sql<ProductPhoto>`SELECT * FROM product_photos WHERE product_id = ${productId} ORDER BY sort_order ASC`,
  ]);
  const product = products[0];
  if (!product) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <SiteHeader backHref="/shop" backLabel="Back to shop" />
      <div className="mt-10">
        <ProductDetail product={product} photos={photos} />
      </div>
    </main>
  );
}
