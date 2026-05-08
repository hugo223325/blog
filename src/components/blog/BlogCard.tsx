import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { formatDate } from "@/lib/utils";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="rounded-lg bg-page-warm dark:bg-[#221f1a] px-6 py-5 hover:bg-page-sand dark:hover:bg-[#2d2922] transition-colors duration-200">
        <h2 className="font-sans text-xl font-semibold text-ink-primary dark:text-[#e8e0d5] group-hover:text-sage dark:group-hover:text-[#8ab88e] transition-colors duration-200">
          {post.title}
        </h2>
        <time className="block mt-1 font-sans text-sm text-ink-muted dark:text-[#7a7265]">
          {formatDate(post.date)}
        </time>
        {post.excerpt && (
          <p className="mt-3 font-serif text-ink-secondary dark:text-[#b8a898] line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-0.5 font-sans text-xs rounded-full bg-sage-soft dark:bg-[#1e2a20] text-sage dark:text-[#8ab88e]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}
