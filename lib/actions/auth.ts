"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import type { Role } from "@/lib/db";

export async function loginAction(
  formData: FormData
): Promise<{ error: string; role?: never } | { error?: never; role: Role }> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "That email/password combo doesn't match our records." };
  }

  await createSession(user.id, user.role);
  return { role: user.role };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
