"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  updateProductAction,
  toggleProductActiveAction,
  deleteProductAction,
  reorderProductsAction,
  bulkToggleProductActiveAction,
  bulkDeleteProductsAction,
} from "@/lib/actions/shop";
import { resizeImageFile } from "@/lib/resizeImage";
import type { Product, ProductPhoto } from "@/lib/db";

export interface ProductRow extends Product {
  photos: ProductPhoto[];
}

const inputClass =
  "rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";

function formatPrice(price: string | null) {
  if (price === null) return "Custom / quote";
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
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

function PhotoManager({ photos, onChange }: { photos: string[]; onChange: (photos: string[]) => void }) {
  const dragIndex = useRef<number | null>(null);

  async function handleAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const resized = await Promise.all(files.map((f) => resizeImageFile(f, 960, 0.85)));
    onChange([...photos, ...resized]);
    e.target.value = "";
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    const next = [...photos];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    dragIndex.current = index;
    onChange(next);
  }

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap gap-3">
        {photos.map((p, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => (dragIndex.current = index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => (dragIndex.current = null)}
            className="group relative h-20 w-20 cursor-grab active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
            >
              &times;
            </button>
            {index === 0 && (
              <span className="absolute bottom-0 left-0 rounded-br-lg rounded-tl-lg bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                Cover
              </span>
            )}
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-hairline text-center text-[11px] text-accent">
          + Photos
          <input type="file" accept="image/*" multiple onChange={handleAdd} className="hidden" />
        </label>
      </div>
      <p className="mt-1.5 text-xs text-muted">Drag to reorder &mdash; first photo is the cover image.</p>
    </div>
  );
}

function ProductForm({
  product,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  product?: ProductRow;
  onSubmit: (formData: FormData) => Promise<{ error: string }>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isCustom, setIsCustom] = useState(product ? product.price === null : false);
  const [photos, setPhotos] = useState<string[]>(product?.photos.map((p) => p.data_url) ?? []);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("photos", JSON.stringify(photos));
    formData.set("isCustom", isCustom ? "on" : "off");
    const result = await onSubmit(formData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    setPhotos([]);
    setIsCustom(false);
    router.refresh();
    onCancel?.();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-hairline bg-panel2/60 p-4 sm:grid-cols-2">
      {product && <input type="hidden" name="id" value={product.id} />}
      <PhotoManager photos={photos} onChange={setPhotos} />
      <input name="title" defaultValue={product?.title} placeholder="Title" required className={`${inputClass} sm:col-span-2`} />
      <input name="category" defaultValue={product?.category ?? ""} placeholder="Category (e.g. Fidgets)" className={`${inputClass} sm:col-span-2`} />
      <textarea
        name="description"
        defaultValue={product?.description}
        placeholder="Description"
        rows={3}
        className={`${inputClass} sm:col-span-2`}
      />
      <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2">
        <input type="checkbox" checked={isCustom} onChange={(e) => setIsCustom(e.target.checked)} className="h-4 w-4" />
        Custom item &mdash; no fixed price, customers submit a request and I&apos;ll quote them
      </label>
      {!isCustom && (
        <input
          type="number"
          name="price"
          defaultValue={product?.price ?? ""}
          placeholder="Price"
          step="0.01"
          min="0"
          required={!isCustom}
          className={inputClass}
        />
      )}
      {!product && (
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="active" defaultChecked className="h-4 w-4" />
          Active (visible in shop)
        </label>
      )}
      {error && <p className="text-sm text-rose-600 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-ink hover:bg-panel2">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function ProductsTab({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [ordered, setOrdered] = useState(products);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => setOrdered(products), [products]);

  function toggleActive(product: Product) {
    startTransition(async () => {
      await toggleProductActiveAction(product.id, !product.active);
      router.refresh();
    });
  }

  function remove(product: Product) {
    startTransition(async () => {
      await deleteProductAction(product.id);
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

  function bulkActive(active: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkToggleProductActiveAction(ids, active);
      setSelected(new Set());
      router.refresh();
    });
  }

  function bulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkDeleteProductsAction(ids);
      setSelected(new Set());
      router.refresh();
    });
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
      await reorderProductsAction(ordered.map((p) => p.id));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-xs text-muted">Drag to reorder</p>
        </div>

        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-panel2/60 p-3 text-sm">
            <span className="font-medium">{selected.size} selected</span>
            <button onClick={() => bulkActive(true)} disabled={isPending} className="rounded-full bg-panel px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-50">
              Mark active
            </button>
            <button onClick={() => bulkActive(false)} disabled={isPending} className="rounded-full bg-panel px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50">
              Mark inactive
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
          {ordered.map((product, index) => (
            <div key={product.id}>
              {editingId === product.id ? (
                <ProductForm
                  product={product}
                  submitLabel="Save"
                  onCancel={() => setEditingId(null)}
                  onSubmit={updateProductAction}
                />
              ) : (
                <div
                  draggable
                  onDragStart={() => (dragIndex.current = index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDrop}
                  className="flex items-center gap-3 rounded-xl border border-hairline bg-panel p-3"
                >
                  <span className="cursor-grab active:cursor-grabbing" title="Drag to reorder">
                    <DragHandle />
                  </span>
                  <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} className="h-4 w-4" />
                  {product.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.photos[0].data_url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-11 w-11 shrink-0 rounded-lg bg-panel2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.title}</p>
                    <p className="truncate text-xs text-muted">
                      {formatPrice(product.price)}
                      {product.category ? ` · ${product.category}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActive(product)}
                    disabled={isPending}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      product.active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => setEditingId(product.id)} className="shrink-0 text-xs font-medium text-accent hover:text-accent-dark">
                    Edit
                  </button>
                  <button onClick={() => remove(product)} disabled={isPending} className="shrink-0 text-xs text-muted hover:text-rose-600">
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
          {ordered.length === 0 && <p className="text-sm text-muted">No products yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Add a Product</h2>
        <div className="mt-4">
          <ProductForm submitLabel="Add Product" onSubmit={createProductAction} />
        </div>
      </section>
    </div>
  );
}
