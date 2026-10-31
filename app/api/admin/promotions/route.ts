import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "ابتدا وارد پنل مدیریت شوید." }, { status: 401 });
}

export async function GET() {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT pr.id, pr.listing_id, pr.user_id, pr.promotion_type, pr.status,
             pr.requested_at, pr.admin_note, l.title, l.city, l.contact_phone
      FROM promotion_requests pr
      JOIN listings l ON l.id = pr.listing_id
      WHERE pr.status = 'pending'
      ORDER BY pr.requested_at ASC LIMIT 200
    `;
    return NextResponse.json({ requests: rows });
  } catch (error) {
    console.error("ADMIN_PROMOTIONS_GET_ERROR", error);
    return NextResponse.json({ error: "دریافت درخواست‌ها انجام نشد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const body = await request.json();
    const id = Number(body.id);
    const decision = String(body.decision || "");
    const note = String(body.admin_note || "").trim().slice(0, 500);
    if (!Number.isSafeInteger(id) || id <= 0 || !["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "اطلاعات تصمیم معتبر نیست." }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    const requests = await sql`
      SELECT id, listing_id, promotion_type FROM promotion_requests
      WHERE id = ${id} AND status = 'pending' LIMIT 1
    `;
    if (!requests.length) return NextResponse.json({ error: "درخواست پیدا نشد یا قبلاً بررسی شده است." }, { status: 404 });
    const item = requests[0];
    if (decision === "approved") {
      if (item.promotion_type === "featured") {
        await sql`UPDATE listings SET is_featured = TRUE WHERE id = ${item.listing_id} AND status = 'published'`;
      } else {
        await sql`UPDATE listings SET created_at = NOW() WHERE id = ${item.listing_id} AND status = 'published'`;
      }
    }
    const updated = await sql`
      UPDATE promotion_requests
      SET status = ${decision}, reviewed_at = NOW(), admin_note = ${note || null}
      WHERE id = ${id} AND status = 'pending'
      RETURNING id, status
    `;
    if (!updated.length) return NextResponse.json({ error: "درخواست هم‌زمان تغییر کرده است؛ فهرست را تازه کنید." }, { status: 409 });
    return NextResponse.json({ success: true, request: updated[0] });
  } catch (error) {
    console.error("ADMIN_PROMOTIONS_PATCH_ERROR", error);
    return NextResponse.json({ error: "ثبت نتیجه بررسی انجام نشد." }, { status: 500 });
  }
}
