export default function Footer() {
  return (
    <footer className="border-t border-page-sand dark:border-[#2d2922] py-6 sm:pb-6 pb-20">
      <div className="max-w-4xl mx-auto px-4 text-center text-xs font-sans text-ink-muted dark:text-[#7a7265]">
        <p>个人博客 &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Powered by Next.js · Deployed on Vercel</p>
      </div>
    </footer>
  );
}
