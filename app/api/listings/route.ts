import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { getUserIdFromRequest } from "@/lib/user-auth";

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
    const minRaw = (request.nextUrl.searchParams.get("min_price") || "").replace(/[^0-9]/g, "");
    const maxRaw = (request.nextUrl.searchParams.get("max_price") || "").replace(/[^0-9]/g, "");
    const minPrice = minRaw ? Number(minRaw) : null;
    const maxPrice = maxRaw ? Number(maxRaw) : null;
    const rows = await sql`
      SELECT id, title, description, price_toman, city, category, image_urls, created_at, is_featured
      FROM listings
      WHERE status = 'published'
        AND (${q} = '' OR title ILIKE ${'%' + q + '%'} OR description ILIKE ${'%' + q + '%'})
        AND (${city} = '' OR city = ${city})
        AND (${category} = '' OR category = ${category})
        AND (${minPrice}::bigint IS NULL OR price_toman >= ${minPrice})
        AND (${maxPrice}::bigint IS NULL OR price_toman <= ${maxPrice})
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
  const uploadedUrls: string[] = [];
  try {
    const form = await request.formData();
    const title = String(form.get("title") || "").trim().slice(0, 100);
    const description = String(form.get("description") || "").trim().slice(0, 4000);
    const city = String(form.get("city") || "").trim().slice(0, 80);
    const category = String(form.get("category") || "").trim().slice(0, 80);
    const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
    const rawPhone = toEnglishDigits(String(form.get("contact_phone") || "")).replace(/[\s()-]/g, "");
    const contactPhone = rawPhone.startsWith("+98") ? "0" + rawPhone.slice(3) : rawPhone.startsWith("0098") ? "0" + rawPhone.slice(4) : rawPhone;
    const rawPrice = toEnglishDigits(String(form.get("price_toman") ?? "")).replace(/[٬,\s]/g, "");
    const price = rawPrice === "" ? 0 : Number(rawPrice);
    const files = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);

    if (title.length < 5 || description.length < 10 || city.length < 2 || category.length < 2) {
      return NextResponse.json({ error: "لطفاً عنوان، توضیحات، شهر و دسته‌بندی را کامل وارد کنید." }, { status: 400 });
    }
    if (!/^09\d{9}$/.test(contactPhone)) {
      return NextResponse.json({ error: "شماره تماس معتبر نیست؛ شماره موبایل ایران را مثل 09123456789 وارد کنید." }, { status: 400 });
    }
    if (!Number.isSafeInteger(price) || price < 0) {
      return NextResponse.json({ error: "قیمت واردشده معتبر نیست." }, { status: 400 });
    }
    if (files.length > 4) {
      return NextResponse.json({ error: "حداکثر ۴ عکس می‌توانید بارگذاری کنید." }, { status: 400 });
    }
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return NextResponse.json({ error: "فرمت عکس باید JPG، PNG یا WEBP باشد." }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "حجم هر عکس نباید بیشتر از ۵ مگابایت باشد." }, { status: 400 });
      }
    }

    for (const file of files) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const blob = await put("listings/" + randomUUID() + "." + ext, file, {
        access: "public", addRandomSuffix: true, contentType: file.type,
      });
      uploadedUrls.push(blob.url);
    }

    const sql = db();
    const userId = getUserIdFromRequest(request);
    const rows = await sql`
      INSERT INTO listings (user_id, title, description, price_toman, city, category, contact_phone, status, image_urls)
      VALUES (${userId}, ${title}, ${description}, ${price}, ${city}, ${category}, ${contactPhone}, 'pending', ${uploadedUrls}::text[])
      RETURNING id, title, status, created_at, image_urls
    `;
    return NextResponse.json({ success: true, listing: rows[0], message: "آگهی شما ثبت شد و پس از بررسی منتشر می‌شود." }, { status: 201 });
  } catch (error) {
    console.error("CREATE_LISTING_ERROR", error);
    const missing = error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED";
    return NextResponse.json({ error: missing ? "پایگاه داده هنوز متصل نشده است." : "ثبت آگهی یا بارگذاری عکس انجام نشد. دوباره تلاش کنید." }, { status: missing ? 503 : 500 });
  }
}
