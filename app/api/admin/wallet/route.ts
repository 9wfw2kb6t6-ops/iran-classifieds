import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminSessionValid } from "@/lib/admin-auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function unauthorized(){return NextResponse.json({error:"ابتدا وارد پنل مدیریت شوید."},{status:401});}
export async function GET(){
 if(!isAdminSessionValid())return unauthorized();
 try{const sql=neon(process.env.DATABASE_URL!);const rows=await sql`SELECT r.id,r.user_id,r.package_code,r.amount_toman,r.status,r.requested_at,u.phone,u.display_name FROM wallet_topup_requests r JOIN users u ON u.id=r.user_id WHERE r.status='pending' ORDER BY r.requested_at ASC LIMIT 200`;return NextResponse.json({requests:rows});}
 catch(e){console.error("ADMIN_WALLET_GET_ERROR",e);return NextResponse.json({error:"دریافت درخواست‌ها انجام نشد."},{status:500});}
}
export async function PATCH(request:NextRequest){
 if(!isAdminSessionValid())return unauthorized();
 try{const body=await request.json();const id=Number(body.id);const decision=String(body.decision||"");const note=String(body.admin_note||"").trim().slice(0,500);
 if(!Number.isSafeInteger(id)||id<=0||!["approved","rejected"].includes(decision))return NextResponse.json({error:"اطلاعات تصمیم معتبر نیست."},{status:400});
 const sql=neon(process.env.DATABASE_URL!);
 const rows=await sql`WITH changed AS (
  UPDATE wallet_topup_requests SET status=${decision},reviewed_at=NOW(),admin_note=${note||null}
  WHERE id=${id} AND status='pending'
  RETURNING id,user_id,amount_toman
 ), credited AS (
  INSERT INTO wallet_transactions(user_id,amount_toman,transaction_type,description,reference_type,reference_id)
  SELECT user_id,amount_toman,'topup','شارژ کیف پول','wallet_topup',id FROM changed WHERE ${decision}='approved'
  RETURNING id
 )
 SELECT changed.id,changed.amount_toman,(SELECT COUNT(*) FROM credited) AS credited_count FROM changed`;
 if(!rows.length)return NextResponse.json({error:"درخواست پیدا نشد یا قبلاً بررسی شده است."},{status:404});
 return NextResponse.json({success:true,request:rows[0]});
 }catch(e){console.error("ADMIN_WALLET_PATCH_ERROR",e);return NextResponse.json({error:"ثبت نتیجه بررسی انجام نشد."},{status:500});}
}