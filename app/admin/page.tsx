import { requireUser } from "@/lib/auth";
import { db, type Application, type ColorStock, type Order, type Product, type ProductPhoto, type ShopOrder, type ShopOrderItem, type CustomRequest } from "@/lib/db";
import AppHeader, { AppHeaderBar } from "@/components/AppHeader";
import AdminPanel, {
  type JobRow,
  type UserRow,
  type ProductRow,
  type ShopOrderRow,
  type CustomRequestRow,
  type CustomerRow,
} from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser("admin");

  const [
    applications,
    colors,
    jobs,
    users,
    orders,
    products,
    productPhotos,
    productColors,
    shopOrders,
    shopOrderItems,
    customRequests,
    customers,
  ] = await Promise.all([
    db.sql<Application>`SELECT * FROM applications ORDER BY status ASC, created_at DESC`,
    db.sql<ColorStock>`SELECT * FROM colors ORDER BY sort_order ASC, name ASC`,
    db.sql<JobRow>`
      SELECT
        pj.*,
        printer.name AS printer_name,
        retailer.name AS retailer_name,
        retailer.business_name AS retailer_business_name
      FROM print_jobs pj
      LEFT JOIN users printer ON printer.id = pj.claimed_by
      LEFT JOIN users retailer ON retailer.id = pj.fulfillment_retailer_id
      ORDER BY pj.created_at DESC
    `,
    db.sql<UserRow>`
      SELECT id, email, name, role, business_name, address, phone, printers_owned, filaments_available, created_at
      FROM users WHERE role IN ('printer', 'retailer') ORDER BY role ASC, name ASC
    `,
    db.sql<Order>`SELECT * FROM orders ORDER BY status ASC, created_at DESC`,
    db.sql<Product>`SELECT * FROM products ORDER BY sort_order ASC, title ASC`,
    db.sql<ProductPhoto>`SELECT * FROM product_photos ORDER BY sort_order ASC`,
    db.sql<{ product_id: number; color_id: number }>`SELECT product_id, color_id FROM product_colors ORDER BY sort_order ASC`,
    db.sql<ShopOrder>`SELECT * FROM shop_orders ORDER BY status ASC, created_at DESC`,
    db.sql<ShopOrderItem>`SELECT * FROM shop_order_items ORDER BY id ASC`,
    db.sql<CustomRequest & { product_title: string | null }>`
      SELECT cr.*, p.title AS product_title
      FROM custom_requests cr
      LEFT JOIN products p ON p.id = cr.product_id
      ORDER BY cr.status ASC, cr.created_at DESC
    `,
    db.sql<CustomerRow>`
      SELECT
        u.id, u.name, u.email, u.phone, u.created_at,
        COUNT(so.id)::int AS order_count,
        COALESCE(SUM(so.total), 0) AS total_spent
      FROM users u
      LEFT JOIN shop_orders so ON so.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `,
  ]);

  const photosByProduct = new Map<number, ProductPhoto[]>();
  for (const photo of productPhotos) {
    const list = photosByProduct.get(photo.product_id) ?? [];
    list.push(photo);
    photosByProduct.set(photo.product_id, list);
  }
  const colorIdsByProduct = new Map<number, number[]>();
  for (const pc of productColors) {
    const list = colorIdsByProduct.get(pc.product_id) ?? [];
    list.push(pc.color_id);
    colorIdsByProduct.set(pc.product_id, list);
  }
  const productRows: ProductRow[] = products.map((p) => ({
    ...p,
    photos: photosByProduct.get(p.id) ?? [],
    colorIds: colorIdsByProduct.get(p.id) ?? [],
  }));

  const itemsByOrder = new Map<number, ShopOrderItem[]>();
  for (const item of shopOrderItems) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }
  const shopOrderRows: ShopOrderRow[] = shopOrders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] }));

  return (
    <>
      <AppHeaderBar />
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <AppHeader title="Admin" subtitle={`Signed in as ${user.name}.`} />

        <div className="mt-10">
          <AdminPanel
            applications={applications}
            colors={colors}
            jobs={jobs}
            users={users}
            orders={orders}
            products={productRows}
            shopOrders={shopOrderRows}
            customRequests={customRequests as CustomRequestRow[]}
            customers={customers}
          />
        </div>
      </main>
    </>
  );
}
