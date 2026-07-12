import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Echo Prints",
  description: "Custom 3D printed goods, made-to-order colorways, and a printer network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-900 antialiased">{children}</body>
    </html>
  );
}
