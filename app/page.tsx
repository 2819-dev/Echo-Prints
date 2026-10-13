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
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div>
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        <h1 className="mt-10 font-serif text-5xl leading-[1.15] tracking-tight text-ink sm:text-6xl">
          made in the
          <br />
          color <em className="font-serif italic text-coral">you</em> want
        </h1>

        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-muted">
          Custom 3D printed goods in the color you want, backed by a network of
          printers &amp; retailers.
        </p>

        <Link
          href="/browse"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-[15px] font-medium text-white transition hover:bg-accent-dark"
        >
          Continue
          <ArrowIcon />
        </Link>
      </div>
    </main>
  );
}
