"use client";

import { useState } from "react";
import type { Application, ColorStock } from "@/lib/db";
import ApplicationsTab from "./ApplicationsTab";
import ColorsTab from "./ColorsTab";
import JobsTab, { type JobRow } from "./JobsTab";
import AccountsTab, { type UserRow } from "./AccountsTab";

export type { JobRow, UserRow };

const TABS = ["Applications", "Colors", "Print Jobs", "Accounts"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPanel({
  applications,
  colors,
  jobs,
  users,
}: {
  applications: Application[];
  colors: ColorStock[];
  jobs: JobRow[];
  users: UserRow[];
}) {
  const [tab, setTab] = useState<Tab>("Applications");
  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-full bg-panel p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-accent text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t}
            {t === "Applications" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Applications" && <ApplicationsTab applications={applications} />}
        {tab === "Colors" && <ColorsTab colors={colors} />}
        {tab === "Print Jobs" && <JobsTab jobs={jobs} />}
        {tab === "Accounts" && <AccountsTab users={users} />}
      </div>
    </div>
  );
}
