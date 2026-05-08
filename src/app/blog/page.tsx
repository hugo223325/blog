import { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/content";
import BlogCard from "@/components/blog/BlogCard";

export const metadata: Metadata = {
  title: "博客",
  description: "我的博客文章",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-sans text-display text-ink-primary dark:text-[#e8e0d5] mb-8">
        博客
      </h1>
      {posts.length === 0 ? (
        <div className="rounded-lg bg-page-warm dark:bg-[#221f1a] px-6 py-12 text-center">
          <p className="text-ink-muted dark:text-[#7a7265]">
            这里还没有文章。种下第一颗种子吧。
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
