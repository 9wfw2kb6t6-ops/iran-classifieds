import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, createAdminSession, verifyAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = String(body.password || "");
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "رمز ورود نادرست است." }, { status: 401 });
    }
    const session = createAdminSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set(adminCookieName, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: session.maxAge,
    });
    return response;
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR", error);
    return NextResponse.json({ error: "ورود مدیر فعلاً ممکن نیست. تنظیمات سرور را بررسی کنید." }, { status: 503 });
  }
}
