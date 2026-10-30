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
    <section className="container pt-7 md:pt-10"><div className="relative overflow-hidden rounded-[28px] bg-[#191b23] px-5 py-9 text-white md:px-12 md:py-14">
      <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/5" />
      <div className="relative max-w-2xl"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80">بازار آنلاین آگهی‌های ایران</span>
        <h1 className="mt-5 text-3xl font-black leading-[1.5] md:text-5xl">چیزی که دنبالش هستی،<br/><span className="text-[#ff7183]">شاید همین نزدیکی باشد.</span></h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-white/65">خرید و فروش آسان در سراسر ایران؛ آگهی‌ها را پیدا کن یا کالای خودت را برای هزاران نفر معرفی کن.</p>
        <div className="mt-7 grid gap-2 rounded-2xl bg-white p-2 md:grid-cols-[1fr_180px_auto]">
          <div className="flex items-center gap-2 px-2"><Search className="text-gray-400" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="چه چیزی جست‌وجو می‌کنید؟" className="w-full py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"/></div>
          <div className="flex items-center gap-2 border-t border-gray-100 px-2 md:border-r md:border-t-0"><MapPin className="text-gray-400" size={18}/><select value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-transparent py-3 text-sm text-gray-700 outline-none"><option>همه شهرها</option>{["تهران","کرج","اصفهان","شیراز","تبریز","رشت"].map(c=><option key={c}>{c}</option>)}</select></div>
          <button onClick={()=>document.getElementById("latest")?.scrollIntoView({behavior:"smooth"})} className="btn btn-primary px-7">جست‌وجو</button>
        </div></div></div></section>
    <section id="categories" className="container pt-10"><div className="mb-5 flex items-end justify-between"><div><h2 className="section-title">دسته‌بندی‌های محبوب</h2><p className="mt-1 text-xs text-muted">از میان دسته‌های مختلف انتخاب کن</p></div><a href="#latest" className="flex items-center text-xs font-bold text-brand">همه آگهی‌ها <ChevronLeft size={16}/></a></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">{categories.map((c,i)=><button key={c.name} onClick={()=>{setCategory(c.name);document.getElementById("latest")?.scrollIntoView({behavior:"smooth"})}} className="card p-4 text-right transition hover:-translate-y-1 hover:border-rose-200"><span className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-2xl ${["bg-rose-50 text-rose-600","bg-blue-50 text-blue-600","bg-violet-50 text-violet-600","bg-amber-50 text-amber-600"][i%4]}`}>{c.icon}</span><b className="block text-sm">{c.name}</b><small className="mt-1 block text-[10px] text-muted">{c.count}</small></button>)}</div></section>
    <section id="latest" className="container py-10"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="section-title">تازه‌ترین آگهی‌ها</h2><p className="mt-1 text-xs text-muted">آگهی‌های ثبت‌شده در سراسر ایران</p></div><div className="flex gap-2 overflow-x-auto">{["همه","املاک","خودرو","موبایل و تبلت","خانه و آشپزخانه"].map(c=><button key={c} onClick={()=>setCategory(c)} className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${category===c?"bg-brand text-white":"bg-white text-gray-600 ring-1 ring-gray-200"}`}>{c}</button>)}</div></div>
      {filtered.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map(x=><ListingCard key={x.id} item={x}/>)}</div> : <div className="card p-10 text-center text-sm text-muted">آگهی‌ای با این مشخصات پیدا نشد.</div>}</section>
    <section className="container pb-12"><div className="grid gap-3 md:grid-cols-3">{[{icon:ShieldCheck,title:"خرید آگاهانه",desc:"اطلاعات آگهی را بررسی کن و پیش از پرداخت، معامله را حضوری یا از مسیر امن انجام بده."},{icon:Zap,title:"ثبت آگهی سریع",desc:"در چند مرحله ساده کالایت را معرفی کن و در معرض دید خریداران قرار بده."},{icon:MessageCircle,title:"ارتباط مستقیم",desc:"برای پرسیدن جزئیات، با فروشنده ارتباط بگیر."}].map(x=><div key={x.title} className="card flex gap-3 p-5"><x.icon className="shrink-0 text-brand" size={24}/><div><b className="text-sm">{x.title}</b><p className="mt-1 text-xs leading-6 text-muted">{x.desc}</p></div></div>)}</div></section>
  </main><footer id="about" className="border-t border-gray-100 bg-white py-7"><div className="container flex flex-col justify-between gap-3 text-xs text-muted sm:flex-row"><span>© بازار — نمونه اولیه پلتفرم آگهی ایران</span><span>خریدوفروش آسان، شفاف و نزدیک شما</span></div></footer></>;
}