"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import { Store, ShoppingBag, Palette, Globe2, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";

const plans = [
  { id: "basic", name: "فروشگاه عادی", price: "۴ میلیون تومان", note: "شروع حرفه‌ای فروش آنلاین", features: ["صفحه اختصاصی فروشگاه داخل سه‌سوته", "دسته‌بندی و معرفی محصولات", "اطلاعات تماس و ثبت سفارش", "طراحی واکنش‌گرا برای موبایل"] },
  { id: "pro", name: "فروشگاه حرفه‌ای", price: "۸ میلیون تومان", note: "برای کسب‌وکارهای در حال رشد", features: ["تمام امکانات نسخه عادی", "طراحی اختصاصی‌تر و چیدمان ویژه", "پنل مدیریت محصولات و سفارش‌ها", "گزارش سفارش‌ها و وضعیت آن‌ها"] },
  { id: "custom", name: "فروشگاه اختصاصی", price: "از ۱۵ میلیون تومان", note: "متناسب با نیاز و برند شما", features: ["طراحی متناسب با هویت برند", "امکان راه‌اندازی روی دامنه مستقل", "امکانات سفارشی طبق توافق", "برآورد هزینه پیش از شروع پروژه"] }
];

export default function StoreBuilderPage() {
  const [selected, setSelected] = useState("basic");
  const [kind, setKind] = useState("inside");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const chosen = plans.find(p => p.id === selected)!;

  const submitRequest = async () => {
    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/store-builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_name: business, contact_phone: phone, store_model: kind, plan_code: selected, description }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ثبت درخواست انجام نشد.");
      setMessage(`درخواست شماره ${data.request.id} با موفقیت ثبت شد. تیم سه‌سوته با شما تماس می‌گیرد.`);
      setBusiness(""); setPhone(""); setDescription("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "ثبت درخواست انجام نشد."); }
    finally { setSending(false); }
  };

  return <><Header /><main className="min-h-screen bg-[#fffaf4]">
    <section className="container pt-8 md:pt-12"><div className="relative overflow-hidden rounded-[30px] bg-[#18343c] px-6 py-10 text-white md:px-12 md:py-16">
      <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full border-[34px] border-[#f47735]/20" />
      <div className="relative max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs"><Sparkles size={15}/> فروشگاه‌ساز سه‌سوته</span>
        <h1 className="mt-5 text-3xl font-black leading-[1.6] md:text-5xl">فروشگاه خودت رو<br/><span className="text-[#ffad70]">سه‌سوته راه بنداز!</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-8 text-white/75 md:text-base">از یک فروشگاه ساده و شیک تا یک سایت فروشگاهی اختصاصی؛ ما طراحی و راه‌اندازی فروشگاهت رو متناسب با نیاز کسب‌وکارت انجام می‌دیم.</p>
        <a href="#plans" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#f47735] px-5 py-3 text-sm font-black text-white">دیدن تعرفه‌ها <ArrowLeft size={17}/></a>
      </div>
    </div></section>

    <section className="container py-12"><div className="mx-auto max-w-3xl text-center"><h2 className="text-2xl font-black text-[#18343c] md:text-3xl">دو راه برای داشتن فروشگاه خودت</h2><p className="mt-3 text-sm leading-7 text-[#68777b]">می‌تونی داخل بازار سه‌سوته فروشگاه داشته باشی یا یک سایت مستقل با برند خودت تحویل بگیری.</p></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <button onClick={()=>setKind("inside")} className={`rounded-3xl border p-6 text-right transition ${kind==="inside" ? "border-[#f47735] bg-white shadow-lg shadow-orange-100" : "border-[#eee3d7] bg-white/70"}`}><Store className="text-[#f47735]" size={30}/><h3 className="mt-4 text-lg font-black text-[#18343c]">فروشگاه داخل سه‌سوته</h3><p className="mt-2 text-sm leading-7 text-[#68777b]">آدرس فروشگاه در سه‌سوته، مدیریت محصولات و سفارش‌ها در یک محیط یکپارچه.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#d85f24]">{kind==="inside" ? "انتخاب شده" : "انتخاب این مدل"} <CheckCircle2 size={15}/></span></button>
        <button onClick={()=>setKind("independent")} className={`rounded-3xl border p-6 text-right transition ${kind==="independent" ? "border-[#f47735] bg-white shadow-lg shadow-orange-100" : "border-[#eee3d7] bg-white/70"}`}><Globe2 className="text-[#18343c]" size={30}/><h3 className="mt-4 text-lg font-black text-[#18343c]">سایت مستقل</h3><p className="mt-2 text-sm leading-7 text-[#68777b]">سایت با نام و هویت برند شما؛ امکان اتصال دامنه اختصاصی و توسعه امکانات.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#d85f24]">{kind==="independent" ? "انتخاب شده" : "انتخاب این مدل"} <CheckCircle2 size={15}/></span></button>
      </div>
    </section>

    <section id="plans" className="container pb-14"><div className="mb-7 text-center"><h2 className="text-2xl font-black text-[#18343c]">تعرفه ساخت فروشگاه</h2><p className="mt-2 text-sm text-[#68777b]">هزینه ساخت یک‌باره است؛ قیمت نهایی با توجه به امکانات و جزئیات پروژه تأیید می‌شود.</p></div>
      <div className="grid gap-4 md:grid-cols-3">{plans.map((p,i)=><article key={p.id} className={`rounded-3xl border bg-white p-6 ${selected===p.id ? "border-[#f47735] shadow-xl shadow-orange-100" : "border-[#eee3d7]"`}><div className="flex items-center justify-between"><span className="rounded-full bg-[#fff1e7] p-3 text-[#e66d2d]">{i===0?<ShoppingBag size={22}/>:i===1?<Palette size={22}/>:<Globe2 size={22}/>}</span>{selected===p.id && <span className="text-xs font-bold text-[#d85f24]">انتخاب شده</span>}</div><h3 className="mt-5 text-lg font-black text-[#18343c]">{p.name}</h3><p className="mt-1 text-xs text-[#829094]">{p.note}</p><p className="mt-5 text-2xl font-black text-[#18343c]">{p.price}</p><ul className="mt-5 space-y-3">{p.features.map(f=><li key={f} className="flex items-start gap-2 text-sm leading-6 text-[#526268]"><CheckCircle2 className="mt-1 shrink-0 text-[#16a36a]" size={16}/>{f}</li>)}</ul><button onClick={()=>setSelected(p.id)} className={`mt-7 w-full rounded-xl px-4 py-3 text-sm font-black ${selected===p.id ? "bg-[#18343c] text-white" : "bg-[#fff1e7] text-[#d85f24]"}`}>انتخاب این طرح</button></article>)}</div>
    </section>

    <section className="container pb-16"><div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eee3d7] md:p-9"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#fff1e7] p-3 text-[#e66d2d]"><Store size={24}/></div><div><h2 className="text-xl font-black text-[#18343c]">درخواست ساخت فروشگاه</h2><p className="mt-1 text-xs text-[#829094]">اطلاعات اولیه را وارد کن تا درخواستت آماده شود.</p></div></div>
      <div className="mt-6 grid gap-4"><label className="text-sm font-bold text-[#526268]">نام کسب‌وکار<input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="مثلاً پوشاک بهار" className="mt-2 w-full rounded-xl border border-[#e8e0d7] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#f47735]"/></label><label className="text-sm font-bold text-[#526268]">شماره موبایل تماس<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="numeric" placeholder="09123456789" className="mt-2 w-full rounded-xl border border-[#e8e0d7] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#f47735]"/></label><label className="text-sm font-bold text-[#526268]">توضیح کوتاه درباره فروشگاه<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="چه محصولاتی می‌فروشی و چه امکاناتی نیاز داری؟" rows={4} className="mt-2 w-full rounded-xl border border-[#e8e0d7] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#f47735]"/></label><div className="rounded-2xl bg-[#fff8ef] p-4 text-sm leading-7 text-[#526268]">انتخاب فعلی: <b>{chosen.name}</b> · {kind==="inside" ? "فروشگاه داخل سه‌سوته" : "سایت مستقل"} · <b>{chosen.price}</b><p className="mt-1 text-xs text-[#829094]">ثبت درخواست رایگان است؛ پس از بررسی، قیمت نهایی و مراحل پرداخت به شما اعلام می‌شود. فعلاً پرداخت آنلاین فعال نیست.</p></div><button onClick={submitRequest} disabled={!business.trim() || !phone.trim() || sending} className="rounded-xl bg-[#f47735] px-5 py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{sending ? "در حال ثبت..." : "ثبت درخواست فروشگاه"} <ArrowLeft className="mr-2 inline" size={16}/></button></div>
    </div></section>
  </main><footer className="border-t border-[#eee6dd] bg-white py-7 text-center text-xs text-[#829094]">© سه‌سوته — فروشگاه‌ساز سه‌سوته</footer></>;
}
