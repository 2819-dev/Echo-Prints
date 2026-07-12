import Link from "next/link";
import { LogoMark } from "@/components/Logo";

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
        <div className="flex justify-center">
          <LogoMark size={96} />
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Echo Prints
        </h1>
        <p className="mx-auto mt-4 max-w-md text-slate-400">
          Custom 3D printed goods, made-to-order swirl colorways, and a network of
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
