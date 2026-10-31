"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";

const cities = ["تهران","کرج","اصفهان","شیراز","تبریز","رشت","مشهد","اهواز","قم","یزد","کرمانشاه","ارومیه"];
const categories = ["املاک","خودرو","موبایل و دیجیتال","خانه و آشپزخانه","استخدام و کاریابی","خدمات","وسایل شخصی","ورزش و سرگرمی"];

export default function PostAd() {
  const [form, setForm] = useState({ title: "", category: "", price_toman: "", city: "", description: "", contact_phone: "" });
  const [images, setImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = (key: keyof typeof form, value: string) => setForm(old => ({ ...old, [key]: value }));
  const previews = useMemo(() => images.map(file => URL.createObjectURL(file)), [images]);
  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews]);

  function chooseImages(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.length + images.length > 4) { setError("حداکثر ۴ عکس می‌توانید انتخاب کنید."); return; }
    if (selected.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setError("فقط عکس JPG، PNG یا WEBP تا حجم ۵ مگابایت مجاز است."); return;
    }
    setError("");
    setImages(current => [...current, ...selected]);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      images.forEach(file => payload.append("images", file));
      const response = await fetch("/api/listings", { method: "POST", body: payload });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ثبت آگهی انجام نشد.");
      setMessage(result.message || "آگهی با موفقیت ثبت شد.");
      setForm({ title: "", category: "", price_toman: "", city: "", description: "", contact_phone: "" });
      setImages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارتباط با سرور برقرار نشد.");
    } finally { setBusy(false); }
  }

  return <><Header/><main className="container max-w-3xl py-8">
    <div className="mb-6"><span className="text-sm font-bold text-brand">سه‌سوته؛ فروش از همین‌جا شروع می‌شه</span><h1 className="mt-2 text-2xl font-black">ثبت آگهی جدید</h1><p className="mt-2 text-sm text-muted">اطلاعات و عکس‌های آگهی را وارد کن؛ آگهی پس از بررسی مدیر منتشر می‌شود.</p></div>
    <form onSubmit={submit} className="card space-y-5 p-5">
      <label className="block text-sm font-bold">عنوان آگهی<input required minLength={5} maxLength={100} value={form.title} onChange={e=>update("title",e.target.value)} className="field mt-2" placeholder="مثلاً فروش گوشی سامسونگ"/></label>
      <label className="block text-sm font-bold">دسته‌بندی<select required value={form.category} onChange={e=>update("category",e.target.value)} className="field mt-2"><option value="">انتخاب دسته‌بندی</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="block text-sm font-bold">قیمت (تومان)<input inputMode="numeric" value={form.price_toman} onChange={e=>update("price_toman",e.target.value)} className="field mt-2" placeholder="برای کالای رایگان یا توافقی خالی بگذار"/></label>
      <label className="block text-sm font-bold">شهر<select required value={form.city} onChange={e=>update("city",e.target.value)} className="field mt-2"><option value="">انتخاب شهر</option>{cities.map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="block text-sm font-bold">شماره تماس آگهی‌دهنده<input required type="tel" inputMode="tel" dir="ltr" maxLength={13} value={form.contact_phone} onChange={e=>update("contact_phone",e.target.value)} className="field mt-2 text-left" placeholder="09123456789"/><span className="mt-1 block text-xs font-normal text-muted">این شماره پس از تأیید آگهی برای بازدیدکنندگان نمایش داده می‌شود.</span></label>
      <label className="block text-sm font-bold">توضیحات<textarea required minLength={10} maxLength={4000} value={form.description} onChange={e=>update("description",e.target.value)} className="field mt-2 min-h-32" placeholder="هر چیزی که خریدار باید درباره آگهی بداند..."/></label>
      <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-4">
        <div className="font-bold text-sm">عکس‌های آگهی <span className="font-normal text-muted">(حداکثر ۴ عکس)</span></div>
        <p className="mt-1 text-xs text-muted">JPG، PNG یا WEBP؛ حداکثر ۵ مگابایت برای هر عکس</p>
        <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-4 text-sm font-bold text-brand ring-1 ring-orange-200">انتخاب عکس از گوشی<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={e=>{chooseImages(e.target.files);e.currentTarget.value="";}}/></label>
        {previews.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{previews.map((src,index)=><div key={src} className="relative overflow-hidden rounded-xl border bg-white"><img src={src} alt={"پیش‌نمایش عکس " + (index+1)} className="aspect-square w-full object-cover"/><button type="button" onClick={()=>setImages(current=>current.filter((_,i)=>i!==index))} className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">حذف</button></div>)}</div>}
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      <button disabled={busy} type="submit" className="btn btn-primary w-full disabled:opacity-60">{busy ? "در حال ثبت آگهی و بارگذاری عکس‌ها..." : "ثبت آگهی برای بررسی"}</button>
      <p className="text-center text-xs text-muted">سه‌سوته؛ خریدوفروش ساده‌تر برای همه</p>
    </form>
  </main></>;
}
