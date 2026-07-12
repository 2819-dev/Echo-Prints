import { requireUser } from "@/lib/auth";
import { db, type PrintJob } from "@/lib/db";
import AppHeader from "@/components/AppHeader";
import PrinterDashboard from "./PrinterDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("printer");

  const [availableJobs, myJobs, retailers] = await Promise.all([
    db.sql<PrintJob>`SELECT * FROM print_jobs WHERE status = 'available' ORDER BY created_at ASC`,
    db.sql<PrintJob>`SELECT * FROM print_jobs WHERE claimed_by = ${user.id} ORDER BY created_at DESC`,
    db.sql<{ id: number; name: string; business_name: string | null }>`
      SELECT id, name, business_name FROM users WHERE role = 'retailer' ORDER BY name ASC
    `,
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <AppHeader title="Printer Dashboard" subtitle={`Welcome back, ${user.name}.`} />

      <div className="mt-10">
        <PrinterDashboard availableJobs={availableJobs} myJobs={myJobs} retailers={retailers} />
      </div>
    </main>
  );
}
