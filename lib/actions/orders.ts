"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createOrderAction(formData: FormData) {
  await requireUser("admin");

  const name = String(formData.get("name") || "").trim();
  const price = Number(formData.get("price"));
  const quantity = Number(formData.get("quantity") || 1);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!name) {
    return { error: "Order name is required." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Enter a valid price." };
  }

  await db.sql`
    INSERT INTO orders (name, price, quantity, notes)
    VALUES (${name}, ${price}, ${quantity > 0 ? quantity : 1}, ${notes})
  `;

  revalidatePath("/admin");
  return { error: "" };
}

export async function toggleOrderStatusAction(orderId: number, status: "pending" | "fulfilled") {
  await requireUser("admin");
  await db.sql`UPDATE orders SET status = ${status} WHERE id = ${orderId}`;
  revalidatePath("/admin");
}

export async function deleteOrderAction(orderId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM orders WHERE id = ${orderId}`;
  revalidatePath("/admin");
}
