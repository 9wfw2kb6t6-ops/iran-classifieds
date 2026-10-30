import Link from "next/link";
export default function Header() {
  return <header className="sticky top-0 z-30 border-b border-[#eee6dd] bg-[#fffaf4]/95 backdrop-blur"><div className="container flex h-[70px] items-center justify-between gap-3">
    <Link href="/" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#f47735] text-2xl font-black text-white shadow-sm">۳</span><span><b className="block text-xl leading-5 text-[#18343c]">سه‌سوته</b><small className="text-xs text-muted">هرچی می‌خوای، سه‌سوته!</small></span></Link>
    <nav className="hidden items-center gap-7 text-sm font-semibold text-[#526268] md:flex"><Link href="/">صفحه اصلی</Link><a href="/#categories">دسته‌بندی‌ها</a><a href="/#latest">آگهی‌های جدید</a><a href="/#about">درباره سه‌سوته</a></nav>
    <div className="flex items-center gap-2"><Link href="/account" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#34505a] sm:block">ورود | ثبت‌نام</Link><Link href="/post-ad" className="btn btn-primary text-sm">＋ ثبت آگهی</Link></div>
  </div></header>;
}