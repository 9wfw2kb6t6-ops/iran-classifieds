"use client";
import { useState } from "react";
import Header from "@/components/Header";

const cities = ["تهران","کرج","اصفهان","شیراز","تبریز","رشت","مشهد","اهواز","قم","یزد","کرمانشاه","ارومیه"];
const categories = ["املاک","خودرو","موبایل و دیجیتال","خانه و آشپزخانه","استخدام و کاریابی","خدمات","وسایل شخصی","ورزش و سرگرمی"];

export default function PostAd() {
  const [form, setForm] = useState({ title: "", category: "", price_toman: "", city: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ثبت آگهی انجام نشد.");
      setMessage(result.message || "آگهی با موفقیت ثبت شد.");
      setForm({ title: "", category: "", price_toman: "", city: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارتباط با سرور برقرار نشد.");
    } finally { setBusy(false); }
  }

  return <><Header/><main className="container max-w-3xl py-8">
    <div className="mb-6"><span className="text-sm font-bold text-brand">سه‌سوته؛ فروش از همین‌جا شروع می‌شه</span><h1 className="mt-2 text-2xl font-black">ثبت آگهی جدید</h1><p className="mt-2 text-sm text-muted">اطلاعات آگهی را وارد کن؛ آگهی پس از بررسی مدیر منتشر می‌شود.</p></div>
    <form onSubmit={submit} className="card space-y-5 p-5">
      <label className="block text-sm font-bold">عنوان آگهی<input required minLength={5} maxLength={100} value={form.title} onChange={e=>update("title",e.target.value)} className="field mt-2" placeholder="مثلاً فروش گوشی سامسونگ"/></label>
      <label className="block text-sm font-bold">دسته‌بندی<select required value={form.category} onChange={e=>update("category",e.target.value)} className="field mt-2"><option value="">انتخاب دسته‌بندی</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="block text-sm font-bold">قیمت (تومان)<input inputMode="numeric" value={form.price_toman} onChange={e=>update("price_toman",e.target.value)} className="field mt-2" placeholder="برای کالای رایگان یا توافقی خالی بگذار"/></label>
      <label className="block text-sm font-bold">شهر<select required value={form.city} onChange={e=>update("city",e.target.value)} className="field mt-2"><option value="">انتخاب شهر</option>{cities.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="block text-sm font-bold">توضیحات<textarea required minLength={10} maxLength={4000} value={form.description} onChange={e=>update("description",e.target.value)} className="field mt-2 min-h-32" placeholder="هر چیزی که خریدار باید درباره آگهی بداند..."/></label>
      <div className="rounded-xl bg-orange-50 p-3 text-xs leading-6 text-orange-900">در این مرحله ثبت اطلاعات متنی فعال است. بارگذاری عکس و ورود کاربر در مرحله بعد اضافه می‌شود.</div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      <button disabled={busy} type="submit" className="btn btn-primary w-full disabled:opacity-60">{busy ? "در حال ثبت..." : "ثبت آگهی برای بررسی"}</button>
      <p className="text-center text-xs text-muted">سه‌سوته؛ خریدوفروش ساده‌تر برای همه</p>
    </form>
  </main></>;
}
