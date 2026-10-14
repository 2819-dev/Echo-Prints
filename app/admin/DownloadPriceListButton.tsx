"use client";

import { useState } from "react";
import type { ProductRow } from "./ProductsTab";

export default function DownloadPriceListButton({ products }: { products: ProductRow[] }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setGenerating(true);
    setError("");
    try {
      const [{ pdf }, { default: PriceListDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/pdf/PriceListDocument"),
      ]);

      const allProducts = products.map((p) => ({
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        tag: p.tag,
      }));

      const blob = await pdf(
        <PriceListDocument
          products={allProducts}
          logoSrc={`${window.location.origin}/logo.png`}
          generatedAt={new Date().toLocaleDateString()}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "echo-prints-price-list.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't generate the PDF. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={generating}
        className="rounded-lg border border-hairline px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-panel2 disabled:opacity-60"
      >
        {generating ? "Generating..." : "Download Price List"}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
