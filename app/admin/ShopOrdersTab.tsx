"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateShopOrderStatusAction, setShopOrderPaidAction, deleteShopOrderAction } from "@/lib/actions/shop";
import type { ShopOrder, ShopOrderItem, ShopOrderStatus } from "@/lib/db";

export interface ShopOrderRow extends ShopOrder {
  items: ShopOrderItem[];
}

const STATUSES: ShopOrderStatus[] = ["new", "in_progress", "completed", "cancelled"];

function formatPrice(price: string) {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

export default function ShopOrdersTab({ orders }: { orders: ShopOrderRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setStatus(orderId: number, status: ShopOrderStatus) {
    startTransition(async () => {
      await updateShopOrderStatusAction(orderId, status);
      router.refresh();
    });
  }

  function setPaid(orderId: number, paid: boolean) {
    startTransition(async () => {
      await setShopOrderPaidAction(orderId, paid);
      router.refresh();
    });
  }

  function remove(orderId: number) {
    startTransition(async () => {
      await deleteShopOrderAction(orderId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Shop Orders</h2>
      {orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-hairline bg-panel p-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => toggleExpand(order.id)} className="flex-1 text-left">
              <p className="font-medium">
                {order.customer_name} <span className="text-muted">&middot; {formatPrice(order.total)}</span>
              </p>
              <p className="text-xs text-muted">
                {order.customer_email} &middot; {order.payment_method === "cash" ? "Cash / pay in person" : "Card"}
              </p>
            </button>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {order.payment_status === "paid" ? "Paid" : "Unpaid"}
            </span>
            <button
              onClick={() => setPaid(order.id, order.payment_status !== "paid")}
              disabled={isPending}
              className="text-xs font-medium text-accent hover:text-accent-dark"
            >
              Mark {order.payment_status === "paid" ? "unpaid" : "paid"}
            </button>
            <select
              value={order.status}
              onChange={(e) => setStatus(order.id, e.target.value as ShopOrderStatus)}
              disabled={isPending}
              className="rounded-full border border-hairline bg-white px-2 py-1 text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <button onClick={() => remove(order.id)} disabled={isPending} className="text-xs text-muted hover:text-rose-600">
              Remove
            </button>
          </div>
          {expanded.has(order.id) && (
            <div className="mt-3 space-y-1.5 rounded-lg bg-panel2/60 p-3">
              {order.items.map((item) => (
                <p key={item.id} className="text-xs">
                  {item.title} &times;{item.quantity} &mdash; {formatPrice(item.price)}
                </p>
              ))}
              {order.shipping_address && <p className="mt-2 text-xs text-muted">Ship to: {order.shipping_address}</p>}
              {order.customer_phone && <p className="text-xs text-muted">Phone: {order.customer_phone}</p>}
              {order.notes && <p className="text-xs text-muted">Notes: {order.notes}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
