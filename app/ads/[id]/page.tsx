"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { ArrowRight, MapPin, CalendarDays, ShieldCheck, Image as ImageIcon } from "lucide-react";

type Ad = { id: number; title: string; description: string; price_toman: number | string; city: string; category: string; image_urls?: string[]; created_at?: string; is_featured?: boolean };
const money = (value: number | string) => Number(value) > 0 ? new Intl.NumberFormat("fa-IR").format(Number(value)) + " تومان" : "توافقی";

export default function AdDetailPage() {
  const params = useParams<{ id: string }>();
  const [ad, setAd] = useState<Ad | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/listings/" + encodeURIComponent(params.id), { cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "آگهی پیدا نشد."); return data; })
      .then(data => { if (active) setAd(data.listing); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : "خطایی رخ داد."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.id]);

  const photos = ad?.image_urls?.length ? ad.image_urls : [];
  return <><Header /><main className="container min-h-[65vh] py-6 md:py-10">
    <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand"><ArrowRight size={18}/> بازگشت به آگهی‌ها</Link>
    {loading ? <div className="card p-12 text-center text-sm text-muted">در حال دریافت جزئیات آگهی...</div> :
    error || !ad ? <div className="card p-10 text-center"><p className="font-bold">{error || "آگهی پیدا نشد."}</p><Link href="/" className="btn btn-primary mt-5 inline-flex">رفتن به صفحه اصلی</Link></div> :
    <div className="grid items-start gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <section className="min-w-0">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white">
          <div className="relative grid aspect-[4/3] max-h-[620px] place-items-center bg-[#f5f3ef]">
            {photos.length ? <img src={photos[selectedImage]} alt={ad.title} className="h-full w-full object-contain"/> : <div className="flex flex-col items-center gap-2 text-gray-400"><ImageIcon size={42}/><span className="text-sm">برای این آگهی عکسی ثبت نشده</span></div>}
            {ad.is_featured && <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-950">★ آگهی ویژه</span>}
          </div>
          {photos.length > 1 && <div className="flex gap-2 overflow-x-auto border-t border-gray-100 p-3">{photos.map((src, index) => <button key={src} onClick={() => setSelectedImage(index)} aria-label={"نمایش عکس " + (index + 1)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${selectedImage === index ? "border-brand" : "border-transparent"}`}><img src={src} alt="" className="h-full w-full object-cover"/></button>)}</div>}
        </div>
        <div className="card mt-5 p-5 md:p-7"><h2 className="text-lg font-black">توضیحات آگهی</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-gray-600">{ad.description}</p></div>
      </section>
      <aside className="card p-5 md:sticky md:top-5 md:p-6">
        <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-orange-50 px-3 py-1.5 font-bold text-brand">{ad.category}</span><span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">{photos.length} عکس</span></div>
        <h1 className="mt-4 text-xl font-black leading-9">{ad.title}</h1>
        <p className="mt-5 text-2xl font-black text-brand">{money(ad.price_toman)}</p>
        <div className="my-5 space-y-4 border-y border-gray-100 py-5 text-sm text-gray-600">
          <div className="flex items-center gap-2"><MapPin size={18} className="text-brand"/>{ad.city}</div>
          <div className="flex items-center gap-2"><CalendarDays size={18} className="text-brand"/>{ad.created_at ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(ad.created_at)) : "آگهی ثبت‌شده"}</div>
        </div>
        <div className="rounded-2xl bg-[#fff8ef] p-4 text-xs leading-7 text-gray-600"><div className="mb-1 flex items-center gap-2 font-bold text-[#18343c]"><ShieldCheck size={17}/> نکته ایمنی سه‌سوته</div>قبل از پرداخت، کالا یا ملک را حضوری بررسی کن و از واریز بیعانه بدون اطمینان خودداری کن.</div>
        <p className="mt-4 text-center text-xs leading-6 text-muted">اطلاعات تماس آگهی‌دهنده در مرحله بعد به این صفحه اضافه می‌شود.</p>
      </aside>
    </div>}
  </main></>;
}
