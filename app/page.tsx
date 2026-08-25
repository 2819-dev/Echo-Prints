import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(600px circle at 50% 20%, rgba(47,143,240,0.18), transparent 60%)",
        }}
      />
      <div className="relative">
        <h1 className="sr-only">Echo Prints</h1>
        <div className="flex justify-center">
          <BrandLogo size="xl" />
        </div>
        <p className="mx-auto mt-6 max-w-md text-slate-500">
          Custom 3D printed goods in the color you want, backed by a network of
          printers &amp; retailers.
        </p>
        <Link
          href="/browse"
          className="mt-10 inline-block rounded-full bg-accent px-8 py-3 font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-dark"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}
