"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, hashPassword } from "@/lib/auth";

export async function updateUserAccountAction(formData: FormData) {
  await requireUser("admin");

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim() || null;
  const businessName = String(formData.get("businessName") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const printersOwned = String(formData.get("printersOwned") || "").trim() || null;

  if (!id || !name || !email) {
    return { error: "Name and email are required." };
  }

  const existing = await db.sql<{ id: number }>`SELECT id FROM users WHERE email = ${email} AND id != ${id}`;
  if (existing.length > 0) {
    return { error: "Another account already uses that email." };
  }

  await db.sql`
    UPDATE users
    SET name = ${name}, email = ${email}, phone = ${phone}, business_name = ${businessName},
        address = ${address}, printers_owned = ${printersOwned}
    WHERE id = ${id} AND role IN ('printer', 'retailer')
  `;

  revalidatePath("/admin");
  return { error: "" };
}

export async function setUserPasswordAction(userId: number, newPassword: string) {
  await requireUser("admin");

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId} AND role IN ('printer', 'retailer')`;

  revalidatePath("/admin");
  return { error: "" };
}
