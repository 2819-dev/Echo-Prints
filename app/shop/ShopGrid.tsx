"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Product, ProductPhoto } from "@/lib/db";

export interface ShopProduct extends Product {
  photos: ProductPhoto[];
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
      className="group flex flex-col overflow-hidden rounded-xl border border-hairline bg-panel text-left transition hover:border-ink/30"
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
        <h3 className="font-semibold text-ink">{product.title}</h3>
        {product.description && <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.description}</p>}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
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
  const [active, setActive] = useState("All");

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

  const categoryNames = ["All", ...Array.from(categories.keys())];
  const visibleCategories: [string, ShopProduct[]][] =
    active === "All" ? Array.from(categories.entries()) : [[active, categories.get(active) ?? []]];

  return (
    <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
      <nav className="shrink-0 sm:sticky sm:top-20 sm:w-44">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Categories</p>
        <div className="mt-3 flex gap-1.5 overflow-x-auto sm:flex-col sm:overflow-visible">
          {categoryNames.map((name) => {
            const count = name === "All" ? products.length : categories.get(name)?.length ?? 0;
            const isActive = active === name;
            return (
              <button
                key={name}
                onClick={() => setActive(name)}
                className={`flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-left text-sm transition ${
                  isActive ? "bg-accent font-semibold text-white" : "text-muted hover:bg-panel2 hover:text-ink"
                }`}
              >
                <span>{name}</span>
                <span className={isActive ? "text-white/70" : "text-muted"}>{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1 space-y-12">
        {visibleCategories.map(([category, items]) => (
          <section key={category}>
            <h2 className="font-display text-xl font-semibold text-ink">{category}</h2>
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
