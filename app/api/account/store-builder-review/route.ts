import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای ادامه وارد حساب شو." }, { status: 401 });
  try {
    const body = await request.json();
    const requestId = Number(body.request_id);
    const action = String(body.action || "");
    const feedback = String(body.feedback || "").trim();
    if (!Number.isSafeInteger(requestId) || requestId <= 0 || !["approve", "revision", "approve_delivery"].includes(action)) {
      return NextResponse.json({ error: "اطلاعات ارسالی معتبر نیست." }, { status: 400 });
    }
    if (action === "revision" && (feedback.length < 5 || feedback.length > 2000)) {
      return NextResponse.json({ error: "برای درخواست اصلاح، توضیحی بین ۵ تا ۲۰۰۰ نویسه بنویس." }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const rows = action === "approve"
      ? await sql`UPDATE store_builder_requests SET status='building', customer_approved_at=NOW(), customer_feedback=NULL, updated_at=NOW() WHERE id=${requestId} AND user_id=${userId} AND status='customer_review' RETURNING id,status,customer_approved_at,customer_feedback`
      : action === "approve_delivery"
      ? await sql`UPDATE store_builder_requests SET status='delivered', customer_feedback=NULL, updated_at=NOW() WHERE id=${requestId} AND user_id=${userId} AND status='delivery_review' RETURNING id,status,customer_approved_at,customer_feedback`
      : await sql`UPDATE store_builder_requests SET status=CASE WHEN status='delivery_review' THEN 'building' ELSE 'revision' END, customer_feedback=${feedback}, updated_at=NOW() WHERE id=${requestId} AND user_id=${userId} AND status IN ('customer_review','delivery_review') RETURNING id,status,customer_approved_at,customer_feedback`;
    if (!rows.length) return NextResponse.json({ error: "این درخواست در وضعیت بررسی مناسب نیست یا به حساب شما تعلق ندارد." }, { status: 409 });
    return NextResponse.json({ success: true, request: rows[0] });
  } catch (error) {
    console.error("CUSTOMER_STORE_REVIEW_ERROR", error);
    return NextResponse.json({ error: "ثبت پاسخ شما انجام نشد." }, { status: 500 });
  }
}
