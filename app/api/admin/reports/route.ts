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
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);
    const reports = await sql`
      SELECT r.id, r.listing_id, r.reason, r.details, r.reporter_contact, r.status, r.created_at,
             l.title AS listing_title, l.city AS listing_city, l.status AS listing_status
      FROM listing_reports r
      LEFT JOIN listings l ON l.id = r.listing_id
      ORDER BY CASE WHEN r.status = 'open' THEN 0 WHEN r.status = 'reviewing' THEN 1 ELSE 2 END, r.created_at DESC
      LIMIT 300
    `;
    return NextResponse.json({ reports });
  } catch (error) {
    console.error("ADMIN_REPORTS_GET_ERROR", error);
    return NextResponse.json({ error: "دریافت گزارش‌ها ممکن نشد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = String(body.status || "");
    if (!Number.isSafeInteger(id) || id < 1 || !["reviewing", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "اطلاعات تغییر وضعیت معتبر نیست." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);
    const rows = await sql`UPDATE listing_reports SET status = ${status}, reviewed_at = NOW() WHERE id = ${id} RETURNING id, status, reviewed_at`;
    if (!rows.length) return NextResponse.json({ error: "گزارش پیدا نشد." }, { status: 404 });
    return NextResponse.json({ success: true, report: rows[0] });
  } catch (error) {
    console.error("ADMIN_REPORTS_PATCH_ERROR", error);
    return NextResponse.json({ error: "تغییر وضعیت گزارش انجام نشد." }, { status: 500 });
  }
}