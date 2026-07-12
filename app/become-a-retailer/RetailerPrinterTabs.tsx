"use client";

import { useState } from "react";
import ApplicationForm from "./ApplicationForm";

export default function RetailerPrinterTabs() {
  const [tab, setTab] = useState<"retailer" | "printer">("retailer");

  return (
    <div>
      <div className="flex rounded-full bg-panel2 p-1">
        {(["retailer", "printer"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-accent text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "retailer" ? (
          <div>
            <h2 className="text-xl font-semibold">Retailer Partnership</h2>
            <p className="mt-2 text-sm text-slate-500">
              We supply inventory and a wholesale price sheet. You sell to your customers,
              in-store, and keep the profit.
            </p>
            <div className="mt-6">
              <ApplicationForm type="retailer" />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold">Printer Network</h2>
            <p className="mt-2 text-sm text-slate-500">
              We send you a model to print &mdash; a MakerWorld link or an STL file. Mark it
              printed from your dashboard, then hand it off to a certified retailer or have
              Echo Prints pick it up.
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
