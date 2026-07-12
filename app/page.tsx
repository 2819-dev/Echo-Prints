import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-3xl font-bold text-ink card-glow">
        E
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Echo Prints</h1>
      <p className="mt-4 max-w-md text-slate-400">
        Custom 3D printed goods, made-to-order swirl colorways, and a network of
        printers &amp; retailers.
      </p>
      <Link
        href="/browse"
        className="mt-10 rounded-full bg-accent px-8 py-3 font-semibold text-ink transition hover:bg-accent/90"
      >
        Continue
      </Link>
    </main>
  );
}
