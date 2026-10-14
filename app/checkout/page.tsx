import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const initialUser = user && user.role === "customer" ? { name: user.name, email: user.email } : null;

  return <CheckoutForm initialUser={initialUser} />;
}
