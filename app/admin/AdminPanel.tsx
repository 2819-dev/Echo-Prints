"use client";

import { useState } from "react";
import type { Application, ColorStock, Order } from "@/lib/db";
import ApplicationsTab from "./ApplicationsTab";
import ColorsTab from "./ColorsTab";
import JobsTab, { type JobRow } from "./JobsTab";
import AccountsTab, { type UserRow } from "./AccountsTab";
import OrdersTab from "./OrdersTab";
import ProductsTab, { type ProductRow } from "./ProductsTab";
import ShopOrdersTab, { type ShopOrderRow } from "./ShopOrdersTab";
import CustomRequestsTab, { type CustomRequestRow } from "./CustomRequestsTab";
import CustomersTab, { type CustomerRow } from "./CustomersTab";

export type { JobRow, UserRow, ProductRow, ShopOrderRow, CustomRequestRow, CustomerRow };

const TABS = [
  "Orders",
  "Shop Orders",
  "Custom Requests",
  "Products",
  "Colors",
  "Print Jobs",
  "Applications",
  "Accounts",
  "Customers",
] as const;
type Tab = (typeof TABS)[number];

const GROUPS: { label: string; tabs: Tab[] }[] = [
  { label: "Orders", tabs: ["Orders", "Shop Orders", "Custom Requests"] },
  { label: "Store", tabs: ["Products", "Colors"] },
  { label: "Operations", tabs: ["Print Jobs"] },
  { label: "People", tabs: ["Applications", "Accounts", "Customers"] },
];

export default function AdminPanel({
  applications,
  colors,
  jobs,
  users,
  orders,
  products,
  shopOrders,
  customRequests,
  customers,
}: {
  applications: Application[];
  colors: ColorStock[];
  jobs: JobRow[];
  users: UserRow[];
  orders: Order[];
  products: ProductRow[];
  shopOrders: ShopOrderRow[];
  customRequests: CustomRequestRow[];
  customers: CustomerRow[];
}) {
  const [tab, setTab] = useState<Tab>("Orders");
  const pendingApplications = applications.filter((a) => a.status === "pending").length;
  const openOrders = orders.filter((o) => o.status === "pending").length;
  const newShopOrders = shopOrders.filter((o) => o.status === "new").length;
  const newCustomRequests = customRequests.filter((r) => r.status === "new").length;

  const badgeFor: Partial<Record<Tab, number>> = {
    Applications: pendingApplications,
    Orders: openOrders,
    "Shop Orders": newShopOrders,
    "Custom Requests": newCustomRequests,
  };

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
      <nav className="shrink-0 sm:w-52">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-panel2 p-1 sm:hidden">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-md px-3.5 py-2 text-sm font-semibold transition ${
                tab === t ? "bg-accent text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t}
              {!!badgeFor[t] && (
                <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">{badgeFor[t]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="hidden space-y-6 sm:block">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted">{group.label}</p>
              <div className="mt-2 space-y-1">
                {group.tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex w-full items-center justify-between border-l-2 py-1.5 pl-3 pr-2 text-left text-sm font-medium transition ${
                      tab === t ? "border-ink font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    {t}
                    {!!badgeFor[t] && (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">{badgeFor[t]}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "Orders" && <OrdersTab orders={orders} />}
        {tab === "Applications" && <ApplicationsTab applications={applications} />}
        {tab === "Products" && <ProductsTab products={products} />}
        {tab === "Shop Orders" && <ShopOrdersTab orders={shopOrders} />}
        {tab === "Custom Requests" && <CustomRequestsTab requests={customRequests} />}
        {tab === "Colors" && <ColorsTab colors={colors} />}
        {tab === "Print Jobs" && <JobsTab jobs={jobs} />}
        {tab === "Accounts" && <AccountsTab users={users} />}
        {tab === "Customers" && <CustomersTab customers={customers} />}
      </div>
    </div>
  );
}
