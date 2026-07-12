"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addColorAction, toggleColorStockAction, deleteColorAction } from "@/lib/actions/colors";
import type { ColorStock } from "@/lib/db";

export default function ColorsTab({ colors }: { colors: ColorStock[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle(color: ColorStock) {
    startTransition(async () => {
      await toggleColorStockAction(color.id, !color.in_stock);
      router.refresh();
    });
  }

  function remove(color: ColorStock) {
    startTransition(async () => {
      await deleteColorAction(color.id);
      router.refresh();
    });
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await addColorAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Color Catalog</h2>
        <div className="mt-4 space-y-2">
          {colors.map((color) => (
            <div key={color.id} className="flex items-center gap-3 rounded-xl bg-panel p-3">
              <div
                className="h-8 w-8 shrink-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)`,
                }}
              />
              <span className="flex-1 text-sm">{color.name}</span>
              <button
                onClick={() => toggle(color)}
                disabled={isPending}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  color.in_stock ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                }`}
              >
                {color.in_stock ? "In stock" : "Out of stock"}
              </button>
              <button
                onClick={() => remove(color)}
                disabled={isPending}
                className="text-xs text-slate-500 hover:text-rose-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Add a Color</h2>
        <form onSubmit={handleAdd} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            placeholder="Name (e.g. Gilded Rose)"
            required
            className="rounded-lg border border-slate-700 bg-ink px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <input
            name="material"
            placeholder="Material"
            defaultValue="Bambu Lab Silk Dual-Color (Swirl)"
            className="rounded-lg border border-slate-700 bg-ink px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Primary
            <input type="color" name="hexPrimary" defaultValue="#5eead4" className="h-9 w-14 rounded bg-ink" />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Secondary
            <input type="color" name="hexSecondary" defaultValue="#a78bfa" className="h-9 w-14 rounded bg-ink" />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" name="inStock" defaultChecked className="h-4 w-4" />
            In stock
          </label>
          {error && <p className="text-sm text-rose-400 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink hover:bg-accent/90 sm:col-span-2"
          >
            Add Color
          </button>
        </form>
      </section>
    </div>
  );
}
