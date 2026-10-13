"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, cartCount, subscribeToCart } from "@/lib/cart";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(cartCount(getCart()));
    update();
    return subscribeToCart(update);
  }, []);

  return (
    <Link href="/checkout" className="flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent">
      Cart
      {count > 0 && (
        <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{count}</span>
      )}
    </Link>
  );
}
