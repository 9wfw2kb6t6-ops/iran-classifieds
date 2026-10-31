import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reasons = ["fraud", "wrong_info", "prohibited", "duplicate", "other"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listingId = Number(body.listing_id);
    const reason = String(body.reason || "");
    const details = String(body.details || "").trim();
    const contact = String(body.reporter_contact || "").trim();
    if (!Number.isSafeInteger(listingId) || listingId < 1 || !reasons.includes(reason) ||
        details.length > 1500 || contact.length > 100) {
      return NextResponse.json({ error: "اطلاعات گزارش معتبر نیست." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);
    const listing = await sql`SELECT id FROM listings WHERE id = ${listingId} AND status = 'published' LIMIT 1`;
    if (!listing.length) return NextResponse.json({ error: "آگهی موردنظر پیدا نشد." }, { status: 404 });
    const recent = await sql`SELECT id FROM listing_reports WHERE listing_id = ${listingId} AND created_at > NOW() - INTERVAL '10 minutes' LIMIT 1`;
    if (recent.length) return NextResponse.json({ error: "برای این آگهی اخیراً گزارشی ثبت شده است. لطفاً کمی بعد دوباره تلاش کنید." }, { status: 429 });
    await sql`INSERT INTO listing_reports (listing_id, reason, details, reporter_contact) VALUES (${listingId}, ${reason}, ${details || null}, ${contact || null})`;
    return NextResponse.json({ success: true, message: "گزارش شما ثبت شد و برای بررسی به مدیریت ارسال می‌شود." }, { status: 201 });
  } catch (error) {
    console.error("REPORT_CREATE_ERROR", error);
    return NextResponse.json({ error: "ثبت گزارش انجام نشد. لطفاً بعداً تلاش کنید." }, { status: 500 });
  }
}