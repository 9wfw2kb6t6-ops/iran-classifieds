"use client";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import ListingCard from "@/components/ListingCard";
import { categories, listings } from "@/data/listings";
import { Search, MapPin, ChevronLeft, ShieldCheck, Zap, MessageCircle } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("همه شهرها");
  const [category, setCategory] = useState("همه");
  const filtered = useMemo(() => listings.filter(x =>
    (category === "همه" || x.category === category) &&
    (x.title + x.city + x.category).includes(query.trim()) &&
    (city === "همه شهرها" || x.city.includes(city))
  ), [query, city, category]);
  return <><Header /><main>
    <section className="container pt-7 md:pt-10"><div className="relative overflow-hidden rounded-[28px] bg-[#18343c] px-5 py-9 text-white md:px-12 md:py-14">
      <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full border-[36px] border-[#f47735]/20" />
      <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#f47735]/10 blur-2xl" />
      <div className="relative max-w-2xl"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/85">بازار آنلاین مردم ایران</span>
        <h1 className="mt-5 text-3xl font-black leading-[1.5] md:text-5xl">هرچی می‌خوای،<br/><span className="text-[#ffad70]">سه‌سوته پیدا کن!</span></h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-white/75">از خریدوفروش خودرو و خانه تا موبایل و وسایل روزمره؛ آگهی‌ات را ثبت کن یا چیزی را که دنبالش هستی پیدا کن.</p>
        <div className="mt-7 grid gap-2 rounded-2xl bg-white p-2 md:grid-cols-[1fr_180px_auto]">
          <div className="flex items-center gap-2 px-2"><Search className="text-gray-400" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="چی می‌خوای پیدا کنی؟" className="w-full py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"/></div>
          <div className="flex items-center gap-2 border-t border-gray-100 px-2 md:border-r md:border-t-0"><MapPin className="text-gray-400" size={18}/><select value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-transparent py-3 text-sm text-gray-700 outline-none"><option>همه شهرها</option>{["تهران","کرج","اصفهان","شیراز","تبریز","رشت"].map(c=><option key={c}>{c}</option>)}</select></div>
          <button onClick={()=>document.getElementById("latest")?.scrollIntoView({behavior:"smooth"})} className="btn btn-primary px-7">جست‌وجو</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/75"><span>✓ ثبت آگهی آسان</span><span>✓ دسته‌بندی متنوع</span><span>✓ برای همه شهرهای ایران</span></div>
      </div></div></section>
    <section id="categories" className="container pt-10"><div className="mb-5 flex items-end justify-between"><div><h2 className="section-title">از کجا شروع کنیم؟</h2><p className="mt-1 text-xs text-muted">دسته موردنظرت را انتخاب کن</p></div><a href="#latest" className="flex items-center text-xs font-bold text-brand">همه آگهی‌ها <ChevronLeft size={16}/></a></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{categories.map((c,i)=><button key={c.name} onClick={()=>{setCategory(c.name);document.getElementById("latest")?.scrollIntoView({behavior:"smooth"})}} className="card p-4 text-right transition hover:-translate-y-1 hover:border-orange-200"><span className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-2xl ${["bg-orange-50 text-orange-600","bg-teal-50 text-teal-700","bg-amber-50 text-amber-700","bg-sky-50 text-sky-700"][i%4]}`}>{c.icon}</span><b className="block text-sm">{c.name}</b><small className="mt-1 block text-[10px] text-muted">{c.count}</small></button>)}</div></section>
    <section id="latest" className="container py-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="section-title">تازه‌رسیده‌ها</h2><p className="mt-1 text-xs text-muted">آگهی‌های نمونه از شهرهای مختلف ایران</p></div><div className="flex gap-2 overflow-x-auto">{["همه","املاک","خودرو","موبایل و تبلت","خانه و آشپزخانه"].map(c=><button key={c} onClick={()=>setCategory(c)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${category===c?"bg-brand text-white":"bg-white text-gray-600 ring-1 ring-gray-200"}`}>{c}</button>)}</div></div>
      {filtered.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map(x=><ListingCard key={x.id} item={x}/>)}</div> : <div className="card p-10 text-center text-sm text-muted">چیزی با این مشخصات پیدا نکردیم؛ عبارت دیگری را امتحان کن.</div>}</section>
    <section className="container pb-12"><div className="grid gap-3 md:grid-cols-3">{[{icon:ShieldCheck,title:"با دقت معامله کن",desc:"اطلاعات آگهی را بررسی کن و پیش از پرداخت، از کالا و هویت طرف معامله مطمئن شو."},{icon:Zap,title:"سه‌سوته آگهی بذار",desc:"کالا یا خدماتت را معرفی کن تا خریداران راحت‌تر پیدایت کنند."},{icon:MessageCircle,title:"راحت ارتباط بگیر",desc:"برای پرسیدن جزئیات، با آگهی‌دهنده ارتباط بگیر."}].map(x=><div key={x.title} className="card flex gap-3 p-5"><x.icon className="shrink-0 text-brand" size={24}/><div><b className="text-sm">{x.title}</b><p className="mt-1 text-xs leading-6 text-muted">{x.desc}</p></div></div>)}</div></section>
  </main><footer id="about" className="border-t border-[#eee6dd] bg-white py-7"><div className="container flex flex-col justify-between gap-3 text-xs text-muted sm:flex-row"><span>© سه‌سوته — بازار آنلاین مردم ایران</span><span>هرچی می‌خوای، سه‌سوته!</span></div></footer></>;
}