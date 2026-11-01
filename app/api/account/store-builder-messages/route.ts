import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const userId=getUserIdFromRequest(request); if(!userId)return NextResponse.json({error:"برای مشاهده پیام‌ها وارد حساب شو."},{status:401});
 const requestId=Number(request.nextUrl.searchParams.get("request_id"));
 if(!Number.isSafeInteger(requestId)||requestId<=0)return NextResponse.json({error:"شناسه درخواست معتبر نیست."},{status:400});
 try{const sql=neon(process.env.DATABASE_URL!);
 const owned=await sql`SELECT id FROM store_builder_requests WHERE id=${requestId} AND user_id=${userId} LIMIT 1`;
 if(!owned.length)return NextResponse.json({error:"درخواست پیدا نشد."},{status:404});
 const messages=await sql`SELECT id,sender_role,body,created_at FROM store_builder_messages WHERE request_id=${requestId} ORDER BY created_at ASC LIMIT 200`;
 return NextResponse.json({messages});
 }catch(e){console.error("STORE_MESSAGES_GET",e);return NextResponse.json({error:"دریافت پیام‌ها انجام نشد."},{status:500});}
}
export async function POST(request:NextRequest){
 const userId=getUserIdFromRequest(request); if(!userId)return NextResponse.json({error:"برای ارسال پیام وارد حساب شو."},{status:401});
 try{const body=await request.json();const requestId=Number(body.request_id);const message=String(body.body||"").trim();
 if(!Number.isSafeInteger(requestId)||requestId<=0||message.length<1||message.length>4000)return NextResponse.json({error:"متن پیام یا شناسه درخواست معتبر نیست."},{status:400});
 const sql=neon(process.env.DATABASE_URL!);
 const owned=await sql`SELECT id FROM store_builder_requests WHERE id=${requestId} AND user_id=${userId} LIMIT 1`;
 if(!owned.length)return NextResponse.json({error:"درخواست پیدا نشد."},{status:404});
 const rows=await sql`INSERT INTO store_builder_messages(request_id,sender_role,sender_user_id,body) VALUES(${requestId},'user',${userId},${message}) RETURNING id,sender_role,body,created_at`;
 return NextResponse.json({message:rows[0]},{status:201});
 }catch(e){console.error("STORE_MESSAGES_POST",e);return NextResponse.json({error:"ارسال پیام انجام نشد."},{status:500});}
}