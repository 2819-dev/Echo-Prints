import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute -left-10 top-16 h-28 w-28 rounded-full bg-sun/20" />
      <div className="pointer-events-none absolute right-8 top-32 h-16 w-16 rounded-full bg-pop/20" />
      <div className="pointer-events-none absolute bottom-28 left-12 h-20 w-20 rounded-full bg-accent/15" />
      <div className="pointer-events-none absolute bottom-12 right-20 h-12 w-12 rounded-full bg-sun/25" />

      <div className="relative">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        <h1 className="mt-10 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl">
          made in the
          <br />
          color <span className="text-pop">you</span> want
        </h1>

        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-muted">
          Custom 3D printed goods in the color you want, backed by a network of
          printers &amp; retailers.
        </p>

        <Link
          href="/browse"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-[15px] font-bold text-white transition hover:bg-accent-dark"
        >
          Continue
          <ArrowIcon />
        </Link>
      </div>
    </main>
  );
}
