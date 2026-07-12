"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function addColorAction(formData: FormData) {
  await requireUser("admin");

  const name = String(formData.get("name") || "").trim();
  const material = String(formData.get("material") || "Bambu Lab Silk Dual-Color (Swirl)").trim();
  const hexPrimary = String(formData.get("hexPrimary") || "#888888").trim();
  const hexSecondary = String(formData.get("hexSecondary") || "#444444").trim();
  const inStock = formData.get("inStock") === "on";

  if (!name) {
    return { error: "Color name is required." };
  }

  await db.sql`
    INSERT INTO colors (name, material, hex_primary, hex_secondary, in_stock, sort_order)
    VALUES (
      ${name}, ${material}, ${hexPrimary}, ${hexSecondary}, ${inStock},
      (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM colors)
    )
  `;

  revalidatePath("/admin");
  revalidatePath("/inventory");
  return { error: "" };
}

export async function toggleColorStockAction(colorId: number, inStock: boolean) {
  await requireUser("admin");
  await db.sql`UPDATE colors SET in_stock = ${inStock} WHERE id = ${colorId}`;
  revalidatePath("/admin");
  revalidatePath("/inventory");
}

export async function deleteColorAction(colorId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM colors WHERE id = ${colorId}`;
  revalidatePath("/admin");
  revalidatePath("/inventory");
}
