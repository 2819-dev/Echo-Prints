"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserAccountAction, setUserPasswordAction } from "@/lib/actions/accounts";
import type { PrinterFilament } from "@/lib/db";

export interface UserRow {
  id: number;
  email: string;
  name: string;
  role: "printer" | "retailer";
  business_name: string | null;
  address: string | null;
  phone: string | null;
  printers_owned: string | null;
  filaments_available: string | null;
  created_at: string;
  filaments: PrinterFilament[];
}

const inputClass =
  "rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

function EditAccountForm({ user, onDone }: { user: UserRow; onDone: () => void }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(user.id));
    const result = await updateUserAccountAction(formData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  }

  function handleSetPassword() {
    setPwError("");
    if (newPassword.length < 6) {
      setPwError("At least 6 characters.");
      return;
    }
    setPwStatus("submitting");
    startTransition(async () => {
      const result = await setUserPasswordAction(user.id, newPassword);
      if (result.error) {
        setPwError(result.error);
        setPwStatus("idle");
        return;
      }
      setPwStatus("done");
      setNewPassword("");
      setTimeout(() => setPwStatus("idle"), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-hairline bg-panel2/60 p-4">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={user.name} placeholder="Name" required className={inputClass} />
        <input type="email" name="email" defaultValue={user.email} placeholder="Email" required className={inputClass} />
        <input name="phone" defaultValue={user.phone ?? ""} placeholder="Phone" className={inputClass} />
        {user.role === "retailer" ? (
          <>
            <input name="businessName" defaultValue={user.business_name ?? ""} placeholder="Business name" className={inputClass} />
            <input name="address" defaultValue={user.address ?? ""} placeholder="Address" className={`${inputClass} sm:col-span-2`} />
          </>
        ) : (
          <textarea
            name="printersOwned"
            defaultValue={user.printers_owned ?? ""}
            placeholder="Printers owned"
            rows={2}
            className={`${inputClass} sm:col-span-2`}
          />
        )}

        {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={onDone} className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-panel2">
            Done
          </button>
        </div>
      </form>

      <div className="mt-4 border-t border-hairline pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Set New Password</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleSetPassword}
            disabled={isPending || pwStatus === "submitting"}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {pwStatus === "submitting" ? "Setting..." : "Set Password"}
          </button>
          {pwStatus === "done" && <span className="text-sm text-emerald-600">Password updated.</span>}
        </div>
        {pwError && <p className="mt-1 text-sm text-rose-600">{pwError}</p>}
      </div>
    </div>
  );
}

export default function AccountsTab({ users }: { users: UserRow[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const printers = users.filter((u) => u.role === "printer");
  const retailers = users.filter((u) => u.role === "retailer");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Certified Retailers</h2>
        <p className="mt-1 text-sm text-muted">
          Printers choose from this list when dropping off finished prints.
        </p>
        <div className="mt-4 space-y-2">
          {retailers.length === 0 && <p className="text-sm text-muted">None yet.</p>}
          {retailers.map((u) =>
            editingId === u.id ? (
              <EditAccountForm key={u.id} user={u} onDone={() => setEditingId(null)} />
            ) : (
              <div key={u.id} className="flex items-start justify-between gap-3 rounded-xl bg-panel p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{u.business_name || u.name}</p>
                  <p className="text-xs text-muted">
                    {u.name} &middot; {u.email}
                    {u.phone ? ` · ${u.phone}` : ""}
                  </p>
                  {u.address && <p className="mt-1 text-xs text-muted">{u.address}</p>}
                </div>
                <button onClick={() => setEditingId(u.id)} className="shrink-0 text-xs font-medium text-accent hover:text-accent-dark">
                  Edit
                </button>
              </div>
            )
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Printers</h2>
        <div className="mt-4 space-y-2">
          {printers.length === 0 && <p className="text-sm text-muted">None yet.</p>}
          {printers.map((u) =>
            editingId === u.id ? (
              <EditAccountForm key={u.id} user={u} onDone={() => setEditingId(null)} />
            ) : (
              <div key={u.id} className="flex items-start justify-between gap-3 rounded-xl bg-panel p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted">
                    {u.email}
                    {u.phone ? ` · ${u.phone}` : ""}
                  </p>
                  {u.printers_owned && (
                    <p className="mt-1 whitespace-pre-line text-xs text-muted">
                      <span className="text-muted">Printers:</span> {u.printers_owned}
                    </p>
                  )}
                  {u.filaments.length > 0 ? (
                    <p className="mt-1 text-xs text-muted">
                      <span className="text-muted">Filaments:</span>{" "}
                      {u.filaments.map((f) => `${f.color} (${f.type}, ${f.company})`).join(", ")}
                    </p>
                  ) : (
                    u.filaments_available && (
                      <p className="mt-1 text-xs text-muted">
                        <span className="text-muted">Filaments:</span> {u.filaments_available}
                      </p>
                    )
                  )}
                </div>
                <button onClick={() => setEditingId(u.id)} className="shrink-0 text-xs font-medium text-accent hover:text-accent-dark">
                  Edit
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
