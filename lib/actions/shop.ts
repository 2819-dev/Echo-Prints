"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, getCurrentUser } from "@/lib/auth";
import { colorLabel } from "@/lib/colorLabel";
import type { PaymentMethod, Product, ProductTag } from "@/lib/db";

const VALID_TAGS: ProductTag[] = ["customizable", "discontinued", "limited_edition"];

function refreshShop() {
  revalidatePath("/admin");
  revalidatePath("/shop");
}

function parseTag(formData: FormData): ProductTag | null {
  const raw = String(formData.get("tag") || "");
  return (VALID_TAGS as string[]).includes(raw) ? (raw as ProductTag) : null;
}

function parsePhotos(formData: FormData): string[] {
  const raw = String(formData.get("photos") || "[]");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string" && p) : [];
  } catch {
    return [];
  }
}

async function setProductPhotos(productId: number, photos: string[]) {
  await db.sql`DELETE FROM product_photos WHERE product_id = ${productId}`;
  await Promise.all(
    photos.map((dataUrl, index) =>
      db.sql`INSERT INTO product_photos (product_id, data_url, sort_order) VALUES (${productId}, ${dataUrl}, ${index})`
    )
  );
}

function parseColorIds(formData: FormData): number[] {
  const raw = String(formData.get("colorIds") || "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);
  } catch {
    return [];
  }
}

async function setProductColors(productId: number, colorIds: number[]) {
  await db.sql`DELETE FROM product_colors WHERE product_id = ${productId}`;
  await Promise.all(
    colorIds.map((colorId, index) =>
      db.sql`INSERT INTO product_colors (product_id, color_id, sort_order) VALUES (${productId}, ${colorId}, ${index})`
    )
  );
}

interface PartInput {
  name: string;
  colorIds: number[];
}

function parsePartsInput(formData: FormData): PartInput[] {
  const raw = String(formData.get("parts") || "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => ({
        name: typeof p?.name === "string" ? p.name.trim() : "",
        colorIds: Array.isArray(p?.colorIds)
          ? p.colorIds.map((v: unknown) => Number(v)).filter((n: number) => Number.isInteger(n) && n > 0)
          : [],
      }))
      .filter((p) => p.name);
  } catch {
    return [];
  }
}

async function setProductParts(productId: number, parts: PartInput[]) {
  await db.sql`DELETE FROM product_parts WHERE product_id = ${productId}`;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const rows = await db.sql<{ id: number }>`
      INSERT INTO product_parts (product_id, name, sort_order) VALUES (${productId}, ${part.name}, ${i}) RETURNING id
    `;
    const partId = rows[0].id;
    await Promise.all(
      part.colorIds.map((colorId, index) =>
        db.sql`INSERT INTO product_part_colors (part_id, color_id, sort_order) VALUES (${partId}, ${colorId}, ${index})`
      )
    );
  }
}

// ---------- Admin: products ----------

export async function createProductAction(formData: FormData) {
  await requireUser("admin");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim() || null;
  const tag = parseTag(formData);
  const priceRaw = String(formData.get("price") || "").trim();
  const isCustom = formData.get("isCustom") === "on";
  const active = formData.get("active") === "on";
  const photos = parsePhotos(formData);
  const colorIds = parseColorIds(formData);
  const allowMultiColor = formData.get("allowMultiColor") === "on";
  const modelUrl = String(formData.get("modelUrl") || "").trim() || null;
  const parts = parsePartsInput(formData);

  if (!title) {
    return { error: "Title is required." };
  }

  let price: number | null = null;
  if (!isCustom) {
    price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Enter a valid price, or mark this as a custom / quote item." };
    }
  }

  const rows = await db.sql<{ id: number }>`
    INSERT INTO products (title, description, price, category, tag, active, sort_order, allow_multi_color, model_url)
    VALUES (
      ${title}, ${description}, ${price}, ${category}, ${tag}, ${active},
      (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products), ${allowMultiColor}, ${modelUrl}
    )
    RETURNING id
  `;
  await setProductPhotos(rows[0].id, photos);
  await setProductColors(rows[0].id, colorIds);
  await setProductParts(rows[0].id, parts);

  refreshShop();
  return { error: "" };
}

export async function updateProductAction(formData: FormData) {
  await requireUser("admin");

  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "").trim() || null;
  const tag = parseTag(formData);
  const priceRaw = String(formData.get("price") || "").trim();
  const isCustom = formData.get("isCustom") === "on";
  const photos = parsePhotos(formData);
  const colorIds = parseColorIds(formData);
  const allowMultiColor = formData.get("allowMultiColor") === "on";
  const modelUrl = String(formData.get("modelUrl") || "").trim() || null;
  const parts = parsePartsInput(formData);

  if (!id || !title) {
    return { error: "Title is required." };
  }

  let price: number | null = null;
  if (!isCustom) {
    price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Enter a valid price, or mark this as a custom / quote item." };
    }
  }

  await db.sql`
    UPDATE products
    SET title = ${title}, description = ${description}, price = ${price}, category = ${category}, tag = ${tag}, allow_multi_color = ${allowMultiColor}, model_url = ${modelUrl}
    WHERE id = ${id}
  `;
  await setProductPhotos(id, photos);
  await setProductColors(id, colorIds);
  await setProductParts(id, parts);

  refreshShop();
  return { error: "" };
}

export async function toggleProductActiveAction(productId: number, active: boolean) {
  await requireUser("admin");
  await db.sql`UPDATE products SET active = ${active} WHERE id = ${productId}`;
  refreshShop();
}

export async function deleteProductAction(productId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM products WHERE id = ${productId}`;
  refreshShop();
}

export async function reorderProductsAction(orderedIds: number[]) {
  await requireUser("admin");
  await Promise.all(
    orderedIds.map((id, index) => db.sql`UPDATE products SET sort_order = ${index} WHERE id = ${id}`)
  );
  refreshShop();
}

export async function bulkToggleProductActiveAction(ids: number[], active: boolean) {
  await requireUser("admin");
  await Promise.all(ids.map((id) => db.sql`UPDATE products SET active = ${active} WHERE id = ${id}`));
  refreshShop();
}

export async function bulkDeleteProductsAction(ids: number[]) {
  await requireUser("admin");
  await Promise.all(ids.map((id) => db.sql`DELETE FROM products WHERE id = ${id}`));
  refreshShop();
}

// ---------- Admin: categories ----------
// Categories are just the distinct values of products.category — there's no
// separate table, so "editing" a category means bulk-updating every product
// that currently has it.

export async function renameCategoryAction(oldName: string, newName: string) {
  await requireUser("admin");
  const trimmed = newName.trim();
  if (!trimmed) {
    return { error: "New category name can't be empty." };
  }
  await db.sql`UPDATE products SET category = ${trimmed} WHERE category = ${oldName}`;
  refreshShop();
  return { error: "" };
}

export async function deleteCategoryAction(name: string) {
  await requireUser("admin");
  await db.sql`UPDATE products SET category = NULL WHERE category = ${name}`;
  refreshShop();
}

// ---------- Public: checkout ----------

interface CartLine {
  productId: number;
  quantity: number;
  colors: string[];
}

function parseCart(formData: FormData): CartLine[] {
  const raw = String(formData.get("cart") || "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((l) => ({
        productId: Number(l?.productId),
        quantity: Number(l?.quantity),
        colors: Array.isArray(l?.colors) ? l.colors.filter((c: unknown) => typeof c === "string" && c) : [],
      }))
      .filter((l) => Number.isInteger(l.productId) && l.productId > 0 && Number.isInteger(l.quantity) && l.quantity > 0);
  } catch {
    return [];
  }
}

export async function createShopOrderAction(formData: FormData) {
  const customerName = String(formData.get("customerName") || "").trim();
  const customerEmail = String(formData.get("customerEmail") || "").trim().toLowerCase();
  const customerPhone = String(formData.get("customerPhone") || "").trim() || null;
  const shippingAddress = String(formData.get("shippingAddress") || "").trim() || null;
  const paymentMethod = String(formData.get("paymentMethod") || "cash") as PaymentMethod;
  const notes = String(formData.get("notes") || "").trim() || null;
  const cart = parseCart(formData);

  if (!customerName || !customerEmail) {
    return { error: "Name and email are required." };
  }
  if (cart.length === 0) {
    return { error: "Your cart is empty." };
  }
  if (paymentMethod === "card") {
    return { error: "Card payments are coming soon — please choose Cash / pay in person for now." };
  }
  if (paymentMethod !== "cash") {
    return { error: "Choose a valid payment method." };
  }

  // Never trust client-sent prices — re-fetch each product from the DB.
  const products = await Promise.all(
    cart.map((l) => db.sql<Product>`SELECT * FROM products WHERE id = ${l.productId} AND active = TRUE`)
  );
  const byId = new Map(products.flat().map((p) => [p.id, p]));

  const allowedColors = await Promise.all(
    cart.map((l) =>
      db.sql<{ name: string; material: string }>`
        SELECT c.name, c.material FROM product_colors pc
        JOIN colors c ON c.id = pc.color_id
        WHERE pc.product_id = ${l.productId}
        ORDER BY pc.sort_order ASC
      `
    )
  );
  const allowedColorsById = new Map(cart.map((l, i) => [l.productId, allowedColors[i].map((c) => colorLabel(c))]));

  // Multi-part products (e.g. a 3-part shelf) require one color per part,
  // instead of the product-level single/multi color picker above.
  const partsRows = await Promise.all(
    cart.map((l) =>
      db.sql<{ part_id: number; part_name: string; name: string; material: string }>`
        SELECT pp.id AS part_id, pp.name AS part_name, c.name, c.material
        FROM product_parts pp
        JOIN product_part_colors ppc ON ppc.part_id = pp.id
        JOIN colors c ON c.id = ppc.color_id
        WHERE pp.product_id = ${l.productId}
        ORDER BY pp.sort_order ASC, ppc.sort_order ASC
      `
    )
  );
  const partsByProductId = new Map(
    cart.map((l, i) => {
      const parts = new Map<number, { name: string; allowedLabels: string[] }>();
      for (const row of partsRows[i]) {
        const part = parts.get(row.part_id) ?? { name: row.part_name, allowedLabels: [] };
        part.allowedLabels.push(`${row.part_name}: ${colorLabel(row)}`);
        parts.set(row.part_id, part);
      }
      return [l.productId, Array.from(parts.values())];
    })
  );

  const lineItems: { productId: number; title: string; price: number; quantity: number; colors: string | null }[] = [];
  for (const line of cart) {
    const product = byId.get(line.productId);
    if (!product || product.price === null) {
      return { error: "One of the items in your cart is no longer available. Please refresh and try again." };
    }

    const parts = partsByProductId.get(line.productId) ?? [];
    let colors: string[];
    if (parts.length > 0) {
      colors = [];
      for (const part of parts) {
        const match = line.colors.find((c) => part.allowedLabels.includes(c));
        if (!match) {
          return { error: `Choose a color for "${part.name}" on ${product.title}.` };
        }
        colors.push(match);
      }
    } else {
      const allowed = allowedColorsById.get(line.productId) ?? [];
      colors = line.colors.filter((c) => allowed.includes(c));
      if (allowed.length > 0) {
        if (colors.length === 0) {
          return { error: `Choose a color for ${product.title}.` };
        }
        if (!product.allow_multi_color) {
          colors = colors.slice(0, 1);
        }
      } else {
        colors = [];
      }
    }

    lineItems.push({
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      quantity: line.quantity,
      colors: colors.length > 0 ? colors.join(", ") : null,
    });
  }

  const total = lineItems.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const currentUser = await getCurrentUser();
  const userId = currentUser && currentUser.role === "customer" ? currentUser.id : null;

  const orderRows = await db.sql<{ id: number }>`
    INSERT INTO shop_orders (user_id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total, notes)
    VALUES (${userId}, ${customerName}, ${customerEmail}, ${customerPhone}, ${shippingAddress}, ${paymentMethod}, ${total}, ${notes})
    RETURNING id
  `;
  const orderId = orderRows[0].id;

  await Promise.all(
    lineItems.map((l) =>
      db.sql`
        INSERT INTO shop_order_items (order_id, product_id, title, price, quantity, colors)
        VALUES (${orderId}, ${l.productId}, ${l.title}, ${l.price}, ${l.quantity}, ${l.colors})
      `
    )
  );

  revalidatePath("/admin");
  return { error: "", orderId };
}

// ---------- Admin: shop orders ----------

export async function updateShopOrderStatusAction(orderId: number, status: string) {
  await requireUser("admin");
  await db.sql`UPDATE shop_orders SET status = ${status} WHERE id = ${orderId}`;
  revalidatePath("/admin");
}

export async function setShopOrderPaidAction(orderId: number, paid: boolean) {
  await requireUser("admin");
  await db.sql`UPDATE shop_orders SET payment_status = ${paid ? "paid" : "unpaid"} WHERE id = ${orderId}`;
  revalidatePath("/admin");
}

export async function deleteShopOrderAction(orderId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM shop_orders WHERE id = ${orderId}`;
  revalidatePath("/admin");
}

// ---------- Public: custom requests ----------

export async function createCustomRequestAction(formData: FormData) {
  const productId = Number(formData.get("productId")) || null;
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim() || null;
  const details = String(formData.get("details") || "").trim();

  if (!name || !email || !details) {
    return { error: "Name, email, and a description of what you want are required." };
  }

  await db.sql`
    INSERT INTO custom_requests (product_id, name, email, phone, details)
    VALUES (${productId}, ${name}, ${email}, ${phone}, ${details})
  `;

  revalidatePath("/admin");
  return { error: "" };
}

// ---------- Admin: custom requests ----------

export async function setCustomRequestStatusAction(requestId: number, status: string) {
  await requireUser("admin");
  await db.sql`UPDATE custom_requests SET status = ${status} WHERE id = ${requestId}`;
  revalidatePath("/admin");
}

export async function setCustomRequestQuoteAction(requestId: number, quotedPrice: number, adminNotes: string) {
  await requireUser("admin");
  await db.sql`
    UPDATE custom_requests
    SET quoted_price = ${quotedPrice}, admin_notes = ${adminNotes || null}, status = 'quoted'
    WHERE id = ${requestId}
  `;
  revalidatePath("/admin");
}

export async function deleteCustomRequestAction(requestId: number) {
  await requireUser("admin");
  await db.sql`DELETE FROM custom_requests WHERE id = ${requestId}`;
  revalidatePath("/admin");
}
