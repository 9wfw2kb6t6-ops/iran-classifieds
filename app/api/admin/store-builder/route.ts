import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const STATUSES = ["pending", "contacted", "quoted", "awaiting_deposit", "deposit_confirmed", "paid", "building", "customer_review", "revision", "delivered", "rejected"];

function unauthorized() {
  return NextResponse.json({ error: "ابتدا وارد پنل مدیریت شوید." }, { status: 401 });
}

export async function GET() {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const requests = await sql`SELECT r.id,r.business_name,r.contact_phone,r.store_model,r.plan_code,r.description,r.status,r.quoted_price_toman,r.prepayment_amount_toman,r.prepayment_confirmed_at,r.admin_note,r.requested_at,r.updated_at,r.user_id
      FROM store_builder_requests r
      ORDER BY CASE WHEN r.status='pending' THEN 0 ELSE 1 END, r.requested_at DESC LIMIT 300`;
    return NextResponse.json({ requests, statuses: STATUSES });
  } catch (error) {
    console.error("ADMIN_STORE_REQUESTS_GET_ERROR", error);
    return NextResponse.json({ error: "دریافت درخواست‌های فروشگاه انجام نشد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = String(body.status || "");
    const note = String(body.admin_note || "").trim().slice(0, 2000);
    const deposit = body.prepayment_amount_toman === null || body.prepayment_amount_toman === "" || body.prepayment_amount_toman === undefined
      ? null : Number(body.prepayment_amount_toman);
    const price = body.quoted_price_toman === null || body.quoted_price_toman === "" || body.quoted_price_toman === undefined
      ? null : Number(body.quoted_price_toman);
    if (!Number.isSafeInteger(id) || id <= 0 || !STATUSES.includes(status)) {
      return NextResponse.json({ error: "اطلاعات درخواست معتبر نیست." }, { status: 400 });
    }
    if (deposit !== null && (!Number.isSafeInteger(deposit) || deposit < 0 || deposit > 100000000000)) {
      return NextResponse.json({ error: "مبلغ پیش‌پرداخت معتبر نیست." }, { status: 400 });
    }
    if (price !== null && (!Number.isSafeInteger(price) || price < 0 || price > 100000000000)) {
      return NextResponse.json({ error: "قیمت واردشده معتبر نیست." }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`UPDATE store_builder_requests SET status=${status},admin_note=${note || null},quoted_price_toman=${price},prepayment_amount_toman=${deposit},prepayment_confirmed_at=CASE WHEN ${status}='deposit_confirmed' THEN COALESCE(prepayment_confirmed_at,NOW()) ELSE prepayment_confirmed_at END,updated_at=NOW()
      WHERE id=${id} RETURNING id,status,quoted_price_toman,prepayment_amount_toman,prepayment_confirmed_at,updated_at`;
    if (!rows.length) return NextResponse.json({ error: "درخواست پیدا نشد." }, { status: 404 });
    return NextResponse.json({ success: true, request: rows[0] });
  } catch (error) {
    console.error("ADMIN_STORE_REQUESTS_PATCH_ERROR", error);
    return NextResponse.json({ error: "ذخیره تغییرات انجام نشد." }, { status: 500 });
  }
}
