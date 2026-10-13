import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div>
        <h1 className="sr-only">Echo Prints</h1>
        <div className="flex justify-center">
          <BrandLogo size="xl" />
        </div>
        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed text-muted">
          Custom 3D printed goods in the color you want, backed by a network of
          printers &amp; retailers.
        </p>
        <Link
          href="/browse"
          className="mt-10 inline-block rounded-full bg-accent px-7 py-2.5 text-[15px] font-medium text-white transition hover:bg-accent-dark"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
