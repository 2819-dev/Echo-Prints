import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const initialUser =
    user && user.role === "customer"
      ? { name: user.name, email: user.email, phone: user.phone, address: user.address }
      : null;

  return <CheckoutForm initialUser={initialUser} />;
}
