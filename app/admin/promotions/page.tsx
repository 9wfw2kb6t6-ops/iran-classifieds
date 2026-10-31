"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type RequestItem = { id: number; listing_id: number; user_id: number; promotion_type: "featured" | "bump"; requested_at: string; title: string; city: string; contact_phone: string };
const panel: React.CSSProperties = { background: "#fff", border: "1px solid #eee4d9", borderRadius: 16, padding: 18 };
const btn = (color: string): React.CSSProperties => ({ background: color, color: "#fff", border: 0, borderRadius: 9, padding: "10px 14px", fontWeight: 800, cursor: "pointer" });

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "دریافت درخواست‌ها ناموفق بود.");
      setItems(data.requests || []);
    } catch (e) { setMessage(e instanceof Error ? e.message : "خطا"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function decide(id: number, decision: "approved" | "rejected") {
    setBusy(id); setMessage("");
    try {
      const res = await fetch("/api/admin/promotions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ثبت نتیجه انجام نشد.");
      setItems(current => current.filter(x => x.id !== id));
      setMessage(decision === "approved" ? "درخواست تأیید شد و خدمت فعال شد." : "درخواست رد شد.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "خطا"); }
    finally { setBusy(null); }
  }

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#FFF8EF", color: "#18343C", padding: "28px 16px" }}>
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Link href="/admin" style={{ color: "#16758A", fontWeight: 800, textDecoration: "none" }}>← بازگشت به پنل مدیریت</Link>
      <h1 style={{ fontSize: 27, margin: "18px 0 6px" }}>درخواست‌های ویژه‌سازی و نردبان</h1>
      <p style={{ color: "#647579" }}>پس از تأیید، آگهی ویژه یا به ابتدای فهرست منتقل می‌شود.</p>
      {message && <div role="status" style={{ ...panel, margin: "14px 0" }}>{message}</div>}
      <button onClick={() => void load()} disabled={loading} style={{ ...btn("#18343C"), marginBottom: 15 }}>بروزرسانی</button>
      {loading ? <p>در حال دریافت...</p> : items.length === 0 ? <div style={panel}>درخواست در انتظار بررسی وجود ندارد.</div> :
        <div style={{ display: "grid", gap: 12 }}>{items.map(item => <article key={item.id} style={panel}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{item.title}</h2>
          <p style={{ color: "#647579", fontSize: 13, lineHeight: 1.9 }}>کد آگهی: {item.listing_id} · {item.city} · {item.promotion_type === "featured" ? "درخواست آگهی ویژه" : "درخواست نردبان"}<br/>تماس: {item.contact_phone}<br/>زمان درخواست: {new Date(item.requested_at).toLocaleString("fa-IR")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
            <button disabled={busy === item.id} onClick={() => decide(item.id, "approved")} style={btn("#16835D")}>تأیید و اجرا</button>
            <button disabled={busy === item.id} onClick={() => decide(item.id, "rejected")} style={btn("#A33D36")}>رد درخواست</button>
          </div>
        </article>)}</div>}
    </div>
  </main>;
}
