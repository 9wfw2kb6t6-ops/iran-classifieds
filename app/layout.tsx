import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بازار | خرید و فروش آسان",
  description: "بازار آنلاین آگهی‌های خرید و فروش در سراسر ایران"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}