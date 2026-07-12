"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createSession, destroySession, getCurrentUser, hashPassword, verifyCredentials } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@/lib/db";

export async function loginAction(
  formData: FormData
): Promise<{ error: string; role?: never } | { error?: never; role: Role }> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const user = await verifyCredentials(email, password);
    if (!user) {
      return { error: "That email/password combo doesn't match our records." };
    }

    await createSession(user.id, user.role);
    return { role: user.role };
  } catch (err) {
    return { error: `Server error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function changePasswordAction(formData: FormData): Promise<{ error: string; ok?: never } | { error?: never; ok: true }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You need to be logged in to do that." };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Fill in all three fields." };
  }
  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation don't match." };
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return { error: "Current password is incorrect." };
  }

  const newHash = await hashPassword(newPassword);
  await db.sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;

  return { ok: true };
}
