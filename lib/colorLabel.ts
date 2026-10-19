import type { ColorStock } from "@/lib/db";

// Colors can share a name across materials (three different "Black"s, say),
// so anywhere a color is selected or recorded by a plain string, include the
// material to keep it unambiguous. Used client-side (color pickers, cart) and
// server-side (order validation) so the two always agree on the same label.
export function colorLabel(color: Pick<ColorStock, "name" | "material">): string {
  return color.material?.trim() ? `${color.name} (${color.material})` : color.name;
}
