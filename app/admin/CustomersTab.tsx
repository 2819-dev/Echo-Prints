export interface CustomerRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: string;
}

function formatPrice(price: string) {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : price;
}

export default function CustomersTab({ customers }: { customers: CustomerRow[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Customers</h2>
      <p className="mt-1 text-sm text-muted">Everyone who&apos;s created an account to track their orders.</p>
      <div className="mt-4 space-y-2">
        {customers.length === 0 && <p className="text-sm text-muted">No customer accounts yet.</p>}
        {customers.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-panel p-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted">
                {c.email}
                {c.phone ? ` · ${c.phone}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-medium">{formatPrice(c.total_spent)}</p>
              <p className="text-xs text-muted">
                {c.order_count} order{c.order_count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
