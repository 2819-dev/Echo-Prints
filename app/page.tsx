import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

function ShopIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

function SwatchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 12l4-4 4 3 3-3 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12v4l4 3 4-3 3 3 4-3v-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const categories = [
  {
    index: "01",
    title: "Shop",
    description: "Browse ready-made prints, or request a custom quote on anything we make.",
    href: "/shop",
    Icon: ShopIcon,
  },
  {
    index: "02",
    title: "Color Guide",
    description: "Review the full color catalog and pick what your print is made in.",
    href: "/colors",
    Icon: SwatchIcon,
  },
  {
    index: "03",
    title: "Become a Retailer",
    description: "Carry Echo Prints in your store, or join the printer network as a partner.",
    href: "/become-a-retailer",
    Icon: HandshakeIcon,
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
      <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="mt-16 grid gap-10 sm:mt-24 sm:grid-cols-5 sm:items-center sm:gap-8">
        <div className="sm:col-span-3">
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
              className="rounded-full bg-accent px-6 py-2.5 text-[15px] font-medium text-white transition hover:bg-accent-dark"
            >
              Shop the catalog
            </Link>
            <Link
              href="/colors"
              className="rounded-full border border-hairline px-6 py-2.5 text-[15px] font-medium text-ink transition hover:bg-panel2"
            >
              View colors
            </Link>
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl border border-hairline p-5">
              <p className="font-display text-3xl font-semibold text-ink">30+</p>
              <p className="mt-1 text-sm text-muted">items in the catalog, from clickers to custom pieces</p>
            </div>
            <div className="rounded-2xl border border-hairline p-5">
              <p className="font-display text-3xl font-semibold text-ink">6</p>
              <p className="mt-1 text-sm text-muted">colors on hand</p>
            </div>
            <div className="rounded-2xl border border-hairline p-5">
              <p className="font-display text-3xl font-semibold text-ink">1&ndash;2</p>
              <p className="mt-1 text-sm text-muted">printers per order</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-24 border-t border-hairline pt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Where to start</h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          {categories.map(({ index, title, description, href, Icon }) => (
            <Link key={title} href={href} className="group flex flex-col gap-4 bg-panel p-6 transition hover:bg-panel2">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink">
                  <Icon />
                </span>
                <span className="font-display text-xs font-semibold text-muted">{index}</span>
              </div>
              <div>
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-24 border-t border-hairline pt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">How it works</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              <span className="font-display text-sm font-semibold text-muted">0{i + 1}</span>
              <h3 className="mt-2 font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24 flex flex-col items-start justify-between gap-6 rounded-2xl bg-accent px-8 py-10 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Ready to order?</h2>
          <p className="mt-2 max-w-sm text-sm text-white/80">
            Browse the catalog or get in touch about a custom piece.
          </p>
        </div>
        <Link
          href="/shop"
          className="shrink-0 rounded-full bg-white px-6 py-2.5 text-[15px] font-medium text-accent transition hover:bg-white/90"
        >
          Shop Now
        </Link>
      </section>
      </main>
    </>
  );
}
