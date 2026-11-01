import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createUserSession, setUserCookie, verifyPassword } from "@/lib/user-auth";

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
    if (!/^09\d{9}$/.test(phone) || !password) return NextResponse.json({ error: "شماره موبایل یا رمز عبور صحیح نیست." }, { status: 400 });
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return NextResponse.json({ error: "پایگاه داده در دسترس نیست." }, { status: 503 });
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT id, phone, display_name, password_hash FROM users WHERE phone = ${phone} LIMIT 1`;
    if (!rows.length || !rows[0].password_hash || !(await verifyPassword(password, String(rows[0].password_hash)))) {
      return NextResponse.json({ error: "شماره موبایل یا رمز عبور اشتباه است." }, { status: 401 });
    }
    const user = { id: Number(rows[0].id), phone: rows[0].phone, display_name: rows[0].display_name };
    const session = createUserSession(user.id);
    const mobileClient = request.headers.get("x-client-app") === "se-sote-mobile";
    const response = NextResponse.json({ success: true, user, ...(mobileClient ? { session_token: session.value } : {}) });
    setUserCookie(response, session.value, session.maxAge);
    return response;
  } catch (error) {
    console.error("ACCOUNT_LOGIN_ERROR", error);
    return NextResponse.json({ error: "ورود انجام نشد. دوباره تلاش کن." }, { status: 500 });
  }
}