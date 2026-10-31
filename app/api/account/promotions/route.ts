import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICES = { featured: 70000, bump: 30000 } as const;

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای مشاهده درخواست‌ها وارد حساب شوید." }, { status: 401 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT pr.id, pr.listing_id, pr.promotion_type, pr.status, pr.requested_at,
             pr.reviewed_at, pr.admin_note, l.title
      FROM promotion_requests pr JOIN listings l ON l.id = pr.listing_id
      WHERE pr.user_id = ${userId} ORDER BY pr.requested_at DESC LIMIT 100
    `;
    const wallet = await sql`SELECT COALESCE(SUM(amount_toman),0)::int AS balance FROM wallet_transactions WHERE user_id=${userId}`;
    return NextResponse.json({ requests: rows, balance: Number(wallet[0]?.balance || 0), prices: PRICES });
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
    const type = String(body.promotion_type || "") as keyof typeof PRICES;
    if (!Number.isSafeInteger(listingId) || listingId <= 0 || !(type in PRICES)) {
      return NextResponse.json({ error: "اطلاعات درخواست معتبر نیست." }, { status: 400 });
    }
    const amount = PRICES[type];
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      WITH user_lock AS MATERIALIZED (
        SELECT pg_advisory_xact_lock(${userId}::bigint)
      ), balance AS (
        SELECT COALESCE(SUM(wt.amount_toman),0) AS amount
        FROM wallet_transactions wt CROSS JOIN user_lock WHERE wt.user_id=${userId}
      ), eligible AS (
        SELECT l.id FROM listings l CROSS JOIN balance
        WHERE l.id=${listingId} AND l.user_id=${userId} AND l.status='published'
          AND ( ${type} <> 'featured' OR l.is_featured = FALSE )
          AND balance.amount >= ${amount}
          AND NOT EXISTS (SELECT 1 FROM promotion_requests p WHERE p.listing_id=${listingId} AND p.promotion_type=${type} AND p.status='pending')
      ), debit AS (
        INSERT INTO wallet_transactions(user_id,amount_toman,transaction_type,description,reference_type,reference_id)
        SELECT ${userId},-${amount},'promotion',CASE WHEN ${type}='featured' THEN 'درخواست آگهی ویژه' ELSE 'درخواست نردبان' END,'listing',id
        FROM eligible RETURNING id
      ), created AS (
        INSERT INTO promotion_requests(listing_id,user_id,promotion_type)
        SELECT ${listingId},${userId},${type} FROM debit RETURNING id,listing_id,promotion_type,status,requested_at
      )
      SELECT created.*, (SELECT amount FROM balance) AS balance_before FROM created
    `;
    if (!rows.length) {
      const info = await sql`SELECT l.status,l.is_featured,COALESCE((SELECT SUM(amount_toman) FROM wallet_transactions WHERE user_id=${userId}),0)::int AS balance FROM listings l WHERE l.id=${listingId} AND l.user_id=${userId}`;
      if (!info.length || info[0].status !== "published") return NextResponse.json({ error: "فقط آگهی منتشرشده خودتان قابل ارتقا است." }, { status: 400 });
      if (type === "featured" && info[0].is_featured) return NextResponse.json({ error: "این آگهی هم‌اکنون ویژه است." }, { status: 409 });
      const duplicate = await sql`SELECT id FROM promotion_requests WHERE listing_id=${listingId} AND promotion_type=${type} AND status='pending' LIMIT 1`;
      if (duplicate.length) return NextResponse.json({ error: "برای این خدمت درخواست در انتظار بررسی دارید." }, { status: 409 });
      return NextResponse.json({ error: `موجودی کیف پول کافی نیست. هزینه این خدمت ${amount.toLocaleString("fa-IR")} تومان است و موجودی شما ${Number(info[0].balance).toLocaleString("fa-IR")} تومان.` }, { status: 402 });
    }
    return NextResponse.json({ success: true, request: rows[0], message: "هزینه از کیف پول کسر شد و درخواست برای بررسی مدیر ثبت شد." }, { status: 201 });
  } catch (error) {
    console.error("ACCOUNT_PROMOTIONS_POST_ERROR", error);
    return NextResponse.json({ error: "ثبت درخواست انجام نشد." }, { status: 500 });
  }
}
