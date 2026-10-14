"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupAction } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-lg border border-hairline bg-white px-4 py-2.5 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signupAction(formData);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again in a moment.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-muted">Full name</label>
        <input type="text" name="name" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Email</label>
        <input type="email" name="email" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-muted">Password</label>
        <input type="password" name="password" required minLength={6} className={inputClass} />
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {submitting ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
