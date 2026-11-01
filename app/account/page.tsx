"use client";
import { useCallback,useEffect,useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
type Listing={id:number;title:string;city:string;category:string;price_toman:number|string;status:string;created_at:string};
type User={id:number;phone:string;display_name:string|null};
const money=(v:number|string)=>Number(v)>0?new Intl.NumberFormat("fa-IR").format(Number(v))+" تومان":"توافقی";
const labels:Record<string,string>={pending:"در انتظار بررسی",published:"منتشرشده",rejected:"ردشده",sold:"فروخته‌شده",expired:"منقضی‌شده"};
export default function Account(){
 const [mode,setMode]=useState<"login"|"register">("login"),[phone,setPhone]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState("");
 const [user,setUser]=useState<User|null>(null),[listings,setListings]=useState<Listing[]>([]);
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const load=useCallback(async()=>{try{const r=await fetch("/api/account/me",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"دریافت حساب ناموفق بود.");setUser(d.user||null);setListings(d.listings||[]);}catch(e){setMessage(e instanceof Error?e.message:"ارتباط با سرور برقرار نشد.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/account/"+(mode==="login"?"login":"register"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,password,display_name:name})});const d=await r.json();if(!r.ok)throw Error(d.error||"ورود انجام نشد.");setMessage(mode==="login"?"با موفقیت وارد شدی.":"حساب سه‌سوته ساخته شد.");setPassword("");await load();}catch(e){setMessage(e instanceof Error?e.message:"عملیات انجام نشد.");}finally{setBusy(false);}}
 async function signOut(){setBusy(true);try{await fetch("/api/account/logout",{method:"POST"});setUser(null);setListings([]);setMessage("از حساب خارج شدی.");}finally{setBusy(false);}}
 async function listingAction(id:number,action:"sold"|"delete"){if(!confirm(action==="sold"?"وضعیت آگهی به فروخته‌شده تغییر کند؟":"آگهی حذف شود؟"))return;setBusy(true);try{const r=await fetch("/api/account/listings/"+id,{method:action==="delete"?"DELETE":"PATCH",headers:{"Content-Type":"application/json"},...(action==="sold"?{body:JSON.stringify({action:"sold"})}:{})});const d=await r.json();if(!r.ok)throw Error(d.error||"عملیات انجام نشد.");await load();}catch(e){setMessage(e instanceof Error?e.message:"عملیات انجام نشد.");}finally{setBusy(false);}}
 return <><Header/><main dir="rtl" className="container max-w-4xl py-8 md:py-12">
 <div className="mb-6"><span className="text-sm font-bold text-brand">خوش اومدی به سه‌سوته!</span><h1 className="mt-2 text-2xl font-black text-[#18343c]">حساب کاربری</h1><p className="mt-2 text-sm leading-7 text-muted">حساب، آگهی‌ها و درخواست‌هایت در سایت و اپلیکیشن مشترک هستند.</p></div>
 {message&&<p role="status" className="mb-4 rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm leading-7 text-[#18343c]">{message}</p>}
 {loading?<div className="card p-10 text-center text-muted">در حال بررسی حساب کاربری...</div>:!user?
 <div className="mx-auto max-w-lg card p-6 md:p-8">
 <div className="mb-5 grid grid-cols-2 gap-2"><button onClick={()=>setMode("login")} className={"rounded-xl px-4 py-3 text-sm font-black "+(mode==="login"?"bg-brand text-white":"bg-gray-100 text-gray-600")}>ورود</button><button onClick={()=>setMode("register")} className={"rounded-xl px-4 py-3 text-sm font-black "+(mode==="register"?"bg-brand text-white":"bg-gray-100 text-gray-600")}>ثبت‌نام</button></div>
 <h2 className="text-xl font-black">{mode==="login"?"ورود به حساب کاربری":"ساخت حساب سه‌سوته"}</h2>
 <p className="mt-2 text-sm leading-7 text-muted">با شماره موبایل و رمز عبور وارد شو. همین حساب در اپلیکیشن هم قابل استفاده است.</p>
 <form onSubmit={submit} className="mt-5 space-y-4">
 {mode==="register"&&<label className="block text-sm font-bold">نام نمایشی<input value={name} onChange={e=>setName(e.target.value)} maxLength={80} className="field mt-2" placeholder="نام شما"/></label>}
 <label className="block text-sm font-bold">شماره موبایل<input value={phone} onChange={e=>setPhone(e.target.value)} required dir="ltr" inputMode="tel" className="field mt-2 text-left" placeholder="09123456789"/></label>
 <label className="block text-sm font-bold">رمز عبور<input value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==="register"?8:1} maxLength={128} type="password" className="field mt-2" placeholder={mode==="register"?"حداقل ۸ کاراکتر":"رمز عبور"}/></label>
 <button disabled={busy} className="btn btn-primary w-full disabled:opacity-50">{busy?"در حال انجام...":mode==="login"?"ورود به حساب":"ساخت حساب کاربری"}</button>
 </form><p className="mt-4 text-xs leading-6 text-muted">پیامک تأیید شماره هنوز به سرویس OTP متصل نشده است؛ شماره موبایل را با دقت وارد کن.</p>
 </div>:
 <>
 <section className="card flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="text-lg font-black">{user.display_name||"کاربر سه‌سوته"}</h2><p className="mt-1 text-sm text-muted" dir="ltr">{user.phone}</p></div><button disabled={busy} onClick={signOut} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600">خروج از حساب</button></section>
 <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><Link href="/account/wallet" className="card p-4 text-center text-sm font-black hover:border-orange-200">کیف پول</Link><Link href="/account/promotions" className="card p-4 text-center text-sm font-black hover:border-orange-200">ویژه‌سازی آگهی</Link><Link href="/store-builder" className="card p-4 text-center text-sm font-black hover:border-orange-200 col-span-2 sm:col-span-1">فروشگاه‌ساز</Link></div>
 <div className="mt-7 flex items-center justify-between"><h2 className="text-xl font-black">آگهی‌های من</h2><Link href="/post-ad" className="btn btn-primary text-sm">＋ ثبت آگهی</Link></div>
 {listings.length?<div className="mt-4 space-y-3">{listings.map(x=><article key={x.id} className="card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-black">{x.title}</h3><p className="mt-1 text-xs text-muted">{x.city} · {x.category}</p></div><div className="text-left"><b className="text-sm text-brand">{money(x.price_toman)}</b><p className="mt-1 text-xs text-muted">{labels[x.status]||x.status}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Link href={"/ads/"+x.id} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">مشاهده آگهی</Link>{x.status==="published"&&<button disabled={busy} onClick={()=>listingAction(x.id,"sold")} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold">فروخته شد</button>}<button disabled={busy} onClick={()=>listingAction(x.id,"delete")} className="rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-700">حذف آگهی</button></div></article>)}</div>:<div className="card mt-4 p-10 text-center text-sm text-muted">هنوز آگهی‌ای ثبت نکرده‌ای.</div>}
 </>}
 </main></>;
}