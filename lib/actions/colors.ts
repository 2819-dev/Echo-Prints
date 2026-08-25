"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/colors");
}

export async function addColorAction(formData: FormData) {
  await requireUser("admin");

  const name = String(formData.get("name") || "").trim();
  const material = String(formData.get("material") || "").trim();
  const hexPrimary = String(formData.get("hexPrimary") || "#888888").trim();
  const hexSecondary = String(formData.get("hexSecondary") || "#444444").trim();
  const inStock = formData.get("inStock") === "on";
  const photoDataUrl = String(formData.get("photoDataUrl") || "").trim() || null;

  if (!name) {
    return { error: "Color name is required." };
  }

  await db.sql`
    INSERT INTO colors (name, material, hex_primary, hex_secondary, in_stock, photo_data_url, sort_order)
    VALUES (
      ${name}, ${material}, ${hexPrimary}, ${hexSecondary}, ${inStock}, ${photoDataUrl},
      (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM colors)
    )
  `;

  refresh();
  return { error: "" };
}

export async function updateColorAction(formData: FormData) {
  await requireUser("admin");

  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const material = String(formData.get("material") || "").trim();
  const hexPrimary = String(formData.get("hexPrimary") || "").trim();
  const hexSecondary = String(formData.get("hexSecondary") || "").trim();
  const photoDataUrl = String(formData.get("photoDataUrl") || "").trim();
  const removePhoto = formData.get("removePhoto") === "on";

  if (!id || !name) {
    return { error: "Color name is required." };
  }

  if (photoDataUrl) {
    await db.sql`
      UPDATE colors
      SET name = ${name}, material = ${material}, hex_primary = ${hexPrimary},
          hex_secondary = ${hexSecondary}, photo_data_url = ${photoDataUrl}
      WHERE id = ${id}
    `;
  } else {
    await db.sql`
      UPDATE colors
      SET name = ${name}, material = ${material}, hex_primary = ${hexPrimary},
          hex_secondary = ${hexSecondary},
          photo_data_url = CASE WHEN ${removePhoto} THEN NULL ELSE photo_data_url END
      WHERE id = ${id}
    `;
  }

  refresh();
  return { error: "" };
}

export async function toggleColorStockAction(colorId: number, inStock: boolean) {
  await requireUser("admin");
  await db.sql`UPDATE colors SET in_stock = ${inStock} WHERE id = ${colorId}`;
  refresh();
}

export async function deleteColorAction(colorId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM colors WHERE id = ${colorId}`;
  refresh();
}

export async function reorderColorsAction(orderedIds: number[]) {
  await requireUser("admin");
  await Promise.all(
    orderedIds.map((id, index) => db.sql`UPDATE colors SET sort_order = ${index} WHERE id = ${id}`)
  );
  refresh();
}

export async function bulkToggleStockAction(ids: number[], inStock: boolean) {
  await requireUser("admin");
  await Promise.all(ids.map((id) => db.sql`UPDATE colors SET in_stock = ${inStock} WHERE id = ${id}`));
  refresh();
}

export async function bulkDeleteColorsAction(ids: number[]) {
  await requireUser("admin");
  await Promise.all(ids.map((id) => db.sql`DELETE FROM colors WHERE id = ${id}`));
  refresh();
}
