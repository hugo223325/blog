import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost, BlogFrontmatter } from "@/types/blog";
import { DiaryEntry, DiaryFrontmatter } from "@/types/diary";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const DIARY_DIR = path.join(process.cwd(), "content", "diary");

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  return {
    slug,
    title: fm.title || slug,
    date: fm.date || "",
    tags: fm.tags || [],
    excerpt: fm.excerpt || "",
    content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  return getBlogSlugs()
    .map(getBlogPost)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

export function getDiaryDates(): string[] {
  const dates: string[] = [];
  if (!fs.existsSync(DIARY_DIR)) return dates;
  const years = fs.readdirSync(DIARY_DIR);
  for (const year of years) {
    const yearDir = path.join(DIARY_DIR, year);
    if (!fs.statSync(yearDir).isDirectory()) continue;
    const files = fs.readdirSync(yearDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      dates.push(`${year}/${file.replace(/\.md$/, "")}`);
    }
  }
  return dates.sort().reverse();
}

export function getDiaryEntry(datePath: string): DiaryEntry | null {
  const filePath = path.join(DIARY_DIR, `${datePath}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fm = data as DiaryFrontmatter;
  const date = datePath.replace("/", "-");
  return {
    date: fm.date || date,
    mood: fm.mood,
    tags: fm.tags || [],
    content,
  };
}

export function getDiaryEntriesByMonth(year: string, month: string): DiaryEntry[] {
  const dir = path.join(DIARY_DIR, year);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(month) && f.endsWith(".md"))
    .map((f) => getDiaryEntry(`${year}/${f.replace(/\.md$/, "")}`))
    .filter((e): e is DiaryEntry => e !== null)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}
