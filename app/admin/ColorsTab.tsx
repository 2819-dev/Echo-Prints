"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addColorAction,
  updateColorAction,
  toggleColorStockAction,
  deleteColorAction,
  reorderColorsAction,
  bulkToggleStockAction,
  bulkDeleteColorsAction,
} from "@/lib/actions/colors";
import { resizeImageFile } from "@/lib/resizeImage";
import type { ColorStock } from "@/lib/db";

const inputClass =
  "rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

function Thumb({ color, size = 44 }: { color: ColorStock; size?: number }) {
  const style = { width: size, height: size };
  if (color.photo_data_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={color.photo_data_url} alt={color.name} style={style} className="shrink-0 rounded-full object-cover" />;
  }
  return (
    <div
      style={{
        ...style,
        background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)`,
      }}
      className="shrink-0 rounded-full"
    />
  );
}

function DragHandle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-muted">
      <circle cx="8" cy="6" r="1.6" />
      <circle cx="8" cy="12" r="1.6" />
      <circle cx="8" cy="18" r="1.6" />
      <circle cx="16" cy="6" r="1.6" />
      <circle cx="16" cy="12" r="1.6" />
      <circle cx="16" cy="18" r="1.6" />
    </svg>
  );
}

function EditForm({ color, onDone }: { color: ColorStock; onDone: () => void }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [preview, setPreview] = useState(color.photo_data_url);
  const [removePhoto, setRemovePhoto] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file);
    setPhotoDataUrl(resized);
    setPreview(resized);
    setRemovePhoto(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(color.id));
    formData.set("photoDataUrl", photoDataUrl);
    formData.set("removePhoto", removePhoto ? "on" : "off");
    const result = await updateColorAction(formData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-hairline bg-panel2/60 p-4 sm:grid-cols-2">
      <div className="flex items-center gap-3 sm:col-span-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div
            className="h-14 w-14 rounded-full"
            style={{ background: `linear-gradient(135deg, ${color.hex_primary} 0%, ${color.hex_secondary} 100%)` }}
          />
        )}
        <div className="flex flex-col gap-1">
          <label className="cursor-pointer text-sm font-medium text-accent">
            Upload photo
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
          {preview && !removePhoto && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setPhotoDataUrl("");
                setRemovePhoto(true);
              }}
              className="text-xs text-muted hover:text-rose-600"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      <input name="name" defaultValue={color.name} placeholder="Name" required className={`${inputClass} sm:col-span-2`} />
      <input name="material" defaultValue={color.material} placeholder="Material (optional)" className={`${inputClass} sm:col-span-2`} />
      <label className="flex items-center gap-2 text-sm text-muted">
        Primary
        <input type="color" name="hexPrimary" defaultValue={color.hex_primary} className="h-9 w-14 rounded border border-hairline bg-white" />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted">
        Secondary
        <input type="color" name="hexSecondary" defaultValue={color.hex_secondary} className="h-9 w-14 rounded border border-hairline bg-white" />
      </label>

      {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-panel2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ColorsTab({ colors }: { colors: ColorStock[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [ordered, setOrdered] = useState(colors);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPhotoDataUrl, setNewPhotoDataUrl] = useState("");
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => setOrdered(colors), [colors]);

  function toggleStock(color: ColorStock) {
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

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkStock(inStock: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkToggleStockAction(ids, inStock);
      setSelected(new Set());
      router.refresh();
    });
  }

  function bulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkDeleteColorsAction(ids);
      setSelected(new Set());
      router.refresh();
    });
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    setOrdered((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = index;
  }

  function handleDrop() {
    dragIndex.current = null;
    startTransition(async () => {
      await reorderColorsAction(ordered.map((c) => c.id));
      router.refresh();
    });
  }

  async function handleNewPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file);
    setNewPhotoDataUrl(resized);
    setNewPreview(resized);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("photoDataUrl", newPhotoDataUrl);
    const result = await addColorAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    setNewPhotoDataUrl("");
    setNewPreview(null);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Color Catalog</h2>
          <p className="text-xs text-muted">Drag to reorder</p>
        </div>

        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-panel2/60 p-3 text-sm">
            <span className="font-medium">{selected.size} selected</span>
            <button onClick={() => bulkStock(true)} disabled={isPending} className="rounded-full bg-panel px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-50">
              Mark in stock
            </button>
            <button onClick={() => bulkStock(false)} disabled={isPending} className="rounded-full bg-panel px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50">
              Mark out of stock
            </button>
            <button onClick={bulkDelete} disabled={isPending} className="rounded-full bg-panel px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50">
              Delete selected
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-muted hover:text-ink">
              Clear
            </button>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {ordered.map((color, index) => (
            <div key={color.id}>
              {editingId === color.id ? (
                <EditForm color={color} onDone={() => setEditingId(null)} />
              ) : (
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDrop}
                  className="flex items-center gap-3 rounded-xl border border-hairline bg-panel p-3"
                >
                  <span className="cursor-grab active:cursor-grabbing" title="Drag to reorder">
                    <DragHandle />
                  </span>
                  <input
                    type="checkbox"
                    checked={selected.has(color.id)}
                    onChange={() => toggleSelect(color.id)}
                    className="h-4 w-4"
                  />
                  <Thumb color={color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{color.name}</p>
                    {color.material && <p className="truncate text-xs text-muted">{color.material}</p>}
                  </div>
                  <button
                    onClick={() => toggleStock(color)}
                    disabled={isPending}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      color.in_stock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {color.in_stock ? "In stock" : "Out of stock"}
                  </button>
                  <button
                    onClick={() => setEditingId(color.id)}
                    className="shrink-0 text-xs font-medium text-accent hover:text-accent-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(color)}
                    disabled={isPending}
                    className="shrink-0 text-xs text-muted hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {ordered.length === 0 && <p className="text-sm text-muted">No colors yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Add a Color</h2>
        <form ref={formRef} onSubmit={handleAdd} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 sm:col-span-2">
            {newPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={newPreview} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full border border-dashed border-hairline" />
            )}
            <label className="cursor-pointer text-sm font-medium text-accent">
              Upload photo (optional)
              <input type="file" accept="image/*" onChange={handleNewPhoto} className="hidden" />
            </label>
          </div>
          <input name="name" placeholder="Name (e.g. Gilded Rose)" required className={`${inputClass} sm:col-span-2`} />
          <input name="material" placeholder="Material (optional, e.g. PLA)" className={`${inputClass} sm:col-span-2`} />
          <label className="flex items-center gap-2 text-sm text-muted">
            Primary
            <input type="color" name="hexPrimary" defaultValue="#5eead4" className="h-9 w-14 rounded border border-hairline bg-white" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            Secondary
            <input type="color" name="hexSecondary" defaultValue="#a78bfa" className="h-9 w-14 rounded border border-hairline bg-white" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="inStock" defaultChecked className="h-4 w-4" />
            In stock
          </label>
          {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark sm:col-span-2"
          >
            Add Color
          </button>
        </form>
      </section>
    </div>
  );
}
