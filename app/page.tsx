import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const categories = [
  {
    title: "Shop",
    description: "Browse ready-made prints, or request a custom quote on anything we make.",
    href: "/shop",
  },
  {
    title: "Color Guide",
    description: "Review the full color catalog and pick what your print is made in.",
    href: "/colors",
  },
  {
    title: "Become a Retailer",
    description: "Carry Echo Prints in your store, or join the printer network as a partner.",
    href: "/become-a-retailer",
  },
];

const steps = [
  { title: "Choose a piece", description: "Pick from the catalog, or describe something custom." },
  { title: "Set the color", description: "Match it to your space using the color guide." },
  { title: "We print and ship", description: "Made by our printer network, delivered or picked up locally." },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <section className="mt-16 sm:mt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Custom 3D Printing</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Printed goods, made to order in any color you choose.
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-muted">
            Echo Prints runs on a network of independent printers and retailers, so your order is produced
            close to home and finished exactly the way you specified it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-lg bg-accent px-6 py-2.5 text-[15px] font-medium text-white transition hover:bg-accent-dark"
            >
              Shop the catalog
            </Link>
            <Link
              href="/colors"
              className="rounded-lg border border-hairline px-6 py-2.5 text-[15px] font-medium text-ink transition hover:bg-panel2"
            >
              View colors
            </Link>
          </div>
        </section>

        <section className="mt-20 border-t border-hairline pt-12">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Where to start</h2>
          <div className="mt-2">
            {categories.map(({ title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex items-baseline justify-between gap-6 border-b border-hairline py-5"
              >
                <div>
                  <h3 className="font-medium text-ink">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
                </div>
                <span className="shrink-0 text-sm text-muted transition group-hover:text-ink">&rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-hairline pt-12">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">How it works</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title}>
                <h3 className="font-medium text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 flex flex-wrap items-center justify-between gap-4 border-y border-hairline py-8">
          <p className="text-[15px] text-ink">Ready to order?</p>
          <Link
            href="/shop"
            className="rounded-lg bg-accent px-6 py-2.5 text-[15px] font-medium text-white transition hover:bg-accent-dark"
          >
            Shop Now
          </Link>
        </section>
      </main>
    </>
  );
}
