import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

const PRICE_SHEET_EMAIL = "custom@echoprints.xyz";

export default async function RetailerPage() {
  const user = await requireUser("retailer");

  const mailtoHref = `mailto:${PRICE_SHEET_EMAIL}?subject=${encodeURIComponent(
    "Price sheet / inventory request"
  )}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <form action={logoutAction}>
          <button className="text-sm text-slate-500 hover:text-slate-300">Log out</button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl bg-panel p-6 card-glow">
        <p className="text-slate-300">
          You&apos;re a certified Echo Prints retailer{user.business_name ? ` for ${user.business_name}` : ""}.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          We supply you with inventory and a wholesale price sheet &mdash; you sell to your
          customers and keep the profit. Reach out any time for a restock or an updated price
          sheet.
        </p>
        <a
          href={mailtoHref}
          className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 font-semibold text-ink transition hover:bg-accent/90"
        >
          Request Price Sheet / Restock
        </a>
      </div>
    </main>
  );
}
