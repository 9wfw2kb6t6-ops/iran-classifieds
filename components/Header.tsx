import Link from "next/link";

export default function Header() {
  return <header className="sticky top-0 z-40 border-b border-[#eee6dd] bg-[#fffaf4]/95 backdrop-blur">
    <div className="container flex min-h-[70px] items-center justify-between gap-3">
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#f47735] text-2xl font-black text-white shadow-sm">۳</span>
        <span><b className="block text-xl leading-5 text-[#18343c]">سه‌سوته</b><small className="text-xs text-muted">هرچی می‌خوای، سه‌سوته!</small></span>
      </Link>
      <nav className="hidden items-center gap-5 text-sm font-semibold text-[#526268] md:flex">
        <Link href="/">صفحه اصلی</Link>
        <a href="/#categories">دسته‌بندی‌ها</a>
        <a href="/#latest">آگهی‌های جدید</a>
        <a href="/#about">درباره سه‌سوته</a>
        <Link href="/store-builder" className="rounded-xl bg-[#fff0e6] px-3 py-2 font-black text-[#d85f24] transition hover:bg-[#ffe2cf]">فروشگاه‌ساز</Link>
        <Link href="/terms">قوانین</Link>
        <Link href="/privacy">حریم خصوصی</Link>
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/account" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#34505a] sm:block">ورود | ثبت‌نام</Link>
        <Link href="/post-ad" className="btn btn-primary text-sm">＋ ثبت آگهی</Link>
      </div>
    </div>
    <nav className="flex items-center gap-2 overflow-x-auto border-t border-[#eee6dd] px-4 py-2 text-xs font-bold text-[#526268] md:hidden">
      <Link href="/store-builder" className="shrink-0 rounded-lg bg-[#fff0e6] px-3 py-2 text-[#d85f24]">فروشگاه‌ساز</Link>
      <Link href="/terms" className="shrink-0 px-2 py-2">قوانین</Link>
      <Link href="/privacy" className="shrink-0 px-2 py-2">حریم خصوصی</Link>
      <Link href="/help" className="shrink-0 px-2 py-2">راهنما</Link>
    </nav>
  </header>;
}
