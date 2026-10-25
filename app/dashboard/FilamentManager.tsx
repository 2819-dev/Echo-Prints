"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addFilamentAction, deleteFilamentAction } from "@/lib/actions/printer";
import type { PrinterFilament } from "@/lib/db";

const inputClass =
  "w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

export default function FilamentManager({
  filaments,
  companySuggestions,
  typeSuggestions,
  colorSuggestions,
}: {
  filaments: PrinterFilament[];
  companySuggestions: string[];
  typeSuggestions: string[];
  colorSuggestions: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await addFilamentAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    router.refresh();
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteFilamentAction(id);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="space-y-1.5">
        {filaments.length === 0 && <p className="text-sm text-muted">No filaments added yet.</p>}
        {filaments.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-panel px-3 py-2 text-sm">
            <span>
              <span className="font-medium">{f.color}</span>
              <span className="text-muted">
                {" "}
                &middot; {f.type} &middot; {f.company}
              </span>
            </span>
            <button
              onClick={() => remove(f.id)}
              disabled={isPending}
              className="shrink-0 text-xs text-muted hover:text-rose-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input name="company" list="filament-companies" placeholder="Company (e.g. Bambu Lab)" className={inputClass} />
        <input name="type" list="filament-types" placeholder="Type (e.g. PLA Silk Plus)" className={inputClass} />
        <input name="color" list="filament-colors" placeholder="Color (e.g. Gold)" className={inputClass} />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark sm:w-auto"
        >
          + Add
        </button>
      </form>
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}

      <datalist id="filament-companies">
        {companySuggestions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <datalist id="filament-types">
        {typeSuggestions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <datalist id="filament-colors">
        {colorSuggestions.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}
