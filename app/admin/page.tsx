"use client";

import { useCallback, useEffect, useState } from "react";

type Listing = {
  id: number; title: string; description: string; price_toman: number;
  city: string; category: string; contact_phone: string;
  image_urls: string[]; created_at: string;
};
type Tab = "pending" | "published";
type EditForm = { title: string; description: string; price_toman: string; city: string; category: string; contact_phone: string };

const money = (value: number) => value === 0 ? "توافقی / رایگان" : new Intl.NumberFormat("fa-IR").format(value) + " تومان";
const dateText = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const panelStyle: React.CSSProperties = { background: "#fff", border: "1px solid #eee4d9", borderRadius: 18, padding: 20, boxShadow: "0 8px 24px rgba(24,52,60,.05)" };
const inputStyle: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", margin: "7px 0 13px", padding: 12, border: "1px solid #d8dfe0", borderRadius: 10, fontSize: 15 };
const buttonStyle = (background: string): React.CSSProperties => ({ background, color: "white", border: 0, borderRadius: 10, padding: "11px 16px", fontWeight: 800, cursor: "pointer" });

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [listings, setListings] = useState<Listing[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const loadListings = useCallback(async (which: Tab = tab) => {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/admin/listings?status=" + which, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "دریافت آگهی‌ها ناموفق بود.");
      setListings(data.listings || []); setLoggedIn(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در دریافت اطلاعات");
      setLoggedIn(false);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { void loadListings(tab); }, [tab, loadListings]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ورود انجام نشد.");
      setPassword(""); await loadListings(tab);
    } catch (error) { setMessage(error instanceof Error ? error.message : "ورود انجام نشد."); }
    finally { setLoading(false); }
  }

  async function changeStatus(id: number, status: "published" | "rejected") {
    setBusy(id); setMessage("");
    try {
      const response = await fetch("/api/admin/listings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تغییر وضعیت انجام نشد.");
      setListings(current => current.filter(item => item.id !== id));
      setMessage(status === "published" ? "آگهی با موفقیت منتشر شد." : "آگهی رد شد.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "خطا در انجام عملیات"); }
    finally { setBusy(null); }
  }

  function beginEdit(item: Listing) {
    setEditing(item.id);
    setEditForm({ title: item.title, description: item.description, price_toman: String(item.price_toman), city: item.city, category: item.category, contact_phone: item.contact_phone || "" });
  }

  async function saveEdit(id: number) {
    if (!editForm) return;
    setBusy(id); setMessage("");
    try {
      const normalized = editForm.price_toman.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,٬\s]/g, "");
      const phone = editForm.contact_phone.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[\s()-]/g, "");
      const response = await fetch("/api/admin/listings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...editForm, price_toman: normalized, contact_phone: phone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ذخیره تغییرات انجام نشد.");
      setListings(current => current.map(item => item.id === id ? data.listing : item));
      setEditing(null); setEditForm(null); setMessage("تغییرات آگهی ذخیره شد.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "خطا در ذخیره تغییرات"); }
    finally { setBusy(null); }
  }

  async function deleteListing(id: number) {
    if (!window.confirm("آیا از حذف دائمی این آگهی مطمئن هستید؟")) return;
    setBusy(id); setMessage("");
    try {
      const response = await fetch("/api/admin/listings?id=" + id, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "حذف آگهی انجام نشد.");
      setListings(current => current.filter(item => item.id !== id)); setMessage("آگهی حذف شد.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "خطا در حذف آگهی"); }
    finally { setBusy(null); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false); setListings([]); setMessage("از پنل خارج شدید.");
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#FFF8EF", padding: "28px 16px", color: "#18343C" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div><div style={{ color: "#F47735", fontWeight: 900, fontSize: 14 }}>سه‌سوته</div><h1 style={{ margin: "4px 0", fontSize: 27 }}>پنل مدیریت</h1><p style={{ margin: 0, color: "#647579" }}>مدیریت آگهی‌های سایت</p></div>
          {loggedIn && <button onClick={logout} style={buttonStyle("#18343C")}>خروج</button>}
        </header>
        {message && <div role="status" style={{ padding: 13, borderRadius: 12, background: "#fff", marginBottom: 16 }}>{message}</div>}
        {!loggedIn ? (
          <form onSubmit={login} style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>ورود مدیر</h2><label htmlFor="admin-password">رمز مدیریت</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            <button disabled={loading} type="submit" style={buttonStyle("#F47735")}>{loading ? "در حال بررسی..." : "ورود به پنل"}</button>
            <p style={{ color: "#718084", fontSize: 13, marginBottom: 0 }}>این بخش فقط با رمز محرمانه مدیر قابل دسترسی است.</p>
          </form>
        ) : (
          <section>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
              <button onClick={() => { setEditing(null); setEditForm(null); setTab("pending"); }} style={buttonStyle(tab === "pending" ? "#F47735" : "#18343C")}>در انتظار بررسی</button>
              <button onClick={() => { setEditing(null); setEditForm(null); setTab("published"); }} style={buttonStyle(tab === "published" ? "#F47735" : "#18343C")}>آگهی‌های منتشرشده</button>
              <button onClick={() => loadListings(tab)} disabled={loading} style={buttonStyle("#607579")}>بروزرسانی</button>
            </div>
            <h2 style={{ margin: "0 0 14px" }}>{tab === "pending" ? "آگهی‌های در انتظار بررسی" : "مدیریت آگهی‌های منتشرشده"} ({listings.length})</h2>
            {loading && <p>در حال دریافت آگهی‌ها...</p>}
            {!loading && listings.length === 0 && <div style={panelStyle}>{tab === "pending" ? "فعلاً آگهی در انتظار بررسی وجود ندارد." : "هنوز آگهی منتشرشده‌ای ثبت نشده است."}</div>}
            <div style={{ display: "grid", gap: 16 }}>
              {listings.map(item => (
                <article key={item.id} style={panelStyle}>
                  {editing === item.id && editForm ? (
                    <div>
                      <h3 style={{ marginTop: 0 }}>ویرایش آگهی شماره {item.id}</h3>
                      <label>عنوان آگهی</label><input style={inputStyle} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}/>
                      <label>توضیحات</label><textarea style={{ ...inputStyle, minHeight: 110 }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}/>
                      <label>قیمت به تومان (برای رایگان/توافقی صفر وارد کنید)</label><input inputMode="numeric" style={inputStyle} value={editForm.price_toman} onChange={e => setEditForm({ ...editForm, price_toman: e.target.value })}/>
                      <label>شهر</label><input style={inputStyle} value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })}/>
                      <label>دسته‌بندی</label><input style={inputStyle} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}/>
                      <label>شماره موبایل</label><input inputMode="tel" style={inputStyle} value={editForm.contact_phone} onChange={e => setEditForm({ ...editForm, contact_phone: e.target.value })}/>
                      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                        <button disabled={busy === item.id} onClick={() => saveEdit(item.id)} style={buttonStyle("#16835D")}>{busy === item.id ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
                        <button onClick={() => { setEditing(null); setEditForm(null); }} style={buttonStyle("#607579")}>انصراف</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 19 }}>{item.title}</h3><span style={{ color: "#F47735", fontWeight: 900 }}>{money(Number(item.price_toman))}</span>
                      </div>
                      <p style={{ color: "#607176", fontSize: 13, lineHeight: 1.9 }}>{item.city} · {item.category} · کد آگهی: {item.id}<br/>زمان ثبت: {dateText(item.created_at)}</p>
                      <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{item.description}</p>
                      <div style={{ background: "#F5F8F7", borderRadius: 12, padding: 12, marginBottom: 14 }}>
                        <strong style={{ fontSize: 13 }}>شماره تماس آگهی‌دهنده: </strong><a href={"tel:" + item.contact_phone} dir="ltr" style={{ color: "#087B61", fontWeight: 800 }}>{item.contact_phone}</a>
                      </div>
                      {item.image_urls?.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 9, marginBottom: 16 }}>
                        {item.image_urls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt={"عکس " + (index + 1) + " آگهی"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, border: "1px solid #eee" }}/></a>)}
                      </div>}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {tab === "pending" ? <>
                          <button disabled={busy === item.id} onClick={() => changeStatus(item.id, "published")} style={buttonStyle("#16835D")}>تأیید و انتشار</button>
                          <button disabled={busy === item.id} onClick={() => changeStatus(item.id, "rejected")} style={buttonStyle("#A33D36")}>رد آگهی</button>
                        </> : <>
                          <button onClick={() => beginEdit(item)} style={buttonStyle("#16758A")}>ویرایش آگهی</button>
                          <button disabled={busy === item.id} onClick={() => deleteListing(item.id)} style={buttonStyle("#A33D36")}>{busy === item.id ? "در حال حذف..." : "حذف آگهی"}</button>
                        </>}
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
