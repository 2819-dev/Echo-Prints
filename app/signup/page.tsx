import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
        <h1 className="mt-12 text-2xl font-display font-semibold tracking-tight">Create Account</h1>
        <p className="mt-2 text-sm text-muted">Track your orders and check out faster next time.</p>
        <div className="mt-8 rounded-xl bg-panel p-6 card-glow">
          <SignupForm />
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink hover:text-accent">
            Log in
          </Link>
        </p>
      </main>
    </>
  );
}
