"use client";

import { useCallback, useEffect, useState } from "react";

type Listing = {
  id: number;
  title: string;
  description: string;
  price_toman: number;
  city: string;
  category: string;
  contact_phone: string;
  image_urls: string[];
  created_at: string;
};

const money = (value: number) => value === 0 ? "توافقی / رایگان" : new Intl.NumberFormat("fa-IR").format(value) + " تومان";
const dateText = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadListings = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/listings", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "دریافت آگهی‌ها ناموفق بود.");
      setListings(data.listings || []);
      setLoggedIn(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در دریافت اطلاعات");
      setLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadListings(); }, [loadListings]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ورود انجام نشد.");
      setPassword("");
      await loadListings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ورود انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: number, status: "published" | "rejected") {
    setBusy(id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تغییر وضعیت انجام نشد.");
      setListings(current => current.filter(item => item.id !== id));
      setMessage(status === "published" ? "آگهی با موفقیت منتشر شد." : "آگهی رد شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در انجام عملیات");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setListings([]);
    setMessage("از پنل خارج شدید.");
  }

  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#FFF8EF", padding: "28px 16px", color: "#18343C" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div><div style={{ color: "#F47735", fontWeight: 900, fontSize: 14 }}>سه‌سوته</div><h1 style={{ margin: "4px 0", fontSize: 27 }}>پنل مدیریت</h1><p style={{ margin: 0, color: "#647579" }}>بررسی دقیق، تأیید و رد آگهی‌ها</p></div>
          {loggedIn && <button onClick={logout} style={buttonStyle("#18343C")}>خروج</button>}
        </header>

        {message && <div role="status" style={{ padding: 13, borderRadius: 12, background: "#fff", marginBottom: 16 }}>{message}</div>}

        {!loggedIn ? (
          <form onSubmit={login} style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>ورود مدیر</h2>
            <label htmlFor="admin-password">رمز مدیریت</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
            <button disabled={loading} type="submit" style={buttonStyle("#F47735")}>{loading ? "در حال بررسی..." : "ورود به پنل"}</button>
            <p style={{ color: "#718084", fontSize: 13, marginBottom: 0 }}>این بخش فقط با رمز محرمانه مدیر قابل دسترسی است.</p>
          </form>
        ) : (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 }}>
              <h2 style={{ margin: 0 }}>آگهی‌های در انتظار ({listings.length})</h2>
              <button onClick={loadListings} disabled={loading} style={buttonStyle("#18343C")}>بروزرسانی</button>
            </div>
            {loading && <p>در حال دریافت آگهی‌ها...</p>}
            {!loading && listings.length === 0 && <div style={panelStyle}>فعلاً آگهی در انتظار بررسی وجود ندارد.</div>}
            <div style={{ display: "grid", gap: 16 }}>
              {listings.map(item => (
                <article key={item.id} style={panelStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 19 }}>{item.title}</h3><span style={{ color: "#F47735", fontWeight: 900 }}>{money(Number(item.price_toman))}</span>
                  </div>
                  <p style={{ color: "#607176", fontSize: 13, lineHeight: 1.9 }}>{item.city} · {item.category} · کد آگهی: {item.id}<br/>زمان ثبت: {dateText(item.created_at)}</p>
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{item.description}</p>
                  <div style={{ background: "#F5F8F7", borderRadius: 12, padding: 12, marginBottom: 14 }}>
                    <strong style={{ fontSize: 13 }}>شماره تماس آگهی‌دهنده: </strong>
                    <a href={"tel:" + item.contact_phone} dir="ltr" style={{ color: "#087B61", fontWeight: 800 }}>{item.contact_phone}</a>
                  </div>
                  {item.image_urls?.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 9, marginBottom: 16 }}>
                      {item.image_urls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer"><img src={url} alt={"عکس " + (index + 1) + " آگهی"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, border: "1px solid #eee" }}/></a>)}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button disabled={busy === item.id} onClick={() => changeStatus(item.id, "published")} style={buttonStyle("#16835D")}>{busy === item.id ? "در حال انجام..." : "تأیید و انتشار"}</button>
                    <button disabled={busy === item.id} onClick={() => changeStatus(item.id, "rejected")} style={buttonStyle("#A33D36")}>رد آگهی</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = { background: "#fff", border: "1px solid #eee4d9", borderRadius: 18, padding: 20, boxShadow: "0 8px 24px rgba(24,52,60,.05)" };
const inputStyle: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", margin: "9px 0 16px", padding: 13, border: "1px solid #d8dfe0", borderRadius: 10, fontSize: 16 };
const buttonStyle = (background: string): React.CSSProperties => ({ background, color: "white", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" });
