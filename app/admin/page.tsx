import { requireUser } from "@/lib/auth";
import { db, type Application, type ColorStock, type Order } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import AdminPanel, { type JobRow, type UserRow } from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser("admin");

  const [applications, colors, jobs, users, orders] = await Promise.all([
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
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <AppHeader title="Admin" subtitle={`Signed in as ${user.name}.`} />

      <div className="mt-10">
        <AdminPanel applications={applications} colors={colors} jobs={jobs} users={users} orders={orders} />
      </div>
    </main>
  );
}
