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
    const rows = await sql`
      SELECT id, title, description, price_toman, city, category, created_at, status
      FROM listings
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 100
    `;
    return NextResponse.json({ listings: rows });
  } catch (error) {
    console.error("ADMIN_LISTINGS_GET_ERROR", error);
    return NextResponse.json({ error: "دریافت آگهی‌ها از پایگاه داده ممکن نشد." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = String(body.status || "");
    if (!Number.isSafeInteger(id) || id <= 0 || !["published", "rejected"].includes(status)) {
      return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);
    const rows = await sql`
      UPDATE listings
      SET status = ${status}
      WHERE id = ${id} AND status = 'pending'
      RETURNING id, status
    `;
    if (!rows.length) return NextResponse.json({ error: "آگهی پیدا نشد یا قبلاً بررسی شده است." }, { status: 404 });
    return NextResponse.json({ success: true, listing: rows[0] });
  } catch (error) {
    console.error("ADMIN_LISTINGS_UPDATE_ERROR", error);
    return NextResponse.json({ error: "تغییر وضعیت آگهی انجام نشد." }, { status: 500 });
  }
}
