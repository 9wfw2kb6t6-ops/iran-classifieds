"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Store, ShoppingBag, Palette, Globe2, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";

const planCatalog = {
  inside: [
    { id: "basic", name: "فروشگاه عادی", price: "۴ میلیون تومان", note: "شروع فروش در بازار سه‌سوته", features: ["صفحه اختصاصی فروشگاه داخل سه‌سوته", "دسته‌بندی و معرفی محصولات", "اطلاعات تماس و ثبت سفارش", "طراحی واکنش‌گرا برای موبایل"] },
    { id: "pro", name: "فروشگاه حرفه‌ای", price: "۸ میلیون تومان", note: "برای کسب‌وکارهای در حال رشد", features: ["تمام امکانات نسخه عادی", "طراحی اختصاصی‌تر و چیدمان ویژه", "پنل مدیریت محصولات و سفارش‌ها", "گزارش سفارش‌ها و وضعیت آن‌ها"] },
    { id: "custom", name: "فروشگاه اختصاصی", price: "از ۱۵ میلیون تومان", note: "متناسب با نیاز و برند شما", features: ["طراحی متناسب با هویت برند", "امکانات سفارشی طبق توافق", "صفحه‌ها و قابلیت‌های اختصاصی", "برآورد هزینه پیش از شروع پروژه"] }
  ],
  independent: [
    { id: "basic", name: "سایت فروشگاهی پایه", price: "۸ میلیون تومان", note: "شروع حضور مستقل با برند خودتان", features: ["طراحی سایت با هویت برند شما", "صفحه اصلی و معرفی فروشگاه", "صفحات محصول و اطلاعات تماس", "نمایش واکنش‌گرا در موبایل"] },
    { id: "pro", name: "سایت فروشگاهی حرفه‌ای", price: "۱۵ میلیون تومان", note: "برای فروشگاه‌های در حال توسعه", features: ["تمام امکانات نسخه پایه", "طراحی اختصاصی‌تر صفحات", "مدیریت محصولات و سفارش‌ها", "اتصال دامنه اختصاصی و تنظیمات اولیه"] },
    { id: "custom", name: "سایت فروشگاهی اختصاصی", price: "از ۲۵ میلیون تومان", note: "راهکار اختصاصی متناسب با کسب‌وکار", features: ["طراحی اختصاصی بر اساس برند", "امکانات و بخش‌های سفارشی", "قابلیت توسعه متناسب با نیاز", "برآورد فنی و مالی پیش از شروع"] }
  ]
};

type StoreRequest = { id:number; business_name:string; store_model:string; plan_code:string; status:string; quoted_price_toman:number|null; prepayment_amount_toman:number|null; admin_note:string|null; deliverable_url:string|null; requested_at:string };
type StoreMessage = { id:number; sender_role:"user"|"admin"; body:string; created_at:string };
const requestStatus:Record<string,string>={pending:"در انتظار بررسی",contacted:"تماس گرفته شد",quoted:"اعلام قیمت",awaiting_deposit:"در انتظار پیش‌پرداخت",deposit_confirmed:"پیش‌پرداخت تأیید شد",paid:"تسویه شد",building:"در حال ساخت",customer_review:"در انتظار تأیید طرح",revision:"در حال اصلاح",delivery_review:"در انتظار تأیید تحویل",delivered:"تحویل‌شده",rejected:"ردشده"};
const money=(value:number|null)=>value?Number(value).toLocaleString("fa-IR")+" تومان":"اعلام نشده";

export default function StoreBuilderPage() {
  const [selected, setSelected] = useState<"basic" | "pro" | "custom">("basic");
  const [kind, setKind] = useState<"inside" | "independent">("inside");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState<StoreRequest[]>([]);
  const [requestError, setRequestError] = useState("");
  const [activeRequest, setActiveRequest] = useState<number | null>(null);
  const [messages, setMessages] = useState<StoreMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageBusy, setMessageBusy] = useState(false);
  const [feedback, setFeedback] = useState<Record<number,string>>({});
  const plans = planCatalog[kind];
  const chosen = plans.find(p => p.id === selected)!;

  async function loadRequests() {
    try {
      const response = await fetch("/api/account/me", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "دریافت درخواست‌ها انجام نشد.");
      setRequests(Array.isArray(data.store_builder_requests) ? data.store_builder_requests : []);
      setRequestError(data.user ? "" : "برای پیگیری درخواست‌ها ابتدا وارد حساب کاربری شو.");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "دریافت درخواست‌ها انجام نشد.");
    }
  }
  useEffect(() => { void loadRequests(); }, []);

  async function openMessages(requestId:number) {
    setActiveRequest(requestId);
    setMessages([]);
    try {
      const response = await fetch("/api/account/store-builder-messages?request_id=" + requestId, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "دریافت پیام‌ها انجام نشد.");
      setMessages(data.messages || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "دریافت پیام‌ها انجام نشد.");
    }
  }

  async function sendMessage() {
    if (!activeRequest || !messageDraft.trim()) return;
    setMessageBusy(true);
    try {
      const response = await fetch("/api/account/store-builder-messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({request_id:activeRequest,body:messageDraft.trim()}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ارسال پیام انجام نشد.");
      setMessages(current => [...current, data.message]);
      setMessageDraft("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال پیام انجام نشد.");
    } finally { setMessageBusy(false); }
  }

  async function reviewRequest(requestId:number, action:"approve"|"revision"|"approve_delivery") {
    const note = feedback[requestId] || "";
    if (action === "revision" && note.trim().length < 5) { setMessage("برای درخواست اصلاح، حداقل ۵ نویسه توضیح بنویس."); return; }
    try {
      const response = await fetch("/api/account/store-builder-review", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({request_id:requestId,action,feedback:note}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ثبت پاسخ انجام نشد.");
      setMessage(action === "revision" ? "درخواست اصلاح ثبت شد." : "تأیید شما ثبت شد.");
      setFeedback(current => ({...current,[requestId]:""}));
      await loadRequests();
    } catch (error) { setMessage(error instanceof Error ? error.message : "ثبت پاسخ انجام نشد."); }
  }

  async function submitRequest() {
    if (!business.trim()) {
      setMessage("لطفاً نام کسب‌وکار را وارد کن.");
      return;
    }
    const normalizedPhone = phone
      .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[\s()-]/g, "");
    const iranPhone = normalizedPhone.replace(/^\+98/, "0").replace(/^0098/, "0").replace(/^98(?=9)/, "0");
    if (!/^09\d{9}$/.test(iranPhone)) {
      setMessage("شماره موبایل را به شکل 09123456789 وارد کن.");
      return;
    }
    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/store-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_name: business.trim(), contact_phone: iranPhone, store_model: kind, plan_code: selected, description: description.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setMessage("برای ثبت درخواست ابتدا وارد حساب کاربری شو.");
        return;
      }
      if (!response.ok) throw new Error(data.error || "ثبت درخواست انجام نشد. دوباره تلاش کن.");
      setMessage("درخواست با موفقیت ثبت شد. تیم سه‌سوته با شما تماس می‌گیرد.");
      setBusiness("");
      setPhone("");
      setDescription("");
      await loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارتباط برقرار نشد؛ دوباره تلاش کن.");
    } finally {
      setSending(false);
    }
  }

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
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p, i) => (
          <article key={p.id} className={`rounded-3xl border bg-white p-6 ${selected === p.id ? "border-[#f47735] shadow-xl shadow-orange-100" : "border-[#eee3d7]"}`}>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#fff1e7] p-3 text-[#e66d2d]">
                {i === 0 ? <ShoppingBag size={22}/> : i === 1 ? <Palette size={22}/> : <Globe2 size={22}/>}
              </span>
              {selected === p.id && <span className="text-xs font-bold text-[#d85f24]">انتخاب شده</span>}
            </div>
            <h3 className="mt-5 text-lg font-black text-[#18343c]">{p.name}</h3>
            <p className="mt-1 text-xs text-[#829094]">{p.note}</p>
            <p className="mt-5 text-2xl font-black text-[#18343c]">{p.price}</p>
            <ul className="mt-5 space-y-3">
              {p.features.map(f => <li key={f} className="flex items-start gap-2 text-sm leading-6 text-[#526268]"><CheckCircle2 className="mt-1 shrink-0 text-[#16a36a]" size={16}/>{f}</li>)}
            </ul>
            <button onClick={() => setSelected(p.id as "basic" | "pro" | "custom")} className={`mt-7 w-full rounded-xl px-4 py-3 text-sm font-black ${selected === p.id ? "bg-[#18343c] text-white" : "bg-[#fff1e7] text-[#d85f24]"}`}>انتخاب این طرح</button>
          </article>
        ))}
      </div>
    </section>

    <section className="container pb-16"><div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#eee3d7] md:p-9"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#fff1e7] p-3 text-[#e66d2d]"><Store size={24}/></div><div><h2 className="text-xl font-black text-[#18343c]">درخواست ساخت فروشگاه</h2><p className="mt-1 text-xs text-[#829094]">اطلاعات اولیه را وارد کن تا درخواستت آماده شود.</p></div></div>
      <div className="mt-6 grid gap-4"><label className="text-sm font-bold text-[#526268]">نام کسب‌وکار<input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="مثلاً پوشاک بهار" className="mt-2 w-full rounded-xl border border-[#e8e0d7] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#f47735]"/></label><label className="text-sm font-bold text-[#526268]">شماره موبایل تماس<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="numeric" placeholder="09123456789" className="mt-2 w-full rounded-xl border border-[#e8e0d7] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#f47735]"/></label><label className="text-sm font-bold text-[#526268]">توضیح کوتاه درباره فروشگاه<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="چه محصولاتی می‌فروشی و چه امکاناتی نیاز داری؟" rows={4} className="mt-2 w-full rounded-xl border border-[#e8e0d7] bg-[#fffdf9] px-4 py-3 text-sm outline-none focus:border-[#f47735]"/></label><div className="rounded-2xl bg-[#fff8ef] p-4 text-sm leading-7 text-[#526268]">انتخاب فعلی: <b>{chosen.name}</b> · {kind==="inside" ? "فروشگاه داخل سه‌سوته" : "سایت مستقل"} · <b>{chosen.price}</b><p className="mt-1 text-xs text-[#829094]">ثبت درخواست رایگان است؛ پس از بررسی، قیمت نهایی و مراحل پرداخت به شما اعلام می‌شود. فعلاً پرداخت آنلاین فعال نیست.</p></div><button onClick={submitRequest} disabled={sending} className="rounded-xl bg-[#f47735] px-5 py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{sending ? "در حال ثبت..." : "ثبت درخواست فروشگاه"} <ArrowLeft className="mr-2 inline" size={16}/></button>{message && <p role="status" aria-live="polite" className="rounded-xl bg-[#fff8ef] px-4 py-3 text-sm leading-7 text-[#18343c]">{message}{message.includes("وارد حساب") && <> <Link className="font-black text-[#d85f24] underline" href="/account">ورود به حساب کاربری</Link></>}</p>}</div>
    </div></section>
    <section className="container pb-16"><div className="mx-auto max-w-4xl"><div className="mb-6"><h2 className="text-2xl font-black text-[#18343c]">پیگیری درخواست‌های من</h2><p className="mt-2 text-sm text-[#68777b]">وضعیت، قیمت پیشنهادی، پیام‌ها و لینک تحویل را از همین‌جا دنبال کن.</p></div>
      {requestError && <p className="mb-4 rounded-xl bg-white p-4 text-sm leading-7 text-[#68777b]">{requestError}{requestError.includes("وارد حساب") && <> <Link className="font-black text-[#d85f24] underline" href="/account">ورود به حساب</Link></>}</p>}
      {requests.length ? <div className="space-y-4">{requests.map(r=><article key={r.id} className="rounded-3xl border border-[#eee3d7] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-[#18343c]">{r.business_name}</h3><p className="mt-1 text-xs text-[#829094]">{r.store_model==="inside"?"فروشگاه داخل سه‌سوته":"سایت مستقل"} · {r.plan_code==="basic"?"پایه":r.plan_code==="pro"?"حرفه‌ای":"اختصاصی"}</p></div><span className="rounded-full bg-[#fff1e7] px-3 py-2 text-xs font-black text-[#d85f24]">{requestStatus[r.status]||r.status}</span></div>
        <div className="mt-4 grid gap-3 rounded-2xl bg-[#fff8ef] p-4 text-sm sm:grid-cols-2"><p>قیمت اعلام‌شده: <b>{money(r.quoted_price_toman)}</b></p><p>پیش‌پرداخت: <b>{money(r.prepayment_amount_toman)}</b></p></div>
        {r.admin_note && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm leading-7 text-[#526268]">یادداشت تیم سه‌سوته: {r.admin_note}</p>}
        {r.deliverable_url && <a href={r.deliverable_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-[#d85f24] underline">مشاهده لینک تحویل</a>}
        <button onClick={()=>void openMessages(r.id)} className="mt-4 rounded-xl border border-[#eee3d7] px-4 py-2.5 text-sm font-black text-[#18343c]">گفت‌وگو با تیم سه‌سوته</button>
        {activeRequest===r.id && <div className="mt-4 rounded-2xl bg-[#fff8ef] p-4"><div className="max-h-64 space-y-2 overflow-y-auto">{messages.map(m=><div key={m.id} className={m.sender_role==="user"?"ml-auto max-w-[85%] rounded-xl bg-[#e7f1f2] p-3 text-sm":"mr-auto max-w-[85%] rounded-xl bg-white p-3 text-sm"}>{m.body}</div>)}</div><div className="mt-3 flex gap-2"><button disabled={messageBusy||!messageDraft.trim()} onClick={()=>void sendMessage()} className="rounded-xl bg-[#f47735] px-4 py-2 text-sm font-black text-white disabled:opacity-50">{messageBusy?"...":"ارسال"}</button><input value={messageDraft} onChange={e=>setMessageDraft(e.target.value)} placeholder="پیامت را بنویس..." className="min-w-0 flex-1 rounded-xl border border-[#e8e0d7] bg-white px-3 py-2 text-sm"/></div></div>}
        {(r.status==="customer_review"||r.status==="delivery_review") && <div className="mt-4 rounded-2xl border border-[#eee3d7] p-4"><p className="text-sm font-black text-[#18343c]">{r.status==="customer_review"?"بررسی طرح اولیه":"بررسی نسخه تحویلی"}</p><textarea value={feedback[r.id]||""} onChange={e=>setFeedback(v=>({...v,[r.id]:e.target.value}))} placeholder="در صورت نیاز به اصلاح، توضیحت را بنویس..." rows={3} className="mt-3 w-full rounded-xl border border-[#e8e0d7] p-3 text-sm"/><div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>void reviewRequest(r.id,r.status==="customer_review"?"approve":"approve_delivery")} className="rounded-xl bg-[#16834a] px-4 py-2.5 text-sm font-black text-white">{r.status==="customer_review"?"تأیید طرح":"تأیید تحویل"}</button><button onClick={()=>void reviewRequest(r.id,"revision")} className="rounded-xl bg-[#fff1e7] px-4 py-2.5 text-sm font-black text-[#d85f24]">درخواست اصلاح</button></div></div>}
      </article>)}</div> : !requestError && <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#829094]">هنوز درخواست فروشگاهی ثبت نکرده‌ای.</div>}
    </div></section>
  </main><footer className="border-t border-[#eee6dd] bg-white py-7 text-center text-xs text-[#829094]">© سه‌سوته — فروشگاه‌ساز سه‌سوته</footer></>;
}
