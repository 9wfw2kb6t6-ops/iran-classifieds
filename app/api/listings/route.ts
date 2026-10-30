import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "edge";

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
      SELECT id, title, description, price_toman, city, category, image_urls, created_at
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
    const missing = error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED";
    return NextResponse.json(
      { error: missing ? "پایگاه داده هنوز متصل نشده است." : "دریافت آگهی‌ها ممکن نشد." },
      { status: missing ? 503 : 500 }
    );
  }
}
