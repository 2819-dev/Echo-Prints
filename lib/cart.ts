export interface CartItem {
  productId: number;
  title: string;
  price: number;
  photo: string | null;
  quantity: number;
  colors: string[];
}

function sameColors(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((c, i) => c === sb[i]);
}

const STORAGE_KEY = "echo_cart";
const UPDATE_EVENT = "echo-cart-updated";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // localStorage unavailable (private mode, etc.) — cart just won't persist.
  }
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = getCart();
  const existing = items.find((i) => i.productId === item.productId && sameColors(i.colors, item.colors));
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ ...item, quantity });
  }
  saveCart(items);
}

export function updateCartQuantity(productId: number, colors: string[], quantity: number) {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter((i) => !(i.productId === productId && sameColors(i.colors, colors)));
  } else {
    items = items.map((i) => (i.productId === productId && sameColors(i.colors, colors) ? { ...i, quantity } : i));
  }
  saveCart(items);
}

export function removeFromCart(productId: number, colors: string[]) {
  saveCart(getCart().filter((i) => !(i.productId === productId && sameColors(i.colors, colors))));
}

export function clearCart() {
  saveCart([]);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function subscribeToCart(callback: () => void): () => void {
  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
