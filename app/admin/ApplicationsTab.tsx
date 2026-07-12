"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveApplicationAction, rejectApplicationAction } from "@/lib/actions/applications";
import type { Application } from "@/lib/db";

export default function ApplicationsTab({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function approve(app: Application) {
    setBusyId(app.id);
    startTransition(async () => {
      const result = await approveApplicationAction(app.id);
      setBusyId(null);
      if (result.ok && result.tempPassword) {
        setNotice(
          `Approved ${app.name}. Temp login: ${app.email} / ${result.tempPassword} — send this to them, they should change it after logging in.`
        );
      } else if (result.error) {
        setNotice(result.error);
      }
      router.refresh();
    });
  }

  function reject(app: Application) {
    setBusyId(app.id);
    startTransition(async () => {
      await rejectApplicationAction(app.id);
      setBusyId(null);
      router.refresh();
    });
  }

  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-8">
      {notice && (
        <div className="rounded-xl bg-accent/10 p-4 text-sm text-accent">
          {notice}
          <button onClick={() => setNotice(null)} className="ml-3 underline">
            dismiss
          </button>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold">Pending Applications</h2>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && <p className="text-sm text-slate-500">Nothing pending.</p>}
          {pending.map((app) => (
            <div key={app.id} className="card-glow rounded-xl bg-panel p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {app.name}{" "}
                    <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs capitalize text-slate-300">
                      {app.type}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">{app.email}</p>
                  {app.business_name && <p className="text-sm text-slate-500">{app.business_name}</p>}
                  {app.phone && <p className="text-sm text-slate-500">{app.phone}</p>}
                  {app.message && <p className="mt-2 text-sm text-slate-400">{app.message}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => approve(app)}
                    disabled={isPending && busyId === app.id}
                    className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(app)}
                    disabled={isPending && busyId === app.id}
                    className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-600 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-400">History</h2>
        <div className="mt-4 space-y-2">
          {decided.map((app) => (
            <div key={app.id} className="flex items-center justify-between rounded-xl bg-panel/50 px-4 py-2 text-sm">
              <span>
                {app.name} &middot; {app.type} &middot; {app.email}
              </span>
              <span
                className={`capitalize ${app.status === "approved" ? "text-emerald-400" : "text-rose-400"}`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
