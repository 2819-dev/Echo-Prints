"use client";

import { useState } from "react";
import { changePasswordAction } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-accent";

export default function ChangePasswordForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await changePasswordAction(formData);

      if (result.error) {
        setError(result.error);
        setStatus("idle");
        return;
      }

      setStatus("done");
      e.currentTarget.reset();
    } catch {
      setError("Something went wrong. Try again in a moment.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-600">Current password</label>
        <input type="password" name="currentPassword" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">New password</label>
        <input type="password" name="newPassword" required minLength={6} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">Confirm new password</label>
        <input type="password" name="confirmPassword" required minLength={6} className={inputClass} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {status === "done" && <p className="text-sm text-emerald-600">Password updated.</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
