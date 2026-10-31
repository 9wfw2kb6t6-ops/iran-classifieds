import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای ثبت درخواست ابتدا وارد حساب کاربری شوید." }, { status: 401 });
  try {
    const body = await request.json();
    const businessName = String(body.business_name || "").trim().slice(0, 160);
    const rawPhone = String(body.contact_phone || "");
    const phone = rawPhone
      .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[\\s()-]/g, "")
      .replace(/^\\+98/, "0").replace(/^0098/, "0").replace(/^98(?=9)/, "0");
    const model = String(body.store_model || "");
    const plan = String(body.plan_code || "");
    const description = String(body.description || "").trim().slice(0, 3000);
    if (businessName.length < 2) return NextResponse.json({ error: "نام کسب‌وکار را وارد کنید." }, { status: 400 });
    if (!/^09\\d{9}$/.test(phone)) return NextResponse.json({ error: "شماره موبایل ایران را مثل 09123456789 وارد کنید." }, { status: 400 });
    if (!["inside", "independent"].includes(model) || !["basic", "pro", "custom"].includes(plan)) return NextResponse.json({ error: "نوع فروشگاه یا طرح انتخابی معتبر نیست." }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`INSERT INTO store_builder_requests (user_id,business_name,contact_phone,store_model,plan_code,description)
      VALUES (${userId},${businessName},${phone},${model},${plan},${description})
      RETURNING id,business_name,store_model,plan_code,status,requested_at`;
    return NextResponse.json({ success: true, request: rows[0], message: "درخواست فروشگاه شما ثبت شد. تیم سه‌سوته پس از بررسی با شما تماس می‌گیرد." }, { status: 201 });
  } catch (error) {
    console.error("STORE_BUILDER_REQUEST_ERROR", error);
    return NextResponse.json({ error: "ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید." }, { status: 500 });
  }
}
