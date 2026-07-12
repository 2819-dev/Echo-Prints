"use client";

import { useState } from "react";
import { submitApplicationAction } from "@/lib/actions/applications";

export default function ApplicationForm({ type }: { type: "retailer" | "printer" }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    try {
      const result = await submitApplicationAction(formData);
      if (result.ok) {
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMessage(result.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-emerald-500/10 p-6 text-center text-emerald-300">
        <p className="font-semibold">Application received!</p>
        <p className="mt-1 text-sm text-emerald-400/80">
          We&apos;ll review it and follow up by email with next steps and login details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-400">Full name</label>
        <input
          name="name"
          required
          className="w-full rounded-lg border border-slate-700 bg-ink px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-lg border border-slate-700 bg-ink px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">
          {type === "retailer" ? "Business / shop name" : "Business name (optional)"}
        </label>
        <input
          name="businessName"
          className="w-full rounded-lg border border-slate-700 bg-ink px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">Phone (optional)</label>
        <input
          name="phone"
          className="w-full rounded-lg border border-slate-700 bg-ink px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-400">
          {type === "retailer"
            ? "Tell us about your store and where you'd sell"
            : "Tell us about your printer(s) and what you can print"}
        </label>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-ink px-4 py-2.5 outline-none focus:border-accent"
        />
      </div>

      {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-ink transition hover:bg-accent/90 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
