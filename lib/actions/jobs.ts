"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function createJobAction(formData: FormData) {
  await requireUser("admin");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const fileUrl = String(formData.get("fileUrl") || "").trim();
  const quantity = Number(formData.get("quantity") || 1);

  if (!title || !fileUrl) {
    return { error: "Title and a MakerWorld/file link are required." };
  }

  await db.sql`
    INSERT INTO print_jobs (title, description, file_url, quantity_needed)
    VALUES (${title}, ${description}, ${fileUrl}, ${quantity > 0 ? quantity : 1})
  `;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { error: "" };
}

export async function deleteJobAction(jobId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM print_jobs WHERE id = ${jobId}`;
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function claimJobAction(jobId: number) {
  const user = await requireUser("printer");
  await db.sql`
    UPDATE print_jobs
    SET status = 'claimed', claimed_by = ${user.id}, claimed_at = NOW()
    WHERE id = ${jobId} AND status = 'available'
  `;
  revalidatePath("/dashboard");
}

export async function markPrintedAction(jobId: number) {
  const user = await requireUser("printer");
  await db.sql`
    UPDATE print_jobs
    SET status = 'printed', printed_at = NOW()
    WHERE id = ${jobId} AND claimed_by = ${user.id} AND status = 'claimed'
  `;
  revalidatePath("/dashboard");
}

export async function fulfillJobAction(
  jobId: number,
  method: "retailer_dropoff" | "echo_pickup",
  retailerId: number | null
) {
  const user = await requireUser("printer");

  if (method === "retailer_dropoff" && !retailerId) {
    return { error: "Pick a retailer from the list." };
  }

  await db.sql`
    UPDATE print_jobs
    SET status = 'fulfilled',
        fulfillment_method = ${method},
        fulfillment_retailer_id = ${method === "retailer_dropoff" ? retailerId : null},
        fulfilled_at = NOW()
    WHERE id = ${jobId} AND claimed_by = ${user.id} AND status = 'printed'
  `;

  revalidatePath("/dashboard");
  return { error: "" };
}
