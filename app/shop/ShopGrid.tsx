"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Product, ProductPhoto } from "@/lib/db";

export interface ShopProduct extends Product {
  photos: ProductPhoto[];
}

const TAG_COLORS = ["bg-accent", "bg-pop", "bg-sun"];

function tagColor(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

function slugify(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPrice(price: string | null) {
  if (price === null) return "Custom";
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: ShopProduct;
  added: boolean;
  onAdd: (e: React.MouseEvent, product: ShopProduct) => void;
}) {
  return (
    <Link
      href={`/shop/${product.id}`}
      className="card-glow group flex flex-col overflow-hidden rounded-2xl bg-panel text-left transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-square bg-panel2">
        {product.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.photos[0].data_url} alt={product.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">No photo</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold">{product.title}</h3>
        {product.description && <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.description}</p>}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.price !== null ? (
            <button
              onClick={(e) => onAdd(e, product)}
              className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark"
            >
              {added ? "Added" : "Add to Cart"}
            </button>
          ) : (
            <span className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink">
              Request a Quote
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ShopGrid({ products }: { products: ShopProduct[] }) {
  const [addedId, setAddedId] = useState<number | null>(null);

  function handleAdd(e: React.MouseEvent, product: ShopProduct) {
    e.preventDefault();
    e.stopPropagation();
    if (product.price === null) return;
    addToCart({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      photo: product.photos[0]?.data_url ?? null,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId((id) => (id === product.id ? null : id)), 1500);
  }

  if (products.length === 0) {
    return <p className="text-muted">No products listed yet &mdash; check back soon.</p>;
  }

  const categories = new Map<string, ShopProduct[]>();
  for (const product of products) {
    const key = product.category?.trim() || "More";
    const list = categories.get(key) ?? [];
    list.push(product);
    categories.set(key, list);
  }
  const entries = Array.from(categories.entries());

  return (
    <div>
      {entries.length > 1 && (
        <nav className="sticky top-16 z-10 -mx-6 overflow-x-auto border-b border-hairline bg-white px-6 py-3 sm:top-[72px]">
          <div className="flex w-max gap-2">
            {entries.map(([category]) => (
              <a
                key={category}
                href={`#${slugify(category)}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-90 ${tagColor(category)}`}
              >
                {category}
              </a>
            ))}
          </div>
        </nav>
      )}

      <div className="space-y-12 pt-8">
        {entries.map(([category, items]) => (
          <section key={category} id={slugify(category)} className="scroll-mt-28">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${tagColor(category)}`} />
              <h2 className="font-display text-2xl font-extrabold text-ink">{category}</h2>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} added={addedId === product.id} onAdd={handleAdd} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
