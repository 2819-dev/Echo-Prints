import type { ShopOrder, ShopOrderItem } from "@/lib/db";

export interface OrderWithItems extends ShopOrder {
  items: ShopOrderItem[];
}

function formatPrice(price: string) {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

const STATUS_LABEL: Record<string, string> = {
  new: "Received",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderHistory({ orders }: { orders: OrderWithItems[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted">No orders yet.</p>;
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-hairline bg-panel p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">
              Order #{order.id} <span className="text-muted">&middot; {formatPrice(order.total)}</span>
            </p>
            <span className="rounded-full bg-panel2 px-2.5 py-0.5 text-xs font-medium text-muted">
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
          <div className="mt-2 space-y-0.5">
            {order.items.map((item) => (
              <p key={item.id} className="text-xs text-muted">
                {item.title} &times;{item.quantity}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
