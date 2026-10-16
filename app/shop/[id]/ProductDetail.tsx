"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { createCustomRequestAction } from "@/lib/actions/shop";
import type { Product, ProductPhoto, ColorStock } from "@/lib/db";

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

function ColorSwatch({ color, size = 28 }: { color: ColorStock; size?: number }) {
  const style = { width: size, height: size };
  if (color.photo_data_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={color.photo_data_url} alt="" style={style} className="shrink-0 rounded-full object-cover" />;
  }
  return (
    <div
      style={{ ...style, background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)` }}
      className="shrink-0 rounded-full"
    />
  );
}

function ColorSelector({
  colors,
  allowMultiColor,
  selected,
  onChange,
}: {
  colors: ColorStock[];
  allowMultiColor: boolean;
  selected: string[];
  onChange: (names: string[]) => void;
}) {
  function toggle(name: string) {
    if (allowMultiColor) {
      onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
    } else {
      onChange([name]);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium">
        Color{allowMultiColor ? "s" : ""}
        {allowMultiColor && <span className="ml-1.5 font-normal text-muted">&mdash; pick up to 4 for an AMS multi-color print</span>}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selected.includes(color.name);
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => toggle(color.name)}
              disabled={!color.in_stock}
              title={color.in_stock ? color.name : `${color.name} (out of stock)`}
              className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                isSelected ? "border-accent bg-accent/5 text-accent" : "border-hairline text-ink hover:bg-panel2"
              } ${!color.in_stock ? "cursor-not-allowed opacity-40" : ""}`}
            >
              <ColorSwatch color={color} size={18} />
              {color.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddToCart({ product, colors }: { product: Product; colors: ColorStock[] }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [colorError, setColorError] = useState(false);

  function handleAdd() {
    if (colors.length > 0 && selectedColors.length === 0) {
      setColorError(true);
      return;
    }
    setColorError(false);
    addToCart(
      {
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        photo: null,
        colors: selectedColors,
      },
      quantity
    );
    setAdded(true);
  }

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <ColorSelector
          colors={colors}
          allowMultiColor={product.allow_multi_color}
          selected={selectedColors}
          onChange={(names) => {
            setSelectedColors(names);
            setColorError(false);
          }}
        />
      )}
      {colorError && <p className="text-sm text-rose-600">Choose a color before adding to cart.</p>}
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

export default function ProductDetail({
  product,
  photos,
  colors,
}: {
  product: Product;
  photos: ProductPhoto[];
  colors: ColorStock[];
}) {
  return (
    <div className="grid gap-10 sm:grid-cols-2">
      <Gallery photos={photos} title={product.title} />
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">{product.title}</h1>
        <p className="mt-2 text-lg font-semibold text-accent">{formatPrice(product.price)}</p>
        {product.description && <p className="mt-4 whitespace-pre-wrap text-muted">{product.description}</p>}
        <div className="mt-6">
          {product.price !== null ? (
            <AddToCart product={product} colors={colors} />
          ) : (
            <QuoteRequestForm product={product} />
          )}
        </div>
      </div>
    </div>
  );
}
