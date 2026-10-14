import { requireUser } from "@/lib/auth";
import AppHeader, { AppHeaderBar } from "@/components/AppHeader";
import ChangePasswordForm from "./ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <>
      <AppHeaderBar />
      <main className="mx-auto min-h-screen max-w-sm px-6 py-10">
        <AppHeader title="Account" subtitle={user.email} />

        <div className="mt-8 rounded-xl bg-panel p-6 card-glow">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </div>
      </main>
    </>
  );
}
