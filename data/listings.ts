export type Listing = { id: number; title: string; price: string; city: string; category: string; image: string; time: string; featured?: boolean; bumped?: boolean; description: string; };
export const listings: Listing[] = [
  { id: 1, title: "آیفون ۱۳ پرو مکس ۲۵۶ گیگ", price: "۳۸٬۵۰۰٬۰۰۰ تومان", city: "تهران، پونک", category: "موبایل و تبلت", image: "https://images.unsplash.com/photo-1632633173522-6d6e3f7f0f8c?auto=format&fit=crop&w=900&q=80", time: "۱۰ دقیقه پیش", featured: true, description: "گوشی تمیز و سالم، بدون خط و خش جدی، همراه جعبه." },
  { id: 2, title: "آپارتمان ۸۵ متری، دو خواب", price: "۶٬۸۰۰٬۰۰۰٬۰۰۰ تومان", city: "کرج، عظیمیه", category: "املاک", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80", time: "۲۵ دقیقه پیش", description: "نورگیر، دارای پارکینگ و آسانسور." },
  { id: 3, title: "پژو ۲۰۶ تیپ ۵ مدل ۱۳۹۸", price: "۵۲۰٬۰۰۰٬۰۰۰ تومان", city: "اصفهان، مرداویج", category: "خودرو", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80", time: "۱ ساعت پیش", featured: true, description: "بدنه سالم، سرویس‌ها به‌موقع انجام شده است." },
  { id: 4, title: "میز کار مینیمال چوبی", price: "۴٬۲۰۰٬۰۰۰ تومان", city: "شیراز، معالی‌آباد", category: "خانه و آشپزخانه", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80", time: "۲ ساعت پیش", description: "مناسب اتاق کار و مطالعه، بسیار تمیز." },
  { id: 5, title: "لپ‌تاپ لنوو ThinkPad", price: "۲۷٬۰۰۰٬۰۰۰ تومان", city: "تبریز، ولیعصر", category: "موبایل و دیجیتال", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80", time: "۳ ساعت پیش", description: "مناسب کارهای اداری و برنامه‌نویسی." },
  { id: 6, title: "مبل راحتی هفت نفره", price: "۲۲٬۰۰۰٬۰۰۰ تومان", city: "رشت، گلسار", category: "خانه و آشپزخانه", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80", time: "۴ ساعت پیش", description: "پارچه سالم و بدون پارگی، فروش به علت تغییر دکور." }
];
export const categories = [
  { name: "املاک", icon: "🏡", count: "۱۲٬۴۰۰ آگهی" }, { name: "خودرو", icon: "🚘", count: "۸٬۲۰۰ آگهی" },
  { name: "موبایل و دیجیتال", icon: "📱", count: "۱۵٬۶۰۰ آگهی" }, { name: "خانه و آشپزخانه", icon: "🛋️", count: "۹٬۱۰۰ آگهی" },
  { name: "استخدام و کاریابی", icon: "💼", count: "۳٬۳۰۰ آگهی" }, { name: "خدمات", icon: "🛠️", count: "۵٬۷۰۰ آگهی" },
  { name: "وسایل شخصی", icon: "👕", count: "۶٬۴۰۰ آگهی" }, { name: "ورزش و سرگرمی", icon: "🏋️", count: "۲٬۱۰۰ آگهی" }
];