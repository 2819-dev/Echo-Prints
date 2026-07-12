"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction, toggleOrderStatusAction, deleteOrderAction } from "@/lib/actions/orders";
import type { Order } from "@/lib/db";

function formatPrice(price: string) {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

export default function OrdersTab({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const pending = orders.filter((o) => o.status === "pending");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");
  const totalPending = pending.reduce((sum, o) => sum + Number(o.price) * o.quantity, 0);

  function toggle(order: Order) {
    startTransition(async () => {
      await toggleOrderStatusAction(order.id, order.status === "pending" ? "fulfilled" : "pending");
      router.refresh();
    });
  }

  function remove(order: Order) {
    startTransition(async () => {
      await deleteOrderAction(order.id);
      router.refresh();
    });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createOrderAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Open Orders</h2>
          <p className="text-sm text-slate-500">{formatPrice(totalPending.toFixed(2))} outstanding</p>
        </div>
        <div className="mt-4 space-y-2">
          {pending.length === 0 && <p className="text-sm text-slate-500">No open orders.</p>}
          {pending.map((order) => (
            <div key={order.id} className="card-glow flex items-center gap-3 rounded-xl bg-panel p-3 text-sm">
              <div className="flex-1">
                <p className="font-medium">
                  {order.name} <span className="text-slate-500">&times;{order.quantity}</span>
                </p>
                {order.notes && <p className="text-xs text-slate-500">{order.notes}</p>}
              </div>
              <span className="font-semibold">{formatPrice(order.price)}</span>
              <button
                onClick={() => toggle(order)}
                disabled={isPending}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                Mark fulfilled
              </button>
              <button
                onClick={() => remove(order)}
                disabled={isPending}
                className="text-xs text-slate-500 hover:text-rose-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Log an Order</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            placeholder="Item / order name"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            step="0.01"
            min="0"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            defaultValue={1}
            min={1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="notes"
            placeholder="Notes (optional)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark sm:col-span-2"
          >
            Add Order
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-500">Fulfilled</h2>
        <div className="mt-4 space-y-2">
          {fulfilled.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
          {fulfilled.map((order) => (
            <div key={order.id} className="flex items-center justify-between rounded-xl bg-panel/60 px-4 py-2 text-sm">
              <span>
                {order.name} &times;{order.quantity}
              </span>
              <span className="text-slate-500">{formatPrice(order.price)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
