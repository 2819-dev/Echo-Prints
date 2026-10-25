"use client";

import { useState } from "react";
import { updatePrintersOwnedAction } from "@/lib/actions/printer";

const inputClass =
  "w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

export default function PrintersOwnedEditor({ printersOwned }: { printersOwned: string | null }) {
  const [rows, setRows] = useState<string[]>(() => {
    const lines = (printersOwned ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.length > 0 ? lines : [""];
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");

  function updateRow(index: number, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? value : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, ""]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const formData = new FormData();
    formData.set("printersOwned", rows.map((r) => r.trim()).filter(Boolean).join("\n"));

    const result = await updatePrintersOwnedAction(formData);
    if (result.error) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("done");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            value={row}
            onChange={(e) => updateRow(index, e.target.value)}
            placeholder="e.g. Bambu Lab X1C"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            disabled={rows.length === 1}
            className="shrink-0 text-xs text-muted hover:text-rose-600 disabled:opacity-30"
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={addRow} className="text-sm font-medium text-accent hover:text-accent-dark">
          + Add printer
        </button>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {status === "submitting" ? "Saving..." : "Save"}
        </button>
        {status === "done" && <span className="text-sm text-emerald-600">Saved.</span>}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
