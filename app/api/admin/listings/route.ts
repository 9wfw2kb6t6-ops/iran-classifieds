import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "ابتدا وارد پنل مدیریت شوید." }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const status = request.nextUrl.searchParams.get("status") || "pending";
    if (!["pending", "published", "archive"].includes(status)) {
      return NextResponse.json({ error: "وضعیت درخواستی معتبر نیست." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);
    const rows = await sql`
      SELECT id, title, description, price_toman, city, category, contact_phone,
             image_urls, created_at, status
      FROM listings
      WHERE (${status} = 'archive' AND status IN ('sold', 'expired'))
         OR (${status} <> 'archive' AND status = ${status})
      ORDER BY created_at DESC
      LIMIT 200
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
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: "شناسه آگهی معتبر نیست." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);

    if (body.status !== undefined) {
      const status = String(body.status);
      if (!["published", "rejected", "sold", "expired"].includes(status)) {
        return NextResponse.json({ error: "وضعیت درخواستی معتبر نیست." }, { status: 400 });
      }
      const rows = status === "sold" || status === "expired"
        ? await sql`UPDATE listings SET status = ${status} WHERE id = ${id} AND status = 'published' RETURNING id, status`
        : status === "published"
          ? await sql`UPDATE listings SET status = 'published' WHERE id = ${id} AND status IN ('pending', 'sold', 'expired') RETURNING id, status`
          : await sql`UPDATE listings SET status = 'rejected' WHERE id = ${id} AND status = 'pending' RETURNING id, status`;
      if (!rows.length) return NextResponse.json({ error: "آگهی پیدا نشد یا تغییر وضعیت برای وضعیت فعلی مجاز نیست." }, { status: 404 });
      return NextResponse.json({ success: true, listing: rows[0] });
    }

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const city = String(body.city || "").trim();
    const category = String(body.category || "").trim();
    const contactPhone = String(body.contact_phone || "").trim();
    const price = Number(body.price_toman);
    if (!title || title.length > 120 || !description || description.length > 5000 ||
        !city || city.length > 80 || !category || category.length > 80 ||
        !/^09\d{9}$/.test(contactPhone) || !Number.isSafeInteger(price) || price < 0) {
      return NextResponse.json({ error: "اطلاعات ویرایش‌شده معتبر نیست؛ همه فیلدها را بررسی کنید." }, { status: 400 });
    }
    const rows = await sql`
      UPDATE listings
      SET title = ${title}, description = ${description}, price_toman = ${price},
          city = ${city}, category = ${category}, contact_phone = ${contactPhone}
      WHERE id = ${id} AND status = 'published'
      RETURNING id, title, description, price_toman, city, category, contact_phone,
                image_urls, created_at, status
    `;
    if (!rows.length) return NextResponse.json({ error: "آگهی منتشرشده پیدا نشد." }, { status: 404 });
    return NextResponse.json({ success: true, listing: rows[0] });
  } catch (error) {
    console.error("ADMIN_LISTINGS_PATCH_ERROR", error);
    return NextResponse.json({ error: "ذخیره تغییرات آگهی انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminSessionValid()) return unauthorized();
  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: "شناسه آگهی معتبر نیست." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
    const sql = neon(url);
    const rows = await sql`
      DELETE FROM listings WHERE id = ${id} AND status = 'published'
      RETURNING id
    `;
    if (!rows.length) return NextResponse.json({ error: "آگهی منتشرشده پیدا نشد." }, { status: 404 });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("ADMIN_LISTINGS_DELETE_ERROR", error);
    return NextResponse.json({ error: "حذف آگهی انجام نشد." }, { status: 500 });
  }
}
