"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { db, type Application, type ApplicationType } from "@/lib/db";
import { hashPassword, requireUser } from "@/lib/auth";

export async function submitApplicationAction(formData: FormData) {
  const type = String(formData.get("type") || "") as ApplicationType;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const businessName = String(formData.get("businessName") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const printersOwned = String(formData.get("printersOwned") || "").trim() || null;
  const filamentsAvailable = String(formData.get("filamentsAvailable") || "").trim() || null;
  const message = String(formData.get("message") || "").trim() || null;

  if (type !== "retailer" && type !== "printer") {
    return { ok: false, error: "Invalid application type." };
  }
  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }

  await db.sql`
    INSERT INTO applications
      (type, name, email, business_name, phone, address, printers_owned, filaments_available, message)
    VALUES
      (${type}, ${name}, ${email}, ${businessName}, ${phone}, ${address}, ${printersOwned}, ${filamentsAvailable}, ${message})
  `;

  revalidatePath("/admin");
  return { ok: true };
}

function generateTempPassword() {
  return crypto.randomBytes(6).toString("base64url");
}

export async function approveApplicationAction(applicationId: number) {
  await requireUser("admin");

  const rows = await db.sql<Application>`SELECT * FROM applications WHERE id = ${applicationId}`;
  const application = rows[0];

  if (!application || application.status !== "pending") {
    return { ok: false, error: "Application not found or already handled.", tempPassword: null as string | null };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const role = application.type; // 'retailer' | 'printer'

  await db.sql`
    INSERT INTO users
      (email, password_hash, name, role, business_name, phone, address, printers_owned, filaments_available)
    VALUES
      (${application.email}, ${passwordHash}, ${application.name}, ${role}, ${application.business_name},
       ${application.phone}, ${application.address}, ${application.printers_owned}, ${application.filaments_available})
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
