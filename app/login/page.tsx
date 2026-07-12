import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <Link href="/browse" className="mb-6 text-sm text-slate-500 hover:text-slate-300">
        &larr; Back to browse
      </Link>
      <h1 className="text-2xl font-bold">Log In</h1>
      <p className="mt-2 text-sm text-slate-400">
        For approved printers, retailers, and admins.
      </p>
      <div className="mt-8 rounded-2xl bg-panel p-6 card-glow">
        <LoginForm />
      </div>
    </main>
  );
}
