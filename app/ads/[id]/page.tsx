import Header from "@/components/Header";
import { listings } from "@/data/listings";
import { MapPin, Clock, Phone, Heart, Share2 } from "lucide-react";
export default function AdDetail({ params }: { params: { id: string } }) {
  const item = listings.find(x => x.id === Number(params.id));
  if (!item) return <><Header/><main className="container py-20 text-center">آگهی پیدا نشد.</main></>;
  return <><Header/><main className="container py-7"><div className="grid gap-5 lg:grid-cols-[1fr_340px]">
    <section className="card overflow-hidden"><img src={item.image} alt={item.title} className="max-h-[480px] w-full bg-gray-100 object-cover"/><div className="p-5"><span className="text-xs text-brand">{item.category}</span><h1 className="mt-2 text-2xl font-black">{item.title}</h1><div className="mt-3 flex gap-4 text-xs text-muted"><span className="flex items-center gap-1"><MapPin size={14}/>{item.city}</span><span className="flex items-center gap-1"><Clock size={14}/>{item.time}</span></div><hr className="my-5"/><h2 className="font-bold">توضیحات آگهی</h2><p className="mt-3 text-sm leading-8 text-gray-600">{item.description}</p><div className="mt-6 flex gap-2"><button className="btn btn-light"><Heart size={17}/> ذخیره</button><button className="btn btn-light"><Share2 size={17}/> اشتراک‌گذاری</button></div></div></section>
    <aside className="card h-fit p-5"><p className="text-xs text-muted">قیمت</p><div className="mt-2 text-2xl font-black">{item.price}</div><div className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">برای امنیت معامله، پیش از مشاهده کالا یا احراز هویت فروشنده، وجهی واریز نکنید.</div><button className="btn btn-primary mt-4 w-full"><Phone size={17}/> نمایش شماره تماس</button><p className="mt-3 text-center text-[11px] text-muted">نمایش شماره در نسخه آزمایشی فعال نیست.</p></aside>
  </div></main></>;
}