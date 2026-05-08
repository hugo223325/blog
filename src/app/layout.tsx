import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import Providers from "@/components/ui/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "我的博客",
    template: "%s | 我的博客",
  },
  description: "个人博客——记录生活、日记、待办、日程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-page-cream dark:bg-[#1a1814] text-ink-primary dark:text-[#e8e0d5]">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
