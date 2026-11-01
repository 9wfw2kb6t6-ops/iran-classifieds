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
    // Recover only unowned legacy listings with an exact account-phone match.
    await sql`
      UPDATE listings
      SET user_id = ${userId}
      WHERE user_id IS NULL
        AND contact_phone = ${rows[0].phone}
    `;
    // Use the account phone as a safe fallback for older rows while keeping ownership scoped to this account.
    const listings = await sql`
      SELECT id, title, description, price_toman, city, category, contact_phone, status, created_at, image_urls
      FROM listings
      WHERE user_id = ${userId} OR contact_phone = ${rows[0].phone}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    const storeBuilderRequests = await sql`SELECT id,business_name,contact_phone,store_model,plan_code,description,status,quoted_price_toman,admin_note,requested_at,updated_at FROM store_builder_requests WHERE user_id = ${userId} ORDER BY requested_at DESC LIMIT 100`;
    return NextResponse.json({ user: rows[0], listings, store_builder_requests: storeBuilderRequests });
  } catch (error) {
    console.error("ACCOUNT_ME_ERROR", error);
    return NextResponse.json({ error: "دریافت اطلاعات حساب انجام نشد." }, { status: 500 });
  }
}