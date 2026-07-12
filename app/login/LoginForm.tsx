"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginAction(formData);

      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      const destination =
        result.role === "admin" ? "/admin" : result.role === "printer" ? "/dashboard" : "/retailer";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong logging in. Try again in a moment.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-600">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">Password</label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
