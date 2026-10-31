"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { categories, type Listing } from "@/data/listings";
import locationData from "@/data/iran-locations.json";
import { Search, MapPin, ChevronLeft, ShieldCheck, Zap, MessageCircle, SlidersHorizontal, X } from "lucide-react";

type ApiListing = { id: number; title: string; description: string; price_toman: number | string; city: string; category: string; image_urls?: string[]; created_at?: string; is_featured?: boolean; is_bumped?: boolean };
const fallbackImage = "https://images.unsplash.com/photo-1560461396-ecf8d8c3e6f5?auto=format&fit=crop&w=900&q=80";
const toman = (value: number | string) => Number(value) > 0 ? new Intl.NumberFormat("fa-IR").format(Number(value)) + " تومان" : "توافقی";
const englishDigits = (value: string) => value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[٬,\s]/g, "");

export default function Home() {
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("همه شهرها");
  const availableCities = useMemo(() => locationData.cities.filter(item => !province || item.province_id === Number(province)).sort((a, b) => a.name.localeCompare(b.name, "fa")), [province]);
  const [category, setCategory] = useState("همه");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city !== "همه شهرها") params.set("city", city);
    if (category !== "همه") params.set("category", category);
    const min = englishDigits(minPrice);
    const max = englishDigits(maxPrice);
    if (min) params.set("min_price", min);
    if (max) params.set("max_price", max);
    setLoaded(false);
    setLoadError(false);
    fetch("/api/listings" + (params.size ? "?" + params.toString() : ""), { cache: "no-store" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error("LOAD_FAILED")))
      .then(data => {
        if (!active) return;
        const rows: ApiListing[] = Array.isArray(data.listings) ? data.listings : [];
        setLiveListings(rows.map(row => ({
          id: Number(row.id), title: row.title, description: row.description,
          price: toman(row.price_toman), city: row.city, category: row.category,
          image: row.image_urls?.[0] || fallbackImage, time: "آگهی ثبت‌شده",
          featured: Boolean(row.is_featured), bumped: Boolean(row.is_bumped)
        })));
      })
      .catch(() => { if (active) { setLiveListings([]); setLoadError(true); } })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [query, city, category, minPrice, maxPrice]);

  const activeFilters = Boolean(query.trim() || province || city !== "همه شهرها" || category !== "همه" || minPrice || maxPrice);
  const clearFilters = () => { setQuery(""); setProvince(""); setCity("همه شهرها"); setCategory("همه"); setMinPrice(""); setMaxPrice(""); };
  const invalidRange = Boolean(minPrice && maxPrice && Number(englishDigits(minPrice)) > Number(englishDigits(maxPrice)));

  return <><Header /><main>
    <section className="container pt-7 md:pt-10"><div className="relative overflow-hidden rounded-[28px] bg-[#18343c] px-5 py-9 text-white md:px-12 md:py-14">
      <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full border-[36px] border-[#f47735]/20" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#f47735]/10 blur-2xl" />
      <div className="relative max-w-2xl"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85">بازار آنلاین مردم ایران</span>
        <h1 className="mt-5 text-3xl font-black leading-[1.5] md:text-5xl">هرچی می‌خوای،<br/><span className="text-[#ffad70]">سه‌سوته پیدا کن!</span></h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-white/75">از خریدوفروش خودرو و خانه تا موبایل و وسایل روزمره؛ آگهی‌ات را ثبت کن یا چیزی را که دنبالش هستی پیدا کن.</p>
        <div className="mt-7 grid gap-2 rounded-2xl bg-white p-2 md:grid-cols-[1fr_180px_auto]">
          <div className="flex items-center gap-2 px-2"><Search className="text-gray-400" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="چی می‌خوای پیدا کنی؟" className="w-full py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"/></div>
          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 px-2 md:border-r md:border-t-0"><div className="flex items-center gap-1"><MapPin className="shrink-0 text-gray-400" size={17}/><select aria-label="استان" value={province} onChange={e=>{setProvince(e.target.value);setCity("همه شهرها");}} className="w-full bg-transparent py-3 text-xs text-gray-700 outline-none"><option value="">همه استان‌ها</option>{locationData.provinces.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div><select aria-label="شهر" value={city} onChange={e=>setCity(e.target.value)} className="w-full min-w-0 bg-transparent py-3 text-xs text-gray-700 outline-none"><option value="همه شهرها">همه شهرها</option>{availableCities.map(item=><option key={item.id} value={item.name}>{item.name}</option>)}</select></div>
          <button onClick={()=>document.getElementById("latest")?.scrollIntoView({behavior:"smooth"})} className="btn btn-primary px-7">جست‌وجو</button>
        </div>
        <button onClick={()=>setShowFilters(v=>!v)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white"><SlidersHorizontal size={16}/> فیلتر قیمت و دسته‌بندی {showFilters ? "−" : "+"}</button>
        {showFilters && <div className="mt-3 grid gap-2 rounded-2xl bg-white p-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-gray-700">حداقل قیمت (تومان)<input inputMode="numeric" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="مثلاً ۱۰۰۰۰۰۰" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-900 outline-none focus:border-orange-400"/></label>
          <label className="text-xs font-bold text-gray-700">حداکثر قیمت (تومان)<input inputMode="numeric" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="مثلاً ۵۰۰۰۰۰۰۰" className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-900 outline-none focus:border-orange-400"/></label>
          {invalidRange && <p className="text-xs text-red-600 sm:col-span-2">حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد.</p>}
          <button onClick={()=>{setMinPrice("");setMaxPrice("");}} className="inline-flex items-center justify-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 sm:col-span-2"><X size={14}/> پاک‌کردن محدوده قیمت</button>
        </div>}
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/75"><span>✓ ثبت آگهی آسان</span><span>✓ دسته‌بندی متنوع</span><span>✓ برای همه شهرهای ایران</span></div>
      </div></div></section>
    <section id="categories" className="container pt-10"><div className="mb-5 flex items-end justify-between"><div><h2 className="section-title">از کجا شروع کنیم؟</h2><p className="mt-1 text-xs text-muted">دسته موردنظرت را انتخاب کن</p></div><a href="#latest" className="flex items-center text-xs font-bold text-brand">همه آگهی‌ها <ChevronLeft size={16}/></a></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{categories.map((c,i)=><button key={c.name} onClick={()=>{setCategory(c.name);document.getElementById("latest")?.scrollIntoView({behavior:"smooth"})}} className={`card p-4 text-right transition hover:-translate-y-1 hover:border-orange-200 ${category===c.name?"border-orange-300 bg-orange-50/40":""}`}><span className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-2xl ${["bg-orange-50 text-orange-600","bg-teal-50 text-teal-700","bg-amber-50 text-amber-700","bg-sky-50 text-sky-700"][i%4]}`}>{c.icon}</span><b className="block text-sm">{c.name}</b><small className="mt-1 block text-[10px] text-muted">{c.count}</small></button>)}</div></section>
    <section id="latest" className="container py-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="section-title">آگهی‌ها</h2><p className="mt-1 text-xs text-muted">{activeFilters ? "نتایج مطابق فیلترهای انتخاب‌شده" : "آگهی‌های منتشرشده در سه‌سوته"}</p></div><div className="flex gap-2 overflow-x-auto">{["همه","املاک","خودرو","موبایل و دیجیتال","خانه و آشپزخانه","استخدام و کاریابی","خدمات","وسایل شخصی","ورزش و سرگرمی"].map(c=><button key={c} onClick={()=>setCategory(c)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${category===c?"bg-brand text-white":"bg-white text-gray-600 ring-1 ring-gray-200"}`}>{c}</button>)}</div></div>
      {loadError ? <div className="card p-10 text-center text-sm text-red-600">دریافت آگهی‌ها با مشکل روبه‌رو شد. صفحه را تازه‌سازی کن.</div> : invalidRange ? <div className="card p-10 text-center text-sm text-muted">محدوده قیمت را اصلاح کن.</div> : liveListings.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{liveListings.map(x=><ListingCard key={x.id} item={x}/>)}</div> : <div className="card p-10 text-center text-sm text-muted">{loaded ? "آگهی‌ای با این مشخصات پیدا نشد." : "در حال جست‌وجوی آگهی‌ها..." }{activeFilters && loaded && <button onClick={clearFilters} className="mx-auto mt-4 block font-bold text-brand">پاک‌کردن همه فیلترها</button>}</div>}</section>
    <section className="container pb-12"><div className="grid gap-3 md:grid-cols-3">{[{icon:ShieldCheck,title:"با دقت معامله کن",desc:"اطلاعات آگهی را بررسی کن و پیش از پرداخت، از کالا و هویت طرف معامله مطمئن شو."},{icon:Zap,title:"سه‌سوته آگهی بذار",desc:"کالا یا خدماتت را معرفی کن تا خریداران راحت‌تر پیدایت کنند."},{icon:MessageCircle,title:"راحت ارتباط بگیر",desc:"برای پرسیدن جزئیات، با آگهی‌دهنده ارتباط بگیر."}].map(x=><div key={x.title} className="card flex gap-3 p-5"><x.icon className="shrink-0 text-brand" size={24}/><div><b className="text-sm">{x.title}</b><p className="mt-1 text-xs leading-6 text-muted">{x.desc}</p></div></div>)}</div></section>
  </main><footer id="about" className="border-t border-[#eee6dd] bg-white py-7"><div className="container flex flex-col justify-between gap-3 text-xs text-muted sm:flex-row"><span>© سه‌سوته — بازار آنلاین مردم ایران</span><span className="flex flex-wrap gap-4"><Link href="/terms" className="hover:text-brand">قوانین و مقررات</Link><Link href="/privacy" className="hover:text-brand">حریم خصوصی</Link><Link href="/help" className="hover:text-brand">راهنما</Link></span><span>هرچی می‌خوای، سه‌سوته!</span></div></footer></>;
}
