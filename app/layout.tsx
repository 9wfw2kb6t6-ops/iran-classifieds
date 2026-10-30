import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "سه‌سوته | هرچی می‌خوای، سه‌سوته!",
  description: "بازار آنلاین مردم ایران؛ خرید و فروش آسان آگهی‌ها در سراسر کشور"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}