"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJobAction, deleteJobAction } from "@/lib/actions/jobs";
import type { PrintJob } from "@/lib/db";

export interface JobRow extends PrintJob {
  printer_name: string | null;
  retailer_name: string | null;
  retailer_business_name: string | null;
}

export default function JobsTab({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function remove(jobId: number) {
    startTransition(async () => {
      await deleteJobAction(jobId);
      router.refresh();
    });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createJobAction(formData);
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
        <h2 className="text-lg font-semibold">Print Jobs</h2>
        <div className="mt-4 space-y-2">
          {jobs.length === 0 && <p className="text-sm text-slate-500">No jobs yet.</p>}
          {jobs.map((job) => (
            <div key={job.id} className="rounded-xl bg-panel p-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-slate-500">
                    {job.status}
                    {job.printer_name ? ` · printer: ${job.printer_name}` : ""}
                    {job.retailer_name
                      ? ` · retailer: ${job.retailer_business_name || job.retailer_name}`
                      : job.fulfillment_method === "echo_pickup"
                      ? " · Echo Prints pickup"
                      : ""}
                  </p>
                </div>
                {job.status === "available" && (
                  <button
                    onClick={() => remove(job.id)}
                    disabled={isPending}
                    className="shrink-0 text-xs text-slate-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">New Print Job</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3">
          <input
            name="title"
            placeholder="Title"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="fileUrl"
            placeholder="MakerWorld link or .stl file URL"
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <textarea
            name="description"
            placeholder="Notes (optional)"
            rows={2}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity needed"
            defaultValue={1}
            min={1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Create Job
          </button>
        </form>
      </section>
    </div>
  );
}
