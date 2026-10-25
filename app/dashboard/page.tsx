import { requireUser } from "@/lib/auth";
import { db, type PrintJob, type PrinterFilament } from "@/lib/db";
import AppHeader, { AppHeaderBar } from "@/components/AppHeader";
import PrinterDashboard from "./PrinterDashboard";
import PrintersOwnedEditor from "./PrintersOwnedEditor";
import FilamentManager from "./FilamentManager";
import ChangePasswordForm from "@/app/account/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser("printer");

  const [availableJobs, myJobs, retailers, filaments, companyRows, typeRows, colorRows] = await Promise.all([
    db.sql<PrintJob>`SELECT * FROM print_jobs WHERE status = 'available' ORDER BY created_at ASC`,
    db.sql<PrintJob>`SELECT * FROM print_jobs WHERE claimed_by = ${user.id} ORDER BY created_at DESC`,
    db.sql<{ id: number; name: string; business_name: string | null }>`
      SELECT id, name, business_name FROM users WHERE role = 'retailer' ORDER BY name ASC
    `,
    db.sql<PrinterFilament>`SELECT * FROM printer_filaments WHERE user_id = ${user.id} ORDER BY sort_order ASC`,
    db.sql<{ company: string }>`SELECT DISTINCT company FROM printer_filaments ORDER BY company ASC`,
    db.sql<{ type: string }>`SELECT DISTINCT type FROM printer_filaments ORDER BY type ASC`,
    db.sql<{ color: string }>`SELECT DISTINCT color FROM printer_filaments ORDER BY color ASC`,
  ]);

  return (
    <>
      <AppHeaderBar />
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <AppHeader title="Printer Dashboard" subtitle={`Welcome back, ${user.name}.`} />

        <div className="mt-10">
          <PrinterDashboard availableJobs={availableJobs} myJobs={myJobs} retailers={retailers} />
        </div>

        <div className="mt-16 space-y-8 border-t border-hairline pt-10">
          <h2 className="text-lg font-semibold">My Account</h2>

          <div>
            <h3 className="text-sm font-semibold">Printers I Own</h3>
            <div className="mt-2">
              <PrintersOwnedEditor printersOwned={user.printers_owned} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Filaments I Have</h3>
            <div className="mt-2">
              <FilamentManager
                filaments={filaments}
                companySuggestions={companyRows.map((r) => r.company)}
                typeSuggestions={typeRows.map((r) => r.type)}
                colorSuggestions={colorRows.map((r) => r.color)}
              />
            </div>
          </div>

          <div className="max-w-sm rounded-xl bg-panel p-6 card-glow">
            <h3 className="text-sm font-semibold">Change Password</h3>
            <div className="mt-4">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
