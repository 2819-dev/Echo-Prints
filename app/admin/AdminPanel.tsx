"use client";

import { useState } from "react";
import type { Application, ColorStock, Order } from "@/lib/db";
import ApplicationsTab from "./ApplicationsTab";
import ColorsTab from "./ColorsTab";
import JobsTab, { type JobRow } from "./JobsTab";
import AccountsTab, { type UserRow } from "./AccountsTab";
import OrdersTab from "./OrdersTab";

export type { JobRow, UserRow };

const TABS = ["Orders", "Applications", "Colors", "Print Jobs", "Accounts"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPanel({
  applications,
  colors,
  jobs,
  users,
  orders,
}: {
  applications: Application[];
  colors: ColorStock[];
  jobs: JobRow[];
  users: UserRow[];
  orders: Order[];
}) {
  const [tab, setTab] = useState<Tab>("Orders");
  const pendingApplications = applications.filter((a) => a.status === "pending").length;
  const openOrders = orders.filter((o) => o.status === "pending").length;

  const badgeFor: Partial<Record<Tab, number>> = {
    Applications: pendingApplications,
    Orders: openOrders,
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-full bg-panel2 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-accent text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
            {!!badgeFor[t] && (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                {badgeFor[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "Orders" && <OrdersTab orders={orders} />}
        {tab === "Applications" && <ApplicationsTab applications={applications} />}
        {tab === "Colors" && <ColorsTab colors={colors} />}
        {tab === "Print Jobs" && <JobsTab jobs={jobs} />}
        {tab === "Accounts" && <AccountsTab users={users} />}
      </div>
    </div>
  );
}
