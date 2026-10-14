"use client";

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-lg border border-hairline bg-white px-4 py-2.5 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

export default function ProfileForm({ phone, address }: { phone: string | null; address: string | null }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateProfileAction(formData);
      if (result.error) {
        setError(result.error);
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Something went wrong. Try again in a moment.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">Phone</label>
        <input type="tel" name="phone" defaultValue={phone ?? ""} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Shipping address</label>
        <textarea name="address" defaultValue={address ?? ""} rows={2} className={inputClass} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {status === "done" && <p className="text-sm text-emerald-600">Saved.</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
