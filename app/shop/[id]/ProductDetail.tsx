"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { createCustomRequestAction } from "@/lib/actions/shop";
import type { Product, ProductPhoto } from "@/lib/db";

const inputClass =
  "rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

function formatPrice(price: string | null) {
  if (price === null) return "Custom / quote";
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

function Gallery({ photos, title }: { photos: ProductPhoto[]; title: string }) {
  const [active, setActive] = useState(0);
  const main = photos[active];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-panel2">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main.data_url} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">No photo</div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setActive(index)}
              className={`h-16 w-16 overflow-hidden rounded-lg ring-2 transition ${
                index === active ? "ring-accent" : "ring-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.data_url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(
      {
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        photo: null,
      },
      quantity
    );
    setAdded(true);
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        className={`w-20 ${inputClass}`}
      />
      <button
        onClick={handleAdd}
        className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark"
      >
        Add to Cart
      </button>
      {added && (
        <button onClick={() => router.push("/checkout")} className="text-sm font-medium text-accent hover:text-accent-dark">
          Added &mdash; go to checkout &rarr;
        </button>
      )}
    </div>
  );
}

function QuoteRequestForm({ product }: { product: Product }) {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("productId", String(product.id));
    const result = await createCustomRequestAction(formData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-dashed border-hairline bg-panel/60 p-5 text-center">
        <p className="font-semibold">Request sent!</p>
        <p className="mt-1 text-sm text-muted">We&apos;ll follow up by email with a price.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input name="name" placeholder="Your name" required className={inputClass} />
      <input type="email" name="email" placeholder="Email" required className={inputClass} />
      <input name="phone" placeholder="Phone (optional)" className={inputClass} />
      <textarea
        name="details"
        placeholder="Describe what you want &mdash; size, color, quantity, deadline, etc."
        rows={4}
        required
        className={inputClass}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Request a Quote"}
      </button>
    </form>
  );
}

export default function ProductDetail({ product, photos }: { product: Product; photos: ProductPhoto[] }) {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <Gallery photos={photos} title={product.title} />
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">{product.title}</h1>
        <p className="mt-2 text-lg font-semibold text-accent">{formatPrice(product.price)}</p>
        {product.description && <p className="mt-4 whitespace-pre-wrap text-muted">{product.description}</p>}
        <div className="mt-6">
          {product.price !== null ? <AddToCart product={product} /> : <QuoteRequestForm product={product} />}
        </div>
      </div>
    </div>
  );
}
