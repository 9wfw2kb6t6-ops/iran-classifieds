import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createUserSession, hashPassword, setUserCookie } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const digits = (value: string) => value.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
function normalizePhone(value: string) {
  const raw = digits(value).replace(/[\s()-]/g, "");
  return raw.startsWith("+98") ? "0" + raw.slice(3) : raw.startsWith("0098") ? "0" + raw.slice(4) : raw;
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ""));
    const password = String(body.password || "");
    const displayName = String(body.display_name || "").trim().slice(0, 80);
    if (!/^09\d{9}$/.test(phone)) return NextResponse.json({ error: "شماره موبایل ایران معتبر نیست." }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "رمز عبور باید حداقل ۸ و حداکثر ۱۲۸ کاراکتر باشد." }, { status: 400 });
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return NextResponse.json({ error: "پایگاه داده در دسترس نیست." }, { status: 503 });
    const sql = neon(databaseUrl);
    const existing = await sql`SELECT id FROM users WHERE phone = ${phone} LIMIT 1`;
    if (existing.length) return NextResponse.json({ error: "با این شماره قبلاً حساب ساخته شده؛ وارد حساب شو." }, { status: 409 });
    const passwordHash = await hashPassword(password);
    const rows = await sql`INSERT INTO users (phone, display_name, password_hash) VALUES (${phone}, ${displayName || null}, ${passwordHash}) RETURNING id, phone, display_name`;
    const user = rows[0] as { id: number; phone: string; display_name: string | null };
    const session = createUserSession(Number(user.id));
    const mobileClient = request.headers.get("x-client-app") === "se-sote-mobile";
    const response = NextResponse.json({ success: true, user, ...(mobileClient ? { session_token: session.value } : {}) });
    setUserCookie(response, session.value, session.maxAge);
    return response;
  } catch (error) {
    console.error("ACCOUNT_REGISTER_ERROR", error);
    return NextResponse.json({ error: "ثبت‌نام انجام نشد. تنظیمات پایگاه داده و سرور را بررسی کنید." }, { status: 500 });
  }
}