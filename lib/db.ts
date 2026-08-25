import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

// Lazily initializes the real connection on first use, so importing this
// module doesn't require a live database (e.g. during `next build`).
function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Point it at your Postgres connection string."
      );
    }
    _sql = neon(connectionString);
  }
  return _sql;
}

function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...params: unknown[]
): Promise<T[]> {
  return getSql()(strings, ...params) as Promise<T[]>;
}

export const db = { sql };

export type Role = "admin" | "printer" | "retailer";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  business_name: string | null;
  address: string | null;
  phone: string | null;
  printers_owned: string | null;
  filaments_available: string | null;
  created_at: string;
}

export type ApplicationType = "retailer" | "printer";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: number;
  type: ApplicationType;
  name: string;
  email: string;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  printers_owned: string | null;
  filaments_available: string | null;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface ColorStock {
  id: number;
  name: string;
  material: string;
  hex_primary: string;
  hex_secondary: string;
  in_stock: boolean;
  sort_order: number;
  photo_data_url: string | null;
}

export type JobStatus = "available" | "claimed" | "printed" | "fulfilled";
export type FulfillmentMethod = "retailer_dropoff" | "echo_pickup";

export interface PrintJob {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  quantity_needed: number;
  status: JobStatus;
  claimed_by: number | null;
  claimed_at: string | null;
  printed_at: string | null;
  fulfillment_method: FulfillmentMethod | null;
  fulfillment_retailer_id: number | null;
  fulfilled_at: string | null;
  created_at: string;
}

export type OrderStatus = "pending" | "fulfilled";

export interface Order {
  id: number;
  name: string;
  price: string;
  quantity: number;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
}
