import SiteHeader from "@/components/SiteHeader";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <SiteHeader backHref="/browse" backLabel="Back to browse" />
      <h1 className="mt-12 text-2xl font-bold">Log In</h1>
      <p className="mt-2 text-sm text-slate-500">
        For approved printers, retailers, and admins.
      </p>
      <div className="mt-8 rounded-2xl bg-panel p-6 card-glow">
        <LoginForm />
      </div>
    </main>
  );
}
