"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Listing = { id: number; title: string; status: string; is_featured?: boolean };
type PromotionRequest = { id: number; listing_id: number; promotion_type: "featured" | "bump"; status: string; requested_at: string; title: string; admin_note?: string | null };

const card: React.CSSProperties = { background: "#fff", border: "1px solid #eee4d9", borderRadius: 16, padding: 18 };
const btn = (color: string): React.CSSProperties => ({ background: color, color: "#fff", border: 0, borderRadius: 10, padding: "11px 15px", fontWeight: 800, cursor: "pointer" });

export default function AccountPromotionsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<PromotionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [meRes, reqRes] = await Promise.all([fetch("/api/account/me", { cache: "no-store" }), fetch("/api/account/promotions", { cache: "no-store" })]);
      const me = await meRes.json();
      const req = await reqRes.json();
      if (!meRes.ok || !me.user) throw new Error("برای استفاده از این بخش ابتدا وارد حساب کاربری شوید.");
      if (!reqRes.ok) throw new Error(req.error || "دریافت درخواست‌ها انجام نشد.");
      setListings((me.listings || []).filter((x: Listing) => x.status === "published"));
      setRequests(req.requests || []);
    } catch (e) { setMessage(e instanceof Error ? e.message : "خطا در دریافت اطلاعات"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function requestPromotion(listingId: number, type: "featured" | "bump") {
    setBusy(listingId); setMessage("");
    try {
      const res = await fetch("/api/account/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listing_id: listingId, promotion_type: type }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ثبت درخواست انجام نشد.");
      setMessage(data.message || "درخواست ثبت شد.");
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "خطا در ثبت درخواست"); }
    finally { setBusy(null); }
  }

  const status = (s: string) => s === "pending" ? "در انتظار بررسی" : s === "approved" ? "تأییدشده" : "ردشده";
  return <main dir="rtl" style={{ minHeight: "100vh", background: "#FFF8EF", color: "#18343C", padding: "28px 16px" }}>
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <Link href="/account" style={{ color: "#16758A", fontWeight: 800, textDecoration: "none" }}>← بازگشت به حساب کاربری</Link>
      <h1 style={{ fontSize: 28, margin: "18px 0 6px" }}>ویژه‌سازی و نردبان آگهی</h1>
      <p style={{ color: "#647579", lineHeight: 1.9 }}>برای آگهی منتشرشده خود درخواست ثبت کن. در این نسخه درخواست‌ها رایگان و آزمایشی هستند؛ هیچ پرداختی انجام نمی‌شود و خدمت فقط پس از تأیید مدیر فعال خواهد شد.</p>
      {message && <div role="status" style={{ ...card, margin: "16px 0" }}>{message}</div>}
      {loading ? <p>در حال دریافت اطلاعات...</p> : listings.length === 0 ? <div style={card}>آگهی منتشرشده‌ای در حساب شما وجود ندارد. ابتدا یک آگهی ثبت و منتشر کنید.</div> :
        <div style={{ display: "grid", gap: 13 }}>{listings.map(item => {
          const pendingFeatured = requests.some(r => r.listing_id === item.id && r.promotion_type === "featured" && r.status === "pending");
          const pendingBump = requests.some(r => r.listing_id === item.id && r.promotion_type === "bump" && r.status === "pending");
          return <article key={item.id} style={card}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>{item.title}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {!item.is_featured && <button disabled={busy === item.id || pendingFeatured} onClick={() => requestPromotion(item.id, "featured")} style={btn("#F47735")}>{pendingFeatured ? "درخواست ویژه در انتظار بررسی" : "درخواست آگهی ویژه"}</button>}
              {item.is_featured && <span style={{ color: "#16835D", fontWeight: 800, padding: 10 }}>این آگهی ویژه است</span>}
              <button disabled={busy === item.id || pendingBump} onClick={() => requestPromotion(item.id, "bump")} style={btn("#18343C")}>{pendingBump ? "درخواست نردبان در انتظار بررسی" : "درخواست نردبان"}</button>
            </div>
          </article>;
        })}</div>}
      <section style={{ ...card, marginTop: 22 }}>
        <h2 style={{ marginTop: 0, fontSize: 19 }}>سوابق درخواست‌ها</h2>
        {requests.length === 0 ? <p style={{ color: "#647579" }}>هنوز درخواستی ثبت نکرده‌اید.</p> : <div style={{ display: "grid", gap: 10 }}>{requests.map(r => <div key={r.id} style={{ borderTop: "1px solid #eee4d9", paddingTop: 10 }}>
          <b>{r.title}</b><div style={{ color: "#647579", fontSize: 13, marginTop: 5 }}>{r.promotion_type === "featured" ? "آگهی ویژه" : "نردبان آگهی"} · {status(r.status)}{r.admin_note ? " · توضیح مدیر: " + r.admin_note : ""}</div>
        </div>)}</div>}
      </section>
    </div>
  </main>;
}
