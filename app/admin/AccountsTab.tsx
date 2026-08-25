export interface UserRow {
  id: number;
  email: string;
  name: string;
  role: "printer" | "retailer";
  business_name: string | null;
  address: string | null;
  phone: string | null;
  printers_owned: string | null;
  filaments_available: string | null;
  created_at: string;
}

export default function AccountsTab({ users }: { users: UserRow[] }) {
  const printers = users.filter((u) => u.role === "printer");
  const retailers = users.filter((u) => u.role === "retailer");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Certified Retailers</h2>
        <p className="mt-1 text-sm text-muted">
          Printers choose from this list when dropping off finished prints.
        </p>
        <div className="mt-4 space-y-2">
          {retailers.length === 0 && <p className="text-sm text-muted">None yet.</p>}
          {retailers.map((u) => (
            <div key={u.id} className="rounded-xl bg-panel p-3 text-sm">
              <p className="font-medium">{u.business_name || u.name}</p>
              <p className="text-xs text-muted">
                {u.name} &middot; {u.email}
                {u.phone ? ` · ${u.phone}` : ""}
              </p>
              {u.address && <p className="mt-1 text-xs text-muted">{u.address}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Printers</h2>
        <div className="mt-4 space-y-2">
          {printers.length === 0 && <p className="text-sm text-muted">None yet.</p>}
          {printers.map((u) => (
            <div key={u.id} className="rounded-xl bg-panel p-3 text-sm">
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-muted">
                {u.email}
                {u.phone ? ` · ${u.phone}` : ""}
              </p>
              {u.printers_owned && (
                <p className="mt-1 text-xs text-muted">
                  <span className="text-muted">Printers:</span> {u.printers_owned}
                </p>
              )}
              {u.filaments_available && (
                <p className="text-xs text-muted">
                  <span className="text-muted">Filaments:</span> {u.filaments_available}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
