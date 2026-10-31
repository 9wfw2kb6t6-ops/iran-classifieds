import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_NOT_CONFIGURED");
  return neon(url);
}

export async function GET(request: NextRequest) {
  try {
    const sql = db();
    const q = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
    const city = (request.nextUrl.searchParams.get("city") || "").trim().slice(0, 60);
    const category = (request.nextUrl.searchParams.get("category") || "").trim().slice(0, 60);
    const rows = await sql`
      SELECT id, title, description, price_toman, city, category, image_urls, created_at, is_featured
      FROM listings
      WHERE status = 'published'
        AND (${q} = '' OR title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'})
        AND (${city} = '' OR city = ${city})
        AND (${category} = '' OR category = ${category})
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 60
    `;
    return NextResponse.json({ listings: rows });
  } catch (error) {
    console.error("LISTINGS_API_ERROR", error);
    const missing = error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED";
    return NextResponse.json({ error: missing ? "پایگاه داده هنوز متصل نشده است." : "دریافت آگهی‌ها ممکن نشد." }, { status: missing ? 503 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body.title || "").trim().slice(0, 100);
    const description = String(body.description || "").trim().slice(0, 4000);
    const city = String(body.city || "").trim().slice(0, 80);
    const category = String(body.category || "").trim().slice(0, 80);
    const rawPrice = String(body.price_toman ?? "").replace(/[٬,\s]/g, "");
    const price = rawPrice === "" ? 0 : Number(rawPrice);

    if (title.length < 5 || description.length < 10 || city.length < 2 || category.length < 2) {
      return NextResponse.json({ error: "لطفاً عنوان، توضیحات، شهر و دسته‌بندی را کامل وارد کنید." }, { status: 400 });
    }
    if (!Number.isSafeInteger(price) || price < 0) {
      return NextResponse.json({ error: "قیمت واردشده معتبر نیست." }, { status: 400 });
    }

    const sql = db();
    const rows = await sql`
      INSERT INTO listings (title, description, price_toman, city, category, status, image_urls)
      VALUES (${title}, ${description}, ${price}, ${city}, ${category}, 'pending', ARRAY[]::text[])
      RETURNING id, title, status, created_at
    `;
    return NextResponse.json({ success: true, listing: rows[0], message: "آگهی شما ثبت شد و پس از بررسی منتشر می‌شود." }, { status: 201 });
  } catch (error) {
    console.error("CREATE_LISTING_ERROR", error);
    const missing = error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED";
    return NextResponse.json({ error: missing ? "پایگاه داده هنوز متصل نشده است." : "ثبت آگهی انجام نشد. دوباره تلاش کنید." }, { status: missing ? 503 : 500 });
  }
}
