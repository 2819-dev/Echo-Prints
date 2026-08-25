"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimJobAction, markPrintedAction, fulfillJobAction } from "@/lib/actions/jobs";
import type { PrintJob } from "@/lib/db";

interface RetailerOption {
  id: number;
  name: string;
  business_name: string | null;
}

export default function PrinterDashboard({
  availableJobs,
  myJobs,
  retailers,
}: {
  availableJobs: PrintJob[];
  myJobs: PrintJob[];
  retailers: RetailerOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  function refresh() {
    router.refresh();
  }

  function claim(jobId: number) {
    setBusyId(jobId);
    startTransition(async () => {
      await claimJobAction(jobId);
      setBusyId(null);
      refresh();
    });
  }

  function markPrinted(jobId: number) {
    setBusyId(jobId);
    startTransition(async () => {
      await markPrintedAction(jobId);
      setBusyId(null);
      refresh();
    });
  }

  function fulfill(jobId: number, method: "retailer_dropoff" | "echo_pickup", retailerId: number | null) {
    setBusyId(jobId);
    startTransition(async () => {
      await fulfillJobAction(jobId, method, retailerId);
      setBusyId(null);
      refresh();
    });
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-semibold">Available Jobs</h2>
        <p className="mt-1 text-sm text-muted">
          Claim a job, print it, then mark it printed below.
        </p>
        <div className="mt-4 space-y-3">
          {availableJobs.length === 0 && (
            <p className="text-sm text-muted">No open jobs right now &mdash; check back soon.</p>
          )}
          {availableJobs.map((job) => (
            <div key={job.id} className="card-glow flex items-center justify-between gap-4 rounded-xl bg-panel p-4">
              <div>
                <p className="font-medium">{job.title}</p>
                {job.description && <p className="text-sm text-muted">{job.description}</p>}
                <a
                  href={job.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-accent hover:underline"
                >
                  Open model / file &rarr;
                </a>
                <p className="mt-1 text-xs text-muted">Qty needed: {job.quantity_needed}</p>
              </div>
              <button
                onClick={() => claim(job.id)}
                disabled={isPending && busyId === job.id}
                className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">My Jobs</h2>
        <div className="mt-4 space-y-3">
          {myJobs.length === 0 && (
            <p className="text-sm text-muted">You haven&apos;t claimed any jobs yet.</p>
          )}
          {myJobs.map((job) => (
            <MyJobCard
              key={job.id}
              job={job}
              retailers={retailers}
              busy={isPending && busyId === job.id}
              onMarkPrinted={() => markPrinted(job.id)}
              onFulfill={(method, retailerId) => fulfill(job.id, method, retailerId)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function MyJobCard({
  job,
  retailers,
  busy,
  onMarkPrinted,
  onFulfill,
}: {
  job: PrintJob;
  retailers: RetailerOption[];
  busy: boolean;
  onMarkPrinted: () => void;
  onFulfill: (method: "retailer_dropoff" | "echo_pickup", retailerId: number | null) => void;
}) {
  const [retailerId, setRetailerId] = useState<string>("");

  return (
    <div className="card-glow rounded-xl bg-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{job.title}</p>
          <a
            href={job.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Open model / file &rarr;
          </a>
        </div>
        <span className="shrink-0 rounded-full bg-panel2 px-3 py-1 text-xs font-semibold capitalize text-muted">
          {job.status}
        </span>
      </div>

      {job.status === "claimed" && (
        <button
          onClick={onMarkPrinted}
          disabled={busy}
          className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          Mark as Printed
        </button>
      )}

      {job.status === "printed" && (
        <div className="mt-4 space-y-3 border-t border-hairline pt-4">
          <p className="text-sm text-muted">How will you get this to the customer?</p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={retailerId}
              onChange={(e) => setRetailerId(e.target.value)}
              className="rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            >
              <option value="">Choose a certified retailer&hellip;</option>
              {retailers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.business_name || r.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => retailerId && onFulfill("retailer_dropoff", Number(retailerId))}
              disabled={busy || !retailerId}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              Drop off to retailer
            </button>
            <span className="text-sm text-muted">or</span>
            <button
              onClick={() => onFulfill("echo_pickup", null)}
              disabled={busy}
              className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:bg-panel2 disabled:opacity-60"
            >
              Echo Prints will pick it up
            </button>
          </div>
        </div>
      )}

      {job.status === "fulfilled" && (
        <p className="mt-3 text-sm text-muted">
          {job.fulfillment_method === "retailer_dropoff"
            ? "Dropped off to retailer."
            : "Marked for Echo Prints pickup."}
        </p>
      )}
    </div>
  );
}
