import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserIdFromRequest } from "@/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: { id: string } };

function getId(value: string) {
  const id = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای مدیریت آگهی ابتدا وارد حساب شوید." }, { status: 401 });
  const id = getId(params.id);
  if (!id) return NextResponse.json({ error: "شناسه آگهی معتبر نیست." }, { status: 400 });

  try {
    const body = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    if (body.action === "sold") {
      const rows = await sql`
        UPDATE listings SET status = 'sold'
        WHERE id = ${id} AND user_id = ${userId} AND status = 'published'
        RETURNING id, status
      `;
      if (!rows.length) return NextResponse.json({ error: "آگهی منتشرشده متعلق به شما پیدا نشد." }, { status: 404 });
      return NextResponse.json({ success: true, listing: rows[0] });
    }

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const city = String(body.city || "").trim();
    const category = String(body.category || "").trim();
    const phoneInput = String(body.contact_phone || "").replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
    const rawPhone = phoneInput.replace(/[\s()-]/g, "");
    const contactPhone = rawPhone.startsWith("+98") ? "0" + rawPhone.slice(3) : rawPhone.startsWith("0098") ? "0" + rawPhone.slice(4) : rawPhone;
    const priceRaw = String(body.price_toman ?? "").replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[٬,\s]/g, "");
    const price = priceRaw === "" ? 0 : Number(priceRaw);

    if (title.length < 5 || title.length > 100 || description.length < 10 || description.length > 4000 ||
        city.length < 2 || city.length > 80 || category.length < 2 || category.length > 80 ||
        !/^09\d{9}$/.test(contactPhone) || !Number.isSafeInteger(price) || price < 0) {
      return NextResponse.json({ error: "اطلاعات معتبر نیست؛ عنوان، توضیحات، شهر، دسته‌بندی، قیمت و شماره تماس را بررسی کنید." }, { status: 400 });
    }

    const rows = await sql`
      UPDATE listings
      SET title = ${title}, description = ${description}, city = ${city},
          category = ${category}, price_toman = ${price}, contact_phone = ${contactPhone},
          status = 'pending', is_featured = FALSE
      WHERE id = ${id} AND user_id = ${userId} AND status IN ('pending', 'published')
      RETURNING id, title, status, created_at, image_urls
    `;
    if (!rows.length) return NextResponse.json({ error: "آگهی قابل ویرایش متعلق به شما پیدا نشد." }, { status: 404 });
    return NextResponse.json({ success: true, listing: rows[0], message: "تغییرات ثبت شد و آگهی برای بررسی دوباره به مدیر ارسال شد." });
  } catch (error) {
    console.error("USER_LISTING_PATCH_ERROR", error);
    return NextResponse.json({ error: "ذخیره تغییرات انجام نشد." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "برای حذف آگهی ابتدا وارد حساب شوید." }, { status: 401 });
  const id = getId(params.id);
  if (!id) return NextResponse.json({ error: "شناسه آگهی معتبر نیست." }, { status: 400 });
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      DELETE FROM listings WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;
    if (!rows.length) return NextResponse.json({ error: "آگهی متعلق به شما پیدا نشد." }, { status: 404 });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("USER_LISTING_DELETE_ERROR", error);
    return NextResponse.json({ error: "حذف آگهی انجام نشد." }, { status: 500 });
  }
}
