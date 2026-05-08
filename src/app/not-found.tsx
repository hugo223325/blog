import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <svg className="mx-auto mb-6" width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        {/* Open book */}
        <path d="M18 22h14M18 28h10" stroke="#9b9284" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M12 14h30a4 4 0 014 4v28a4 4 0 01-4 4H22a10 10 0 01-10-10V18a4 4 0 014-4z" stroke="#9b9284" strokeWidth="1.5" opacity="0.5" />
        <path d="M12 36c0 5.523 4.477 10 10 10h20" stroke="#9b9284" strokeWidth="1.5" opacity="0.3" />
        {/* Small sprout */}
        <path d="M44 40v10M41 44h6" stroke="#7a9a7e" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M44 36c1.5-1.5 3.5-3 5.5-1.5" stroke="#7a9a7e" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </svg>

      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-3">
        这一页还是空白
      </h1>
      <p className="font-serif text-ink-muted dark:text-[#7a7265] mb-8 leading-relaxed">
        像一本旧书里还没写过的那一页。等待某一天被填满。
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 font-sans text-sm rounded-md bg-ink-primary dark:bg-[#e8e0d5] text-page-cream dark:text-[#1a1814] hover:bg-ink-secondary dark:hover:bg-[#b8a898] transition-colors duration-200"
        >
          回到首页
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center px-5 py-2.5 font-sans text-sm rounded-md bg-page-warm dark:bg-[#221f1a] text-ink-secondary dark:text-[#b8a898] hover:bg-page-sand dark:hover:bg-[#2d2922] transition-colors duration-200"
        >
          翻阅博客
        </Link>
      </div>
    </div>
  );
}
