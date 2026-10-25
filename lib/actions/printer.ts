"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function updatePrintersOwnedAction(formData: FormData) {
  const user = await requireUser("printer");

  const raw = String(formData.get("printersOwned") || "");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const printersOwned = lines.length > 0 ? lines.join("\n") : null;

  await db.sql`UPDATE users SET printers_owned = ${printersOwned} WHERE id = ${user.id}`;

  refresh();
  return { error: "" };
}

export async function addFilamentAction(formData: FormData) {
  const user = await requireUser("printer");

  const company = String(formData.get("company") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const color = String(formData.get("color") || "").trim();

  if (!company || !type || !color) {
    return { error: "Fill in company, type, and color." };
  }

  await db.sql`
    INSERT INTO printer_filaments (user_id, company, type, color, sort_order)
    VALUES (
      ${user.id}, ${company}, ${type}, ${color},
      (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM printer_filaments WHERE user_id = ${user.id})
    )
  `;

  refresh();
  return { error: "" };
}

export async function deleteFilamentAction(filamentId: number) {
  const user = await requireUser("printer");
  await db.sql`DELETE FROM printer_filaments WHERE id = ${filamentId} AND user_id = ${user.id}`;
  refresh();
}
