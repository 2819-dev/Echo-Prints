"use client";

import { useState } from "react";
import ApplicationForm from "./ApplicationForm";

export default function RetailerPrinterTabs() {
  const [tab, setTab] = useState<"retailer" | "printer">("retailer");

  return (
    <div>
      <div className="flex rounded-full bg-panel p-1">
        {(["retailer", "printer"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-accent text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "retailer" ? (
          <div>
            <h2 className="text-xl font-semibold">Become a Retailer</h2>
            <p className="mt-2 text-sm text-slate-400">
              We supply you with inventory and a wholesale price sheet. You sell to your
              customers and keep the profit.
            </p>
            <div className="mt-6">
              <ApplicationForm type="retailer" />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold">Become a Printer</h2>
            <p className="mt-2 text-sm text-slate-400">
              We send you the model &mdash; a MakerWorld link or an STL file. You print it,
              mark it printed in your printer dashboard, then either drop it off with a
              certified retailer from our list or have Echo Prints pick it up from you.
            </p>
            <div className="mt-6">
              <ApplicationForm type="printer" />
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already approved?{" "}
        <a href="/login" className="text-accent hover:underline">
          Log in to your dashboard
        </a>
      </p>
    </div>
  );
}
