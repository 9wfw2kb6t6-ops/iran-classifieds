import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ user: null }, { status: 200 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, phone, display_name, created_at FROM users WHERE id = ${userId} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ user: null });
    const listings = await sql`SELECT id, title, price_toman, city, category, status, created_at, image_urls FROM listings WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ user: rows[0], listings });
  } catch (error) {
    console.error("ACCOUNT_ME_ERROR", error);
    return NextResponse.json({ error: "دریافت اطلاعات حساب انجام نشد." }, { status: 500 });
  }
}