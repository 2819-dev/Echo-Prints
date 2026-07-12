"use client";

import { useState } from "react";
import { submitApplicationAction } from "@/lib/actions/applications";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none focus:border-accent";

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
      <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-700">
        <p className="font-semibold">Application received!</p>
        <p className="mt-1 text-sm text-emerald-700/80">
          We&apos;ll review it and follow up by email with next steps and login details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input type="email" name="email" required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" className={inputClass} />
      </Field>

      {type === "retailer" ? (
        <>
          <Field label="Business / shop name">
            <input name="businessName" required className={inputClass} />
          </Field>
          <Field label="Store address">
            <input name="address" required placeholder="Street, city, state, ZIP" className={inputClass} />
          </Field>
          <Field label="Tell us about your store">
            <textarea
              name="message"
              rows={3}
              placeholder="Location, foot traffic, and why you'd like to carry Echo Prints"
              className={inputClass}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Printers you own">
            <textarea
              name="printersOwned"
              required
              rows={2}
              placeholder="e.g. 2x Bambu Lab X1C, 1x Prusa MK4"
              className={inputClass}
            />
          </Field>
          <Field label="Filaments you have on hand">
            <textarea
              name="filamentsAvailable"
              required
              rows={2}
              placeholder="e.g. PLA (various colors), PETG, Bambu Silk Dual-Color"
              className={inputClass}
            />
          </Field>
        </>
      )}

      {errorMessage && <p className="text-sm text-rose-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-accent px-6 py-2.5 font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
