import SiteHeader from "@/components/SiteHeader";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
        <h1 className="mt-12 text-2xl font-display font-semibold tracking-tight">Log In</h1>
        <p className="mt-2 text-sm text-muted">
          For approved printers, retailers, and admins.
        </p>
        <div className="mt-8 rounded-xl bg-panel p-6 card-glow">
          <LoginForm />
        </div>
      </main>
    </>
  );
}
