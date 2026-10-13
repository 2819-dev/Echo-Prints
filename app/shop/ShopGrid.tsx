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

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
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
            <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.description}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="font-semibold">{formatPrice(product.price)}</span>
              {product.price !== null ? (
                <button
                  onClick={(e) => handleAdd(e, product)}
                  className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark"
                >
                  {addedId === product.id ? "Added" : "Add to Cart"}
                </button>
              ) : (
                <span className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink">
                  Request a Quote
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
      {products.length === 0 && <p className="text-muted">No products listed yet &mdash; check back soon.</p>}
    </div>
  );
}
