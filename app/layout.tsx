import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://iran-classifieds.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "سه‌سوته | هرچی می‌خوای، سه‌سوته!",
    template: "%s | سه‌سوته"
  },
  description: "سه‌سوته؛ بازار آنلاین خرید و فروش در سراسر ایران. آگهی رایگان ثبت کن، کالا و خدمات موردنظرت را سریع پیدا کن.",
  applicationName: "سه‌سوته",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName: "سه‌سوته",
    title: "سه‌سوته | هرچی می‌خوای، سه‌سوته!",
    description: "خرید و فروش آسان در سراسر ایران؛ ثبت آگهی رایگان و پیدا کردن کالا و خدمات."
  },
  twitter: {
    card: "summary",
    title: "سه‌سوته | هرچی می‌خوای، سه‌سوته!",
    description: "بازار آنلاین خرید و فروش در سراسر ایران"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}