"use client";
import { useState } from "react";

export default function CustomerStoreReview({ requestId }: { requestId: number }) {
  const [feedback,setFeedback] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  async function send(action:"approve"|"revision") {
    setBusy(true); setError(""); setMessage("");
    try {
      const r=await fetch("/api/account/store-builder-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({request_id:requestId,action,feedback})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"ثبت پاسخ ناموفق بود.");
      setMessage(action==="approve"?"طرح تأیید شد و سفارش وارد مرحله ساخت شد.":"درخواست اصلاح برای مدیریت ارسال شد.");
      setFeedback("");
    } catch(e) { setError(e instanceof Error?e.message:"خطا در ثبت پاسخ"); }
    finally { setBusy(false); }
  }
  return <section className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
    <h3 className="font-black">بررسی طرح فروشگاه</h3>
    <p className="mt-1 text-sm text-muted">پس از بررسی طرح، آن را تأیید کن یا موارد موردنیاز برای اصلاح را بنویس.</p>
    <label className="mt-3 block text-sm font-bold">توضیحات اصلاح (در صورت نیاز)
      <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} maxLength={2000} rows={3} className="field mt-2" placeholder="مثلاً رنگ اصلی سایت تغییر کند و بخش محصولات اضافه شود."/>
    </label>
    {error&&<p className="mt-2 text-sm text-red-700">{error}</p>}
    {message&&<p className="mt-2 text-sm font-bold text-green-700">{message}</p>}
    <div className="mt-3 flex flex-wrap gap-2">
      <button disabled={busy} onClick={()=>void send("approve")} className="btn btn-primary">{busy?"در حال ثبت...":"طرح را تأیید می‌کنم"}</button>
      <button disabled={busy||feedback.trim().length<5} onClick={()=>void send("revision")} className="btn btn-secondary">درخواست اصلاح</button>
    </div>
  </section>;
}
