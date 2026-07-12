"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { db, type ApplicationType } from "@/lib/db";
import { hashPassword, requireUser } from "@/lib/auth";

export async function submitApplicationAction(formData: FormData) {
  const type = String(formData.get("type") || "") as ApplicationType;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const businessName = String(formData.get("businessName") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const message = String(formData.get("message") || "").trim() || null;

  if (type !== "retailer" && type !== "printer") {
    return { ok: false, error: "Invalid application type." };
  }
  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  await db.sql`
    INSERT INTO applications (type, name, email, business_name, phone, message)
    VALUES (${type}, ${name}, ${email}, ${businessName}, ${phone}, ${message})
  `;

  revalidatePath("/admin");
  return { ok: true };
}

function generateTempPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function approveApplicationAction(applicationId: number) {
  await requireUser("admin");

  const rows = await db.sql`SELECT * FROM applications WHERE id = ${applicationId}`;
  const application = rows[0] as
    | {
        id: number;
        type: ApplicationType;
        name: string;
        email: string;
        business_name: string | null;
        phone: string | null;
        status: string;
      }
    | undefined;

  if (!application || application.status !== "pending") {
    return { ok: false, error: "Application not found or already handled.", tempPassword: null as string | null };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const role = application.type; // 'retailer' | 'printer'

  await db.sql`
    INSERT INTO users (email, password_hash, name, role, business_name, phone)
    VALUES (${application.email}, ${passwordHash}, ${application.name}, ${role}, ${application.business_name}, ${application.phone})
    ON CONFLICT (email) DO NOTHING
  `;

  await db.sql`UPDATE applications SET status = 'approved' WHERE id = ${applicationId}`;

  revalidatePath("/admin");
  return { ok: true, error: null as string | null, tempPassword };
}

export async function rejectApplicationAction(applicationId: number) {
  await requireUser("admin");
  await db.sql`UPDATE applications SET status = 'rejected' WHERE id = ${applicationId}`;
  revalidatePath("/admin");
}
