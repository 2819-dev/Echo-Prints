"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCustomRequestQuoteAction, setCustomRequestStatusAction, deleteCustomRequestAction } from "@/lib/actions/shop";
import type { CustomRequest } from "@/lib/db";

export interface CustomRequestRow extends CustomRequest {
  product_title: string | null;
}

function formatPrice(price: string | null) {
  if (price === null) return "";
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

function QuoteForm({ request, onDone }: { request: CustomRequestRow; onDone: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const price = Number(formData.get("quotedPrice"));
    const notes = String(formData.get("adminNotes") || "");
    await setCustomRequestQuoteAction(request.id, price, notes);
    setSubmitting(false);
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-end gap-2">
      <input
        type="number"
        name="quotedPrice"
        step="0.01"
        min="0"
        defaultValue={request.quoted_price ?? ""}
        placeholder="Quoted price"
        required
        className="w-32 rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
      />
      <input
        name="adminNotes"
        defaultValue={request.admin_notes ?? ""}
        placeholder="Notes for yourself (optional)"
        className="flex-1 rounded-lg border border-hairline bg-white px-3 py-1.5 text-xs outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
      />
      <button type="submit" disabled={submitting} className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-dark disabled:opacity-60">
        Save Quote
      </button>
      <button type="button" onClick={onDone} className="rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink hover:bg-panel2">
        Cancel
      </button>
    </form>
  );
}

export default function CustomRequestsTab({ requests }: { requests: CustomRequestRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quotingId, setQuotingId] = useState<number | null>(null);

  function close(requestId: number) {
    startTransition(async () => {
      await setCustomRequestStatusAction(requestId, "closed");
      router.refresh();
    });
  }

  function remove(requestId: number) {
    startTransition(async () => {
      await deleteCustomRequestAction(requestId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Custom Requests</h2>
      {requests.length === 0 && <p className="text-sm text-muted">No requests yet.</p>}
      {requests.map((request) => (
        <div key={request.id} className="rounded-xl border border-hairline bg-panel p-3 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">
                {request.name}
                {request.product_title && <span className="text-muted"> &middot; {request.product_title}</span>}
              </p>
              <p className="text-xs text-muted">{request.email}{request.phone ? ` · ${request.phone}` : ""}</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm">{request.details}</p>
              {request.quoted_price !== null && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-700">Quoted: {formatPrice(request.quoted_price)}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === "new"
                    ? "bg-amber-50 text-amber-700"
                    : request.status === "quoted"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-panel2 text-muted"
                }`}
              >
                {request.status}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {quotingId !== request.id && (
              <button onClick={() => setQuotingId(request.id)} className="font-medium text-accent hover:text-accent-dark">
                {request.quoted_price !== null ? "Edit quote" : "Send a quote"}
              </button>
            )}
            {request.status !== "closed" && (
              <button onClick={() => close(request.id)} disabled={isPending} className="text-muted hover:text-ink">
                Mark closed
              </button>
            )}
            <button onClick={() => remove(request.id)} disabled={isPending} className="text-muted hover:text-rose-600">
              Remove
            </button>
          </div>
          {quotingId === request.id && <QuoteForm request={request} onDone={() => setQuotingId(null)} />}
        </div>
      ))}
    </div>
  );
}
