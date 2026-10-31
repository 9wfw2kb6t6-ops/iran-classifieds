import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!/^\\d+$/.test(id) || Number(id) < 1) {
      return NextResponse.json({ error: "شناسه آگهی معتبر نیست." }, { status: 400 });
    }
    const url = process.env.DATABASE_URL;
    if (!url) return NextResponse.json({ error: "پایگاه داده در دسترس نیست." }, { status: 503 });
    const sql = neon(url);
    const rows = await sql`
      SELECT id, title, description, price_toman, city, category, image_urls, created_at, is_featured
      FROM listings
      WHERE id = ${Number(id)} AND status = 'published'
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: "این آگهی پیدا نشد یا هنوز منتشر نشده است." }, { status: 404 });
    return NextResponse.json({ listing: rows[0] });
  } catch (error) {
    console.error("LISTING_DETAIL_ERROR", error);
    return NextResponse.json({ error: "دریافت جزئیات آگهی ممکن نشد." }, { status: 500 });
  }
}
