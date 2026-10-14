import { requireUser } from "@/lib/auth";
import { db, type ShopOrder, type ShopOrderItem } from "@/lib/db";
import AppHeader, { AppHeaderBar } from "@/components/AppHeader";
import ChangePasswordForm from "./ChangePasswordForm";
import OrderHistory, { type OrderWithItems } from "./OrderHistory";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  const isCustomer = user.role === "customer";

  let orders: OrderWithItems[] = [];
  if (isCustomer) {
    const [shopOrders, shopOrderItems] = await Promise.all([
      db.sql<ShopOrder>`SELECT * FROM shop_orders WHERE user_id = ${user.id} ORDER BY created_at DESC`,
      db.sql<ShopOrderItem>`
        SELECT soi.* FROM shop_order_items soi
        JOIN shop_orders so ON so.id = soi.order_id
        WHERE so.user_id = ${user.id}
        ORDER BY soi.id ASC
      `,
    ]);
    const itemsByOrder = new Map<number, ShopOrderItem[]>();
    for (const item of shopOrderItems) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }
    orders = shopOrders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] }));
  }

  return (
    <>
      <AppHeaderBar />
      <main className="mx-auto min-h-screen max-w-xl px-6 py-10">
        <AppHeader title="Account" subtitle={user.email} />

        {isCustomer && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Order History</h2>
            <div className="mt-4">
              <OrderHistory orders={orders} />
            </div>
          </div>
        )}

        <div className="mt-8 max-w-sm rounded-xl bg-panel p-6 card-glow">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </div>
      </main>
    </>
  );
}
