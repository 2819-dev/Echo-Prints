import { requireUser } from "@/lib/auth";
import { db, type Application, type ColorStock } from "@/lib/db";
import { logoutAction } from "@/lib/actions/auth";
import AdminPanel, { type JobRow, type UserRow } from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireUser("admin");

  const [applications, colors, jobs, users] = await Promise.all([
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
      SELECT id, email, name, role, business_name, phone, created_at
      FROM users WHERE role IN ('printer', 'retailer') ORDER BY role ASC, name ASC
    `,
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-1 text-sm text-slate-400">Signed in as {user.name}.</p>
        </div>
        <form action={logoutAction}>
          <button className="text-sm text-slate-500 hover:text-slate-300">Log out</button>
        </form>
      </div>

      <div className="mt-10">
        <AdminPanel applications={applications} colors={colors} jobs={jobs} users={users} />
      </div>
    </main>
  );
}
