import Link from "next/link";
import RetailerPrinterTabs from "./RetailerPrinterTabs";

export default function BecomeARetailerPage() {
  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <Link href="/browse" className="text-sm text-slate-500 hover:text-slate-300">
        &larr; Back to browse
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Join Echo Prints</h1>
      <p className="mt-3 text-slate-400">
        Two ways to work with us &mdash; pick the tab that fits.
      </p>

      <div className="mt-10 rounded-2xl bg-panel p-6 card-glow">
        <RetailerPrinterTabs />
      </div>
    </main>
  );
}
