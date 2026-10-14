import SiteHeader from "@/components/SiteHeader";
import RetailerPrinterTabs from "./RetailerPrinterTabs";

export default function BecomeARetailerPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-screen max-w-xl px-6 py-10">
        <h1 className="mt-10 text-3xl font-display font-semibold tracking-tight sm:text-4xl">Join Echo Prints</h1>
        <p className="mt-3 text-muted">
          Two ways to work with us &mdash; pick the tab that fits.
        </p>

        <div className="mt-10 rounded-2xl bg-panel p-6 card-glow">
          <RetailerPrinterTabs />
        </div>
      </main>
    </>
  );
}
