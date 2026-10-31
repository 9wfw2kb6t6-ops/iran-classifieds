"use client";

import Header from "@/components/Header";
import { ChevronDown, ShieldCheck, MessageCircle, FileText, Search } from "lucide-react";
import { useState } from "react";

const groups = [
  { title: "ثبت و مدیریت آگهی", icon: FileText, items: [
    ["چطور آگهی ثبت کنم؟", "از بالای سایت گزینه «ثبت آگهی» را انتخاب کن، عنوان، دسته‌بندی، شهر، قیمت، توضیحات و شماره تماس را وارد کن و در صورت تمایل تا ۴ عکس اضافه کن. آگهی پس از بررسی مدیر منتشر می‌شود."],
    ["چرا آگهی من بلافاصله نمایش داده نمی‌شود؟", "همه آگهی‌ها ابتدا در صف بررسی قرار می‌گیرند. پس از تأیید مدیر، در فهرست عمومی سایت نمایش داده می‌شوند."],
    ["ثبت آگهی هزینه دارد؟", "ثبت آگهی معمولی در سه‌سوته رایگان است. امکانات ویژه ممکن است در آینده با هزینه جداگانه ارائه شوند."],
    ["چطور آگهی را فروخته‌شده یا حذف کنم؟", "در حال حاضر این عملیات از طریق پشتیبانی و پنل مدیریت انجام می‌شود. امکان مدیریت مستقیم آگهی توسط صاحب آن پس از فعال‌شدن حساب کاربری اضافه خواهد شد."]
  ]},
  { title: "خرید و امنیت معامله", icon: ShieldCheck, items: [
    ["آیا سه‌سوته پول معامله را دریافت می‌کند؟", "خیر. سه‌سوته بستر معرفی آگهی و ارتباط مستقیم خریدار و فروشنده است و در حال حاضر واسطه پرداخت یا تضمین‌کننده معامله نیست."],
    ["قبل از پرداخت چه نکاتی را رعایت کنم؟", "کالا یا ملک را حضوری بررسی کن، مدارک و هویت طرف معامله را بسنج، رسید و قرارداد معتبر بگیر و از واریز بیعانه پیش از اطمینان خودداری کن."],
    ["اگر آگهی مشکوک بود چه کنم؟", "از پرداخت وجه و ارسال اطلاعات شخصی خودداری کن و جزئیات آگهی را برای بررسی به پشتیبانی اطلاع بده."]
  ]},
  { title: "جست‌وجو و ارتباط", icon: Search, items: [
    ["چطور آگهی موردنظرم را پیدا کنم؟", "از کادر جست‌وجو و فیلتر شهر، دسته‌بندی و محدوده قیمت در صفحه اصلی استفاده کن."],
    ["چطور با آگهی‌دهنده تماس بگیرم؟", "وارد صفحه جزئیات آگهی شو. اگر شماره تماس ثبت شده باشد، دکمه تماس و در صورت امکان ارتباط واتساپ نمایش داده می‌شود."]
  ]}
];

export default function HelpPage() {
  const [opened, setOpened] = useState<string | null>(groups[0].items[0][0]);
  return <><Header/><main dir="rtl" className="container max-w-4xl py-9 md:py-14">
    <div className="rounded-3xl bg-[#18343c] p-6 text-white md:p-10">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs"><MessageCircle size={14}/> مرکز راهنمای سه‌سوته</span>
      <h1 className="mt-4 text-2xl font-black md:text-4xl">چطور می‌تونیم کمکت کنیم؟</h1>
      <p className="mt-3 max-w-2xl text-sm leading-8 text-white/75">پاسخ پرسش‌های رایج درباره ثبت آگهی، خریدوفروش و امنیت معاملات را اینجا پیدا کن.</p>
    </div>
    <div className="mt-8 space-y-8">
      {groups.map(group => <section key={group.title}>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black"><group.icon className="text-brand" size={21}/>{group.title}</h2>
        <div className="overflow-hidden rounded-2xl border border-[#eee6dd] bg-white">
          {group.items.map(([question, answer]) => <div key={question} className="border-b border-[#f1ece6] last:border-0">
            <button className="flex w-full items-center justify-between gap-4 px-4 py-4 text-right text-sm font-bold hover:bg-orange-50/50 md:px-5" aria-expanded={opened === question} onClick={() => setOpened(opened === question ? null : question)}>
              <span>{question}</span><ChevronDown size={18} className={`shrink-0 text-brand transition-transform ${opened === question ? "rotate-180" : ""}`}/>
            </button>
            {opened === question && <p className="px-4 pb-5 text-sm leading-8 text-gray-600 md:px-5">{answer}</p>}
          </div>)}
        </div>
      </section>)}
    </div>
    <div className="mt-9 rounded-2xl border border-orange-100 bg-orange-50 p-5">
      <h2 className="font-black">پاسخت را پیدا نکردی؟</h2>
      <p className="mt-2 text-sm leading-7 text-gray-600">برای پیگیری مشکل، کد آگهی و شرح موضوع را آماده کن و از راه ارتباطی رسمی پشتیبانی که در سایت اعلام می‌شود استفاده کن.</p>
    </div>
  </main><footer className="mt-8 border-t border-[#eee6dd] bg-white py-6 text-center text-xs text-muted">© سه‌سوته — هرچی می‌خوای، سه‌سوته!</footer></>;
}
