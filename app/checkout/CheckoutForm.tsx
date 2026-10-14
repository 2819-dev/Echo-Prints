"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { createShopOrderAction } from "@/lib/actions/shop";
import { getCart, updateCartQuantity, removeFromCart, clearCart, cartTotal, subscribeToCart, type CartItem } from "@/lib/cart";

const inputClass =
  "rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function CheckoutForm({ initialUser }: { initialUser: { name: string; email: string } | null }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    setHydrated(true);
    return subscribeToCart(update);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("cart", JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity }))));
    const result = await createShopOrderAction(formData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    clearCart();
    setOrderId(result.orderId ?? null);
  }

  if (orderId) {
    return (
      <>
        <SiteHeader backHref="/shop" backLabel="Back to shop" />
        <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
          <div className="mt-20 flex flex-col items-center text-center">
            <h1 className="text-3xl font-display font-semibold tracking-tight">Order placed!</h1>
            <p className="mt-3 text-muted">
              Order #{orderId} is in. We&apos;ll be in touch to arrange cash payment and pickup or delivery.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/shop" className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark">
                Continue Shopping
              </Link>
              {initialUser && (
                <Link href="/account" className="rounded-lg border border-hairline px-6 py-2.5 font-semibold text-ink hover:bg-panel2">
                  View Order History
                </Link>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <>
        <SiteHeader backHref="/shop" backLabel="Back to shop" />
        <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
          <div className="mt-20 flex flex-col items-center text-center">
            <h1 className="text-2xl font-display font-semibold tracking-tight">Your cart is empty</h1>
            <Link href="/shop" className="mt-6 rounded-lg bg-accent px-6 py-2.5 font-semibold text-white hover:bg-accent-dark">
              Go to Shop
            </Link>
          </div>
        </main>
      </>
    );
  }

  const total = cartTotal(items);

  return (
    <>
      <SiteHeader backHref="/shop" backLabel="Back to shop" />
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <h1 className="mt-10 text-3xl font-display font-semibold tracking-tight">Checkout</h1>

        <div className="mt-8 grid gap-8 sm:grid-cols-5">
          <section className="sm:col-span-3">
            <h2 className="text-sm font-semibold text-muted">Your Order</h2>
            <div className="mt-3 space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 rounded-xl border border-hairline bg-panel p-3 text-sm">
                  {item.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg bg-panel2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-xs text-muted">{formatPrice(item.price)} each</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))}
                    className={`w-16 ${inputClass}`}
                  />
                  <span className="w-16 shrink-0 text-right font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.productId)} className="shrink-0 text-xs text-muted hover:text-rose-600">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold">{formatPrice(total)}</span>
            </div>
          </section>

          <section className="sm:col-span-2">
            <h2 className="text-sm font-semibold text-muted">Your Info</h2>
            {!initialUser && (
              <p className="mt-1 text-xs text-muted">
                <Link href="/login" className="font-medium text-ink hover:text-accent">
                  Log in
                </Link>{" "}
                to save this info and track your order.
              </p>
            )}
            <form onSubmit={handleSubmit} className="mt-3 grid gap-3">
              <input name="customerName" placeholder="Full name" defaultValue={initialUser?.name} required className={inputClass} />
              <input
                type="email"
                name="customerEmail"
                placeholder="Email"
                defaultValue={initialUser?.email}
                required
                className={inputClass}
              />
              <input name="customerPhone" placeholder="Phone (optional)" className={inputClass} />
              <textarea name="shippingAddress" placeholder="Shipping address (or leave blank for local pickup)" rows={2} className={inputClass} />

              <fieldset className="rounded-lg border border-hairline p-3">
                <legend className="px-1 text-xs font-medium text-muted">Payment method</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="paymentMethod" value="cash" defaultChecked className="h-4 w-4" />
                  Cash / pay in person
                </label>
                <label className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <input type="radio" name="paymentMethod" value="card" disabled className="h-4 w-4" />
                  Card &mdash; coming soon
                </label>
              </fieldset>

              <textarea name="notes" placeholder="Notes (optional)" rows={2} className={inputClass} />

              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
              >
                {submitting ? "Placing order..." : "Place Order"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
