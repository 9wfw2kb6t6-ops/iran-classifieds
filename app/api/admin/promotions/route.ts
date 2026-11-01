import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminSessionValid } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function unauthorized(){return NextResponse.json({error:"ابتدا وارد پنل مدیریت شوید."},{status:401});}

export async function GET(){
 if(!isAdminSessionValid())return unauthorized();
 try{const sql=neon(process.env.DATABASE_URL!);const rows=await sql`
 SELECT pr.id,pr.listing_id,pr.user_id,pr.promotion_type,pr.status,pr.requested_at,pr.admin_note,l.title,l.city,l.contact_phone
 FROM promotion_requests pr JOIN listings l ON l.id=pr.listing_id WHERE pr.status='pending' ORDER BY pr.requested_at ASC LIMIT 200`;
 return NextResponse.json({requests:rows});}
 catch(error){console.error("ADMIN_PROMOTIONS_GET_ERROR",error);return NextResponse.json({error:"دریافت درخواست‌ها انجام نشد."},{status:500});}
}

export async function PATCH(request:NextRequest){
 if(!isAdminSessionValid())return unauthorized();
 try{
  const body=await request.json();const id=Number(body.id);const decision=String(body.decision||"");const note=String(body.admin_note||"").trim().slice(0,500);
  if(!Number.isSafeInteger(id)||id<=0||!["approved","rejected"].includes(decision))return NextResponse.json({error:"اطلاعات تصمیم معتبر نیست."},{status:400});
  const sql=neon(process.env.DATABASE_URL!);
  const rows=await sql`
   WITH changed AS (
    UPDATE promotion_requests SET status=${decision},reviewed_at=NOW(),admin_note=${note||null}
    WHERE id=${id} AND status='pending'
      AND (
        ${decision}='rejected'
        OR EXISTS (
          SELECT 1 FROM listings l
          WHERE l.id=promotion_requests.listing_id AND l.status='published'
        )
      )
    RETURNING id,user_id,listing_id,promotion_type
   ), effect AS (
    UPDATE listings l SET
      is_featured=CASE WHEN ${decision}='approved' AND c.promotion_type='featured' THEN TRUE ELSE l.is_featured END,
      featured_until=CASE WHEN ${decision}='approved' AND c.promotion_type='featured' THEN NOW() + INTERVAL '7 days' ELSE l.featured_until END,
      created_at=CASE WHEN ${decision}='approved' AND c.promotion_type='bump' THEN NOW() ELSE l.created_at END
    FROM changed c WHERE l.id=c.listing_id AND l.status='published'
    RETURNING l.id
   ), refunded AS (
    INSERT INTO wallet_transactions(user_id,amount_toman,transaction_type,description,reference_type,reference_id)
    SELECT user_id,CASE WHEN promotion_type='featured' THEN 70000 ELSE 30000 END,'refund','بازگشت وجه درخواست ارتقای ردشده','promotion_request',id
    FROM changed WHERE ${decision}='rejected' RETURNING id
   )
   SELECT c.id,c.promotion_type,(SELECT COUNT(*) FROM refunded) AS refunded_count FROM changed c
  `;
  if(!rows.length){
   const pending=await sql`SELECT p.id FROM promotion_requests p WHERE p.id=${id} AND p.status='pending'`;
   if(pending.length)return NextResponse.json({error:"این آگهی دیگر منتشرشده نیست؛ درخواست ارتقا تأیید نشد و وجه در کیف پول باقی ماند."},{status:409});
   return NextResponse.json({error:"درخواست پیدا نشد یا قبلاً بررسی شده است."},{status:404});
  }
  return NextResponse.json({success:true,request:rows[0],message:decision==="rejected"?"درخواست رد شد و هزینه به کیف پول برگشت.":"درخواست تأیید شد."});
 }catch(error){console.error("ADMIN_PROMOTIONS_PATCH_ERROR",error);return NextResponse.json({error:"ثبت نتیجه بررسی انجام نشد."},{status:500});}
}
