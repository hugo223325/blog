import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogSlugs } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import BlogContent from "@/components/blog/BlogContent";
import Link from "next/link";

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 font-sans text-sm text-sage dark:text-[#8ab88e] hover:underline mb-6"
      >
        ← 返回博客列表
      </Link>
      <article>
        <header className="mb-8">
          <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5]">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 font-sans text-sm text-ink-muted dark:text-[#7a7265]">
            <time>{formatDate(post.date)}</time>
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-page-sand dark:text-[#2d2922]">·</span>
                <span>{post.tags.join(", ")}</span>
              </div>
            )}
          </div>
        </header>
        <BlogContent html={html} />
      </article>
    </div>
  );
}
