import { getDatabase, type DatabaseConnection } from "@netlify/database";

let _db: DatabaseConnection | null = null;

function getDb(): DatabaseConnection {
  if (!_db) _db = getDatabase();
  return _db;
}

// Lazily initializes the real connection on first use, so importing this
// module doesn't require a live database (e.g. during `next build`).
export const db = new Proxy({} as DatabaseConnection, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

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
