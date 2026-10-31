import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای مشاهده درخواست‌ها وارد حساب شوید." }, { status: 401 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT pr.id, pr.listing_id, pr.promotion_type, pr.status, pr.requested_at,
             pr.reviewed_at, pr.admin_note, l.title
      FROM promotion_requests pr
      JOIN listings l ON l.id = pr.listing_id
      WHERE pr.user_id = ${userId}
      ORDER BY pr.requested_at DESC LIMIT 100
    `;
    return NextResponse.json({ requests: rows });
  } catch (error) {
    console.error("ACCOUNT_PROMOTIONS_GET_ERROR", error);
    return NextResponse.json({ error: "دریافت درخواست‌ها انجام نشد." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای ثبت درخواست وارد حساب شوید." }, { status: 401 });
  try {
    const body = await request.json();
    const listingId = Number(body.listing_id);
    const type = String(body.promotion_type || "");
    if (!Number.isSafeInteger(listingId) || listingId <= 0 || !["featured", "bump"].includes(type)) {
      return NextResponse.json({ error: "اطلاعات درخواست معتبر نیست." }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const owned = await sql`
      SELECT id, status, is_featured FROM listings
      WHERE id = ${listingId} AND user_id = ${userId} LIMIT 1
    `;
    if (!owned.length || owned[0].status !== "published") {
      return NextResponse.json({ error: "فقط آگهی منتشرشده خودتان قابل ارتقا است." }, { status: 400 });
    }
    if (type === "featured" && owned[0].is_featured) {
      return NextResponse.json({ error: "این آگهی هم‌اکنون ویژه است." }, { status: 409 });
    }
    const duplicate = await sql`
      SELECT id FROM promotion_requests
      WHERE listing_id = ${listingId} AND promotion_type = ${type} AND status = 'pending'
      LIMIT 1
    `;
    if (duplicate.length) return NextResponse.json({ error: "برای این خدمت درخواست در انتظار بررسی دارید." }, { status: 409 });
    const rows = await sql`
      INSERT INTO promotion_requests (listing_id, user_id, promotion_type)
      VALUES (${listingId}, ${userId}, ${type})
      RETURNING id, listing_id, promotion_type, status, requested_at
    `;
    return NextResponse.json({ success: true, request: rows[0], message: "درخواست شما ثبت شد و پس از بررسی مدیر نتیجه اعلام می‌شود." }, { status: 201 });
  } catch (error) {
    console.error("ACCOUNT_PROMOTIONS_POST_ERROR", error);
    return NextResponse.json({ error: "ثبت درخواست انجام نشد." }, { status: 500 });
  }
}
