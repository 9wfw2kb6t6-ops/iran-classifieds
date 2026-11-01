import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PACKAGES = [
  { code: "starter", title: "شروع", amount: 100000 },
  { code: "economy", title: "اقتصادی", amount: 300000 },
  { code: "pro", title: "حرفه‌ای", amount: 700000 },
  { code: "business", title: "ویژه", amount: 1500000 },
];

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای مشاهده کیف پول وارد حساب شوید." }, { status: 401 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [balanceRows, transactions, requests] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount_toman), 0)::bigint AS balance FROM wallet_transactions WHERE user_id = ${userId}`,
      sql`SELECT id, amount_toman, transaction_type, description, created_at FROM wallet_transactions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`,
      sql`SELECT id, package_code, amount_toman, status, requested_at, reviewed_at, admin_note FROM wallet_topup_requests WHERE user_id = ${userId} ORDER BY requested_at DESC LIMIT 30`
    ]);
    return NextResponse.json({ balance: Number(balanceRows[0]?.balance || 0), packages: PACKAGES, transactions, requests });
  } catch (error) {
    console.error("WALLET_GET_ERROR", error);
    return NextResponse.json({ error: "دریافت کیف پول انجام نشد." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای درخواست شارژ وارد حساب شوید." }, { status: 401 });
  try {
    const body = await request.json();
    const selected = PACKAGES.find(item => item.code === String(body.package_code || ""));
    if (!selected) return NextResponse.json({ error: "بسته انتخاب‌شده معتبر نیست." }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      WITH user_lock AS MATERIALIZED (
        SELECT pg_advisory_xact_lock(${userId}::bigint)
      )
      INSERT INTO wallet_topup_requests (user_id, package_code, amount_toman)
      SELECT ${userId}, ${selected.code}, ${selected.amount}
      FROM user_lock
      WHERE NOT EXISTS (
        SELECT 1 FROM wallet_topup_requests
        WHERE user_id = ${userId} AND status = 'pending'
      )
      RETURNING id, package_code, amount_toman, status, requested_at
    `;
    if (!rows.length) {
      return NextResponse.json({ error: "یک درخواست شارژ در انتظار بررسی دارید." }, { status: 409 });
    }
    return NextResponse.json({ success: true, request: rows[0], message: "درخواست شارژ آزمایشی ثبت شد. تا زمان تأیید مدیر و راه‌اندازی درگاه، پرداختی انجام ندهید." }, { status: 201 });
  } catch (error) {
    console.error("WALLET_TOPUP_POST_ERROR", error);
    return NextResponse.json({ error: "ثبت درخواست شارژ انجام نشد." }, { status: 500 });
  }
}
